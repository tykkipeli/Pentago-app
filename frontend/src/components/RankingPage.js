import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './RankingPage.css';

const RankingPage = () => {
  const [users, setUsers] = useState([]);
  const [offset, setOffset] = useState(0);
  const limit = 15;

  useEffect(() => {
    fetchUsers(offset);
  }, [offset]);

  const fetchUsers = async (offset) => {
    try {
      const response = await fetch(`/api/rankings?offset=${offset}&limit=${limit}`);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const loadMoreUsers = () => {
    setOffset(offset + limit);
  };

  const loadPreviousUsers = () => {
    setOffset(Math.max(offset - limit, 0));
  };

  return (
    <div className="ranking-page">
      <h2>Ranking</h2>
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Username</th>
            <th>Rating</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={user.username}>
              <td>{offset + index + 1}</td>
              <td>
                <Link to={`/profile/${user.username}`}>{user.username}</Link>
              </td>
              <td>{user.rating.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={loadPreviousUsers} disabled={offset === 0}>Load previous</button>
      <button onClick={loadMoreUsers}>Load more</button>
    </div>
  );
};

export default RankingPage;
