import Link from "next/link";
import { ArrowRight, Dot, Sparkles } from "lucide-react";

import { dashboardMetrics, pipelineItems } from "@/lib/mock-data";

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col p-5 sm:p-8">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 px-6 py-8 text-white sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
              <Sparkles className="size-3.5" />
              Dashboard
            </div>
            <div className="space-y-3">
              <h2 className="font-heading text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Keep applications, reports, and next actions in one operating view.
              </h2>
              <p className="max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                This dashboard is the web entry point for the same workflow currently living in markdown, scripts, and generated reports.
              </p>
            </div>
          </div>

          <div className="grid w-full max-w-xl grid-cols-2 gap-3">
            {dashboardMetrics.map((metric) => (
              <div key={metric.label} className="rounded-[1.5rem] border border-white/10 bg-white/8 p-4">
                <p className="text-sm text-slate-300">{metric.label}</p>
                <p className="mt-3 text-3xl font-semibold text-white">{metric.value}</p>
                <p className="mt-2 text-xs font-medium uppercase tracking-[0.18em] text-amber-200">
                  {metric.delta}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.9fr]">
        <div className="rounded-[1.8rem] border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                Queue snapshot
              </p>
              <h3 className="mt-2 font-heading text-2xl font-semibold text-slate-950">
                Highest-value work this week
              </h3>
            </div>
            <Link
              href="/pipeline"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
            >
              Open pipeline
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {pipelineItems.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-4"
              >
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  <span>{item.company}</span>
                  <Dot className="size-4" />
                  <span>{item.status}</span>
                </div>
                <p className="mt-2 text-lg font-semibold text-slate-950">{item.role}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.note}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1.8rem] border border-slate-200 bg-[#f2ecdf] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Readiness notes
          </p>
          <h3 className="mt-2 font-heading text-2xl font-semibold text-slate-950">
            Frontend-first milestones now unblocked
          </h3>
          <div className="mt-6 space-y-4 text-sm leading-7 text-slate-700">
            <p>The shell is ready for NextAuth gating, server actions, and Supabase-backed data fetches.</p>
            <p>The tracker and report detail views already reflect the information architecture defined in the implementation plan.</p>
            <p>The next backend-oriented pass can focus on auth, schema wiring, and route handlers without redesigning the app frame.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
