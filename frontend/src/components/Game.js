// src/components/Game.js
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import GameBoard from './GameBoard';

const Game = ({ player1, player2, gameID }) => {
  const [socket, setSocket] = useState(null);
  const [localPlayer, setLocalPlayer] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [opponentMove, setOpponentMove] = useState(null);
  const token = sessionStorage.getItem('token');

  useEffect(() => {
    console.log("current plaeyr: " + currentPlayer)
  }, [currentPlayer]);

  useEffect(() => {
    const socketUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : window.location.origin;
    const newSocket = io(socketUrl, {
      query: { token },
    });
    setSocket(newSocket);

    const username = sessionStorage.getItem('username');
    newSocket.emit('join_game', { gameID, username });

    newSocket.on('game_info', (data) => {
      console.log("gane_info receiced")
      setLocalPlayer(data.startingPlayer === username ? 1 : 2);
    });

    newSocket.on('opponent_move', (move) => {
      // Handle the opponent's move here
      console.log("opponnen_move received")
      console.log(move);
      setOpponentMove(move);
      setCurrentPlayer((prevPlayer) => prevPlayer === 1 ? 2 : 1);
    });


    newSocket.on('game_over', (result) => {
      console.log("game over received")
      if (result.winner) {
        // Handle the win, result.winner contains the winning player's symbol
      } else if (result.draw) {
        // Handle the draw
      }
      setCurrentPlayer(null);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);
  

  const handleMove = (move) => {
    socket.emit('make_move', { gameID, move, player: currentPlayer });
    setCurrentPlayer((prevPlayer) => prevPlayer === 1 ? 2 : 1);
  };

  const isLocalPlayerTurn = currentPlayer === localPlayer;
  return (
    <div>
      <h3>Game: {gameID}</h3>
      <p>Player 1: {player1}</p>
      <p>Player 2: {player2}</p>
      <p>{isLocalPlayerTurn ? "Your Turn" : "Opponent's Turn"}</p>
      <GameBoard
        onMove={handleMove}
        currentPlayer={currentPlayer}
        opponentMove={opponentMove}
        isLocalPlayerTurn={isLocalPlayerTurn}
      />
    </div>
  );
};

export default Game;

