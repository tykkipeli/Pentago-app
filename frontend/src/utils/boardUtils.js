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

export { rotateCW, rotateCCW, rotateQuadrant };
