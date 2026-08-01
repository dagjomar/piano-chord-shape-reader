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
import { TimerBar } from './TimerBar'
import { IntervalControl } from './IntervalControl'
import './App.css'

export default function App() {
  const [config, setConfig] = useState<SessionConfig>(loadSessionConfig)
  const [session, setSession] = useState<FlashSessionState>(() => createFlashSession(config))
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [autoModeActive, setAutoModeActive] = useState(false)

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
    if (!autoModeActive) return
    if (session.trial.result !== 'pending') return

    const ms = config.autoAdvanceIntervalSec * 1000
    const shownAt = session.trial.shownAt

    const id = window.setInterval(() => {
      if (Date.now() - shownAt >= ms) {
        setSession((s) => skipTrial(s, config))
      }
    }, 100)

    return () => window.clearInterval(id)
  }, [
    autoModeActive,
    session.trial.shownAt,
    session.trial.result,
    config,
  ])

  const startAutoMode = () => {
    setAutoModeActive(true)
    setSettingsOpen(false)
    setSession(createFlashSession(config))
  }

  const exitAutoMode = () => {
    setAutoModeActive(false)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && autoModeActive) {
        setAutoModeActive(false)
        return
      }
      if (autoModeActive && settingsOpen) return
      if (e.key === 'n' || e.key === 'N') setSession((s) => skipTrial(s, config))
      if (e.key === 'h' || e.key === 'H') setSession((s) => revealHint(s))
      if ((e.key === 's' || e.key === 'S') && !autoModeActive) setSettingsOpen((o) => !o)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [config, autoModeActive, settingsOpen])

  const resetSession = () => setSession(createFlashSession(config))
  const practiceKey = findPracticeKey(config.presetKeyId)
  const practiceLevel = findPracticeLevel(config.presetLevelId)

  return (
    <div className={`app${autoModeActive ? ' auto-mode' : ''}`}>
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">♩</span>
          <div className="brand-text">
            <h1>Chord Shape Reader</h1>
            <p className="practice-badge">
              {practiceKey.name} · {practiceLevel.name}
              {autoModeActive && <span className="auto-mode-badge"> · Auto</span>}
            </p>
          </div>
        </div>
        <StatsBar stats={session.stats} />
        <div className="header-actions">
          {autoModeActive ? (
            <button type="button" className="btn ghost" onClick={exitAutoMode}>
              Exit auto mode
            </button>
          ) : (
            <>
              <button type="button" className="btn ghost" onClick={() => setSettingsOpen((o) => !o)}>
                Settings <kbd>S</kbd>
              </button>
              {!midi.enabled && midi.supported && (
                <button type="button" className="btn" onClick={() => void midi.enable()}>
                  Enable MIDI
                </button>
              )}
            </>
          )}
        </div>
      </header>

      <main className={`practice-stage${settingsOpen && !autoModeActive ? ' settings-open' : ''}`}>
        {settingsOpen && !autoModeActive && (
          <SettingsPanel
            config={config}
            onChange={(next) => {
              setConfig(next)
              setSession(createFlashSession(next))
            }}
            onStartAutoMode={startAutoMode}
          />
        )}

        <section className="flash-panel">
          {autoModeActive && (
            <div className="auto-mode-controls">
              <span className="auto-mode-controls-label">Interval</span>
              <IntervalControl
                compact
                value={config.autoAdvanceIntervalSec}
                onChange={(autoAdvanceIntervalSec) =>
                  setConfig((c) => ({ ...c, autoAdvanceIntervalSec }))
                }
              />
            </div>
          )}

          <StaffStage
            chord={session.current}
            rootAccent={config.rootAccent}
            showSymbol={config.showSymbol}
            hinted={session.hinted}
          />

          <TimerBar
            active={autoModeActive && session.trial.result === 'pending'}
            shownAt={session.trial.shownAt}
            intervalSec={config.autoAdvanceIntervalSec}
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
