import { Link } from 'react-router-dom';
import './ChoirCard.css';

const ChoirCard = ({ choir }) => {
  const isMember = choir.membership && choir.membership.status === 'accepted';
  const isAdmin = isMember && choir.membership.role === 'admin';
  const eventCount = isMember ? (Number(choir.member_event_count) || 0) : (Number(choir.public_event_count) || 0);

  return (
    <Link to={`/choirs/${choir.name}`} className="photo-card-link">
      <div className="photo-card card">

        <div className="photoWrapper">
          {choir.image_file ? (
            <img src={choir.image_file} alt={choir.name} className="choir-card-img" />
          ) : (
            <div className="placeholder">
              <img src="/logo-transparent.png" alt="Logo" className="choir-card-placeholder-logo" />
              <span className="brand-text choir-card-brand-label">Choral Record</span>
            </div>
          )}

          <span className={`badge ${choir.is_public ? 'badgePublic' : 'badgePrivate'}`}>
            {choir.is_public ? 'Público' : 'Privado'}
          </span>

          {isAdmin && <span className="badge badgeAdmin">Admin</span>}

          {eventCount > 0 && <span className="badge badgeEvents">📅 {eventCount}</span>}
        </div>

        <div className="infoContainer">
          <h3 className="title" title={choir.name}>{choir.name}</h3>
          
          <p className={`description ${(choir.place || choir.country) ? 'description--has-location' : 'description--no-location'}`}>
            {choir.description || ''}
          </p>
          
          {(choir.place || choir.country) && (
            <div className="choir-card-location">
              <span>📍</span>
              <span>{[choir.place, choir.country].filter(Boolean).join(', ')}</span>
            </div>
          )}
          
          <div className="choir-card-stats">
            <span>🎼 {choir.piece_count || 0} piezas</span>
            <div className="choir-card-stats-right">
              <span>💜 {choir.followers_count || 0} {Number(choir.followers_count) === 1 ? 'seguidor' : 'seguidores'}</span>
              <span>👥 {choir.member_count || 1} miembros</span>
            </div>
          </div>
        </div>

      </div>
    </Link>
  );
};

export default ChoirCard;