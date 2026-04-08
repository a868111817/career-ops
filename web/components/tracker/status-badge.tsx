import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  evaluated: "bg-slate-100 text-slate-800",
  applied: "bg-amber-100 text-amber-950",
  responded: "bg-sky-100 text-sky-950",
  interview: "bg-emerald-100 text-emerald-950",
  offer: "bg-violet-100 text-violet-950",
  rejected: "bg-rose-100 text-rose-950",
  discarded: "bg-slate-100 text-slate-500",
  skip: "bg-slate-100 text-slate-400",
  pending: "bg-amber-100 text-amber-950",
  processing: "bg-sky-100 text-sky-950",
  done: "bg-emerald-100 text-emerald-950",
  error: "bg-rose-100 text-rose-950",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]",
        statusStyles[status] ?? "bg-slate-100 text-slate-800"
      )}
    >
      {status}
    </span>
  );
}
