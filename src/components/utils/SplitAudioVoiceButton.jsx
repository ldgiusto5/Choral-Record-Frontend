const SplitAudioVoiceButton = ({
  url1, label1, isActive1, onClick1, title1,
  url2, label2, isActive2, onClick2, title2,
  icon
}) => {
  return (
    <div className="piece-file-btn-split-container">
      {url1 ? (
        <button 
          className={`piece-file-btn-split-left ${isActive1 ? 'active' : ''}`}
          onClick={onClick1}
          title={title1}
        >
          {icon} {label1}
        </button>
      ) : (
        <span className="piece-file-btn-split-left" style={{ opacity: 0.4, cursor: 'not-allowed' }}>
          {icon} {label1}
        </span>
      )}
      
      {url2 ? (
        <button 
          className={`piece-file-btn-split-right ${isActive2 ? 'active' : ''}`}
          onClick={onClick2}
          title={title2}
        >
          {icon} {label2}
        </button>
      ) : (
        <span className="piece-file-btn-split-right" style={{ opacity: 0.4, cursor: 'not-allowed' }}>
          {icon} {label2}
        </span>
      )}
    </div>
  );
};

export default SplitAudioVoiceButton;