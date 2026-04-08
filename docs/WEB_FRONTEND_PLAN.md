# Career-Ops Web Frontend — Implementation Plan

## Context

career-ops 是一個基於 Claude Code 的 CLI 求職自動化系統。此計劃將其所有功能轉化為 Next.js Web App，部署在 Vercel 公開網域，供個人使用（單一用戶）。用戶統一付 Claude API 費用（API key 存在 env vars）。

---

## Architecture

| Layer | Tech |
|---|---|
| Frontend | Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui |
| Auth | NextAuth.js credentials (單一密碼，ADMIN_PASSWORD_HASH in env) |
| Database | Supabase (PostgreSQL) — 免費方案 |
| AI | Anthropic SDK (`claude-sonnet-4-6`), streaming via SSE |
| PDF | Railway sidecar service (puppeteer-core + @sparticuz/chromium) |
| Hosting | Vercel (web app) + Railway (PDF service) |

**為什麼 Railway 處理 PDF？** Vercel serverless 函數限制 50MB，`@sparticuz/chromium` 本身已 ~45MB，加上 node_modules 會超限。Railway 沒有此限制。

---

## Repository Structure

Web app 放在 `career-ops/web/` 子目錄，與現有 `modes/`, `templates/`, `fonts/`, `cv.md` 同層，透過 `outputFileTracingIncludes` 在 Vercel 部署時一起打包。

```
career-ops/
├── web/                      ← Next.js app
│   ├── app/
│   │   ├── (auth)/login/     ← 登入頁
│   │   ├── (app)/            ← 所有受保護頁面
│   │   │   ├── dashboard/    ← 數據概覽
│   │   │   ├── pipeline/     ← 貼 URL / Inbox / 批次處理
│   │   │   ├── tracker/      ← 應徵追蹤表
│   │   │   ├── applications/[id]/  ← 單筆詳情
│   │   │   ├── reports/[id]/ ← 報告 A-F 區塊
│   │   │   ├── scanner/      ← 職缺掃描器
│   │   │   ├── compare/      ← 多職缺比較
│   │   │   ├── outreach/     ← LinkedIn 外展訊息
│   │   │   ├── research/     ← 公司深度研究
│   │   │   ├── stories/      ← STAR+R 故事庫
│   │   │   ├── training/     ← 課程評估
│   │   │   ├── projects/     ← 作品集評估
│   │   │   ├── cv/           ← CV 編輯器
│   │   │   ├── config/profile/    ← 個人設定
│   │   │   ├── config/portals/    ← 職缺平台設定
│   │   │   └── system/       ← 健康檢查
│   │   └── api/              ← 所有 API routes
│   ├── components/
│   │   ├── evaluation/       ← EvalStream, BlockA-F renderers
│   │   ├── tracker/          ← ApplicationsTable, StatusBadge
│   │   ├── scanner/          ← PortalList, ScanProgress
│   │   ├── analytics/        ← Charts (Recharts)
│   │   └── ...
│   ├── lib/
│   │   ├── supabase.ts
│   │   ├── anthropic.ts
│   │   ├── auth.ts
│   │   ├── pdf-client.ts     ← 呼叫 Railway PDF service
│   │   ├── prompt-loader.ts  ← 讀取 modes/*.md, cv.md, profile.yml
│   │   └── markdown-parser.ts ← 解析 A-F 區塊
│   └── scripts/
│       └── migrate.ts        ← 一次性資料遷移腳本
├── pdf-service/              ← Railway PDF 服務
│   ├── index.js              ← Express + puppeteer-core
│   ├── package.json
│   └── Dockerfile
├── modes/                    ← 現有 (不動)
├── templates/                ← 現有 (不動)
├── fonts/                    ← 現有 (不動)
└── ...
```

---

## Database Schema (Supabase)

```sql
CREATE TABLE applications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seq_num     INTEGER NOT NULL UNIQUE,
  applied_at  DATE NOT NULL,
  company     TEXT NOT NULL,
  role        TEXT NOT NULL,
  score       NUMERIC(3,1),
  status      TEXT NOT NULL DEFAULT 'evaluated'
              CHECK (status IN ('evaluated','applied','responded',
                               'interview','offer','rejected','discarded','skip')),
  pdf_url     TEXT,
  report_id   UUID,
  source_url  TEXT,
  archetype   TEXT,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE reports (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seq_num       INTEGER NOT NULL UNIQUE,
  application_id UUID REFERENCES applications(id),
  company       TEXT NOT NULL,
  role          TEXT NOT NULL,
  report_date   DATE NOT NULL,
  slug          TEXT NOT NULL,
  raw_markdown  TEXT NOT NULL,
  blocks        JSONB,         -- parsed A-F as JSON
  score         NUMERIC(3,1),
  archetype     TEXT,
  source_url    TEXT,
  pdf_url       TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE pipeline_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url           TEXT NOT NULL,
  company       TEXT,
  role          TEXT,
  status        TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','processing','done','error','skipped')),
  error_msg     TEXT,
  application_id UUID REFERENCES applications(id),
  added_at      TIMESTAMPTZ DEFAULT now(),
  processed_at  TIMESTAMPTZ
);

CREATE TABLE scan_history (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url        TEXT NOT NULL UNIQUE,
  title      TEXT,
  company    TEXT,
  portal     TEXT,
  scan_status TEXT NOT NULL
              CHECK (scan_status IN ('added','skipped_title','skipped_dup')),
  first_seen_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE stories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title      TEXT NOT NULL,
  theme      TEXT,
  source_report_id UUID REFERENCES reports(id),
  situation  TEXT,
  task       TEXT,
  action     TEXT,
  result     TEXT,
  reflection TEXT,
  best_for   TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE portals (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT NOT NULL UNIQUE,
  name         TEXT NOT NULL,
  careers_url  TEXT,
  platform     TEXT,
  api_url      TEXT,
  enabled      BOOLEAN DEFAULT true,
  custom       BOOLEAN DEFAULT false,
  last_scanned TIMESTAMPTZ,
  updated_at   TIMESTAMPTZ DEFAULT now()
);

-- Key-value store for profile, portals config, cv_markdown
CREATE TABLE settings (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);
-- Keys: 'profile', 'cv_markdown', 'portals_config'
```

---

## Key API Routes

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/evaluate/stream` | 串流評估 (SSE) → 儲存報告到 DB |
| POST | `/api/pdf` | 生成 PDF → 存 Supabase Storage → 回傳 URL |
| POST | `/api/scanner` | 掃描職缺平台 (SSE 進度) |
| GET/PATCH | `/api/applications/[id]` | 讀取/更新應徵狀態、備註 |
| GET/POST | `/api/pipeline` | 讀取/新增待處理 URL |
| POST | `/api/pipeline/process` | 批次處理所有 pending URLs |
| POST | `/api/outreach` | 生成 LinkedIn 外展訊息 |
| POST | `/api/research` | 生成深度研究 prompt |
| POST | `/api/compare` | 多職缺比較 |
| POST | `/api/training` | 評估課程/證照 |
| POST | `/api/projects` | 評估作品集專案 |
| GET/PUT | `/api/cv` | 讀取/更新 cv.md 內容 |
| GET/PUT | `/api/settings` | 讀取/更新 profile, portals 設定 |
| POST | `/api/system/health` | 健康檢查 (reimplements verify-pipeline.mjs) |

### 評估串流實作

```
POST /api/evaluate/stream
→ 讀取 modes/auto-pipeline.md + modes/oferta.md + cv.md + profile.yml
→ anthropic.messages.stream()
→ 偵測 "## A)" 等區塊邊界
→ 每個區塊完成時 flush SSE event
→ 串流結束時儲存 report 到 DB
→ 前端用 EventSource 消費
```

---

## 環境變數 (Vercel)

```bash
NEXTAUTH_SECRET=<32 char random>
NEXTAUTH_URL=https://your-app.vercel.app
ADMIN_PASSWORD_HASH=<bcrypt hash>

NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

ANTHROPIC_API_KEY=sk-ant-...

PDF_SERVICE_URL=https://your-service.railway.app
PDF_SERVICE_SECRET=<shared secret>
```

---

## 資料遷移 (一次性)

執行 `npx tsx web/scripts/migrate.ts --all`：

1. **`data/applications.md`** → `applications` 表
2. **`reports/*.md`** → `reports` 表 (解析 A-F 區塊)
3. **`interview-prep/story-bank.md`** → `stories` 表
4. **`config/profile.yml`** → `settings` key `'profile'`
5. **`portals.yml`** → `portals` 表
6. **`cv.md`** → `settings` key `'cv_markdown'`

腳本需冪等 (upsert on seq_num)。

---

## 實作階段

### Phase 1 — 基礎架構 (優先)
- [x] 初始化 `web/` Next.js 專案 (TypeScript, Tailwind, shadcn/ui)
- [x] NextAuth credentials 設定 (單一密碼)
- [x] 建立 Supabase 專案、執行 schema SQL (`web/supabase/schema.sql` 已完成)
- [x] `lib/supabase.ts`, `lib/auth.ts`
- [x] 執行資料遷移腳本 (`web/scripts/migrate.ts` 已完成，執行 `npx tsx scripts/migrate.ts --all`)
- [x] `/tracker` 頁面：顯示應徵表格 (唯讀)
- [x] `/reports/[id]` 頁面：顯示 markdown 報告
- [x] 部署到 Vercel — build 通過，`vercel.json` + `.env.local.example` 已建立

### Phase 2 — 核心評估流程
- [x] `lib/prompt-loader.ts` (讀取 modes/*.md, cv.md)
- [x] `lib/markdown-parser.ts` (解析 A-F 區塊)
- [x] `POST /api/evaluate/stream` (Anthropic 串流)
- [x] `hooks/useEvalStream.ts` (SSE 消費)
- [x] `/pipeline` 頁面骨架：貼 URL/JD 與處理佇列視圖
- [ ] `/pipeline` 頁面：貼 URL/JD，觀看串流評估，儲存到 DB
- [x] BlockA-F 渲染元件

### Phase 3 — PDF 生成
- [ ] 建立 `pdf-service/` (Express + puppeteer-core)
- [ ] 部署到 Railway
- [ ] `lib/pdf-client.ts`, `POST /api/pdf`
- [ ] Supabase Storage bucket `pdfs`
- [ ] 在 tracker 和報告頁面加入 PDF 下載按鈕

### Phase 4 — Tracker 完整功能
- [ ] 狀態更新 (inline dropdown)
- [ ] 篩選 (status, score range, date range)
- [ ] `/applications/[id]` 詳情頁
- [x] `/dashboard` 頁面骨架
- [ ] `/dashboard` 分析圖表 (Recharts)

### Phase 5 — Pipeline Inbox + 批次處理
- [ ] 待處理 URL 列表 UI
- [ ] "Process All" 按鈕 (並行 3 個，SSE 進度)

### Phase 6 — 職缺掃描器
- [ ] `/config/portals` 頁面
- [ ] `POST /api/scanner` (Claude + WebFetch)
- [ ] `/scanner` 頁面 (SSE 進度 + 結果)

### Phase 7 — 輔助功能
- [ ] `/outreach` — LinkedIn 外展
- [ ] `/research` — 深度研究 prompt
- [ ] `/compare` — 多職缺比較
- [ ] `/training` — 課程評估
- [ ] `/projects` — 作品集評估
- [ ] `/stories` — STAR+R 故事庫 CRUD
- [ ] `/cv` — CV 編輯器
- [ ] `/config/profile` — 個人設定表單

### Phase 8 — 系統健康 + 完善
- [ ] `/system` — 健康檢查、正規化、去重
- [ ] RWD 調整
- [ ] Loading states, error boundaries, toast 通知
- [ ] Empty states

---

## 重要檔案

| 檔案 | 重要性 |
|---|---|
| `web/lib/prompt-loader.ts` | 所有 AI 功能的基礎，讀取 modes/*.md |
| `web/app/api/evaluate/stream/route.ts` | 最複雜的核心路由 |
| `web/lib/markdown-parser.ts` | 解析 A-F 區塊，遷移和串流都需要 |
| `web/scripts/migrate.ts` | 必須在第一次部署前執行 |
| `web/next.config.ts` | `outputFileTracingIncludes` — 沒這個 Vercel 函數找不到 modes/ |
| `pdf-service/index.js` | PDF 生成服務 |

---

## 部署步驟

1. **Supabase:** 建立專案 → 執行 schema SQL → 建立 Storage bucket `pdfs`
2. **本地遷移:** `npx tsx web/scripts/migrate.ts --all`
3. **Railway:** 部署 `pdf-service/` → 取得服務 URL
4. **Vercel:** 連接 GitHub → root directory = `web/` → 設定所有 env vars → 部署
5. **(Optional)** 自訂網域

## Verification

完成後驗證：
1. 訪問 Vercel URL → 導向登入頁 → 輸入密碼 → 進入 dashboard
2. `/tracker` 顯示已遷移的應徵資料
3. `/pipeline` 貼一個職缺 URL → 觀察串流評估逐區塊出現 → 完成後在 tracker 看到新條目
4. 點擊報告 → 看到 A-F 區塊正確渲染
5. 點擊 "Generate PDF" → 下載 ATS-optimized CV
6. `/scanner` 觸發掃描 → 新職缺出現在 pipeline
