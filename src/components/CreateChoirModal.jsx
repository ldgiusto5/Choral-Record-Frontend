import { useState } from 'react';
import { createChoir } from '../api/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import ToggleSwitch from './utils/ToggleSwitch';

const CreateChoirModal = ({ isOpen, onClose, onChoirCreated }) => {
  const { token } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

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
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await createChoir(formData, token);
      toast.success(response.message || 'Coro creado con éxito');
      
      // Reset form
      setName('');
      setDescription('');
      setIsPublic(true);
      setImageFile(null);
      setImagePreview(null);
      
      onChoirCreated();
      onClose();
    } catch (error) {
      toast.error(error.message || 'Error al crear el coro');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <header className="modal-header">
          <h2 className="modal-title">Crear Nuevo Coro</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </header>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label" htmlFor="choir-name">Nombre del Coro *</label>
            <input
              id="choir-name"
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Coral de la Catedral"
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
              placeholder="Cuéntanos un poco sobre el coro, repertorio, horarios..."
              rows={3}
            />
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label className="form-label" style={{ margin: 0 }}>Acceso del Coro</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
              <ToggleSwitch checked={isPublic} onChange={() => setIsPublic(!isPublic)} />
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                {isPublic ? 'Público (cualquiera puede unirse)' : 'Privado (requiere aprobación)'}
              </span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="choir-img">Foto del Coro (opcional)</label>
            <div className="file-upload-container">
              <input
                id="choir-img"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="choir-img" className="btn btn-ghost" style={{ cursor: 'pointer', width: 'fit-content' }}>
                Seleccionar Imagen
              </label>
              {imageFile && <span className="file-name" style={{ marginLeft: '10px', fontSize: '14px', color: 'var(--text-secondary)' }}>{imageFile.name}</span>}
            </div>
            {imagePreview && (
              <div className="preview-container" style={{ marginTop: '10px' }}>
                <img
                  src={imagePreview}
                  alt="Vista previa"
                  style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                />
              </div>
            )}
          </div>

          <footer className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={submitting}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-accent" disabled={submitting}>
              {submitting ? 'Creando...' : 'Crear Coro'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default CreateChoirModal;
