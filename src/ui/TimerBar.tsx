import { useEffect, useState } from 'react'

interface TimerBarProps {
  shownAt: number
  intervalSec: number
  active: boolean
}

export function TimerBar({ shownAt, intervalSec, active }: TimerBarProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!active) {
      setProgress(0)
      return
    }

    let raf = 0
    const tick = () => {
      const elapsed = Date.now() - shownAt
      const total = intervalSec * 1000
      setProgress(Math.min(1, elapsed / total))
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [shownAt, intervalSec, active])

  if (!active) return null

  const remainingSec = Math.max(0, Math.ceil(intervalSec * (1 - progress)))

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
        <div className="timer-bar-fill" style={{ width: `${progress * 100}%` }} />
      </div>
      <span className="timer-bar-label">{remainingSec}s</span>
    </div>
  )
}
