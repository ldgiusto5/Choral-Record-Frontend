import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFollowedChoirsEvents, getFollowedChoirs } from '../api/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import EventCard from '../components/EventCard';

const EventsPage = () => {
  const { token, isAuthenticated, loading: loadingAuth } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [followedCount, setFollowedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'public' | 'private'

  useEffect(() => {
    if (loadingAuth) return;
    if (!isAuthenticated) {
      toast.error('Inicia sesión para ver los eventos de los coros que sigues');
      navigate('/login');
      return;
    }

    const fetchEvents = async () => {
      try {
        setLoading(true);
        const followedRes = await getFollowedChoirs(token);
        const count = followedRes.data ? followedRes.data.length : 0;
        setFollowedCount(count);

        if (count > 0) {
          const res = await getFollowedChoirsEvents(token);
          setEvents(res.data || []);
        } else {
          setEvents([]);
        }
      } catch (err) {
        console.error('Error al cargar eventos:', err);
        toast.error('Error al cargar la lista de eventos');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [token, isAuthenticated, loadingAuth, navigate]);

  const filteredEvents = events.filter(event => {
    // 1. Filtrado de buscador (por nombre de evento o nombre de coro)
    const matchesSearch = 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.choir_name && event.choir_name.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    // 2. Filtrado por tipo de evento (Público/Privado)
    const isPublic = event.is_public === 1 || event.is_public === true;
    if (filterType === 'public') {
      return isPublic;
    }
    if (filterType === 'private') {
      return !isPublic;
    }

    return true;
  });

  if (loadingAuth || loading) {
    return (
      <>
        <Navbar />
        <main className="main-content text-secondary-center-msg">
          <p>Cargando eventos...</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="main-content events-page-main">
        
        <div className="events-header">
          <h1 className="brand-text events-title">
            Eventos Corales
          </h1>
          <p className="text-secondary events-subtitle">
            No te pierdas ningún evento de los coros que sigues. 
            Aquí podrás ver los próximos conciertos, ensayos abiertos y otros eventos importantes.
          </p>
        </div>

        <div className="staff-divider profile-divider-spacing" />

        {/* Buscador de Eventos */}
        <div className="events-filter-wrapper">
          <input
            type="text"
            className="form-input search-input-rounded"
            placeholder="Buscar eventos por título o nombre del coro..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* Botones de Filtro Tipo */}
          <div className="events-filter-buttons">
            <button
              className={`btn events-filter-btn ${filterType === 'all' ? 'btn-accent' : 'btn-ghost'}`}
              onClick={() => setFilterType('all')}
            >
              Todos
            </button>
            <button
              className={`btn events-filter-btn ${filterType === 'public' ? 'btn-accent' : 'btn-ghost'}`}
              onClick={() => setFilterType('public')}
            >
              Públicos
            </button>
            <button
              className={`btn events-filter-btn ${filterType === 'private' ? 'btn-accent' : 'btn-ghost'}`}
              onClick={() => setFilterType('private')}
            >
              Privados
            </button>
          </div>
        </div>

        {/* Listado de Eventos */}
        <section className="profile-grid-section">
          {followedCount === 0 ? (
            <div className="events-empty-card">
              <p>Debes seguir a algún coro para ver sus eventos.</p>
            </div>
          ) : events.length === 0 ? (
            <div className="events-empty-card">
              <p>No hay eventos disponibles en este momento de los coros a los que sigues</p>
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="events-list-container">
              {filteredEvents.map(event => (
                <EventCard 
                  key={event.id}
                  event={event}
                  choirId={event.choir_id}
                  isAdmin={false}
                  showChoirName={true}
                  onClick={() => navigate(`/choirs/${event.choir_name}`)}
                />
              ))}
            </div>
          ) : (
            <div className="events-empty-card">
              <p>No se han encontrado eventos para este filtro.</p>
            </div>
          )}
        </section>

      </main>
    </>
  );
};

export default EventsPage;
