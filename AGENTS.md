# E-learning Game Repository Scope Lock

**THIS REPOSITORY IS KLAPANYA E-LEARNING GAME ONLY.**

Klapanya Teacher Portal is out of scope. This exclusion does not remove the game-specific teacher assignment and game progress features listed below.

KLAPANYA E-LEARNING GAME — REPOSITORY SCOPE LOCK

This workspace is exclusively for the Klapanya E-learning Game.

Repository:
D:\โรงเรียน\วิชาการ\2569\E-learning-game

From this point forward, work ONLY on the E-learning Game.

==================================================
1. REPOSITORY BOUNDARY
==================================================

This repository contains the Klapanya E-learning Game only.

IN SCOPE:

- E-learning game
- Math game
- 710-question campaign
- Question bank
- Game levels
- Game stages
- Territories / worlds
- Characters
- Player profiles
- Game sessions
- Question attempts
- Score
- XP
- Rewards
- Achievements
- Mastery
- Student progress
- Game assignments
- Teacher-to-student game assignment
- Game dashboard
- Student game dashboard
- Teacher game progress view
- Parent game progress view, when explicitly requested
- Game Supabase schema
- Game authentication
- Game RLS
- Game assets
- Game UI / UX
- Game responsive design
- Game deployment
- E-learning portal integration specifically required by the game

==================================================
2. OUT OF SCOPE
==================================================

DO NOT work on or infer requirements from:

- Klapanya School Management System
- School Management Dashboard
- Academic Management Workspace
- School assessment governance
- unit_assessments
- student_unit_scores from the School Management project
- migration 156
- Phase 3.1 Academic Assessment
- School HR
- Saraban / correspondence
- School projects
- Budget
- Teacher HR
- School attendance administration
- School curriculum administration
- SAR / QA
- School Management authorization work
- Public school website
- unrelated School Management UI

Those belong to separate repositories and separate Codex workspaces.

If a request appears to belong to another repository:
STOP.
Do not modify files.
Report:
OUT_OF_SCOPE_FOR_GAME_REPOSITORY
and explain which system it appears to belong to.

==================================================
3. TEACHER + STUDENT RULE
==================================================

Teacher and Student integration in this repository means ONLY:

Teacher
→ assigns game/activity
→ classroom/student/group
→ views game progress

Student
→ logs into game
→ plays activity
→ question attempts
→ score
→ XP
→ mastery
→ rewards
→ progress

Do NOT recreate the full School Management Teacher or Student system here.

Prefer linking to stable canonical Teacher and Student IDs when integration is introduced.

Do not duplicate master Teacher/Student records unless there is a reviewed technical requirement.

==================================================
4. GAME DATA OWNERSHIP
==================================================

The game may own data such as:

- player profile
- avatar
- game preferences
- game assignment
- game session
- question attempt
- game score
- XP
- reward
- badge
- mastery
- stage progress
- campaign progress
- game-specific analytics

The School Management system should remain the canonical source for school identity data where applicable.

==================================================
5. FROZEN GAME SYSTEMS
==================================================

Treat existing validated game systems as protected.

Especially protect:

- 710-question content
- existing question IDs
- scoring logic
- timer logic
- mastery logic
- progression logic
- answer keys
- validated content mappings

Do not renumber, rewrite, regenerate, normalize, or migrate these systems unless explicitly instructed.

If a proposed change would affect a frozen system:
STOP and request human approval.

==================================================
6. DATABASE RULES
==================================================

This repository currently owns its own game migrations.

Only inspect and modify migrations that actually exist in this repository.

Never reference or implement migration 156 from School Management.

Before any schema change:

1. Audit existing game migrations.
2. Identify current tables and relationships.
3. Check backward compatibility.
4. Check existing game data.
5. Check RLS.
6. Propose migration.
7. Wait for approval before Production apply.

Never modify Production unless explicitly authorized.

==================================================
7. SAFE DEVELOPMENT RULE
==================================================

Before every Sprint:

- identify affected game files
- identify affected database objects
- identify frozen systems touched
- identify possible regressions
- confirm the work remains inside Game scope

Do not silently expand scope.

Do not remove working features merely to simplify architecture.

Prefer additive and backward-compatible changes.

==================================================
8. CROSS-REPOSITORY INTEGRATION
==================================================

Future integration with Klapanya School Management must occur through explicit interfaces such as:

- canonical user ID
- student ID
- teacher ID
- classroom ID
- academic period ID
- controlled APIs
- shared authentication
- reviewed database linkage

Do NOT copy School Management modules into the game repository.

Do NOT assume both applications must become one codebase.

==================================================
9. CURRENT WORK MODE
==================================================

For the next task:

AUDIT FIRST.
DO NOT MODIFY FILES unless the task explicitly authorizes implementation.

At the beginning of every response confirm:

GAME_SCOPE: CONFIRMED

At the end of every response report:

GAME_SCOPE_STATUS:
- IN_SCOPE
- CROSS_REPOSITORY_DEPENDENCY_FOUND
- HUMAN_DECISION_REQUIRED

If anything from School Management appears in the task unexpectedly,
stop before making changes.

## Scope reconciliation with existing instructions

The scope lock above is the repository boundary for the existing instructions below. References to The Wisdom Academy School, academic content, teachers, students, and the portal refer only to the E-learning Game. They do not authorize School Management modules or the public school website.

Existing gameplay, design, and teacher content-review requirements are retained. Explicit academic instructions remain necessary for frozen-system changes; the scope lock additionally requires stopping for human approval before such changes. Architectural descriptions of Supabase do not establish that persistence is implemented or authorize Production access.

Before each Sprint, identify affected game files, database objects, frozen systems, and possible regressions, and confirm Game scope. Preserve working features and prefer additive, backward-compatible changes.

Verification clarification: the build and acceptance commands below remain required for application/schema implementation. Read-only audits and documentation-only instruction edits do not require them. Report which checks were executed and any limitations; never claim unexecuted checks passed.

---
# 🏛️ THE WISDOM ACADEMY SCHOOL — AGENT OPERATING INSTRUCTIONS
**Platform:** Klapanya E-Learning Academic World | **Production Target:** `learn.klapanya.ac.th` | **Git Baseline:** `math-quest-v1.0`

---

## 🛑 MANDATORY PRE-FLIGHT PROTOCOL FOR EVERY TASK

Before implementing any coding, design, or architectural task in this codebase, every agent MUST follow this protocol:

1. **Identify the Active Sprint:** Locate the relevant sprint number and scope from the master roadmap (e.g., Sprint 4: Portal/Background, Sprint 5: Auth Shell, Sprint 6: Academic Arena, Sprint 7: Content Library).
2. **Consult Project-Local Skills:**
   - **For Visual / Theme / UI / Layout Tasks:** Activate and read [`.agents/skills/wisdom-academy-design/SKILL.md`](file:///.agents/skills/wisdom-academy-design/SKILL.md) (Mandatory).
   - **For Gameplay / Math / Combat / Engine Tasks:** Activate and read [`.agents/skills/wisdom-academy-gameplay/SKILL.md`](file:///.agents/skills/wisdom-academy-gameplay/SKILL.md) (Mandatory).
   - **For Arena / Content / Exam Upload / Backend Tasks:** Activate and read [`.agents/skills/wisdom-academy-content/SKILL.md`](file:///.agents/skills/wisdom-academy-content/SKILL.md) (Mandatory).
3. **Preserve Frozen Invariants:** The **710Q Math Quest Grand Campaign** (Dojo, Farming Shrine, O-NET Gateway, Boss Citadels, Geometry Ruins, Quest Board, Final Trial) is **$100\%$ FROZEN**. Never alter scoring formulas, timer equations, question IDs, or mastery algorithms without explicit academic instructions.
4. **Report Frozen Systems:** In your pre-implementation plan and post-implementation summary, explicitly confirm which frozen systems were checked and preserved.

---

## 🎨 VISUAL & DESIGN STANDARDS SUMMARY
- **Landing / Portal:** ALWAYS Dark Fantasy mode (Midnight Navy, Gold Trim, Cyan Glow).
- **Subject Territories:** White/Ice Blue for Arctic Math, Blue/Aqua for Ocean English, Red/Black for Volcanic Science, White/Gold for Sky Social, Green/Gold for Thai.
- **Rendering Layers:** Background Base Art $\to$ Atmosphere Overlays $\to$ Hero Sprite $\to$ Boss/Dummy Sprite $\to$ HUD $\to$ Question UI.
- **Mobile First:** Mobile viewports ($360\text{px} - 430\text{px}$) are primary, with dedicated crops and touch targets $\ge 44\text{px}$.

---

## 🎮 GAMEPLAY & ARENA STANDARDS SUMMARY
- **Farming:** Resource mining / speedrun duel (NO boss).
- **Dojo:** Foundational training against Frost Dummy (NO true boss).
- **O-NET:** Solemn guardian exam gateway.
- **Boss Citadels:** True combat presentation with multi-phase mechanics.
- **Arena:** 9–12 concurrent student classroom duels. **Accuracy dominates speed.**

---

## 📚 CONTENT LIBRARY & REVIEW GATES
- **One Content Library $\to$ Many Arenas $\to$ Many Territories.**
- **Mandatory Gate:** AI-generated or OCR-extracted academic questions MUST pass teacher review and manual approval before publishing.
- **Code Authority:** GitHub holds all source code; Supabase holds runtime data and WebSocket realtime channels.

---

## 🧪 POST-IMPLEMENTATION VERIFICATION
Always run and ensure green output before finishing:
```bash
npm run build
npx tsx src/tests/acceptance.test.ts
```
