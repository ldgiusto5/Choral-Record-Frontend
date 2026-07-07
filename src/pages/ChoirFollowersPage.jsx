import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getChoirById, getChoirFollowers } from '../api/api';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

const ChoirFollowersPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [choir, setChoir] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFollowersData = async () => {
      try {
        setLoading(true);
        // Cargar detalles del coro
        const choirData = await getChoirById(id);
        setChoir(choirData);

        // Cargar seguidores
        const followersData = await getChoirFollowers(id);
        setFollowers(followersData.data || []);
      } catch (error) {
        console.error('Error al cargar seguidores:', error);
        toast.error('Error al cargar la lista de seguidores');
      } finally {
        setLoading(false);
      }
    };

    loadFollowersData();
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="main-content text-secondary-center-msg">
          <p>Cargando seguidores...</p>
        </main>
      </>
    );
  }

  if (!choir) {
    return (
      <>
        <Navbar />
        <main className="main-content text-secondary-center-msg">
          <div className="alert alert-danger">
            Coro no encontrado.
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="main-content followers-page-main">
        
        {/* Cabecera de Navegación y Título */}
        <div className="events-header">
          <button 
            onClick={() => navigate(`/choirs/${id}`)}
            className="back-link-btn"
          >
            ← Volver a {choir.name}
          </button>
        </div>

        <div className="staff-divider profile-divider-spacing" />

        {/* Listado de Seguidores */}
        <div className="profile-grid-section">
          <div className="photo-card followers-card">
            <h2 className="section-title section-title--left">
              Seguidores del Coro ({followers.length})
            </h2>
            {followers.length > 0 ? (
              <div className="events-list-container">
                {followers.map(follower => (
                  <div key={follower.id} className="follower-item">
                    <Link to={`/profile/${follower.username || follower.id}`} className="follower-link">
                      <div className="follower-avatar">
                        <img 
                          src={follower.profile_image_url || 'http://localhost:3000/assets/default-avatar.png'} 
                          alt={follower.name} 
                          className="avatar-img"
                        />
                      </div>
                      <div className="follower-info">
                        <h4 className="follower-name">{follower.name}</h4>
                        <span className="follower-username">@{follower.username}</span>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="follower-empty-state">
                <span className="follower-empty-icon">💜</span>
                <p className="follower-empty-text">Este coro no tiene seguidores todavía.</p>
              </div>
            )}
          </div>
        </div>

      </main>
    </>
  );
};

export default ChoirFollowersPage;
