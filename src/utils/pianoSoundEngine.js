import Soundfont from 'soundfont-player';
import { NOTE_NAMES } from './guessNoteUtils';

let audioContext = null;
let pianoInstance = null;
let loadingPromise = null;

/**
 * Returns or initializes the shared browser AudioContext
 */
export function getAudioContext() {
  if (!audioContext) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) {
      audioContext = new AudioCtx();
    }
  }
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
}

/**
 * Preloads or retrieves the acoustic grand piano instrument
 */
export async function getPianoInstrument() {
  const ctx = getAudioContext();
  if (!ctx) return null;

  if (pianoInstance) return pianoInstance;

  if (!loadingPromise) {
    loadingPromise = Soundfont.instrument(ctx, 'acoustic_grand_piano', {
      soundfont: 'MusyngKite',
      format: 'mp3'
    })
      .then((inst) => {
        pianoInstance = inst;
        return inst;
      })
      .catch((err) => {
        console.warn('Could not load Soundfont instrument from CDN, will use Web Audio fallback:', err);
        pianoInstance = null;
        loadingPromise = null;
        return null;
      });
  }

  return loadingPromise;
}

/**
 * Converts note full name (e.g. 'C4' or 'F#3') to MIDI number
 */
function noteNameToMidi(fullName) {
  const match = fullName.match(/^([A-G]#?)(-?\d+)$/);
  if (!match) return 60; // default C4
  const [, pitch, octStr] = match;
  const octave = parseInt(octStr, 10);
  const semitoneIndex = NOTE_NAMES.indexOf(pitch);
  if (semitoneIndex === -1) return 60;
  return (octave + 1) * 12 + semitoneIndex;
}

/**
 * Fallback Web Audio synth with piano-like harmonic decay envelope
 */
function playFallbackSynth(midi, duration = 2.0, volume = 0.8) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const freq = 440 * Math.pow(2, (midi - 69) / 12);

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  // Triangle wave sounds closer to piano fundamental
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, now);

  // Scaled peak gain for loud, clear synth fallback
  const peakGain = Math.min(2.5, Math.max(0.0, volume * 2.5));

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(peakGain, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + duration);
}

/**
 * Plays a single piano note by name (e.g. 'F#4' or 'C2') with customizable volume (0.0 to 1.0)
 */
export async function playNote(noteFullName, duration = 2.2, volume = 0.8) {
  try {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      await ctx.resume();
    }

    const piano = await getPianoInstrument();
    if (piano) {
      // Soundfont gain parameter boosted for louder acoustic resonance (more than double at 100%)
      const boostedGain = volume * 6.5;
      piano.play(noteFullName, ctx.currentTime, { duration, gain: boostedGain });
    } else {
      const midi = noteNameToMidi(noteFullName);
      playFallbackSynth(midi, duration, volume);
    }
  } catch (err) {
    console.warn('Error playing note with soundfont, using fallback synth:', err);
    const midi = noteNameToMidi(noteFullName);
    playFallbackSynth(midi, duration, volume);
  }
}
