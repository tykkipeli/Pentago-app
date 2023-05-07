import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import ChatBox from './ChatBox';
import './GameLobby.css';

const GameLobby = ({ socket }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [incomingChallenge, setIncomingChallenge] = useState(null);
  const [isChallenging, setIsChallenging] = useState(false);
  const own_username = sessionStorage.getItem('username');

  const navigate = useNavigate();


  const handleUserClick = (username) => {
    setSelectedUser(username);
  };

  useEffect(() => {
    console.log(selectedUser);
  }, [selectedUser]);

  useEffect(() => {
    console.log("joining lobby debug");
    socket.emit("join_lobby");
    socket.emit("request_users");

    socket.on('user_joined', (username) => {
      console.log(username + " joined");
      setUsers((prevUsers) => {
        if (!prevUsers.includes(username) && username !== own_username) {
          return [...prevUsers, username];
        } else {
          return prevUsers;
        }
      });
    });

    socket.on('user_left', (username) => {
      console.log("user left" + username);
      setUsers((prevUsers) => prevUsers.filter((prevUser) => prevUser !== username));
      if (username === selectedUser) {
        setSelectedUser(null);
        setIsChallenging(false);
      }
    });

    socket.on("users", (initialUsers) => {
      /*
      for (let i = 0; i < 100; i++) {
        let newString = `User ${i}`;
        initialUsers.push(newString);
      }
      */
      const filteredUsers = initialUsers.filter((user) => user !== own_username);
      setUsers(filteredUsers);
    });

    socket.on("challenge_received", (challenger) => {
      console.log("Challenge received")
      setIncomingChallenge(challenger);
    });

    socket.on("challenge_canceled", () => {
      setIncomingChallenge(null);
    });

    socket.on("challenge_rejected", () => {
      setSelectedUser(null);
      setIsChallenging(false);
    });

    socket.on("challenge_error", (errorMessage) => {
      alert(errorMessage);
      setSelectedUser(null);
      setIsChallenging(false);
    });

    socket.on("game_started", ({ player1, player2, gameID }) => {
      setIsChallenging(false);
      setSelectedUser(null);
      navigate("/game", { state: { player1, player2, gameID } });
    });

    return () => {
      console.log("leaving lobby");
      socket.emit("leave_lobby");
      socket.off("user_joined");
      socket.off("user_left");
      socket.off("users");
      socket.off("challenge_received");
      socket.off("challenge_canceled");
      socket.off("challenge_rejected");
      socket.off("challenge_error");
      socket.off("game_started");
    };
  }, [socket]);

  return (
    <div className="lobby-container">
      <div className="chat-container">
        <ChatBox socket={socket} room="lobby" />
      </div>
      <div class="middle-container">
        <div class="middle-content">
          <div className="button-container-wrapper">
            <div className="button-container">
              {selectedUser && !isChallenging && (
                <button
                  onClick={() => {
                    socket.emit("challenge", selectedUser);
                    setIsChallenging(true);
                  }}
                >
                  Challenge {selectedUser}
                </button>
              )}
              {isChallenging && (
                <button
                  onClick={() => {
                    socket.emit("cancel_challenge");
                    setIsChallenging(false);
                  }}
                >
                  Cancel challenge
                </button>
              )}
              {incomingChallenge && (
                <>
                  <div className="incoming-challenge-message">
                    {incomingChallenge} has challenged you!
                  </div>
                  <button onClick={() => socket.emit("accept_challenge")}>
                    Accept
                  </button>
                  <button
                    onClick={() => {
                      socket.emit("reject_challenge");
                      setIncomingChallenge(null);
                    }}
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="user-list-wrapper">
            <ul className="user-list">
              {users.map((username, index) => (
                <li
                  key={index}
                  onClick={() => handleUserClick(username)}
                  className={selectedUser === username ? "selected" : ""}
                >
                  {username}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="right-container">
        <p>Placeholder text for other stuff</p>
      </div>
    </div>
  );
};

export default GameLobby;
