import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ isLoggedIn, username, onLogout }) => {
  return (
    <div className="sidebar">
      <nav>
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
            <NavLink to="/profile" activeClassName="active">
              Profile
            </NavLink>
          </li>
        </ul>
        {isLoggedIn ? (
        <>
          <p>Logged in as: {username}</p>
          <button onClick={onLogout}>Logout</button>
        </>
      ) : (
        <NavLink to="/login" activeClassName="active">
          Login
        </NavLink>
      )}
      </nav>
    </div>
  );
};

export default Sidebar;
