# Piano Chord Shape Reader — Product & Technical Plan

## Product vision

Frontend-only practice tool for **beginner / early-intermediate pianists** learning to read **chord shapes** on the staff.

Core pedagogy: spot the **root** first, recognize the **shape / inversion**, map to fingering — **not** reading every note individually.

Working product framing:
- Practice tool, not a marketing site
- Expandable exercise platform; **v1 = one exercise type** (chord shape reading)
- Play-to-confirm via MIDI keyboard + on-screen piano fallback

---

## V1 scope — Chord Shape Reading

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

## Future exercises (post-v1)

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

## Tech stack

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

## Architecture

```
src/
  domain/     # ChordSpec, filters, generator, matcher (pure TS, unit-tested)
  notation/   # VexFlow adapter: ChordSpec[] → SVG, root accent, highlight
  input/      # MIDI + virtual keyboard → active pitches
  session/    # flash vs sheet modes, scoring, timing
  ui/         # settings, staff stage, piano, stats
  presets/    # saved filter packs
```

### Core types

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

## Naming

| Candidate | Verdict |
|-----------|---------|
| `piano-chord-shape-reader-practice` | Too long; "reader" + "practice" redundant |
| **`piano-chord-shape-reader`** | **Chosen** — clear, balanced |
| `chord-shape-reader` / `shape-sight` / `rootflash` | Fine alternatives if rebranding |

Repo: https://github.com/dagjomar/piano-chord-shape-reader

---

## Implementation milestones

1. Add `PRODUCT.md` + keep/trim `HANDOVER.md`
2. `npm create vite@latest . -- --template react-ts` (or equivalent in empty repo)
3. Install `vexflow`, `tonal`; add Vitest for `domain/`
4. **Domain + tests** — filters → `ChordSpec`; pitch-class matcher; inversion bass
5. **Notation adapter** — one triad; root accent; treble/bass
6. **Input** — MIDI + virtual piano; held notes UI
7. **Flash mode** — full loop + compact stats
8. **Sheet mode** — N chords, cursor advance
9. **Persistence** — localStorage presets
10. Polish — shortcuts, MIDI permission empty states, responsive staff

### Bootstrap commands

```bash
npm create vite@latest . -- --template react-ts
npm i vexflow tonal
npm i -D vitest
```
