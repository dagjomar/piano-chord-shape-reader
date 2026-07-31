import { generateChord } from '../domain/generator'
import { matchesChord } from '../domain/matcher'
import type {
  ChordSpec,
  SessionConfig,
  SessionStats,
  Trial,
  TrialResult,
} from '../domain/types'

export interface FlashSessionState {
  current: ChordSpec
  trial: Trial
  stats: SessionStats
  hinted: boolean
}

function emptyStats(): SessionStats {
  return { correct: 0, incorrect: 0, skipped: 0, hinted: 0, reactionTimes: [] }
}

function newTrial(prompt: ChordSpec): Trial {
  return {
    prompt,
    shownAt: Date.now(),
    result: 'pending',
    playedNotes: [],
  }
}

export function createFlashSession(config: SessionConfig): FlashSessionState {
  const current = generateChord(config.filters)
  return {
    current,
    trial: newTrial(current),
    stats: emptyStats(),
    hinted: false,
  }
}

export function checkAnswer(
  state: FlashSessionState,
  playedNotes: number[],
  config: SessionConfig,
): FlashSessionState | null {
  if (state.trial.result !== 'pending') return null
  if (!matchesChord(playedNotes, state.current, config.matchStrictness)) return null

  const answeredAt = Date.now()
  const reaction = answeredAt - state.trial.shownAt
  const result: TrialResult = state.hinted ? 'hinted' : 'correct'

  const stats = { ...state.stats }
  if (result === 'hinted') stats.hinted += 1
  else stats.correct += 1
  stats.reactionTimes = [...stats.reactionTimes, reaction]

  const nextChord = generateChord(config.filters)
  return {
    current: nextChord,
    trial: newTrial(nextChord),
    stats,
    hinted: false,
  }
}

export function skipTrial(state: FlashSessionState, config: SessionConfig): FlashSessionState {
  const stats = { ...state.stats, skipped: state.stats.skipped + 1 }
  const nextChord = generateChord(config.filters)
  return {
    current: nextChord,
    trial: newTrial(nextChord),
    stats,
    hinted: false,
  }
}

export function revealHint(state: FlashSessionState): FlashSessionState {
  if (state.hinted) return state
  return { ...state, hinted: true }
}

export function averageReaction(stats: SessionStats): number | null {
  if (stats.reactionTimes.length === 0) return null
  const sum = stats.reactionTimes.reduce((a, b) => a + b, 0)
  return Math.round(sum / stats.reactionTimes.length)
}
