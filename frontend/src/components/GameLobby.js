import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ChatBox from './ChatBox'
import './GameLobby.css'
import ChallengeArea from './ChallengeArea'
import ChallengeButton from './ChallengeButton'
import UserInfo from './UserInfo'
import icon from '../assets/icon_placeholder.png'
import { getIcon } from '../utils/iconutils'
import './mobile.css'

const GameLobby = ({ socket }) => {
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [challengedUser, setChallengedUser] = useState(null)
  const [challengeTime, setChallengeTime] = useState(null)
  const [incomingChallenge, setIncomingChallenge] = useState(null)
  const [isChallenging, setIsChallenging] = useState(false)
  const own_username = sessionStorage.getItem('username')

  const navigate = useNavigate()

  useEffect(() => {
    console.log(socket.connected)
    socket.emit('join_lobby')
    socket.emit('request_users')

    socket.on('user_joined', (user) => {
      setUsers((prevUsers) => {
        if (!prevUsers.includes(user) && user.username !== own_username) {
          return [...prevUsers, user]
        } else {
          return prevUsers
        }
      })
    })

    socket.on('user_left', (username) => {
      setUsers((prevUsers) => prevUsers.filter((prevUser) => prevUser.username !== username))
      if (username === selectedUser) {
        setSelectedUser(null)
        setIsChallenging(false)
      }
    })

    socket.on('users', (initialUsers) => {
      /*
      for (let i = 0; i < 100; i++) {
        let newString = `User ${i}`;
        initialUsers.push(newString);
      }
      */
      const filteredUsers = initialUsers.filter((user) => user.username !== own_username)
      setUsers(filteredUsers)
    })

    socket.on('challenge_received', (challenger) => {
      console.log('Challenge received')
      setIncomingChallenge(challenger)
    })

    socket.on('challenge_canceled', () => {
      setIncomingChallenge(null)
    })

    socket.on('challenge_rejected', () => {
      //setSelectedUser(null);
      setIsChallenging(false)
    })

    socket.on('challenge_error', (errorMessage) => {
      alert(errorMessage)
      //setSelectedUser(null);
      setIsChallenging(false)
    })

    socket.on('game_started', ({ player1, player2, gameID }) => {
      const playerOne = player1
      const playerTwo = player2
      setIsChallenging(false)
      setSelectedUser(null)
      navigate('/game', { state: { playerOne, playerTwo, gameID } })
    })

    return () => {
      socket.emit('leave_lobby')
      socket.off('user_joined')
      socket.off('user_left')
      socket.off('users')
      socket.off('challenge_received')
      socket.off('challenge_canceled')
      socket.off('challenge_rejected')
      socket.off('challenge_error')
      socket.off('game_started')
    }
  }, [socket])

  return (
    <div className="lobby-container">
      <ChatBox socket={socket} room="lobby" />
      <div className="middle-container">
        <div className="middle-content">
          <div className="button-container-wrapper">
            <h1>Game Lobby</h1>
            <ChallengeArea
              isChallenging={isChallenging}
              incomingChallenge={incomingChallenge}
              socket={socket}
              setIsChallenging={setIsChallenging}
              setIncomingChallenge={setIncomingChallenge}
              challengedUser={challengedUser}
              challengeTime={challengeTime}
            />
          </div>
          <div className="user-list-wrapper">
            <ul className="user-list">
              {users.map((user, index) => (
                <li
                  key={user.username}
                  className={selectedUser === user.username ? 'selected' : ''}
                  onClick={() => setSelectedUser(user.username)}
                >
                  <div className="user-wrapper">
                    <img src={getIcon(user.rating, user.numGames)} className="icon" alt="icon" />
                    {user.username}
                  </div>

                  {incomingChallenge === null && !isChallenging ? (
                    <ChallengeButton
                      username={user.username}
                      socket={socket}
                      setIsChallenging={setIsChallenging}
                      setChallengedUser={setChallengedUser}
                      setChallengeTime={setChallengeTime}
                    />
                  ) : (
                    <div style={{ visibility: 'hidden' }}>Hidden</div>
                  )}
                </li>
              ))}
              <li id="empty-item"></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="right-container">{selectedUser && <UserInfo user={selectedUser} />}</div>
    </div>
  )
}

export default GameLobby
