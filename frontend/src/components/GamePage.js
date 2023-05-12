import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import Game from './Game';
import ChatBox from './ChatBox';
import RematchArea from './RematchArea';
import Modal from './Modal';
import './GamePage.css';

const GamePage = ({ socket }) => {
  const [gameResult, setGameResult] = useState(null);
  const [incomingChallenge, setIncomingChallenge] = useState(null);
  const [opponentInGameRoom, setOpponentInGameRoom] = useState(true);
  const [isChallenging, setIsChallenging] = useState(false);
  const [gameKey, setGameKey] = useState(0);
  const [player1Rating, setPlayer1Rating] = useState(0);
  const [player2Rating, setPlayer2Rating] = useState(0);
  const [player1, setPlayer1] = useState(null);
  const [player2, setPlayer2] = useState(null);
  const [playerTimes, setPlayerTimes] = useState({ 1: 10, 2: 10 });
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [localPlayer, setLocalPlayer] = useState(null);
  const [modalOpen, setModalOpen] = useState(true);
  const location = useLocation();
  const { playerOne, playerTwo, gameID } = location.state;
  const token = sessionStorage.getItem('token');

  const username = sessionStorage.getItem('username');
  const opponent_username = playerOne === username ? playerTwo : playerOne;

  useEffect(() => {
    if (socket) {
      const username = sessionStorage.getItem('username');
      //socket.emit('join_game', { gameID, username });
      return () => {
        socket.emit('leave_game', { gameID, username });
      };
    }
  }, [socket]);

  useEffect(() => {
    if (socket) {
      socket.emit('join_game', { gameID, username });
      console.log("Joining game");
    }
  }, [gameKey]);

  useEffect(() => {
    console.log("Opponent in game room", opponentInGameRoom);
  }, [opponentInGameRoom]);

  useEffect(() => {
    console.log("localPlayer:", localPlayer);
  }, [localPlayer]);

  useEffect(() => {
    if (socket) {
      socket.on("challenge_received", (challenge) => {
        setIncomingChallenge(challenge['challenger']);
      });

      socket.on("challenge_canceled", () => {
        setIncomingChallenge(null);
      });

      socket.on("challenge_rejected", () => {
        setIsChallenging(false);
      });

      socket.on("challenge_error", (errorMessage) => {
        alert(errorMessage);
      });

      socket.on("user_left_game", (username) => {
        console.log("USER LEFT RECEIVED");
        setOpponentInGameRoom(false);
      });

      socket.on("game_started", ({ player1, player2, gameID }) => {
        setIsChallenging(false);
        setIncomingChallenge(null);
        setGameResult(null);
        setGameKey((prevKey) => prevKey + 1);
        setModalOpen(true);
        console.log("game_started received!");
      });

      return () => {
        socket.off("challenge_received");
        socket.off("challenge_canceled");
        socket.off("challenge_rejected");
        socket.off("game_started");
      };
    }
  }, [socket]);

  const handleRematch = () => {
    if (gameResult) {
      socket.emit("challenge", { challenged_username: opponent_username, game_time: 0 });
      setIsChallenging(true);
    }
  };

  const handleCancelChallenge = () => {
    socket.emit("cancel_challenge");
    setIsChallenging(false);
  };

  const handleAcceptChallenge = () => {
    socket.emit("accept_challenge");
  };

  const handleRejectChallenge = () => {
    socket.emit("reject_challenge");
    setIncomingChallenge(null);
  };

  const handleResign = () => {
    socket.emit('resign', { gameID });
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const updatesPerSecond = 10;
  const decimalPlaces = Math.ceil(Math.log10(updatesPerSecond));
  const whiteUsername = localPlayer === 1 ? username : opponent_username;
  const blackUsername = localPlayer === 2 ? username : opponent_username;

  return (
    <div className="gamepage-container">
      {socket && <ChatBox socket={socket} room={gameID} />}
      <div className="game-container">
        {socket && <Game
          key={gameKey}
          socket={socket}
          gameID={gameID}
          gameResult={gameResult}
          setGameResult={setGameResult}
          setPlayerTimes={setPlayerTimes}
          setPlayer1Rating={setPlayer1Rating}
          setPlayer2Rating={setPlayer2Rating}
          currentPlayer={currentPlayer}
          setCurrentPlayer={setCurrentPlayer}
          player1={player1}
          setPlayer1={setPlayer1}
          player2={player2}
          setPlayer2={setPlayer2}
          localPlayer={localPlayer}
          setLocalPlayer={setLocalPlayer}
        />}
      </div>
      <div className="rightside-wrapper">
        <div className='rematcharea-wrapper'>
          {gameResult && (
            <RematchArea
              isChallenging={isChallenging}
              incomingChallenge={incomingChallenge}
              socket={socket}
              setIsChallenging={setIsChallenging}
              setIncomingChallenge={setIncomingChallenge}
              opponentInGameRoom={opponentInGameRoom}
              handleRematch={handleRematch}
            />
          )}
        </div>
        <div className={`player-times-wrapper ${localPlayer === 2 ? 'reverse' : ''}`}>
          <div className={`player-wrapper ${currentPlayer === 1 ? 'active' : ''} whiteborder`}>
            <p className="player-time">
              {Math.floor(playerTimes[1] / 60)}:{String(Math.floor(playerTimes[1] % 60)).padStart(2, "0")}:
              {String(Math.floor((playerTimes[1] % 1) * 10 ** decimalPlaces)).padStart(decimalPlaces, "0")}
            </p>
            <div className="player-details">
              <p>{player1}</p>
              <p>{Math.round(player1Rating)}</p>
            </div>
          </div>
          <div className={`player-wrapper ${currentPlayer === 2 ? 'active' : ''} blackborder`}>
            <p className="player-time">
              {Math.floor(playerTimes[2] / 60)}:{String(Math.floor(playerTimes[2] % 60)).padStart(2, "0")}:
              {String(Math.floor((playerTimes[2] % 1) * 10 ** decimalPlaces)).padStart(decimalPlaces, "0")}
            </p>
            <div className="player-details">
              <p>{player2}</p>
              <p>{Math.round(player2Rating)}</p>
            </div>
          </div>
        </div>
        <div className="resign-container">
          {!gameResult && (
            <button className="resign-button" onClick={handleResign}>
              Resign
            </button>
          )}
        </div>
      </div>
      <Modal gameResult={gameResult} modalOpen={modalOpen} onClose={handleModalClose} whiteUsername={whiteUsername} blackUsername={blackUsername} />
    </div>
  );
};

export default GamePage;
