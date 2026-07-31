import { useCallback, useEffect, useRef } from 'react'

const WHITE_KEYS = [0, 2, 4, 5, 7, 9, 11]
const START_MIDI = 48
const END_MIDI = 72

interface VirtualPianoProps {
  activeNotes: Set<number>
  onNoteOn: (midi: number) => void
  onNoteOff: (midi: number) => void
}

function isBlackKey(midi: number): boolean {
  return !WHITE_KEYS.includes(midi % 12)
}

export function VirtualPiano({ activeNotes, onNoteOn, onNoteOff }: VirtualPianoProps) {
  const held = useRef<Set<number>>(new Set())

  const keys: number[] = []
  for (let midi = START_MIDI; midi <= END_MIDI; midi++) {
    if (!isBlackKey(midi)) keys.push(midi)
  }

  const handleDown = useCallback(
    (midi: number) => {
      if (held.current.has(midi)) return
      held.current.add(midi)
      onNoteOn(midi)
    },
    [onNoteOn],
  )

  useEffect(() => {
    const onPointerUp = () => {
      for (const midi of [...held.current]) {
        held.current.delete(midi)
        onNoteOff(midi)
      }
    }
    window.addEventListener('pointerup', onPointerUp)
    return () => window.removeEventListener('pointerup', onPointerUp)
  }, [onNoteOff])

  return (
    <div className="virtual-piano" role="group" aria-label="Virtual piano keyboard">
      {keys.map((midi) => {
        const black = midi + 1
        const hasBlack = black <= END_MIDI && isBlackKey(black)
        return (
          <div key={midi} className="piano-key-group">
            <button
              type="button"
              className={`piano-key white ${activeNotes.has(midi) ? 'active' : ''}`}
              onPointerDown={(e) => {
                e.preventDefault()
                handleDown(midi)
              }}
              aria-label={`Note ${midi}`}
            />
            {hasBlack && (
              <button
                type="button"
                className={`piano-key black ${activeNotes.has(black) ? 'active' : ''}`}
                onPointerDown={(e) => {
                  e.preventDefault()
                  handleDown(black)
                }}
                aria-label={`Note ${black}`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
