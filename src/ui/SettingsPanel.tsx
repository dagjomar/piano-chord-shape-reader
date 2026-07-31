import type { SessionConfig, SessionStats } from '../domain/types'
import { averageReaction } from '../session/flashSession'
import { PITCH_CLASS_NAMES } from '../domain/types'

interface SettingsPanelProps {
  config: SessionConfig
  onChange: (config: SessionConfig) => void
}

function toggleItem<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item]
}

export function SettingsPanel({ config, onChange }: SettingsPanelProps) {
  const { filters } = config

  return (
    <aside className="settings-panel">
      <fieldset>
        <legend>Qualities</legend>
        {(['maj', 'min'] as const).map((q) => (
          <label key={q}>
            <input
              type="checkbox"
              checked={filters.qualities.includes(q)}
              onChange={() =>
                onChange({
                  ...config,
                  filters: {
                    ...filters,
                    qualities: toggleItem(filters.qualities, q),
                  },
                })
              }
            />
            {q === 'maj' ? 'Major' : 'Minor'}
          </label>
        ))}
      </fieldset>

      <fieldset>
        <legend>Inversions</legend>
        {([0, 1, 2] as const).map((inv) => (
          <label key={inv}>
            <input
              type="checkbox"
              checked={filters.inversions.includes(inv)}
              onChange={() =>
                onChange({
                  ...config,
                  filters: {
                    ...filters,
                    inversions: toggleItem(filters.inversions, inv),
                  },
                })
              }
            />
            {inv === 0 ? 'Root' : inv === 1 ? '1st' : '2nd'}
          </label>
        ))}
      </fieldset>

      <fieldset>
        <legend>Clef</legend>
        {(['treble', 'bass'] as const).map((clef) => (
          <label key={clef}>
            <input
              type="checkbox"
              checked={filters.clefs.includes(clef)}
              onChange={() =>
                onChange({
                  ...config,
                  filters: {
                    ...filters,
                    clefs: toggleItem(filters.clefs, clef),
                  },
                })
              }
            />
            {clef === 'treble' ? 'Treble' : 'Bass'}
          </label>
        ))}
      </fieldset>

      <fieldset>
        <legend>Roots</legend>
        <div className="root-grid">
          {PITCH_CLASS_NAMES.map((name, pc) => (
            <label key={name}>
              <input
                type="checkbox"
                checked={filters.roots.includes(pc as typeof filters.roots[number])}
                onChange={() =>
                  onChange({
                    ...config,
                    filters: {
                      ...filters,
                      roots: toggleItem(filters.roots, pc as typeof filters.roots[number]),
                    },
                  })
                }
              />
              {name}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>Display</legend>
        <label>
          <input
            type="checkbox"
            checked={config.rootAccent}
            onChange={() => onChange({ ...config, rootAccent: !config.rootAccent })}
          />
          Root accent
        </label>
        <label>
          <input
            type="checkbox"
            checked={config.showSymbol}
            onChange={() => onChange({ ...config, showSymbol: !config.showSymbol })}
          />
          Chord symbol
        </label>
      </fieldset>

      <fieldset>
        <legend>Matching</legend>
        <label>
          <input
            type="radio"
            name="match"
            checked={config.matchStrictness === 'pitchClass'}
            onChange={() => onChange({ ...config, matchStrictness: 'pitchClass' })}
          />
          Forgiving (pitch class)
        </label>
        <label>
          <input
            type="radio"
            name="match"
            checked={config.matchStrictness === 'strict'}
            onChange={() => onChange({ ...config, matchStrictness: 'strict' })}
          />
          Strict voicing
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
