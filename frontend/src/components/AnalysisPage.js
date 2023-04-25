import React, { useState, useEffect } from 'react';
import GameBoard from './GameBoard';
import Node from './Node';
import { rotateQuadrant } from '../utils/boardUtils';
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

  const initialBoardKey = boardToString(board);
  const initialNode = new Node(null);
  useEffect(() => {
    setCurrentNode(initialNode);
    setVisitedNodes((prevVisitedNodes) => {
      const newVisitedNodes = new Map(prevVisitedNodes);
      newVisitedNodes.set(initialBoardKey, initialNode);
      return newVisitedNodes;
    });
  }, []);

  useEffect(() => {
    //console.log(currentNode);
  }, [currentNode]);

  const handleMove = (move) => {
    const newBoard = rotateQuadrant(boardCopy(board), move.rotation.quadrant, move.rotation.direction);
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
      setCurrentPlayer((prevPlayer) => (prevPlayer === 1 ? 2 : 1));
      setOpponentMove(prevNode.next.move);
      return prevNode.next;
    });
  };

  return (
    <div className="analysis">
      <GameBoard
        onMove={handleMove}
        currentPlayer={currentPlayer}
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
      {/* Add any other required elements, such as move history or analysis data */}
    </div>
  );
};

export default AnalysisPage;
