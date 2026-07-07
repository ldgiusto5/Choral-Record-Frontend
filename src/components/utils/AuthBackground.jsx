/**
 * AuthBackground.jsx
 * Componente que renderiza los blobs difuminados de fondo en el Login y Registro.
 */
import React from 'react';

const AuthBackground = () => {
  return (
    <div className="auth-bg-effects">
      <div className="auth-blob auth-blob-1"></div>
      <div className="auth-blob auth-blob-2"></div>
    </div>
  );
};

export default AuthBackground;
