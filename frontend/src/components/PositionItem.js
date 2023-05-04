import React from 'react';
import './PositionItem.css';

const PositionItem = ({ position, onClick, onMoveHover, onMoveLeave, index }) => {
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

  const totalGames = position.times_reached;
  const totalDraws = totalGames - position.white_wins - position.black_wins;
  const whiteWinsPercentage = (position.white_wins / totalGames) * 100;
  const drawPercentage = (totalDraws / totalGames) * 100;
  const blackWinsPercentage = (position.black_wins / totalGames) * 100;

  return (
    <div
      className="position-item"
      onClick={() => onClick(position)}
      onMouseEnter={() => onMoveHover(position.move, index)}
      onMouseLeave={onMoveLeave}
    >
      <div className="position-details">
        <div>Move: {moveText}</div>
        <div className="win-bar-container">
          <span>{position.times_reached}</span>
          <div className="win-bars">
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
                width: `${drawPercentage}%`,
                backgroundColor: 'grey',
                left: `${whiteWinsPercentage}%`,
              }}
            ></div>
            <div
              className="win-bar"
              style={{
                width: `${blackWinsPercentage}%`,
                backgroundColor: 'black',
                left: `${whiteWinsPercentage + drawPercentage}%`,
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PositionItem;
