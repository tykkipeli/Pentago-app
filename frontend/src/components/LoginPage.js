// src/components/LoginPage.js
import React from 'react';
import LoginForm from './LoginForm';

const LoginPage = ({ onLogin }) => {
  return (
    <div className="login-page">
      <h2>Login</h2>
      <LoginForm onLogin={onLogin} />
    </div>
  );
};

export default LoginPage;
