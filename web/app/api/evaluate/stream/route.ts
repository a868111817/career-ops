import { TextEncoder } from "node:util";

import { z } from "zod";

import { DEFAULT_ANTHROPIC_MODEL, getAnthropicClient } from "@/lib/anthropic";
import { loadPromptInputs } from "@/lib/prompt-loader";

export const runtime = "nodejs";

const requestSchema = z.object({
  jobDescription: z.string().min(1),
  sourceUrl: z.string().url().optional(),
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

    if (!next) {
      continue;
    }

    const start = (match.index ?? 0) + match[0].length;
    const end = next.index ?? markdown.length;
    const key = match[1];

    if (emittedSections.has(key)) {
      continue;
    }

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
    "Preserve markdown headings exactly so the frontend can parse the sections while streaming.",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return new Response(
      JSON.stringify({
        error: "Invalid request body",
        issues: parsed.error.flatten(),
      }),
      {
        status: 400,
        headers: {
          "content-type": "application/json",
        },
      }
    );
  }

  const promptInputs = await loadPromptInputs();
  const prompt = buildEvaluationPrompt({
    combinedPromptSections: promptInputs.combinedPromptSections,
    jobDescription: parsed.data.jobDescription,
    sourceUrl: parsed.data.sourceUrl,
  });

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const emittedSections = new Set<string>();
      let fullText = "";

      controller.enqueue(
        sseChunk("start", {
          model: DEFAULT_ANTHROPIC_MODEL,
          hasProfile: promptInputs.profile !== null,
        })
      );

      try {
        const anthropic = getAnthropicClient();
        const messageStream = anthropic.messages.stream({
          model: DEFAULT_ANTHROPIC_MODEL,
          max_tokens: 4000,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        });

        messageStream.on("text", (textDelta) => {
          fullText += textDelta;
          controller.enqueue(sseChunk("text_delta", { textDelta }));

          const completedSections = detectCompletedSections(fullText, emittedSections);
          for (const section of completedSections) {
            emittedSections.add(section.key);
            controller.enqueue(sseChunk("section_complete", section));
          }
        });

        const finalMessage = await messageStream.finalMessage();
        const finalText = finalMessage.content
          .filter((block) => block.type === "text")
          .map((block) => block.text)
          .join("");

        if (finalText && finalText.length > fullText.length) {
          fullText = finalText;
        }

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

        controller.enqueue(
          sseChunk("complete", {
            fullText,
          })
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown evaluation error";
        controller.enqueue(
          sseChunk("error", {
            message,
          })
        );
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
