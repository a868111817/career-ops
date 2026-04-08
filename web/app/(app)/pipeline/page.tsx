import { Clock3, ExternalLink, RefreshCcw } from "lucide-react";

import { EvalStreamPanel } from "@/components/evaluation/eval-stream-panel";
import { StatusBadge } from "@/components/tracker/status-badge";
import { pipelineItems } from "@/lib/mock-data";

export default function PipelinePage() {
  return (
    <div className="flex flex-1 flex-col p-5 sm:p-8">
      <div className="flex flex-col gap-4 rounded-[2rem] border border-slate-200 bg-white px-6 py-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Pipeline inbox
          </p>
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-slate-950">
            Capture URLs, monitor processing, and push good matches into the tracker.
          </h2>
        </div>
        <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          `Process All` and SSE stream wiring can attach to this surface next.
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[1.8rem] border border-slate-200 bg-[#f8f3e7] p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-slate-950 p-2 text-white">
              <RefreshCcw className="size-4" />
            </div>
            <div>
              <h3 className="font-heading text-2xl font-semibold text-slate-950">Processing model</h3>
              <p className="text-sm text-slate-600">Matches the plan: queue URLs, stream evaluation, persist result.</p>
            </div>
          </div>

          <ol className="mt-6 space-y-4 text-sm leading-7 text-slate-700">
            <li>1. Add a job URL or pasted JD to the queue.</li>
            <li>2. Backend workers load prompts from `modes/` and stream Claude output.</li>
            <li>3. Successful runs create a report and optionally an application row.</li>
            <li>4. Failures stay visible for retry instead of disappearing from the pipeline.</li>
          </ol>
        </section>

        <section className="rounded-[1.8rem] border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Queued items</p>
              <h3 className="mt-2 font-heading text-2xl font-semibold text-slate-950">Latest submissions</h3>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              <Clock3 className="size-3.5" />
              4 total
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {pipelineItems.map((item) => (
              <article key={item.id} className="rounded-[1.4rem] border border-slate-200 px-4 py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{item.company}</p>
                    <h4 className="mt-1 text-lg font-semibold text-slate-950">{item.role}</h4>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.note}</p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                <div className="mt-4 flex flex-col gap-2 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                  <span>{item.addedAt}</span>
                  <a
                    href={item.sourceUrl}
                    className="inline-flex items-center gap-2 font-medium text-slate-700 transition hover:text-slate-950"
                  >
                    Source URL
                    <ExternalLink className="size-4" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-6">
        <EvalStreamPanel />
      </div>
    </div>
  );
}
