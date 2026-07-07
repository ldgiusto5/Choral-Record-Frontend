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
        {showChoirName && event.choir_name && (
          <span 
            className="event-choir-badge"
            title={event.choir_name}
          >
            🎶 {event.choir_name}
          </span>
        )}

        {event.info_url && (
          <FileLinkButton 
            url={event.info_url} 
            icon="📄" 
            label="Ver adjunto" 
            onClick={(e) => e.stopPropagation()}
          />
        )}
      </div>

      {isAdmin && (
        <AdminActionButtons 
          editPath={`/choirs/${choirId}/events/${event.id}/edit`}
          onDelete={() => onDelete(event.id)}
          size="medium"
        />
      )}
    </div>
  );
};

export default EventCard;