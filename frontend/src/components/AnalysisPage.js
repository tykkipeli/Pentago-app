import React, { useState, useEffect } from 'react';
import GameBoard from './GameBoard';
import Node from './Node';
import { rotateQuadrant } from '../utils/boardUtils';
import { generateAllPossibleMoves, boardToBitboards, getNextBoard, getPreviousBoard } from '../utils/boardUtils';
import PositionItem from './PositionItem';
//import './AnalysisPage.css';

const boardToString = (board) => {
  return board.map((row) => row.map(cell => cell === null ? 'x' : cell).join('')).join('/');
};

const boardCopy = (board) => {
  return board.map((row) => [...row]);
};

// TODO: If a marble has been placed without rotation and a prev/next button gets clikced in analysis mode, it messes up all the states!
const AnalysisPage = () => {
  const [animationRunning, setAnimationRunning] = useState(false);
  const [board, setBoard] = useState(Array(6).fill(Array(6).fill(null)));
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [reverseMove, setReverseMove] = useState(null);
  const [opponentMove, setOpponentMove] = useState(null);
  const [currentNode, setCurrentNode] = useState(new Node(null));
  const [visitedNodes, setVisitedNodes] = useState(new Map());
  const [nextPositions, setNextPositions] = useState([]);

  const fetchNextPositionsFromServer = async (newBoard) => {
    const { whiteBitboard, blackBitboard } = boardToBitboards(newBoard);
    console.log(whiteBitboard, blackBitboard);
    console.table(newBoard);
    try {
      const response = await fetch(`/api/positions/${whiteBitboard}/${blackBitboard}`);
      const data = await response.json();
      if (response.ok) {
        const boardKey = boardToString(newBoard);

        // Generate next positions with moves
        const allMovesMap = generateAllPossibleMoves(newBoard);
        const nextPositionsMoves = data.next_positions.map((position) => {
          const key = `${position.white_bb},${position.black_bb}`;
          return {
            ...position,
            move: allMovesMap.get(key),
          };
        });
        console.log(nextPositionsMoves);
        setNextPositions(nextPositionsMoves);
      } else {
        console.log('Error:', data.error);
      }
    } catch (error) {
      console.error('Error fetching position information:', error);
    }
  };



  const initialBoardKey = boardToString(board);
  const initialNode = new Node(null);
  useEffect(() => {
    setCurrentNode(initialNode);
    setVisitedNodes((prevVisitedNodes) => {
      const newVisitedNodes = new Map(prevVisitedNodes);
      newVisitedNodes.set(initialBoardKey, initialNode);
      return newVisitedNodes;
    });
    fetchNextPositionsFromServer(board);
  }, []);

  useEffect(() => {
    //console.log(currentNode);
  }, [currentNode]);

  const handleMoveWithBoard = (move, newBoard) => {
    fetchNextPositionsFromServer(newBoard);

    const boardKey = boardToString(newBoard);
    console.log(boardKey);

    setCurrentPlayer((prevPlayer) => (prevPlayer === 1 ? 2 : 1));
    setOpponentMove(null);
    setReverseMove(null);
    setVisitedNodes((prevVisitedNodes) => {
      const newVisitedNodes = new Map(prevVisitedNodes);
      let updatedCurrentNode = currentNode;

      if (!newVisitedNodes.has(boardKey)) {
        const newNode = new Node(move, updatedCurrentNode);
        newVisitedNodes.set(boardKey, newNode);
        updatedCurrentNode.next = newNode;
      } else {
        updatedCurrentNode.next = newVisitedNodes.get(boardKey);
      }

      setCurrentNode(updatedCurrentNode.next);
      return newVisitedNodes;
    });
  };

  const handleMove = (move) => {
    const newBoard = rotateQuadrant(boardCopy(board), move.rotation.quadrant, move.rotation.direction);
    handleMoveWithBoard(move, newBoard);
  };

  const handlePreviousMove = () => {
    if (animationRunning) {
      return;
    }
    setOpponentMove(null);
    setCurrentNode((prevNode) => {
      if (!prevNode.prev) {
        return prevNode;
      }
      setCurrentPlayer((prevPlayer) => (prevPlayer === 1 ? 2 : 1));
      const move = prevNode.move;
      fetchNextPositionsFromServer(getPreviousBoard(board, move));
      const { placement, rotation } = move;
      const reverseDirection = rotation.direction === 'cw' ? 'ccw' : 'cw';
      const reverseRotation = { quadrant: rotation.quadrant, direction: reverseDirection };
      setReverseMove({ placement, rotation: reverseRotation });
      return prevNode.prev;
    });
  };

  const handleNextMove = () => {
    if (animationRunning) {
      return;
    }
    setReverseMove(null);
    setCurrentNode((prevNode) => {
      if (!prevNode.next) {
        return prevNode;
      }
      fetchNextPositionsFromServer(getNextBoard(board, prevNode.next.move));
      setCurrentPlayer((prevPlayer) => (prevPlayer === 1 ? 2 : 1));
      setOpponentMove(prevNode.next.move);
      return prevNode.next;
    });
  };

  const handleListMove = (move) => {
    if (animationRunning) {
      return;
    }
    handleMoveWithBoard(move, getNextBoard(board, move));
    setOpponentMove(move);
    console.log("TÄSSÄ:")
    console.table(getNextBoard(board, move));
    console.log(move);
  };

  return (
    <div className="analysis">
      <GameBoard
        onMove={handleMove}
        opponentMove={opponentMove}
        isLocalPlayerTurn={true}
        reverseMove={reverseMove}
        board={board}
        setBoard={setBoard}
        animationRunning={animationRunning}
        setAnimationRunning={setAnimationRunning}
      />
      <button onClick={handlePreviousMove}>&larr;</button>
      <button onClick={handleNextMove}>&rarr;</button>
      <div className="next-positions">
        {nextPositions.map((position, index) => (
          <PositionItem
            key={index}
            position={position}
            onClick={(clickedPosition) => {
              console.log('Clicked position:', clickedPosition);
              handleListMove(clickedPosition.move);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default AnalysisPage;
