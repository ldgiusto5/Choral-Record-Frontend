const FileLinkButton = ({ url, icon, label, onClick }) => {
  if (url) {
    return (
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="piece-file-btn"
        onClick={onClick}
      >
        {icon} {label}
      </a>
    );
  }
  return (
    <span className="piece-file-btn" style={{ opacity: 0.4, cursor: 'not-allowed' }}>
      {icon} {label}
    </span>
  );
};

export default FileLinkButton;