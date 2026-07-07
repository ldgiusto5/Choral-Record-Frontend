import { useNavigate } from 'react-router-dom';

const AdminActionButtons = ({ 
  editPath, 
  onDelete, 
  size = 'medium', // 'small' (32px) o 'medium' (36px)
  children 
}) => {
  const navigate = useNavigate();
  
  // Ajustes dinámicos según el tamaño solicitado
  const btnSize = size === 'small' ? '32px' : '36px';
  const padding = size === 'small' ? '6px' : '8px';
  
  // Estilo base para mantener todos los botones iconográficos consistentes
  const baseBtnStyle = {
    padding,
    borderRadius: '50%',
    minWidth: btnSize,
    height: btnSize,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  return (
    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
      {/* Botones adicionales inyectados (como las flechas) */}
      {children}
      
      {/* Botón de Editar (si se proporciona una ruta) */}
      {editPath && (
        <button 
          className="btn btn-ghost" 
          style={baseBtnStyle}
          onClick={() => navigate(editPath)}
          title="Editar"
        >
          ✏️
        </button>
      )}

      {/* Botón de Eliminar (si se proporciona una función) */}
      {onDelete && (
        <button 
          className="btn btn-ghost" 
          style={{ ...baseBtnStyle, color: 'var(--danger)' }}
          onClick={onDelete}
          title="Eliminar"
        >
          🗑️
        </button>
      )}
    </div>
  );
};

export default AdminActionButtons;