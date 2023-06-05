import React, { useState, useRef, useEffect } from 'react';
import './GameStats.css';

const GameStats = ({ profileData }) => {
  const [selectedGameType, setSelectedGameType] = useState('all');
  const sliderRef = useRef(null);

  const gameTypes = ['all', 'white', 'black'];

  useEffect(() => {
    const index = gameTypes.indexOf(selectedGameType);
    sliderRef.current.scrollLeft = index * sliderRef.current.clientWidth;
  }, [selectedGameType, gameTypes]);

  const getPercentages = (type) => {
    let wins, losses, draws;
    if (type === 'all') {
      wins = profileData.wins;
      losses = profileData.losses;
      draws = profileData.draws;
    } else if (type === 'white') {
      wins = profileData.wins_as_white;
      losses = profileData.losses_as_white;
      draws = profileData.draws_as_white;
    } else if (type === 'black') {
      wins = profileData.wins_as_black;
      losses = profileData.losses_as_black;
      draws = profileData.draws_as_black;
    }

    const total = wins + losses + draws;
    const winPercentage = total > 0 ? (wins / total) * 100 : 0;
    const lossPercentage = total > 0 ? (losses / total) * 100 : 0;
    const drawPercentage = total > 0 ? 100 - winPercentage - lossPercentage: 0; // rest of the circle

    return {
      winPercentage,
      lossPercentage,
      drawPercentage,
      total
    };
  }

  const handleClick = (type) => {
    setSelectedGameType(type);
  }

  return (
    <div className="game-stats">
      <div className="game-stats-wrapper">
        <div className="game-types">
          {gameTypes.map((type) => (
            <div 
            key={type} 
            className={`game-type ${selectedGameType === type ? 'selected' : ''}`} 
            onClick={() => handleClick(type)}
          >
              {type === 'all' ? 'All games' : `Games as ${type}`}
            </div>
          ))}
        </div>
        <div className='pie-chart-slider' ref={sliderRef}>
          {gameTypes.map((type) => {
            const percentages = getPercentages(type);
            return (
              <div key={type} className='chart-and-legend'>
                <div className='pie-chart-container'>
                  <div className="results-label">Results</div>
                  <div className="pie-chart"
                    style={{
                      background: `
                      conic-gradient(#1F75C3 0% ${percentages.winPercentage-0.5}%, 
                      darkblue ${percentages.winPercentage}% ${percentages.winPercentage + percentages.lossPercentage-0.5}%, 
                      grey ${percentages.winPercentage + percentages.lossPercentage}% 100%)
                `}}>
                    <div className="pie-chart-inner"></div>
                    <div className="pie-chart-text">{percentages.total}</div>
                  </div>
                </div>
                <div className="pie-chart-legend">
                  <div><span className="legend-dot" style={{backgroundColor: "#1F75C3"}}></span>Wins: {percentages.winPercentage.toFixed(1)}%</div>
                  <div><span className="legend-dot" style={{backgroundColor: "darkblue"}}></span>Losses: {percentages.lossPercentage.toFixed(1)}%</div>
                  <div><span className="legend-dot" style={{backgroundColor: "grey"}}></span>Draws: {percentages.drawPercentage.toFixed(1)}%</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );


}

export default GameStats;
