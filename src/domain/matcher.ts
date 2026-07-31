import { chordMidiNotes, pitchClassFromMidi } from './chordNotes'
import type { ChordSpec, MatchStrictness } from './types'

export function expectedMidiNotes(chord: ChordSpec): number[] {
  return chordMidiNotes(chord.root, chord.quality, chord.inversion, chord.octave)
}

export function pitchClassSet(notes: number[]): Set<number> {
  return new Set(notes.map(pitchClassFromMidi))
}

export function matchesChord(
  playedNotes: number[],
  chord: ChordSpec,
  strictness: MatchStrictness,
): boolean {
  if (playedNotes.length === 0) return false

  const expected = expectedMidiNotes(chord)
  const uniquePlayed = [...new Set(playedNotes)].sort((a, b) => a - b)

  if (strictness === 'strict') {
    const uniqueExpected = [...new Set(expected)].sort((a, b) => a - b)
    if (uniquePlayed.length !== uniqueExpected.length) return false
    return uniquePlayed.every((note, i) => note === uniqueExpected[i])
  }

  const playedClasses = pitchClassSet(uniquePlayed)
  const expectedClasses = pitchClassSet(expected)
  if (playedClasses.size !== expectedClasses.size) return false
  for (const pc of expectedClasses) {
    if (!playedClasses.has(pc)) return false
  }
  return true
}
