import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

function getYouTubeId(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds === null || seconds === undefined) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const PieceAudioPlayer = ({ fieldLabel, url, onClose, onPlayStateChange, isExiting }) => {
  const ytId = getYouTubeId(url);
  const isYouTube = !!ytId;

  const [isPlaying, setIsPlaying] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(100);

  const ytPlayerRef = useRef(null);
  const localAudioRef = useRef(null);
  const iframeId = `yt-player-${ytId}`;

  // Notify parent component about playing state changes
  useEffect(() => {
    if (onPlayStateChange) {
      onPlayStateChange(isPlaying);
    }
  }, [isPlaying, onPlayStateChange]);

  // Clean up state when player is unmounted
  useEffect(() => {
    return () => {
      if (onPlayStateChange) {
        onPlayStateChange(false);
      }
    };
  }, [onPlayStateChange]);

  // 1. YouTube API Initialization & Hook
  useEffect(() => {
    if (!isYouTube) return;

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    let player;
    let checkYT;

    const initPlayer = () => {
      try {
        player = new window.YT.Player(iframeId, {
          height: '200',
          width: '300',
          videoId: ytId,
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            rel: 0,
            modestbranding: 1,
            origin: window.location.origin
          },
          events: {
            onReady: (event) => {
              ytPlayerRef.current = event.target;
              event.target.setVolume(volume);
              event.target.playVideo();
              setDuration(event.target.getDuration() || 0);
            },
            onStateChange: (event) => {
              if (event.data === window.YT.PlayerState.PLAYING) {
                setIsPlaying(true);
              } else if (event.data === window.YT.PlayerState.PAUSED) {
                setIsPlaying(false);
              } else if (event.data === window.YT.PlayerState.ENDED) {
                setIsPlaying(false);
                setCurrentTime(0);
              }
            },
            onError: (event) => {
              console.error('Error en el reproductor de YouTube:', event.data);
              const errCode = event.data;
              if (errCode === 101 || errCode === 150) {
                toast.error('El autor de este video ha deshabilitado su reproducción en reproductores externos.');
              } else if (errCode === 100) {
                toast.error('El video de YouTube no fue encontrado o es privado.');
              } else {
                toast.error('Error al reproducir el video de YouTube (Código: ' + errCode + ').');
              }
              setIsPlaying(false);
            }
          }
        });
      } catch (err) {
        console.error('Error al inicializar el reproductor de YouTube:', err);
      }
    };

    checkYT = setInterval(() => {
      if (window.YT && window.YT.Player && typeof window.YT.Player === 'function') {
        clearInterval(checkYT);
        initPlayer();
      }
    }, 100);

    const progressInterval = setInterval(() => {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
        setCurrentTime(ytPlayerRef.current.getCurrentTime());
        setDuration(ytPlayerRef.current.getDuration() || 0);
      }
    }, 250);

    return () => {
      clearInterval(checkYT);
      clearInterval(progressInterval);
      if (player && typeof player.destroy === 'function') {
        player.destroy();
      }
    };
  }, [ytId, isYouTube]);

  // 2. Local HTML5 Audio Event Handlers
  const handleLocalTimeUpdate = () => {
    if (localAudioRef.current) {
      setCurrentTime(localAudioRef.current.currentTime);
    }
  };

  const handleLocalLoadedMetadata = () => {
    if (localAudioRef.current) {
      setDuration(localAudioRef.current.duration || 0);
    }
  };

  const handleLocalEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  // Sync volume state to local audio element
  useEffect(() => {
    if (!isYouTube && localAudioRef.current) {
      localAudioRef.current.volume = volume / 100;
    }
  }, [volume, isYouTube]);

  // 3. User Controls Actions
  const handlePlayPause = () => {
    if (isYouTube) {
      if (!ytPlayerRef.current) return;
      if (isPlaying) {
        ytPlayerRef.current.pauseVideo();
        setIsPlaying(false);
      } else {
        ytPlayerRef.current.playVideo();
        setIsPlaying(true);
      }
    } else {
      if (!localAudioRef.current) return;
      if (isPlaying) {
        localAudioRef.current.pause();
        setIsPlaying(false);
      } else {
        localAudioRef.current.play().catch(err => console.log('Autoplay blocked:', err));
        setIsPlaying(true);
      }
    }
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (isYouTube) {
      if (ytPlayerRef.current) ytPlayerRef.current.seekTo(time, true);
    } else {
      if (localAudioRef.current) localAudioRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e) => {
    const vol = parseInt(e.target.value, 10);
    setVolume(vol);
    if (isYouTube) {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.setVolume === 'function') {
        ytPlayerRef.current.setVolume(vol);
      }
    } else {
      if (localAudioRef.current) {
        localAudioRef.current.volume = vol / 100;
      }
    }
  };

  if (!url) return null;

  return (
    <div className={`audio-player-wrapper ${isExiting ? 'exiting' : ''}`}>
      <span className="audio-label">{fieldLabel.toUpperCase()}</span>
      
      {/* Hidden local audio element if playing local files */}
      {!isYouTube && (
        <audio 
          ref={localAudioRef} 
          src={url} 
          autoPlay 
          onTimeUpdate={handleLocalTimeUpdate}
          onLoadedMetadata={handleLocalLoadedMetadata}
          onEnded={handleLocalEnded}
          style={{ display: 'none' }}
        />
      )}

      {isYouTube && (
        /* YouTube Player offscreen container with actual rendering dimensions */
        <div style={{ 
          position: 'absolute', 
          left: '-9999px', 
          top: '-9999px', 
          width: '300px', 
          height: '200px', 
          overflow: 'hidden', 
          pointerEvents: 'none' 
        }}>
          <div id={iframeId}></div>
        </div>
      )}

      {/* Unified Custom Controller Layout for BOTH Local & YouTube */}
      <div className="audio-player-controls">
        <button 
          onClick={handlePlayPause}
          type="button"
          style={{ 
            padding: 0, 
            margin: 0,
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'var(--accent-primary)', 
            border: '1px solid var(--border-subtle)',
            background: 'var(--bg-primary)',
            cursor: 'pointer',
            outline: 'none',
            boxSizing: 'border-box',
            flexShrink: 0
          }}
        >
          {isPlaying ? (
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style={{ display: 'block' }}>
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style={{ display: 'block' }}>
              <path d="M9.5 5v14l11-7z" />
            </svg>
          )}
        </button>

        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', minWidth: '35px', textAlign: 'center', flexShrink: 0 }}>
          {formatTime(currentTime)}
        </span>

        <input 
          type="range" 
          min="0" 
          max={duration || 100} 
          value={currentTime} 
          onChange={handleSeek} 
          style={{
            flex: '1 1 0%',
            minWidth: '0px',
            accentColor: 'var(--accent-primary)', 
            cursor: 'pointer',
            height: '4px',
            borderRadius: '2px'
          }} 
        />

        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', minWidth: '35px', textAlign: 'center', flexShrink: 0 }}>
          {formatTime(duration)}
        </span>

        {/* Volume Icon + Bar */}
        <div className="audio-player-volume-container">
          <span style={{ fontSize: '12px' }}>🔊</span>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={volume} 
            onChange={handleVolumeChange} 
            style={{
              width: '60px', 
              accentColor: 'var(--accent-primary)', 
              cursor: 'pointer',
              height: '4px'
            }} 
          />
        </div>
      </div>

      <button 
        className="audio-player-close-btn"
        onClick={onClose}
        type="button"
      >
        <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  );
};

export default PieceAudioPlayer;