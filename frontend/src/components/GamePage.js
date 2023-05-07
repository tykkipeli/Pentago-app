import React, { useState, useEffect} from 'react';
import { useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import Game from './Game';
import ChatBox from './ChatBox';
import './GamePage.css';

const GamePage = ({ socket }) => {
  const [gameResult, setGameResult] = useState(null);
  const [incomingChallenge, setIncomingChallenge] = useState(null);
  const [opponentInGameRoom, setOpponentInGameRoom] = useState(true);
  const [isChallenging, setIsChallenging] = useState(false);
  const [gameKey, setGameKey] = useState(0);
  const location = useLocation();
  const { player1, player2, gameID } = location.state;
  const token = sessionStorage.getItem('token');

  const username = sessionStorage.getItem('username');
  const opponent_username = player1 === username ? player2 : player1;

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
    }
  }, [gameKey]);

  useEffect(() => {
    console.log("Opponent in game room", opponentInGameRoom);
  }, [opponentInGameRoom]);

  useEffect(() => {
    if (socket) {
      socket.on("challenge_received", (challenger) => {
        setIncomingChallenge(challenger);
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
      socket.emit("challenge", opponent_username);
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

  return (
    <div>
      <div className="gamepage-container">
        <div className="chat-container">
          {socket && <ChatBox socket={socket} room={gameID} />}
        </div>
        <div className="game-container">
          {socket && <Game key={gameKey} socket={socket} gameID={gameID} gameResult={gameResult} setGameResult={setGameResult}/>}
        </div>
        {gameResult && opponentInGameRoom && (
          <div className="rematch-container">
            {!isChallenging && !incomingChallenge && (
              <button onClick={handleRematch}>Rematch</button>
            )}
            {isChallenging && (
              <button onClick={handleCancelChallenge}>Cancel Rematch</button>
            )}
            {incomingChallenge && (
              <>
                <p>{incomingChallenge} wants a rematch!</p>
                <button onClick={handleAcceptChallenge}>Accept</button>
                <button onClick={handleRejectChallenge}>Reject</button>
              </>
            )}
          </div>
        )}
        {!opponentInGameRoom && (
          <div className="rematch-container">
              Your opponent has left the game room.
          </div>
        )}
      </div>
    </div>
  );
};

export default GamePage;
