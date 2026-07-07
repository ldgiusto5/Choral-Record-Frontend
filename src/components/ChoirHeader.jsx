import { useNavigate } from 'react-router-dom';
import MembershipBadge from './utils/MembershipBadge';

const ChoirHeader = ({
  choir,
  choirId,
  followersCount,
  isFollowing,
  followLoading,
  isAuthenticated,
  isAdmin,
  isMember,
  isPending,
  joining,
  onFollowToggle,
  onJoin
}) => {
  const navigate = useNavigate();

  return (
    <div className="choir-detail-header">
      {/* Columna Izquierda: Imagen + Creador */}
      <div className="choir-detail-header-left">
        <div className="choir-header-img-wrapper">
          {choir.image_file ? (
            <img src={choir.image_file} alt={choir.name} className="avatar-img" />
          ) : (
            <div className="choir-header-img-placeholder">
              <img src="/logo-transparent.png" alt="Logo" />
              <span className="brand-text choir-header-placeholder-brand">
                Choral Record
              </span>
            </div>
          )}
        </div>

        {/* Ubicación */}
        {(choir.place || choir.country) && (
          <div className="choir-header-location">
            📍 {[choir.place, choir.country].filter(Boolean).join(', ')}
          </div>
        )}

        {/* Creador del coro */}
        <div className="choir-header-creator">
          Creado por: <strong>{choir.owner || choir.creator_name}</strong>
        </div>

        {/* Seguidores */}
        <button
          onClick={() => navigate(`/choirs/${choirId}/followers`)}
          className="choir-followers-btn"
          title="Ver lista de seguidores"
        >
          💜 {followersCount} {followersCount === 1 ? 'seguidor' : 'seguidores'}
        </button>
      </div>

      {/* Columna Derecha: Título, descripción */}
      <div className="choir-detail-header-right">
        <h1 className="choir-detail-title">{choir.name}</h1>
        <p className="choir-header-description">
          {choir.description || 'Este coro no dispone de descripción todavía.'}
        </p>
      </div>

      {/* Esquina superior derecha */}
      <div className="choir-detail-header-top-right">
        <div className="choir-header-actions-row">
          
          {/* Botón de Seguir */}
          <div className="choir-header-btn-wrap">
            <button 
              className={`btn btn-ghost choir-follow-btn ${isFollowing ? 'following' : ''}`}
              onClick={onFollowToggle}
              disabled={followLoading}
            >
              {isFollowing ? '💜 Siguiendo' : '💜 Seguir'}
            </button>
          </div>

          {/* Membresía / Unirse */}
          <div className="choir-header-btn-wrap">
            {!isAuthenticated ? (
              <button className="btn btn-accent choir-join-btn" onClick={() => navigate('/login')}>
                Unirse al Coro
              </button>
            ) : (isAdmin || isMember || isPending) ? (
              <MembershipBadge isAdmin={isAdmin} isMember={isMember} isPending={isPending} />
            ) : (
              <button className="btn btn-accent choir-join-btn" onClick={onJoin} disabled={joining}>
                {joining ? 'Procesando...' : choir.is_public ? 'Unirse al Coro' : 'Solicitar unirse'}
              </button>
            )}
          </div>
        </div>

        {/* Tipo de Coro */}
        <span className={`choir-header-type-badge ${choir.is_public ? 'badge-public' : 'badge-private'}`}>
          {choir.is_public ? 'Público' : 'Privado'}
        </span>

        {isAuthenticated && isAdmin && (
          <button className="btn btn-ghost choir-edit-btn" onClick={() => navigate(`/choirs/${choirId}/edit`)} title="Editar información del coro">
            ✏️ Editar coro
          </button>
        )}
      </div>
    </div>
  );
};

export default ChoirHeader;