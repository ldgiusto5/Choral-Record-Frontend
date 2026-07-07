import React, { useState } from 'react';

const ProfilePasswordChange = ({
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  updating
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleToggle = () => {
    if (isExpanded) {
      setIsClosing(true);
      setTimeout(() => {
        setIsExpanded(false);
        setIsClosing(false);
      }, 150); // Match transition speed
    } else {
      setIsExpanded(true);
    }
  };

  return (
    <div className="profile-pwd-section">
      <div 
        className="profile-pwd-header" 
        onClick={handleToggle}
      >
        <span className="profile-pwd-title">Cambiar Contraseña</span>
        <span className={`profile-pwd-arrow ${isExpanded ? 'rotated' : ''}`}>▼</span>
      </div>

      {(isExpanded || isClosing) && (
        <div className={`profile-pwd-body ${isClosing ? 'closing' : 'opening'}`}>
          <div className="form-group profile-form-group">
            <label className="form-label" htmlFor="edit-curr-password">Contraseña actual</label>
            <input
              id="edit-curr-password"
              type="password"
              className="form-input"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Escribe tu contraseña actual"
              autoComplete="current-password"
              disabled={updating}
            />
          </div>

          <div className="form-group profile-form-group">
            <label className="form-label" htmlFor="edit-new-password">Nueva contraseña</label>
            <input
              id="edit-new-password"
              type="password"
              className="form-input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Escribe la nueva contraseña"
              autoComplete="new-password"
              disabled={updating}
            />
          </div>

          <div className="form-group profile-form-group">
            <label className="form-label" htmlFor="edit-conf-password">Confirmar nueva contraseña</label>
            <input
              id="edit-conf-password"
              type="password"
              className="form-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite la nueva contraseña"
              autoComplete="new-password"
              disabled={updating}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePasswordChange;
