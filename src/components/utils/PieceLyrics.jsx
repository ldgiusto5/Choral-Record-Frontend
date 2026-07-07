const PieceLyrics = ({ lyrics, onClose, isExiting }) => {
  return (
    <div className={`lyrics-wrapper ${isExiting ? 'exiting' : ''}`} style={{
      marginTop: '12px', padding: '16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)',
      border: '1.5px solid var(--border-subtle)', textAlign: 'left', whiteSpace: 'pre-wrap', color: 'var(--text-primary)',
      fontFamily: 'monospace', lineHeight: '1.6', fontSize: '14px', maxHeight: '240px', overflowY: 'auto'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
        <span style={{ fontWeight: '700', color: 'var(--accent-primary)', fontSize: '12px', textTransform: 'uppercase' }}>🎵 Letra / Lyrics</span>
        <button 
          className="btn btn-ghost" 
          style={{ padding: '2px 6px', fontSize: '11px', minWidth: 'auto', height: 'auto', color: 'var(--text-muted)' }}
          onClick={onClose}
        >
          Ocultar
        </button>
      </div>
      {lyrics || 'No hay letra cargada para esta pieza.'}
    </div>
  );
};

export default PieceLyrics;