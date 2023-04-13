import React from 'react';
import GameBoard from './GameBoard';


const initialBoardData = [
    Array(9).fill(0),
    Array(9).fill(0),
    Array(9).fill(0),
    Array(9).fill(0),
  ];

const Home = () => {
  return (
    <div>
      <h1>Welcome to the Home page</h1>
      <h1>Pentago</h1>
      <GameBoard boardData={initialBoardData} />
    </div>
  );
};

export default Home;
