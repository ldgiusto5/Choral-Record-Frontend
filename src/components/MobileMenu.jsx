import { useState } from 'react';
import { Link } from 'react-router-dom';
import './MobileMenu.css';

const MobileMenu = ({
  isOpen,
  onClose,
  isAuthenticated,
  user,
  handleLogout,
  BACKEND_URL,
  eventCount
}) => {
  const [isGamesExpanded, setIsGamesExpanded] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="mobile-menu-overlay" onClick={onClose}>
      <div className="mobile-menu-dropdown" onClick={(e) => e.stopPropagation()}>
        <div className="mobile-menu-header">
          <span className="mobile-menu-title">Choral Record</span>
          <button className="mobile-menu-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="mobile-menu-links">
          {isAuthenticated && (
            <Link to={`/profile/${user?.username || user?.id}`} className="mobile-menu-profile-row" onClick={onClose}>
              <div className={`mobile-menu-avatar-wrapper ${user?.has_perfect_pitch_reward ? 'has-perfect-pitch-frame' : ''}`}>
                <img 
                  src={user?.profile_image_url || `${BACKEND_URL}/assets/default-avatar.png`} 
                  alt={user?.name} 
                  className="mobile-menu-avatar"
                  onError={(e) => {
                    e.target.src = `${BACKEND_URL}/assets/default-avatar.png`;
                  }}
                />
              </div>
              <div className="mobile-menu-profile-info">
                <span className="name">{user?.name}</span>
                <span className="username">@{user?.username}</span>
              </div>
            </Link>
          )}

          <Link to="/" className="mobile-menu-item-text" onClick={onClose}>
            Inicio
          </Link>

          {/* Pestaña desplegable de Juegos en Mobile */}
          <div className="mobile-menu-games-accordion">
            <button 
              type="button" 
              className="mobile-menu-item-text mobile-menu-games-trigger" 
              onClick={() => setIsGamesExpanded(!isGamesExpanded)}
            >
              <span>Juegos</span>
              <span className={`mobile-games-arrow ${isGamesExpanded ? 'open' : ''}`}>▾</span>
            </button>

            {isGamesExpanded && (
              <div className="mobile-menu-games-sublist">
                <Link 
                  to="/games/guess-note" 
                  className="mobile-menu-subitem-link" 
                  onClick={onClose}
                >
                  <span className="game-subitem-icon">🎵</span>
                  <div className="game-subitem-info">
                    <span className="game-subitem-title">Guess Note</span>
                    <span className="game-subitem-desc">Adivina la nota de piano diaria</span>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {isAuthenticated ? (
            <>
              <Link to="/events" className="mobile-menu-item-text mobile-menu-events-link" onClick={onClose}>
                Eventos
                {eventCount > 0 && (
                  <span className="mobile-event-badge">
                    {eventCount}
                  </span>
                )}
              </Link>
              
              <Link to="/choirs/create" className="mobile-menu-item-text" onClick={onClose}>
                Crear Coro
              </Link>

              <button className="mobile-menu-item-text mobile-menu-logout-text" onClick={() => { handleLogout(); onClose(); }}>
                Cerrar Sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="mobile-menu-item-text" onClick={onClose}>
                Iniciar Sesión
              </Link>
              <Link to="/register" className="mobile-menu-item-text" onClick={onClose}>
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
