export type PitchClass = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11

export type ChordQuality = 'maj' | 'min'

export type Inversion = 0 | 1 | 2

export type Clef = 'treble' | 'bass'

export type MatchStrictness = 'pitchClass' | 'strict'

export type SessionMode = 'flash' | 'sheet'

export interface ChordSpec {
  root: PitchClass
  quality: ChordQuality
  inversion: Inversion
  octave: number
  clef: Clef
}

export interface ChordPoolEntry {
  root: PitchClass
  quality: ChordQuality
}

export interface ChordPoolEntry {
  root: PitchClass
  quality: ChordQuality
}

export interface ChordFilters {
  qualities: ChordQuality[]
  roots: PitchClass[]
  inversions: Inversion[]
  clefs: Clef[]
  minMidi: number
  maxMidi: number
  /** When set, generator picks exact root+quality pairs instead of independent draws */
  chordPool?: ChordPoolEntry[]
}

export const AUTO_ADVANCE_MIN_SEC = 2
export const AUTO_ADVANCE_MAX_SEC = 30
export const AUTO_ADVANCE_DEFAULT_SEC = 8

export function clampAutoInterval(sec: number): number {
  return Math.min(
    AUTO_ADVANCE_MAX_SEC,
    Math.max(AUTO_ADVANCE_MIN_SEC, Math.round(sec)),
  )
}

export interface SessionConfig {
  filters: ChordFilters
  mode: SessionMode
  matchStrictness: MatchStrictness
  rootAccent: boolean
  showSymbol: boolean
  autoAdvanceIntervalSec: number
  presetKeyId: string
  presetLevelId: string
}

export type TrialResult = 'correct' | 'incorrect' | 'skipped' | 'hinted' | 'pending'

export interface Trial {
  prompt: ChordSpec
  shownAt: number
  answeredAt?: number
  result: TrialResult
  playedNotes: number[]
}

export interface SessionStats {
  correct: number
  incorrect: number
  skipped: number
  hinted: number
  reactionTimes: number[]
}

export const PITCH_CLASS_NAMES = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
] as const

export const DEFAULT_FILTERS: ChordFilters = {
  qualities: ['maj', 'min'],
  roots: [0, 2, 4, 5, 7, 9, 11],
  inversions: [0, 1, 2],
  clefs: ['treble', 'bass'],
  minMidi: 48,
  maxMidi: 84,
}

export const DEFAULT_SESSION_CONFIG: SessionConfig = {
  filters: DEFAULT_FILTERS,
  mode: 'flash',
  matchStrictness: 'pitchClass',
  rootAccent: true,
  showSymbol: true,
  autoAdvanceIntervalSec: AUTO_ADVANCE_DEFAULT_SEC,
  presetKeyId: 'c-major',
  presetLevelId: '1-primary',
}
