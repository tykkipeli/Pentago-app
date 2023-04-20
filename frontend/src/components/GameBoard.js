// src/components/GameBoard.js
import React, { useState, useEffect } from 'react';
import { rotateCW, rotateCCW, rotateQuadrant } from '../utils/boardUtils';
import Quadrant from './Quadrant';
import './GameBoard.css';
import quadrant1Image from '../assets/vasenyla.png';
import quadrant2Image from '../assets/oikeayla.png';
import quadrant3Image from '../assets/vasenala.png';
import quadrant4Image from '../assets/oikeaala.png';


// for debugging:
function printBoardState(boardState) {
  console.table(boardState);
  /*
  console.log('Current Board State:');
  boardState.forEach((row) => {
    console.log(row.join(' '));
  });
  */
}

const GameBoard = ({ onMove, currentPlayer, opponentMove, isLocalPlayerTurn }) => {
  const [board, setBoard] = useState(Array(6).fill(Array(6).fill(null)));
  const [animationBoard, setAnimationBoard] = useState(null);
  const [quadrantRotations, setQuadrantRotations] = useState([0, 0, 0, 0]);
  const [marbleRotations, setMarbleRotations] = useState([0, 0, 0, 0]);
  const [currentAction, setCurrentAction] = useState({ type: null, placement: null, rotation: null });

  useEffect(() => {
    if (opponentMove) {
      const { placement, rotation } = opponentMove;
      const newBoard = placeMarble(placement, currentPlayer === 1 ? 2 : 1);
      animateRotation(rotation, () => {
        updateBoardWithRotation(rotation, newBoard);
      });
    }
  }, [opponentMove]);
  
  const getQuadrantData = (quadrantIndex) => {
    const startRow = quadrantIndex < 2 ? 0 : 3;
    const startCol = quadrantIndex % 2 === 0 ? 0 : 3;
    return board.slice(startRow, startRow + 3).map(row => row.slice(startCol, startCol + 3));
  };

  const handleCellClick = (quadrant, row, col) => {
    const globalRow = (quadrant < 2 ? 0 : 3) + row;
    const globalCol = (quadrant % 2 === 0 ? 0 : 3) + col;

    if (board[globalRow][globalCol] !== null || currentAction.placement || !isLocalPlayerTurn) {
      return;
    }

    const placement = { row: globalRow, col: globalCol };
    setCurrentAction({ ...currentAction, type: "move", placement });
    placeMarble(placement, currentPlayer);
  };

  const handleArrowClick = (quadrant, direction) => {
    if (currentAction.rotation || !isLocalPlayerTurn || !currentAction.placement) {
      return;
    }
    const rotation = { quadrant, direction };
    setCurrentAction({ ...currentAction, rotation });

    const fullMove = { ...currentAction, rotation };
    onMove(fullMove);
    animateRotation(rotation, () => {
      updateBoardWithRotation(rotation, board);
      setCurrentAction({ type: null, placement: null, rotation: null });
    });
  };

  const updateBoardWithRotation = (rotation, currentBoard) => {
    const { quadrant, direction } = rotation;
    const newBoard = rotateQuadrant(currentBoard, quadrant, direction);
    setBoard(newBoard);
  };

  const placeMarble = (placement, player) => {
    const newBoard = board.map((r, rowIndex) =>
      r.map((cell, colIndex) =>
        rowIndex === placement.row && colIndex === placement.col ? player : cell
      )
    );
    setBoard(newBoard);
    return newBoard;
  };

  const animateRotation = (rotation, onAnimationEnd) => {
    const { quadrant, direction } = rotation;

    const startRotation = marbleRotations[quadrant];
    const endRotation = startRotation + (direction === 'cw' ? 90 : -90);
    const startQuadrantRotation = quadrantRotations[quadrant];
    const endQuadrantRotation = startQuadrantRotation + (direction === 'cw' ? 90 : -90);
    const startTime = performance.now();

    const animate = (time) => {
      const animationTime = 5000;
      const progress = Math.min((time - startTime) / (0.36 * animationTime), 1);
      const currentRotation = startRotation + progress * (endRotation - startRotation);
      const currentQuadrantRotation = startQuadrantRotation + progress * (endQuadrantRotation - startQuadrantRotation);
      const newRotations = [...marbleRotations];
      const newQuadrantRotations = [...quadrantRotations];
      newRotations[quadrant] = currentRotation;
      newQuadrantRotations[quadrant] = currentQuadrantRotation;
      setMarbleRotations(newRotations);
      setQuadrantRotations(newQuadrantRotations);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        onAnimationEnd();
        const finalRotations = [...marbleRotations];
        finalRotations[quadrant] = 0;
        setMarbleRotations(finalRotations);
      }
    };
    requestAnimationFrame(animate);
  };

  const renderQuadrant = (backgroundImage, quadrantIndex) => (
    <div className="quadrant-wrapper">
      <Quadrant
        backgroundImage={backgroundImage}
        boardData={getQuadrantData(quadrantIndex)}
        quadrant={quadrantIndex + 1}
        onClick={(row, col) => handleCellClick(quadrantIndex, row, col)}
        onArrowClick={handleArrowClick}
        rotation={marbleRotations[quadrantIndex]}
        quadrantRotation={quadrantRotations[quadrantIndex]}
      />
    </div>
  );

  return (
    <div className="game-board">
      {renderQuadrant(quadrant1Image, 0)}
      {renderQuadrant(quadrant2Image, 1)}
      {renderQuadrant(quadrant3Image, 2)}
      {renderQuadrant(quadrant4Image, 3)}
    </div>
  );
};


export default GameBoard;
