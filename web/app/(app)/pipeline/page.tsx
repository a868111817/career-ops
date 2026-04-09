"use client";

import { Clock3, ExternalLink, Plus, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { EvalStreamPanel } from "@/components/evaluation/eval-stream-panel";
import { StatusBadge } from "@/components/tracker/status-badge";

type PipelineItem = {
  id: string;
  url: string;
  company: string | null;
  role: string | null;
  status: "pending" | "processing" | "done" | "error" | "skipped";
  error_msg: string | null;
  application_id: string | null;
  added_at: string;
  processed_at: string | null;
};

function AddUrlForm({ onAdded }: { onAdded: () => void }) {
  const [url, setUrl] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);

    await fetch("/api/pipeline", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url: url.trim(), company: company || undefined, role: role || undefined }),
    });

    setUrl("");
    setCompany("");
    setRole("");
    setLoading(false);
    setOpen(false);
    onAdded();
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
      >
        <Plus className="size-4" />
        Add URL to queue
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3 rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Company (optional)"
          className="rounded-[0.75rem] border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
        />
        <input
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="Role (optional)"
          className="rounded-[0.75rem] border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
        />
      </div>
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Job URL (required)"
        required
        className="w-full rounded-[0.75rem] border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add to queue"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function PipelineInbox() {
  const [items, setItems] = useState<PipelineItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/pipeline");
    if (res.ok) {
      const data = await res.json() as PipelineItem[];
      setItems(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchItems();
  }, [fetchItems]);

  return (
    <section className="rounded-[1.8rem] border border-slate-200 bg-white p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Queued items
          </p>
          <h3 className="mt-2 font-heading text-2xl font-semibold text-slate-950">
            Pipeline inbox
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            <Clock3 className="size-3.5" />
            {items.length} total
          </div>
          <button
            onClick={() => void fetchItems()}
            className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
            title="Refresh"
          >
            <RefreshCcw className="size-4" />
          </button>
        </div>
      </div>

      <AddUrlForm onAdded={() => void fetchItems()} />

      <div className="mt-6 space-y-4">
        {loading ? (
          <p className="text-sm text-slate-400">Loading...</p>
        ) : items.length === 0 ? (
          <p className="rounded-[1.4rem] border border-dashed border-slate-200 py-8 text-center text-sm text-slate-400">
            No items in queue. Add a URL above or run an evaluation below.
          </p>
        ) : (
          items.map((item) => (
            <article key={item.id} className="rounded-[1.4rem] border border-slate-200 px-4 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  {item.company ? (
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      {item.company}
                    </p>
                  ) : null}
                  <h4 className="mt-1 truncate text-base font-semibold text-slate-950">
                    {item.role ?? item.url}
                  </h4>
                  {item.error_msg ? (
                    <p className="mt-1 text-sm text-rose-500">{item.error_msg}</p>
                  ) : null}
                </div>
                <StatusBadge status={item.status} />
              </div>
              <div className="mt-3 flex flex-col gap-2 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                <span>{new Date(item.added_at).toLocaleString()}</span>
                <div className="flex items-center gap-3">
                  {item.application_id ? (
                    <Link
                      href={`/tracker`}
                      className="inline-flex items-center gap-1.5 font-medium text-slate-700 transition hover:text-slate-950"
                    >
                      View in tracker
                      <ExternalLink className="size-3.5" />
                    </Link>
                  ) : null}
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 font-medium text-slate-700 transition hover:text-slate-950"
                  >
                    Source URL
                    <ExternalLink className="size-3.5" />
                  </a>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

export default function PipelinePage() {
  return (
    <div className="flex flex-1 flex-col p-5 sm:p-8">
      <div className="flex flex-col gap-4 rounded-[2rem] border border-slate-200 bg-white px-6 py-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Pipeline
          </p>
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-slate-950">
            Evaluate job descriptions and track your pipeline.
          </h2>
        </div>
        <p className="text-sm text-slate-500">
          Paste a JD to get an instant A-F evaluation from Gemini, saved to your tracker.
        </p>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <EvalStreamPanel />
        <PipelineInbox />
      </div>
    </div>
  );
}
