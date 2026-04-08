import Link from "next/link";
import { ArrowRight, FileStack, Gauge, ScanSearch } from "lucide-react";

const highlights = [
  {
    icon: Gauge,
    title: "Tracker-first",
    text: "Review score, status, and role fit without jumping between markdown files.",
  },
  {
    icon: FileStack,
    title: "Report-native",
    text: "A-F evaluation blocks become a persistent view instead of one-off generated output.",
  },
  {
    icon: ScanSearch,
    title: "Pipeline ready",
    text: "Queue handling is prepared for SSE-backed processing and portal scanning.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(232,181,76,0.3),_transparent_28%),linear-gradient(180deg,_#fffdf7_0%,_#f5efdf_48%,_#eadfca_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <main className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-7xl flex-col rounded-[2.25rem] border border-white/80 bg-[#fffdf9]/88 shadow-[0_24px_80px_rgba(83,61,24,0.12)] backdrop-blur">
        <div className="grid flex-1 gap-10 px-6 py-8 lg:grid-cols-[1.2fr_0.85fr] lg:px-10 lg:py-10">
          <section className="flex flex-col justify-between">
            <div className="space-y-6">
              <div className="inline-flex w-fit rounded-full border border-amber-300 bg-amber-100/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-amber-950">
                Career Ops Web
              </div>
              <div className="space-y-4">
                <h1 className="max-w-3xl font-heading text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
                  Turn the existing markdown-driven workflow into a usable web cockpit.
                </h1>
                <p className="max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                  The frontend foundation now covers the first operational surfaces from the plan: dashboard, tracker, pipeline inbox, report detail, and auth route scaffolding.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Open dashboard
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
                >
                  Review auth shell
                </Link>
              </div>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              {highlights.map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-[1.6rem] border border-slate-200 bg-white p-5">
                  <div className="inline-flex rounded-2xl bg-[#f5efe1] p-3 text-slate-950">
                    <Icon className="size-5" />
                  </div>
                  <h2 className="mt-4 text-lg font-semibold text-slate-950">{title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-200">Phase snapshot</p>
            <div className="mt-4 space-y-5">
              <div>
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span>Frontend scaffold</span>
                  <span>100%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-white/10">
                  <div className="h-2 w-full rounded-full bg-amber-300" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span>App shell and routes</span>
                  <span>70%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-white/10">
                  <div className="h-2 w-[70%] rounded-full bg-amber-300" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span>Data and auth wiring</span>
                  <span>10%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-white/10">
                  <div className="h-2 w-[10%] rounded-full bg-amber-300" />
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-[1.6rem] border border-white/10 bg-white/8 p-5">
              <p className="text-sm leading-7 text-slate-300">
                This pass intentionally focuses on UI structure so the remaining plan items can plug into stable routes and components instead of the default starter page.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
