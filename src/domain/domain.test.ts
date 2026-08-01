import { describe, expect, it } from 'vitest'
import { chordMidiNotes, chordSymbol, fitChordToRange, octaveForRegister } from './chordNotes'
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

describe('octaveForRegister', () => {
  it('maps low, mid, and high to distinct octaves', () => {
    const valid = [3, 4, 5]
    expect(octaveForRegister(valid, 'low')).toBe(3)
    expect(octaveForRegister(valid, 'mid')).toBe(4)
    expect(octaveForRegister(valid, 'high')).toBe(5)
  })
})

describe('fitChordToRange', () => {
  it('places treble chords in range', () => {
    const { notes } = fitChordToRange(0, 'maj', 0, 'treble', 48, 84)
    expect(notes.every((n) => n >= 48 && n <= 84)).toBe(true)
  })

  it('places C major at low, mid, and high root positions', () => {
    const low = fitChordToRange(0, 'maj', 0, 'treble', 48, 84, 'low')
    const mid = fitChordToRange(0, 'maj', 0, 'treble', 48, 84, 'mid')
    const high = fitChordToRange(0, 'maj', 0, 'treble', 48, 84, 'high')

    expect(low.octave).toBeLessThan(mid.octave)
    expect(mid.octave).toBeLessThan(high.octave)
    expect(low.notes[0]).toBe(48)
    expect(mid.notes[0]).toBe(60)
    expect(high.notes[0]).toBe(72)
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

  it('uses chordPool when provided', () => {
    const filters = {
      ...DEFAULT_FILTERS,
      chordPool: [
        { root: 0 as const, quality: 'maj' as const },
        { root: 4 as const, quality: 'min' as const },
      ],
    }
    for (let i = 0; i < 20; i++) {
      const chord = generateChord(filters)
      const valid =
        (chord.root === 0 && chord.quality === 'maj') ||
        (chord.root === 4 && chord.quality === 'min')
      expect(valid).toBe(true)
    }
  })
})

describe('chordSymbol', () => {
  it('formats symbols', () => {
    expect(chordSymbol(0, 'maj', 0)).toBe('C')
    expect(chordSymbol(9, 'min', 1)).toBe('Am/3rd')
  })
})
