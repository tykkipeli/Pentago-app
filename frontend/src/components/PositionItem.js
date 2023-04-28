import React from 'react';
import './PositionItem.css';

const PositionItem = ({ position, onClick }) => {
  const quadrantText = (quadrant) => {
    switch (quadrant) {
      case 0:
        return "top-left";
      case 1:
        return "top-right";
      case 2:
        return "bottom-left";
      case 3:
        return "bottom-right";
      default:
        return "";
    }
  };

  const moveText = position.move
    ? `(${position.move.placement.row + 1},${position.move.placement.col + 1}) ${quadrantText(position.move.rotation.quadrant)} ${position.move.rotation.direction}`
    : "";

  const totalWins = position.white_wins + position.black_wins;
  const whiteWinsPercentage = (position.white_wins / totalWins) * 100;
  const blackWinsPercentage = (position.black_wins / totalWins) * 100;

  return (
    <div className="position-item" onClick={() => onClick(position)}>
      <div className="position-details">
        <div>Move: {moveText}</div>
        <div>Times reached: {position.times_reached}</div>
        <div className="win-bar-container">
          <div
            className="win-bar"
            style={{
              width: `${whiteWinsPercentage}%`,
              backgroundColor: 'white',
            }}
          ></div>
          <div
            className="win-bar"
            style={{
              width: `${blackWinsPercentage}%`,
              backgroundColor: 'black',
              left: `${whiteWinsPercentage}%`,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};
    
export default PositionItem;
