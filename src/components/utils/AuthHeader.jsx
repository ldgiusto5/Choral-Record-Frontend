/**
 * AuthHeader.jsx
 * Cabecera unificada para las vistas de Login y Registro.
 */
import React from 'react';
import { Link } from 'react-router-dom';

const AuthHeader = ({ title, subtitle }) => {
  return (
    <div className="auth-header">
      <Link to="/" className="auth-brand brand-link-unified">
        <img src="/logo-transparent.png" alt="Logo" className="auth-brand-logo" />
        <span className="brand-text auth-brand-text">Choral Record</span>
      </Link>
      <h1 className="auth-header-title">{title}</h1>
      <p className="auth-header-subtitle">{subtitle}</p>
    </div>
  );
};

export default AuthHeader;
