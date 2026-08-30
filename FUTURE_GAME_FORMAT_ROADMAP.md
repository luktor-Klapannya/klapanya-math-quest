# FUTURE GAME FORMAT ROADMAP (ARCHITECTURAL LOG ONLY)
**Klapanya Learning Ecosystem — Multi-Format Engine Specification**

> **Current Production Status:**
> - Active Product: **Klapanya Math Admission Quest (Grade 6 $\to$ M.1)**
> - Active Format: `GAME_FORMAT_PRACTICE_EXAM` (Question-based training, 710Q standard)
> - Active Subject & Territory: **Math $\to$ Frozen Arctic**
> - **Note:** The alternative formats below are reserved for future grade bands / cross-subject extensions and are **NOT** implemented in the Grade 6 Admission Quest.

---

### Core Learning-to-Visual Architecture Principle

```
Learning Content (Core Standard / Misconception Matrix)
   ↓
Task & Diagnostic Question Engine (Canonical Corpus)
   ↓
Game Format Adapter (Format Selection by Target Age Band)
   ↓
Subject Territory Theme (Math: Arctic, English: Ocean, Science: Volcano, Social: Sky, Thai: Legend)
   ↓
Visual & Audio Presentation Layer (Mobile / Tablet / Desktop UI)
```

---

### Format Taxonomy & Target Age Band Suitability

| Format Key | Format Name | Primary Target Band | Gameplay Description | Pedagogical Focus |
| :--- | :--- | :--- | :--- | :--- |
| `GAME_FORMAT_PRACTICE_EXAM` | **Practice Exam Adventure** | **Grade 6 $\to$ M.1 (ACTIVE)** | Exam-standard questions, Dojo/Shrine/Gateway/Boss, Tutor 7-step, Speed Duel, Classroom Battle | High-stakes admission exam fluency, multi-step problem solving, error analysis |
| `GAME_FORMAT_SHOOTING` | **Target Buster / Arc Strike** | Grades 3–5 | Tap/aim at the correct floating number or celestial orb to blast obstacle | Fast reflex fact fluency (multiplication tables, prime identification) |
| `GAME_FORMAT_FISHING` | **Deep Hook Explorer** | Grades 1–3 | Cast line to catch fish displaying correct value or equivalent fraction | Fraction/decimal visualization, positive reinforcement |
| `GAME_FORMAT_MATCHING` | **Crystal Link / Card Match** | Grades 2–4 | Connect equations to visual area models or definitions | Conceptual pairing, geometry name-to-shape linking |
| `GAME_FORMAT_PHOTO_HUNT` | **Diagram Spotter / Trap Hunter** | Grades 4–6 | Inspect complex diagram for mathematical flaws or hidden angles | Geometric diagram inspection, counterexample detection |
| `GAME_FORMAT_SORTING` | **Category Conveyor** | Grades 2–5 | Drag numbers into prime/composite, odd/even, or acute/obtuse bins | Set classification, sorting numbers into ascending order |
| `GAME_FORMAT_MEMORY` | **Formula Flip Memory** | Grades 3–6 | Memory match pairs of formulas with geometric shapes or worked values | Formula memorization, mental recall warmup |
| `GAME_FORMAT_PUZZLE` | **Equation Grid & Tangram** | Grades 4–6 | Assemble 2D geometric tiles or fill sudoku-style number locks | Spatial reasoning, algebraic logic puzzles |

---

### Scope Freeze Invariant
The Grade 6 Admission Quest strictly preserves the **`GAME_FORMAT_PRACTICE_EXAM`** format to guarantee exam integrity, rigorous calculation practice, and direct alignment with the official O-NET and special admission exams.
