import type { ApplicationStatus } from "@/lib/supabase";

export type { ApplicationStatus };

export type NavItem = {
  href: string;
  label: string;
  description: string;
};

export type DashboardMetric = {
  label: string;
  value: string;
  delta: string;
  detail: string;
};

export type ApplicationRecord = {
  id: string;
  seq: number;
  company: string;
  role: string;
  appliedAt: string;
  score: number;
  status: ApplicationStatus;
  archetype: string;
  source: string;
};

export type PipelineRecord = {
  id: string;
  company: string;
  role: string;
  sourceUrl: string;
  status: "pending" | "processing" | "done" | "error";
  addedAt: string;
  note: string;
};

export type ReportBlock = {
  key: string;
  title: string;
  summary: string;
  bullets: string[];
};

export const navItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    description: "Weekly pulse, score mix, and queue health.",
  },
  {
    href: "/tracker",
    label: "Tracker",
    description: "Application table with score, status, and source context.",
  },
  {
    href: "/pipeline",
    label: "Pipeline",
    description: "Inbox for URLs and processing progress.",
  },
  {
    href: "/reports/001-taidin-electronics-2026-04-07",
    label: "Reports",
    description: "A-F evaluation view for a generated report.",
  },
];

export const dashboardMetrics: DashboardMetric[] = [
  {
    label: "Open pipeline",
    value: "12",
    delta: "+4 this week",
    detail: "Three JD URLs already match your current backend profile.",
  },
  {
    label: "Average score",
    value: "8.4",
    delta: "+0.6 vs last cycle",
    detail: "Offer-track roles cluster around platform engineering and dev tools.",
  },
  {
    label: "Interviews active",
    value: "3",
    delta: "2 onsite loops",
    detail: "One process is blocked on scheduling follow-up materials.",
  },
  {
    label: "PDF exports",
    value: "7",
    delta: "2 pending regen",
    detail: "ATS variant and teaching-focused variant are both in use.",
  },
];

export const applications: ApplicationRecord[] = [
  {
    id: "app-101",
    seq: 101,
    company: "Linear",
    role: "Staff Product Engineer",
    appliedAt: "2026-04-05",
    score: 9.1,
    status: "interview",
    archetype: "Product-minded systems builder",
    source: "Lever",
  },
  {
    id: "app-102",
    seq: 102,
    company: "Vercel",
    role: "Developer Experience Engineer",
    appliedAt: "2026-04-04",
    score: 8.7,
    status: "responded",
    archetype: "Dev tools operator",
    source: "Greenhouse",
  },
  {
    id: "app-103",
    seq: 103,
    company: "Anthropic",
    role: "Technical Educator",
    appliedAt: "2026-04-03",
    score: 7.8,
    status: "applied",
    archetype: "Research translator",
    source: "Ashby",
  },
  {
    id: "app-104",
    seq: 104,
    company: "Stripe",
    role: "Infrastructure Engineer",
    appliedAt: "2026-04-02",
    score: 8.2,
    status: "evaluated",
    archetype: "Reliability and tooling",
    source: "Referral",
  },
  {
    id: "app-105",
    seq: 105,
    company: "Notion",
    role: "Senior Frontend Engineer",
    appliedAt: "2026-03-31",
    score: 6.9,
    status: "rejected",
    archetype: "Experience systems",
    source: "Company site",
  },
];

export const pipelineItems: PipelineRecord[] = [
  {
    id: "pipe-201",
    company: "OpenAI",
    role: "Technical Success Engineer",
    sourceUrl: "https://jobs.example.com/openai/technical-success-engineer",
    status: "pending",
    addedAt: "2026-04-07 09:20",
    note: "High overlap with user-facing troubleshooting and prompt iteration.",
  },
  {
    id: "pipe-202",
    company: "Retool",
    role: "Solutions Architect",
    sourceUrl: "https://jobs.example.com/retool/solutions-architect",
    status: "processing",
    addedAt: "2026-04-07 08:55",
    note: "Currently in Claude stream; role appears customer-heavy.",
  },
  {
    id: "pipe-203",
    company: "Cloudflare",
    role: "Developer Platform PM",
    sourceUrl: "https://jobs.example.com/cloudflare/dev-platform-pm",
    status: "done",
    addedAt: "2026-04-06 21:10",
    note: "Generated report score 7.4, needs manual judgment before applying.",
  },
  {
    id: "pipe-204",
    company: "Datadog",
    role: "Staff Software Engineer",
    sourceUrl: "https://jobs.example.com/datadog/staff-software-engineer",
    status: "error",
    addedAt: "2026-04-06 18:42",
    note: "Role parser failed on a nonstandard job description layout.",
  },
];

export const reportBlocks: ReportBlock[] = [
  {
    key: "A",
    title: "Role Fit",
    summary: "Strong fit on product engineering, systems thinking, and written communication.",
    bullets: [
      "The role rewards operators who can tighten product loops with engineering judgment.",
      "Your shipped internal tooling and coaching history supports the dev productivity angle.",
      "Gaps are mostly domain-specific metrics, not capability mismatches.",
    ],
  },
  {
    key: "B",
    title: "Company Thesis",
    summary: "The company is scaling an opinionated product for technical teams and values clarity over feature sprawl.",
    bullets: [
      "Messaging suggests they want sharp product taste paired with execution discipline.",
      "Remote async culture makes concise writing a direct advantage in interview loops.",
    ],
  },
  {
    key: "C",
    title: "Why You",
    summary: "Your strongest angle is translating messy operational context into concrete software improvements.",
    bullets: [
      "Resume bullets should foreground measurable process acceleration and enablement impact.",
      "Bridge narrative: engineer who raises leverage for both teams and customers.",
    ],
  },
  {
    key: "D",
    title: "Risks",
    summary: "Brand-name competition is likely intense, and the JD expects deep examples of cross-functional influence.",
    bullets: [
      "Need tighter examples showing roadmap tradeoffs and executive communication.",
      "Current CV may undersell product intuition relative to platform depth.",
    ],
  },
  {
    key: "E",
    title: "Interview Hooks",
    summary: "Lead with system design decisions that improved operator speed or learning velocity.",
    bullets: [
      "Prepare a STAR+R story about reducing manual review load with tooling.",
      "Bring one example where you changed scope after customer signal or onboarding friction.",
    ],
  },
  {
    key: "F",
    title: "Action Plan",
    summary: "Apply after one CV refinement pass and a concise cover-note style outreach draft.",
    bullets: [
      "Promote two metrics-driven bullets into the top third of the CV.",
      "Reuse the strongest teaching-to-product narrative in outreach and interviews.",
    ],
  },
];

export const reportSummary = {
  id: "001-taidin-electronics-2026-04-07",
  company: "Linear",
  role: "Staff Product Engineer",
  reportDate: "2026-04-05",
  score: 9.1,
  archetype: "Product-minded systems builder",
  sourceUrl: "https://jobs.example.com/linear/staff-product-engineer",
};
