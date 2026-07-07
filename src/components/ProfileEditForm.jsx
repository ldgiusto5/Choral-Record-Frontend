/**
 * ProfileEditForm.jsx
 * Formulario para la edición del perfil de usuario.
 */
import React from 'react';
import ProfilePasswordChange from './ProfilePasswordChange';

const ProfileEditForm = ({
  onSubmit,
  editName,
  setEditName,
  editUsername,
  setEditUsername,
  editDescription,
  setEditDescription,
  editPreview,
  editFile,
  profileUser,
  updating,
  handleDeleteOrClearImage,
  handleFileChange,
  fileInputRef,
  onCancel,
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword
}) => {
  return (
    <div className="photo-card profile-edit-card">
      <h2 className="section-title profile-edit-title">
        Editar perfil
      </h2>

      <form onSubmit={onSubmit}>
        <div className="profile-edit-row">
          {/* Foto de perfil */}
          <div className="profile-edit-photo-col">
            <label className="profile-field-label">
              Foto de perfil
            </label>

            <div className="profile-edit-preview-container">
              <div className="profile-edit-preview-circle">
                {editPreview ? (
                  <img src={editPreview} alt="preview" className="avatar-img" />
                ) : (
                  '👤'
                )}
              </div>

              {/* Botón eliminar/cancelar foto */}
              {(editFile || profileUser.user_image) && (
                <button
                  type="button"
                  onClick={handleDeleteOrClearImage}
                  disabled={updating}
                  title={editFile ? 'Cancelar selección' : 'Eliminar foto de perfil'}
                  className="profile-delete-photo-btn"
                >
                  🗑️
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              id="edit-img"
              type="file"
              accept="image/*"
              className="profile-file-input"
              onChange={handleFileChange}
            />
            <button
              type="button"
              className="btn btn-ghost profile-change-photo-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              {editPreview ? 'Cambiar foto' : 'Subir foto'}
            </button>
          </div>

          {/* Campos de texto */}
          <div className="profile-edit-fields-col">
            <div className="form-group profile-form-group">
              <label className="form-label" htmlFor="edit-name">Nombre completo *</label>
              <input
                id="edit-name"
                type="text"
                className="form-input"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </div>

            <div className="form-group profile-form-group">
              <label className="form-label" htmlFor="edit-username">Nombre de usuario *</label>
              <input
                id="edit-username"
                type="text"
                className="form-input"
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-group profile-form-group">
              <label className="form-label" htmlFor="edit-desc">Descripción / Biografía</label>
              <textarea
                id="edit-desc"
                className="form-input profile-textarea"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Escribe algo sobre ti, tu rango vocal..."
                rows={4}
              />
            </div>

            <ProfilePasswordChange
              currentPassword={currentPassword}
              setCurrentPassword={setCurrentPassword}
              newPassword={newPassword}
              setNewPassword={setNewPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              updating={updating}
            />
          </div>
        </div>

        {/* Botones de acción */}
        <div className="profile-edit-actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onCancel}
            disabled={updating}
          >
            Cancelar
          </button>
          <button type="submit" className="btn btn-accent" disabled={updating}>
            {updating ? 'Guardando...' : '💾 Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileEditForm;
