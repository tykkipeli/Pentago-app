import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import icon from '../assets/icon_placeholder.png';
import GameStats from './GameStats';
import GameList from './GameList';
import './ProfilePage.css';

const ProfilePage = () => {
  const [profileData, setProfileData] = useState(null);
  const [recentGames, setRecentGames] = useState(null);
  const [gamePage, setGamePage] = useState(1);
  const { username } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile(username);
    fetchRecentGames(username, gamePage);
  }, [username, gamePage]);

  const fetchUserProfile = async (username) => {
    try {
      const response = await fetch(`/api/profile/${username}`);
      const data = await response.json();
      console.log(data);
      setProfileData(data);
    } catch (error) {
      console.error("Failed to fetch profile data:", error);
    }
  };

  const fetchRecentGames = async (username, page) => {
    try {
      const response = await fetch(`/api/profile/${username}/games?page=${page}`);
      const data = await response.json();
      setRecentGames(data);
    } catch (error) {
      console.error("Failed to fetch recent games:", error);
    }
  };

  const handlePrevGames = () => {
    if (recentGames.prev_url) {
      setGamePage(gamePage - 1);
    }
  };

  const handleNextGames = () => {
    if (recentGames.next_url) {
      setGamePage(gamePage + 1);
    }
  };

  if (!profileData || !recentGames) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-page">
      <div className='username-container'>
        <img src={icon} className="profile-icon" alt="icon" />
        <h2>{profileData.username}</h2>
      </div>
      <div className='general-data-container'>
        <div>
          Joined:
        </div>
        <div className='profile-rating'>
          <strong>Rating:</strong> {profileData.rating.toFixed(2)}
        </div>
        <div >
          <strong>Last played:</strong> {new Date(profileData.last_played_date).toLocaleDateString()}
        </div>
      </div>
      <GameStats profileData={profileData} />
      <h3>Recent Games</h3>
      <GameList games={recentGames.games} navigate={navigate} username={profileData.username} />
      <div className="recent-games">
        <div className="game-pagination">
          <button onClick={handlePrevGames}
            disabled={!recentGames.prev_url}>Previous</button>
          <span>Page {gamePage}</span>
          <button onClick={handleNextGames} disabled={!recentGames.next_url}>Next</button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
