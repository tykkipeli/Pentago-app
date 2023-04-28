import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './ProfilePage.css';

const ProfilePage = () => {
  const [profileData, setProfileData] = useState(null);
  const [recentGames, setRecentGames] = useState(null);
  const [gamePage, setGamePage] = useState(1);
  const { username } = useParams();

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
      <h2>{profileData.username}'s Profile</h2>
      <div className="profile-stats">
        <div className="profile-stat">
          <strong>Rating:</strong> {profileData.rating.toFixed(2)}
        </div>
        <div className="profile-stat">
          <strong>Played games:</strong> {profileData.games_played}
        </div>
        <div className="profile-stat">
          <strong>Last played:</strong> {new Date(profileData.last_played_date).toLocaleDateString()}
        </div>
        <div className="profile-stat">
          <strong>Wins:</strong> {profileData.wins}
        </div>
        <div className="profile-stat">
          <strong>Losses:</strong> {profileData.losses}
        </div>
        <div className="profile-stat">
          <strong>Draws:</strong> {profileData.draws}
        </div>
        <div className="profile-stat">
          <strong>Wins as White:</strong> {profileData.wins_as_white}
        </div>
        <div className="profile-stat">
          <strong>Wins as Black:</strong> {profileData.wins_as_black}
        </div>
        <div className="profile-stat">
          <strong>Losses as White:</strong> {profileData.losses_as_white}
        </div>
        <div className="profile-stat">
          <strong>Losses as Black:</strong> {profileData.losses_as_black}
        </div>
        <div className="profile-stat">
          <strong>Draws as White:</strong> {profileData.draws_as_white}
        </div>
        <div className="profile-stat">
          <strong>Draws as Black:</strong> {profileData.draws_as_black}
        </div>
      </div>
      <div className="recent-games">
        <h3>Recent Games</h3>
        <table>
          <thead>
            <tr>
              <th>White</th>
              <th>Black</th>
              <th>Moves</th>
              <th>Result</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {recentGames.games.map((game) => (
              <tr key={game.id}>
                <td>{game.white_username}</td>
                <td>{game.black_username}</td>
                <td>{game.move_count}</td>
                <td>{game.result}</td>
                <td>{new Date(game.date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
