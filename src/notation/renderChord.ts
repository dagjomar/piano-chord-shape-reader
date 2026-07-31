import { Renderer, Stave, StaveNote, Formatter, Accidental, Voice } from 'vexflow'
import { chordMidiNotes, chordSymbol, pitchClassFromMidi } from '../domain/chordNotes'
import type { ChordSpec } from '../domain/types'

const NOTE_NAMES = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b'] as const

function midiToVexKey(midi: number): string {
  const pc = ((midi % 12) + 12) % 12
  const octave = Math.floor(midi / 12) - 1
  return `${NOTE_NAMES[pc]}/${octave}`
}

function accidentalCount(midi: number): number {
  const name = NOTE_NAMES[((midi % 12) + 12) % 12]
  return name.includes('#') ? 1 : 0
}

export interface RenderOptions {
  rootAccent: boolean
  showSymbol: boolean
  highlight?: boolean
  width?: number
}

function drawChordNote(
  context: ReturnType<Renderer['getContext']>,
  stave: Stave,
  chord: ChordSpec,
  options: Pick<RenderOptions, 'rootAccent' | 'highlight'>,
  formatWidth: number,
): void {
  const midiNotes = chordMidiNotes(chord.root, chord.quality, chord.inversion, chord.octave)
  const keys = midiNotes.map(midiToVexKey)

  const note = new StaveNote({
    keys,
    duration: 'w',
    clef: chord.clef,
  })

  midiNotes.forEach((midi, index) => {
    if (accidentalCount(midi) > 0) {
      note.addModifier(new Accidental('#'), index)
    }
  })

  const rootIndex = midiNotes.findIndex((midi) => pitchClassFromMidi(midi) === chord.root)
  if (options.rootAccent && rootIndex >= 0) {
    note.setKeyStyle(rootIndex, { fillStyle: '#c45c26', strokeStyle: '#c45c26' })
  }

  if (options.highlight) {
    note.setStyle({ fillStyle: '#2a6f4e', strokeStyle: '#2a6f4e' })
  }

  const voice = new Voice({ numBeats: 4, beatValue: 4 })
    .setMode(Voice.Mode.SOFT)
    .addTickable(note)

  new Formatter().joinVoices([voice]).format([voice], formatWidth)
  note.setStave(stave)
  voice.draw(context, stave)
}

export function renderChordToElement(
  container: HTMLDivElement,
  chord: ChordSpec,
  options: RenderOptions,
): void {
  container.innerHTML = ''
  const width = options.width ?? 280
  const height = chord.clef === 'bass' ? 140 : 160

  const renderer = new Renderer(container, Renderer.Backends.SVG)
  renderer.resize(width, height)
  const context = renderer.getContext()

  const staveY = options.showSymbol ? 28 : 10
  const stave = new Stave(10, staveY, width - 20)
  if (chord.clef === 'treble') {
    stave.addClef('treble')
  } else {
    stave.addClef('bass')
  }
  stave.setContext(context).draw()

  drawChordNote(context, stave, chord, options, width - 60)

  if (options.showSymbol) {
    const symbol = document.createElement('div')
    symbol.className = 'chord-symbol'
    symbol.textContent = chordSymbol(chord.root, chord.quality, chord.inversion)
    container.appendChild(symbol)
  }
}

export function renderChordSequence(
  container: HTMLDivElement,
  chords: ChordSpec[],
  activeIndex: number,
  options: Omit<RenderOptions, 'highlight'>,
): void {
  container.innerHTML = ''
  const width = options.width ?? Math.max(320, chords.length * 90)
  const height = 160

  const renderer = new Renderer(container, Renderer.Backends.SVG)
  renderer.resize(width, height)
  const context = renderer.getContext()

  const stave = new Stave(10, 30, width - 20)
  stave.addClef('treble')
  stave.setContext(context).draw()

  const notes = chords.map((chord, chordIndex) => {
    const midiNotes = chordMidiNotes(chord.root, chord.quality, chord.inversion, chord.octave)
    const keys = midiNotes.map(midiToVexKey)
    const note = new StaveNote({ keys, duration: 'w', clef: chord.clef })
    midiNotes.forEach((midi, index) => {
      if (accidentalCount(midi) > 0) {
        note.addModifier(new Accidental('#'), index)
      }
    })
    const rootIndex = midiNotes.findIndex((midi) => pitchClassFromMidi(midi) === chord.root)
    if (options.rootAccent && rootIndex >= 0) {
      note.setKeyStyle(rootIndex, { fillStyle: '#c45c26', strokeStyle: '#c45c26' })
    }
    if (chordIndex === activeIndex) {
      note.setStyle({ fillStyle: '#2a6f4e', strokeStyle: '#2a6f4e' })
    }
    return note
  })

  const voice = new Voice({ numBeats: 4, beatValue: 4 })
    .setMode(Voice.Mode.SOFT)
    .addTickables(notes)

  new Formatter().joinVoices([voice]).format([voice], width - 60)
  notes.forEach((note) => note.setStave(stave))
  voice.draw(context, stave)
}
