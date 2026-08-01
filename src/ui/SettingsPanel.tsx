import type { SessionConfig, SessionStats } from '../domain/types'
import {
  describePreset,
  findPracticeKey,
  findPracticeLevel,
  PRACTICE_KEYS,
  PRACTICE_LEVELS,
  buildSessionConfig,
} from '../presets/definitions'
import { averageReaction } from '../session/flashSession'
import { IntervalControl } from './IntervalControl'

interface SettingsPanelProps {
  config: SessionConfig
  onChange: (config: SessionConfig) => void
  onStartAutoMode?: () => void
}

export function SettingsPanel({ config, onChange, onStartAutoMode }: SettingsPanelProps) {
  const key = findPracticeKey(config.presetKeyId)
  const level = findPracticeLevel(config.presetLevelId)

  const applyPreset = (keyId: string, levelId: string) => {
    onChange(
      buildSessionConfig(keyId, levelId, {
        rootAccent: config.rootAccent,
        showSymbol: config.showSymbol,
        autoAdvanceIntervalSec: config.autoAdvanceIntervalSec,
      }),
    )
  }

  return (
    <aside className="settings-panel">
      <fieldset className="preset-fieldset">
        <legend>Practice</legend>

        <label className="preset-select">
          Key
          <select
            value={config.presetKeyId}
            onChange={(e) => applyPreset(e.target.value, config.presetLevelId)}
          >
            {PRACTICE_KEYS.map((k) => (
              <option key={k.id} value={k.id}>
                {k.name}
              </option>
            ))}
          </select>
        </label>

        <label className="preset-select">
          Level
          <select
            value={config.presetLevelId}
            onChange={(e) => applyPreset(config.presetKeyId, e.target.value)}
          >
            {PRACTICE_LEVELS.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </label>

        <p className="level-description">{level.description}</p>
        <p className="level-summary">{describePreset(key.id, level.id)}</p>
      </fieldset>

      <fieldset className="auto-mode-fieldset">
        <legend>Auto mode</legend>
        <p className="auto-mode-hint">
          Chords advance automatically after the interval. Play the chord or wait
          for the next one.
        </p>
        <label className="interval-label">
          Seconds between chords
          <IntervalControl
            value={config.autoAdvanceIntervalSec}
            onChange={(autoAdvanceIntervalSec) =>
              onChange({ ...config, autoAdvanceIntervalSec })
            }
          />
        </label>
        {onStartAutoMode && (
          <button type="button" className="btn start-auto-btn" onClick={onStartAutoMode}>
            Start auto mode
          </button>
        )}
      </fieldset>

      <fieldset>
        <legend>Display</legend>
        <label>
          <input
            type="checkbox"
            checked={config.rootAccent}
            onChange={() =>
              onChange({ ...config, rootAccent: !config.rootAccent })
            }
          />
          Root accent
        </label>
        <label>
          <input
            type="checkbox"
            checked={config.showSymbol}
            onChange={() =>
              onChange({ ...config, showSymbol: !config.showSymbol })
            }
          />
          Chord symbol
        </label>
      </fieldset>
    </aside>
  )
}

interface StatsBarProps {
  stats: SessionStats
}

export function StatsBar({ stats }: StatsBarProps) {
  const avg = averageReaction(stats)
  const total = stats.correct + stats.hinted + stats.incorrect + stats.skipped

  return (
    <div className="stats-bar" aria-live="polite">
      <span>✓ {stats.correct}</span>
      <span>◎ {stats.hinted}</span>
      <span>✗ {stats.incorrect}</span>
      <span>→ {stats.skipped}</span>
      <span>{total} trials</span>
      {avg !== null && <span>avg {avg}ms</span>}
    </div>
  )
}
