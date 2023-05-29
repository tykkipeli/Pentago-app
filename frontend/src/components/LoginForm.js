import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginForm = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // Add error state

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ username, password }),
    });

    if (response.ok) {
      const data = await response.json();
      // Call onLogin with the token and username
      onLogin(data.token, username);
      setError('');
      navigate("/");
    } else {
      // Handle login error
      console.log("login error")
      const data = await response.json();
      setError(data.message);
      setPassword('');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="login-unit">
        <label htmlFor='login-username'>Username: </label>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          id='login-username'
        />
      </div>
      <div className="login-unit">
        <label htmlFor='login-password'>Password: </label>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          id='login-password'
        />
      </div>
      {error && <div className="error-message">{error}</div>} {/* Display error message */}
      <button type="submit">Login</button>
    </form>
  );
};

export default LoginForm;