import React from 'react';

// White keys in standard 1-octave layout from C to C'
const WHITE_KEYS = [
  { note: 'C', label: 'C', isHighC: false },
  { note: 'D', label: 'D', isHighC: false },
  { note: 'E', label: 'E', isHighC: false },
  { note: 'F', label: 'F', isHighC: false },
  { note: 'G', label: 'G', isHighC: false },
  { note: 'A', label: 'A', isHighC: false },
  { note: 'B', label: 'B', isHighC: false },
  { note: 'C_HIGH', label: "C'", isHighC: true }, // Disabled right C
];

// Black keys positioned between white keys (percentage of 8 white keys container)
// Each white key is 12.5% wide (100% / 8)
const BLACK_KEYS = [
  { note: 'C#', posClass: 'one-piano-pct-13' },
  { note: 'D#', posClass: 'one-piano-pct-25' },
  { note: 'F#', posClass: 'one-piano-pct-50' },
  { note: 'G#', posClass: 'one-piano-pct-63' },
  { note: 'A#', posClass: 'one-piano-pct-75' },
];

const OneOctavePiano = ({
  selectedNote,
  onSelectNote,
  wrongGuesses = [],
  correctNote = null,
  disabled = false,
  isShrunk = false,
}) => {
  const handleKeyClick = (note, isHighC) => {
    if (disabled || isHighC) return;
    onSelectNote(note);
  };

  return (
    <div className={`one-octave-piano-wrapper ${isShrunk ? 'piano-shrunk' : ''}`}>
      <div className="one-octave-piano">
        {/* White Keys Row */}
        <div className="piano-white-keys-row">
          {WHITE_KEYS.map(({ note, label, isHighC }) => {
            const isSelected = selectedNote === note;
            const isWrong = wrongGuesses.includes(note);
            const isCorrect = correctNote === note;

            const keyClasses = [
              'piano-key',
              'piano-white-key',
              isHighC ? 'piano-key-disabled-high-c' : '',
              isSelected ? 'piano-key-selected' : '',
              isWrong ? 'piano-key-wrong' : '',
              isCorrect ? 'piano-key-correct' : '',
            ].filter(Boolean).join(' ');

            return (
              <button
                key={note}
                type="button"
                className={keyClasses}
                onClick={() => handleKeyClick(note, isHighC)}
                disabled={disabled || isHighC}
                aria-label={`Nota ${label}${isHighC ? ' (deshabilitada)' : ''}`}
                title={isHighC ? "C' no se puede marcar" : `Seleccionar nota ${label}`}
              >
                <span className="piano-key-letter">{label}</span>
                {isWrong && <span className="piano-key-wrong-indicator">✕</span>}
                {isCorrect && <span className="piano-key-correct-indicator">✓</span>}
              </button>
            );
          })}
        </div>

        {/* Black Keys Row (Positioned absolutely over white keys) */}
        <div className="piano-black-keys-overlay">
          {BLACK_KEYS.map(({ note, posClass }) => {
            const isSelected = selectedNote === note;
            const isWrong = wrongGuesses.includes(note);
            const isCorrect = correctNote === note;

            const keyClasses = [
              'piano-key',
              'piano-black-key',
              posClass,
              isSelected ? 'piano-key-selected' : '',
              isWrong ? 'piano-key-wrong' : '',
              isCorrect ? 'piano-key-correct' : '',
            ].filter(Boolean).join(' ');

            return (
              <button
                key={note}
                type="button"
                className={keyClasses}
                onClick={() => handleKeyClick(note, false)}
                disabled={disabled}
                aria-label={`Nota sostenida ${note}`}
                title={`Seleccionar nota sostenida ${note}`}
              >
                {/* Black keys do NOT have letters as specified by user */}
                {isWrong && <span className="piano-key-wrong-indicator black-key-mark">✕</span>}
                {isCorrect && <span className="piano-key-correct-indicator black-key-mark">✓</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OneOctavePiano;
