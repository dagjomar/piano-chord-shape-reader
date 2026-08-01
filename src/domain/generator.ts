import { fitChordToRange, type RootRegister } from './chordNotes'
import type { ChordFilters, ChordSpec, Clef, Inversion, PitchClass } from './types'

const ROOT_REGISTERS: RootRegister[] = ['low', 'mid', 'high']

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]!
}

export function generateChord(filters: ChordFilters): ChordSpec {
  let root: PitchClass
  let quality: ChordFilters['qualities'][number]

  if (filters.chordPool && filters.chordPool.length > 0) {
    const entry = pickRandom(filters.chordPool)
    root = entry.root
    quality = entry.quality
  } else {
    root = pickRandom(filters.roots)
    quality = pickRandom(filters.qualities)
  }

  const inversion = pickRandom(filters.inversions)
  const clef = pickRandom(filters.clefs)
  const register = pickRandom(ROOT_REGISTERS)
  const { octave } = fitChordToRange(
    root,
    quality,
    inversion,
    clef,
    filters.minMidi,
    filters.maxMidi,
    register,
  )

  return { root, quality, inversion, octave, clef }
}

export function generateChordBatch(filters: ChordFilters, count: number): ChordSpec[] {
  return Array.from({ length: count }, () => generateChord(filters))
}

export function allRootsInKey(keyRoot: PitchClass, mode: 'major' | 'minor'): PitchClass[] {
  const majorScale = [0, 2, 4, 5, 7, 9, 11]
  const naturalMinor = [0, 2, 3, 5, 7, 8, 10]
  const scale = mode === 'major' ? majorScale : naturalMinor
  return scale.map((step) => ((keyRoot + step) % 12) as PitchClass)
}

export function parseInversions(values: number[]): Inversion[] {
  return values.filter((v): v is Inversion => v === 0 || v === 1 || v === 2)
}

export function parsePitchClasses(values: number[]): PitchClass[] {
  return values
    .filter((v) => v >= 0 && v <= 11)
    .map((v) => v as PitchClass)
}

export function parseClefs(values: string[]): Clef[] {
  return values.filter((v): v is Clef => v === 'treble' || v === 'bass')
}
