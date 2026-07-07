import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPhotoById, deletePhoto } from '../api/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

const PhotoDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, token } = useAuth();

  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhoto = async () => {
      try {
        const data = await getPhotoById(id);
        setPhoto(data);
      } catch (error) {
        toast.error('Foto no encontrada');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchPhoto();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta foto?')) {
      return;
    }

    try {
      await deletePhoto(id, token);
      toast.success('Foto eliminada correctamente');
      navigate('/');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <>
        <Navbar onUploadClick={() => {}} />
        <div className="loading-screen">
          <div className="spinner"></div>
        </div>
      </>
    );
  }

  if (!photo) return null;

  const imageUrl = `http://localhost:3000/uploads/photos/${photo.image}`;
  const isOwner = isAuthenticated && user && user.id === photo.user_id;
  const isAdmin = user.role == "admin";

  return (
    <>
      <Navbar onUploadClick={() => navigate('/')} />

      <main className="detail-page">
        <div className="detail-container">
          <Link to="/" className="back-link">← Volver a la galería</Link>

          <div className="detail-card">
            <div className="detail-image-wrapper">
              <img
                src={imageUrl}
                alt={photo.title || 'Foto'}
                className="detail-image"
              />
            </div>

            <div className="detail-info">
              <h1 className="detail-title">{photo.title || 'Sin título'}</h1>

              {photo.description && (
                <p className="detail-description">{photo.description}</p>
              )}

              <div className="detail-meta">
                <div className="detail-meta-item">
                  <span className="meta-label">Fecha</span>
                  <span className="meta-value">{formatDate(photo.created_at)}</span>
                </div>
              </div>

              {(isOwner || isAdmin) && (
                <button className="btn btn-danger" onClick={handleDelete}>
                  🗑️ Eliminar esta foto
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default PhotoDetailPage;
