const EventStatusTags = ({ isPublic, isVisible, isCompleted, isAdmin }) => {
  if (!isPublic && (isVisible || !isAdmin) && !isCompleted) return null;

  return (
    <div className="event-status-tags-wrapper">
      {isPublic && (
        <span className="event-status-tag event-status-tag-public">
          🌍 Público
        </span>
      )}
      {!isVisible && isAdmin && (
        <span className="event-status-tag event-status-tag-hidden">
          Oculto para miembros
        </span>
      )}
      {isCompleted && (
        <span className="event-status-tag event-status-tag-completed">
          Completado
        </span>
      )}
    </div>
  );
};

export default EventStatusTags;