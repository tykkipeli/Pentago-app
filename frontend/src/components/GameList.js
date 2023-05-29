import React from 'react';
import './GameList.css';
import icon from '../assets/icon_placeholder.png';
import winIcon from '../assets/voitto_icon_placeholder.png';
import loseIcon from '../assets/havio_icon_placeholder.png';

const GameList = ({ games, navigate, username }) => (
  <table className="games-table">
    <thead>
      <tr>
        <th>Played as</th>
        <th>Opponent</th>
        <th>Result</th>
        <th>Moves</th>
        <th>Date</th>
      </tr>
    </thead>
    <tbody>
      {games.map((game) => {
        const playedAs = game.white_username === username ? 'white' : 'black';
        const opponent = playedAs === 'white' ? game.black_username : game.white_username;
        return (
          <tr key={game.id} onClick={() => navigate(`/analysis/${game.id}`)}>
            <td><div className={`color-circle ${playedAs}`}></div></td>
            <td><div className='user-wrapper'>
                    <img src={icon} className="icon" alt="icon" />
                    {opponent}
                  </div></td>
            <td><img src={game.result === 'win' ? winIcon : loseIcon} className="result-icon" alt="result" /></td>
            <td>{game.move_count}</td>
            <td>{new Date(game.date).toLocaleDateString()}</td>
          </tr>
        )
      })}
    </tbody>
  </table>
);

export default GameList;
