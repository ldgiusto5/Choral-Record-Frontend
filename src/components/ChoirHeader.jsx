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
      {/* ── MOBILE LAYOUT (Show only on mobile) ── */}
      <div className="choir-header-mobile-layout">
        {/* Top row: Image on the left, Name and type badge on the right */}
        <div className="choir-mobile-top-row">
          <div className="choir-header-img-wrapper-mobile">
            {choir.image_file ? (
              <img src={choir.image_file} alt={choir.name} className="avatar-img" />
            ) : (
              <div className="choir-header-img-placeholder" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src="/logo-transparent.png" alt="Logo" style={{ width: '50px', height: '50px', objectFit: 'contain' }} />
              </div>
            )}
          </div>

          <div className="choir-mobile-title-container">
            <h1 className="choir-detail-title-mobile">{choir.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span className={`choir-header-type-badge ${choir.is_public ? 'badge-public' : 'badge-private'}`} style={{ width: 'fit-content', padding: '3px 8px', fontSize: '10px', margin: 0 }}>
                {choir.is_public ? 'Público' : 'Privado'}
              </span>
              <button
                onClick={() => navigate(`/choirs/${choirId}/followers`)}
                className="choir-followers-pill-btn"
                title="Ver lista de seguidores"
                style={{ padding: '3px 8px', fontSize: '10px', margin: 0, gap: '4px' }}
              >
                💜 <strong style={{ marginLeft: '1px', marginRight: '1px' }}>{followersCount}</strong> {followersCount === 1 ? 'seguidor' : 'seguidores'}
              </button>
            </div>
          </div>
        </div>

        {/* Bio Description below image/name row */}
        <p className="choir-header-description-mobile">
          {choir.description || 'Este coro no dispone de descripción todavía.'}
        </p>

        {/* Stats Row (Location, Creator) */}
        <div className="choir-mobile-meta-row">
          {(choir.place || choir.country) && (
            <div className="choir-header-location-mobile">
              📍 {[choir.place, choir.country].filter(Boolean).join(', ')}
            </div>
          )}

          <div className="choir-header-creator-mobile">
            Creado por: <strong>{choir.owner || choir.creator_name}</strong>
          </div>
        </div>

        {/* Actions row at the bottom */}
        <div className="choir-mobile-actions-row">
          {/* 1. Seguir */}
          <button 
            className={`btn btn-ghost choir-follow-btn ${isFollowing ? 'following' : ''}`}
            onClick={onFollowToggle}
            disabled={followLoading}
            style={{ flexGrow: 1, padding: '8px 12px', fontSize: '12.5px', whiteSpace: 'nowrap' }}
          >
            {isFollowing ? '💜 Siguiendo' : '💜 Seguir'}
          </button>

          {/* 2. Unirse */}
          <div style={{ flexGrow: 1, minWidth: 0 }}>
            {!isAuthenticated ? (
              <button 
                className="btn btn-accent choir-join-btn" 
                onClick={() => navigate('/login')} 
                style={{ 
                  width: '100%', 
                  padding: '8px 12px', 
                  fontSize: '12.5px', 
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: 'block',
                  textAlign: 'center'
                }}
              >
                Unirse
              </button>
            ) : (isAdmin || isMember || isPending) ? (
              <MembershipBadge isAdmin={isAdmin} isMember={isMember} isPending={isPending} />
            ) : (
              <button 
                className="btn btn-accent choir-join-btn" 
                onClick={onJoin} 
                disabled={joining} 
                style={{ 
                  width: '100%', 
                  padding: '8px 12px', 
                  fontSize: '12.5px', 
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: 'block',
                  textAlign: 'center'
                }}
              >
                {joining ? '...' : choir.is_public ? 'Unirse' : 'Solicitar Unirse'}
              </button>
            )}
          </div>

          {/* 3. Editar */}
          {isAuthenticated && isAdmin && (
            <button 
              className="btn btn-ghost choir-edit-btn" 
              onClick={() => navigate(`/choirs/${choirId}/edit`)} 
              title="Editar información del coro"
              style={{ flexGrow: 1, padding: '8px 12px', fontSize: '12.5px', margin: 0, whiteSpace: 'nowrap' }}
            >
              ✏️ Editar
            </button>
          )}
        </div>
      </div>

      {/* ── DESKTOP LAYOUT (Show only on desktop - Instagram style) ── */}
      <div className="choir-header-desktop-layout">
        {/* Left column: Image */}
        <div className="choir-detail-header-left">
          <div className="choir-header-img-wrapper">
            {choir.image_file ? (
              <img src={choir.image_file} alt={choir.name} className="avatar-img" />
            ) : (
              <div className="choir-header-img-placeholder">
                <img src="/logo-transparent.png" alt="Logo" />
              </div>
            )}
          </div>
        </div>

        {/* Right column: Info */}
        <div className="choir-detail-header-right-instagram">
          {/* Row 1: Name + Actions */}
          <div className="choir-instagram-row1">
            <h1 className="choir-detail-title-instagram">{choir.name}</h1>
            
            <div className="choir-instagram-actions">
              {/* 1. Seguir */}
              <button 
                className={`btn btn-ghost choir-follow-btn ${isFollowing ? 'following' : ''}`}
                onClick={onFollowToggle}
                disabled={followLoading}
              >
                {isFollowing ? '💜 Siguiendo' : '💜 Seguir'}
              </button>

              {/* 2. Unirse */}
              <div>
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

              {/* 3. Editar */}
              {isAuthenticated && isAdmin && (
                <button className="btn btn-ghost choir-edit-btn" onClick={() => navigate(`/choirs/${choirId}/edit`)} title="Editar información del coro">
                  ✏️ Editar coro
                </button>
              )}

              {/* 4. Tipo */}
              <span className={`choir-header-type-badge ${choir.is_public ? 'badge-public' : 'badge-private'}`}>
                {choir.is_public ? 'Público' : 'Privado'}
              </span>
            </div>
          </div>

          {/* Row 2: Stats (Location, Creator, Followers) */}
          <div className="choir-instagram-row2">
            {(choir.place || choir.country) && (
              <span className="choir-stat-item">
                📍 {[choir.place, choir.country].filter(Boolean).join(', ')}
              </span>
            )}
            <span className="choir-stat-item">
              Creado por: <strong>{choir.owner || choir.creator_name}</strong>
            </span>
            <button
              onClick={() => navigate(`/choirs/${choirId}/followers`)}
              className="choir-stat-item-btn"
              title="Ver lista de seguidores"
            >
              💜 <strong>{followersCount}</strong> {followersCount === 1 ? 'seguidor' : 'seguidores'}
            </button>
          </div>

          {/* Row 3: Description */}
          <div className="choir-instagram-row3">
            <p className="choir-header-description-instagram">
              {choir.description || 'Este coro no dispone de descripción todavía.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChoirHeader;