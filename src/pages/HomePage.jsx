import { useState, useEffect, useCallback } from 'react';
import { getChoirs, searchUsers } from '../api/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ChoirCard from '../components/ChoirCard';
import Pagination from '../components/utils/Pagination';
import UserCard from '../components/utils/UserCard';

const HomePage = () => {
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [choirs, setChoirs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados de búsqueda
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('choirs'); // 'choirs' | 'users'
  const [usersResult, setUsersResult] = useState([]);
  const [searchingUsers, setSearchingUsers] = useState(false);

  // Estados de paginación
  const [myPage, setMyPage] = useState(1);
  const [communityPage, setCommunityPage] = useState(1);
  const [usersPage, setUsersPage] = useState(1);
  const CHOIRS_PER_PAGE = 8;
  const USERS_PER_PAGE = 10;

  const fetchChoirs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getChoirs(token);
      setChoirs(response.data || []);
    } catch (error) {
      console.error('Error fetching choirs:', error);
      toast.error('Error al cargar los coros');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchUsers = useCallback(async () => {
    try {
      setSearchingUsers(true);
      const response = await searchUsers('', token);
      setUsersResult(response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setSearchingUsers(false);
    }
  }, [token]);

  useEffect(() => {
    fetchChoirs();
    fetchUsers();
  }, [fetchChoirs, fetchUsers]);

  // Debounce de la búsqueda (500ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Resetear páginas al cambiar búsqueda o pestaña
  useEffect(() => {
    setMyPage(1);
    setCommunityPage(1);
    setUsersPage(1);
  }, [debouncedSearchQuery, searchType]);

  // Búsquedas dinámicas de usuarios
  useEffect(() => {
    const fetchFilteredUsers = async () => {
      if (searchType === 'users') {
        try {
          setSearchingUsers(true);
          const response = await searchUsers(debouncedSearchQuery, token);
          setUsersResult(response.data || []);
        } catch (error) {
          console.error('Error searching users:', error);
        } finally {
          setSearchingUsers(false);
        }
      }
    };

    fetchFilteredUsers();
  }, [debouncedSearchQuery, searchType, token]);

  const handleCreateChoirClick = () => {
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para crear un coro');
      navigate('/login');
    } else {
      navigate('/choirs/create');
    }
  };

  const handleTabChange = (type) => {
    setSearchType(type);
    setSearchQuery('');
    setDebouncedSearchQuery('');
  };

  // Filtrar coros localmente
  const filterChoirs = (list) =>
    list.filter(choir =>
      choir.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      (choir.description && choir.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase())) ||
      (choir.place && choir.place.toLowerCase().includes(debouncedSearchQuery.toLowerCase())) ||
      (choir.country && choir.country.toLowerCase().includes(debouncedSearchQuery.toLowerCase()))
    );

  const myChoirs = choirs.filter(c => c.membership && c.membership.status === 'accepted');
  const communityChoirs = choirs.filter(c => !c.membership || c.membership.status !== 'accepted');

  const filteredMyChoirs = filterChoirs(myChoirs);
  const filteredCommunityChoirs = filterChoirs(communityChoirs);

  // Segmentos paginados
  const paginatedMyChoirs = filteredMyChoirs.slice((myPage - 1) * CHOIRS_PER_PAGE, myPage * CHOIRS_PER_PAGE);
  const paginatedCommunityChoirs = filteredCommunityChoirs.slice((communityPage - 1) * CHOIRS_PER_PAGE, communityPage * CHOIRS_PER_PAGE);
  const paginatedUsers = usersResult.slice((usersPage - 1) * USERS_PER_PAGE, usersPage * USERS_PER_PAGE);

  return (
    <>
      <Navbar onCreateChoirClick={handleCreateChoirClick} />

      <main className="main-content">
        {/* Hero Section */}
        <header className="hero">
          <div className="hero-content">
            <img src="/logo-transparent.png" alt="Logo" className="hero-logo" />
            <h1 className="hero-title brand-text">
              Choral Record
            </h1>
            <p className="hero-subtitle hero-subtitle-text">
              La primera red social de coros y coralistas
            </p>
            {!isAuthenticated && (
              <div className="hero-actions">
                <Link to="/register" className="btn btn-accent hero-cta-btn">
                  Comenzar Ahora
                </Link>
              </div>
            )}
          </div>
          <div className="hero-glow"></div>
        </header>

        {/* Buscador Integrado */}
        <section className="search-section">
          <div className="search-tabs">
            <button
              className={`btn ${searchType === 'choirs' ? 'btn-accent' : 'btn-ghost'}`}
              onClick={() => handleTabChange('choirs')}
            >
              🔍 Buscar Coros
            </button>
            <button
              className={`btn ${searchType === 'users' ? 'btn-accent' : 'btn-ghost'}`}
              onClick={() => handleTabChange('users')}
            >
              👤 Buscar Usuarios
            </button>
          </div>

          <input
            type="text"
            className="form-input search-input-rounded"
            placeholder={searchType === 'choirs' ? 'Buscar coros por nombre, descripción, lugar o país...' : 'Buscar usuarios por nombre o username...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </section>

        <div className="staff-divider hp-divider"></div>

        {/* Contenedor de Resultados */}
        <div className="results-container">

          {/* Vista: Buscar Coros */}
          {searchType === 'choirs' && (
            <>
              {loading ? (
                <section className="gallery-section">
                  <p className="text-secondary">Cargando coros...</p>
                </section>
              ) : filteredMyChoirs.length === 0 && filteredCommunityChoirs.length === 0 ? (
                <section className="gallery-section">
                  {choirs.length > 0 ? (
                    <p className="text-secondary">No se encontraron coros que coincidan con la búsqueda.</p>
                  ) : (
                    <div className="empty-state">
                      <p>No hay coros creados todavía.</p>
                      <button className="btn btn-accent" onClick={handleCreateChoirClick}>
                        ¡Sé el primero en crear uno!
                      </button>
                    </div>
                  )}
                </section>
              ) : (
                <>
                  {/* Mis Coros */}
                  {isAuthenticated && filteredMyChoirs.length > 0 && (
                    <section className="gallery-section">
                      <div className="section-header">
                        <h2 className="section-title">Mis Coros</h2>
                      </div>
                      <div key={`my-choirs-${debouncedSearchQuery}`} className="choir-grid">
                        {paginatedMyChoirs.map(choir => (
                          <ChoirCard key={choir.id} choir={choir} />
                        ))}
                      </div>
                      <Pagination
                        currentPage={myPage}
                        totalItems={filteredMyChoirs.length}
                        itemsPerPage={CHOIRS_PER_PAGE}
                        onPageChange={setMyPage}
                      />
                    </section>
                  )}

                  {/* Separador */}
                  {isAuthenticated && filteredMyChoirs.length > 0 && filteredCommunityChoirs.length > 0 && (
                    <div className="staff-divider hp-divider-community"></div>
                  )}

                  {/* Coros de la Comunidad */}
                  {filteredCommunityChoirs.length > 0 && (
                    <section className="gallery-section gallery-section--bottom">
                      <h2 className="section-title section-title--left">
                        {isAuthenticated ? 'Coros de la Comunidad' : 'Explorar Coros'}
                      </h2>
                      <div key={`community-choirs-${debouncedSearchQuery}`} className="choir-grid">
                        {paginatedCommunityChoirs.map(choir => (
                          <ChoirCard key={choir.id} choir={choir} />
                        ))}
                      </div>
                      <Pagination
                        currentPage={communityPage}
                        totalItems={filteredCommunityChoirs.length}
                        itemsPerPage={CHOIRS_PER_PAGE}
                        onPageChange={setCommunityPage}
                      />
                    </section>
                  )}
                </>
              )}
            </>
          )}

          {/* Vista: Buscar Usuarios */}
          {searchType === 'users' && (
            <section className="gallery-section gallery-section--bottom">
              <h2 className="section-title section-title--left">
                {searchQuery.trim().length > 0 ? 'Resultados de la búsqueda' : 'Todos los Usuarios'} ({usersResult.length})
              </h2>
              {searchingUsers && usersResult.length === 0 ? (
                <p className="text-secondary">Cargando usuarios...</p>
              ) : usersResult.length > 0 ? (
                <>
                  <div key={`users-${debouncedSearchQuery}`} className="user-grid">
                    {paginatedUsers.map(userItem => (
                      <UserCard key={userItem.id} userItem={userItem} />
                    ))}
                  </div>
                  <Pagination
                    currentPage={usersPage}
                    totalItems={usersResult.length}
                    itemsPerPage={USERS_PER_PAGE}
                    onPageChange={setUsersPage}
                  />
                </>
              ) : (
                <p className="text-secondary">No se encontraron usuarios.</p>
              )}
            </section>
          )}

        </div>
      </main>
    </>
  );
};

export default HomePage;
