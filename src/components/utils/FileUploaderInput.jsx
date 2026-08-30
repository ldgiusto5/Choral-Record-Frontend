import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import './FileUploaderInput.css';

const FileUploaderInput = ({
  id, accept, file, currentFileUrl, isDeleted,
  onFileChange, onClearFile, onToggleDelete,
  labelGhostBase = 'Elegir archivo',
  labelGhostReplace = 'Reemplazar',
  dangerColor = 'var(--danger)'
}) => {
  const [showRecorder, setShowRecorder] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Cleanup object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      stopAllTracks();
    };
  }, [audioUrl]);

  const stopAllTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const getFilenameFromUrl = (url) => {
    if (!url) return '';
    const parts = url.split('/');
    return parts[parts.length - 1];
  };

  const hasCurrentFile = !!currentFileUrl;
  const isReplacing = hasCurrentFile && !isDeleted;

  // Recording actions
  const startRecording = async (e) => {
    e.preventDefault();
    audioChunksRef.current = [];
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setRecordingTime(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stopAllTracks();
      };

      mediaRecorder.start(10); // get data chunks every 10ms
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error al acceder al micrófono:', err);
      toast.error('No se pudo acceder al micrófono. Por favor comprueba los permisos.');
    }
  };

  const stopRecording = (e) => {
    if (e) e.preventDefault();
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const saveRecording = (e) => {
    e.preventDefault();
    if (!audioBlob) return;

    // Create a File object from the blob so it works with the existing backend/form upload logic
    const fileObj = new File([audioBlob], `grabacion_${id || 'audio'}.wav`, { type: 'audio/wav' });
    
    // Simulate a standard file input change event
    onFileChange({
      target: {
        files: [fileObj]
      }
    });

    toast.success('Grabación de audio asociada correctamente');
    closeAndResetRecorder();
  };

  const discardRecording = (e) => {
    e.preventDefault();
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setRecordingTime(0);
  };

  const closeAndResetRecorder = () => {
    setShowRecorder(false);
    setIsRecording(false);
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setRecordingTime(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    stopAllTracks();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isAudioInput = accept && accept.includes('audio');

  return (
    <div className="uploader-wrapper">
      <div className="file-upload-container uploader-container">
        <input id={id} type="file" accept={accept} onChange={onFileChange} style={{ display: 'none' }} />
        
        <div className="uploader-relative">
          <label htmlFor={id} className="btn btn-ghost uploader-label">
            {isReplacing ? labelGhostReplace : labelGhostBase}
          </label>
          
          {(file || (hasCurrentFile && !file)) && (
            <button
              type="button"
              className="uploader-action-btn"
              style={{ background: isDeleted ? 'var(--accent-primary)' : dangerColor }}
              title={isDeleted ? "Restaurar archivo actual" : "Eliminar archivo"}
              onClick={(e) => {
                e.preventDefault();
                file ? onClearFile() : onToggleDelete();
              }}
            >
              {isDeleted ? '🔄' : '🗑️'}
            </button>
          )}
        </div>

        {isAudioInput && (
          <button
            type="button"
            className={`btn btn-ghost uploader-mic-btn ${showRecorder ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              if (showRecorder) {
                closeAndResetRecorder();
              } else {
                setShowRecorder(true);
              }
            }}
            title="Grabar con micrófono"
            style={{
              padding: '8px 12px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              marginLeft: '4px'
            }}
          >
            🎙️
          </button>
        )}

        <span className="file-upload-name" style={{ color: (isDeleted && !file) ? dangerColor : undefined }}>
          {file 
            ? file.name 
            : hasCurrentFile 
              ? (isDeleted 
                  ? 'Se eliminará' 
                  : <a href={currentFileUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>{getFilenameFromUrl(currentFileUrl)}</a>) 
              : 'Ninguno'
          }
        </span>
      </div>

      {/* Expandable Recorder Drawer */}
      <div className={`uploader-recorder-drawer ${showRecorder ? 'expanded' : ''}`}>
        <div className="uploader-recorder-content">
          <div className="uploader-recorder-status">
            {isRecording ? (
              <>
                <span className="recording-dot pulsating"></span>
                <span className="status-text recording">Grabando...</span>
              </>
            ) : audioUrl ? (
              <span className="status-text preview">Grabación lista</span>
            ) : (
              <span className="status-text idle">Preparado para grabar</span>
            )}
            <span className="timer-text">{formatTime(recordingTime)}</span>
          </div>

          <div className="uploader-recorder-controls">
            {!isRecording && !audioUrl && (
              <button type="button" className="btn btn-accent record-btn" onClick={startRecording}>
                🔴 Iniciar Grabación
              </button>
            )}

            {isRecording && (
              <button type="button" className="btn btn-accent stop-btn" onClick={stopRecording}>
                ⏹️ Detener
              </button>
            )}

            {audioUrl && (
              <div className="preview-controls-row">
                <audio src={audioUrl} controls className="audio-preview-element" />
                <div className="action-buttons-group">
                  <button type="button" className="btn btn-ghost discard-btn" onClick={discardRecording}>
                    🗑️ Descartar
                  </button>
                  <button type="button" className="btn btn-accent accept-btn" onClick={saveRecording}>
                    ✅ Usar Grabación
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUploaderInput;