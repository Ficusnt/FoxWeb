# Persistent Software Development Goal

## TASK

FoxReloaded → FoxWeb Migration Plan

### **Project Overview**
| Item | Decision |
|------|----------|
| **Runtime** | Cloudflare Workers (TypeScript) + React (Vite) on Cloudflare Pages |
| **PDF Generation** | **Client-side only** — `pdf-lib` (works in Chromium/Firefox/Safari) |
| **Frontend** | React 18 + TypeScript + TailwindCSS |
| **State Management** | **Zustand** (lightweight, no Context boilerplate, persists to localStorage) |
| **CSV Handling** | **Server-side only** — CSVs stored in Cloudflare KV; client never sees raw CSV |
| **Auth** | **Simple session cookie** — HttpOnly, validated against Workers Secrets |
| **Storage** | **Cloudflare KV** for coefficient tables + snapshots; **R2** optional for PDF archive |
| **Deployment** | `wrangler deploy` (Workers) + Cloudflare Pages (React) |

---

### **Architecture Diagram**
```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER (React)                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  Step 1:    │→ │  Step 2:    │→ │  Step 3:    │             │
│  │  Data Input │  │  Options    │  │  PDF Preview│             │
│  │  (manual or │  │  (table     │  │  (generate  │             │
│  │   CSV upload)    │   select)   │  │   + download)           │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
│         │                │                │                     │
│         ▼                ▼                ▼                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Zustand Store (persisted to localStorage)              │   │
│  │  { dates, capitals, selectedTable, admin, edificio, ... }│   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────┬───────────────────────────────────┘
                              │ HTTPS (JSON)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  CLOUDFLARE WORKERS (Hono)                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ POST /api/  │  │ GET /api/   │  │ POST /api/  │             │
│  │ tables/     │  │ tables/:id  │  │ pdf/generate│             │
│  │ refresh     │  │ (JSON)      │  │ (proxy for  │             │
│  │ (scraper)   │  │             │  │  CORS)      │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ POST /api/  │  │ GET /api/   │  │ CRON daily  │             │
│  │ auth/login  │  │ health      │  │ (scraper)   │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                              │                                  │
│                              ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Cloudflare KV (coefficient tables + snapshots)         │   │
│  │  Keys: BCRA_ACT_CAP, BCRA_ACT_CAP_2026-11-12, etc.      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Workers Secrets: AGENDAE_USUARIO, PASSWORD, ENTIDAD    │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

### **File Structure (FoxWeb/)**
```
FoxWeb/
├── apps/
│   └── web/                          # React + Vite frontend (Cloudflare Pages)
│       ├── public/
│       ├── src/
│       │   ├── components/
│       │   │   ├── Stepper.tsx           # Progress ribbon: Datos → Opciones → PDF
│       │   │   ├── DataTable.tsx         # Editable date/capital grid
│       │   │   ├── CSVUpload.tsx         # Drag-drop CSV → parses → fills grid
│       │   │   ├── TableSelect.tsx       # Dropdown from /api/tables
│       │   │   ├── FormFields.tsx        # Admin / Edificio / Unidad
│       │   │   ├── PDFPreview.tsx        # iframe preview + download button
│       │   │   └── ui/                   # Button, Input, Select, Card (Tailwind)
│       │   ├── pages/
│       │   │   ├── DataInput.tsx         # Step 1
│       │   │   ├── Options.tsx           # Step 2
│       │   │   └── PDFPreview.tsx        # Step 3
│       │   ├── hooks/
│       │   │   ├── useFormStore.ts       # Zustand store + persistence
│       │   │   └── useApi.ts             # Typed API calls
│       │   ├── lib/
│       │   │   ├── pdf.ts                # pdf-lib generation (client-side)
│       │   │   └── csv.ts                # papaparse helpers
│       │   ├── types/
│       │   │   └── index.ts              # Shared types (with Worker)
│       │   ├── App.tsx
│       │   ├── main.tsx
│       │   └── index.css                 # Tailwind imports
│       ├── index.html
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       ├── tailwind.config.js
│       └── postcss.config.js
├── src/                                # Cloudflare Workers backend
│   ├── index.ts                        # Hono app entry point
│   ├── lib/
│   │   ├── scraper.ts                  # agendae.com.ar scraping (axios + cheerio)
│   │   ├── csv.ts                      # CSV parse/normalize/sort (shared logic)
│   │   ├── storage.ts                  # KV abstraction
│   │   ├── auth.ts                     # Session cookie + secret validation
│   │   └── pdf.ts                      # Server-side PDF proxy (optional, for CORS)
│   ├── data/
│   │   └── tables.ts                   # Table config (from config.txt)
│   ├── routes/
│   │   ├── auth.ts                     # POST /api/auth/login
│   │   ├── tables.ts                   # GET /api/tables, GET /api/tables/:id, POST /api/tables/refresh
│   │   └── pdf.ts                      # POST /api/pdf/generate (CORS proxy)
│   ├── middleware/
│   │   ├── auth.ts                     # Validate session cookie
│   │   ├── cors.ts                     # CORS headers
│   │   └── validation.ts               # Zod schemas
│   ├── scheduled.ts                    # Cron handler (daily scraper)
│   └── types/
│       └── index.ts                    # Worker-specific types
├── wrangler.toml
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

---

### **Phase 0 — Repository Setup (Day 1)** [DONE]
- [ ] **0.1** `cd FoxWeb && npm init -y`
- [ ] **0.2** Install Worker deps:
  ```bash
  npm install hono@^4 cheerio@^1 axios@^1 papaparse@^5 pdf-lib@^1 zod@^3
  npm install -D wrangler@^3 @cloudflare/workers-types@^4 typescript@^5 vitest@^1 @types/papaparse@^5
  ```
- [ ] **0.3** Create `wrangler.toml`:
  ```toml
  name = "foxweb"
  main = "src/index.ts"
  compatibility_date = "2024-11-12"
  compatibility_flags = ["nodejs_compat"]
  
  [vars]
  ENVIRONMENT = "production"
  
  [[kv_namespaces]]
  binding = "TABLES_KV"
  id = "<your-kv-namespace-id>"
  preview_id = "<your-preview-kv-id>"
  
  [triggers]
  crons = ["0 3 * * *"]  # Daily 3 AM UTC
  
  [observability]
  enabled = true
  ```
- [ ] **0.4** Create `tsconfig.json` (Worker):
  ```json
  {
    "compilerOptions": {
      "target": "ES2022",
      "module": "ESNext",
      "moduleResolution": "bundler",
      "lib": ["ES2022"],
      "types": ["@cloudflare/workers-types"],
      "strict": true,
      "noEmit": true,
      "resolveJsonModule": true,
      "isolatedModules": true,
      "esModuleInterop": true
    },
    "include": ["src/**/*"]
  }
  ```
- [ ] **0.5** Set Cloudflare secrets:
  ```bash
  wrangler secret put AGENDAE_USUARIO
  wrangler secret put AGENDAE_PASSWORD
  wrangler secret put AGENDAE_ENTIDAD
  wrangler secret put SESSION_SECRET  # 32+ random chars for cookie signing
  ```
- [ ] **0.6** Initialize frontend:
  ```bash
  cd apps/web
  npm create vite@latest . -- --template react-ts
  npm install
  npm install -D tailwindcss@^3 postcss@^8 autoprefixer@^10
  npx tailwindcss init -p
  npm install zustand@^4 pdf-lib@^1 papaparse@^5 axios@^1
  npm install -D @types/papaparse@^5
  ```

---

### **Phase 1 — Core Data Layer (Days 2–4)**
#### **1.1 Types (shared)**
- [ ] `src/types/index.ts` — `CoefficientRow`, `CoefficientTable`, `TableConfig`, `PDFParams`, `SessionData`
- [ ] `apps/web/src/types/index.ts` — re-export from Worker types (or copy)

#### **1.2 Table Config**
- [ ] `src/data/tables.ts` — Hardcode `TABLES: TableConfig[]` from `TABLAS/config.txt`
  ```ts
  export const TABLES: TableConfig[] = [
    { id: "BCRA_ACT_SUM", name: "BCRA ACT SUM", url: "https://www.agendae.com.ar/listado1.aspx?t=42", folder: "BCRA" },
    { id: "BCRA_ACT_CAP", name: "BCRA ACT CAP", url: "https://www.agendae.com.ar/listado1.aspx?t=43", folder: "BCRA" },
    // ... BNA, NBSF
  ];
  export const RETENCION = 12;
  ```

#### **1.3 CSV Utilities (shared logic)**
- [ ] `src/lib/csv.ts` — Port from `fox.py`:
  - `normalizeNumber(s: string): number`
  - `normalizeDate(s: string): string` (MM/YY)
  - `sortByMonth(rows: CoefficientRow[]): CoefficientRow[]`
  - `parseCSV(text: string): CoefficientTable` (uses `papaparse`)
  - `serializeCSV(table: CoefficientTable): string`

#### **1.4 Scraper**
- [ ] `src/lib/scraper.ts`:
  - `login(session: AxiosInstance): Promise<void>` — POST `_login.aspx` with `accion=LOGIN`, credentials from secrets
  - `fetchTable(session: AxiosInstance, t: number, referer: string): Promise<CoefficientTable>` — POST `_back.aspx`
  - `refreshAllTables(env: Env): Promise<RefreshResult>` — Loop `TABLES`, save to KV with timestamped keys
  - `pruneOldSnapshots(env: Env): Promise<void>` — Keep only `RETENCION` snapshots per table

#### **1.5 KV Storage**
- [ ] `src/lib/storage.ts`:
  - `saveTable(kv: KVNamespace, key: string, table: CoefficientTable): Promise<void>`
  - `getTable(kv: KVNamespace, key: string): Promise<CoefficientTable | null>`
  - `listTableKeys(kv: KVNamespace, prefix: string): Promise<string[]>`
  - `deleteKey(kv: KVNamespace, key: string): Promise<void>`

---

### **Phase 2 — Client-Side PDF Generation (Days 5–6)**
#### **2.1 PDF Layout Spec (match current output exactly)**
| Element | Current (reportlab) | pdf-lib Implementation |
|---------|---------------------|------------------------|
| Page | A4, portrait | `PDFDocument.create()` → `addPage([595.28, 841.89])` |
| Font | Helvetica | Embed `Helvetica` (standard 14 font) |
| Header | Admin / Edificio / Unidad | Three lines, left-aligned, 12pt |
| Table | FECHA | CAPITAL (or PORCENTAJE) | `drawTable()` with headers + rows |
| Totals | "TOTAL" row | Bold, bottom border |
| Colors | Black text, gray headers | RGB(0,0,0) / RGB(128,128,128) |

#### **2.2 Implementation**
- [ ] `apps/web/src/lib/pdf.ts`:
  ```ts
  export async function generateTablePDF(params: PDFParams): Promise<Uint8Array>
  export async function generatePercentPDF(params: PDFParams): Promise<Uint8Array>
  ```
  - Use `pdf-lib` to create document, embed font, draw table with `page.drawText()` + manual layout (or use `pdf-lib-table` helper)
  - Return `Uint8Array` → trigger download via `URL.createObjectURL(blob)`

#### **2.3 Validation**
- [ ] Generate test PDF → compare visually with FoxReloaded output
- [ ] Verify numbers, dates, totals match exactly

---

### **Phase 3 — Worker API (Days 7–8)**
#### **3.1 Router Setup**
- [ ] `src/index.ts` — Hono app with middleware:
  ```ts
  import { Hono } from "hono";
  import { cors } from "hono/cors";
  import { authMiddleware } from "./middleware/auth";
  import authRoutes from "./routes/auth";
  import tableRoutes from "./routes/tables";
  import pdfRoutes from "./routes/pdf";
  
  const app = new Hono<{ Bindings: Env }>();
  app.use("*", cors({ origin: "https://your-pages-domain.pages.dev", credentials: true }));
  app.route("/api/auth", authRoutes);
  app.route("/api/tables", tableRoutes);
  app.route("/api/pdf", pdfRoutes);
  app.get("/api/health", (c) => c.json({ ok: true }));
  
  export default app;
  export { scheduled } from "./scheduled";
  ```

#### **3.2 Auth Routes**
- [ ] `src/routes/auth.ts`:
  - `POST /login` — Validate body `{ usuario, password }` against `env.AGENADE_*` secrets
  - On success: Create session token (JWT or random), set HttpOnly cookie `session=<token>; Secure; SameSite=Lax; Path=/; Max-Age=86400`
  - `POST /logout` — Clear cookie
  - `GET /me` — Return `{ authenticated: true }` if valid cookie

#### **3.3 Table Routes**
- [ ] `src/routes/tables.ts` (all protected by `authMiddleware`):
  - `GET /` — Return `{ tables: TableConfig[] }` (from `data/tables.ts`)
  - `GET /:id` — Fetch from KV: `TABLES_KV.get(id, "json")` → return `CoefficientTable`
  - `POST /refresh` — Call `scraper.refreshAllTables(env)` → return `{ updated: number, errors: string[] }`

#### **3.4 PDF Proxy (Optional — for CORS)**
- [ ] `src/routes/pdf.ts`:
  - `POST /generate` — Accept `PDFParams`, call `pdf-lib` in Worker (if bundle < 1MB), return PDF binary
  - **Note:** If `pdf-lib` bloats Worker, skip this — client generates PDF directly

#### **3.5 Cron Handler**
- [ ] `src/scheduled.ts`:
  ```ts
  export async function scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    const result = await refreshAllTables(env);
    console.log(`[CRON] Scraped ${result.updated} tables, errors: ${result.errors.length}`);
  }
  ```

---

### **Phase 4 — React Frontend (Days 9–15)**
#### **4.1 Zustand Store**
- [ ] `apps/web/src/hooks/useFormStore.ts`:
  ```ts
  interface FormState {
    // Step 1
    rows: Row[];              // { fecha: "MM/YY", capital: number }
    // Step 2
    selectedTableId: string | null;
    admin: string;
    edificio: string;
    unidad: string;
    mode: "tabla" | "porcentaje";
    // Step 3
    pdfBlob: Blob | null;
    // Actions
    setRows: (rows: Row[]) => void;
    addRow: () => void;
    updateRow: (index: number, field: "fecha" | "capital", value: string | number) => void;
    loadCSV: (file: File) => Promise<void>;
    setSelectedTable: (id: string) => void;
    setFormFields: (fields: Partial<FormState>) => void;
    generatePDF: () => Promise<void>;
    reset: () => void;
  }
  ```
  - Persist to `localStorage` via `persist` middleware

#### **4.2 Components**
| Component | Responsibility |
|-----------|----------------|
| `Stepper` | Visual progress: Datos → Opciones → PDF (highlight current) |
| `DataTable` | Editable grid (fecha + capital), add/remove rows, keyboard nav |
| `CSVUpload` | Drag-drop zone → `papaparse` → validate → `store.loadCSV()` |
| `TableSelect` | Dropdown from `/api/tables` → `store.setSelectedTable()` |
| `FormFields` | Admin / Edificio / Unidad inputs + mode radio (Tabla/Porcentaje) |
| `PDFPreview` | `<iframe src={blobUrl}>` + "Descargar PDF" button |

#### **4.3 Pages (Routes)**
- [ ] `DataInput.tsx` — Step 1: `DataTable` + `CSVUpload` + "Continuar"
- [ ] `Options.tsx` — Step 2: `TableSelect` + `FormFields` + "Generar PDF"
- [ ] `PDFPreview.tsx` — Step 3: `PDFPreview` + "Volver" + "Nuevo"

#### **4.4 API Hook**
- [ ] `apps/web/src/hooks/useApi.ts`:
  ```ts
  export function useApi() {
    const base = import.meta.env.VITE_API_BASE || "/api";
    return {
      getTables: () => fetch(`${base}/tables`).then(r => r.json()),
      getTable: (id: string) => fetch(`${base}/tables/${id}`).then(r => r.json()),
      refreshTables: () => fetch(`${base}/tables/refresh`, { method: "POST", credentials: "include" }),
      login: (creds) => fetch(`${base}/auth/login`, { method: "POST", body: JSON.stringify(creds), credentials: "include" }),
    };
  }
  ```

#### **4.5 Routing & Auth Guard**
- [ ] `App.tsx` — React Router v6: `/` → `/data` → `/options` → `/pdf`
- [ ] Redirect to `/login` if no valid session (check `/api/auth/me` on mount)

---

### **Phase 5 — Polish & Deploy (Days 16–18)**
#### **5.1 Frontend Build Config**
- [ ] `apps/web/vite.config.ts`:
  ```ts
  export default defineConfig({
    plugins: [react()],
    build: { outDir: "dist", sourcemap: true },
    server: { proxy: { "/api": "http://localhost:8787" } }, // wrangler dev
  });
  ```
- [ ] `apps/web/tailwind.config.js` — Custom colors matching FoxReloaded (ACCENT `#1565c0`, BG `#f5f5f5`)

#### **5.2 Deploy Workers**
- [ ] `wrangler deploy` → verify at `https://foxweb.your-subdomain.workers.dev`

#### **5.3 Deploy Pages**
- [ ] Connect `FoxWeb/apps/web` to Cloudflare Pages
- [ ] Build command: `npm run build`, Output: `dist`
- [ ] Add environment variable: `VITE_API_BASE = https://foxweb.your-subdomain.workers.dev/api`

#### **5.4 Custom Domain (Optional)**
- [ ] Add `foxweb.yourdomain.com` → Workers + Pages

---

### **Phase 6 — Testing Checklist**
| Test | Method |
|------|--------|
| Scraper works against real `agendae.com.ar` | `wrangler dev` + `curl -X POST http://localhost:8787/api/tables/refresh` |
| CSV upload parses correctly | Drag `BCRA_ACT_CAP.csv` → verify grid populates |
| PDF matches FoxReloaded output | Visual diff (side-by-side) |
| Auth blocks unauthenticated requests | `curl` without cookie → 401 |
| Cron runs daily | Check Workers Logs next day |
| PDF downloads in Chrome/Firefox/Safari | Manual test on each |
| State persists on refresh | Fill form → reload → data intact |

---

### **Environment Variables Reference**
| Variable | Location | Purpose |
|----------|----------|---------|
| `AGENDAE_USUARIO` | Workers Secret | Scraper login |
| `AGENDAE_PASSWORD` | Workers Secret | Scraper login |
| `AGENDAE_ENTIDAD` | Workers Secret | Scraper login |
| `SESSION_SECRET` | Workers Secret | Cookie signing (32+ chars) |
| `TABLES_KV` | KV Binding | Coefficient table storage |
| `VITE_API_BASE` | Pages Env Var | Frontend → Worker API URL |

---

### **Commands Cheatsheet**
```bash
# Local dev (both)
cd FoxWeb
wrangler dev --port 8787          # Terminal 1: Worker on :8787
cd apps/web && npm run dev        # Terminal 2: Vite on :5173 (proxies /api to :8787)

# Test scraper locally
curl -X POST http://localhost:8787/api/tables/refresh \
  -H "Content-Type: application/json" \
  -b cookies.txt -c cookies.txt

# Deploy
wrangler deploy
# Pages: push to GitHub → auto-deploy

# View logs
wrangler tail
```

---

### **Migration Order (Final)**
1. **Phase 0** — Scaffold + secrets (Day 1)
2. **Phase 1** — Types, CSV utils, Scraper, KV (Days 2–4)
3. **Phase 2** — Client PDF generation (Days 5–6)
4. **Phase 3** — Worker API + Cron (Days 7–8)
5. **Phase 4** — React frontend (Days 9–15)
6. **Phase 5** — Deploy + polish (Days 16–18)
7. **Phase 6** — Test + validate (ongoing)

---


## General Instructions

You are responsible for implementing the task above in the existing project.

Your objective is to deliver a working, tested implementation, not merely produce code or describe a solution.

### 1. Understand Before Changing
- Inspect the project structure and relevant source files.
- Understand the existing architecture, coding conventions, dependencies, and application behavior.
- Identify the exact components and functions affected by the requested changes.
- Inspect existing functionality before modifying it.
- Do not assume that a feature is missing without checking first.
- If requirements are ambiguous and the ambiguity could materially affect the implementation, ask for clarification.

### 2. Plan the Implementation
- Determine the smallest reasonable set of changes needed.
- Prefer modifying existing code over replacing entire components.
- Reuse existing functions, callbacks, classes, and utilities whenever appropriate.
- Identify potential side effects and regression risks.
- Keep the implementation consistent with the existing project.

### 3. Implement
- Make the necessary changes directly in the project files.
- Preserve existing functionality unless the task explicitly requires changing it.
- Avoid unrelated refactoring, redesigns, dependencies, and features.
- Do not leave placeholder implementations or nonfunctional controls.
- Handle errors and edge cases appropriately.
- Keep changes focused and maintainable.

### 4. Test
After implementation, test the actual result.

- Run appropriate syntax checks, static checks, and existing tests.
- Run the application or relevant components whenever possible.
- Exercise the newly implemented functionality.
- Test relevant edge cases.
- Check existing functionality that could have been affected.
- Inspect error messages, logs, and unexpected behavior.

A successful syntax check alone does NOT establish that a feature works.

### 5. Diagnose and Fix
If any test fails:
- Investigate the actual cause.
- Inspect the relevant source code and execution output.
- Correct the implementation.
- Repeat the affected tests.
- Check for additional regressions caused by the correction.

Do not stop after the first failed test or merely report that something is broken.

### 6. Verify Completion
Before declaring the task complete, establish that:

- The requested functionality is implemented.
- The application starts successfully, when applicable.
- The new functionality works as intended.
- Relevant existing functionality still works.
- No known errors introduced by your changes remain.
- All modified files are saved.

If a test cannot be performed, explicitly identify it and explain why.

Never claim that something was tested when it was not.

### 7. Change Safety
- Do not delete unrelated files or data.
- Do not overwrite user work unnecessarily.
- Do not introduce destructive database, configuration, or migration changes without approval.
- Preserve working changes when fixing problems.
- Do not conceal errors or silently work around broken functionality.
- Keep modifications within the scope of the task.

### 8. Persistent Execution
This is an ongoing objective, not a one-shot response.

Continue working across subsequent turns until the task is implemented and verified.

- Do not stop after producing a plan.
- Do not stop after writing the initial implementation.
- Do not consider the task complete merely because the code appears correct.
- Recover from ordinary implementation errors and continue.
- If interrupted by context limits or recoverable execution failures, resume from the current project state.
- If genuinely blocked by missing information, unavailable resources, or required user approval, explain the blocker clearly.

### 9. Final Report
Only declare the goal achieved after completing the verification process.

Report:
1. What was implemented.
2. Which files were modified.
3. Which tests were performed and their results.
4. Any limitations or unverified behavior.
5. Any remaining issues.

**Definition of DONE: The requested functionality works, relevant existing functionality remains intact, and the result has been verified to the extent technically possible.**