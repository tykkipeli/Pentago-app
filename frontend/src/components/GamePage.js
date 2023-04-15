import React from 'react';
import { useLocation } from 'react-router-dom';
import Game from './Game';

const GamePage = () => {
  const location = useLocation();
  const { player1, player2, gameID } = location.state;

  return (
    <div>
      <h2>Game Page</h2>
      <Game player1={player1} player2={player2} gameID={gameID} />
    </div>
  );
};

export default GamePage;
