import './DeleteConfirmationModal.css';

const DeleteConfirmationModal = ({
  isOpen, title, warningText, verificationLabel, expectedValue,
  inputValue, onInputChange, onCancel, onConfirm, isDeleting,
  confirmButtonText = 'Eliminar'
}) => {
  if (!isOpen) return null;

  const isMatch = inputValue === expectedValue;

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-icon">⚠️</div>
        <h3 className="modal-title">{title}</h3>
        
        <div className="modal-warning">
          <strong>¡Acción irreversible!</strong> {warningText}
        </div>
        
        <p className="modal-text">
          {verificationLabel}
          <strong className="modal-highlight">{expectedValue}</strong>
        </p>
        
        <input 
          type="text" 
          className="form-input modal-input"
          placeholder="Escribe aquí para confirmar..."
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
        />
        
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={isDeleting}>
            Cancelar
          </button>
          <button 
            type="button" 
            className="btn" 
            style={{ 
              background: isMatch ? 'var(--danger)' : 'var(--border-subtle)', 
              color: '#ffffff', border: 'none', fontWeight: '600',
              cursor: isMatch ? 'pointer' : 'not-allowed',
              opacity: isMatch ? 1 : 0.6, padding: '10px 20px'
            }}
            onClick={onConfirm}
            disabled={!isMatch || isDeleting}
          >
            {isDeleting ? 'Eliminando...' : confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;