import { useCallback, useEffect, useRef, useState } from 'react'

export interface MidiState {
  supported: boolean
  enabled: boolean
  error: string | null
  activeNotes: Set<number>
}

export function useMidiInput(onNotesChange?: (notes: number[]) => void) {
  const [state, setState] = useState<MidiState>({
    supported: typeof navigator !== 'undefined' && 'requestMIDIAccess' in navigator,
    enabled: false,
    error: null,
    activeNotes: new Set(),
  })
  const activeRef = useRef<Map<string, number>>(new Map())
  const onNotesChangeRef = useRef(onNotesChange)
  onNotesChangeRef.current = onNotesChange

  const emit = useCallback(() => {
    const notes = [...activeRef.current.values()].sort((a, b) => a - b)
    onNotesChangeRef.current?.(notes)
    setState((prev) => ({ ...prev, activeNotes: new Set(notes) }))
  }, [])

  const enable = useCallback(async () => {
    if (!state.supported) {
      setState((prev) => ({ ...prev, error: 'Web MIDI is not supported in this browser.' }))
      return
    }
    try {
      const access = await navigator.requestMIDIAccess()
      const handleMessage = (event: MIDIMessageEvent) => {
        const [status, note, velocity] = event.data!
        const command = status & 0xf0
        const target = event.currentTarget as MIDIInput | null
        const key = `${target?.id ?? 'midi'}-${note}`
        if (command === 0x90 && velocity > 0) {
          activeRef.current.set(key, note)
        } else if (command === 0x80 || (command === 0x90 && velocity === 0)) {
          activeRef.current.delete(key)
        }
        emit()
      }

      for (const input of access.inputs.values()) {
        input.onmidimessage = handleMessage
      }
      access.onstatechange = () => {
        for (const input of access.inputs.values()) {
          input.onmidimessage = handleMessage
        }
      }

      setState((prev) => ({ ...prev, enabled: true, error: null }))
    } catch {
      setState((prev) => ({
        ...prev,
        enabled: false,
        error: 'MIDI access was denied. Use the on-screen piano instead.',
      }))
    }
  }, [emit, state.supported])

  const setVirtualNotes = useCallback(
    (notes: number[]) => {
      activeRef.current = new Map(notes.map((n, i) => [`virtual-${i}`, n]))
      emit()
    },
    [emit],
  )

  const noteOn = useCallback(
    (note: number) => {
      activeRef.current.set(`virtual-${note}`, note)
      emit()
    },
    [emit],
  )

  const noteOff = useCallback(
    (note: number) => {
      activeRef.current.delete(`virtual-${note}`)
      emit()
    },
    [emit],
  )

  useEffect(() => {
    return () => {
      activeRef.current.clear()
    }
  }, [])

  return { ...state, enable, setVirtualNotes, noteOn, noteOff }
}
