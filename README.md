# דרושים למורים (drushimorim) — Project Summary

**A two-sided job board for the Israeli education sector.** Institutions (מוסדות חינוך) post teaching jobs; teachers build a profile once and apply with one click. Hebrew, RTL, mobile-friendly. Built as a solo-founder-style MVP from a PRD/tech-doc/backlog, deployed to production, then extended with Google sign-in and exact-city location search.

This document (`README.md`) is the project's top-level summary. It lives **inside the code repo** at `/Users/yaniv/projects/drushimorim` — code and docs are one folder, so this summary stays in sync with the code.

---

## Where things live

| What | Where |
|---|---|
| **Live site (production)** | https://teachers-job-board-six.vercel.app |
| **Source code (this repo)** | `/Users/yaniv/projects/drushimorim` (git repo — code + docs together) |
| **GitHub** | `git@github.com:gogo123477/teachers-job-board.git` (push via SSH; `main` auto-deploys to Vercel). *Note: the local folder is `drushimorim`, but the GitHub repo and Vercel project are still named `teachers-job-board` — internal labels, unchanged.* |
| **In-repo agent guide** | `AGENTS.md` in this repo (also loaded via `CLAUDE.md`) — condensed version of this summary that an assistant auto-reads |
| **Planning docs** | `/Users/yaniv/Library/Application Support/Claude/local-agent-mode-sessions/b282cdd6-1671-435e-8183-75bb50b0e106/171cbf0b-34fa-4a7a-a925-848ecd64b474/local_6bde6991-8030-46d5-8752-d1328f9b2107/outputs/teachers-job-board/` — prd.md, mismach_techni.md, backlog.md, tochnit_avoda.md, qa_checklist.md |
| **Hosting** | Vercel (app), Neon (Postgres), Vercel Blob (file uploads), Google Cloud (OAuth) |

---

## Status

**MVP complete and live.** All 40 backlog tasks (Epics 0–6) done, QA'd, deployed. A "warm & friendly" design pass is done. Two features were added beyond the original backlog:

1. **Google sign-in** (with an onboarding role-picker for new Google users)
2. **Exact-city locations** with typeahead autocomplete (replacing the original broad "regions")

Plus small polish: **loading spinners** on the sign-in / register / Google buttons.

---

## Tech stack

- **Next.js 16** (App Router, Turbopack, React Server Components + Server Actions)
- **React 19**, **TypeScript**
- **Tailwind CSS v4**
- **shadcn/ui "base-nova" style** built on **@base-ui/react** (NOT Radix — this trips up assumptions)
- **Prisma 7** + **Neon Postgres**
- **Auth.js v5** (`next-auth@5.0.0-beta.31`) — Credentials + Google, JWT sessions
- **Vercel Blob** for logo / CV uploads
- **Zod** for validation
- **Heebo** font, `dir="rtl"` throughout

---

## What the app does (features)

**Institutions can:**
- Register / log in (email+password or Google)
- Build an institution profile (name, type, city, contact, description, logo)
- Post, edit, and close job listings
- See applicants for their own jobs, and view an applicant's teacher profile (only after they applied)
- Update application statuses (נצפה / בתהליך / נדחה / התקבל)

**Teachers can:**
- Register / log in (email+password or Google)
- Build a teacher profile once (name, subjects, education stages, preferred cities, bio, CV file)
- Search & filter public jobs (free text + subject + stage + city + scope)
- Apply to jobs (one-time per job, enforced); track their applications

**Admins can:**
- Moderate job postings (approve / reject / remove)
- Block users
- (Admin accounts are created only by manual DB update — by design, no UI signup)

**Cross-cutting:**
- Privacy rule: a teacher's profile is visible to an institution only after the teacher applied to one of that institution's jobs (enforced server-side; 404 otherwise)
- Rate limiting on public forms (register / create job / apply)
- Custom Hebrew 404 and error pages, empty states with CTAs

---

## Data model (`prisma/schema.prisma`)

- **User** — email (unique), `password_hash` (**nullable** — Google-only accounts have none), `role` enum (institution / teacher / admin), `is_active` (block flag).
- **Institution** — 1:1 User. name, institution_type, **city**, contact_name, description, logo_url, is_verified, plan (monetization stub).
- **Teacher** — 1:1 User. full_name, subjects[], education_stages[], **preferred_cities[]**, bio, cv_url, is_searchable (privacy default false).
- **JobPosting** — belongs to Institution. title, subject, education_stage, scope, **city**, description, status (draft/published/closed), moderation_status (pending/approved/rejected), is_promoted (stub).
- **Application** — JobPosting × Teacher (unique). status enum mapped to Hebrew DB values (נצפה/בתהליך/נדחה/התקבל), message.

Taxonomy values (subjects, education stages, job scopes, institution types) are stored as Strings; the single source of truth is `src/lib/taxonomy.ts`, enforced by Zod.

**Cities:** `src/lib/cities.ts` holds 1,306 official Israeli localities pulled from the CBS dataset (data.gov.il, resource `5c78e9fa-c2e2-4771-93ff-7f400a12f7ba`). Used for autocomplete (`src/components/city-combobox.tsx` — `CityCombobox` single-select + `CityMultiCombobox` multi-select with chips, both built on Base UI Combobox) and for server-side validation (`isCity()`).

---

## Authentication

- **Email + password** (bcryptjs, cost 12) and **Google OAuth** ("המשך עם Google" on /login and /register).
- **Google flow:** an existing email signs into that account; a brand-new Google email gets a session with no role → `proxy.ts` redirects them to `/onboarding` (role picker מורה/מוסד) → `unstable_update` (exported as `update`) refreshes the JWT with the chosen role.
- **JWT sessions**; `role` is carried in the token. `session.user.role` may be **undefined** (pre-onboarding), so every role check must handle that.
- **Route guards** in `src/proxy.ts` (Next.js 16's renamed middleware): `/admin` (admin only), `/dashboard` (logged in), and any roleless user is forced to `/onboarding`. The matcher covers nearly all routes.
- Login/register server actions use `signIn(..., { redirect: false })` + a manual `redirect("/")` — the `redirectTo` variant routes through `/api/auth/callback` and behaved worse.
- `/api/auth/[...nextauth]/route.ts` pins `runtime = "nodejs"`.

---

## Environment variables

Values live in the Vercel dashboard and in the local `.env` — **never committed**.

| Name | Purpose |
|---|---|
| `DATABASE_URL` | Neon Postgres (shared between local dev and production) |
| `AUTH_SECRET` | Auth.js JWT signing. **If missing, the whole site 500s** with "server configuration" errors and anonymous users get bogus redirects. Changing it logs everyone out. |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google OAuth (auto-inferred by Auth.js from these exact names). |
| `BLOB_READ_WRITE_TOKEN` / `BLOB_STORE_ID` | Vercel Blob |

**Do NOT set `AUTH_URL`** — it's unnecessary (`trustHost: true` is set) and caused problems during setup.

**Google Cloud setup:** project "account" → OAuth client **"teacher board web"** of type **Web application** (Client ID starts `797189369062-u5vev8uf…`). A separate old **Desktop**-type client exists and is unused — Desktop clients don't support redirect URIs, which caused an early `redirect_uri_mismatch`. Authorized redirect URIs registered: `http://localhost:3000/api/auth/callback/google` and `https://teachers-job-board-six.vercel.app/api/auth/callback/google`. The consent screen is in **Testing** mode (only added test users can Google-sign-in until "Publish App" is clicked — basic login scopes need no Google review).

> **Google sign-in only works from the production domain or localhost**, NOT from Vercel *preview* deployment URLs (`teachers-job-board-<hash>-yaniv5.vercel.app`) — those change every deploy and can't be registered as redirect URIs. Symptom if you test from a preview URL: `Error 400: redirect_uri_mismatch`.

---

## Seed / test accounts

All seeded accounts use password `password123`:

- `admin@seed.local` (admin)
- `school-a@seed.local`, `school-b@seed.local`, `school-c@seed.local` (institutions)
- `teacher-a@seed.local` … `teacher-d@seed.local` (teachers)

Real content added: institution **"פסגת אמיר"** (`pisgatamir18@gmail.com`, **no password — Google sign-in only**, city חריש) with two published+approved jobs whose descriptions carry the real contact details. Seed script: `prisma/seed.ts` (`npm run seed`).

---

## ⚠️ Critical gotchas (learned the hard way)

- **Shared database:** local dev and production point at the **same Neon DB**. Data changes locally are instantly live in prod. **Schema migrations break the deployed code until the new code deploys** — the region→city column rename took production `/jobs` down for ~25 minutes. For future migrations on live data, deploy code before destructive renames (expand-contract) or accept brief downtime knowingly.
- **Migrations:** write SQL by hand in `prisma/migrations/<timestamp>_name/migration.sql` (RENAME COLUMN preserves data) and apply with `npx prisma migrate deploy` (`prisma migrate dev` needs an interactive terminal, which isn't available here). Neon sometimes drops the first connection — retry.
- **Prisma 7** requires an explicit driver adapter: `new PrismaClient({ adapter: new PrismaPg({ connectionString }) })`. Config lives in `prisma.config.ts`. Generated client goes to `src/generated/prisma` (gitignored; `postinstall: prisma generate` handles Vercel builds).
- **Next.js 16 middleware is `src/proxy.ts`** (renamed) and runs on Edge — it must NOT import Prisma. Auth config is split: `src/auth.config.ts` (edge-safe: callbacks, session strategy, `trustHost`, no providers) vs `src/auth.ts` (full: providers + Prisma). `proxy.ts` uses only `auth.config.ts`.
- **JWT type augmentation** must target `declare module "@auth/core/jwt"` (NOT `"next-auth/jwt"`).
- **Base UI Button** needs explicit `type="submit"` in forms (defaults to `type="button"`) and `nativeButton={false}` when using `render={<Link/>}`.
- **Base UI Select** `SelectValue` doesn't map value→label; needs a function-as-children render prop, which can't cross the Server→Client boundary → extract to a Client Component.
- **Tailwind v4 layering:** unlayered CSS beats ALL layered utilities. Global element rules (e.g. `a { color: inherit }`) must go inside `@layer base`, or they silently override utility classes site-wide.
- **Optional chaining:** `session?.user.role` crashes if `session` is truthy but `user` is undefined — always `session?.user?.role`. This took production down twice (home page, then `proxy.ts`).
- **Env-loading for one-off scripts:** `set -a && source .env && set +a && npx tsx script.ts`.
- **Testing selects/buttons via preview tools** can be click-flaky; mark targets with `data-test-target` and drive via JS `element.click()` / `form.requestSubmit()`. Careful: `document.querySelector('form')` finds the header logout form first.

---

## Conventions

- Server Actions + `useActionState` for all forms; actions validate with Zod, check session role + ownership, return `{error}` / `{success}` state objects.
- Commit style: conventional-ish (`fix:`, `feat:`), Hebrew comments where domain-specific. Pushing to `main` deploys production.
- Verify in a real browser (dev server + seed logins) before pushing; also verify production with `curl` after deploy.

---

## Known limitations

- Dark-mode CSS variables exist but there's no toggle.
- Email notifications (backlog 6.5) intentionally skipped — candidate: Resend/Postmark.
- Text search is Prisma `contains`, not Postgres full-text.
- Rate limiter is an in-memory Map (per serverless instance, best-effort).

---

## Session timeline (what happened, in order)

1. **Built the full MVP** — Epics 0–6, 40 tasks: infra/DB, auth, profiles, jobs CRUD, applications, admin moderation, polish. Committed per unit of work; pushed to GitHub (ultimately via SSH after PAT troubles); deployed to Vercel with Neon + Blob.
2. **Design pass** — "warm & friendly" palette; caught a site-wide button-text-color bug caused by an unlayered `a { color: inherit }` CSS rule.
3. **QA** — documented in `qa_checklist.md`; numerous real bugs found and fixed.
4. **Critical auth bug** — after login, users still saw logged-out UI. Root cause turned out to be a **missing `AUTH_SECRET`** in Vercel Production (plus needing `runtime = "nodejs"` on the auth route and a cleaner `redirect:false` sign-in). Fixed; verified end-to-end on production.
5. **Google sign-in** — added Google provider, an `/onboarding` role-picker for new Google users, made `password_hash` nullable, guarded all `role` accesses. Set up the Google Cloud OAuth client (had to recreate it as **Web application** type, not Desktop). Debugged `redirect_uri_mismatch` (preview-URL issue) and `invalid_client` (secret paste issue).
6. **Parsed a job ad from an image** and created the "פסגת אמיר" institution + two live vacancies from it.
7. **Exact-city locations** — replaced broad "regions" with the 1,306-city CBS list + autocomplete comboboxes; migrated the DB columns (`region`→`city`, `preferred_regions`→`preferred_cities`) with a data-preserving RENAME migration; wired it into all forms, the public filter, and displays.
8. **Loading spinners** — added to the Google button (which previously had zero feedback on click) and the login/register submit buttons.
9. **Documentation** — wrote the in-repo `AGENTS.md` summary, and this `drushimorim/README.md`.

---

## Discussed future directions (not yet built)

1. **Import / scraping jobs from other sites** — safest sources are government/municipal (public data); avoid commercial boards and Facebook (ToS/copyright). Shape: scheduled scraper → LLM normalization into the existing taxonomy → dedupe → land in the existing moderation queue with an `imported` flag + source link, no in-app apply. ~2–4 days.
2. **Free-text chat search for teachers** — a Hebrew sentence ("מורה למתמטיקה מחדרה, חצי משרה בחטיבת ביניים") → Claude Haiku 4.5 extracts structured filters (subject / city / scope / stage) → runs the existing search. ~1 day; ~$0.002/query with prompt caching. Don't send the 1,306-city list to the model — let it output the city name and fuzzy-match against `CITIES` in code; cap `max_tokens` ~300. Needs an `ANTHROPIC_API_KEY`. **User's preferred order: chat search first, then the scraper** — the free-text→taxonomy extraction logic is shared between the two.
