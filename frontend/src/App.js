import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import Home from './components/Home'
import About from './components/About'
import GameBoard from './components/GameBoard'
import Sidebar from './components/Sidebar'
import HomePage from './components/HomePage'
import './App.css'
import LoginForm from './components/LoginForm'
import LoginPage from './components/LoginPage'
import GameLobby from './components/GameLobby'
import GamePage from './components/GamePage'
import SignupPage from './components/SignupPage'
import AnalysisPage from './components/AnalysisPage'
import RankingPage from './components/RankingPage'
import ProfilePage from './components/ProfilePage'
import { useUser } from './contexts/user-context'
import './components/mobile.css'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [socket, setSocket] = useState(null)
  const { setRating, setNumGames } = useUser()

  useEffect(() => {
    const token = sessionStorage.getItem('token')
    const savedUsername = sessionStorage.getItem('username')
    if (token && savedUsername) {
      setIsLoggedIn(true)
      setUsername(savedUsername)
    }
  }, [])

  useEffect(() => {
    if (isLoggedIn) {
      console.log('Connecting')
      const token = sessionStorage.getItem('token')
      const rating = sessionStorage.getItem('rating')
      const numGames = sessionStorage.getItem('numGames')
      const socketUrl =
        process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : window.location.origin
      const newSocket = io(socketUrl, {
        query: { token },
      })

      newSocket.on('disconnect', (reason) => {
        // perform any cleanup or navigation here
        console.log('Disconnecting')
        handleLogout()
      })
      newSocket.on('connect_error', (error) => {
        console.log('Connection Error', error)
      })

      newSocket.on('connect_timeout', (timeout) => {
        console.log('Connection Timeout', timeout)
      })

      setRating(rating)
      setNumGames(numGames)
      setSocket(newSocket)
      return () => {
        if (newSocket) {
          console.log('Closing socket')
          newSocket.close()
        }
      }
    } else {
      setSocket(null)
    }
  }, [isLoggedIn])

  const handleLogin = (token, username, rating, numGames) => {
    setIsLoggedIn(true)
    setUsername(username)
    sessionStorage.setItem('token', token)
    sessionStorage.setItem('username', username)
    sessionStorage.setItem('rating', rating)
    sessionStorage.setItem('numGames', numGames)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUsername('')
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('username')
    sessionStorage.removeItem('rating')
    sessionStorage.removeItem('numGames')
  }

  return (
    <Router>
      <div className="app">
        <Sidebar isLoggedIn={isLoggedIn} username={username} onLogout={handleLogout} />
        <div className="content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route
              path="/game-lobby"
              element={isLoggedIn ? <GameLobby socket={socket} /> : <Navigate to="/login" />}
            />
            <Route path="/game" element={<GamePage socket={socket} />} />
            <Route path="/analysis/:gameId?" element={<AnalysisPage />} />
            <Route path="/ranking" element={<RankingPage />} />
            <Route
              path="/profile/:username"
              element={isLoggedIn ? <ProfilePage /> : <Navigate to="/login" />}
            />
            <Route path="/testi" element={<About />} />
            <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
            <Route path="/signup" element={<SignupPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App
