import { TextEncoder } from "node:util";

import { z } from "zod";

import { streamWithFallback } from "@/lib/gemini";
import { parseReportMarkdown } from "@/lib/markdown-parser";
import { loadPromptInputs } from "@/lib/prompt-loader";
import { createSupabaseAdminClient } from "@/lib/supabase";

export const runtime = "nodejs";

const requestSchema = z.object({
  jobDescription: z.string().min(1),
  sourceUrl: z.string().url().optional(),
  company: z.string().optional(),
  role: z.string().optional(),
});

type SectionState = {
  key: string;
  title: string;
  content: string;
};

const encoder = new TextEncoder();
const headingPattern = /^##\s+([A-F])\)\s+(.+)$/gm;

function sseChunk(event: string, data: unknown) {
  return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

function detectCompletedSections(markdown: string, emittedSections: Set<string>) {
  const matches = [...markdown.matchAll(headingPattern)];
  const sections: SectionState[] = [];

  for (let index = 0; index < matches.length; index += 1) {
    const match = matches[index];
    const next = matches[index + 1];

    if (!next) continue;

    const start = (match.index ?? 0) + match[0].length;
    const end = next.index ?? markdown.length;
    const key = match[1];

    if (emittedSections.has(key)) continue;

    sections.push({
      key,
      title: match[2].trim(),
      content: markdown.slice(start, end).trim(),
    });
  }

  return sections;
}

function buildEvaluationPrompt(input: {
  combinedPromptSections: string;
  jobDescription: string;
  sourceUrl?: string;
}) {
  return [
    input.combinedPromptSections,
    "# Candidate Request",
    input.sourceUrl ? `Source URL: ${input.sourceUrl}` : null,
    "Job Description:",
    input.jobDescription,
    "",
    "Return the evaluation as markdown with these exact top-level sections:",
    "## A) Role Summary",
    "## B) CV Match",
    "## C) Level and Strategy",
    "## D) Comp and Demand",
    "## E) Personalization Plan",
    "## F) Interview Plan",
    "",
    "In section B) CV Match, include a line in the format: **Score: X.X/5** where X.X is your numeric assessment.",
    "In section A) Role Summary, include a line in the format: **Archetype: <archetype>** identifying the role archetype.",
    "",
    "Respond entirely in Traditional Chinese (繁體中文，台灣用語)。所有內容包括分析、建議、說明皆須使用繁體中文。",
    "Preserve markdown headings exactly so the frontend can parse the sections while streaming.",
  ]
    .filter(Boolean)
    .join("\n");
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

async function saveToDatabase(opts: {
  fullText: string;
  company: string;
  role: string;
  sourceUrl?: string;
}) {
  const db = createSupabaseAdminClient();
  const parsed = parseReportMarkdown(opts.fullText);
  const today = new Date().toISOString().slice(0, 10);

  const { data: maxReport } = await db
    .from("reports")
    .select("seq_num")
    .order("seq_num", { ascending: false })
    .limit(1)
    .maybeSingle();

  const reportSeqNum = (maxReport?.seq_num ?? 0) + 1;
  const slug = `${String(reportSeqNum).padStart(3, "0")}-${slugify(opts.company)}-${today}`;

  const { data: reportRow, error: reportError } = await db
    .from("reports")
    .insert({
      seq_num: reportSeqNum,
      company: opts.company,
      role: opts.role,
      report_date: today,
      slug,
      raw_markdown: opts.fullText,
      blocks: parsed.blocks as never,
      score: parsed.metadata.score,
      archetype: parsed.metadata.archetype,
      source_url: opts.sourceUrl ?? null,
    })
    .select("id")
    .single();

  if (reportError) {
    throw new Error(`Failed to save report: ${reportError.message}`);
  }

  const { data: maxApp } = await db
    .from("applications")
    .select("seq_num")
    .order("seq_num", { ascending: false })
    .limit(1)
    .maybeSingle();

  const appSeqNum = (maxApp?.seq_num ?? 0) + 1;

  await db.from("applications").insert({
    seq_num: appSeqNum,
    applied_at: today,
    company: opts.company,
    role: opts.role,
    score: parsed.metadata.score,
    status: "evaluated",
    report_id: reportRow.id,
    source_url: opts.sourceUrl ?? null,
    archetype: parsed.metadata.archetype,
  });

  return { reportId: reportRow.id, reportSlug: slug };
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: "Invalid request body", issues: parsed.error.flatten() }),
      { status: 400, headers: { "content-type": "application/json" } }
    );
  }

  const { jobDescription, sourceUrl, company, role } = parsed.data;
  const promptInputs = await loadPromptInputs();
  const prompt = buildEvaluationPrompt({
    combinedPromptSections: promptInputs.combinedPromptSections,
    jobDescription,
    sourceUrl,
  });

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const emittedSections = new Set<string>();
      let fullText = "";

      try {
        const { modelName, result } = await streamWithFallback(prompt, { maxOutputTokens: 8192 });

        controller.enqueue(
          sseChunk("start", {
            model: modelName,
            hasProfile: promptInputs.profile !== null,
          })
        );

        for await (const chunk of result.stream) {
          const textDelta = chunk.text();
          if (!textDelta) continue;

          fullText += textDelta;
          controller.enqueue(sseChunk("text_delta", { textDelta }));

          const completedSections = detectCompletedSections(fullText, emittedSections);
          for (const section of completedSections) {
            emittedSections.add(section.key);
            controller.enqueue(sseChunk("section_complete", section));
          }
        }

        // Emit last section (F) which has no following heading to trigger detection
        const trailingSections = [...fullText.matchAll(headingPattern)];
        const lastMatch = trailingSections.at(-1);
        if (lastMatch && !emittedSections.has(lastMatch[1])) {
          const start = (lastMatch.index ?? 0) + lastMatch[0].length;
          controller.enqueue(
            sseChunk("section_complete", {
              key: lastMatch[1],
              title: lastMatch[2].trim(),
              content: fullText.slice(start).trim(),
            })
          );
        }

        // Save to DB
        const resolvedCompany = company || "Unknown Company";
        const resolvedRole = role || "Unknown Role";
        let savedInfo: { reportId: string; reportSlug: string } | null = null;

        try {
          savedInfo = await saveToDatabase({
            fullText,
            company: resolvedCompany,
            role: resolvedRole,
            sourceUrl,
          });
        } catch (dbError) {
          const msg = dbError instanceof Error ? dbError.message : "DB save failed";
          controller.enqueue(sseChunk("warning", { message: msg }));
        }

        controller.enqueue(
          sseChunk("complete", {
            fullText,
            reportId: savedInfo?.reportId ?? null,
            reportSlug: savedInfo?.reportSlug ?? null,
          })
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown evaluation error";
        controller.enqueue(sseChunk("error", { message }));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Content-Type": "text/event-stream; charset=utf-8",
    },
  });
}
