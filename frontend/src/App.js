import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate} from 'react-router-dom';
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

/*
function App() {
  return (
    <Router>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
        </ul>
      </nav>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
    </Router>
  );
}
*/

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
      setUsername(savedUsername);
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (username) => {
    setUsername(username);
    setIsLoggedIn(true);
    localStorage.setItem('username', username);
  };

  const handleLogout = () => {
    setUsername('');
    setIsLoggedIn(false);
    localStorage.removeItem('username');
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
            <Route path="/testi" element={<GameBoard />} />
            <Route
              path="/login"
              element={<LoginPage onLogin={handleLogin} />}
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
