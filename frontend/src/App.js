import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import Home from './components/Home';
import About from './components/About';
import GameBoard from './components/GameBoard';
import Sidebar from './components/Sidebar';
import HomePage from './components/HomePage';
import './App.css';
import LoginForm from './components/LoginForm';
import LoginPage from './components/LoginPage';
import GameLobby from './components/GameLobby';
import GamePage from './components/GamePage';
import SignupPage from './components/SignupPage';
import AnalysisPage from './components/AnalysisPage';
import RankingPage from './components/RankingPage';
import ProfilePage from './components/ProfilePage';


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const savedUsername = sessionStorage.getItem('username');
    if (token && savedUsername) {
      setIsLoggedIn(true);
      setUsername(savedUsername);
    }
  }, []);

  const handleLogin = (token, username) => {
    setIsLoggedIn(true);
    setUsername(username);
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('username', username);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('username');
  };


  return (
    <Router>
      <div className="app">
        <Sidebar isLoggedIn={isLoggedIn} username={username} onLogout={handleLogout} />
        <div className="content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route
              path="/game-lobby"
              element={isLoggedIn ? <GameLobby /> : <Navigate to="/login" />}
            />
            <Route path="/game" element={<GamePage />} />
            <Route path="/analysis" element={<AnalysisPage />} />
            <Route path="/analysis/:gameId" element={<AnalysisPage />} />
            <Route path="/ranking" element={<RankingPage />} />
            <Route
              path="/profile/:username"
              element={isLoggedIn ? <ProfilePage /> : <Navigate to="/login" />}
            />
            <Route path="/testi" element={<GameBoard />} />
            <Route
              path="/login"
              element={<LoginPage onLogin={handleLogin} />}
            />
            <Route path="/signup" element={<SignupPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
