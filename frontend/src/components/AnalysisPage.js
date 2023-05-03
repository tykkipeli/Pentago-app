/* global BigInt */
import React, { useState, useEffect } from 'react';
import GameBoard from './GameBoard';
import Node from './Node';
import { loadGameData, fetchNextPositions } from '../utils/api';
import { rotateQuadrant, getMoveFromBoards, boardToString, boardCopy } from '../utils/boardUtils';
import { generateAllPossibleMoves, boardToBitboards, getNextBoard, getPreviousBoard, removeMarble, bitboardsToBoard, } from '../utils/boardUtils';
import PositionItem from './PositionItem';
import { useParams } from 'react-router-dom';
import './AnalysisPage.css';

const AnalysisPage = () => {
  console.log("AnalysisPage is being renderedd");
  const [animationRunning, setAnimationRunning] = useState(false);
  const [board, setBoard] = useState(Array(6).fill(Array(6).fill(null)));
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [reverseMove, setReverseMove] = useState(null);
  const [opponentMove, setOpponentMove] = useState(null);
  const [currentNode, setCurrentNode] = useState(new Node(null));
  const [visitedNodes, setVisitedNodes] = useState(new Map());
  const [nextPositions, setNextPositions] = useState([]);
  const [currentAction, setCurrentAction] = useState({ type: null, placement: null, rotation: null });
  const [considerSymmetrical, setConsiderSymmetrical] = useState(false);
  const { gameId } = useParams();

  //TODO: Make sure to handle the situation where current action is incomplete
  const handleConsiderSymmetricalChange = (event) => {
    setConsiderSymmetrical(event.target.checked);
  };

  useEffect(() => {
    console.log("heree");
    fetchNextPositionsFromServer(board);
  }, [considerSymmetrical]);

  const fetchNextPositionsFromServer = async (newBoard) => {
    const nextPositionsMoves = await fetchNextPositions(newBoard, considerSymmetrical);
    setNextPositions(nextPositionsMoves);
  };
  /*
  const fetchNextPositionsFromServer = async (newBoard) => {
    const nextPositionsMoves = await fetchNextPositions(newBoard);
    setNextPositions(nextPositionsMoves);
  };
  */

  const initialBoardKey = boardToString(board);
  const initialNode = new Node(null);
  useEffect(() => {
    setCurrentNode(initialNode);
    setVisitedNodes((prevVisitedNodes) => {
      const newVisitedNodes = new Map(prevVisitedNodes);
      newVisitedNodes.set(initialBoardKey, initialNode);
      return newVisitedNodes;
    });
    //fetchNextPositionsFromServer(board);
  }, []);

  useEffect(() => {
    if (gameId) {
      loadGameData(gameId, initialNode).then((initialVisitedNodes) => {
        if (initialVisitedNodes) {
          setVisitedNodes(initialVisitedNodes);
        } else {
          console.log("Error: initialVisitedNodes is not defined");
        }
      });
    }
  }, [gameId]);


  useEffect(() => {
    //console.log(currentNode);
  }, [currentNode]);


  const handleMoveWithBoard = (move, newBoard) => {
    fetchNextPositionsFromServer(newBoard);
    const boardKey = boardToString(newBoard);

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

  const currentActionisIncomplete = () => {
    if (currentAction.placement) {
      setBoard((prevBoard) => {
        return removeMarble(prevBoard, currentAction.placement);
      });
      setCurrentAction({ type: null, placement: null, rotation: null });
      return true;
    }
    return false;
  };

  const handlePreviousMove = () => {
    if (animationRunning) {
      return;
    }
    if (currentActionisIncomplete()) {
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
    if (currentActionisIncomplete()) {
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
    if (currentActionisIncomplete()) {
      return;
    }
    handleMoveWithBoard(move, getNextBoard(board, move));
    setOpponentMove(move);
  };

  return (
    <div className="analysis">
      <div className="game-board-container">
        <GameBoard
          onMove={handleMove}
          opponentMove={opponentMove}
          isLocalPlayerTurn={true}
          reverseMove={reverseMove}
          board={board}
          setBoard={setBoard}
          animationRunning={animationRunning}
          setAnimationRunning={setAnimationRunning}
          currentAction={currentAction}
          setCurrentAction={setCurrentAction}
        />
        <div className="arrow-buttons">
          <button className="arrow-button" onClick={handlePreviousMove}>
            &larr;
          </button>
          <button className="arrow-button" onClick={handleNextMove}>
            &rarr;
          </button>
        </div>
      </div>
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
      <div className="consider-symmetrical">
        <label htmlFor="considerSymmetrical">
          <input
            type="checkbox"
            id="considerSymmetrical"
            checked={considerSymmetrical}
            onChange={handleConsiderSymmetricalChange}
          />
          Consider symmetrical positions equal
        </label>
      </div>
    </div>
  );
};

export default AnalysisPage;
