import React, { useState } from 'react';

const SignupForm = ({ onSignup }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const validateInputs = () => {
    const usernamePattern = /^(?=[A-Za-z])(?!.*[-_]{2,})[A-Za-z0-9_-]*[A-Za-z0-9]$/;

    if (username.length < 3 || username.length > 12 || !usernamePattern.test(username)) {
      setError(`Invalid username. Usernames must be 3-12 characters long, start with a letter and end with a letter or number,
      and can contain letters, numbers, underscores, and hyphens. Consecutive underscores and hyphens are not allowed.`);
      return false;
    }
    

    if (password.length < 8 || password.length > 128) {
      setError('Password must be at least 8 and at most 128 characters long');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateInputs()) {
      return;
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        onSignup(username);
      } else {
        const data = await response.json();
        setError(data.error);
      }
    } catch (error) {
      setError('Error signing up. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="login-unit">
        <label htmlFor="signup-username">Username: </label>
        <input
          type="text"
          value={username}
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
          id="signup-username"
        />
      </div>
      <div className="login-unit">
        <label htmlFor="signup-password">Password: </label>
        <input
          type="password"
          value={password}
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          id="signup-password"
        />
      </div>
      {error && <p>{error}</p>}
      <button type="submit">Sign up</button>
    </form>
  );
};

export default SignupForm;