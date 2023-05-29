// src/components/LoginPage.js
import React from 'react';
import LoginForm from './LoginForm';

const LoginPage = ({ onLogin }) => {
  return (
    <div className="login-page">
      <div>
        <h2>Login</h2>
        <LoginForm onLogin={onLogin} />
      </div>
    </div>
  );
};

export default LoginPage;