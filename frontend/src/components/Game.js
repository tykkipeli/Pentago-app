import React from 'react';

const Game = ({ player1, player2, gameID }) => {
  return (
    <div>
      <h3>Game: {gameID}</h3>
      <p>Player 1: {player1}</p>
      <p>Player 2: {player2}</p>
    </div>
  );
};

export default Game;
