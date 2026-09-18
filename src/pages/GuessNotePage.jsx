import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import OneOctavePiano from '../components/games/OneOctavePiano';
import OctaveSelectorPiano from '../components/games/OctaveSelectorPiano';
import { playNote } from '../utils/pianoSoundEngine';
import {
  loadDailyGameState,
  saveDailyGameState,
  getTimeUntilMidnight,
  getMusicalResultPhrase,
  SPANISH_NOTE_NAMES
} from '../utils/guessNoteUtils';
import { useAuth } from '../context/AuthContext';

const MAX_ERRORS = 3;

const GuessNotePage = () => {
  const { isAuthenticated } = useAuth();

  // Load daily state from localStorage
  const [gameState, setGameState] = useState(() => loadDailyGameState());
  const [selectedNote, setSelectedNote] = useState(gameState.selectedNote || null);
  const [selectedOctave, setSelectedOctave] = useState(gameState.selectedOctave || null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [countdown, setCountdown] = useState(getTimeUntilMidnight());
  const [messageToast, setMessageToast] = useState('');

  const secret = gameState.secretNote;

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getTimeUntilMidnight());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync state to localStorage
  useEffect(() => {
    saveDailyGameState(gameState);
  }, [gameState]);

  // Audio playback handler
  const handlePlaySound = async () => {
    if (isPlayingAudio) return;
    setIsPlayingAudio(true);
    try {
      await playNote(secret.fullName, 2.5);
    } catch (err) {
      console.error('Audio playback error:', err);
    } finally {
      setTimeout(() => {
        setIsPlayingAudio(false);
      }, 1500);
    }
  };

  // Phase 1: Confirm Note Guess
  const handleConfirmNote = () => {
    if (!selectedNote || gameState.phase !== 'note' || gameState.isFinished) return;

    if (selectedNote === secret.noteName) {
      // Correct note!
      const updated = {
        ...gameState,
        selectedNote,
        guessedNote: selectedNote,
        wonNote: true,
        phase: 'octave' // Advance to octave phase
      };
      setGameState(updated);
      setMessageToast(`¡Exacto! La nota es ${selectedNote} (${SPANISH_NOTE_NAMES[selectedNote]}). Ahora adivina la octava.`);
    } else {
      // Wrong note!
      const newWrongGuesses = [...gameState.wrongGuesses, selectedNote];
      const newErrorsCount = gameState.errorsCount + 1;
      const isFailed = newErrorsCount >= MAX_ERRORS;

      const updated = {
        ...gameState,
        wrongGuesses: newWrongGuesses,
        errorsCount: newErrorsCount,
        selectedNote: null,
        isFinished: isFailed,
        phase: isFailed ? 'completed' : 'note'
      };
      setGameState(updated);
      setSelectedNote(null);

      if (isFailed) {
        setMessageToast(`Has alcanzado el límite de 3 fallos. La nota secreta era ${secret.fullName}.`);
      } else {
        setMessageToast(`No es ${selectedNote}. Te quedan ${MAX_ERRORS - newErrorsCount} intentos.`);
      }
    }
  };

  // Phase 2: Confirm Octave Guess (1 single attempt!)
  const handleConfirmOctave = () => {
    if (selectedOctave === null || gameState.phase !== 'octave' || gameState.isFinished) return;

    const wonOctave = selectedOctave === secret.octave;
    const updated = {
      ...gameState,
      selectedOctave,
      guessedOctave: selectedOctave,
      wonOctave,
      phase: 'completed',
      isFinished: true
    };
    setGameState(updated);

    if (wonOctave) {
      const phrase = getMusicalResultPhrase({
        wonNote: true,
        wonOctave: true,
        errorsCount: gameState.errorsCount,
        dateStr: gameState.date
      });
      setMessageToast(`✨ ¡${phrase.title}! Has acertado la nota y la octava exacta: ${secret.fullName}.`);
    } else {
      setMessageToast(`La octava era ${secret.octave} (${secret.fullName}). ¡Buen intento!`);
    }
  };

  const isGameActive = !gameState.isFinished;
  const isOctavePhase = gameState.phase === 'octave';
  const isCompleted = gameState.isFinished || gameState.phase === 'completed';
  const resultPhrase = getMusicalResultPhrase({
    wonNote: gameState.wonNote,
    wonOctave: gameState.wonOctave,
    errorsCount: gameState.errorsCount,
    dateStr: gameState.date
  });

  return (
    <>
      <Navbar />

      <main className="main-content guess-note-main">
        <div className="guess-note-card">
          {/* Header */}
          <div className="guess-note-header">
            <div className="guess-note-badge-daily">
              <span>📅 Reto Diario</span>
              <span className="guess-note-date-text">{gameState.date}</span>
            </div>
            <h1 className="guess-note-title">Guess Note 🎵</h1>
            <p className="guess-note-subtitle">
              Escucha el sonido del piano y averigua qué nota es entre las 88 teclas acústicas.
            </p>
          </div>

          {/* Sound Play Button */}
          <div className="guess-note-audio-section">
            <button
              type="button"
              className={`btn guess-note-sound-btn ${isPlayingAudio ? 'is-playing' : ''}`}
              onClick={handlePlaySound}
              aria-label="Reproducir nota secreta del día"
              title="Escuchar la nota de piano"
            >
              <span className="sound-btn-icon">{isPlayingAudio ? '🔊' : '▶️'}</span>
              <span className="sound-btn-text">
                {isPlayingAudio ? 'Sonando piano...' : 'Escuchar Nota'}
              </span>
              {isPlayingAudio && (
                <span className="sound-waves-indicator">
                  <span className="wave-bar"></span>
                  <span className="wave-bar"></span>
                  <span className="wave-bar"></span>
                </span>
              )}
            </button>
            <span className="guess-note-sound-hint">
              Puedes pulsar el botón todas las veces que necesites para escuchar la nota.
            </span>
          </div>

          {/* Error Counter (Dots) */}
          <div className="guess-note-status-row">
            <div className="error-dots-container">
              <span className="error-dots-label">Fallos:</span>
              <div className="error-dots-list">
                {[0, 1, 2].map((idx) => {
                  const hasFailed = idx < gameState.errorsCount;
                  return (
                    <span
                      key={idx}
                      className={`error-dot ${hasFailed ? 'dot-failed' : 'dot-available'}`}
                      title={hasFailed ? 'Intento fallido' : 'Intento disponible'}
                    >
                      {hasFailed ? '🔴' : '⚪'}
                    </span>
                  );
                })}
              </div>
              <span className="error-counter-text">
                {gameState.errorsCount} / {MAX_ERRORS}
              </span>
            </div>

            {/* Current Phase Pill */}
            <div className="game-phase-pill">
              {isOctavePhase ? 'Paso 2: Adivina la Octava' : isCompleted ? 'Partida Finalizada' : 'Paso 1: Adivina la Nota'}
            </div>
          </div>

          {/* Feedback Toast Message */}
          {messageToast && (
            <div className={`guess-note-message-box ${resultPhrase.type === 'perfect' ? 'msg-purple' : ''}`}>
              {messageToast}
            </div>
          )}

          {/* Phase 1: 1-Octave Piano */}
          <div className="guess-note-piano-section">
            <OneOctavePiano
              selectedNote={selectedNote}
              onSelectNote={(note) => setSelectedNote(note)}
              wrongGuesses={gameState.wrongGuesses}
              correctNote={gameState.wonNote ? secret.noteName : null}
              disabled={isOctavePhase || isCompleted}
              isShrunk={isOctavePhase || isCompleted}
            />

            {/* Confirm Note Button */}
            {!isOctavePhase && !isCompleted && (
              <div className="guess-note-actions">
                <button
                  type="button"
                  className="btn btn-accent guess-note-confirm-btn"
                  onClick={handleConfirmNote}
                  disabled={!selectedNote}
                >
                  {selectedNote ? `Confirmar Nota (${selectedNote})` : 'Selecciona una tecla'}
                </button>
              </div>
            )}
          </div>

          {/* Phase 2: Octave Selector with Full 88-key representation */}
          {(isOctavePhase || (isCompleted && gameState.wonNote)) && (
            <div className="guess-note-octave-section">
              <div className="octave-instruction-banner">
                <span className="banner-icon">🎹</span>
                <span className="banner-text">
                  ¡Nota <strong>{secret.noteName}</strong> ({SPANISH_NOTE_NAMES[secret.noteName]}) acertada! Ahora elige la octava en la que resonó (1 solo intento):
                </span>
              </div>

              <OctaveSelectorPiano
                guessedNoteName={secret.noteName}
                selectedOctave={selectedOctave}
                onSelectOctave={(oct) => setSelectedOctave(oct)}
                disabled={isCompleted}
                confirmedOctave={gameState.guessedOctave}
                realOctave={secret.octave}
                isWon={gameState.wonOctave}
              />

              {isOctavePhase && !isCompleted && (
                <div className="guess-note-actions">
                  <button
                    type="button"
                    className="btn btn-accent guess-note-confirm-btn"
                    onClick={handleConfirmOctave}
                    disabled={selectedOctave === null}
                  >
                    {selectedOctave !== null
                      ? `Confirmar Octava ${selectedOctave}`
                      : 'Elige una octava'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Game Over / Results Card */}
          {isCompleted && (
            <div className={`guess-note-result-card ${
              resultPhrase.type === 'perfect'
                ? 'card-purple-victory'
                : resultPhrase.type === 'win'
                ? 'card-full-win'
                : resultPhrase.type === 'defeat'
                ? 'card-defeat'
                : 'card-partial-win'
            }`}>
              <div className="result-header">
                {resultPhrase.type === 'perfect' ? (
                  <>
                    <span className="result-trophy">👑 💜 👑</span>
                    <h2 className="result-title text-purple">{resultPhrase.title}</h2>
                    <p className="result-subtitle">{resultPhrase.subtitle}</p>
                  </>
                ) : resultPhrase.type === 'win' ? (
                  <>
                    <span className="result-trophy">✨ 🎹 ✨</span>
                    <h2 className="result-title text-green">{resultPhrase.title}</h2>
                    <p className="result-subtitle">{resultPhrase.subtitle}</p>
                  </>
                ) : resultPhrase.type === 'defeat' ? (
                  <>
                    <span className="result-trophy">❌ 🎹</span>
                    <h2 className="result-title text-red">{resultPhrase.title}</h2>
                    <p className="result-subtitle">{resultPhrase.subtitle}</p>
                  </>
                ) : (
                  <>
                    <span className="result-trophy">✨ 🎵</span>
                    <h2 className="result-title text-cyan">{resultPhrase.title}</h2>
                    <p className="result-subtitle">{resultPhrase.subtitle}</p>
                  </>
                )}
              </div>

              {/* Reveal Solution */}
              <div className="result-solution-box">
                <span className="solution-label">La nota del día era:</span>
                <span className="solution-note-badge">
                  {secret.fullName} ({secret.spanishName})
                </span>
              </div>

              {/* 24-Hour Countdown to Next Note */}
              <div className="result-countdown-box">
                <span className="countdown-title">Próxima nota disponible en:</span>
                <div className="countdown-digits">
                  <div className="countdown-digit-block">
                    <span className="digit-val">{countdown.hours}</span>
                    <span className="digit-lbl">Horas</span>
                  </div>
                  <span className="countdown-colon">:</span>
                  <div className="countdown-digit-block">
                    <span className="digit-val">{countdown.minutes}</span>
                    <span className="digit-lbl">Minutos</span>
                  </div>
                  <span className="countdown-colon">:</span>
                  <div className="countdown-digit-block">
                    <span className="digit-val">{countdown.seconds}</span>
                    <span className="digit-lbl">Segundos</span>
                  </div>
                </div>
              </div>

              {/* Call to Action for Registration/Streak (when not logged in) */}
              {!isAuthenticated && (
                <div className="guess-note-cta-banner">
                  <span className="cta-sparkle">🌟</span>
                  <div className="cta-content">
                    <h4>¿Quieres guardar tus rachas y estadísticas?</h4>
                    <p>
                      Próximamente guardaremos tus marcas diarias y rachas de acierto en tu perfil coral. ¡Crea tu cuenta gratuita para empezar a sumar!
                    </p>
                    <div className="cta-buttons">
                      <Link to="/register" className="btn btn-accent cta-btn">
                        Registrarse
                      </Link>
                      <Link to="/login" className="btn btn-ghost cta-btn">
                        Iniciar Sesión
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default GuessNotePage;
