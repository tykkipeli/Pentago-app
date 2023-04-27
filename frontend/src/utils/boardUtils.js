/* global BigInt */


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

const placeMarble = (board, placement) => {
  const player = getCurrentPlayer(board);
  const newBoard = board.map((r, rowIndex) =>
    r.map((cell, colIndex) =>
      rowIndex === placement.row && colIndex === placement.col ? player : cell
    )
  );
  return newBoard;
};

const removeMarble = (board, placement) => {
  const newBoard = board.map((r, rowIndex) =>
    r.map((cell, colIndex) =>
      rowIndex === placement.row && colIndex === placement.col ? null : cell
    )
  );
  return newBoard;
};

const getPreviousBoard = (board, move) => {
  const reverseDirection = move.rotation.direction === 'cw' ? 'ccw' : 'cw';
  const newBoard = rotateQuadrant(board, move.rotation.quadrant, reverseDirection);
  return removeMarble(newBoard, move.placement);
};

const getNextBoard = (board, move) => {
  const newBoard = placeMarble(board, move.placement);
  return rotateQuadrant(newBoard, move.rotation.quadrant, move.rotation.direction);
};

const getCurrentPlayer = (board) => {
  let player1Marbles = 0;
  let player2Marbles = 0;

  board.forEach(row => {
    row.forEach(cell => {
      if (cell === 1) {
        player1Marbles++;
      } else if (cell === 2) {
        player2Marbles++;
      }
    });
  });

  return player1Marbles === player2Marbles ? 1 : 2;
};


const boardToBitboards = (board) => {
  let whiteBitboard = BigInt(0);
  let blackBitboard = BigInt(0);

  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 6; col++) {
      const position = row * 6 + col;
      if (board[row][col] === 1) {
        whiteBitboard |= BigInt(1) << BigInt(position);
      } else if (board[row][col] === 2) {
        blackBitboard |= BigInt(1) << BigInt(position);
      }
    }
  }

  return { whiteBitboard, blackBitboard };
};

const generateAllPossibleMoves = (board) => {
  const currentPlayer = getCurrentPlayer(board);
  const allMovesMap = new Map();

  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 6; col++) {
      if (board[row][col] === null) {
        for (let quadrant = 0; quadrant < 4; quadrant++) {
          for (const direction of ['cw', 'ccw']) {
            let newBoard = board.map((rowArr, rowIndex) =>
              rowArr.map((cell, colIndex) =>
                rowIndex === row && colIndex === col ? currentPlayer : cell
              )
            );
            newBoard = rotateQuadrant(newBoard, quadrant, direction);
            const { whiteBitboard, blackBitboard } = boardToBitboards(newBoard);
            const move = { placement: { row: row, col: col }, rotation: { quadrant, direction } };
            //allMovesMap.set(`${whiteBitboard.toString()},${blackBitboard.toString()}`, move);
            allMovesMap.set(`${whiteBitboard},${blackBitboard}`, move);
          }
        }
      }
    }
  }

  return allMovesMap;
};



export { rotateCW, rotateCCW, rotateQuadrant, boardToBitboards, generateAllPossibleMoves, getCurrentPlayer, getPreviousBoard, getNextBoard };
