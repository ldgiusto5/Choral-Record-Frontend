import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import OneOctavePiano from '../components/games/OneOctavePiano';
import OctaveSelectorPiano from '../components/games/OctaveSelectorPiano';
import { playNote } from '../utils/pianoSoundEngine';
import { finishGuessNoteGame } from '../api/api';
import toast from 'react-hot-toast';
import {
  loadDailyGameState,
  saveDailyGameState,
  getTimeUntilMidnight,
  getMusicalResultPhrase,
  getDailyHelpNote,
  SPANISH_NOTE_NAMES
} from '../utils/guessNoteUtils';
import { useAuth } from '../context/AuthContext';

const MAX_ERRORS = 3;

const GuessNotePage = () => {
  const { isAuthenticated, token } = useAuth();

  // Load daily state from localStorage
  const [gameState, setGameState] = useState(() => loadDailyGameState());
  const [selectedNote, setSelectedNote] = useState(gameState.selectedNote || null);
  const [selectedOctave, setSelectedOctave] = useState(gameState.selectedOctave || null);
  const [backendSynced, setBackendSynced] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isPlayingHelpAudio, setIsPlayingHelpAudio] = useState(false);
  const [countdown, setCountdown] = useState(getTimeUntilMidnight());
  const [messageToast, setMessageToast] = useState('');

  // Volume state persisted in localStorage (default 0.8 / 80%)
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('guess_note_piano_volume');
    return saved !== null ? parseFloat(saved) : 0.8;
  });
  const [prevVolume, setPrevVolume] = useState(0.8);

  const secret = gameState.secretNote;
  const helpNote = getDailyHelpNote(gameState.date);

  // Refs for smooth auto-scrolling
  const octaveSectionRef = useRef(null);
  const resultCardRef = useRef(null);
  const helpCardRef = useRef(null);

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

  // Persist volume state
  useEffect(() => {
    localStorage.setItem('guess_note_piano_volume', volume.toString());
  }, [volume]);

  // Auto-scroll when octave phase starts (scroll down so bottom of octave section is visible)
  useEffect(() => {
    if (gameState.phase === 'octave') {
      setTimeout(() => {
        octaveSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 200);
    }
  }, [gameState.phase]);

  // Auto-scroll when game completes (scroll down so bottom of results card is visible)
  useEffect(() => {
    if (gameState.isFinished || gameState.phase === 'completed') {
      setTimeout(() => {
        resultCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 200);
    }
  }, [gameState.isFinished, gameState.phase]);

  // Auto-scroll when help is unlocked (scroll down so bottom of help card is visible)
  useEffect(() => {
    if (gameState.usedHelp) {
      setTimeout(() => {
        helpCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 150);
    }
  }, [gameState.usedHelp]);

  // Toggle Mute / Unmute
  const handleToggleMute = () => {
    if (volume > 0) {
      setPrevVolume(volume);
      setVolume(0);
    } else {
      setVolume(prevVolume > 0 ? prevVolume : 0.8);
    }
  };

  // Audio playback handler for secret note
  const handlePlaySound = async () => {
    if (isPlayingAudio) return;
    setIsPlayingAudio(true);
    try {
      await playNote(secret.fullName, 2.5, volume);
    } catch (err) {
      console.error('Audio playback error:', err);
    } finally {
      setTimeout(() => {
        setIsPlayingAudio(false);
      }, 1500);
    }
  };

  // Audio playback handler for reference help note
  const handlePlayHelpSound = async () => {
    if (isPlayingHelpAudio) return;
    setIsPlayingHelpAudio(true);
    try {
      await playNote(helpNote.fullName, 2.5, volume);
    } catch (err) {
      console.error('Help audio playback error:', err);
    } finally {
      setTimeout(() => {
        setIsPlayingHelpAudio(false);
      }, 1500);
    }
  };

  // Direct help activation without modal confirmation
  const handleActivateHelp = () => {
    const updated = {
      ...gameState,
      usedHelp: true
    };
    setGameState(updated);
    setMessageToast('');
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
      setMessageToast(''); // No toast message when note is correct
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

    setMessageToast('');
  };

  const isGameActive = !gameState.isFinished;
  const isOctavePhase = gameState.phase === 'octave';
  const isCompleted = gameState.isFinished || gameState.phase === 'completed';
  const resultPhrase = getMusicalResultPhrase({
    wonNote: gameState.wonNote,
    wonOctave: gameState.wonOctave,
    errorsCount: gameState.errorsCount,
    usedHelp: gameState.usedHelp,
    dateStr: gameState.date
  });

  const isPerfectPitch = gameState.wonNote && gameState.wonOctave && gameState.errorsCount === 0 && !gameState.usedHelp;

  // Score calculation rules:
  // Note guessed: 6 pts
  // Octave guessed: +1 pt
  // Oído Absoluto bonus (0 errors, no help, note & octave won): +3 pts (Total = 10 pts)
  // Per error: -1 pt
  // Help used: -3 pts
  const calculateTotalScore = () => {
    if (!gameState.wonNote) return 0;
    const baseNotePoints = 6;
    const octavePoints = gameState.wonOctave ? 1 : 0;
    const perfectPitchBonus = isPerfectPitch ? 3 : 0;
    const errorsPenalty = gameState.errorsCount * 1;
    const helpPenalty = gameState.usedHelp ? 3 : 0;
    return Math.max(0, baseNotePoints + octavePoints + perfectPitchBonus - errorsPenalty - helpPenalty);
  };
  const totalScore = calculateTotalScore();

  // Sync game result to backend Supabase database when finished
  useEffect(() => {
    if (isCompleted && token && !backendSynced) {
      setBackendSynced(true);
      finishGuessNoteGame({ score: totalScore, isPerfectPitch }, token)
        .then(res => {
          if (!res.alreadyPlayed && res.pointsAdded > 0) {
            toast.success(`¡Puntuación guardada en tu perfil! +${res.pointsAdded} Pts. Racha: ${res.streak} días 🔥`);
          }
        })
        .catch(err => {
          console.error('Error syncing score with backend:', err);
        });
    }
  }, [isCompleted, token, totalScore, isPerfectPitch, backendSynced]);

  // Dynamic Status Box (Step + Lives + Penalties) that moves down as game progresses
  const renderStatusCard = () => (
    <div className="guess-note-status-card">
      <div className="status-phase-text">
        {isOctavePhase ? (
          <>
            Paso 2: Adivina la Octava <span className="points-green">(+1 Punto)</span>
          </>
        ) : isCompleted ? (
          'Partida Finalizada'
        ) : (
          <>
            Paso 1: Adivina la Nota <span className="points-green">(+6 Puntos)</span>
          </>
        )}
      </div>

      {!isCompleted ? (
        <div className="status-recuentos-container">
          {/* Active play: show attempts & help penalty */}
          <div className="status-recuento-row">
            <span className="error-dots-label">Intentos:</span>
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
            <span className="points-red">(-1 Punto por fallo)</span>
          </div>

          {gameState.usedHelp && (
            <div className="status-recuento-row">
              <span className="status-row-label">💡 Pista solicitada:</span>
              <span className="points-red">(-3 Puntos)</span>
            </div>
          )}
        </div>
      ) : (
        /* Recuento final completo al terminar la partida */
        <div className="status-recuentos-container">
          {/* Nota acertada (+6 Puntos en verde) */}
          {gameState.wonNote && (
            <div className="status-recuento-row">
              <span className="status-row-label">Nota acertada:</span>
              <span className="points-green">(+6 Puntos)</span>
            </div>
          )}

          {/* Octava acertada (+1 Punto en verde) */}
          {gameState.wonOctave && (
            <div className="status-recuento-row">
              <span className="status-row-label">Octava acertada:</span>
              <span className="points-green">(+1 Punto)</span>
            </div>
          )}

          {/* Oído Absoluto (+3 Puntos en morado) */}
          {isPerfectPitch && (
            <div className="status-recuento-row">
              <span className="status-row-label">👑 Oído Absoluto:</span>
              <span className="points-purple">(+3 Puntos)</span>
            </div>
          )}

          {/* Fallos: se muestra solo si hay fallos (1 o 2 fallos: -1 Punto o -2 Puntos) */}
          {gameState.errorsCount > 0 && (
            <div className="status-recuento-row">
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
              <span className="points-red">
                (-{gameState.errorsCount} {gameState.errorsCount === 1 ? 'Punto' : 'Puntos'})
              </span>
            </div>
          )}

          {/* Pista solicitada (-3 Puntos en rojo) */}
          {gameState.usedHelp && (
            <div className="status-recuento-row">
              <span className="status-row-label">💡 Pista solicitada:</span>
              <span className="points-red">(-3 Puntos)</span>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <>
      <Navbar />

      <main className="main-content guess-note-main">
        <div className="guess-note-card">
          {/* Header */}
          <div className="guess-note-header">
            <div className="guess-note-badge-daily">
              <span>Reto Diario:</span>
              <span className="guess-note-date-text">{gameState.date}</span>
            </div>
            <h1 className="guess-note-title">Guess Note 🎵</h1>
            <p className="guess-note-subtitle">
              Escucha el sonido del piano.
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

            {/* Help Button Trigger */}
            {!gameState.usedHelp && !isCompleted && (
              <button
                type="button"
                className="btn guess-note-help-trigger-btn"
                onClick={handleActivateHelp}
                title="Solicitar pista de afinación"
              >
                <span className="help-trigger-icon">💡</span>
                <span>Pedir Pista <span className="points-red">(-3 Puntos)</span></span>
              </button>
            )}
          </div>

          {/* Help Reference Note Card (When activated) */}
          {gameState.usedHelp && (
            <div className="guess-note-help-card" ref={helpCardRef}>
              <div className="help-card-header">
                <span className="help-card-icon">💡</span>
                <div className="help-card-titles">
                  <span className="help-card-title">Pista de Referencia Desbloqueada</span>
                  <span className="help-card-badge">Pista Activa <span className="points-red">(-3 Puntos)</span></span>
                </div>
              </div>

              <div className="help-card-body">
                <div className="help-note-info">
                  <span className="help-note-lbl">Nota de afinación:</span>
                  <span className="help-note-name-badge">
                    {SPANISH_NOTE_NAMES[helpNote.noteName]} ({helpNote.noteName})
                  </span>
                </div>

                <button
                  type="button"
                  className={`btn guess-note-help-sound-btn ${isPlayingHelpAudio ? 'is-playing' : ''}`}
                  onClick={handlePlayHelpSound}
                  aria-label="Escuchar nota de referencia"
                  title="Reproducir sonido de la nota de referencia"
                >
                  <span className="sound-btn-icon">{isPlayingHelpAudio ? '🔊' : '▶️'}</span>
                  <span className="sound-btn-text">
                    {isPlayingHelpAudio ? 'Sonando referencia...' : 'Escuchar Referencia'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Classic Volume Control Bar (Placed below the help track) */}
          <div className="guess-note-volume-control" title="Ajustar volumen del piano">
            <button
              type="button"
              className="volume-icon-btn"
              onClick={handleToggleMute}
              aria-label="Silenciar o activar volumen"
              title={volume === 0 ? 'Activar sonido' : 'Silenciar'}
            >
              {volume === 0 ? '🔇' : volume < 0.35 ? '🔈' : volume < 0.7 ? '🔉' : '🔊'}
            </button>
            <input
              type="range"
              className="volume-range-slider"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              aria-label="Regulador de volumen del piano"
            />
            <span className="volume-percentage">{Math.round(volume * 100)}%</span>
          </div>

          {/* Feedback Toast Message */}
          {messageToast && (
            <div className={`guess-note-message-box ${resultPhrase.type === 'perfect' ? 'msg-purple' : ''}`}>
              {messageToast}
            </div>
          )}

          {/* Phase 1: 1-Octave Piano */}
          <div className="guess-note-piano-section">
            {/* Status Card (Paso 1) */}
            {!isOctavePhase && !isCompleted && renderStatusCard()}

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
            <div className="guess-note-octave-section" ref={octaveSectionRef}>
              {/* Status Card (Paso 2) */}
              {isOctavePhase && !isCompleted && renderStatusCard()}

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
            <div
              ref={resultCardRef}
              className={`guess-note-result-card ${
                resultPhrase.type === 'perfect'
                  ? 'card-purple-victory'
                  : resultPhrase.type === 'help-win'
                  ? 'card-help-win'
                  : resultPhrase.type === 'win'
                  ? 'card-full-win'
                  : resultPhrase.type === 'defeat'
                  ? 'card-defeat'
                  : 'card-partial-win'
              }`}
            >
              {/* Status Card (Game Over / Finished) */}
              {renderStatusCard()}
              <div className="result-header">
                {resultPhrase.type === 'perfect' ? (
                  <>
                    <span className="result-trophy">👑 💜 👑</span>
                    <h2 className="result-title text-purple">{resultPhrase.title}</h2>
                    <p className="result-subtitle">{resultPhrase.subtitle}</p>
                  </>
                ) : resultPhrase.type === 'help-win' ? (
                  <>
                    <span className="result-trophy">💡 🎶 🎹</span>
                    <h2 className="result-title text-amber">{resultPhrase.title}</h2>
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

              {/* Final Score Display */}
              <div className="result-final-score-box">
                <span className="final-score-label">Puntuación Final:</span>
                <span className="final-score-value">
                  {totalScore} {totalScore === 1 ? 'Punto' : 'Puntos'}
                </span>
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
