import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getChoirById, createChoirEvent } from '../api/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import SettingToggleCard from '../components/utils/SettingToggleCard';
import FormActionButtons from '../components/utils/FormActionButtons';
import FileUploaderInput from '../components/utils/FileUploaderInput';
import toast from 'react-hot-toast';

const AddEventPage = () => {
  const { id } = useParams();
  const { token, isAuthenticated, loading: loadingAuth } = useAuth();
  const navigate = useNavigate();

  const [choir, setChoir] = useState(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [isPublic, setIsPublic] = useState(false);
  
  // Archivos
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [infoFile, setInfoFile] = useState(null);
  
  const [submitting, setSubmitting] = useState(false);
  const [imageKey, setImageKey] = useState(0);

  useEffect(() => {
    if (loadingAuth) return;
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para realizar esta acción');
      navigate('/login');
      return;
    }

    const checkAdminPermission = async () => {
      try {
        setLoading(true);
        const choirData = await getChoirById(id, token);
        setChoir(choirData);
        
        const isAdmin = choirData.membership && choirData.membership.role === 'admin' && choirData.membership.status === 'accepted';
        if (!isAdmin) {
          toast.error('No tienes permisos de administrador en este coro');
          navigate(`/choirs/${id}`);
        }
      } catch (error) {
        console.error('Error checking choir permissions:', error);
        toast.error('Error al cargar la información del coro');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    checkAdminPermission();
  }, [id, token, isAuthenticated, loadingAuth, navigate]);

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

  const handleClearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageKey(prev => prev + 1);
  };

  const handleInfoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        toast.error('El archivo adjunto no debe superar los 15MB');
        return;
      }
      setInfoFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { toast.error('El título del evento es obligatorio'); return; }
    if (!eventDate) { toast.error('La fecha del evento es obligatoria'); return; }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      
      const isoDate = new Date(eventDate).toISOString();
      formData.append('event_date', isoDate);
      formData.append('is_visible', isVisible ? 'true' : 'false');
      formData.append('is_public', isPublic ? 'true' : 'false');

      if (imageFile) formData.append('image', imageFile);
      if (infoFile) formData.append('info', infoFile);

      const response = await createChoirEvent(id, formData, token);
      toast.success(response.message || 'Evento creado con éxito');
      navigate(`/choirs/${id}`);
    } catch (error) {
      toast.error(error.message || 'Error al programar el evento');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <><Navbar /><div style={{ textAlign: 'center', marginTop: '100px', color: 'var(--text-secondary)' }}>Verificando permisos...</div></>;

  return (
    <>
      <Navbar />

      <div className="auth-page" style={{ minHeight: 'calc(100vh - 70px)', display: 'flex', alignItems: 'center', padding: '40px 24px' }}>
        <div className="auth-container" style={{ maxWidth: '780px', width: '100%', margin: '0 auto' }}>
          <div className="auth-card" style={{ padding: '32px', textAlign: 'left' }}>
            <div className="auth-header" style={{ marginBottom: '24px' }}>
              <Link to={`/choirs/${id}`} style={{ color: 'var(--accent-primary)', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                ← Volver al Coro ({choir?.name})
              </Link>
              <h1 style={{ fontSize: '28px', margin: '0 0 8px 0', color: 'var(--text-primary)' }}>Programar Nuevo Evento</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                Crea un nuevo ensayo, concierto o reunión. Los miembros recibirán notificaciones en su panel.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form" style={{ maxWidth: '100%' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="event-title">Título del Evento *</label>
                <input id="event-title" type="text" className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="event-desc">Descripción</label>
                <textarea id="event-desc" className="form-input form-textarea" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="event-date">Fecha y Hora *</label>
                <input id="event-date" type="datetime-local" className="form-input" value={eventDate} onChange={(e) => setEventDate(e.target.value)} required style={{ colorScheme: 'light' }} />
              </div>

              <SettingToggleCard 
                label="Visibilidad para Miembros"
                checked={isVisible} onChange={() => setIsVisible(!isVisible)}
                iconTrue="👁️" iconFalse="🔒"
                titleTrue="Visible (todos los miembros activos lo verán)" titleFalse="Oculto (sólo los administradores lo verán)"
                descTrue="Todos los miembros activos del coro podrán ver este evento en su calendario" descFalse="Solo los administradores del coro podrán ver y gestionar este evento"
              />

              <SettingToggleCard 
                label="Acceso Público"
                checked={isPublic} onChange={() => setIsPublic(!isPublic)}
                iconTrue="🌍" iconFalse="🔒"
                titleTrue="Evento Público" titleFalse="Evento Privado"
                descTrue="Visible para todo el mundo, aunque no sea miembro del coro" descFalse="Solo visible para miembros activos del coro"
              />

              <div className="form-group" style={{ marginTop: '24px' }}>
                <label className="form-label" htmlFor="event-img">Imagen del Evento (opcional)</label>
                <div className="file-upload-container" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: imagePreview ? '12px' : '0' }}>
                  <input key={imageKey} id="event-img" type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                  <label htmlFor="event-img" className="btn btn-ghost" style={{ cursor: 'pointer' }}>Elegir Imagen</label>
                  {imageFile && <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{imageFile.name}</span>}
                </div>
                {imagePreview && (
                  <div style={{ position: 'relative', width: '100%', height: '110px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                    <img src={imagePreview} alt="Vista previa" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button type="button" onClick={handleClearImage} style={{ position: 'absolute', top: '8px', right: '8px', width: '28px', height: '28px', borderRadius: '50%', background: 'var(--danger)', color: '#fff', border: 'none', cursor: 'pointer', zIndex: 10 }}>🗑️</button>
                  </div>
                )}
              </div>

              <div className="form-group" style={{ marginTop: '24px' }}>
                <label className="form-label" htmlFor="event-info">Archivo de Información Adicional (opcional)</label>
                <FileUploaderInput 
                  id="event-info" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  file={infoFile} onFileChange={handleInfoFileChange} onClearFile={() => setInfoFile(null)}
                />
              </div>

              <FormActionButtons onCancel={() => navigate(`/choirs/${id}`)} isSubmitting={submitting} submitText="Programar Evento" submittingText="Programando Evento..." />
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddEventPage;