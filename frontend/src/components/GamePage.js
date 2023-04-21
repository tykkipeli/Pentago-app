import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import Game from './Game';
import ChatBox from './ChatBox';

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

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <div>
      <h2>Game Page</h2>
      {socket && <Game socket={socket} player1={player1} player2={player2} gameID={gameID} />}
      {socket && <ChatBox socket={socket} room={gameID} />}
    </div>
  );
};

export default GamePage;
