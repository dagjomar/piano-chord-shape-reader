import type {
  ChordFilters,
  ChordPoolEntry,
  Clef,
  Inversion,
  MatchStrictness,
  PitchClass,
  SessionConfig,
} from '../domain/types'
import { DEFAULT_FILTERS, PITCH_CLASS_NAMES } from '../domain/types'

export interface PracticeKey {
  id: string
  name: string
  root: PitchClass
}

export interface PracticeLevel {
  id: string
  name: string
  description: string
  buildPool: (keyRoot: PitchClass) => ChordPoolEntry[]
  inversions: Inversion[]
  clefs: Clef[]
  matchStrictness: MatchStrictness
}

export const PRACTICE_KEYS: PracticeKey[] = [
  { id: 'c-major', name: 'C major', root: 0 },
  { id: 'g-major', name: 'G major', root: 7 },
  { id: 'd-major', name: 'D major', root: 2 },
  { id: 'f-major', name: 'F major', root: 5 },
  { id: 'a-major', name: 'A major', root: 9 },
  { id: 'bb-major', name: 'B♭ major', root: 10 },
]

const MAJOR_SCALE = [0, 2, 4, 5, 7, 9, 11] as const

function degreeRoot(keyRoot: PitchClass, degreeIndex: number): PitchClass {
  return ((keyRoot + MAJOR_SCALE[degreeIndex]) % 12) as PitchClass
}

function primaryTriads(keyRoot: PitchClass): ChordPoolEntry[] {
  return [
    { root: degreeRoot(keyRoot, 0), quality: 'maj' },
    { root: degreeRoot(keyRoot, 3), quality: 'maj' },
    { root: degreeRoot(keyRoot, 4), quality: 'maj' },
  ]
}

function withMinorThreeAndSix(
  keyRoot: PitchClass,
  pool: ChordPoolEntry[],
): ChordPoolEntry[] {
  return [
    ...pool,
    { root: degreeRoot(keyRoot, 2), quality: 'min' },
    { root: degreeRoot(keyRoot, 5), quality: 'min' },
  ]
}

function withMinorTwo(keyRoot: PitchClass, pool: ChordPoolEntry[]): ChordPoolEntry[] {
  return [
    ...pool,
    { root: degreeRoot(keyRoot, 1), quality: 'min' },
  ]
}

export const PRACTICE_LEVELS: PracticeLevel[] = [
  {
    id: '1-primary',
    name: '1 — Primary triads',
    description: 'I, IV, and V major chords in root position',
    buildPool: primaryTriads,
    inversions: [0],
    clefs: ['treble'],
    matchStrictness: 'pitchClass',
  },
  {
    id: '2-minors',
    name: '2 — Add iii & vi',
    description: 'Primary triads plus the relative minor chords (iii and vi)',
    buildPool: (keyRoot) => withMinorThreeAndSix(keyRoot, primaryTriads(keyRoot)),
    inversions: [0],
    clefs: ['treble'],
    matchStrictness: 'pitchClass',
  },
  {
    id: '3-diatonic',
    name: '3 — Full diatonic',
    description: 'All major-key triads except vii° (includes ii)',
    buildPool: (keyRoot) =>
      withMinorTwo(keyRoot, withMinorThreeAndSix(keyRoot, primaryTriads(keyRoot))),
    inversions: [0],
    clefs: ['treble'],
    matchStrictness: 'pitchClass',
  },
  {
    id: '4-first-inv',
    name: '4 — First inversions',
    description: 'Same chord set with root and first inversion',
    buildPool: (keyRoot) =>
      withMinorTwo(keyRoot, withMinorThreeAndSix(keyRoot, primaryTriads(keyRoot))),
    inversions: [0, 1],
    clefs: ['treble'],
    matchStrictness: 'pitchClass',
  },
  {
    id: '5-all-inv',
    name: '5 — All inversions',
    description: 'Same chord set in root, first, and second inversion',
    buildPool: (keyRoot) =>
      withMinorTwo(keyRoot, withMinorThreeAndSix(keyRoot, primaryTriads(keyRoot))),
    inversions: [0, 1, 2],
    clefs: ['treble'],
    matchStrictness: 'pitchClass',
  },
  {
    id: '6-bass-clef',
    name: '6 — Bass clef',
    description: 'Full diatonic set with bass clef added',
    buildPool: (keyRoot) =>
      withMinorTwo(keyRoot, withMinorThreeAndSix(keyRoot, primaryTriads(keyRoot))),
    inversions: [0, 1, 2],
    clefs: ['treble', 'bass'],
    matchStrictness: 'pitchClass',
  },
  {
    id: '7-strict',
    name: '7 — Strict voicing',
    description: 'Full diatonic set; exact written pitches required',
    buildPool: (keyRoot) =>
      withMinorTwo(keyRoot, withMinorThreeAndSix(keyRoot, primaryTriads(keyRoot))),
    inversions: [0, 1, 2],
    clefs: ['treble', 'bass'],
    matchStrictness: 'strict',
  },
]

export const DEFAULT_KEY_ID = 'c-major'
export const DEFAULT_LEVEL_ID = '1-primary'

export function findPracticeKey(keyId: string): PracticeKey {
  return PRACTICE_KEYS.find((k) => k.id === keyId) ?? PRACTICE_KEYS[0]!
}

export function findPracticeLevel(levelId: string): PracticeLevel {
  return PRACTICE_LEVELS.find((l) => l.id === levelId) ?? PRACTICE_LEVELS[0]!
}

export function buildFilters(keyId: string, levelId: string): ChordFilters {
  const key = findPracticeKey(keyId)
  const level = findPracticeLevel(levelId)
  const chordPool = level.buildPool(key.root)
  const roots = [...new Set(chordPool.map((c) => c.root))]
  const qualities = [...new Set(chordPool.map((c) => c.quality))]

  return {
    ...DEFAULT_FILTERS,
    roots,
    qualities,
    inversions: [...level.inversions],
    clefs: [...level.clefs],
    chordPool,
  }
}

export function buildSessionConfig(
  keyId: string,
  levelId: string,
  display: Pick<
    SessionConfig,
    'rootAccent' | 'showSymbol' | 'autoAdvanceIntervalSec'
  > = {
    rootAccent: true,
    showSymbol: true,
    autoAdvanceIntervalSec: 8,
  },
): SessionConfig {
  const level = findPracticeLevel(levelId)
  return {
    filters: buildFilters(keyId, levelId),
    mode: 'flash',
    matchStrictness: level.matchStrictness,
    rootAccent: display.rootAccent,
    showSymbol: display.showSymbol,
    autoAdvanceIntervalSec: display.autoAdvanceIntervalSec,
    presetKeyId: keyId,
    presetLevelId: levelId,
  }
}

function chordLabel(entry: ChordPoolEntry): string {
  const name = PITCH_CLASS_NAMES[entry.root]
  return entry.quality === 'min' ? `${name}m` : name
}

export function describePreset(keyId: string, levelId: string): string {
  const key = findPracticeKey(keyId)
  const level = findPracticeLevel(levelId)
  const pool = level.buildPool(key.root)
  const symbols = pool.map(chordLabel)
  const invLabel =
    level.inversions.length === 1 && level.inversions[0] === 0
      ? 'root position'
      : level.inversions.length === 2
        ? 'root & 1st inv.'
        : 'all inversions'
  const clefLabel = level.clefs.length === 1 ? 'treble' : 'treble & bass'
  return `${symbols.join(', ')} · ${invLabel} · ${clefLabel}`
}
