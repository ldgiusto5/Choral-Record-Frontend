import React from 'react';
import { BACKEND_URL } from '../api/api';

const ProfileHeader = ({
  profileUser,
  activeTab,
  setActiveTab,
  currentPreview
}) => {
  return (
    <div className="photo-card profile-header-card">
      {/* Avatar */}
      <div className="profile-avatar-container">
        <div className="profile-avatar-circle">
          <img
            src={currentPreview || `${BACKEND_URL}/assets/default-avatar.png`}
            alt={profileUser.name}
            className="avatar-img"
          />
        </div>
      </div>

      {/* Info */}
      <div className="profile-info-container">
        <div className="profile-info-actions">
          <div className="profile-name-section">
            <h1 className="profile-display-name">
              {profileUser.name}
            </h1>
            <span className="profile-username">@{profileUser.username}</span>
            {profileUser.role === 'admin' && (
              <span className="profile-admin-badge">
                Administrador del Sistema
              </span>
            )}
          </div>

          <div className="profile-tab-buttons">
            <button
              className={`btn ${activeTab === 'info' ? 'btn-accent' : 'btn-ghost'}`}
              onClick={() => setActiveTab('info')}
            >
              {profileUser.isOwner ? 'Mis Coros' : 'Coros'}
            </button>
            <button
              className={`btn ${activeTab === 'followed' ? 'btn-accent' : 'btn-ghost'}`}
              onClick={() => setActiveTab('followed')}
            >
              Coros Seguidos
            </button>
            {profileUser.isOwner && (
              <button
                className={`btn ${activeTab === 'edit' ? 'btn-accent' : 'btn-ghost'}`}
                onClick={() => setActiveTab('edit')}
              >
                ✏️ Editar perfil
              </button>
            )}
          </div>
        </div>

        <p className="profile-description">
          {profileUser.description || 'Este usuario no ha añadido ninguna descripción todavía.'}
        </p>
      </div>
    </div>
  );
};

export default ProfileHeader;
