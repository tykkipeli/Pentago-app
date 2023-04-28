import { generateAllPossibleMoves } from '../utils/boardUtils';

self.onmessage = (event) => {
  const { newBoard } = event.data;
  const allMovesMap = generateAllPossibleMoves(newBoard);
  self.postMessage({ allMovesMap });
};


/*
first install this: npm install worker-loader --save-dev

import React, { useState, useEffect } from 'react';
import GameBoard from './GameBoard';
import Node from './Node';
import { rotateQuadrant } from '../utils/boardUtils';
import { boardToBitboards, getNextBoard, getPreviousBoard } from '../utils/boardUtils';
import PositionItem from './PositionItem';
// Import the worker
import Worker from 'worker-loader!./worker'; // Use worker-loader

// ...

const AnalysisPage = () => {
  // ...

  // Instantiate the Web Worker
  const worker = new Worker();

  // Listen for messages from the worker
  worker.onmessage = (event) => {
    const { allMovesMap } = event.data;
    // Rest of the processing
    const nextPositionsMoves = nextPositions.map((position) => {
      const key = `${position.white_bb},${position.black_bb}`;
      return {
        ...position,
        move: allMovesMap.get(key),
      };
    });
    setNextPositions(nextPositionsMoves);
  };

  const fetchNextPositionsFromServer = async (newBoard) => {
    const { whiteBitboard, blackBitboard } = boardToBitboards(newBoard);
    console.log(whiteBitboard, blackBitboard);
    console.table(newBoard);
    try {
      const response = await fetch(`/api/positions/${whiteBitboard}/${blackBitboard}`);
      const data = await response.json();
      if (response.ok) {
        // Send a message to the worker with the data required for the calculation
        worker.postMessage({ newBoard });
        nextPositions = data.next_positions;
      } else {
        console.log('Error:', data.error);
      }
    } catch (error) {
      console.error('Error fetching position information:', error);
    }
  };

  // ...
};
*/