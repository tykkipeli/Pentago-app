import React from 'react';
import { NavLink, useMatch } from 'react-router-dom';
import './Sidebar.css';
import logo from '../assets/logo_placeholderpng.png';
import icon from '../assets/icon_placeholder.png';

const Sidebar = ({ isLoggedIn, username, onLogout }) => {

  const isHomeActive = useMatch("/");
  const isGameLobbyActive = useMatch("/game-lobby");
  const isAnalysisActive = useMatch("/analysis*");
  const isRankingActive = useMatch("/ranking");
  const isProfileActive = useMatch("/profile*");

  return (
    <div className="topbar">
      <nav className="nav-links">
        <img src={logo} className="logo" alt="Logo" />
        <ul className="nav-ul">
          <li className={isHomeActive ? "active" : ""}>
            <span className={`light-source-effect ${isHomeActive ? "active" : ""}`}>
              <NavLink to="/" exact activeClassName="active">
                Home
              </NavLink>
            </span>
          </li>
          <li className={isGameLobbyActive ? "active" : ""}>
            <span className={`light-source-effect ${isGameLobbyActive ? "active" : ""}`}>
              <NavLink to="/game-lobby" activeClassName="active">
                Game Lobby
              </NavLink>
            </span>
          </li>
          <li className={isAnalysisActive ? "active" : ""}>
            <span className={`light-source-effect ${isAnalysisActive ? "active" : ""}`}>
              <NavLink to="/analysis" activeClassName="active">
                Analysis
              </NavLink>
            </span>
          </li>
          <li className={isRankingActive ? "active" : ""}>
            <span className={`light-source-effect ${isRankingActive ? "active" : ""}`}>
              <NavLink to="/ranking" activeClassName="active">
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
            </div>
            <div className="dropdown-wrapper">
              <div className="dropdown-content">
                <NavLink to="/some-page-1">Some Page 1</NavLink>
                <NavLink to="/some-page-2">Some Page 2</NavLink>
                <NavLink to="/some-page-3">Some Page 3</NavLink>
                <NavLink onClick={onLogout} to="/">Logout</NavLink>
              </div>
            </div>
          </div>
        ) : (
          <ul>
            <li>
              <NavLink to="/login" activeClassName="active">
                Login
              </NavLink>
            </li>
            <li>
              <NavLink to="/signup" activeClassName="active">
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