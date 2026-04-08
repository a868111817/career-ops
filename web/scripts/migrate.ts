import { readFile } from "node:fs/promises";
import path from "node:path";

import yaml from "js-yaml";

import { createSupabaseAdminClient } from "@/lib/supabase";
import type { SupabaseJson } from "@/lib/supabase";
import { loadApplicationsFromMarkdown, loadReportsFromMarkdown } from "@/lib/local-data";

const REPO_ROOT = path.resolve(process.cwd(), "..");

type SettingRow = {
  key: string;
  value: SupabaseJson;
};

async function loadStories() {
  const raw = await readFile(path.join(REPO_ROOT, "interview-prep", "story-bank.md"), "utf8");
  return [
    {
      title: "Imported story bank",
      theme: "general",
      source_report_id: null,
      situation: null,
      task: null,
      action: raw,
      result: null,
      reflection: "Imported raw markdown for later normalization.",
      best_for: [],
    },
  ];
}

async function loadSettings(): Promise<SettingRow[]> {
  const rows: SettingRow[] = [];
  const cv = await readFile(path.join(REPO_ROOT, "cv.md"), "utf8");
  rows.push({ key: "cv_markdown", value: cv as SupabaseJson });

  try {
    const profile = await readFile(path.join(REPO_ROOT, "config", "profile.yml"), "utf8");
    rows.push({ key: "profile", value: yaml.load(profile) as SupabaseJson });
  } catch {
    // Optional file.
  }

  try {
    const portals = await readFile(path.join(REPO_ROOT, "portals.yml"), "utf8");
    rows.push({ key: "portals_config", value: yaml.load(portals) as SupabaseJson });
  } catch {
    // Optional file.
  }

  return rows;
}

async function migrateAll() {
  const supabase = createSupabaseAdminClient();
  const applications = await loadApplicationsFromMarkdown();
  const reports = await loadReportsFromMarkdown();
  const stories = await loadStories();
  const settings = await loadSettings();

  const applicationRows = applications.map((application) => ({
    seq_num: application.seq,
    applied_at: application.appliedAt,
    company: application.company,
    role: application.role,
    score: application.score,
    status: application.status,
    pdf_url: application.pdfUrl,
    notes: application.notes,
    archetype: application.archetype,
  }));

  const reportRows = reports.map((report) => ({
    seq_num: report.seq,
    company: report.company,
    role: report.role,
    report_date: report.reportDate ?? new Date().toISOString().slice(0, 10),
    slug: report.slug,
    raw_markdown: report.rawMarkdown,
    blocks: report.blocks as unknown as import("@/lib/supabase").SupabaseJson,
    score: report.score,
    archetype: report.archetype,
    source_url: report.sourceUrl,
    pdf_url: report.pdfUrl,
  }));

  const writes = await Promise.all([
    supabase.from("applications").upsert(applicationRows, { onConflict: "seq_num" }),
    supabase.from("reports").upsert(reportRows, { onConflict: "seq_num" }),
    supabase.from("stories").upsert(stories),
    supabase.from("settings").upsert(settings, { onConflict: "key" }),
  ]);

  const failures = writes.filter((result) => result.error);
  if (failures.length > 0) {
    throw new Error(
      failures
        .map((result) => result.error?.message)
        .filter(Boolean)
        .join("; ")
    );
  }

  console.log(
    JSON.stringify(
      {
        applications: applicationRows.length,
        reports: reportRows.length,
        stories: stories.length,
        settings: settings.length,
      },
      null,
      2
    )
  );
}

async function main() {
  const arg = process.argv[2];

  if (arg !== "--all") {
    throw new Error("Usage: npx tsx web/scripts/migrate.ts --all");
  }

  await migrateAll();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
