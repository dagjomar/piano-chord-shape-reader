import {
  clampAutoInterval,
  type SessionConfig,
} from '../domain/types'
import {
  buildSessionConfig,
  DEFAULT_KEY_ID,
  DEFAULT_LEVEL_ID,
} from './definitions'

const STORAGE_KEY = 'pcsr-session-config'

export function loadSessionConfig(): SessionConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return buildSessionConfig(DEFAULT_KEY_ID, DEFAULT_LEVEL_ID)

    const saved = JSON.parse(raw) as Partial<SessionConfig>
    const keyId = saved.presetKeyId ?? DEFAULT_KEY_ID
    const levelId = saved.presetLevelId ?? DEFAULT_LEVEL_ID

    return buildSessionConfig(keyId, levelId, {
      rootAccent: saved.rootAccent ?? true,
      showSymbol: saved.showSymbol ?? true,
      autoAdvanceIntervalSec: clampAutoInterval(
        saved.autoAdvanceIntervalSec ?? 8,
      ),
    })
  } catch {
    return buildSessionConfig(DEFAULT_KEY_ID, DEFAULT_LEVEL_ID)
  }
}

export function saveSessionConfig(config: SessionConfig): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      presetKeyId: config.presetKeyId,
      presetLevelId: config.presetLevelId,
      rootAccent: config.rootAccent,
      showSymbol: config.showSymbol,
      autoAdvanceIntervalSec: config.autoAdvanceIntervalSec,
    }),
  )
}
