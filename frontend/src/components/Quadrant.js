// src/components/Quadrant.js
import React from 'react';
import './Quadrant.css';
import Arrows from './Arrows';
import Cell from './Cell';
import { CELL_SIZE } from '../constants';


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



const Quadrant = ({ backgroundImage, boardData, quadrant, onClick, onArrowClick, rotation, quadrantRotation, }) => {
  const renderCell = (row, col) => (
    <Cell
      key={`${row}-${col}`}
      value={boardData[row][col]}
      onClick={() => onClick(row, col)}
    />
  );
  // Calculate the shift based on the current rotation angle.
  const sideLength = 3 * CELL_SIZE;
  const angle = (rotation % 360 + 360) % 360;
  const shift = calculateShift(angle, sideLength, quadrant);

  return (
    <div>
      <Arrows quadrant={quadrant} onArrowClick={onArrowClick} />
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
