# Game identity and persistence foundation — review notes

Scope: Klapanya E-learning Game only. No Production migration or deployment has been performed.

## Data ownership and runtime

Supabase Auth identifies the principal; `profiles.auth_user_id` resolves the game owner UUID. The real runtime does not use display names, codes, demo IDs, or the legacy identity caches as authentication. Development/demo mode is separate. Production defaults to Supabase mode; an explicit `VITE_AUTH_MODE=mock` is a demo build, not a production identity system.

`CloudOwnedProgress` binds every operation to one immutable profile ID and checks the current identity before and after asynchronous operations. Account changes clear the rendered player state and wait for that account's load. No anonymous save is adopted. Teachers use an isolated local game preview rather than writing student progress.

Each checkpoint save uses an expected version and a UUID request key. The database locks the owner row. Retrying an uncertain request reuses the same key and data. A stale second-device save fails instead of overwriting newer progress. The UI offers retry or an explicit reload that discards unsaved local changes. Cloud saves do not fall back to shared browser storage.

## Checkpoints versus verified evidence

`game_player_progress` stores the existing `PlayerProfile` output as `CLIENT_CHECKPOINT`. It supports continuity across devices, not authoritative assessment or reward accounting. Scores, XP, inventory, unlocks and mastery in this checkpoint are client-reported. Do not use them as verified teacher reporting, rankings or assignment completion evidence.

Dojo, Shrine, Gateway, Boss and Final Trial screens record raw question responses alongside their unchanged result calculations. Drill/daily quests also use the instrumented Battle screen. Recorded context identifies the engine, selected question sequence and run mode; this is reported context, not server authorization. Shrine timeouts are recorded as unanswered attempts. Evidence uses one browser key per owner/session so another tab cannot replace a whole pending queue. Successful submission removes only the matching session. Account changes during a request leave acknowledgement pending for the original owner to retry. The v1 owner outbox is copied idempotently with its original snapshot retained. Reload/login and the browser online event retry pending evidence. Clearing browser storage can lose unsubmitted evidence. A browser storage error is shown to the player. The simulated Arena runtime remains separate from this campaign evidence stream.

`game_sessions` and `game_question_attempts` retain submitted evidence. Browser-provided correctness, totals or rewards are not promoted automatically. `game_session_results`, `game_reward_ledger` and `game_verified_progress` are writable only by the trusted server commit RPC/service role. Stage and mastery views read verified state with invoker RLS.

`server/game-result-pipeline.ts` remains the generic, fail-closed boundary for modes without a concrete adapter. Normal Dojo D1–D6 now uses `server/campaign-replay.ts` and `server/campaign-api.ts`, migration 010, and the staging API runner documented in `V1_STAGING_RUNBOOK.md`. It issues an owned run, validates canonical responses/sequence and derives the existing result before atomically committing evidence, rewards, progress and completion. Normal result screens read the verified receipt. Teacher reports never fall back to checkpoint/submitted metrics. Other mode adapters remain uncertified. Timing and hint use are reported telemetry inputs, not independently proven anti-cheat data; final rewards/correctness are computed by server code. No service credential belongs in Vite/browser variables.

## RLS matrix

| Data | Student | Assigned teacher | Other teacher | Org admin |
|---|---|---|---|---|
| Profile | Own read; display/avatar/hero edits | Enrolled student read | No unrelated access | Existing org management |
| Client checkpoint | Own read/save RPC | Scoped read, client-reported | No unrelated access | Scoped read |
| Sessions/attempts | Own submit/read; immutable evidence | Scoped read | No unrelated access | Scoped read |
| Verified result/reward/state | Own read | Scoped read | No unrelated access | Scoped read; no score mutation |
| External identity mapping | Own read | No unrelated access | No unrelated access | Scoped read; server-managed mapping |
| Arena | Enrolled room read/join; own presence; own answers | Assigned host controls and reads | No unrelated access | Scoped management/read |

Teacher scope requires active profile, teacher membership, matching classroom assignment/enrollment and academic year. A role alone is insufficient. Master identity mappings link a game profile to a source-system/person-type/organization/canonical-person tuple; they do not copy School master records or equate cross-project Auth UUIDs.

## Arena boundary

Migration 008 closes organization/classroom leaks, blocks direct participant score changes and caller-supplied answer correctness, and enforces participant/round room consistency. Student round RPCs omit answer keys/explanations; raw round/event payloads are host-only. Filtered event RPCs expose only IDs/types/timestamps.

`server/arena-submission.ts` supplies a Request/Response handler with an injected server-only Supabase client. The browser may submit only round ID and option ID. The handler verifies Auth, resolves the linked active learner, rechecks classroom enrollment, derives elapsed time from the server clock, and obtains correctness from canonical content. It reuses the unchanged `RealtimeArenaService.submitAnswer` scorer; it does not merge that formula with the different local battle scorer. Migration 009 adds a service-only atomic commit that rechecks the live/current round and deadline, locks the participant, rejects stale aggregate versions and commits the answer, stats and event together. Same-answer retries return the existing record; conflicting retries fail. The request stream is capped at 4096 bytes.

The handler currently supports STANDARD_DUEL and SPEED_CHALLENGE. BOSS_RAID fails closed because its shared HP requires a separate atomic adapter. Game-specific realtime services in the browser remain local simulations. Hosting the handler and connecting the remote classroom lifecycle/client remain outstanding; neither was deployed. Scoring formulas were not edited.

## Local-save reconciliation

The old key `klapanya_math_arctic_profile_v1` is left untouched and never automatically loaded by the new runtime. `exportLegacySave` provides explicit raw export for reconciliation. There is no automatic import or verified reward backfill. Review ownership with the student/teacher; preserve the original export. A future approved import must identify the destination game profile and retain provenance as unverified checkpoint data. Ambiguous shared-device saves must not be assigned by name or student code alone. Demo v2 storage uses separate owner keys and cannot restore a real account.

## Migration/release plan

1. Review the SQL and run `game-foundation-preflight.sql` on an authorized staging copy. Inspect deployed grants/policies for drift; local files do not prove deployed state. No Production connection was used here.
2. Provision verified Auth users and correct profile links/memberships. Migration 005 is now a reserved no-op; the former fixture is guarded in `supabase/seeds/development.sql`. Never enable that fixture on hosted databases. See `V1_STAGING_RUNBOOK.md` for the migration-history review and dedicated real-account setup.
3. Resolve preflight findings explicitly. Migration 008 refuses legacy room hosts outside year 2569; a human must establish correct historic room years rather than blindly backfilling them. Review effects of academic-year and enrollment status changes on teacher access.
4. Back up the database/schema and apply 007, 008, then 009 in staging. Exercise real JWTs for two learners, assigned/unassigned teachers and an org admin, including actual Supabase grants and realtime transport.
5. Complete and review per-mode trusted campaign replay and Arena hosting/client integration before treating game outcomes as authoritative. Complete real-browser multi-device/offline testing. Do not enable BOSS_RAID through the duel submission adapter.
6. Only after explicit Production approval apply migrations and release the matching client. The new real client fails closed on unavailable persistence tables rather than loading legacy saves.

Before any new data, rollback requires restoring reviewed prior policies/functions/schema and the prior client; do not just drop tables and leave changed RLS. After new data exists, retain/export checkpoints, submissions, results and ledger entries and use a reviewed forward fix or reconciled restore. No destructive rollback SQL is provided.

## Verification limits

The SQL suite uses in-memory PGlite PostgreSQL, real roles/grants/RLS/functions/triggers and migrations 001–009. Only Realtime publication statements are omitted because PGlite has no replication transport. Tests do not prove hosted Supabase configuration, JWT delivery, browser UX, real network reconnection or service-role deployment. The TypeScript persistence suite tests owner switches, late responses, reload, second-device conflicts and lost-response retries against a deterministic transport; the SQL suite independently verifies server enforcement. The outbox tests model interleaved writes from two tabs, and Arena handler tests use a query-aware fake client plus golden scorer outputs.

Recorded checks for this continuation: build passed (large-bundle warning); acceptance 245 passed; authentication/rejection 42 passed; persistence/isolation 17 passed; frozen engine 14 passed; evidence outbox 11 passed; Arena submission 19 passed; database/RLS 83 passed; existing 710Q timer audit completed. All 31 content, engine and progression file hashes matched the pre-change snapshot. An Arena test-fixture hero type and a migration PL/pgSQL expression syntax error were corrected without changing frozen logic. The sandbox's tsx OS-user restriction was handled by running the authorized local test runner outside that sandbox.

## Files changed in this continuation

- `AGENTS.md`
- `package.json`, `package-lock.json`
- `src/App.tsx`
- `src/storage/owned-progress.ts`
- `src/storage/evidence-outbox.ts`
- `src/services/game-evidence.ts`
- `src/ui/screens/BattleScreen.tsx`
- `src/ui/screens/ShrineSpeedrunScreen.tsx`
- `src/ui/screens/GatewayExamScreen.tsx`
- `src/ui/screens/FinalTrialScreen.tsx`
- `src/ui/screens/BossArenaScreen.tsx`
- `server/game-result-pipeline.ts`
- `server/arena-submission.ts`
- `src/tests/persistence.test.ts`
- `src/tests/frozen-engine.test.ts`
- `src/tests/evidence-outbox.test.ts`
- `src/tests/arena-submission.test.ts`
- `scripts/test-game-database.mjs`
- `supabase/migrations/007_game_identity_persistence.sql`
- `supabase/migrations/008_game_arena_security.sql`
- `supabase/migrations/009_game_arena_submission.sql`
- `supabase/review/game-foundation-preflight.sql`
- `supabase/review/GAME_FOUNDATION.md`

Authentication implementation/test changes from the preceding approved task were retained and reverified. Existing unrelated workspace edits were not reverted. The build regenerated ignored `dist` output locally; nothing was deployed.

Repository-wide `git diff --check` reports whitespace in existing modified UI files (CombatArenaView, AvatarHeroSelectScreen, BattleLobbyScreen, ClassroomBattleScreen, LoginScreen, MapScreen and theme.css). Those files were not normalized as part of this continuation.

## Remaining implementation gate

Normal Dojo verification and verified-only teacher reporting are now implemented locally; see the finalization record in `V1_STAGING_RUNBOOK.md`. The release remains BLOCKED on actual hosted staging and physical multi-device validation. Client checkpoints remain unverified continuity data, and the dedicated special-mode/Arena adapters are not implicitly certified by the normal Dojo verifier. No external deployment or frozen-formula change was performed.
