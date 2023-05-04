/* global BigInt */

import { bitboardsToBoard, getMoveFromBoards, boardToString, boardToBitboards, generateAllPossibleMoves } from './boardUtils';
import Node from '../components/Node';

const loadGameData = async (gameId, initialNode) => {
  try {
    const response = await fetch(`/api/games/${gameId}`);
    console.log('Server response:', response);
    const data = await response.json();
    console.log(data);

    if (response.ok) {
      // Parse the game data and update the visitedNodes state
      const positions = data.positions;

      const initialVisitedNodes = new Map();
      //initialVisitedNodes.set(boardToString(board), initialNode);
      let node = initialNode;
      let prevBoard = null;
      for (const position of positions) {
        const newBoard = bitboardsToBoard(BigInt(position.white_bitboard), BigInt(position.black_bitboard));
        if (prevBoard) {
          const move = getMoveFromBoards(prevBoard, newBoard);
          const newNode = new Node(move, node);
          node.next = newNode;
          node = newNode;
        }
        initialVisitedNodes.set(boardToString(newBoard), node);
        prevBoard = newBoard;
      }
      return initialVisitedNodes;
    } else {
      console.log('Error:', data.error);
      return null;
    }
  } catch (error) {
    console.error('Error fetching game data:', error);
    return null;
  }
};
/*
const fetchNextPositions = async (newBoard, considerSymmetrical) => {
  const { whiteBitboard, blackBitboard } = boardToBitboards(newBoard);
  try {
    const t0 = performance.now();
    const response = await fetch(`/api/positions/${whiteBitboard}/${blackBitboard}/${considerSymmetrical}`);
    const data = await response.json();
    const t1 = performance.now();
    const elapsed = t1 - t0;
    console.log("aika siirtojen hakemiseen, " + elapsed);
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
      const t2 = performance.now();
      const elapsed = t2 - t1;
      console.log("aika siirtojen laskemiseen, " + elapsed);
      return nextPositionsMoves;
    } else {
      console.log('Error:', data.error);
    }
  } catch (error) {
    console.error('Error fetching position information:', error);
  }
};
*/
const fetchNextPositions = async (newBoard, considerSymmetrical, filters) => {
  const { whiteBitboard, blackBitboard } = boardToBitboards(newBoard);
  const queryParams = new URLSearchParams(filters).toString();
  try {
    const t0 = performance.now();
    const response = await fetch(
      `/api/positions/${whiteBitboard}/${blackBitboard}/${considerSymmetrical}?${queryParams}`
    );
    const data = await response.json();
    const t1 = performance.now();
    const elapsed = t1 - t0;
    console.log("aika siirtojen hakemiseen, " + elapsed);
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
      const t2 = performance.now();
      const elapsed = t2 - t1;
      console.log("aika siirtojen laskemiseen, " + elapsed);
      return nextPositionsMoves;
    } else {
      console.log('Error:', data.error);
    }
  } catch (error) {
    console.error('Error fetching position information:', error);
  }
};

export {
  loadGameData, fetchNextPositions
};