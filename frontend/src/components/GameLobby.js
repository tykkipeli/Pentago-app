import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

const GameLobby = () => {
  const [socket, setSocket] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [incomingChallenge, setIncomingChallenge] = useState(null);
  const [isChallenging, setIsChallenging] = useState(false);

  const navigate = useNavigate();

  const handleUserClick = (username) => {
    setSelectedUser(username);
  };

  
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    //const newSocket = io('http://localhost:5000');
    /*
    const newSocket = io('http://127.0.0.1:8000', {
      query: { token },
    });
    */
    const socketUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : window.location.origin;
    const newSocket = io(socketUrl, {
      query: { token },
    });
    setSocket(newSocket);

    newSocket.on('user_joined', (username) => {
      setUsers((prevUsers) => [...prevUsers, username]);
    });

    newSocket.on('user_left', (username) => {
      setUsers((prevUsers) => prevUsers.filter((prevUser) => prevUser !== username));
      if (username === selectedUser) {
        setSelectedUser(null);
        setIsChallenging(false);
      }
    });

    newSocket.on("users", (initialUsers) => {
      setUsers(initialUsers);
    });

    newSocket.on("connect", () => {
      console.log("joining lobby debug");
      newSocket.emit("join_lobby");
      newSocket.emit("request_users");
    });

    newSocket.on("challenge_received", (challenger) => {
      console.log("Challenge received")
      setIncomingChallenge(challenger);
    });

    newSocket.on("challenge_canceled", () => {
      setIncomingChallenge(null);
    });

    newSocket.on("challenge_result", (result) => {
      if (result === "accepted") {
        // this code is redundant:
        setIsChallenging(false);
        navigate("/game", { state: { player1: socket.id, player2: selectedUser } });
      } else {
        setSelectedUser(null);
        setIsChallenging(false);
      }
    });

    newSocket.on("challenge_error", (errorMessage) => {
      alert(errorMessage);
      setSelectedUser(null);
      setIsChallenging(false);
    });

    newSocket.on("game_started", ({ player1, player2, gameID }) => {
      setIsChallenging(false);
      setSelectedUser(null);
      navigate("/game", { state: { player1, player2, gameID } });
    });

    return () => {
      console.log("disconnecting here");
      newSocket.disconnect();
    };
  }, []);

  return (
    <div>
      <h2>Game Lobby</h2>
      <ul>
        {users.map((username, index) => (
          <li
            key={index}
            onClick={() => handleUserClick(username)}
            style={{ backgroundColor: selectedUser === username ? 'lightblue' : 'transparent' }}
          >
            {username}
          </li>
        ))}
      </ul>
      {selectedUser && !isChallenging && (
        <button
          onClick={() => {
            socket.emit('challenge', selectedUser);
            setIsChallenging(true);
          }}
        >
          Challenge {selectedUser}
        </button>
      )}
      {isChallenging && (
        <button onClick={() => {
          socket.emit("cancel_challenge");
          setIsChallenging(false);
        }}>Cancel challenge</button>
      )}
      {incomingChallenge && (
        <>
          <div>{incomingChallenge} has challenged you!</div>
          <button onClick={() => socket.emit("accept_challenge")}>Accept</button>
          <button onClick={() => {
            socket.emit("reject_challenge");
            setIncomingChallenge(null);
          }}>Reject</button>
        </>
      )}
    </div>
  );
};

export default GameLobby;
