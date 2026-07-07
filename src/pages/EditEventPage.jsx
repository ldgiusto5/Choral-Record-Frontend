import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getChoirById, getEventById, updateChoirEvent } from '../api/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import SettingToggleCard from '../components/utils/SettingToggleCard';
import FormActionButtons from '../components/utils/FormActionButtons';
import FileUploaderInput from '../components/utils/FileUploaderInput';
import toast from 'react-hot-toast';

const EditEventPage = () => {
  const { id, eventId } = useParams();
  const { token, isAuthenticated, loading: loadingAuth } = useAuth();
  const navigate = useNavigate();

  const [choir, setChoir] = useState(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  
  // Archivos
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [infoFile, setInfoFile] = useState(null);
  const [deleteImage, setDeleteImage] = useState(false);
  const [deleteInfoFile, setDeleteInfoFile] = useState(false);
  const [imageKey, setImageKey] = useState(0);

  const [currentEvent, setCurrentEvent] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const formatForInput = (dateString) => {
    if (!dateString) return '';
    try {
      const d = new Date(dateString);
      const tzOffset = d.getTimezoneOffset() * 60000;
      return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
    } catch (e) { return ''; }
  };

  useEffect(() => {
    if (loadingAuth) return;
    if (!isAuthenticated) { navigate('/login'); return; }

    const loadData = async () => {
      try {
        setLoading(true);
        const choirData = await getChoirById(id, token);
        setChoir(choirData);
        
        const isAdmin = choirData.membership && choirData.membership.role === 'admin' && choirData.membership.status === 'accepted';
        if (!isAdmin) { navigate(`/choirs/${id}`); return; }

        const eventData = await getEventById(id, eventId, token);
        setCurrentEvent(eventData);
        
        setTitle(eventData.title || '');
        setDescription(eventData.description || '');
        setEventDate(formatForInput(eventData.event_date));
        setIsVisible(eventData.is_visible !== false);
        setIsCompleted(eventData.is_completed === true);
        setIsPublic(eventData.is_public === true);
        setImagePreview(eventData.image_url || null);
      } catch (error) {
        toast.error('Error al cargar la información del evento');
        navigate(`/choirs/${id}`);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, eventId, token, isAuthenticated, loadingAuth, navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setDeleteImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !eventDate) return;

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('event_date', new Date(eventDate).toISOString());
      formData.append('is_visible', isVisible ? 'true' : 'false');
      formData.append('is_public', isPublic ? 'true' : 'false');
      formData.append('is_completed', isCompleted ? 'true' : 'false');

      if (imageFile) formData.append('image', imageFile);
      if (deleteImage) formData.append('delete_image', 'true');
      if (infoFile) formData.append('info', infoFile);
      if (deleteInfoFile) formData.append('delete_info', 'true'); // Asegúrate de que el backend soporte delete_info si es necesario.

      await updateChoirEvent(id, eventId, formData, token);
      toast.success('Evento actualizado con éxito');
      navigate(`/choirs/${id}`);
    } catch (error) {
      toast.error('Error al actualizar el evento');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <><Navbar /><div style={{ textAlign: 'center', marginTop: '100px' }}>Cargando datos...</div></>;

  return (
    <>
      <Navbar />

      <div className="auth-page" style={{ minHeight: 'calc(100vh - 70px)', display: 'flex', alignItems: 'center', padding: '40px 24px' }}>
        <div className="auth-container" style={{ maxWidth: '780px', width: '100%', margin: '0 auto' }}>
          <div className="auth-card" style={{ padding: '32px', textAlign: 'left' }}>
            <div className="auth-header" style={{ marginBottom: '24px' }}>
              <Link to={`/choirs/${id}`} style={{ color: 'var(--accent-primary)', fontSize: '14px', display: 'inline-flex', gap: '6px', marginBottom: '12px' }}>
                ← Volver al Coro ({choir?.name})
              </Link>
              <h1 style={{ fontSize: '28px', margin: '0 0 8px 0', color: 'var(--text-primary)' }}>Editar Evento</h1>
            </div>

            <form onSubmit={handleSubmit} className="auth-form" style={{ maxWidth: '100%' }}>
              <div className="form-group">
                <label className="form-label">Título del Evento *</label>
                <input type="text" className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label">Descripción</label>
                <textarea className="form-input form-textarea" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
              </div>

              <div className="form-group">
                <label className="form-label">Fecha y Hora *</label>
                <input type="datetime-local" className="form-input" value={eventDate} onChange={(e) => setEventDate(e.target.value)} required />
              </div>

              <div className="event-edit-grid-row" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '300px' }}>
                  <SettingToggleCard 
                    label="Visibilidad"
                    checked={isVisible} onChange={() => setIsVisible(!isVisible)}
                    iconTrue="👁️" iconFalse="🔒"
                    titleTrue="Visible" titleFalse="Oculto"
                    descTrue="Todos lo verán" descFalse="Solo administradores"
                  />
                </div>
                <div className="form-group" style={{ flex: 1, minWidth: '200px', marginTop: '20px' }}>
                  <label className="form-label">Estado de Finalización</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '10px' }}>
                    <input type="checkbox" checked={isCompleted} onChange={(e) => setIsCompleted(e.target.checked)} style={{ accentColor: 'var(--accent-primary)', width: '16px', height: '16px' }} />
                    <span>Marcar como Completado</span>
                  </label>
                </div>
              </div>

              <SettingToggleCard 
                label="Acceso Público"
                checked={isPublic} onChange={() => setIsPublic(!isPublic)}
                iconTrue="🌍" iconFalse="🔒"
                titleTrue="Evento Público" titleFalse="Evento Privado"
                descTrue="Visible para todo el mundo" descFalse="Solo visible para miembros activos"
              />

              {/* Lógica de Imagen (Personalizada por el preview) */}
              <div className="form-group" style={{ marginTop: '24px' }}>
                <label className="form-label">Imagen del Evento</label>
                <div className="file-upload-container" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                  <input key={imageKey} id="event-img" type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                  <label htmlFor="event-img" className="btn btn-ghost" style={{ cursor: 'pointer' }}>Elegir Imagen</label>
                  {imageFile && <span className="file-upload-name">{imageFile.name}</span>}
                </div>
                {imagePreview && !deleteImage && (
                  <div style={{ position: 'relative', width: '100%', height: '110px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                    <img src={imagePreview} alt="Vista previa" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button type="button" onClick={() => { setImageFile(null); setDeleteImage(true); }} style={{ position: 'absolute', top: '8px', right: '8px', background: 'var(--danger)', color: '#fff', border: 'none', borderRadius: '50%', width: '28px', height: '28px' }}>🗑️</button>
                  </div>
                )}
                {deleteImage && (
                   <div style={{ width: '100%', height: '110px', border: '1px dashed var(--danger)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                     <span style={{ color: 'var(--danger)', fontSize: '14px' }}>Se eliminará la imagen actual</span>
                     <button type="button" onClick={() => { setDeleteImage(false); setImagePreview(currentEvent?.image_url); }} className="btn btn-ghost" style={{ padding: '4px 12px', fontSize: '12px', marginTop: '8px' }}>🔄 Deshacer</button>
                   </div>
                )}
              </div>

              <div className="form-group" style={{ marginTop: '24px' }}>
                <label className="form-label">Archivo Adicional</label>
                <FileUploaderInput 
                  id="event-info" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  file={infoFile} currentFileUrl={currentEvent?.info_url}
                  isDeleted={deleteInfoFile}
                  onFileChange={(e) => { setInfoFile(e.target.files[0]); setDeleteInfoFile(false); }}
                  onClearFile={() => setInfoFile(null)}
                  onToggleDelete={() => setDeleteInfoFile(!deleteInfoFile)}
                />
              </div>

              <FormActionButtons onCancel={() => navigate(`/choirs/${id}`)} isSubmitting={submitting} submitText="Guardar Cambios" submittingText="Guardando Cambios..." />
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditEventPage;