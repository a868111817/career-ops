export type ParsedReportMetadata = {
  title: string | null;
  date: string | null;
  archetype: string | null;
  score: number | null;
  url: string | null;
  pdf: string | null;
};

export type ParsedReportBlock = {
  key: string;
  title: string;
  content: string;
};

export type ParsedReport = {
  metadata: ParsedReportMetadata;
  blocks: ParsedReportBlock[];
  keywords: string[];
  rawMarkdown: string;
};

const SECTION_PATTERN = /^##\s+([A-Z])\)\s+(.+)$/gm;

function extractField(markdown: string, label: string) {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = markdown.match(new RegExp(`\\*\\*${escapedLabel}:\\*\\*\\s*(.+)`, "m"));
  return match?.[1]?.trim() ?? null;
}

function parseScore(value: string | null) {
  if (!value) {
    return null;
  }

  const match = value.match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : null;
}

function parseKeywords(markdown: string) {
  const match = markdown.match(
    /^##\s+Keywords Extracted\s*\n+([\s\S]+?)(?=\n##\s+[A-Z]|\n#\s|$)/m
  );

  if (!match) {
    return [];
  }

  return match[1]
    .split(",")
    .map((keyword) => keyword.trim())
    .filter(Boolean);
}

export function parseReportMarkdown(markdown: string): ParsedReport {
  const matches = [...markdown.matchAll(SECTION_PATTERN)];
  const blocks: ParsedReportBlock[] = matches.map((match, index) => {
    const sectionStart = match.index ?? 0;
    const contentStart = sectionStart + match[0].length;
    const nextSectionStart = matches[index + 1]?.index ?? markdown.length;
    const content = markdown.slice(contentStart, nextSectionStart).trim();

    return {
      key: match[1],
      title: match[2].trim(),
      content,
    };
  });

  const titleMatch = markdown.match(/^#\s+(.+)$/m);

  return {
    metadata: {
      title: titleMatch?.[1]?.trim() ?? null,
      date: extractField(markdown, "Date"),
      archetype: extractField(markdown, "Archetype"),
      score: parseScore(extractField(markdown, "Score")),
      url: extractField(markdown, "URL"),
      pdf: extractField(markdown, "PDF"),
    },
    blocks,
    keywords: parseKeywords(markdown),
    rawMarkdown: markdown,
  };
}

export function getReportBlock(
  report: ParsedReport,
  key: string
): ParsedReportBlock | undefined {
  return report.blocks.find((block) => block.key === key);
}
