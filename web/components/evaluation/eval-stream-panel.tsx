"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useEvalStream } from "@/hooks/use-eval-stream";

export function EvalStreamPanel() {
  const [jobDescription, setJobDescription] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const { status, text, sections, error, startEvent, runEvaluation } = useEvalStream();

  return (
    <section className="rounded-[1.8rem] border border-slate-200 bg-white p-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
          Live evaluation
        </p>
        <h3 className="font-heading text-2xl font-semibold text-slate-950">
          Submit a JD and stream section output
        </h3>
      </div>

      <div className="mt-6 space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Source URL</span>
          <input
            value={sourceUrl}
            onChange={(event) => setSourceUrl(event.target.value)}
            placeholder="https://company.com/jobs/example"
            className="w-full rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Job description</span>
          <textarea
            value={jobDescription}
            onChange={(event) => setJobDescription(event.target.value)}
            placeholder="Paste the job description here..."
            className="min-h-48 w-full rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />
        </label>

        <Button
          type="button"
          disabled={status === "running" || jobDescription.trim().length === 0}
          className="h-11 rounded-full px-5"
          onClick={() =>
            runEvaluation({
              jobDescription,
              sourceUrl: sourceUrl || undefined,
            })
          }
        >
          {status === "running" ? "Streaming..." : "Run evaluation"}
        </Button>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[1.4rem] bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Stream status</p>
          <p className="mt-3 text-sm text-slate-700">State: {status}</p>
          {startEvent ? (
            <p className="mt-2 text-sm text-slate-700">
              Model: {startEvent.model} · profile loaded: {startEvent.hasProfile ? "yes" : "no"}
            </p>
          ) : null}
          {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}

          <div className="mt-4 space-y-3">
            {sections.map((section) => (
              <div key={section.key} className="rounded-[1rem] border border-slate-200 bg-white px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {section.key}) {section.title}
                </p>
                <p className="mt-2 line-clamp-4 text-sm leading-6 text-slate-700">
                  {section.content || "Waiting for content..."}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1.4rem] bg-slate-950 p-4 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Raw markdown</p>
          <pre className="mt-4 max-h-[32rem] overflow-auto whitespace-pre-wrap text-sm leading-6 text-slate-200">
            {text || "No output yet."}
          </pre>
        </div>
      </div>
    </section>
  );
}
