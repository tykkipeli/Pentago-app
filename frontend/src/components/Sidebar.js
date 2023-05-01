import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ isLoggedIn, username, onLogout }) => {
  return (
    <div className="topbar">
      <nav className="nav-links">
        <ul>
          <li>
            <NavLink to="/" exact activeClassName="active">
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/game-lobby" activeClassName="active">
              Game Lobby
            </NavLink>
          </li>
          <li>
            <NavLink to="/analysis" activeClassName="active">
              Analysis
            </NavLink>
          </li>
          <li>
            <NavLink to="/ranking" activeClassName="active">
              Ranking
            </NavLink>
          </li>
          <li>
            <NavLink to={`/profile/${username}`} activeClassName="active">
              Profile
            </NavLink>
          </li>
        </ul>
      </nav>
      <nav className="auth-links">

        {isLoggedIn ? (
          <div className="user-dropdown">
            <div className="username-wrapper">
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
