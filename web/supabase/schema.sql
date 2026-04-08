CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seq_num INTEGER NOT NULL UNIQUE,
  applied_at DATE NOT NULL,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  score NUMERIC(3, 1),
  status TEXT NOT NULL DEFAULT 'evaluated'
    CHECK (status IN (
      'evaluated',
      'applied',
      'responded',
      'interview',
      'offer',
      'rejected',
      'discarded',
      'skip'
    )),
  pdf_url TEXT,
  report_id UUID,
  source_url TEXT,
  archetype TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seq_num INTEGER NOT NULL UNIQUE,
  application_id UUID REFERENCES applications(id),
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  report_date DATE NOT NULL,
  slug TEXT NOT NULL,
  raw_markdown TEXT NOT NULL,
  blocks JSONB,
  score NUMERIC(3, 1),
  archetype TEXT,
  source_url TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE pipeline_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  company TEXT,
  role TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'done', 'error', 'skipped')),
  error_msg TEXT,
  application_id UUID REFERENCES applications(id),
  added_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ
);

CREATE TABLE scan_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL UNIQUE,
  title TEXT,
  company TEXT,
  portal TEXT,
  scan_status TEXT NOT NULL
    CHECK (scan_status IN ('added', 'skipped_title', 'skipped_dup')),
  first_seen_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  theme TEXT,
  source_report_id UUID REFERENCES reports(id),
  situation TEXT,
  task TEXT,
  action TEXT,
  result TEXT,
  reflection TEXT,
  best_for TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE portals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  careers_url TEXT,
  platform TEXT,
  api_url TEXT,
  enabled BOOLEAN DEFAULT true,
  custom BOOLEAN DEFAULT false,
  last_scanned TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);
