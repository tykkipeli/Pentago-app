import React from 'react';
import './Cell.css';

const Cell = ({ value, onClick, onMouseEnter, onMouseLeave, hovered }) => {
  const handleClick = (e) => {
    e.preventDefault();
    onClick();
  };

  const marbleClass = value === 1 ? 'marble-white' : value === 2 ? 'marble-black' : '';
  //const hoveredClass = hovered && currentAction.placement === null && currentAction.rotation === null ? 'hovered' : '';
  const hoveredClass = hovered ? 'hovered' : '';

  return (
    <div
      className={`cell`}
      onClick={handleClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className={`marble ${marbleClass} ${hoveredClass}`} />
    </div>
  );
};

export default Cell;
