import { ArrowUpRight, FileText } from "lucide-react";
import { notFound } from "next/navigation";

import { ReportBlockCard } from "@/components/evaluation/report-block-card";
import { loadReportBySlug } from "@/lib/local-data";
import { parseReportMarkdown } from "@/lib/markdown-parser";
import { createSupabaseServerClient } from "@/lib/supabase";

type Block = { key: string; title: string; content: string };

type ReportView = {
  company: string;
  role: string;
  reportDate: string | null;
  score: number | null;
  archetype: string | null;
  sourceUrl: string | null;
  blocks: Block[];
};

async function loadReportFromDb(slug: string): Promise<ReportView | null> {
  try {
    const db = createSupabaseServerClient();
    const { data } = await db
      .from("reports")
      .select("company, role, report_date, score, archetype, source_url, raw_markdown, blocks")
      .eq("slug", slug)
      .maybeSingle();

    if (!data) return null;

    let blocks: Block[] = [];
    if (Array.isArray(data.blocks)) {
      blocks = data.blocks as Block[];
    } else if (data.raw_markdown) {
      blocks = parseReportMarkdown(data.raw_markdown).blocks;
    }

    return {
      company: data.company,
      role: data.role,
      reportDate: data.report_date,
      score: data.score,
      archetype: data.archetype,
      sourceUrl: data.source_url,
      blocks,
    };
  } catch {
    return null;
  }
}

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Try Supabase first (reports saved from web app)
  const dbReport = await loadReportFromDb(id);

  // Fall back to local markdown files (migrated reports)
  const localReport = dbReport ? null : await loadReportBySlug(id);

  const report: ReportView | null = dbReport ?? (localReport
    ? {
        company: localReport.company,
        role: localReport.role,
        reportDate: localReport.reportDate,
        score: localReport.score,
        archetype: localReport.archetype,
        sourceUrl: localReport.sourceUrl,
        blocks: localReport.blocks,
      }
    : null);

  if (!report) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col p-5 sm:p-8">
      <section className="rounded-[2rem] border border-slate-200 bg-white px-6 py-6 sm:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#f5efe1] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
              <FileText className="size-3.5" />
              Report detail
            </div>
            <div>
              <h2 className="font-heading text-3xl font-semibold tracking-tight text-slate-950">
                {report.company} · {report.role}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Generated on {report.reportDate ?? "unknown date"} with archetype{" "}
                <span className="font-medium text-slate-950">{report.archetype ?? "unknown"}</span>.
              </p>
            </div>
          </div>

          <div className="grid min-w-[240px] grid-cols-2 gap-3">
            <div className="rounded-[1.3rem] bg-slate-950 px-4 py-4 text-white">
              <div className="text-xs uppercase tracking-[0.16em] text-slate-300">Score</div>
              <div className="mt-2 text-3xl font-semibold">{(report.score ?? 0).toFixed(1)}</div>
            </div>
            {report.sourceUrl ? (
              <a
                href={report.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-[1.3rem] border border-slate-200 px-4 py-4 text-slate-800 transition hover:border-slate-950"
              >
                <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Source</div>
                <div className="mt-2 inline-flex items-center gap-2 text-sm font-semibold">
                  Job posting
                  <ArrowUpRight className="size-4" />
                </div>
              </a>
            ) : (
              <div className="rounded-[1.3rem] border border-slate-200 px-4 py-4 text-slate-500">
                <div className="text-xs uppercase tracking-[0.16em]">Source</div>
                <div className="mt-2 text-sm font-semibold">Unavailable</div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        {report.blocks.map((block) => (
          <ReportBlockCard key={block.key} block={block} />
        ))}
      </section>
    </div>
  );
}
