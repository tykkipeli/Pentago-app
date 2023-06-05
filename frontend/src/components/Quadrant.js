// src/components/Quadrant.js
import React from 'react';
import './Quadrant.css';
import Arrows from './Arrows';
import Cell from './Cell';
import { CELL_SIZE, CELL_SIZE_MOBILE } from '../constants';


const calculateShift = (angle, sideLength, quadrant) => {
  const radians = (angle % 90) * (Math.PI / 180);
  const hypotenuse = Math.sqrt(2) * sideLength / 2;

  const baseShift = Math.abs(
    hypotenuse * Math.cos(Math.PI / 4) - hypotenuse * Math.cos(Math.PI / 4 - radians)
  );

  const quadrantShifts = {
    1: { x: -baseShift, y: -baseShift },
    2: { x: baseShift, y: -baseShift },
    3: { x: -baseShift, y: baseShift },
    4: { x: baseShift, y: baseShift },
  };

  return quadrantShifts[quadrant];
};



const Quadrant = ({
  backgroundImage,
  boardData,
  quadrant,
  onClick,
  onArrowClick,
  rotation,
  quadrantRotation,
  hoveredMarble,
  hoveredRotation,
  setHoveredMarble,
  setHoveredRotation,
  currentAction
}) => {
  const startRow = quadrant < 3 ? 0 : 3;
  const startCol = quadrant % 2 === 1 ? 0 : 3;

  const renderCell = (row, col) => (
    <Cell
      key={`${row}-${col}`}
      value={boardData[row][col]}
      onClick={() => onClick(row, col)}
      onMouseEnter={() => {
        if (currentAction.placement === null && currentAction.rotation === null && boardData[row][col] === null) {
          setHoveredMarble({ row: startRow + row, col: startCol + col });
        }
      }}
      onMouseLeave={() => setHoveredMarble(null)}
      hovered={hoveredMarble && hoveredMarble.row === startRow + row && hoveredMarble.col === startCol + col}
    />
  );

  // Calculate the shift based on the current rotation angle.
  let sideLength = 3 * CELL_SIZE;
  const angle = (rotation % 360 + 360) % 360;
  let shift = calculateShift(angle, sideLength, quadrant);

  if (typeof window !== 'undefined') {
    sideLength = 3 * (window.innerWidth <= 600 ? CELL_SIZE_MOBILE : CELL_SIZE);
    shift = calculateShift(angle, sideLength, quadrant);
    window.addEventListener('resize', () => {
      sideLength = 3 * (window.innerWidth <= 600 ? CELL_SIZE_MOBILE : CELL_SIZE);
      shift = calculateShift(angle, sideLength, quadrant);
    });
  }

  return (
    <div>
      <Arrows
        quadrant={quadrant}
        onArrowClick={onArrowClick}
        onMouseEnter={(rotation) => {
          if (currentAction.placement !== null && currentAction.rotation === null) {
            setHoveredRotation(rotation);
          }
        }}
        onMouseLeave={() => setHoveredRotation(null)}
        hoveredRotation={hoveredRotation}
      />
      <div
        className="quadrant"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          transform: `translate(${shift.x}px, ${shift.y}px) rotate(${quadrantRotation}deg)`,
          transition: 'none',
        }}
      >
        <div
          className="marbles-container"
          style={{
            transform: `rotate(${rotation - quadrantRotation}deg)`,
            transition: 'none',
          }}
        >
          {boardData.map((_, rowIndex) =>
            boardData.map((_, colIndex) => renderCell(rowIndex, colIndex))
          )}
        </div>
      </div>
    </div>
  );
};


export default Quadrant;
