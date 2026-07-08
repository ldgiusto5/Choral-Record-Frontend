import React from 'react';
import EventStatusTags from './utils/EventStatusTags';
import AdminActionButtons from './utils/AdminActionButtons';
import FileLinkButton from './utils/FileLinkButton';

const formatDateBadge = (dateString) => {
  if (!dateString) return { day: '?', month: '?' };
  try {
    const d = new Date(dateString);
    const day = d.getDate();
    const month = d.toLocaleString('es-ES', { month: 'short' }).replace('.', '');
    return { day, month };
  } catch (e) {
    return { day: '?', month: '?' };
  }
};

const formatDateFull = (dateString) => {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    return d.toLocaleString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  } catch (e) {
    return dateString;
  }
};

const formatTimeOnly = (dateString) => {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    return d.toLocaleTimeString('es-ES', {
      hour: '2-digit', minute: '2-digit'
    });
  } catch (e) {
    return '';
  }
};

const EventCard = ({ 
  event, 
  choirId, 
  isAdmin, 
  onDelete, 
  showChoirName = false, 
  onClick 
}) => {
  const badge = formatDateBadge(event.event_date);
  
  const cardStyle = event.image_url ? {
    backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.72), rgba(255, 255, 255, 0.72)), url(${event.image_url})`,
  } : {};

  return (
    <div 
      className={`event-bar-wide ${onClick ? 'event-bar-wide--clickable' : ''}`} 
      style={cardStyle}
      onClick={onClick}
    >
      {/* ── MOBILE LAYOUT (Show only on mobile) ── */}
      <div className="event-card-mobile-layout">
        <div className="event-mobile-header-row">
          <div className="event-mobile-time-box">
            <div className="event-date-badge" style={{ background: 'transparent', width: '40px', height: '40px', border: '1px solid var(--border-hover)', boxShadow: 'none' }}>
              <span className="day" style={{ fontSize: '1rem', color: 'var(--accent-primary)' }}>{badge.day}</span>
              <span className="month" style={{ fontSize: '0.55rem', color: 'var(--accent-primary)' }}>{badge.month}</span>
            </div>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--accent-primary)' }}>
              ⏰ {formatTimeOnly(event.event_date)}
            </span>
          </div>

          {/* Attachment button between time and buttons */}
          {event.info_url && (
            <div style={{ marginLeft: '6px', marginRight: '6px' }} onClick={(e) => e.stopPropagation()}>
              <FileLinkButton 
                url={event.info_url} 
                icon="📄" 
                label="Info" 
              />
            </div>
          )}

          <div className="event-mobile-header-actions" onClick={(e) => e.stopPropagation()}>
            {isAdmin ? (
              <AdminActionButtons 
                editPath={`/choirs/${choirId}/events/${event.id}/edit`}
                onDelete={() => onDelete(event.id)}
                size="small"
              />
            ) : (
              showChoirName && event.choir_name && (
                <span className="event-choir-badge-mobile">
                  🎶 {event.choir_name}
                </span>
              )
            )}
          </div>
        </div>

        <div className="event-mobile-body">
          <div className={`event-info-main ${event.image_url ? 'has-image-bg' : ''}`} style={{ width: '100%', boxSizing: 'border-box' }}>
            <div className="event-title-row-mobile">
              <h4 style={{ margin: 0 }}>{event.title}</h4>
              <EventStatusTags 
                isPublic={event.is_public}
                isVisible={event.is_visible}
                isCompleted={event.is_completed}
                isAdmin={isAdmin}
              />
            </div>
            <p className="event-desc-mobile" style={{ marginTop: '6px' }}>{event.description || 'Sin descripción adicional.'}</p>
          </div>
        </div>
      </div>

      {/* ── DESKTOP LAYOUT (Show only on desktop) ── */}
      <div className="event-card-desktop-layout">
        <div className="event-date-badge">
          <span className="day">{badge.day}</span>
          <span className="month">{badge.month}</span>
        </div>
        
        <div className={`event-info-main ${event.image_url ? 'has-image-bg' : ''}`}>
          <div className="event-title-row">
            <h4 style={{ margin: 0 }}>{event.title}</h4>
            
            <EventStatusTags 
              isPublic={event.is_public}
              isVisible={event.is_visible}
              isCompleted={event.is_completed}
              isAdmin={isAdmin}
            />
          </div>
          <p>{event.description || 'Sin descripción adicional.'}</p>
          <span className="event-time-badge">
            ⏰ {formatDateFull(event.event_date)}
          </span>
        </div>

        <div className="event-meta">
          {event.info_url && (
            <FileLinkButton 
              url={event.info_url} 
              icon="📄" 
              label="Ver adjunto" 
              onClick={(e) => e.stopPropagation()}
            />
          )}

          {showChoirName && event.choir_name && (
            <span 
              className="event-choir-badge"
              title={event.choir_name}
            >
              🎶 {event.choir_name}
            </span>
          )}
        </div>

        {isAdmin && (
          <div style={{ marginLeft: '12px' }} onClick={(e) => e.stopPropagation()}>
            <AdminActionButtons 
              editPath={`/choirs/${choirId}/events/${event.id}/edit`}
              onDelete={() => onDelete(event.id)}
              size="medium"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCard;