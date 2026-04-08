import Link from "next/link";

import type { ApplicationRecord } from "@/lib/mock-data";
import { StatusBadge } from "@/components/tracker/status-badge";

type TableApplication = Pick<
  ApplicationRecord,
  "id" | "seq" | "company" | "role" | "appliedAt" | "score" | "status" | "archetype" | "source"
> & {
  reportSlug?: string | null;
};

export function ApplicationsTable({
  applications,
}: {
  applications: TableApplication[];
}) {
  return (
    <div className="overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white">
      <div className="grid grid-cols-[0.7fr_1.5fr_1.3fr_0.9fr_0.9fr_1fr_0.7fr] gap-4 border-b border-slate-200 px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        <span>ID</span>
        <span>Company</span>
        <span>Role</span>
        <span>Applied</span>
        <span>Score</span>
        <span>Status</span>
        <span>Report</span>
      </div>

      <div className="divide-y divide-slate-200">
        {applications.map((application) => (
          <div
            key={application.id}
            className="grid grid-cols-[0.7fr_1.5fr_1.3fr_0.9fr_0.9fr_1fr_0.7fr] gap-4 px-6 py-5 text-sm text-slate-700"
          >
            <div className="font-semibold text-slate-950">#{application.seq}</div>
            <div>
              <div className="font-semibold text-slate-950">{application.company}</div>
              <div className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">
                {application.source}
              </div>
            </div>
            <div>
              <div className="font-medium text-slate-900">{application.role}</div>
              <div className="mt-1 text-xs text-slate-500">{application.archetype}</div>
            </div>
            <div>{application.appliedAt}</div>
            <div className="font-semibold text-slate-950">{application.score.toFixed(1)}</div>
            <div>
              <StatusBadge status={application.status} />
            </div>
            <div>
              {application.reportSlug ? (
                <Link
                  href={`/reports/${application.reportSlug}`}
                  className="font-semibold text-slate-950 underline decoration-slate-300 underline-offset-4"
                >
                  View
                </Link>
              ) : (
                <span className="text-slate-400">—</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
