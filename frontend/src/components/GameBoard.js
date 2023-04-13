// src/components/GameBoard.js
import React, { useState } from 'react';
import Quadrant from './Quadrant';
import './GameBoard.css';
import quadrant1Image from '../assets/vasenyla.png';
import quadrant2Image from '../assets/oikeayla.png';
import quadrant3Image from '../assets/vasenala.png';
import quadrant4Image from '../assets/oikeaala.png';

async function sendGameAction(action) {
    const response = await fetch('/api/game-action', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(action),
    });
  
    const data = await response.json();
  
    // Update the game state and status based on the server's response
    // ...
  }
  


const GameBoard = ({ boardData }) => {

    const [currentPlayer, setCurrentPlayer] = useState(1);
    const [board, setBoard] = useState(Array(6).fill(Array(6).fill(null)));
    const [quadrantRotations, setQuadrantRotations] = useState([0, 0, 0, 0]);
    const [currentAction, setCurrentAction] = useState({ type: null, placement: null, rotation: null });



    const getQuadrantData = (quadrantIndex) => {
        const startRow = quadrantIndex < 2 ? 0 : 3;
        const startCol = quadrantIndex % 2 === 0 ? 0 : 3;
        return board.slice(startRow, startRow + 3).map(row => row.slice(startCol, startCol + 3));
      };

      const handleCellClick = (quadrant, row, col) => {
        const globalRow = (quadrant < 2 ? 0 : 3) + row;
        const globalCol = (quadrant % 2 === 0 ? 0 : 3) + col;
        if (board[globalRow][globalCol] !== null) {
          return;
        }
        const newBoard = board.map((r, rowIndex) =>
          r.map((cell, colIndex) =>
            rowIndex === globalRow && colIndex === globalCol ? currentPlayer : cell
          )
        );
        setBoard(newBoard);

        //setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
        setCurrentAction({ ...currentAction, type: "move", placement: { quadrant, row: globalRow, col: globalCol } });
      };

      

      /*
      const handleArrowClick = (quadrant, direction) => {
        // Rotate the specified quadrant and update the board state.
        const newBoard = rotateQuadrant(board, quadrant, direction);
        setBoard(newBoard);
      };
      */

      const handleArrowClick = (quadrant, direction) => {
        /*
        // Update the current action with the rotation information
        setCurrentAction({ ...currentAction, rotation: { quadrant, direction } });

        // If both placement and rotation have been performed, send the current action to the server
        if (currentAction.placement && currentAction.rotation) {
            const data = await sendGameAction(currentAction);
            setBoard(data.game_state);
            setCurrentPlayer(data.current_player);

            // Reset the current action
            setCurrentAction({ type: null, placement: null, rotation: null });
        }
        */
       
        //animate the rotation
        const startRotation = quadrantRotations[quadrant];
        const endRotation = startRotation + (direction === 'cw' ? 90 : -90);
        const startTime = performance.now();
      
      const animate = (time) => {
          const animationTime = 2000;
          const progress = Math.min((time - startTime) / (0.36*animationTime), 1);
          const currentRotation = startRotation + progress * (endRotation - startRotation);
          const newRotations = [...quadrantRotations];
          newRotations[quadrant] = currentRotation;
          setQuadrantRotations(newRotations);
      
          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };
      
        requestAnimationFrame(animate);
      };
      

      const rotateCW = (matrix) => {
        const n = matrix.length - 1;
        return matrix.map((row, i) => row.map((_, j) => matrix[n - j][i]));
      };
      
      const rotateCCW = (matrix) => {
        const n = matrix.length - 1;
        return matrix.map((row, i) => row.map((_, j) => matrix[j][n - i]));
      };
      

      const rotateQuadrant = (board, quadrant, direction) => {
        const startRow = quadrant < 2 ? 0 : 3;
        const startCol = quadrant % 2 === 0 ? 0 : 3;
      
        // Extract the quadrant from the board.
        const quadrantData = board
          .slice(startRow, startRow + 3)
          .map((row) => row.slice(startCol, startCol + 3));
      
        // Rotate the quadrant data.
        const rotatedQuadrant = direction === 'ccw' ? rotateCCW(quadrantData) : rotateCW(quadrantData);
      
        // Replace the quadrant in the board with the rotated quadrant.
        const newBoard = board.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            if (rowIndex >= startRow && rowIndex < startRow + 3 && colIndex >= startCol && colIndex < startCol + 3) {
              return rotatedQuadrant[rowIndex - startRow][colIndex - startCol];
            }
            return cell;
          })
        );
      
        return newBoard;
      };
      

      const renderQuadrant = (backgroundImage, quadrantIndex) => (
        <div className="quadrant-wrapper">
          <Quadrant
            backgroundImage={backgroundImage}
            boardData={getQuadrantData(quadrantIndex)}
            quadrant={quadrantIndex + 1}
            onClick={(row, col) => handleCellClick(quadrantIndex, row, col)}
            onArrowClick={handleArrowClick}
            rotation={quadrantRotations[quadrantIndex]}
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
