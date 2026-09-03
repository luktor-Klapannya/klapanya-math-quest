# Game V1 hosted staging runbook

Repository: `D:\โรงเรียน\วิชาการ\2569\E-learning-game`.
Status: **NOT EXECUTED ON HOSTED STAGING**. No Supabase URL/key, designated project IDs or five real test-account credentials were available in this task. No external changes were made. Local fixtures never count as real-auth or multi-device evidence.

## 1. Release boundary and outstanding gates

V1 home now reads persisted, RLS-scoped game data. The teacher/admin real path does not invoke the seeded assignment/report service. Student resume means returning to the campaign map with the saved profile; it does not restore an unfinished timed question/session. Latest results survive reload once the evidence outbox has uploaded them. Pending uploads cannot appear on another device until received by the server.

Campaign checkpoints remain **client-reported continuity data**. Normal Dojo D1–D6 now has a concrete trusted API/replay path. The server issues a stable run definition, resolves Auth to the active learner, validates the canonical base sequence and permitted remediation insertions, derives correctness from the canonical options, and uses the unchanged economy/mastery helpers. It preserves BattleScreen's 80% completion threshold, zero wrong-answer rewards, D1 gear and App progression transitions; it does not substitute the different thresholds in content metadata. Result means correct count/accuracy plus the existing XP/coins, not a newly invented point formula.

Only VERIFIED sessions with a matching `game_session_results` row enter teacher metrics. Teacher views no longer fall back to unverified submitted results or checkpoint mastery. The overview distinguishes server-issued Started runs, attempted unfinished runs, and completed verified rounds. These student counts can overlap across different runs; completed rounds are not campaign completion. Last played is the server lifecycle timestamp. Old submitted evidence remains unverified; it is not automatically regraded/imported.

The verifier accepts response-time and hint-use telemetry as inputs and recomputes rewards; it never accepts final score/correctness/reward totals. Finite integer time, option IDs, hint levels and full sequence are validated. This does not prove client-side timing or aid use against a modified client, and the public game bundle contains its canonical content. Do not represent these learning-game results as a tamper-proof ranked exam. The dedicated Shrine/Gateway/Boss/Trial/drill engines are not promoted through the normal Dojo verifier; their formulas and evidence paths remain unchanged. Broader mode certification requires separate reviewed adapters. The normal Dojo result screen waits for a persisted verified receipt, with a retryable owner outbox when offline.

No new Territory, Game Factory, School modules or frozen gameplay changes are part of this sprint. No production deployment is authorized.

## 2. Migration manifest and seed safety

Apply each unapplied migration once, in this exact order, to a separately identified staging project. Use the hosted SQL editor or the project's reviewed migration mechanism. Inspect the actual migration history first; never replay already-applied 007–009.

| File | Dependency / effect |
| --- | --- |
| 001_auth_profiles.sql | Supabase `auth.users`, UUID generation; creates game profiles |
| 002_roles_permissions.sql | Reference role/permission catalogs; these are not demo identities |
| 003_memberships_enrollments.sql | Profiles/roles; organizations, memberships, enrollments, teacher assignments; includes default game organization metadata |
| 004_rls_policies.sql | 001–003; initial policies/helpers subsequently hardened by 007 |
| 005_seed_dev.sql | Reserved historical number; now a no-op, no demo-user inserts |
| 006_arena_realtime.sql | Profiles/classroom structures; Arena tables and publication membership |
| 007_game_identity_persistence.sql | 001–006; checkpoint/evidence/verified tables, scoped RLS, atomic trusted commit |
| 008_game_arena_security.sql | 006–007; room/answer isolation and sanitized RPCs; preflight rejects legacy room hosts outside year 2569 |
| 009_game_arena_submission.sql | 006–008; participant-after snapshot and service-only atomic Arena answer commit |
| 010_game_campaign_verification.sql | 007–009; campaign lifecycle table, scoped reads, service-only start/atomic finish and owner-only activity touch |

The former 005 fixture is `supabase/seeds/development.sql`. It requires `game.allow_development_seed=LOCAL_DISPOSABLE_ONLY`, set only by the in-memory SQL test runner. Do not set it on hosted databases. Ordinary migration application creates no demo profiles. Existing databases that previously applied the old 005 retain those records: review their memberships and Auth links explicitly; this sprint performs no deletion or silent migration-history repair. Record the old/new 005 checksum in the change review. Do not rerun 005 to clean data.

Before applying staging migrations, execute `supabase/review/game-foundation-preflight.sql` where the referenced tables exist. Review unlinked profiles, membership/scope mismatches, existing policies, historic academic years and Arena consistency. Also inspect known demo IDs/codes (PROF001, G6001, G6002, REV001, ADM001). Unlinked demo profiles are not valid authenticated identities. Resolve existing linked demo/admin records through a reviewed forward fix, not an automated deletion.

After migrations, inspect `pg_policies` for every public game table and `pg_proc.proacl` for write RPCs. Students/teachers/admins must not execute `commit_verified_game_result`, `commit_game_arena_answer`, `open_game_campaign_run` or `finish_game_campaign_run`. Only the trusted service actor may execute them. No service key may enter browser configuration. Ordinary owner writes go through `save_game_checkpoint`, legacy `submit_game_evidence`, `touch_game_campaign_run` and the scoped Arena join RPC. Direct evidence/reward mutation must remain denied. Normal campaign evidence goes through the campaign API, not the legacy submission RPC.

## 3. Staging configuration and Auth

1. Obtain the staging project reference and the independently identified production reference from the operator. Confirm they differ. Do not infer project identity from an account name or a key alone.
2. Copy `.env.example` to ignored `.env.staging.local`. Set `VITE_AUTH_MODE=supabase`, `VITE_SUPABASE_URL=https://<staging-ref>.supabase.co`, and `VITE_SUPABASE_ANON_KEY` to the staging publishable/legacy anon key. Do not use `sb_secret_*` or a JWT with `service_role`.
3. Review Vite's environment precedence: `.env`, `.env.local`, `.env.staging`, `.env.staging.local` and process environment can participate. Build from a clean, reviewed staging environment. No private AI or service credential belongs in any `VITE_*` variable; those are browser-visible. Do not copy this machine's private `.env` to a host.
4. Configure Supabase Auth Site URL to the exact staging HTTPS origin. Restrict allowed callback URLs to that origin and only the development origins actually needed. Password login in this implementation does not require an OAuth redirect. Invitation, email confirmation and password recovery flows need separate UI validation before advertising them; pre-provision confirmed staging test users for this run.
5. The client enables session persistence, automatic refresh and URL session detection. The application resolves identity through server `getUser()` and `profiles.auth_user_id` on login/restore. Browser cache alone is not proof. Test refresh, token expiry/revocation, account switching and Auth callback landing. Never place tokens in screenshots or test transcripts.
6. The trusted Arena handler is a server-side module, not a deployed endpoint. Its service client must use a server-only secret store. Remote Arena lifecycle/client wiring and BOSS_RAID's separate atomic adapter remain outstanding. Do not expose the module directly in a Vite bundle or advertise live hosted Arena as ready.

### Normal campaign server: exact configuration

Create ignored `.env.game-server.local` on the staging API host, never the browser/static host artifact:

```dotenv
SUPABASE_URL=https://STAGING_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=STAGING_SERVER_ONLY_SERVICE_ROLE_OR_SECRET_KEY
GAME_STAGING_PROJECT_REF=STAGING_REF
GAME_PRODUCTION_PROJECT_REF=INDEPENDENTLY_CONFIRMED_PRODUCTION_REF
GAME_ALLOWED_ORIGIN=https://EXACT_STAGING_APP_HOST
GAME_API_PORT=8787
```

Start on Node 24 from the repository using:

```powershell
node --env-file=.env.game-server.local --import tsx scripts/start-game-staging-api.mjs
```

The runner binds only `127.0.0.1`, refuses matching Production/staging references and accepts one exact HTTPS browser origin. Configure the staging HTTPS reverse proxy for `/game-api/campaign/start` and `/game-api/campaign/verify` to loopback port 8787. Preserve the Authorization header. Keep a request body limit of 1 MiB and enforce staging proxy request/rate limits. Do not put the server secret in a URL, response, browser env or bundle. Both endpoints verify the bearer token with Auth and require a linked ACTIVE learner membership; a service key on the server does not bypass caller identity checks.

Set browser `VITE_GAME_API_BASE_URL` to blank for the same-origin reverse proxy, or to the exact dedicated staging API HTTPS origin (no path suffix). The server's `GAME_ALLOWED_ORIGIN` is the **app** origin in either case. These routes are implemented; no server was started or deployed by this task because staging credentials were unavailable. The Arena routes are intentionally not mounted by this runner.

Local build commands (no deployment):

```powershell
npm ci
npx tsc
npx vite build --mode staging
```

Serve the reviewed artifact on the designated staging HTTPS origin only after the operator's staging configuration is available. Configure SPA fallback. Do not upload to the production target.

## 4. Provision five dedicated real staging identities

Use Supabase Auth to create/confirm five dedicated test users with separate passwords. Never use mock codes as login credentials. Record their actual Auth UUIDs. With reviewed staging admin access, create game `profiles` using generated game UUIDs and link each `auth_user_id`; do not equate UUIDs across projects.

| Actor | Membership | Active enrollment / assignment | Expected scope |
| --- | --- | --- | --- |
| Student A | LEARNER | V1-A classroom, current academic year | Own evidence |
| Student B | LEARNER | V1-B classroom, same organization/year | Own evidence; cannot read A |
| Assigned Teacher | PROFESSOR | Teacher assignment to V1-A only | Reads A; cannot write A score/progress |
| Unassigned Teacher | PROFESSOR | No V1-A assignment | Cannot read A |
| Admin | ADMIN | Reviewed membership in test organization | Organization-scoped read; no impersonation/trusted writes |

Use `supabase/review/staging-test-accounts.sql` after replacing its five Auth UUID placeholders. The template creates dedicated game test profiles, membership, A/B enrollments and only the assigned teacher's V1-A assignment, all under V1_GAME_STAGING/year 2569. It returns the generated **game profile IDs** for the validation environment. Auth users must already exist; placeholders fail before writes, and reruns fail rather than overwriting identities. Verify the project in the hosted SQL editor before manual execution. No automated provisioning or Production apply is performed.

Have A and B each log in through the actual staging UI, play and finish D1, wait for the verified result and checkpoint upload, then reload. Record A's completed `game_campaign_runs.id` as GAME_STUDENT_A_SESSION_ID, plus checkpoint versions and timestamps. API visibility tests require A's actual verified result to exist; an empty result cannot produce a false PASS for an authorized teacher. Do not create a fabricated verified result fixture for hosted acceptance.

## 5. Executable hosted API validation

Create ignored `.env.staging-validation.local` with the three public Vite values above and the following **private test-only** keys:

```dotenv
GAME_STAGING_PROJECT_REF=staging_ref
GAME_PRODUCTION_PROJECT_REF=independently_confirmed_production_ref
GAME_STAGING_APP_ORIGIN=https://EXACT_STAGING_APP_HOST
GAME_STUDENT_A_SESSION_ID=ACTUAL_COMPLETED_D1_RUN_UUID
GAME_STUDENT_A_EMAIL=
GAME_STUDENT_A_PASSWORD=
GAME_STUDENT_A_PROFILE_ID=
GAME_STUDENT_B_EMAIL=
GAME_STUDENT_B_PASSWORD=
GAME_STUDENT_B_PROFILE_ID=
GAME_ASSIGNED_TEACHER_EMAIL=
GAME_ASSIGNED_TEACHER_PASSWORD=
GAME_ASSIGNED_TEACHER_PROFILE_ID=
GAME_UNASSIGNED_TEACHER_EMAIL=
GAME_UNASSIGNED_TEACHER_PASSWORD=
GAME_UNASSIGNED_TEACHER_PROFILE_ID=
GAME_ADMIN_EMAIL=
GAME_ADMIN_PASSWORD=
GAME_ADMIN_PROFILE_ID=
GAME_STAGING_ALLOW_TEST_WRITES=YES
```

Run from the repository on Node 24:

```powershell
node --env-file=.env.staging-validation.local scripts/validate-hosted-staging.mjs
```

The script refuses missing configuration, a production/staging project match, a privileged browser key, mock mode or duplicate profile IDs. It signs in each real account, calls `getUser`, verifies the linked expected profile/role, checks RLS visibility (including verified result/lifecycle), retries A's existing played response sequence through the campaign API and checks a single reward ledger row. It uses independent sessions, switches the same client from A to B and validates restoration/logout. With the explicit write opt-in it rewrites A's **identical existing checkpoint**, tests retry/version conflicts and impersonation denial, and verifies service-only commit permissions. It does not create accounts, apply migrations, award a new fabricated result, or count an SDK client as a physical device. It logs actor labels, not passwords/tokens. Run serially while the designated test users are not playing. A transient error fails the run; inspect and rerun rather than marking skipped checks PASS.

## 6. Required browser/device validation record

All rows below are **UNEXECUTED** until an operator records actual results. Record build commit/hash, staging project reference, device/browser version, actor label, timestamp, session ID, expected/observed behavior and sanitized evidence. Do not include credentials or full personal records.

| Test | Procedure | Required observation |
| --- | --- | --- |
| Same browser switch | A plays/saves; logout; B logs in; return to A | B never sees A's profile, progress, pending result or teacher detail; A's save returns |
| Separate profiles | Chrome profile A and a separate Edge/browser profile B | Correct Auth identities and independently owned saves |
| Two physical devices | A saves on device 1; log in/refresh on device 2 | Same checkpoint version/content and latest uploaded session; second device is not simulated |
| Stale second device | Load A on both; device 1 saves; device 2 attempts a save | Version conflict surfaced; latest data is not silently overwritten |
| Refresh/reload | Reload student home and result flow | Owned saved profile/latest uploaded result return after server validation |
| Logout/login | Logout, refresh, log in again | No authenticated user while logged out; server validation on login |
| Stale/revoked session | Revoke the staging session, then test after access-token expiry; disable profile separately | Restoration/data requests fail closed; no cached identity fallback. Existing access JWT validity until expiry must be recorded, not mistaken for instant global revocation |
| Network retry | DevTools offline during finish/save; reconnect and retry | Visible save failure/pending state; same evidence ID eventually uploaded once; no shared-browser fallback |
| Duplicate submit | Retry same session/checkpoint request after losing response | One evidence row/reward application; conflicting payload rejected |
| Resume | Finish a stage; save; reload on other device; Continue | Map/profile reflect saved progress; unfinished timed rounds are explicitly outside current resume behavior |
| Teacher overview | Assigned teacher logs in/refreshes V1-A | Real roster and evidence counts; no seeded 32/30 counts or fabricated percentages |
| Teacher detail | Select A, inspect sessions/latest stage/mastery | Metrics match verified rows only; Started/In progress have no fabricated final score |
| Teacher boundary | Unassigned teacher; direct API reads for A | Empty/denied; no details, attempts, rewards or checkpoints leak |
| Assignment revocation | Remove test teacher assignment; refresh/retry API | Access disappears; cached screen cleared on refresh/account change |
| Admin boundary | Admin reads test org; attempt other-org record and service commit | Scoped read only; unrelated org and trusted write paths denied |
| Auth redirect | Open approved staging callback/invitation link if enabled | Session verified before home; no open redirect to arbitrary origin |
| Realtime | Inspect publication tables; use two authorized clients and a foreign classroom subscriber | No answer keys/events/other-classroom leaks. Do not weaken 008's raw-round RLS for subscriptions |

The V1 progress home uses explicit refresh rather than claiming Realtime updates. Migration 006's publication declarations must execute on hosted Supabase; PGlite omits them and cannot validate Realtime delivery. Never add broad SELECT policies to make Realtime work. Raw Arena rounds/events remain restricted; use the sanitized read interfaces.

## 7. Rollback and forward fix

Before staging changes: save schema/migration history, policies/grants/functions and a restorable backup; record the matching app artifact. Before any new V1 data, rollback requires the reviewed previous app plus prior schema/policies/functions. Do not drop new tables while leaving changed RLS or point the new client at old schema.

After new checkpoints/evidence/rewards exist: stop writes during reconciliation, preserve/export all owner IDs, session IDs, idempotency requests and ledger rows, and prefer a reviewed additive forward fix. A restore must reconcile post-backup writes and avoid awarding a session twice. Never delete or replay reward ledgers merely to unblock a test. Old demo records need their own reviewed disposition. No destructive down migration is provided or authorized.

## 8. Gate decision

Use PASS only with recorded evidence and its environment. Local tests can establish local PASS but cannot establish hosted or physical-device PASS. Keep hosted staging and multi-device BLOCK until sections 5–6 actually run. Normal Dojo verification is implemented locally but needs hosted validation; special-mode certification and adversarial timing/aid guarantees are not implied. READY_FOR_PRODUCTION_REVIEW requires all mandatory hosted/device tests and remaining integrity gates to pass; it is not deployment permission.

## Previous local implementation record (before finalization)

Changed `.env.example`, `package.json`, `src/App.tsx`, student/login home integration, `src/services/game-progress-report.ts`, `src/ui/components/PersistedProgressHome.tsx`, `src/tests/game-progress-report.test.ts`, the SQL test runner, migration 005/its separated seed, the hosted validation script and these review notes. No new migration number or schema table was added. Existing unrelated working-tree edits were retained.

Local checks: acceptance 245, authentication/rejection 42, persistence/isolation 17, outbox 11, Arena security 19, frozen engine 14, report aggregation 10, PostgreSQL/RLS 85 passed. The existing timer audit covered all 710 questions. All 31 content/engine/progression file hashes match the pre-change snapshot. Build passed with the existing large-bundle warning. The hosted script's syntax check passed and its missing-configuration preflight blocked before any network action. None of these is a real hosted-auth, visual-browser or physical-device PASS.

## V1 finalization record (2026-09-02)

Added normal Dojo replay/API, the loopback staging API runner, migration 010, authenticated start/result gates and campaign outbox routing. Teacher reports consume only verified metrics and read persisted run lifecycle. Added the exact staging account-linking SQL template and extended hosted validation to require a real completed D1 session, verify all five actors' visibility, retry its response sequence through the API and check one reward entry. No Arena/Battle feature, Territory or Game Factory was added.

Local verification: build passed (bundle-size warning); campaign verifier/API 22, report aggregation 12, PostgreSQL/RLS 106, acceptance 245, authentication 42, persistence 17, outbox 11, existing Arena security 19, frozen engine 14 passed; 710Q timer audit completed. All 31 protected content/engine/progression file hashes are unchanged. Integration type errors in the report mapper were corrected without changing frozen logic. Both server/validation runner syntax checks passed. The hosted script refused missing configuration before making a network request. No credentials or dedicated hosted test accounts were available. No staging or Production migration/server deployment was performed, and no physical-device/browser validation is claimed.
