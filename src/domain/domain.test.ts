import { describe, expect, it } from 'vitest'
import { chordMidiNotes, chordSymbol, fitChordToRange } from './chordNotes'
import { generateChord } from './generator'
import { matchesChord } from './matcher'
import { DEFAULT_FILTERS } from './types'

describe('chordMidiNotes', () => {
  it('builds C major root position', () => {
    expect(chordMidiNotes(0, 'maj', 0, 4)).toEqual([60, 64, 67])
  })

  it('builds A minor first inversion', () => {
    expect(chordMidiNotes(9, 'min', 1, 3)).toEqual([60, 64, 69])
  })
})

describe('fitChordToRange', () => {
  it('places treble chords in range', () => {
    const { notes } = fitChordToRange(0, 'maj', 0, 'treble', 48, 84)
    expect(notes.every((n) => n >= 48 && n <= 84)).toBe(true)
  })
})

describe('matchesChord', () => {
  const cMajor: Parameters<typeof matchesChord>[1] = {
    root: 0,
    quality: 'maj',
    inversion: 0,
    octave: 4,
    clef: 'treble',
  }

  it('accepts pitch-class match in different octaves', () => {
    expect(matchesChord([48, 52, 55], cMajor, 'pitchClass')).toBe(true)
  })

  it('rejects wrong quality by pitch class', () => {
    expect(matchesChord([60, 63, 67], cMajor, 'pitchClass')).toBe(false)
  })

  it('requires exact voicing in strict mode', () => {
    expect(matchesChord([48, 52, 55], cMajor, 'strict')).toBe(false)
    expect(matchesChord([60, 64, 67], cMajor, 'strict')).toBe(true)
  })
})

describe('generateChord', () => {
  it('respects filter constraints', () => {
    for (let i = 0; i < 20; i++) {
      const chord = generateChord(DEFAULT_FILTERS)
      expect(DEFAULT_FILTERS.qualities).toContain(chord.quality)
      expect(DEFAULT_FILTERS.roots).toContain(chord.root)
      expect(DEFAULT_FILTERS.inversions).toContain(chord.inversion)
      expect(DEFAULT_FILTERS.clefs).toContain(chord.clef)
    }
  })
})

describe('chordSymbol', () => {
  it('formats symbols', () => {
    expect(chordSymbol(0, 'maj', 0)).toBe('C')
    expect(chordSymbol(9, 'min', 1)).toBe('Am/3rd')
  })
})
