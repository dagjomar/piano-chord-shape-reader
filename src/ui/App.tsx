import { useCallback, useEffect, useState } from 'react'
import { useMidiInput } from '../input/useMidi'
import { VirtualPiano } from '../input/VirtualPiano'
import { loadSessionConfig, saveSessionConfig } from '../presets/storage'
import { findPracticeKey, findPracticeLevel } from '../presets/definitions'
import {
  checkAnswer,
  createFlashSession,
  revealHint,
  skipTrial,
  type FlashSessionState,
} from '../session/flashSession'
import type { SessionConfig } from '../domain/types'
import { SettingsPanel, StatsBar } from './SettingsPanel'
import { StaffStage } from './StaffStage'
import './App.css'

export default function App() {
  const [config, setConfig] = useState<SessionConfig>(loadSessionConfig)
  const [session, setSession] = useState<FlashSessionState>(() => createFlashSession(config))
  const [settingsOpen, setSettingsOpen] = useState(false)

  const handleNotesChange = useCallback(
    (notes: number[]) => {
      setSession((prev) => {
        const next = checkAnswer(prev, notes, config)
        return next ?? prev
      })
    },
    [config],
  )

  const midi = useMidiInput(handleNotesChange)

  useEffect(() => {
    saveSessionConfig(config)
  }, [config])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'n' || e.key === 'N') setSession((s) => skipTrial(s, config))
      if (e.key === 'h' || e.key === 'H') setSession((s) => revealHint(s))
      if (e.key === 's' || e.key === 'S') setSettingsOpen((o) => !o)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [config])

  const resetSession = () => setSession(createFlashSession(config))
  const practiceKey = findPracticeKey(config.presetKeyId)
  const practiceLevel = findPracticeLevel(config.presetLevelId)

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">♩</span>
          <div className="brand-text">
            <h1>Chord Shape Reader</h1>
            <p className="practice-badge">
              {practiceKey.name} · {practiceLevel.name}
            </p>
          </div>
        </div>
        <StatsBar stats={session.stats} />
        <div className="header-actions">
          <button type="button" className="btn ghost" onClick={() => setSettingsOpen((o) => !o)}>
            Settings <kbd>S</kbd>
          </button>
          {!midi.enabled && midi.supported && (
            <button type="button" className="btn" onClick={() => void midi.enable()}>
              Enable MIDI
            </button>
          )}
        </div>
      </header>

      <main className={`practice-stage${settingsOpen ? ' settings-open' : ''}`}>
        {settingsOpen && (
          <SettingsPanel
            config={config}
            onChange={(next) => {
              setConfig(next)
              setSession(createFlashSession(next))
            }}
          />
        )}

        <section className="flash-panel">
          <StaffStage
            chord={session.current}
            rootAccent={config.rootAccent}
            showSymbol={config.showSymbol}
            hinted={session.hinted}
          />

          <div className="action-row">
            <button
              type="button"
              className="btn secondary"
              onClick={() => setSession((s) => revealHint(s))}
            >
              Hint root <kbd>H</kbd>
            </button>
            <button
              type="button"
              className="btn secondary"
              onClick={() => setSession((s) => skipTrial(s, config))}
            >
              Skip <kbd>N</kbd>
            </button>
            <button type="button" className="btn ghost" onClick={resetSession}>
              Reset
            </button>
          </div>

          {midi.error && <p className="midi-status error">{midi.error}</p>}
          {midi.enabled && <p className="midi-status ok">MIDI connected — play the chord</p>}
          {!midi.supported && (
            <p className="midi-status">Use the on-screen piano below</p>
          )}

          <VirtualPiano
            activeNotes={midi.activeNotes}
            onNoteOn={midi.noteOn}
            onNoteOff={midi.noteOff}
          />
        </section>
      </main>
    </div>
  )
}
