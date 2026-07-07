import { useState } from 'react';
import { Link } from 'react-router-dom';
import TermsModal from './utils/TermsModal';
import './Footer.css';

const Footer = () => {
  const [showTermsModal, setShowTermsModal] = useState(false);

  return (
    <footer className="app-footer">
      <div className="footer-main-row">
        {/* Branding Section */}
        <div className="footer-brand-section">
          <Link to="/" className="footer-brand-link brand-link-unified">
            <img src="/logo-transparent.png" alt="Logo" className="footer-logo" />
            <span className="brand-text footer-brand-text">Choral Record</span>
          </Link>
          <p className="footer-description">
            La primera red social de coros y coralistas. Comparte partituras, organiza ensayos y sigue el ritmo de tus coros favoritos.
          </p>
        </div>

        {/* Quick Links */}
        <div className="footer-links-container">
          <div>
            <h5 className="footer-links-column-title">Navegación</h5>
            <ul className="footer-links-list">
              <li>
                <Link to="/" className="footer-link">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/events" className="footer-link">
                  Eventos
                </Link>
              </li>
              <li>
                <Link to="/choirs/create" className="footer-link">
                  Crear Coro
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="footer-links-column-title">Comunidad</h5>
            <p className="footer-community-text">
              Sigue a tus coros preferidos haciendo clic en 💜 Seguir desde sus páginas de detalle.
            </p>
          </div>
        </div>
      </div>

      {/* Copyright & Bottom Info */}
      <div className="footer-bottom-row">
        <span>&copy; {new Date().getFullYear()} Choral Record. Todos los derechos reservados.</span>
        <span className="footer-bottom-right">
          <span 
            className="footer-terms-trigger"
            onClick={() => setShowTermsModal(true)}
          >
            Condiciones de uso
          </span>
          <span>|</span>
          <span>Hecho con 💜 para el arte coral</span>
        </span>
      </div>

      {showTermsModal && (
        <TermsModal onClose={() => setShowTermsModal(false)} />
      )}
    </footer>
  );
};

export default Footer;
