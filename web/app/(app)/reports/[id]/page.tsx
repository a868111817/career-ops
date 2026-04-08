import { notFound } from "next/navigation";
import { ArrowUpRight, FileText } from "lucide-react";

import { ReportBlockCard } from "@/components/evaluation/report-block-card";
import { loadReportBySlug } from "@/lib/local-data";

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = await loadReportBySlug(id);

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
