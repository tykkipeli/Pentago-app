import React from 'react';
import './Cell.css';

const Cell = ({ value, onClick }) => {
  const handleClick = (e) => {
    e.preventDefault();
    onClick();
  };

  const marbleClass = value === 1 ? 'marble-white' : value === 2 ? 'marble-black' : '';

  return (
    <div className="cell" onClick={handleClick}>
      <div className={`marble ${marbleClass}`} />
    </div>
  );
};

export default Cell;
