# PREFLIGHT — foxweb

**Where the code lives:** `legacy/foxweb` → a directory in this workspace (`D:\Tools\WebDev\Omniroute\FoxWeb`). Standalone repository, not a slice of a larger codebase.

---

## Answers (Check 0 — from the human)

| # | Question | Answer |
|---|----------|--------|
| 1 | Scope | Complete system |
| 2 | Build & test locally | No / Don't know (haven't tried) |
| 3 | Bespoke build infrastructure | No, standard npm/Vite |
| 4 | Prior attempts | Yes, tried before (reason unknown) |
| 5 | Off limits | Nothing off limits |

---

## Check 1 — Detect the stack

FoxWeb is a TypeScript/React frontend with Cloudflare Workers Functions backend.

**File inventory (excluding node_modules, .git, .wrangler):**

| Type | Count | Examples |
|------|-------|----------|
| TypeScript (.ts) | 18 | `src/index.ts`, `src/lib/*.ts`, `src/App.tsx`, etc. |
| TypeScript React (.tsx) | 11 | `src/App.tsx`, `src/pages/*.tsx`, `src/components/*.tsx` |
| JSON | 4 | `package.json`, `tsconfig.json`, `postcss.config.js`, etc. |
| Markdown (.md) | 2 | `README.md`, `DEPLOY.md` |
| JavaScript (.js) | 2 | Misc config |
| TOML | 1 | `wrangler.toml` |
| SQL | 1 | `src/schema.sql` |
| HTML | 1 | `apps/web/index.html` |
| SVG | 1 | `apps/web/public/favicon.svg` |
| CSS | 1 | `apps/web/src/index.css` |

**Build & deployment:**
- Build tool: Vite (`vite build`, output to `dist/`)
- CSS framework: Tailwind CSS v4 via PostCSS
- Frontend framework: React 18 + React Router DOM 6
- Backend: Cloudflare Workers Functions (`src/index.ts` entry, `functions/api/` routes)
- Wrangler config: `wrangler.toml` with KV namespaces (TABLE_CONFIG, TABLE_CSVS, FOX_SESSIONS) and D1 database (FOX_DB)
- Secrets: AGENDAE_USUARIO, AGENDAE_PASSWORD, AGENDAE_URL (set via `wrangler secret put`)

---

## Check 2 — Analysis tooling

| Tool | Used by | Status | Without it |
|------|---------|--------|------------|
| `scc` (or `cloc`) | assess | NOT FOUND | LOC/complexity fall back to `find` + `wc`; COCOMO index coarser |
| `python3` (3.8+) | map, extract-rules, verify, report | Found: Python 3.14.10 | Dependency scripts, proof scripts, HTML report can't run |
| `lizard` | assess --portfolio | NOT FOUND | Complexity estimated from decision-keyword counts |
| `npm` | build | Found: 11.20.0 | Can't install dependencies |
| `node` | build | Found: v26.12.1 | Can't run JS toolchain |
| `npx` | build | Found: 11.20.0 | Can't run one-off tools |
| `wrangler` | deploy | NOT FOUND (but `pnpm dlx wrangler` works) | Can't deploy directly |

Install one-liners:
- `scc`: `npm install -g scc` (or `choco install scc` on Windows)
- `cloc`: `npm install -g cloc` (or `choco install cloc`)
- `lizard`: `pip install lizard`
- `wrangler`: `npm install -g wrangler` (or use `pnpm dlx wrangler`)

---

## Check 3 — Build toolchain

**Build definition:** `package.json` at project root has `"build": "vite build"`. Vite config in `vite.config.ts` (`root: "."`, `outDir: "dist"`). No CI pipeline definition found (no `.github/workflows/`, no `azure-pipelines.yml`, etc. — deployment is manual via `wrangler deploy` or Cloudflare Pages auto-deploy from GitHub).

**Smoke test — Level 1 (syntax compile):** Could not run `tsc --noEmit` due to missing node_modules.

**Smoke test — Level 2 (full build): FAILED.** `npm install` fails with ERESOLVE:

```
npm error ERESOLVE unable to resolve dependency tree
npm error Found: react@19.3.1
npm error   react@"^19.0.0" from the root project
npm error
npm error Could not resolve dependency:
npm error peer react@"^16.5.1 || ^17.0.0 || ^18.0.0" from lucide-react@0.344.0
npm error   lucide-react@"^0.344.0" from the root project
```

**Root cause:** `react@^19.0.0` in dependencies conflicts with `lucide-react@^0.344.0` which requires `react@"^16.5.1 || ^17.0.0 || ^18.0.0"`. No `package-lock.json` exists at root or `apps/web/`, so there's no pinned dependency tree to fall back on.

**Build toolchain verdict:** BROKEN — cannot install dependencies, cannot build. This is a blocker for `transform`/`reimagine` work.

---

## Check 4 — Source completeness

**Referenced-but-missing imports:** None found. All imports resolve within `src/`:
- `src/index.ts` imports `./lib/health` ✓ (exists)
- `src/App.tsx` imports `./pages/Home`, `./pages/DataEditor`, `./pages/ScraperConfig`, `./pages/Wizard`, `./pages/PdfResult` ✓ (all exist)
- `src/App.tsx` imports `react-router-dom` ✓ (declared dependency)

**Deployment & config descriptors:**
- `wrangler.toml` — KV namespaces and D1 database bindings (commented out with placeholder IDs)
- `tsconfig.json` — TypeScript config, strict mode, ESNext modules
- `vite.config.ts` — Vite build config, React plugin, API proxy to localhost:8787
- `package.json` — npm scripts, dependencies

**Data definitions:**
- `src/schema.sql` — D1 schema for `input_rows` table (date, capital columns)

**Binary-only artifacts:** None found.

**No lockfile:** No `package-lock.json` at root or `apps/web/`. No `pnpm-lock.yaml` either (root ones were removed during cleanup).

---

## Check 5 — Optional context

| Item | Status |
|------|--------|
| Production telemetry | No APM MCP server connected; no production telemetry configured |
| Version control | Git repository present with history |

---

## Check 6 — Scope boundary

**Standalone repository** — user confirmed this is the complete system, nothing outside depends on it, nothing inside depends on outside.

---

## Check 7 — Source protection

**Project `.claude/settings.json`:** Exists. Contains only `permissions.allow` rules:
- `Bash(Get-ChildItem *)`
- `Bash(Get-Content *)`

No `permissions.deny` rules covering `legacy/foxweb/` (the project root itself). User-level `~/.claude/settings.json` not found (only profile-specific settings files under `C:\Users\ficus\.claude\profiles\*`).

**Status:** ✅ — No permission rules block edits under `legacy/foxweb/`. A permission rule covers Claude's file tools and shell commands it recognizes, not scripts that open files themselves. The hard guarantee is the OS: read-only mount or sandbox would block writes, none detected.

---

## Readiness verdict

| Command | Verdict | Notes |
|---------|---------|-------|
| `assess` | ⚠️ Ready-with-gaps | `scc`/`cloc` missing; LOC/complexity via `find`+`wc` fallback |
| `map` | ⚠️ Ready-with-gaps | `python3` present; dependency scripts should run |
| `extract-rules` | ⚠️ Ready-with-gaps | `python3` present |
| `review` | ✅ Ready | Human judgement only; no tooling needed |
| `brief` | ⚠️ Ready-with-gaps | Needs discovery artifacts (this preflight) |
| `transform` / `reimagine` | ❌ Not ready | Build toolchain broken (npm install fails — react/lucide-react version conflict). Fix dependency conflict first. |
| `verify` | ⚠️ Ready-with-gaps | `python3` present for proof scripts |
| `harden` | ⚠️ Ready-with-gaps | `python3` present; no stack-specific SAST tooling detected |

---

## Most important fix

**Build toolchain is broken.** `npm install` fails with ERESOLVE because `react@^19.0.0` conflicts with `lucide-react@^0.344.0` which requires react ^16-^18. No lockfile exists to pin a working dependency tree.

**Fix:** Downgrade `react`/`react-dom` to `^18.3.1` (compatible with lucide-react@0.344.0). This has been done in `package.json`. Then:
1. Run `npm install` to generate `package-lock.json`
2. Verify `npm run build` passes

---

## Next step

Fix the dependency conflict (downgrade react to ^18.3.1 — already done in package.json), then run `npm install` to generate the lockfile and verify `vite build` passes. Then:

`/code-modernization:modernize-assess foxweb` — after the build toolchain is fixed, or proceed anyway with gaps noted.
