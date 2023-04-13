import React from 'react';
import './Arrows.css';


const Arrows = ({ quadrant, onArrowClick }) => {
    const handleClick = (e, direction) => {
      e.preventDefault();
      onArrowClick(quadrant - 1, direction);
    };
  
    return (
      <div className={`arrows arrows-quadrant-${quadrant}`} style={{width: '100%', height: '100%'}}>
        <span className="arrow arrow-ccw" onClick={(e) => handleClick(e, 'ccw')}>
          ↺
        </span>
        <span className="arrow arrow-cw" onClick={(e) => handleClick(e, 'cw')}>
          ↻
        </span>
      </div>
    );
  };
  
  export default Arrows;