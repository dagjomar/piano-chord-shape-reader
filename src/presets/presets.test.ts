import { describe, expect, it } from 'vitest'
import {
  buildFilters,
  buildSessionConfig,
  describePreset,
  findPracticeKey,
  PRACTICE_KEYS,
  PRACTICE_LEVELS,
} from '../presets/definitions'
import { generateChord } from '../domain/generator'
import { PITCH_CLASS_NAMES } from '../domain/types'

describe('practice presets', () => {
  it('level 1 in C major uses I, IV, V only', () => {
    const filters = buildFilters('c-major', '1-primary')
    expect(filters.chordPool).toEqual([
      { root: 0, quality: 'maj' },
      { root: 5, quality: 'maj' },
      { root: 7, quality: 'maj' },
    ])
    expect(filters.inversions).toEqual([0])
  })

  it('level 2 adds iii and vi minors', () => {
    const filters = buildFilters('c-major', '2-minors')
    expect(filters.chordPool).toHaveLength(5)
    expect(filters.chordPool).toContainEqual({ root: 4, quality: 'min' })
    expect(filters.chordPool).toContainEqual({ root: 9, quality: 'min' })
  })

  it('G major primary triads are G, C, D', () => {
    const filters = buildFilters('g-major', '1-primary')
    expect(filters.chordPool).toEqual([
      { root: 7, quality: 'maj' },
      { root: 0, quality: 'maj' },
      { root: 2, quality: 'maj' },
    ])
  })

  it('buildSessionConfig wires key, level, and matching', () => {
    const config = buildSessionConfig('d-major', '7-strict')
    expect(config.presetKeyId).toBe('d-major')
    expect(config.presetLevelId).toBe('7-strict')
    expect(config.matchStrictness).toBe('strict')
    expect(config.filters.chordPool!.length).toBeGreaterThan(3)
  })

  it('describePreset lists chord symbols for the key', () => {
    const summary = describePreset('c-major', '1-primary')
    expect(summary).toContain('C')
    expect(summary).toContain('F')
    expect(summary).toContain('G')
    expect(summary).toContain('root position')
  })

  it('every key and level pair produces a valid config', () => {
    for (const key of PRACTICE_KEYS) {
      for (const level of PRACTICE_LEVELS) {
        const config = buildSessionConfig(key.id, level.id)
        expect(config.filters.chordPool!.length).toBeGreaterThan(0)
        expect(config.filters.inversions.length).toBeGreaterThan(0)
      }
    }
  })
})

describe('generateChord with chordPool', () => {
  it('respects exact root+quality pairs', () => {
    const filters = buildFilters('c-major', '2-minors')
    for (let i = 0; i < 30; i++) {
      const chord = generateChord(filters)
      const match = filters.chordPool!.some(
        (entry) => entry.root === chord.root && entry.quality === chord.quality,
      )
      expect(match).toBe(true)
      expect(filters.inversions).toContain(chord.inversion)
    }
  })

  it('never produces C minor at level 1 C major', () => {
    const filters = buildFilters('c-major', '1-primary')
    for (let i = 0; i < 20; i++) {
      const chord = generateChord(filters)
      if (chord.root === 0) expect(chord.quality).toBe('maj')
    }
  })
})

describe('findPracticeKey', () => {
  it('falls back to C major for unknown ids', () => {
    expect(findPracticeKey('unknown').root).toBe(PITCH_CLASS_NAMES.indexOf('C'))
  })
})
