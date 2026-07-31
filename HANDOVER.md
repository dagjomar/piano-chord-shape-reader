# Handover: Piano Chord Shape Reader

Transfer this file into the new repo as `HANDOVER.md` (and preferably also keep a lasting `PRODUCT.md` derived from §2–§8). Start the next agent with repo access to:

**https://github.com/dagjomar/piano-chord-shape-reader**

---

## 1. Status

| Item | State |
|------|--------|
| Product / tech plan | Done (this conversation) |
| Repo name chosen | `piano-chord-shape-reader` |
| Repo created | Yes — `dagjomar/piano-chord-shape-reader` |
| Code scaffold | **Done** — Vite + React + TS, domain/notation/input/session/ui |
| V1 flash cards | **Done** — maj/min triads, MIDI + virtual piano |
| This cloud agent | Has repo access — branch `cursor/bootstrap-v1-flash-7839` |

**Next action:** New agent with that repo attached → add product docs → bootstrap app → implement v1 flash-card exercise.

---

## 2. Product vision

Frontend-only practice tool for **beginner / early-intermediate pianists** learning to read **chord shapes** on the staff.

Core pedagogy: spot the **root** first, recognize the **shape / inversion**, map to fingering — **not** reading every note individually.

Working product framing from planning:
- Practice tool, not a marketing site
- Expandable exercise platform; **v1 = one exercise type** (chord shape reading)
- Play-to-confirm via MIDI keyboard + on-screen piano fallback

---

## 3. V1 scope — Chord Shape Reading

### Modes
1. **Flash cards** — one chord visible; advance on correct play (or skip/next).
2. **Generate sheet** — a short bar/system of several chords; cursor advances as each is played (more song-like).

Ship flash cards first if sequencing work; generate sheet shares the same generator + matcher.

### Matching (defaults)
- Default: **pitch-class set** match (forgiving octaves within a range).
- Optional strict: exact written pitches / require correct bass for inversions.

### V1 filters / UI tools
- Chord qualities: maj, min (+ optional dim/aug); 7ths can wait for v1.1
- Roots / keys subset
- Inversions: root, 1st, 2nd (close position)
- Clef: treble and/or bass (grand staff nice-to-have)
- Range limit
- Root note accent color on/off (colorblind-safe secondary cue)
- Chord symbol show/hide
- Optional timer / reaction time
- Hint: reveal root (marks assisted)

### Success criteria for first shippable slice
- Generate + render maj/min triads, root + inversions
- Flash mode playable with MIDI + virtual keys
- Generate-sheet with ~4 chords
- Filters + root accent + symbol toggle
- Local-only (`localStorage`); no backend/auth
- Chromium primary for Web MIDI; virtual piano for others

---

## 4. Future exercises (post-v1)

Do **not** build these now; architecture should allow them later:

- Interval flash
- Melody chunks
- Lead-sheet symbol → voicing
- Bass + shell coordination
- Rhythm reading on shapes
- Key-signature drills
- Progressions (ii–V–I, pop cadences)
- Spaced repetition / weak-root queues
- Presets, PWA offline, optional audio samples
- MusicXML import for excerpt practice (OSMD later)

---

## 5. Tech stack (decided)

| Layer | Choice | Notes |
|-------|--------|-------|
| App | Vite + React + TypeScript | Static SPA |
| Notation | **VexFlow, SVG backend** | Programmatic chords; per-note root accent |
| Theory | `@tonaljs` / `tonal` + thin own types | Generator stays pure |
| MIDI | Web MIDI API (thin wrapper) | Optional `webmidi` later |
| Virtual piano | Custom UI | Always-on fallback |
| Audio | Optional v1.1 (Tone.js / Web Audio) | Not required for v1 |
| State | React state + localStorage | No backend |
| Deploy | Static (Pages / Netlify / CF Pages) | — |

### Explicit non-choices for v1
- **Not** OpenSheetMusicDisplay (MusicXML display tool; revisit for song excerpts later)
- **Not** hand-rolled canvas engraving
- **Not** abcjs as long-term renderer (weaker per-note control)
- Domain logic must **not** import VexFlow — notation is an adapter

---

## 6. Suggested architecture

```
src/
  domain/     # ChordSpec, filters, generator, matcher (pure TS, unit-tested)
  notation/   # VexFlow adapter: ChordSpec[] → SVG, root accent, highlight
  input/      # MIDI + virtual keyboard → active pitches
  session/    # flash vs sheet modes, scoring, timing
  ui/         # settings, staff stage, piano, stats
  presets/    # saved filter packs
```

### Core types (sketch)

```ts
ChordSpec {
  root: PitchClass        // 0–11
  quality: ChordQuality   // maj | min | ...
  inversion: 0 | 1 | 2
  octave: number
  clef: 'treble' | 'bass'
}

SessionConfig { filters, mode, matchStrictness, rootAccent, ... }

Trial {
  prompt: ChordSpec
  shownAt: number
  answeredAt?: number
  result: 'correct' | 'incorrect' | 'skipped' | 'hinted'
  playedNotes: number[]   // MIDI
}
```

---

## 7. Naming decisions

| Candidate | Verdict |
|-----------|---------|
| `piano-chord-shape-reader-practice` | Too long; "reader" + "practice" redundant |
| **`piano-chord-shape-reader`** | **Chosen** — clear, balanced |
| `chord-shape-reader` / `shape-sight` / `rootflash` | Fine alternatives if rebranding |

Repo: https://github.com/dagjomar/piano-chord-shape-reader

---

## 8. Implementation milestones (for next agent)

1. Add `PRODUCT.md` + keep/trim this `HANDOVER.md`
2. `npm create vite@latest . -- --template react-ts` (or equivalent in empty repo)
3. Install `vexflow`, `tonal`; add Vitest for `domain/`
4. **Domain + tests** — filters → `ChordSpec`; pitch-class matcher; inversion bass
5. **Notation adapter** — one triad; root accent; treble/bass
6. **Input** — MIDI + virtual piano; held notes UI
7. **Flash mode** — full loop + compact stats
8. **Sheet mode** — N chords, cursor advance
9. **Persistence** — localStorage presets
10. Polish — shortcuts, MIDI permission empty states, responsive staff

### Bootstrap commands (reference)

```bash
npm create vite@latest . -- --template react-ts
npm i vexflow tonal
npm i -D vitest
```

---

## 9. Design / UX constraints (from user rules)

When building UI:
- Practice tool first viewport = one composition (staff + primary controls), not a dashboard
- Brand/product name should be visible, not overpowered by a generic headline
- Avoid default AI aesthetic clusters (purple gradients, cream+terracotta, broadsheet, heavy dark+glow)
- No card soup; cards only if they contain interaction
- At least 2–3 intentional motions for visually led work
- Desktop + mobile usable; MIDI desktop-first

---

## 10. Open decisions (lock when implementing)

1. Default match = forgiving pitch-class (recommended) vs strict voicing
2. Grand staff in v1 vs treble + bass separate first
3. Whether dim/aug / 7ths ship in first PR or immediately after
4. Product display name in UI (can match repo or shorten to "Chord Shape Reader")

---

## 11. Prompt for next agent (copy-paste)

```
Repo: https://github.com/dagjomar/piano-chord-shape-reader

Read HANDOVER.md (and PRODUCT.md if present). Scaffold the Vite + React + TS
app per the handover: domain/notation/input/session/ui layout, install vexflow
+ tonal, add PRODUCT.md from the plan, then implement v1 flash-card chord
shape practice (maj/min triads, inversions, root accent, MIDI + virtual piano).
Commit on a cursor/*-dece branch and open a PR when the first slice works.
```

---

## 12. Conversation context

Planned in Cursor cloud agent (no repo attached). User will continue in a new session with the GitHub repo selected. Full product narrative and library comparison (VexFlow vs OSMD vs abcjs vs canvas) lived in that planning thread; this file is the durable extract.
