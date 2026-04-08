import { ApplicationsTable } from "@/components/tracker/applications-table";
import { loadApplicationsFromMarkdown } from "@/lib/local-data";

export default async function TrackerPage() {
  const applications = await loadApplicationsFromMarkdown();

  return (
    <div className="flex flex-1 flex-col p-5 sm:p-8">
      <div className="flex flex-col gap-4 rounded-[2rem] border border-slate-200 bg-white px-6 py-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Application tracker</p>
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-slate-950">
            Review role quality, pipeline state, and report linkage in one table.
          </h2>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center text-sm">
          <div className="rounded-[1.3rem] bg-slate-950 px-4 py-3 text-white">
            <div className="text-xl font-semibold">{applications.length}</div>
            <div className="text-xs uppercase tracking-[0.16em] text-slate-300">Visible rows</div>
          </div>
          <div className="rounded-[1.3rem] bg-[#f5efe1] px-4 py-3 text-slate-950">
            <div className="text-xl font-semibold">
              {applications.length > 0
                ? (applications.reduce((sum, application) => sum + application.score, 0) / applications.length).toFixed(1)
                : "0.0"}
            </div>
            <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Avg score</div>
          </div>
          <div className="rounded-[1.3rem] bg-[#f5efe1] px-4 py-3 text-slate-950">
            <div className="text-xl font-semibold">
              {
                applications.filter((application) =>
                  ["responded", "interview", "offer"].includes(application.status)
                ).length
              }
            </div>
            <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Active loops</div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <ApplicationsTable applications={applications} />
      </div>
    </div>
  );
}
