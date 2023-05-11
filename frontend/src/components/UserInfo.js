// UserInfo.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import icon from '../assets/icon_placeholder.png';
import winIcon from '../assets/voitto_icon_placeholder.png';
import loseIcon from '../assets/havio_icon_placeholder.png';
import './UserInfo.css';

const UserInfo = ({ user }) => {
  const [userData, setUserData] = useState({ rating: null, recent_games: [] });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const response = await fetch(`/api/userinfo/${user}`);
      const data = await response.json();
      setUserData(data);
    };

    if (user) {
      fetchUserData();
    }
  }, [user]);

  return (
    <div className="user-info">
      <img src={icon} className="big-icon" alt="icon" />
      <h2>{user}</h2>
      <h1>{Math.round(userData.rating)}</h1>
      <h3>Most recent Games</h3>
      <ul>
        {userData.recent_games && userData.recent_games.map((game, index) => (
          <li key={index} onClick={() => navigate(`/analysis/${game.id}`)} className="game-info">
            vs {game.opponent_username}
            <img src={game.result === 'win' ? winIcon : loseIcon} className="result-icon" alt="result" />
            <span className={`color-circle ${game.color}`}></span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserInfo;
