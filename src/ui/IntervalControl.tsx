import {
  AUTO_ADVANCE_MAX_SEC,
  AUTO_ADVANCE_MIN_SEC,
  clampAutoInterval,
} from '../domain/types'

interface IntervalControlProps {
  value: number
  onChange: (seconds: number) => void
  compact?: boolean
}

export function IntervalControl({ value, onChange, compact }: IntervalControlProps) {
  const clamped = clampAutoInterval(value)

  const step = (delta: number) => {
    onChange(clampAutoInterval(clamped + delta))
  }

  return (
    <div className={`interval-control${compact ? ' compact' : ''}`}>
      <button
        type="button"
        className="btn ghost interval-btn"
        aria-label="Decrease interval"
        disabled={clamped <= AUTO_ADVANCE_MIN_SEC}
        onClick={() => step(-1)}
      >
        −
      </button>
      <span className="interval-value" aria-live="polite">
        {clamped}s
      </span>
      <button
        type="button"
        className="btn ghost interval-btn"
        aria-label="Increase interval"
        disabled={clamped >= AUTO_ADVANCE_MAX_SEC}
        onClick={() => step(1)}
      >
        +
      </button>
    </div>
  )
}
