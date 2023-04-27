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
    ? `(${position.move.placement.row+1},${position.move.placement.col+1}) ${quadrantText(position.move.rotation.quadrant)} ${position.move.rotation.direction}`
    : "";

  return (
    <div className="position-item" onClick={() => onClick(position)}>
      <div className="position-details">
        <div>Move: {moveText}</div>
        <div>Times reached: {position.times_reached}</div>
        <div>White wins: {position.white_wins}</div>
        <div>Black wins: {position.black_wins}</div>
      </div>
    </div>
  );
};

export default PositionItem;
