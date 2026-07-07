import './FileUploaderInput.css';

const FileUploaderInput = ({
  id, accept, file, currentFileUrl, isDeleted,
  onFileChange, onClearFile, onToggleDelete,
  labelGhostBase = 'Elegir archivo',
  labelGhostReplace = 'Reemplazar',
  dangerColor = 'var(--danger)'
}) => {
  
  const getFilenameFromUrl = (url) => {
    if (!url) return '';
    const parts = url.split('/');
    return parts[parts.length - 1];
  };

  const hasCurrentFile = !!currentFileUrl;
  const isReplacing = hasCurrentFile && !isDeleted;

  return (
    <div className="file-upload-container uploader-container">
      <input id={id} type="file" accept={accept} onChange={onFileChange} style={{ display: 'none' }} />
      
      <div className="uploader-relative">
        <label htmlFor={id} className="btn btn-ghost uploader-label">
          {isReplacing ? labelGhostReplace : labelGhostBase}
        </label>
        
        {(file || (hasCurrentFile && !file)) && (
          <button
            type="button"
            className="uploader-action-btn"
            style={{ background: isDeleted ? 'var(--accent-primary)' : dangerColor }}
            title={isDeleted ? "Restaurar archivo actual" : "Eliminar archivo"}
            onClick={(e) => {
              e.preventDefault();
              file ? onClearFile() : onToggleDelete();
            }}
          >
            {isDeleted ? '🔄' : '🗑️'}
          </button>
        )}
      </div>

      <span className="file-upload-name" style={{ color: (isDeleted && !file) ? dangerColor : undefined }}>
        {file 
          ? file.name 
          : hasCurrentFile 
            ? (isDeleted 
                ? 'Se eliminará' 
                : <a href={currentFileUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>{getFilenameFromUrl(currentFileUrl)}</a>) 
            : 'Ninguno'
        }
      </span>
    </div>
  );
};

export default FileUploaderInput;