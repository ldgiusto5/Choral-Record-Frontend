import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import AuthHeader from '../components/utils/AuthHeader';
import AuthBackground from '../components/utils/AuthBackground';
import TermsModal from '../components/utils/TermsModal';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [termsRead, setTermsRead] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleMouseEnter = () => {
    if (!termsRead) {
      setShowTooltip(true);
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  const handleAcceptTerms = () => {
    setTermsRead(true);
    setTermsAccepted(true);
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !name || !email || !password) {
      toast.error('Todos los campos son obligatorios');
      return;
    }

    if (!termsAccepted) {
      toast.error('Debes aceptar las condiciones de uso para poder registrarte');
      return;
    }

    if (/^\d+$/.test(username)) {
      toast.error('El nombre de usuario no puede contener solo números para evitar colisiones');
      return;
    }

    if (password.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      const response = await register(username, name, email, password);
      toast.success(response?.message || '¡Registro exitoso! Por favor, verifica tu correo electrónico para activar tu cuenta.', {
        duration: 6000
      });
      navigate('/login');
    } catch (error) {
      toast.error(error.message || 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (e) => {
    setTermsAccepted(e.target.checked);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <AuthHeader 
            title="Crear Cuenta" 
            subtitle="Únete a Choral Record y empieza a organizar tus coros, partituras y eventos" 
          />

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="register-username">Nombre de Usuario (username)</label>
              <input
                id="register-username"
                type="text"
                className="form-input"
                placeholder="Nickname"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="register-name">Nombre Completo</label>
              <input
                id="register-name"
                type="text"
                className="form-input"
                placeholder="Nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="register-email">Email</label>
              <input
                id="register-email"
                type="email"
                className="form-input"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="register-password">Contraseña</label>
              <div className="input-password-wrapper">
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="register-confirm-password">Confirmar Contraseña</label>
              <input
                id="register-confirm-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Repite tu contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>

            <div 
              className="register-terms-row"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <input
                id="register-terms"
                type="checkbox"
                checked={termsAccepted}
                onChange={handleCheckboxChange}
                disabled={!termsRead}
                className={`register-terms-checkbox ${termsRead ? 'terms-read-cursor' : ''}`}
              />
              <label 
                htmlFor="register-terms" 
                className={`register-terms-label ${termsRead ? 'terms-read-cursor' : ''}`}
              >
                He leído y acepto las{' '}
                <span 
                  className="register-terms-link"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowModal(true);
                  }}
                >
                  condiciones de uso
                </span>
              </label>

              {showTooltip && (
                <div className="terms-tooltip-bubble">
                  ⚠️ Debes leer las condiciones de uso haciendo clic en el enlace para poder aceptarlas.
                  <div className="terms-tooltip-arrow"></div>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-accent btn-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-sm"></span>
                  Creando cuenta...
                </>
              ) : (
                'Crear Cuenta'
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="auth-link">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </div>

      <AuthBackground />

      {showModal && (
        <TermsModal 
          onClose={() => {
            setTermsRead(true);
            setShowModal(false);
          }}
          onAccept={handleAcceptTerms}
        />
      )}
    </div>
  );
};

export default RegisterPage;
