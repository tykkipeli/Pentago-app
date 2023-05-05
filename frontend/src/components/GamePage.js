import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import Game from './Game';
import ChatBox from './ChatBox';
import './GamePage.css';

const GamePage = () => {
  const location = useLocation();
  const { player1, player2, gameID } = location.state;
  const [socket, setSocket] = useState(null);
  const token = sessionStorage.getItem('token');

  useEffect(() => {
    const socketUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : window.location.origin;
    const newSocket = io(socketUrl, {
      query: { token },
    });
    setSocket(newSocket);

    const username = sessionStorage.getItem('username');
    newSocket.emit('join_game', { gameID, username });

    return () => {
      newSocket.disconnect();
    };
  }, []);


  return (
    <div>
      <div className="gamepage-container">
        <div className="chat-container">
          {socket && <ChatBox socket={socket} room={gameID} />}
        </div>
        <div className="game-container">
          {socket && <Game socket={socket} player1={player1} player2={player2} gameID={gameID} />}
        </div>
      </div>
    </div>
  );
};

export default GamePage;
