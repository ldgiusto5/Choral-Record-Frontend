// Semitones and note names in standard Scientific Pitch Notation
export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const SPANISH_NOTE_NAMES = {
  'C': 'Do',
  'C#': 'Do#',
  'D': 'Re',
  'D#': 'Re#',
  'E': 'Mi',
  'F': 'Fa',
  'F#': 'Fa#',
  'G': 'Sol',
  'G#': 'Sol#',
  'A': 'La',
  'A#': 'La#',
  'B': 'Si'
};

// 88-key piano ranges from MIDI 21 (A0) to MIDI 108 (C8)
export const MIN_MIDI = 21;
export const MAX_MIDI = 108;
export const TOTAL_PIANO_KEYS = 88;

/**
 * Converts a MIDI number to a Note Object with pitch, octave and names
 */
export function getNoteFromMidi(midi) {
  const noteName = NOTE_NAMES[midi % 12];
  const octave = Math.floor(midi / 12) - 1;
  const fullName = `${noteName}${octave}`;
  const spanishName = `${SPANISH_NOTE_NAMES[noteName]} ${octave}`;

  return {
    midi,
    noteName,
    octave,
    fullName,
    spanishName,
    isBlack: noteName.includes('#')
  };
}

/**
 * Returns today's date formatted as YYYY-MM-DD in local time
 */
export function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Deterministic hash from date string (like Wordle)
 */
function hashDateString(dateStr) {
  let hash = 2166136261 >>> 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = Math.imul(hash ^ dateStr.charCodeAt(i), 16777619);
  }
  return hash >>> 0;
}

/**
 * Generates the unique daily note for today (or specified date)
 */
export function getDailySecretNote(dateStr = getTodayDateString()) {
  const hash = hashDateString(dateStr);
  const midi = MIN_MIDI + (hash % TOTAL_PIANO_KEYS);
  return getNoteFromMidi(midi);
}

/**
 * Generates the deterministic reference help note for today (from any of the 88 piano keys)
 */
export function getDailyHelpNote(dateStr = getTodayDateString()) {
  const hash = hashDateString(dateStr + '_help_v2');
  
  // Pick any key deterministically from the 88 piano keys (MIDI 21 to 108)
  const midi = MIN_MIDI + (hash % TOTAL_PIANO_KEYS);

  const helpNoteObj = getNoteFromMidi(midi);
  return {
    ...helpNoteObj,
    spanishNoteOnly: SPANISH_NOTE_NAMES[helpNoteObj.noteName]
  };
}

const STORAGE_KEY = 'choral_guess_note_data_v1';

/**
 * Loads the current day's game state from localStorage or initializes a fresh one
 */
export function loadDailyGameState() {
  const today = getTodayDateString();
  const dailyNote = getDailySecretNote(today);

  const defaultState = {
    date: today,
    secretNote: dailyNote,
    phase: 'note', // 'note' | 'octave' | 'completed'
    wrongGuesses: [], // e.g. ['D', 'A#']
    errorsCount: 0,   // 0 to 3
    selectedNote: null,
    guessedNote: null,
    selectedOctave: null,
    guessedOctave: null,
    wonNote: false,
    wonOctave: false,
    wonNote: false,
    wonOctave: false,
    usedHelp: false,   // whether user requested reference note hint
    isFinished: false
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;

    const parsed = JSON.parse(raw);
    // If it's a new calendar day, reset!
    if (parsed.date !== today) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultState));
      return defaultState;
    }

    return {
      ...defaultState,
      ...parsed
    };
  } catch (err) {
    console.error('Error reading GuessNote localStorage:', err);
    return defaultState;
  }
}

/**
 * Saves current game state to localStorage
 */
export function saveDailyGameState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Error saving GuessNote localStorage:', err);
  }
}

/**
 * Calculates remaining time until next midnight in local time
 */
export function getTimeUntilMidnight() {
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
  const diffMs = tomorrow - now;

  if (diffMs <= 0) return { hours: '00', minutes: '00', seconds: '00' };

  const hours = String(Math.floor(diffMs / (1000 * 60 * 60))).padStart(2, '0');
  const minutes = String(Math.floor((diffMs / (1000 * 60)) % 60)).padStart(2, '0');
  const seconds = String(Math.floor((diffMs / 1000) % 60)).padStart(2, '0');

  return { hours, minutes, seconds };
}

/**
 * Returns dynamic musical victory and defeat phrases depending on performance
 */
export function getMusicalResultPhrase({ wonNote, wonOctave, errorsCount, usedHelp = false, dateStr = getTodayDateString() }) {
  const seed = hashDateString(dateStr + '_phrase');

  // Caso 0A: Si el usuario pidió pista y acertó tanto Nota como Octava
  if (wonNote && wonOctave && usedHelp) {
    const helpWinPhrases = [
      {
        title: "¡Gran Afinación con Pista!",
        desc: "¡Excelente sentido armónico! Has sabido utilizar la nota de referencia como los músicos profesionales para orientar tu oído y clavar la nota exacta."
      },
      {
        title: "¡Excelente Oído Comparativo!",
        desc: "¡Gran destreza musical! Demostraste una fantástica capacidad para comparar frecuencias y dar en el blanco con la nota y la octava."
      },
      {
        title: "¡Dominio Armónico Brillante!",
        desc: "¡Afinación impecable! Apoyarse en el diapasón de referencia demuestra un gran sentido del tono y una enorme precisión auditiva."
      }
    ];
    const picked = helpWinPhrases[seed % helpWinPhrases.length];
    return {
      title: picked.title,
      subtitle: picked.desc,
      type: 'help-win'
    };
  }

  // Caso 0B: Si el usuario pidió pista y acertó solo la Nota (pero no la octava)
  if (wonNote && !wonOctave && usedHelp) {
    return {
      title: "¡Buena Intuición Melódica!",
      desc: "La pista de referencia te ayudó a ubicar la nota. ¡Gran trabajo de oído comparativo para identificar el tono!",
      type: 'partial'
    };
  }

  // Caso 1: 0 fallos y acierto total SIN AYUDA -> Oído Absoluto (solamente si NO usó pista)
  if (wonNote && wonOctave && errorsCount === 0 && !usedHelp) {
    const perfectPhrases = [
      "¡Afinación impecable! Has clavado la nota y su octava al primer intento como los grandes maestros.",
      "¡Ni Mozart en sus mejores días! Oído absoluto digno del primer atril.",
      "¡Precisión armónica pura! Has identificado la frecuencia exacta sin vacilar.",
      "¡Acústica magistral! Tu oído coral está afinado al milímetro con el diapasón."
    ];
    return {
      title: "¡Oído Absoluto!",
      subtitle: perfectPhrases[seed % perfectPhrases.length],
      type: 'perfect'
    };
  }

  // Caso 2: Acierto total de Nota + Octava SIN AYUDA (con 1 o 2 fallos previos)
  if (wonNote && wonOctave && errorsCount > 0 && !usedHelp) {
    const masterPhrases = [
      { title: "¡Excelente Afinación!", desc: "¡Como en un buen ensayo de coro: con paciencia y oído diste con el tono exacto!" },
      { title: "¡Armonía Perfecta!", desc: "¡El coro suena afinado! Has encontrado la nota y conquistado su octava con gran destreza." },
      { title: "¡Oído Relativo Maestro!", desc: "¡Ajustaste el diapasón a tiempo! Tu oído musical ha dado con la clave justa." },
      { title: "¡Gran Sentido Armónico!", desc: "Supiste corregir la afinación y dar en el blanco con el registro adecuado." }
    ];
    const picked = masterPhrases[seed % masterPhrases.length];
    return {
      title: picked.title,
      subtitle: picked.desc,
      type: 'win'
    };
  }

  // Caso 3: Acierto de Nota, pero falló la Octava (SIN AYUDA)
  if (wonNote && !wonOctave && !usedHelp) {
    const notePhrases = [
      { title: "¡Buen Tono!", desc: "¡El diapasón no miente! Identificaste la nota perfecta, aunque resonaba en otra tesitura." },
      { title: "¡Gran Intuición Melódica!", desc: "Has acertado el nombre de la nota sin problema. Solo faltó ubicar su octava en el teclado." },
      { title: "¡Oído Coral Entrenado!", desc: "Diste con la nota correcta de la partitura. ¡A un solo semitono de octava de la gloria!" },
      { title: "¡Casi en Clave!", desc: "La altura sonora era la correcta; ahora solo queda agudizar el registro vocal." }
    ];
    const picked = notePhrases[seed % notePhrases.length];
    return {
      title: picked.title,
      subtitle: picked.desc,
      type: 'partial'
    };
  }

  // Caso 4: Derrota (3 fallos)
  const defeatPhrases = [
    { title: "Desafinación Pasajera", desc: "Hasta a los mejores directores se les escapa un semitono. ¡Mañana volvemos a afinar!" },
    { title: "Prueba de Sonido", desc: "Un pequeño calderón para descansar el oído. ¡Mañana te espera un nuevo reto de piano!" },
    { title: "Ensayo General", desc: "El oído musical se entrena día a día. ¡Mañana una nueva nota volverá a sonar!" }
  ];
  const picked = defeatPhrases[seed % defeatPhrases.length];
  return {
    title: picked.title,
    subtitle: picked.desc,
    type: 'defeat'
  };
}
