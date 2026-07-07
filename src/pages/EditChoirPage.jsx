import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getChoirById,
  getChoirMembers,
  updateChoir,
  updateMemberRole,
} from '../api/api';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

/* ─── Confirmation Modal Component ──────────────────────────────────────── */
const ConfirmModal = ({ memberName, onConfirm, onCancel }) => (
  <div style={{
    position: 'fixed', inset: 0, zIndex: 9999,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(20,18,16,0.72)', backdropFilter: 'blur(6px)',
  }}>
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      padding: '36px 40px',
      maxWidth: '420px',
      width: '90%',
      boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '40px', marginBottom: '16px' }}>⚠️</div>
      <h3 style={{ margin: '0 0 12px 0', color: 'var(--text-primary)', fontSize: '20px' }}>
        ¿Quitar administrador?
      </h3>
      <p style={{ color: 'var(--text-secondary)', margin: '0 0 28px 0', lineHeight: '1.6' }}>
        <strong style={{ color: 'var(--accent-primary)' }}>{memberName}</strong> dejará de ser
        administrador del coro y pasará a ser miembro regular.
      </p>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button
          className="btn btn-ghost"
          style={{ minWidth: '120px' }}
          onClick={onCancel}
        >
          Cancelar
        </button>
        <button
          className="btn"
          style={{
            minWidth: '120px',
            background: 'var(--danger)',
            color: '#fff',
            border: '1px solid var(--danger)',
          }}
          onClick={onConfirm}
        >
          Sí, quitar admin
        </button>
      </div>
    </div>
  </div>
);

/* ─── iOS-style Toggle Switch ─────────────────────────────────────────── */
const ToggleSwitch = ({ checked, onChange, disabled }) => (
  <button
    type="button"
    onClick={onChange}
    disabled={disabled}
    aria-checked={checked}
    role="switch"
    style={{
      width: '48px',
      height: '26px',
      borderRadius: '13px',
      border: 'none',
      padding: '2px',
      background: checked ? 'var(--accent-primary)' : 'var(--border-subtle)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      transition: 'background 0.22s ease',
      display: 'flex',
      alignItems: 'center',
      flexShrink: 0,
    }}
  >
    <span style={{
      display: 'block',
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      background: '#fff',
      boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
      transform: checked ? 'translateX(22px)' : 'translateX(0)',
      transition: 'transform 0.22s cubic-bezier(0.34,1.56,0.64,1)',
    }} />
  </button>
);

/* ─── Main Page ─────────────────────────────────────────────────────────── */
const EditChoirPage = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  // ── Choir data
  const [choir, setChoir] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [place, setPlace] = useState('');
  const [country, setCountry] = useState('');
  const [imagePreview, setImagePreview] = useState(null);   // URL actual o local
  const [imageFile, setImageFile] = useState(null);         // File nuevo
  const [removeImage, setRemoveImage] = useState(false);    // Borrar foto del servidor
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  // ── Confirm demote modal
  const [confirmMember, setConfirmMember] = useState(null); // { userId, name }
  const [togglingId, setTogglingId]       = useState(null);

  /* ── Load data ──────────────────────────────────────────────────────── */
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const choirData = await getChoirById(id, token);

      // Solo admins pueden acceder
      const isAdmin = choirData.membership?.role === 'admin' && choirData.membership?.status === 'accepted';
      if (!isAdmin) {
        toast.error('No tienes permisos para editar este coro');
        navigate(`/choirs/${id}`);
        return;
      }

      setChoir(choirData);
      setName(choirData.name || '');
      setDescription(choirData.description || '');
      setPlace(choirData.place || '');
      setCountry(choirData.country || '');
      setImagePreview(choirData.image_file || null);

      const membersData = await getChoirMembers(id, token);
      setMembers(membersData.data || []);
    } catch (err) {
      toast.error(err.message || 'Error al cargar el coro');
      navigate(`/choirs/${id}`);
    } finally {
      setLoading(false);
    }
  }, [id, token, navigate]);

  useEffect(() => { loadData(); }, [loadData]);

  /* ── Image handling ─────────────────────────────────────────────────── */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setRemoveImage(false);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setRemoveImage(true);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  /* ── Save choir info ────────────────────────────────────────────────── */
  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('El nombre del coro no puede estar vacío');
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('description', description.trim());
      formData.append('place', place.trim());
      formData.append('country', country.trim());
      if (imageFile) {
        formData.append('image', imageFile);
      }
      if (removeImage) {
        formData.append('remove_image', 'true');
      }

      await updateChoir(id, formData, token);
      toast.success('Coro actualizado correctamente');
      navigate(`/choirs/${id}`);
    } catch (err) {
      toast.error(err.message || 'Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  /* ── Toggle role ────────────────────────────────────────────────────── */
  const handleToggleRole = (member) => {
    const currentlyAdmin = member.role === 'admin';

    if (currentlyAdmin) {
      // Pedir confirmación antes de degradar
      setConfirmMember({ userId: member.user_id, name: member.name || member.username });
    } else {
      // Promover directamente sin confirmación
      applyRoleChange(member.user_id, 'admin');
    }
  };

  const applyRoleChange = async (userId, newRole) => {
    setTogglingId(userId);
    setConfirmMember(null);
    try {
      await updateMemberRole(id, userId, newRole, token);
      // Actualizar estado local optimistamente
      setMembers(prev =>
        prev.map(m => m.user_id === userId ? { ...m, role: newRole } : m)
      );
      toast.success(
        newRole === 'admin'
          ? '🛡️ Miembro ascendido a administrador'
          : '👤 Administrador degradado a miembro'
      );
    } catch (err) {
      toast.error(err.message || 'Error al cambiar el rol');
    } finally {
      setTogglingId(null);
    }
  };

  /* ── Render ─────────────────────────────────────────────────────────── */
  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ textAlign: 'center', marginTop: '100px', color: 'var(--text-secondary)' }}>
          Cargando...
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      {/* Confirm demote modal */}
      {confirmMember && (
        <ConfirmModal
          memberName={confirmMember.name}
          onCancel={() => setConfirmMember(null)}
          onConfirm={() => applyRoleChange(confirmMember.userId, 'member')}
        />
      )}

      <main className="main-content" style={{ padding: '0 24px', maxWidth: '860px', margin: '40px auto 100px auto' }}>

        {/* Back link */}
        <button
          className="btn btn-ghost"
          style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px' }}
          onClick={() => navigate(`/choirs/${id}`)}
        >
          ← Volver al coro
        </button>

        <h1 style={{ fontSize: '28px', margin: '0 0 32px 0', color: 'var(--text-primary)' }}>
          ✏️ Editar coro
        </h1>

        {/* ── Sección 1: Información ─────────────────────────────────── */}
        <div className="photo-card" style={{ padding: '32px', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', marginBottom: '28px' }}>
          <h2 className="section-title" style={{ marginTop: 0, marginBottom: '28px' }}>
            Información del coro
          </h2>

          <form onSubmit={handleSave}>
            {/* Foto */}
            <div style={{ marginBottom: '28px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
              <label style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '14px' }}>
                Imagen del coro
              </label>

              <div style={{ position: 'relative', width: '140px', height: '140px' }}>
                <div style={{
                  width: '140px',
                  height: '140px',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  border: '3px solid var(--accent-primary)',
                  background: 'var(--bg-secondary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '52px',
                }}>
                  {imagePreview ? (
                    <img src={imagePreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ 
                      width: '100%', 
                      height: '100%', 
                      background: 'linear-gradient(135deg, #fefbf0 0%, #ebd3a2 100%)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      padding: '8px'
                    }}>
                      <img src="/logo-transparent.png" alt="Logo" style={{ width: '100px', height: '100px', objectFit: 'contain' }} />
                      <span className="brand-text" style={{ fontSize: '11px', fontWeight: '700', textAlign: 'center' }}>
                        Choral Record
                      </span>
                    </div>
                  )}
                </div>

                {/* Botón eliminar foto */}
                {imagePreview && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    title="Eliminar imagen"
                    style={{
                      position: 'absolute',
                      top: '6px',
                      right: '6px',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'var(--danger)',
                      color: '#fff',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '13px',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                    }}
                  >
                    🗑️
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                id="choir-image-input"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageChange}
              />
              <button
                type="button"
                className="btn btn-ghost"
                style={{ padding: '6px 16px', fontSize: '13px' }}
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? 'Cambiar imagen' : 'Subir imagen'}
              </button>
            </div>

            {/* Nombre */}
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label htmlFor="choir-name" className="form-label">Nombre del coro *</label>
              <input
                id="choir-name"
                type="text"
                className="form-input"
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={100}
                required
              />
            </div>

            {/* Descripción */}
            <div className="form-group" style={{ marginBottom: '28px' }}>
              <label htmlFor="choir-desc" className="form-label">Descripción</label>
              <textarea
                id="choir-desc"
                className="form-input"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
                style={{ resize: 'vertical', minHeight: '100px' }}
              />
            </div>

            {/* Lugar y País en fila (ajustable en móvil) */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '28px' }}>
              <div className="form-group" style={{ flex: '1 1 240px', marginBottom: 0 }}>
                <label htmlFor="edit-choir-place" className="form-label">Lugar</label>
                <input
                  id="edit-choir-place"
                  type="text"
                  className="form-input"
                  value={place}
                  onChange={e => setPlace(e.target.value)}
                  placeholder="Ej. Málaga"
                />
              </div>
              <div className="form-group" style={{ flex: '1 1 240px', marginBottom: 0 }}>
                <label htmlFor="edit-choir-country" className="form-label">País</label>
                <input
                  id="edit-choir-country"
                  type="text"
                  className="form-input"
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  placeholder="Ej. España"
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => navigate(`/choirs/${id}`)}
                disabled={saving}
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn-accent" disabled={saving}>
                {saving ? 'Guardando...' : '💾 Guardar cambios'}
              </button>
            </div>
          </form>
        </div>

        {/* ── Sección 2: Administradores ─────────────────────────────── */}
        <div className="photo-card" style={{ padding: '32px', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)' }}>
          <h2 className="section-title" style={{ marginTop: 0, marginBottom: '8px' }}>
            🛡️ Gestión de administradores
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '0 0 24px 0', lineHeight: '1.5' }}>
            Activa el switch para conceder permisos de administrador. Los administradores pueden
            añadir piezas y eventos, gestionar solicitudes y editar la información del coro.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {members.map(member => {
              const isCurrentUserSelf = String(member.user_id) === String(choir?.created_by);
              const isAdmin = member.role === 'admin';
              const isToggling = togglingId === member.user_id;

              return (
                <div
                  key={member.user_id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '14px 18px',
                    background: isAdmin ? 'var(--accent-glow)' : 'var(--bg-secondary)',
                    border: `1px solid ${isAdmin ? 'var(--accent-border)' : 'var(--border-subtle)'}`,
                    borderRadius: 'var(--radius-md)',
                    transition: 'background 0.2s ease, border-color 0.2s ease',
                  }}
                >
                  {/* Avatar */}
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '2px solid var(--accent-primary)',
                    flexShrink: 0,
                  }}>
                    {member.profile_image_url
                      ? <img src={member.profile_image_url} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{
                          width: '100%', height: '100%',
                          background: 'linear-gradient(135deg, #1e1b4b, #311042)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '18px',
                        }}>👤</div>}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '15px' }}>
                        {member.name || member.username}
                      </span>
                      {isAdmin && (
                        <span style={{
                          fontSize: '11px',
                          background: 'var(--accent-primary)',
                          color: '#fff',
                          padding: '1px 7px',
                          borderRadius: '8px',
                          fontWeight: '600',
                          letterSpacing: '0.3px',
                        }}>
                          ADMIN
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      @{member.username}
                    </span>
                  </div>

                  {/* Toggle */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {isToggling && (
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>...</span>
                    )}
                    <ToggleSwitch
                      checked={isAdmin}
                      onChange={() => handleToggleRole(member)}
                      disabled={isToggling || isCurrentUserSelf}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {members.length === 0 && (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', margin: 0 }}>
              No hay miembros en este coro todavía.
            </p>
          )}
        </div>
      </main>
    </>
  );
};

export default EditChoirPage;
