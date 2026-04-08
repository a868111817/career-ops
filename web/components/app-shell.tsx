"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, FolderKanban, LayoutDashboard, ScrollText } from "lucide-react";
import type { ReactNode } from "react";

import { navItems } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const iconMap: Record<string, typeof LayoutDashboard> = {
  "/dashboard": LayoutDashboard,
  "/tracker": ScrollText,
  "/pipeline": FolderKanban,
  "/reports/001-taidin-electronics-2026-04-07": ArrowUpRight,
};

export function AppShell({ children }: { children: ReactNode }) {
  const currentPath = usePathname();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(232,181,76,0.24),_transparent_28%),linear-gradient(180deg,_#fffdf7_0%,_#f6f0e1_46%,_#ebe2d0_100%)] text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <aside className="hidden w-80 shrink-0 flex-col justify-between rounded-[2rem] border border-white/70 bg-white/70 p-6 shadow-[0_24px_80px_rgba(83,61,24,0.12)] backdrop-blur xl:flex">
          <div className="space-y-8">
            <div className="space-y-3">
              <div className="inline-flex rounded-full border border-amber-300 bg-amber-100/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-amber-950">
                Career Ops
              </div>
              <div className="space-y-2">
                <h1 className="font-heading text-3xl font-semibold tracking-tight text-slate-950">
                  Structured job search operations for one focused pipeline.
                </h1>
                <p className="text-sm leading-6 text-slate-600">
                  Frontend shell aligned to the plan: tracker, pipeline inbox, report review, and dashboard entry points.
                </p>
              </div>
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = iconMap[item.href];
                const active =
                  currentPath === item.href ||
                  (item.href === "/reports/001-taidin-electronics-2026-04-07" &&
                    currentPath.startsWith("/reports/"));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-start gap-3 rounded-[1.4rem] border px-4 py-3 transition",
                      active
                        ? "border-slate-950 bg-slate-950 text-white shadow-lg"
                        : "border-transparent bg-white/70 text-slate-700 hover:border-slate-200 hover:bg-white"
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 rounded-full p-2",
                        active ? "bg-white/15" : "bg-amber-100 text-amber-950"
                      )}
                    >
                      <Icon className="size-4" />
                    </span>
                    <span className="space-y-1">
                      <span className="block text-sm font-semibold">{item.label}</span>
                      <span className={cn("block text-xs leading-5", active ? "text-white/70" : "text-slate-500")}>
                        {item.description}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="rounded-[1.6rem] border border-slate-200 bg-slate-950 p-5 text-slate-100">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-200">
              Current phase
            </p>
            <p className="mt-3 text-lg font-semibold">Phase 1 foundation</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Shared layout and page primitives are in place so data wiring can land without reworking the UI structure.
            </p>
          </div>
        </aside>

        <main className="flex min-h-[calc(100vh-2rem)] flex-1 flex-col rounded-[2rem] border border-white/80 bg-[#fffdf9]/90 shadow-[0_24px_80px_rgba(83,61,24,0.12)] backdrop-blur">
          {children}
        </main>
      </div>
    </div>
  );
}
