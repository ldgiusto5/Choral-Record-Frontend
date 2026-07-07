const AudioVoiceButton = ({ url, icon, label, isActive, onClick }) => {
  if (url) {
    return (
      <button 
        className={`piece-file-btn ${isActive ? 'active' : ''}`}
        onClick={onClick}
      >
        {icon} {label}
      </button>
    );
  }
  return (
    <span className="piece-file-btn" style={{ opacity: 0.4, cursor: 'not-allowed' }}>
      {icon} {label}
    </span>
  );
};

export default AudioVoiceButton;