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
    <div>
      <h1>Sign up</h1>
      <SignupForm onSignup={handleSignup} />
    </div>
  );
};

export default SignupPage;
