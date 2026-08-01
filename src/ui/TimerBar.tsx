import { useEffect, useState } from 'react'

interface TimerBarProps {
  shownAt: number
  intervalSec: number
  active: boolean
}

interface TimerSnapshot {
  /** Remaining time as 0–1 (1 = full bar, 0 = elapsed). */
  remainingRatio: number
  /** Whole seconds left, synced to the same clock as the bar. */
  remainingSec: number
}

function snapshotTimer(shownAt: number, intervalSec: number, now = Date.now()): TimerSnapshot {
  const totalMs = intervalSec * 1000
  const remainingMs = Math.max(0, shownAt + totalMs - now)
  const remainingRatio = totalMs > 0 ? remainingMs / totalMs : 0
  const remainingSec =
    remainingMs <= 0 ? 0 : Math.max(1, Math.floor(remainingMs / 1000))

  return { remainingRatio, remainingSec }
}

export function TimerBar({ shownAt, intervalSec, active }: TimerBarProps) {
  const [timer, setTimer] = useState<TimerSnapshot>(() =>
    snapshotTimer(shownAt, intervalSec),
  )

  useEffect(() => {
    if (!active) {
      setTimer({ remainingRatio: 0, remainingSec: 0 })
      return
    }

    let raf = 0
    const tick = () => {
      setTimer(snapshotTimer(shownAt, intervalSec))
      raf = requestAnimationFrame(tick)
    }

    setTimer(snapshotTimer(shownAt, intervalSec))
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [shownAt, intervalSec, active])

  if (!active) return null

  const { remainingRatio, remainingSec } = timer

  return (
    <div
      className="timer-bar"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={intervalSec}
      aria-valuenow={remainingSec}
      aria-label={`Next chord in ${remainingSec} seconds`}
    >
      <div className="timer-bar-track">
        <div
          className="timer-bar-fill"
          style={{ transform: `scaleX(${remainingRatio})` }}
        />
      </div>
      <span className="timer-bar-label">{remainingSec}s</span>
    </div>
  )
}
