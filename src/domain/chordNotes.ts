import type { ChordQuality, Inversion, PitchClass } from './types'

const QUALITY_INTERVALS: Record<ChordQuality, [number, number, number]> = {
  maj: [0, 4, 7],
  min: [0, 3, 7],
}

export function pitchClassFromMidi(midi: number): PitchClass {
  return ((midi % 12) + 12) % 12 as PitchClass
}

export function midiFromPitchClass(pc: PitchClass, octave: number): number {
  return pc + (octave + 1) * 12
}

export function rotateInversion(intervals: number[], inversion: Inversion): number[] {
  const rotated = [...intervals]
  for (let i = 0; i < inversion; i++) {
    rotated.push(rotated.shift()! + 12)
  }
  return rotated
}

export function chordIntervals(quality: ChordQuality, inversion: Inversion): number[] {
  return rotateInversion([...QUALITY_INTERVALS[quality]], inversion)
}

export function chordMidiNotes(
  root: PitchClass,
  quality: ChordQuality,
  inversion: Inversion,
  octave: number,
): number[] {
  const intervals = chordIntervals(quality, inversion)
  const rootMidi = midiFromPitchClass(root, octave)
  return intervals.map((interval) => rootMidi + interval)
}

export function fitChordToRange(
  root: PitchClass,
  quality: ChordQuality,
  inversion: Inversion,
  clef: 'treble' | 'bass',
  minMidi: number,
  maxMidi: number,
): { octave: number; notes: number[] } {
  const preferred = clef === 'treble' ? 4 : 3
  for (let octave = preferred - 2; octave <= preferred + 2; octave++) {
    const notes = chordMidiNotes(root, quality, inversion, octave)
    if (notes.every((n) => n >= minMidi && n <= maxMidi)) {
      return { octave, notes }
    }
  }
  const fallback = clef === 'treble' ? 4 : 3
  return {
    octave: fallback,
    notes: chordMidiNotes(root, quality, inversion, fallback),
  }
}

export function chordSymbol(root: PitchClass, quality: ChordQuality, inversion: Inversion): string {
  const names = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']
  const suffix = quality === 'maj' ? '' : 'm'
  const inv = inversion === 0 ? '' : inversion === 1 ? '/3rd' : '/5th'
  return `${names[root]}${suffix}${inv}`
}
