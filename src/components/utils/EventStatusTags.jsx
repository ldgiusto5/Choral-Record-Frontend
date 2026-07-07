const EventStatusTags = ({ isPublic, isVisible, isCompleted, isAdmin }) => {
  return (
    <>
      {isPublic && (
        <span style={{ fontSize: '11px', background: 'rgba(212, 175, 55, 0.12)', color: 'var(--accent-primary)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(212,175,55,0.3)' }}>
          🌍 Público
        </span>
      )}
      {!isVisible && isAdmin && (
        <span style={{ fontSize: '11px', background: 'var(--bg-secondary)', color: 'var(--text-muted)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
          Oculto para miembros
        </span>
      )}
      {isCompleted && (
        <span style={{ fontSize: '11px', background: 'rgba(6, 182, 212, 0.12)', color: 'var(--accent-secondary)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
          Completado
        </span>
      )}
    </>
  );
};

export default EventStatusTags;