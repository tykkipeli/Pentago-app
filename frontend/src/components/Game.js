// src/components/Game.js
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import GameBoard from './GameBoard';

//TODO: make gameclock time calculation relative to the last time you received the clock times from the server

const Game = ({ player1, player2, gameID, socket }) => {
  const [board, setBoard] = useState(Array(6).fill(Array(6).fill(null)));
  const [localPlayer, setLocalPlayer] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [opponentMove, setOpponentMove] = useState(null);
  const [gameResult, setGameResult] = useState(null);
  const [playerTimes, setPlayerTimes] = useState({ 1: 10, 2: 10 });
  const [animationRunning, setAnimationRunning] = useState(false);

  const updatePlayerTimes = (player, newTime) => {
    setPlayerTimes((prevTimes) => {
      return { ...prevTimes, [player]: newTime };
    });
  };

  useEffect(() => {
    if (socket) {
      const username = sessionStorage.getItem('username');
      socket.emit('join_game', { gameID, username });

      socket.on("player_times_after_move", (data) => {
        console.log("Updated player times after move:", data);
        setPlayerTimes(data);
      });

      socket.on('game_info', (data) => {
        console.log("game_info received");
        setLocalPlayer(data.startingPlayer === username ? 1 : 2);
        setPlayerTimes(data.playerTimes); // Set the initial player times from the server
      });
  
      socket.on('opponent_move', (move) => {
        console.log("opponent_move received")
        console.log(move);
        console.log(`within socketEvent: ${currentPlayer}`);
        setOpponentMove(move);
        setCurrentPlayer((prevPlayer) => prevPlayer === 1 ? 2 : 1);
      });
  
      socket.on('game_over', (result) => {
        console.log("game over received")
        let message = "";
        if (result.winner) {
          const winnerUsername = result.winner === 1 ? player1 : player2;
          message = `${winnerUsername} wins! `;
        } else if (result.draw) {
          message = 'The game is a draw. ';
        }
        if (result.reason === 'five_in_a_row') {
          message += 'Five in a row!';
        } else if (result.reason === 'time_out') {
          const loser = result.winner === 1 ? 2 : 1;
          const loserUsername = loser === 1 ? player1 : player2;
          message += `${loserUsername} lost on time!`;
          setPlayerTimes((prevTimes) => {
            const updatedTimes = { ...prevTimes };
            updatedTimes[loser] = 0;
            return updatedTimes;
          });
        } else if (result.reason === 'disconnection') {
          message += 'Opponent disconnected!';
        }
        setGameResult(message);
        setCurrentPlayer(null);
      });

      return () => {
        socket.off("game_info");
        socket.off("opponent_move");
        socket.off("game_over");
        socket.off("player_times_after_move");
      };
    }
  }, [socket]);

  const updatesPerSecond = 10;
  const decimalPlaces = Math.ceil(Math.log10(updatesPerSecond));
  useEffect(() => {
    if (currentPlayer && !gameResult) {
      const timer = setInterval(() => {
        setPlayerTimes((prevTimes) => {
          const updatedTimes = { ...prevTimes };
          updatedTimes[currentPlayer] -= 1.0 / updatesPerSecond;

          if (updatedTimes[currentPlayer] <= 0) {
            updatedTimes[currentPlayer] = 0;
            clearInterval(timer);
          }

          return updatedTimes;
        });
      }, 1000 / updatesPerSecond);

      return () => clearInterval(timer);
    }
  }, [currentPlayer, gameResult]);

  useEffect(() => {
    console.log("current player: " + currentPlayer)
  }, [currentPlayer]);


  const handleMove = (move) => {
    socket.emit('make_move', { gameID, move, player: currentPlayer });
    setCurrentPlayer((prevPlayer) => prevPlayer === 1 ? 2 : 1);
  };

  const isLocalPlayerTurn = currentPlayer === localPlayer;
  return (
    <div>
      <h3>Game: {gameID}</h3>
      <p>
        Player 1: {player1} | Time: {Math.floor(playerTimes[1] / 60)}:
        {String(Math.floor(playerTimes[1] % 60)).padStart(2, "0")}:
        {String(Math.floor((playerTimes[1] % 1) * 10 ** decimalPlaces)).padStart(decimalPlaces, "0")}
      </p>
      <p>
        Player 2: {player2} | Time: {Math.floor(playerTimes[2] / 60)}:
        {String(Math.floor(playerTimes[2] % 60)).padStart(2, "0")}:
        {String(Math.floor((playerTimes[2] % 1) * 10 ** decimalPlaces)).padStart(decimalPlaces, "0")}
      </p>
      {!gameResult && <p>{isLocalPlayerTurn ? "Your Turn" : "Opponent's Turn"}</p>}
      {gameResult && <p>{gameResult}</p>}
      <GameBoard
        onMove={handleMove}
        opponentMove={opponentMove}
        isLocalPlayerTurn={isLocalPlayerTurn}
        board={board} 
        setBoard={setBoard}
        animationRunning={animationRunning}
        setAnimationRunning={setAnimationRunning}
      />
    </div>
  );
};

export default Game;
