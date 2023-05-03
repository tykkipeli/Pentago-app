import React from 'react';
import './Arrows.css';

const Arrows = ({ quadrant, onArrowClick, onMouseEnter, onMouseLeave, hoveredRotation }) => {
  const handleClick = (e, direction) => {
    e.preventDefault();
    onArrowClick(quadrant - 1, direction);
  };

  const arrowClass = (direction) =>
    `arrow arrow-${direction} ${hoveredRotation && 
      hoveredRotation.quadrant === quadrant - 1 && 
      hoveredRotation.direction === direction
      ? 'hovered'
      : ''
    }`;

  return (
    <div className={`arrows arrows-quadrant-${quadrant}`} style={{ width: '100%', height: '100%' }}>
      <span
        className={arrowClass('ccw')}
        onClick={(e) => handleClick(e, 'ccw')}
        onMouseEnter={() => onMouseEnter({quadrant:quadrant-1, direction:'ccw'})}
        onMouseLeave={onMouseLeave}
      >
        ↺
      </span>
      <span
        className={arrowClass('cw')}
        onClick={(e) => handleClick(e, 'cw')}
        onMouseEnter={() => onMouseEnter({quadrant:(quadrant-1), direction:'cw'})}
        onMouseLeave={onMouseLeave}
      >
        ↻
      </span>
    </div>
  );
};

export default Arrows;