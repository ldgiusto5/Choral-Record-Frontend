import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FileLinkButton from './utils/FileLinkButton';
import AudioVoiceButton from './utils/AudioVoiceButton';
import SplitAudioVoiceButton from './utils/SplitAudioVoiceButton';
import PieceAudioPlayer from './utils/PieceAudioPlayer';
import PieceLyrics from './utils/PieceLyrics';
import AdminActionButtons from './utils/AdminActionButtons';

const PieceCard = ({ 
  piece, 
  index, 
  totalPieces,
  choirId, 
  isAdmin,
  isHideMode = false,
  draggedPieceId,
  dragOverPieceId,
  activeAudio,
  activeLyricsPieceId,
  onDragStart,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
  onDragEnd,
  onSwapClick,
  onDelete,
  onToggleVisibility,
  onPlayAudio,
  onToggleLyrics,
  onCloseAudio,
  closingAudioId,
  closingLyricsId
}) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlayerPlaying, setIsPlayerPlaying] = useState(false);

  const isPieceActive = (fieldLabel) => activeAudio.pieceId === piece.id && activeAudio.fieldLabel === fieldLabel;
  const hasLyrics = piece.has_lyrics === true || piece.has_lyrics === 1 || piece.has_lyrics === 'true';

  const isHidden = piece.is_visible === false || piece.is_visible === 0 || piece.is_visible === 'false';

  // Unified class names based on state and visibility
  const cardClasses = [
    'piece-bar-wide',
    isHidden ? 'piece-bar-hidden-admin' : '',
    isExpanded ? 'expanded' : 'collapsed',
    draggedPieceId === piece.id ? 'piece-dragging' : '',
    dragOverPieceId === piece.id && draggedPieceId !== piece.id ? 'piece-drop-target' : ''
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={cardClasses}
      onDragOver={onDragOver}
      onDragEnter={(e) => onDragEnter(e, piece.id)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, piece.id)}
    >
      <div className="piece-bar-header">
        <div className="piece-title-section">
          {isAdmin && !isHideMode && (
            <div 
              className="drag-handle" 
              title="Arrastra para reordenar"
              draggable={true}
              onDragStart={(e) => onDragStart(e, piece.id)}
              onDragEnd={onDragEnd}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="drag-handle-row"><span className="drag-handle-dot"></span><span className="drag-handle-dot"></span></div>
              <div className="drag-handle-row"><span className="drag-handle-dot"></span><span className="drag-handle-dot"></span></div>
              <div className="drag-handle-row"><span className="drag-handle-dot"></span><span className="drag-handle-dot"></span></div>
            </div>
          )}
          
          {/* Interactive name section to toggle expand/collapse */}
          <div 
            className="piece-title-interactive"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <span className="piece-icon" key={isHidden ? 'hidden' : 'visible'}>
              {isHidden ? '👁️‍🗨' : '🎼'}
            </span>
            <h3>
              {index + 1}. {piece.name}
              <span className={`piece-expand-arrow ${isExpanded ? 'expanded' : ''}`}>
                ▼
              </span>
              {activeAudio && activeAudio.pieceId === piece.id && isPlayerPlaying && (
                <span className="piece-playing-indicator" title="Audio activo en esta obra">
                  🎵
                </span>
              )}
              {isHidden && (
                <span className="piece-invisible-badge">
                  Oculto
                </span>
              )}
            </h3>
          </div>
        </div>
        
        {isAdmin && (
          <div className="piece-admin-actions">
            {isHideMode ? (
              <button
                type="button"
                className={`piece-visibility-btn ${isHidden ? 'is-hidden' : 'is-visible'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onToggleVisibility) onToggleVisibility(piece.id);
                }}
                title={isHidden ? "Hacer partitura visible" : "Ocultar partitura"}
              >
                <span className="piece-visibility-icon">
                  {isHidden ? (
                    // Ojo cerrado (tachado)
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    // Ojo abierto
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </span>
              </button>
            ) : (
              <AdminActionButtons 
                editPath={`/choirs/${choirId}/pieces/${piece.id}/edit`}
                onDelete={() => onDelete(piece.id)}
                size="small"
              >
                <button 
                  className="btn btn-ghost piece-swap-btn" 
                  onClick={(e) => { e.stopPropagation(); onSwapClick(index, 'up'); }} 
                  disabled={index === 0} 
                  title="Subir pieza"
                >
                  ▲
                </button>
                <button 
                  className="btn btn-ghost piece-swap-btn" 
                  onClick={(e) => { e.stopPropagation(); onSwapClick(index, 'down'); }} 
                  disabled={index === totalPieces - 1} 
                  title="Bajar pieza"
                >
                  ▼
                </button>
              </AdminActionButtons>
            )}
          </div>
        )}
      </div>

      {/* Accordion Collapsible Body for BOTH Visible and Hidden Pieces */}
      <div className={`piece-bar-collapsible ${isExpanded ? 'expanded' : 'collapsed'}`}>
        <div className="piece-files-grid">
          {/* Fila 1 */}
          <FileLinkButton url={piece.partitura_file} icon="📄" label="Partitura" />
          
          <AudioVoiceButton 
            url={piece.voz_coral_file} icon="🔊" label="Voz Coral" 
            isActive={isPieceActive('Voz Coral')} 
            onClick={() => onPlayAudio(piece.id, 'Voz Coral', piece.voz_coral_file)} 
          />
          
          <AudioVoiceButton 
            url={piece.base_instrumental_file} icon="🎹" label="Acompañamiento" 
            isActive={isPieceActive('Base Instrumental')} 
            onClick={() => onPlayAudio(piece.id, 'Base Instrumental', piece.base_instrumental_file)} 
          />

          {hasLyrics ? (
            <button 
              className={`piece-file-btn ${activeLyricsPieceId === piece.id ? 'active' : ''}`}
              onClick={() => onToggleLyrics(piece.id)}
            >
              📝 Lyrics
            </button>
          ) : (
            <FileLinkButton url={piece.info_adicional_file} icon="ℹ️" label="Info Extra" />
          )}

          {/* Fila 2: Voces */}
          {piece.has_div_soprano === 1 || piece.has_div_soprano === true || piece.voz_soprano_2_file ? (
            <SplitAudioVoiceButton 
              icon="🎙️"
              url1={piece.voz_soprano_file} label1="Sop. 1" title1="Soprano 1" isActive1={isPieceActive('Soprano 1')} onClick1={() => onPlayAudio(piece.id, 'Soprano 1', piece.voz_soprano_file)}
              url2={piece.voz_soprano_2_file} label2="Sop. 2" title2="Soprano 2" isActive2={isPieceActive('Soprano 2')} onClick2={() => onPlayAudio(piece.id, 'Soprano 2', piece.voz_soprano_2_file)}
            />
          ) : (
            <AudioVoiceButton url={piece.voz_soprano_file} icon="🎙️" label="Soprano" isActive={isPieceActive('Soprano')} onClick={() => onPlayAudio(piece.id, 'Soprano', piece.voz_soprano_file)} />
          )}

          {piece.has_div_contralto === 1 || piece.has_div_contralto === true || piece.voz_contralto_2_file ? (
            <SplitAudioVoiceButton 
              icon="🎙️"
              url1={piece.voz_contralto_file} label1="Cont. 1" title1="Contralto 1" isActive1={isPieceActive('Contralto 1')} onClick1={() => onPlayAudio(piece.id, 'Contralto 1', piece.voz_contralto_file)}
              url2={piece.voz_contralto_2_file} label2="Cont. 2" title2="Contralto 2" isActive2={isPieceActive('Contralto 2')} onClick2={() => onPlayAudio(piece.id, 'Contralto 2', piece.voz_contralto_2_file)}
            />
          ) : (
            <AudioVoiceButton url={piece.voz_contralto_file} icon="🎙️" label="Contralto" isActive={isPieceActive('Contralto')} onClick={() => onPlayAudio(piece.id, 'Contralto', piece.voz_contralto_file)} />
          )}

          {piece.has_div_tenor === 1 || piece.has_div_tenor === true || piece.voz_tenor_2_file ? (
            <SplitAudioVoiceButton 
              icon="🎙️"
              url1={piece.voz_tenor_file} label1="Ten. 1" title1="Tenor 1" isActive1={isPieceActive('Tenor 1')} onClick1={() => onPlayAudio(piece.id, 'Tenor 1', piece.voz_tenor_file)}
              url2={piece.voz_tenor_2_file} label2="Ten. 2" title2="Tenor 2" isActive2={isPieceActive('Tenor 2')} onClick2={() => onPlayAudio(piece.id, 'Tenor 2', piece.voz_tenor_2_file)}
            />
          ) : (
            <AudioVoiceButton url={piece.voz_tenor_file} icon="🎙️" label="Tenor" isActive={isPieceActive('Tenor')} onClick={() => onPlayAudio(piece.id, 'Tenor', piece.voz_tenor_file)} />
          )}

          {piece.has_div_bajo === 1 || piece.has_div_bajo === true || piece.voz_bajo_2_file ? (
            <SplitAudioVoiceButton 
              icon="🎙️"
              url1={piece.voz_bajo_file} label1="Baj. 1" title1="Bajo 1" isActive1={isPieceActive('Bajo 1')} onClick1={() => onPlayAudio(piece.id, 'Bajo 1', piece.voz_bajo_file)}
              url2={piece.voz_bajo_2_file} label2="Baj. 2" title2="Bajo 2" isActive2={isPieceActive('Bajo 2')} onClick2={() => onPlayAudio(piece.id, 'Bajo 2', piece.voz_bajo_2_file)}
            />
          ) : (
            <AudioVoiceButton url={piece.voz_bajo_file} icon="🎙️" label="Bajo" isActive={isPieceActive('Bajo')} onClick={() => onPlayAudio(piece.id, 'Bajo', piece.voz_bajo_file)} />
          )}
        </div>

        {(activeAudio.pieceId === piece.id || closingAudioId === piece.id) && (
          <PieceAudioPlayer 
            fieldLabel={activeAudio.fieldLabel || ''} 
            url={activeAudio.url || ''} 
            onClose={onCloseAudio} 
            onPlayStateChange={setIsPlayerPlaying}
            isExiting={closingAudioId === piece.id}
          />
        )}

        {(activeLyricsPieceId === piece.id || closingLyricsId === piece.id) && (
          <PieceLyrics 
            lyrics={piece.lyrics} 
            onClose={() => onToggleLyrics(piece.id)} 
            isExiting={closingLyricsId === piece.id}
          />
        )}
      </div>
    </div>
  );
};

export default PieceCard;