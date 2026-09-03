# Game deployment execution record — 2026-09-03

Target: https://learn.klapanya.ac.th

## Completed

- Source baseline backup: `614a79b`. Arctic visual implementation: `0140165`.
- Plesk site 1177, document directory `learn.klapanya.ac.th`.
- Created `learn-backup-20260903-before-admin.zip` from the old Game document-root files and moved it to subscription Home directory. Plesk confirmed the move.
- Confirmed the Game Supabase project `olkwebybofeuzwiaiykf` (`klapanya-E-learning-game`) had no public tables and zero Auth accounts.
- Applied repository migrations 001–013 in order, combined into one transaction. Migration 005 is a no-op; `supabase/seeds/development.sql` was NOT applied.
- SQL editor execution: `2c480d40-0b3f-4a28-bd12-4d34f343be8d`. Do not rerun the chain: it has already been applied even though dashboard migration history was initially empty.
- Hosted verification returned 25 public tables, zero tables without RLS, two views, zero profiles/Auth users, three Arctic configuration policies, and both `game-backend` / `game-arctic-visuals` buckets private. Authenticated SELECT grants for profiles and Arctic configuration exist.
- Production public configuration is in ignored `.env.production.local`. No service-role key is included in the browser bundle.
- Fixed Vite environment embedding by using literal `import.meta.env`; the previous optional-chain form was not replaced in production. `scripts/verify-game-deployment-build.mjs` checks the built artifact.
- Corrected production preview `/admin` renders the real email/password Admin login, without demo identity. Frozen game logic/content remain unchanged.

## Pending external completion

- Plesk ZIP upload was rejected by Chrome: `Not allowed`. Enable “Allow access to file URLs” for the ChatGPT browser extension before retrying.
- Upload the **r2** archive, not the earlier archive: `klapanya-game-admin-20260903-r2.zip` in the Codex visualization output directory for this task. The earlier ZIP predates the environment-embedding fix.
- No frontend release files have been extracted/replaced on the host yet. The old hosted frontend remains active.
- Auth Site URL save was submitted for `https://learn.klapanya.ac.th`; exact redirect save was submitted for `https://learn.klapanya.ac.th/admin`. Recheck persisted values: the browser connection timed out before final confirmation.
- The user must identify/create the first real Auth user and approve its ACTIVE Game profile / ADMIN membership linkage. No Admin account or credentials were invented or created.
- Real hosted Admin login, Arctic editing, image upload/save, TH/EN switching and runtime image replacement are not yet verified.

## Release steps remaining

1. Confirm the saved Auth URLs and the initial real Admin linkage.
2. Upload/extract the corrected r2 release only into the Game document root, including `.htaccess`; retain the rollback archive outside that root.
3. Verify `/` and direct `/admin` reload, real Admin login/logout, existing Arctic General/Visual, all 12 slots, replacement save/reload, runtime image resolution and empty-slot fallback.
4. Keep migration 013 and uploaded assets on a frontend rollback; it is additive. Do not drop populated tables or overwrite the private original files.
