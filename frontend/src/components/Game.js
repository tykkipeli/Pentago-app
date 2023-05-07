// src/components/Game.js
import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import GameBoard from './GameBoard';
import './Game.css';

const Game = ({ gameID, socket, gameResult, setGameResult }) => {
  const [board, setBoard] = useState(Array(6).fill(Array(6).fill(null)));
  const [player1, setPlayer1] = useState(null);
  const [player2, setPlayer2] = useState(null);
  const [currentAction, setCurrentAction] = useState({ type: null, placement: null, rotation: null });
  const [localPlayer, setLocalPlayer] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [opponentMove, setOpponentMove] = useState(null);
  const [playerTimes, setPlayerTimes] = useState({ 1: 10, 2: 10 });
  const [animationRunning, setAnimationRunning] = useState(false);
  const [player1Rating, setPlayer1Rating] = useState(0);
  const [player2Rating, setPlayer2Rating] = useState(0);
  const [hoveredMarble, setHoveredMarble] = useState(null);
  const [hoveredRotation, setHoveredRotation] = useState(null);
  const [lastTimestamp, setLastTimestamp] = useState(null);
  const player1Ref = useRef(null);
  const player2Ref = useRef(null);

  const updatePlayerTimes = (player, newTime) => {
    setPlayerTimes((prevTimes) => {
      return { ...prevTimes, [player]: newTime };
    });
  };

  useEffect(() => {
    player1Ref.current = player1;
    player2Ref.current = player2;
  }, [player1, player2]);

  useEffect(() => {
    if (socket) {
      const username = sessionStorage.getItem('username');
      /*
      socket.emit('join_game', { gameID, username });
      */

      socket.on("player_times_after_move", (data) => {
        console.log("Updated player times after move:", data);
        setPlayerTimes(data.playerTimes);
        setLastTimestamp(data.timestamp); 
      });

      socket.on('game_info', (data) => {
        console.log("game_info received");
        setPlayer1(data.startingPlayer);
        setPlayer2(data.otherPlayer);
        setLocalPlayer(data.startingPlayer === username ? 1 : 2);
        setPlayerTimes(data.playerTimes); // Set the initial player times from the server
        setLastTimestamp(data.timestamp); 
        setPlayer1Rating(data.player1Rating);
        setPlayer2Rating(data.player2Rating);
      });

      socket.on('opponent_move', (move) => {
        console.log("opponent_move received")
        console.log(move);
        console.log(`within socketEvent: ${currentPlayer}`);
        setOpponentMove(move);
        setCurrentPlayer((prevPlayer) => prevPlayer === 1 ? 2 : 1);
      });

      // use useRef, because state variable values are no more up to date within the callback functions closure
      socket.on('game_over', (result) => {
        console.log("game over received")
        let message = "";
        if (result.winner) {
          const winnerUsername = result.winner === 1 ? player1Ref.current : player2Ref.current;
          message = `${winnerUsername} wins! `;
        } else if (result.draw) {
          message = 'The game is a draw. ';
        }
        if (result.reason === 'five_in_a_row') {
          message += 'Five in a row!';
        } else if (result.reason === 'time_out') {
          const loser = result.winner === 1 ? 2 : 1;
          const loserUsername = loser === 1 ? player1Ref.current : player2Ref.current;
          message += `${loserUsername} lost on time!`;
          setPlayerTimes((prevTimes) => {
            const updatedTimes = { ...prevTimes };
            updatedTimes[loser] = 0;
            return updatedTimes;
          });
        } else if (result.reason === 'disconnection') {
          message += 'Opponent disconnected!';
        } else if (result.reason === 'resignation') {
          const resigningPlayer = result.winner === 1 ? player2Ref.current : player1Ref.current;
          message += `${resigningPlayer} resigned!`;
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
    if (currentPlayer && !gameResult && lastTimestamp) {
      const timer = setInterval(() => {
        const elapsedTime = (Date.now() / 1000) - lastTimestamp;
        setPlayerTimes((prevTimes) => {
          const updatedTimes = { ...prevTimes };
          updatedTimes[currentPlayer] -= elapsedTime;
  
          if (updatedTimes[currentPlayer] <= 0) {
            updatedTimes[currentPlayer] = 0;
            clearInterval(timer);
          }
  
          return updatedTimes;
        });
        setLastTimestamp(Date.now() / 1000);
      }, 1000 / updatesPerSecond);
  
      return () => clearInterval(timer);
    }
  }, [currentPlayer, gameResult, lastTimestamp]);


  useEffect(() => {
    console.log("current player: " + currentPlayer)
  }, [currentPlayer]);


  const handleMove = (move) => {
    socket.emit('make_move', { gameID, move, player: currentPlayer });
    setCurrentPlayer((prevPlayer) => prevPlayer === 1 ? 2 : 1);
  };

  const handleResign = () => {
    socket.emit('resign', { gameID, player: localPlayer });
  };

  const isLocalPlayerTurn = currentPlayer === localPlayer;
  return (
    <div className="game-wrapper">
      <div className="leftside-wrapper">
        <div className="game-info">
          <h3>Game: {gameID}</h3>
          <div className="player-info">
            <p>Player 1: {player1} | Rating: {player1Rating}</p>
            <p>Player 2: {player2} | Rating: {player2Rating}</p>
          </div>
          {!gameResult && <p className="game-status">{isLocalPlayerTurn ? "Your Turn" : "Opponent's Turn"}</p>}
          {gameResult && <p className="game-status">{gameResult}</p>}
          {!gameResult && (
            <button className="resign-button" onClick={handleResign}>
              Resign
            </button>
          )}
        </div>
        <GameBoard
          onMove={handleMove}
          opponentMove={opponentMove}
          isLocalPlayerTurn={isLocalPlayerTurn}
          board={board}
          setBoard={setBoard}
          animationRunning={animationRunning}
          setAnimationRunning={setAnimationRunning}
          currentAction={currentAction}
          setCurrentAction={setCurrentAction}
          hoveredMarble={hoveredMarble}
          hoveredRotation={hoveredRotation}
          setHoveredMarble={setHoveredMarble}
          setHoveredRotation={setHoveredRotation}
        />
      </div>
      <div className="time-container">
        <p>
          {player1}: {Math.floor(playerTimes[1] / 60)}:{String(Math.floor(playerTimes[1] % 60)).padStart(2, "0")}:
          {String(Math.floor((playerTimes[1] % 1) * 10 ** decimalPlaces)).padStart(decimalPlaces, "0")}
        </p>
        <p>
          {player2}: {Math.floor(playerTimes[2] / 60)}:{String(Math.floor(playerTimes[2] % 60)).padStart(2, "0")}:
          {String(Math.floor((playerTimes[2] % 1) * 10 ** decimalPlaces)).padStart(decimalPlaces, "0")}
        </p>
      </div>
    </div>

  );
};

export default Game;
