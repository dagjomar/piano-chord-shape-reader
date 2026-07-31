import { useEffect, useRef } from 'react'
import { renderChordToElement } from '../notation/renderChord'
import type { ChordSpec } from '../domain/types'

interface StaffStageProps {
  chord: ChordSpec
  rootAccent: boolean
  showSymbol: boolean
  hinted: boolean
}

export function StaffStage({ chord, rootAccent, showSymbol, hinted }: StaffStageProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    renderChordToElement(containerRef.current, chord, {
      rootAccent: rootAccent || hinted,
      showSymbol,
      highlight: hinted,
    })
  }, [chord, rootAccent, showSymbol, hinted])

  return (
    <div className={`staff-stage ${hinted ? 'hinted' : ''}`}>
      <div ref={containerRef} className="staff-canvas" aria-label="Chord on staff" />
      {hinted && <p className="hint-label">Root highlighted — assisted</p>}
    </div>
  )
}
