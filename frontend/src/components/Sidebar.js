import React from 'react';
import { NavLink, useMatch } from 'react-router-dom';
import './Sidebar.css';
import logo from '../assets/logo.png';
/*import icon from '../assets/icon_placeholder.png'; */
import { useUser } from '../contexts/user-context';
import { getIcon } from '../utils/iconutils';

const Sidebar = ({ isLoggedIn, username, onLogout }) => {
  const { rating, numGames } = useUser(); 

  const isHomeActive = useMatch("/");
  const isGameLobbyActive = useMatch("/game-lobby");
  const isAnalysisActive = useMatch("/analysis/*");
  const isRankingActive = useMatch("/ranking");
  const isProfileActive = useMatch("/profile/*");

  const icon = getIcon(rating, numGames); 

  return (
    <div className="topbar">
      <nav className="nav-links">
        <img src={logo} className="logo" alt="Logo" />
        <ul className="nav-ul">
          <li className={isHomeActive ? "active" : ""}>
            <span className={`light-source-effect ${isHomeActive ? "active" : ""}`}>
            <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
                Home
            </NavLink>
            </span>
          </li>
          <li className={isGameLobbyActive ? "active" : ""}>
            <span className={`light-source-effect ${isGameLobbyActive ? "active" : ""}`}>
              <NavLink to="/game-lobby" className={({ isActive }) => isActive ? 'active' : ''}>
                Game Lobby
              </NavLink>
            </span>
          </li>
          <li className={isAnalysisActive ? "active" : ""}>
            <span className={`light-source-effect ${isAnalysisActive ? "active" : ""}`}>
              <NavLink to="/analysis" className={({ isActive }) => isActive ? 'active' : ''}>
                Analysis
              </NavLink>
            </span>
          </li>
          <li className={isRankingActive ? "active" : ""}>
            <span className={`light-source-effect ${isRankingActive ? "active" : ""}`}>
              <NavLink to="/ranking" className={({ isActive }) => isActive ? 'active' : ''}>
                Ranking
              </NavLink>
            </span>
          </li>
        </ul>
      </nav>
      <nav className="auth-links">

        {isLoggedIn ? (
          <div className="user-dropdown">
            <div className="username-wrapper">
              <img src={icon} className="login-icon" alt="icon" />
              <NavLink to={`/profile/${username}`}>{username}</NavLink>
              <div className='mobile-logout'><NavLink onClick={onLogout} to="/">Logout</NavLink></div>
            </div>
            <div className="dropdown-wrapper">
              <div className="dropdown-content">
                <NavLink to={`/profile/${username}`}>Profile</NavLink>
                <NavLink onClick={onLogout} to="/">Logout</NavLink>
              </div>
            </div>
          </div>
        ) : (
          <ul>
            <li>
              <NavLink to="/login" className={({ isActive }) => isActive ? 'active' : ''}>
                Login
              </NavLink>
            </li>
            <li>
              <NavLink to="/signup" className={({ isActive }) => isActive ? 'active' : ''}>
                Sign up
              </NavLink>
            </li>
          </ul>
        )}
      </nav>
    </div>
  );
};

export default Sidebar;