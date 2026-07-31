import { useEffect, useRef } from 'react'
import { renderChordToElement } from '../notation/renderChord'
import type { ChordSpec } from '../domain/types'

interface StaffStageProps {
  chord: ChordSpec
  rootAccent: boolean
  showSymbol: boolean
  hinted: boolean
}

function staffWidthFor(available: number): number {
  if (available <= 0) return 220
  if (available < 280) return Math.max(180, Math.floor(available - 8))
  return 280
}

export function StaffStage({ chord, rootAccent, showSymbol, hinted }: StaffStageProps) {
  const stageRef = useRef<HTMLDivElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const stage = stageRef.current
    const container = containerRef.current
    if (!stage || !container) return

    const render = () => {
      const width = staffWidthFor(stage.clientWidth)
      renderChordToElement(container, chord, {
        rootAccent: rootAccent || hinted,
        showSymbol,
        width,
      })
    }

    render()
    const observer = new ResizeObserver(render)
    observer.observe(stage)
    return () => observer.disconnect()
  }, [chord, rootAccent, showSymbol, hinted])

  return (
    <div ref={stageRef} className={`staff-stage ${hinted ? 'hinted' : ''}`}>
      <div ref={containerRef} className="staff-canvas" aria-label="Chord on staff" />
      {hinted && <p className="hint-label">Root highlighted — assisted</p>}
    </div>
  )
}
