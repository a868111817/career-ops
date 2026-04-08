import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

import { parseReportMarkdown } from "@/lib/markdown-parser";
import type { ApplicationStatus } from "@/lib/supabase";

const REPO_ROOT = path.resolve(process.cwd(), "..");
const APPLICATIONS_PATH = path.join(REPO_ROOT, "data", "applications.md");
const REPORTS_DIR = path.join(REPO_ROOT, "reports");

const CANONICAL_STATUSES: ApplicationStatus[] = [
  "evaluated", "applied", "responded", "interview",
  "offer", "rejected", "discarded", "skip",
];

function toApplicationStatus(raw: string): ApplicationStatus {
  const normalized = raw.trim().toLowerCase() as ApplicationStatus;
  return CANONICAL_STATUSES.includes(normalized) ? normalized : "evaluated";
}

export type LocalApplication = {
  id: string;
  seq: number;
  company: string;
  role: string;
  appliedAt: string;
  score: number;
  status: ApplicationStatus;
  pdfUrl: string | null;
  reportPath: string | null;
  reportSlug: string | null;
  notes: string;
  source: string;
  archetype: string;
};

export type LocalReport = {
  id: string;
  seq: number;
  company: string;
  role: string;
  reportDate: string | null;
  score: number | null;
  archetype: string | null;
  sourceUrl: string | null;
  pdfUrl: string | null;
  rawMarkdown: string;
  blocks: ReturnType<typeof parseReportMarkdown>["blocks"];
  slug: string;
};

function normalizeStatus(status: string): ApplicationStatus {
  return toApplicationStatus(status);
}

function parseScore(score: string) {
  const match = score.match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : 0;
}

function parseReportRef(reportCell: string) {
  const match = reportCell.match(/\(([^)]+)\)/);
  return match?.[1] ?? null;
}

function parsePipeRow(line: string) {
  return line
    .split("|")
    .slice(1, -1)
    .map((cell) => cell.trim());
}

function reportSlugFromPath(reportPath: string | null) {
  if (!reportPath) {
    return null;
  }

  return reportPath.replace(/^reports[\\/]/, "").replace(/\.md$/i, "");
}

export async function loadApplicationsFromMarkdown() {
  const markdown = await readFile(APPLICATIONS_PATH, "utf8");
  const lines = markdown
    .split(/\r?\n/)
    .filter((line) => line.trim().startsWith("|"))
    .slice(2);

  return lines.map((line) => {
    const [seq, appliedAt, company, role, score, status, pdf, report, notes] = parsePipeRow(line);

    return {
      id: `app-${seq}`,
      seq: Number(seq),
      company,
      role,
      appliedAt,
      score: parseScore(score),
      status: normalizeStatus(status),
      pdfUrl: pdf === "—" || pdf === "??" ? null : pdf,
      reportPath: parseReportRef(report),
      reportSlug: reportSlugFromPath(parseReportRef(report)),
      notes,
      source: "Imported tracker",
      archetype: "Imported from markdown",
    } satisfies LocalApplication;
  });
}

function extractSeqFromFilename(filename: string) {
  const match = filename.match(/^(\d+)-/);
  return match ? Number(match[1]) : 0;
}

function slugFromFilename(filename: string) {
  return filename.replace(/\.md$/i, "");
}

function inferCompanyAndRole(title: string | null) {
  if (!title) {
    return { company: "Unknown", role: "Unknown" };
  }

  const cleaned = title.replace(/^Evaluation:\s*/i, "");
  const [company = "Unknown", role = "Unknown"] = cleaned.split(/\s+--\s+/);
  return { company, role };
}

export async function loadReportsFromMarkdown() {
  const filenames = (await readdir(REPORTS_DIR)).filter((name) => name.endsWith(".md"));

  const reports = await Promise.all(
    filenames.map(async (filename) => {
      const rawMarkdown = await readFile(path.join(REPORTS_DIR, filename), "utf8");
      const parsed = parseReportMarkdown(rawMarkdown);
      const inferred = inferCompanyAndRole(parsed.metadata.title);

      return {
        id: slugFromFilename(filename),
        seq: extractSeqFromFilename(filename),
        company: inferred.company,
        role: inferred.role,
        reportDate: parsed.metadata.date,
        score: parsed.metadata.score,
        archetype: parsed.metadata.archetype,
        sourceUrl: parsed.metadata.url,
        pdfUrl: parsed.metadata.pdf,
        rawMarkdown,
        blocks: parsed.blocks,
        slug: slugFromFilename(filename),
      } satisfies LocalReport;
    })
  );

  return reports.sort((left, right) => right.seq - left.seq);
}

export async function loadReportBySlug(slug: string) {
  const reports = await loadReportsFromMarkdown();
  return reports.find((report) => report.slug === slug) ?? null;
}
