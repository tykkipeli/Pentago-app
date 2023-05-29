import React from 'react';
import { useNavigate } from 'react-router-dom';
import SignupForm from './SignupForm';

const SignupPage = () => {
  const navigate = useNavigate();

  const handleSignup = (username) => {
    alert(`User ${username} registered successfully!`);
    navigate('/login');
  };

  return (
    <div className="signup-page">
      <div>
        <h2>Sign up</h2>
        <SignupForm onSignup={handleSignup} />
      </div>
    </div>
  );
};

export default SignupPage;