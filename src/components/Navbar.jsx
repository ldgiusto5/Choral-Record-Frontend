import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getChoirs, searchUsers, BACKEND_URL } from '../api/api';

const Navbar = () => {
  const { isAuthenticated, user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [choirs, setChoirs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Cargar coros al inicio o al cambiar el token para el buscador local
  useEffect(() => {
    const loadChoirs = async () => {
      try {
        const data = await getChoirs(token);
        setChoirs(data.data || []);
      } catch (err) {
        console.error('Error loading choirs for navbar search:', err);
      }
    };
    loadChoirs();
  }, [token]);

  // Cerrar el desplegable al hacer clic fuera del componente buscador
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lógica de búsqueda con de-bounce de 250ms
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsOpen(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      setIsOpen(true);
      try {
        const isUserOnly = searchQuery.startsWith('@');
        const cleanQuery = isUserOnly ? searchQuery.slice(1) : searchQuery;
        const queryLower = cleanQuery.toLowerCase();

        // 1. Filtrar coros localmente (solo si no empieza con @)
        const matchedChoirs = isUserOnly
          ? []
          : choirs
              .filter(c => c.name.toLowerCase().includes(queryLower) || (c.description && c.description.toLowerCase().includes(queryLower)))
              .map(c => ({
                type: 'choir',
                id: c.id,
                name: c.name,
                image_url: c.image_file, // Usar image_file de la base de datos para coros
                subtitle: c.director || ''
              }));

        // 2. Buscar usuarios en el backend (solo si no es vacío después de quitar el @)
        let matchedUsers = [];
        if (!isUserOnly || cleanQuery.trim() !== '') {
          try {
            const res = await searchUsers(cleanQuery, token);
            matchedUsers = (res.data || []).map(u => ({
              type: 'user',
              id: u.id,
              name: u.name,
              username: u.username,
              image_url: u.profile_image_url,
              subtitle: `@${u.username}`
            }));
          } catch (userErr) {
            console.error('Error searching users in navbar:', userErr);
          }
        }

        setSearchResults([...matchedChoirs, ...matchedUsers]);
      } catch (error) {
        console.error('Error running navbar search:', error);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, choirs, token]);

  const handleResultClick = (item) => {
    setSearchQuery('');
    setIsOpen(false);
    if (item.type === 'choir') {
      navigate(`/choirs/${item.id}`);
    } else {
      navigate(`/profile/${item.username}`);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand brand-link-unified">
          <span className="brand-icon" style={{ display: 'flex', alignItems: 'center' }}>
            <img src="/logo-transparent.png" alt="Logo" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
          </span>
          <span className="brand-text">Choral Record</span>
        </Link>

        {/* Buscador Global con Desplegable */}
        <div className="navbar-search" ref={dropdownRef}>
          <div style={{ position: 'relative', width: '100%' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '13px', color: 'var(--text-muted)' }}>
              🔍
            </span>
            <input
              type="text"
              placeholder="Buscar coros o usuarios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => { if (searchQuery.trim()) setIsOpen(true); }}
              className="navbar-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '11px',
                  color: 'var(--text-muted)'
                }}
              >
                ✕
              </button>
            )}
          </div>

          {isOpen && (
            <div className="search-results-dropdown">
              {loading ? (
                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                  Buscando...
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((item) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    onClick={() => handleResultClick(item)}
                    className="search-result-item"
                  >
                    {/* Miniatura del coro / Avatar de usuario */}
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: item.type === 'user' ? '50%' : '6px',
                      overflow: 'hidden',
                      flexShrink: 0,
                      background: item.type === 'user' 
                        ? 'var(--bg-secondary)' 
                        : 'linear-gradient(135deg, #fefbf0 0%, #ebd3a2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid var(--border-subtle)'
                    }}>
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentNode.innerHTML = item.type === 'user' ? '👤' : '<img src="/logo-transparent.png" style="width: 100%; height: 100%; object-fit: cover;" />';
                          }}
                        />
                      ) : (
                        item.type === 'user' ? (
                          <span style={{ fontSize: '16px' }}>👤</span>
                        ) : (
                          <img src="/logo-transparent.png" alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        )
                      )}
                    </div>

                    {/* Textos Informativos */}
                    <div style={{ flexGrow: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {item.name}
                      </div>
                      {item.subtitle && (
                        <div style={{
                          fontSize: '11px',
                          color: 'var(--text-muted)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {item.subtitle}
                        </div>
                      )}
                    </div>

                    {/* Etiqueta de tipo */}
                    <span className={`search-type-badge ${item.type === 'choir' ? 'search-type-choir' : 'search-type-user'}`}>
                      {item.type === 'choir' ? 'Coro' : 'Usuario'}
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                  Sin resultados para "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>

        <div className="navbar-actions">
          {isAuthenticated ? (
            <>
              <Link to="/events" style={{
                color: 'var(--text-primary)',
                fontSize: '14.5px',
                fontWeight: '600',
                textDecoration: 'none',
                marginRight: '20px',
                transition: 'color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
              >
                Eventos
              </Link>

              {/* Botón "Crear Coro" redimensionado un 20% más pequeño */}
              <Link to="/choirs/create" className="btn btn-accent" style={{ padding: '8px 14px', fontSize: '13.5px' }}>
                <span className="btn-icon" style={{ fontSize: '12px' }}>+</span>
                Crear Coro
              </Link>
              
              <Link to={`/profile/${user.username || user.id}`} className="user-badge-link">
                <div className="user-badge">
                  <div className="user-avatar">
                    <img 
                      src={user.profile_image_url || `${BACKEND_URL}/assets/default-avatar.png`} 
                      alt={user.name} 
                      className="avatar-img" 
                    />
                  </div>
                  <span className="user-name">{user.name}</span>
                </div>
              </Link>

              <button className="btn btn-ghost" onClick={handleLogout}>
                Salir
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">
                Iniciar Sesión
              </Link>
              <Link to="/register" className="btn btn-accent">
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
