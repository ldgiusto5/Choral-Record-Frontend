import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { verifyEmailToken } from '../api/api';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error'
  const [message, setMessage] = useState('Verificando tu cuenta de correo electrónico...');

  useEffect(() => {
    const handleVerification = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Falta el token de verificación.');
        return;
      }

      try {
        const response = await verifyEmailToken(token);
        setStatus('success');
        setMessage(response.message || '¡Tu cuenta ha sido activada y verificada con éxito!');
      } catch (error) {
        console.error(error);
        setStatus('error');
        setMessage(error.message || 'El enlace de verificación no es válido o ha expirado.');
      }
    };

    handleVerification();
  }, [token]);

  return (
    <div className="verify-email-page">
      <div className="photo-card verify-email-card">
        
        {/* Brand Link Wrapper */}
        <div className="brand-link-unified">
          <img src="/logo-transparent.png" alt="Logo" className="verify-email-logo" />
          <h1 className="brand-text verify-email-title">
            Choral Record
          </h1>
        </div>

        {/* Verification Status Area */}
        <div className="verify-email-status-area">
          {status === 'verifying' && (
            <div className="verify-email-status-box">
              <div className="verify-email-spinner"></div>
              <p className="verify-email-status-text">
                {message}
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="verify-email-status-box">
              <span className="verify-email-icon-success">
                ✓
              </span>
              <h2 className="verify-email-status-heading">
                ¡Cuenta Activada!
              </h2>
              <p className="verify-email-status-text verify-email-status-text--small">
                {message}
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="verify-email-status-box">
              <span className="verify-email-icon-error">
                ✗
              </span>
              <h2 className="verify-email-status-heading">
                Error de Verificación
              </h2>
              <p className="verify-email-status-text verify-email-status-text--small">
                {message}
              </p>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="verify-email-action-container">
          {status === 'success' ? (
            <Link to="/login" className="btn btn-accent verify-email-btn-block">
              Iniciar Sesión
            </Link>
          ) : (
            <Link to="/register" className="btn btn-ghost verify-email-btn-block">
              Volver al Registro
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
