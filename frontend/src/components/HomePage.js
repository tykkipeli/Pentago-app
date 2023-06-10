import React from 'react';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className='homeContainer'>
      <section className='welcomeSection'>
        <h1>Welcome to Pentagopark</h1>
        <p>
          {
            `Here you can play and analyse the game of pentago. 
            Challenge others, gain rating, climb up the leaderboard and improve your strategy with database assisted game analysis.`
          }
        </p>
      </section>
      
      <section className='gameRulesSection'>
        <h2>How to Play Pentago</h2>
        <p>
          {
            `Pentago is a two-player abstract strategy game invented by Tomas Flodén. The game is played on a 6x6 board divided into four 3x3 sub-boards, or quadrants. 
            Taking turns, each player places a marble of their color (white or black) onto an unoccupied space on the board, and then rotates one of the quadrants by 90 degrees either clockwise or counter-clockwise. 
            A player wins by getting five of their marbles in a vertical, horizontal or diagonal row (after the turn of the quadrant). 
            If all marbles are placed onto the board without a row of five being formed then the game is a draw. Also if both players get five in a row at the same time the game also ends in a draw.`
          }
        </p>
      </section>
      
      <section className='aboutSection'>
        <h2>About Pentagopark</h2>
        <p>
          {
            `Pentagopark is a new project and still needs some additional features and testing. There will likely be updates in the future.`
          }
        </p>
      </section>
    </div>
  );
};

export default HomePage;
