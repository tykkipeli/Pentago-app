import React from 'react';
import { Link } from 'react-router-dom';
import './GameList.css';
import icon from '../assets/icon_placeholder.png';
import winIcon from '../assets/voitto.png';
import loseIcon from '../assets/havio.png';
import drawIcon from '../assets/tasapeli.png';
import { getIcon } from '../utils/iconutils';

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
        const opponentIcon = playedAs === 'white' ? getIcon(game.black_rating, game.black_games_played) : getIcon(game.white_rating, game.white_games_played);
        return (
          <tr key={game.id} onClick={() => navigate(`/analysis/${game.id}`)}>
            <td><div className={`color-circle ${playedAs}`}></div></td>
            <td><div className='user-wrapper'>
            <span className='gamelist-username' onClick={(event) => {event.stopPropagation(); navigate(`/profile/${opponent}`);}}>
              <img src={opponentIcon} className="icon" alt="icon" />
              {opponent}</span>
            </div></td>
            <td>
              <img src={
                game.result === 'win' ? winIcon :
                  game.result === 'loss' ? loseIcon :
                    drawIcon
              } className="result-icon" alt="result" />
            </td>
            <td>{game.move_count}</td>
            <td>{new Date(game.date).toLocaleDateString()}</td>
          </tr>
        )
      })}
    </tbody>
  </table>
);

export default GameList;
