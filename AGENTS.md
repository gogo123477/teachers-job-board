<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# דרושים למורים — Teachers Job Board

Two-sided job board for the Israeli education sector: institutions (מוסדות חינוך) post teaching jobs, teachers build a profile and apply. Hebrew, RTL, mobile-friendly.

- **Production:** https://teachers-job-board-six.vercel.app (Vercel, auto-deploys from `main`)
- **GitHub:** git@github.com:gogo123477/teachers-job-board.git (push via SSH)
- **Planning docs** (PRD, tech doc, backlog, work plan, QA checklist): `/Users/yaniv/Library/Application Support/Claude/local-agent-mode-sessions/b282cdd6-1671-435e-8183-75bb50b0e106/171cbf0b-34fa-4a7a-a925-848ecd64b474/local_6bde6991-8030-46d5-8752-d1328f9b2107/outputs/teachers-job-board/` (prd.md, mismach_techni.md, backlog.md, tochnit_avoda.md, qa_checklist.md)
- **Status:** MVP complete — all 40 backlog tasks (Epics 0–6) done, deployed, QA'd. Design pass done ("warm & friendly" palette). Extras beyond backlog: Google sign-in, exact-city locations with autocomplete.

## Stack

Next.js 16 (App Router, Turbopack, RSC + Server Actions), React 19, TypeScript, Tailwind CSS v4, shadcn/ui "base-nova" style built on **@base-ui/react** (NOT Radix), Prisma 7, Neon Postgres, Auth.js v5 (next-auth@5.0.0-beta.31), Vercel Blob (file uploads), Zod validation, Heebo font, `dir="rtl"`.

## Critical gotchas (learned the hard way)

- **Prisma 7** requires an explicit driver adapter: `new PrismaClient({ adapter: new PrismaPg({ connectionString }) })`. Config lives in `prisma.config.ts` (not package.json). Generated client outputs to `src/generated/prisma` (gitignored — `postinstall: prisma generate` handles Vercel builds).
- **Next.js 16 middleware is `src/proxy.ts`** (renamed from middleware.ts) and runs on Edge. It must NOT import Prisma → auth config is split: `src/auth.config.ts` (edge-safe: callbacks, session strategy, `trustHost: true`, no providers) and `src/auth.ts` (full: Credentials + Google providers, Prisma). proxy.ts uses only auth.config.ts.
- **JWT type augmentation** must target `declare module "@auth/core/jwt"` (NOT "next-auth/jwt") — see `src/types/next-auth.d.ts`.
- **Base UI Button**: needs explicit `type="submit"` in forms (defaults to type="button") and `nativeButton={false}` when using `render={<Link/>}`.
- **Base UI Select**: `SelectValue` doesn't map value→label; needs function-as-children render prop, which can't cross the Server→Client boundary — extract into a Client Component.
- **Tailwind v4 layering**: unlayered CSS beats ALL layered utilities. Global element rules (e.g. `a { color: inherit }`) must go inside `@layer base` or they silently override utility classes site-wide.
- **Optional chaining**: `session?.user.role` crashes if `session` is truthy but `user` undefined — always `session?.user?.role`. This took production down twice (home page, then proxy.ts).
- **`npm run seed`** = `tsx prisma/seed.ts`; one-off DB scripts need env loaded manually: `set -a && source .env && set +a && npx tsx script.ts`.
- **Testing selects/buttons via preview tools**: clicks can be flaky; mark targets with `data-test-target` attributes and use `element.click()` / `form.requestSubmit()` via JS eval. Careful: `document.querySelector('form')` finds the header logout form first.

## ⚠️ Shared database

Local dev and production use the **same Neon database** (same `DATABASE_URL` in local `.env` and Vercel). Consequences:
- Data changes made locally are instantly live in production.
- **Schema migrations break the deployed code until the new code deploys.** The region→city column rename took production `/jobs` down for ~25 min. For future migrations on live data: deploy code before destructive renames (expand-contract), or accept brief downtime knowingly.
- Migrations: write SQL manually in `prisma/migrations/<timestamp>_name/migration.sql` (RENAME COLUMN preserves data) and apply with `npx prisma migrate deploy` (`prisma migrate dev` needs an interactive terminal). Neon sometimes drops the first connection — retry.

## Data model (prisma/schema.prisma)

- **User**: email (unique), password_hash (**nullable** — Google-only accounts have none), role enum (institution/teacher/admin), is_active (admin can block).
- **Institution**: 1:1 User. name, institution_type, **city**, contact_name, description, logo_url (Vercel Blob), is_verified, plan (monetization stub).
- **Teacher**: 1:1 User. full_name, subjects[], education_stages[], **preferred_cities[]**, bio, cv_url (Vercel Blob), is_searchable (privacy: default false).
- **JobPosting**: belongs to Institution. title, subject, education_stage, scope, **city**, description, status (draft/published/closed), moderation_status (pending/approved/rejected), is_promoted (stub).
- **Application**: JobPosting×Teacher unique. status enum mapped to Hebrew DB values (נצפה/בתהליך/נדחה/התקבל), message.
- Taxonomy values (subjects, stages, scopes, institution types) are Strings in DB; single source of truth `src/lib/taxonomy.ts`, enforced by Zod.
- **Cities**: `src/lib/cities.ts` — 1,306 official Israeli localities from CBS (data.gov.il dataset 5c78e9fa-c2e2-4771-93ff-7f400a12f7ba), used for autocomplete (`src/components/city-combobox.tsx`, Base UI Combobox: single `CityCombobox` + multi-with-chips `CityMultiCombobox`) and server validation (`isCity()`).

## Auth

- **Email+password** (bcryptjs, cost 12) and **Google OAuth** ("המשך עם Google" on /login and /register).
- Google flow: existing email → signs into that account; new email → session without role → proxy.ts redirects to `/onboarding` (role picker: מורה/מוסד) → `unstable_update` (exported as `update`) refreshes the JWT.
- JWT sessions; `role` carried in token. `session.user.role` may be **undefined** (pre-onboarding) — all role checks must handle it.
- Route guards in proxy.ts: /admin (admin only), /dashboard (logged in), roleless users forced to /onboarding (matcher covers nearly all routes).
- Login/register server actions use `signIn(..., { redirect: false })` + manual `redirect("/")` — the `redirectTo` variant routes through /api/auth/callback and behaved worse.
- `/api/auth/[...nextauth]/route.ts` pins `runtime = "nodejs"`.
- Admin accounts are created only by manual DB update (by design).

## Environment variables (values in Vercel dashboard + local `.env` — never commit)

| Name | Purpose |
|---|---|
| DATABASE_URL | Neon Postgres (shared local+prod) |
| AUTH_SECRET | Auth.js JWT signing. **If missing, the whole site 500s with "server configuration" errors and anonymous users get bogus redirects.** Changing it logs everyone out. |
| AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET | Google OAuth (auto-inferred by Auth.js). Google Cloud console → project "account" → client "teacher board web" (**Web application** type — the Desktop type doesn't support redirect URIs). Redirect URIs registered for localhost:3000 and the prod domain. |
| BLOB_READ_WRITE_TOKEN / BLOB_STORE_ID | Vercel Blob |

Do NOT set AUTH_URL — it's unnecessary (trustHost) and caused problems. Google consent screen is in **Testing** mode: only test users can Google-sign-in until "Publish App" is clicked (basic scopes need no review).

## Seed / test accounts (all password `password123`)

- admin@seed.local (admin) · school-a/b/c@seed.local (institutions) · teacher-a/b/c/d@seed.local (teachers)
- Real content: institution "פסגת אמיר" (pisgatamir18@gmail.com, **no password — Google sign-in only**, city חריש) with 2 published+approved jobs, contact details in description.

## Conventions

- Server Actions + `useActionState` for all forms; actions validate with Zod, check session role + ownership, return `{error}` / `{success}` state objects.
- Privacy rule: teacher profile visible to an institution only after the teacher applied to one of its jobs (enforced server-side, 404 otherwise).
- Rate limiting: in-memory Map (`src/lib/rate-limit.ts`) on register/createJob/applyToJob — best-effort on serverless.
- Commit style: conventional-ish (`fix:`, `feat:`), Hebrew comments in code where domain-specific. Push to `main` deploys production.
- Verify in a real browser (dev server via preview tools, seed logins) before pushing; also verify production with curl after deploy.

## Known limitations

- Dark mode CSS vars exist but no toggle. Email notifications (backlog 6.5) intentionally skipped — candidate: Resend/Postmark. Text search is Prisma `contains`, not full-text. Rate limiter is per-instance.

## Discussed future directions (not built)

1. **Import/scraping jobs from other sites** — safest sources: government/municipal (public data); avoid commercial boards & Facebook (ToS). Shape: scheduled scraper → LLM normalization into taxonomy → dedupe → existing moderation queue, `imported` flag + source link, no in-app apply. ~2–4 days.
2. **Free-text chat search for teachers** — Hebrew sentence → Claude Haiku 4.5 extracts filters (subject/city/scope/stage) → existing search. ~1 day, ~$0.002/query (cache system prompt; don't send city list to the model — fuzzy-match output against CITIES in code; cap max_tokens ~300). Needs ANTHROPIC_API_KEY. User's preferred order: chat search first, then scraper (extraction logic is shared).
