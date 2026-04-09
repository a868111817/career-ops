"use client";

import { CheckCircle2, ExternalLink, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useEvalStream } from "@/hooks/use-eval-stream";

type Props = {
  onComplete?: () => void;
};

export function EvalStreamPanel({ onComplete }: Props) {
  const [jobDescription, setJobDescription] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");

  const { status, text, sections, error, warning, startEvent, completeEvent, runEvaluation } =
    useEvalStream();

  const handleSubmit = async () => {
    await runEvaluation({
      jobDescription,
      sourceUrl: sourceUrl || undefined,
      company: company || undefined,
      role: role || undefined,
    });
    onComplete?.();
  };

  return (
    <section className="rounded-[1.8rem] border border-slate-200 bg-white p-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
          Live evaluation
        </p>
        <h3 className="font-heading text-2xl font-semibold text-slate-950">
          Submit a job description and stream the evaluation
        </h3>
      </div>

      <div className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Company <span className="text-slate-400">(optional)</span>
            </span>
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Stripe"
              className="w-full rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Role <span className="text-slate-400">(optional)</span>
            </span>
            <input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Senior Engineer"
              className="w-full rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">
            Source URL <span className="text-slate-400">(optional)</span>
          </span>
          <input
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="https://company.com/jobs/example"
            className="w-full rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Job description</span>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job description here..."
            className="min-h-48 w-full rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400"
          />
        </label>

        <div className="flex items-center gap-4">
          <Button
            type="button"
            disabled={status === "running" || jobDescription.trim().length === 0}
            className="h-11 rounded-full px-6"
            onClick={handleSubmit}
          >
            {status === "running" ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Streaming...
              </>
            ) : (
              "Run evaluation"
            )}
          </Button>

          {completeEvent?.reportSlug ? (
            <Link
              href={`/reports/${completeEvent.reportSlug}`}
              className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 transition hover:bg-green-100"
            >
              <CheckCircle2 className="size-4" />
              View report
              <ExternalLink className="size-3.5" />
            </Link>
          ) : null}
        </div>
      </div>

      {(status !== "idle" || sections.length > 0) && (
        <div className="mt-6 space-y-4">
          {startEvent ? (
            <p className="text-xs text-slate-500">
              Model: {startEvent.model} · profile loaded: {startEvent.hasProfile ? "yes" : "no"}
            </p>
          ) : null}

          {error ? (
            <p className="rounded-[1rem] bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p>
          ) : null}

          {warning ? (
            <p className="rounded-[1rem] bg-amber-50 px-4 py-3 text-sm text-amber-700">
              Warning: {warning}
            </p>
          ) : null}

          <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-3">
              {sections.map((section) => (
                <div
                  key={section.key}
                  className="rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    {section.key}) {section.title}
                  </p>
                  <p className="mt-2 line-clamp-4 text-sm leading-6 text-slate-700">
                    {section.content}
                  </p>
                </div>
              ))}

              {status === "running" && sections.length < 6 && (
                <div className="rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="size-3.5 animate-spin text-slate-400" />
                    <p className="text-xs text-slate-400">
                      {sections.length === 0
                        ? "Starting evaluation..."
                        : `Section ${sections.length + 1} / 6 generating...`}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-[1.4rem] bg-slate-950 p-4 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Raw markdown
              </p>
              <pre className="mt-4 max-h-[32rem] overflow-auto whitespace-pre-wrap text-sm leading-6 text-slate-200">
                {text || "No output yet."}
              </pre>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
