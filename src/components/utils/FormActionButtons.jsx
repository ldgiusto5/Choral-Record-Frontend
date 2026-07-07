const FormActionButtons = ({ 
  onCancel, 
  isSubmitting, 
  submitText, 
  submittingText = 'Procesando...' 
}) => {
  return (
    <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
      <button 
        type="button" 
        className="btn btn-ghost" 
        onClick={onCancel} 
        style={{ flex: 1 }} 
        disabled={isSubmitting}
      >
        Cancelar
      </button>
      <button 
        type="submit" 
        className="btn btn-accent" 
        style={{ flex: 2 }} 
        disabled={isSubmitting}
      >
        {isSubmitting ? submittingText : submitText}
      </button>
    </div>
  );
};

export default FormActionButtons;