import React from 'react';

// Definitions for the 9 octaves on an 88-key piano
const OCTAVES_DATA = [
  {
    octave: 0,
    label: '0',
    weightClass: 'octave-weight-0',
    title: 'Octava 0 (Subgrave)',
    range: 'A0 - B0',
    whiteKeys: ['A', 'B'],
    blackKeys: [{ note: 'A#', leftPercent: 50 }],
  },
  {
    octave: 1,
    label: '1',
    weightClass: 'octave-weight-mid',
    title: 'Octava 1 (Bajo Profundo)',
    range: 'C1 - B1',
    whiteKeys: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
    blackKeys: [
      { note: 'C#', leftPercent: 14.3 },
      { note: 'D#', leftPercent: 28.6 },
      { note: 'F#', leftPercent: 57.1 },
      { note: 'G#', leftPercent: 71.4 },
      { note: 'A#', leftPercent: 85.7 },
    ],
  },
  {
    octave: 2,
    label: '2',
    weightClass: 'octave-weight-mid',
    title: 'Octava 2 (Voz Bajo)',
    range: 'C2 - B2',
    whiteKeys: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
    blackKeys: [
      { note: 'C#', leftPercent: 14.3 },
      { note: 'D#', leftPercent: 28.6 },
      { note: 'F#', leftPercent: 57.1 },
      { note: 'G#', leftPercent: 71.4 },
      { note: 'A#', leftPercent: 85.7 },
    ],
  },
  {
    octave: 3,
    label: '3',
    weightClass: 'octave-weight-mid',
    title: 'Octava 3 (Voz Tenor)',
    range: 'C3 - B3',
    whiteKeys: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
    blackKeys: [
      { note: 'C#', leftPercent: 14.3 },
      { note: 'D#', leftPercent: 28.6 },
      { note: 'F#', leftPercent: 57.1 },
      { note: 'G#', leftPercent: 71.4 },
      { note: 'A#', leftPercent: 85.7 },
    ],
  },
  {
    octave: 4,
    label: '4',
    weightClass: 'octave-weight-mid',
    title: 'Octava 4 (Do Central / Contralto)',
    range: 'C4 - B4',
    whiteKeys: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
    blackKeys: [
      { note: 'C#', leftPercent: 14.3 },
      { note: 'D#', leftPercent: 28.6 },
      { note: 'F#', leftPercent: 57.1 },
      { note: 'G#', leftPercent: 71.4 },
      { note: 'A#', leftPercent: 85.7 },
    ],
  },
  {
    octave: 5,
    label: '5',
    weightClass: 'octave-weight-mid',
    title: 'Octava 5 (Voz Soprano)',
    range: 'C5 - B5',
    whiteKeys: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
    blackKeys: [
      { note: 'C#', leftPercent: 14.3 },
      { note: 'D#', leftPercent: 28.6 },
      { note: 'F#', leftPercent: 57.1 },
      { note: 'G#', leftPercent: 71.4 },
      { note: 'A#', leftPercent: 85.7 },
    ],
  },
  {
    octave: 6,
    label: '6',
    weightClass: 'octave-weight-mid',
    title: 'Octava 6 (Sobreagudo)',
    range: 'C6 - B6',
    whiteKeys: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
    blackKeys: [
      { note: 'C#', leftPercent: 14.3 },
      { note: 'D#', leftPercent: 28.6 },
      { note: 'F#', leftPercent: 57.1 },
      { note: 'G#', leftPercent: 71.4 },
      { note: 'A#', leftPercent: 85.7 },
    ],
  },
  {
    octave: 7,
    label: '7',
    weightClass: 'octave-weight-mid',
    title: 'Octava 7 (Agudo Extremo)',
    range: 'C7 - B7',
    whiteKeys: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
    blackKeys: [
      { note: 'C#', leftPercent: 14.3 },
      { note: 'D#', leftPercent: 28.6 },
      { note: 'F#', leftPercent: 57.1 },
      { note: 'G#', leftPercent: 71.4 },
      { note: 'A#', leftPercent: 85.7 },
    ],
  },
  {
    octave: 8,
    label: '8',
    weightClass: 'octave-weight-8',
    title: 'Octava 8 (Última Tecla)',
    range: 'C8',
    whiteKeys: ['C'],
    blackKeys: [],
  },
];

const OctaveSelectorPiano = ({
  guessedNoteName,
  selectedOctave,
  onSelectOctave,
  disabled = false,
  confirmedOctave = null,
  realOctave = null,
  isWon = false,
}) => {
  const selectedOctaveData = OCTAVES_DATA.find((o) => o.octave === selectedOctave);

  return (
    <div className="grand-piano-octave-selector">
      {/* Fallboard / Piano Case Header */}
      <div className="grand-piano-fallboard">
        {/* Live status feedback in the piano fallboard */}
        <div className="fallboard-status-display">
          {confirmedOctave !== null ? (
            isWon ? (
              <span className="fallboard-tag tag-won">
                💜 ¡Acertaste la Octava {realOctave}!
              </span>
            ) : (
              <span className="fallboard-tag tag-failed">
                ❌ Octava {confirmedOctave} (era la {realOctave} · {guessedNoteName}{realOctave})
              </span>
            )
          ) : selectedOctave !== null ? (
            <span className="fallboard-tag tag-selected">
              <span className="status-text-desktop">
                Octava {selectedOctave} seleccionada — ({guessedNoteName}{selectedOctave} · {selectedOctaveData?.title})
              </span>
              <span className="status-text-mobile">
                Octava {selectedOctave} ({guessedNoteName}{selectedOctave})
              </span>
            </span>
          ) : (
            <span className="fallboard-tag tag-prompt">
              <span className="prompt-text-desktop">
                Toca directamente en el teclado la octava en la que crees que sonó la nota
              </span>
              <span className="prompt-text-mobile">
                Toca la octava en el teclado
              </span>
            </span>
          )}
        </div>
      </div>

      {/* Realistic 88-Key Piano Keyboard Frame */}
      <div className="grand-piano-keyboard-chassis">
        <div className="grand-piano-felt-strip"></div>

        <div className="grand-piano-keys-container">
          {OCTAVES_DATA.map((oct) => {
            const isSelected = selectedOctave === oct.octave;
            const isConfirmed = confirmedOctave !== null;
            const isReal = isConfirmed && realOctave === oct.octave;
            const isFailed = isConfirmed && confirmedOctave === oct.octave && !isWon;
            const isVictory = isConfirmed && isWon && realOctave === oct.octave;

            let octaveClasses = ['piano-octave-zone', oct.weightClass];
            if (isSelected) octaveClasses.push('octave-selected');
            if (isVictory) octaveClasses.push('octave-won-purple');
            if (isFailed) octaveClasses.push('octave-failed-red');
            if (isReal && !isWon) octaveClasses.push('octave-real-reveal');

            return (
              <div
                key={oct.octave}
                className={octaveClasses.join(' ')}
                onClick={() => !disabled && onSelectOctave(oct.octave)}
                role="button"
                tabIndex={disabled ? -1 : 0}
                aria-label={`Elegir ${oct.title}`}
                title={`${oct.title} (${oct.range}) - Toca para seleccionar`}
              >
                {/* Upper Keys Portion (Clean acoustic piano keys) */}
                <div className="octave-keys-portion">
                  {/* White Keys */}
                  <div className="octave-white-keys-row">
                    {oct.whiteKeys.map((keyName, idx) => (
                      <div key={idx} className="grand-white-key"></div>
                    ))}
                  </div>

                  {/* Black Keys */}
                  <div className="octave-black-keys-overlay">
                    {oct.blackKeys.map((bKey, idx) => (
                      <div
                        key={idx}
                        className={`grand-black-key black-key-pct-${Math.round(bKey.leftPercent)}`}
                      ></div>
                    ))}
                  </div>
                </div>

                {/* Integrated Lower Rail with Octave Pill */}
                <div className="octave-rail-portion">
                  <div className="octave-rail-plate">
                    <span className="plate-octave-num">{oct.octave}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OctaveSelectorPiano;
