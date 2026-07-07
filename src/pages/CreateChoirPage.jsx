import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createChoir } from '../api/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

const CreateChoirPage = () => {
  const { token, isAuthenticated, loading: loadingAuth } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [place, setPlace] = useState('');
  const [country, setCountry] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Redirigir a login si no está autenticado
  if (loadingAuth) {
    return (
      <>
        <Navbar />
        <div style={{ textAlign: 'center', marginTop: '100px', color: 'var(--text-secondary)' }}>
          Verificando sesión...
        </div>
      </>
    );
  }

  if (!isAuthenticated) {
    toast.error('Debes iniciar sesión para crear un coro');
    navigate('/login');
    return null;
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La imagen no debe superar los 5MB');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('El nombre del coro es obligatorio');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('is_public', isPublic ? 'true' : 'false');
      if (place.trim()) formData.append('place', place.trim());
      if (country.trim()) formData.append('country', country.trim());
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await createChoir(formData, token);
      toast.success(response.message || 'Coro creado con éxito');
      
      // Redirigir al detalle del coro creado
      if (response.choir && response.choir.id) {
        navigate(`/choirs/${response.choir.id}`);
      } else {
        navigate('/');
      }
    } catch (error) {
      toast.error(error.message || 'Error al crear el coro');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="auth-page" style={{ minHeight: 'calc(100vh - 70px)', display: 'flex', alignItems: 'center', padding: '40px 24px' }}>
        <div className="auth-container" style={{ maxWidth: '750px', width: '100%', margin: '0 auto' }}>
          <div className="auth-card" style={{ padding: '32px', textAlign: 'left' }}>
            <div className="auth-header" style={{ marginBottom: '24px' }}>
              <Link to="/" style={{ color: 'var(--accent-primary)', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                ← Volver al Inicio
              </Link>
              <h1 style={{ fontSize: '28px', margin: '0 0 8px 0', color: 'var(--text-primary)' }}>Crear Nuevo Coro</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                Establece la identidad de tu grupo musical para empezar a subir partituras, audios y organizar eventos.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form" style={{ maxWidth: '100%' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="choir-name">Nombre del Coro *</label>
                <input
                  id="choir-name"
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Coral del Sagrario"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="choir-desc">Descripción</label>
                <textarea
                  id="choir-desc"
                  className="form-input form-textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explica qué tipo de voces integran el coro, el repertorio musical..."
                  rows={4}
                />
              </div>

              {/* Lugar y País en fila (ajustable en móvil) */}
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div className="form-group" style={{ flex: '1 1 240px' }}>
                  <label className="form-label" htmlFor="choir-place">Lugar</label>
                  <input
                    id="choir-place"
                    type="text"
                    className="form-input"
                    value={place}
                    onChange={(e) => setPlace(e.target.value)}
                    placeholder="Ej. Málaga"
                  />
                </div>
                <div className="form-group" style={{ flex: '1 1 240px' }}>
                  <label className="form-label" htmlFor="choir-country">País</label>
                  <input
                    id="choir-country"
                    type="text"
                    className="form-input"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Ej. España"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Privacidad del Coro</label>
                <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '15px' }}>
                    <input
                      type="radio"
                      name="isPublic"
                      checked={isPublic === true}
                      onChange={() => setIsPublic(true)}
                      style={{ accentColor: 'var(--accent-primary)', width: '16px', height: '16px' }}
                    />
                    <span>Público (cualquiera puede unirse directamente)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '15px' }}>
                    <input
                      type="radio"
                      name="isPublic"
                      checked={isPublic === false}
                      onChange={() => setIsPublic(false)}
                      style={{ accentColor: 'var(--accent-primary)', width: '16px', height: '16px' }}
                    />
                    <span>Privado (requiere solicitud y aprobación)</span>
                  </label>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '24px' }}>
                <label className="form-label" htmlFor="choir-img">Foto de Perfil del Coro (opcional)</label>
                <div className="file-upload-container" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <input
                    id="choir-img"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="choir-img" className="btn btn-ghost" style={{ cursor: 'pointer' }}>
                    Elegir Foto
                  </label>
                  {imageFile && <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{imageFile.name}</span>}
                </div>
                {imagePreview && (
                  <div style={{ marginTop: '16px' }}>
                    <img 
                      src={imagePreview} 
                      alt="Vista previa del logo" 
                      style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
                    />
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
                <button type="button" className="btn btn-ghost" onClick={() => navigate('/')} style={{ flex: 1 }} disabled={submitting}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-accent" style={{ flex: 2 }} disabled={submitting}>
                  {submitting ? 'Creando Coro...' : 'Crear Coro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="auth-bg-effects">
        <div className="auth-blob auth-blob-1"></div>
        <div className="auth-blob auth-blob-2"></div>
      </div>
    </>
  );
};

export default CreateChoirPage;
