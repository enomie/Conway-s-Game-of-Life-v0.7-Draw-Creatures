// Conway's Game of Life (v0.7)

const container = document.getElementById('container');
const playBtn = document.getElementById('playBtn');
const resetBtn = document.getElementById('resetBtn');
const speedControl = document.getElementById('speedControl');
const iterationCounter = document.getElementById('iterationCounter');

let grid = [], previousGridStates = [];
let isPlaying = false, intervalId, isDrawing = false, shouldCount = true;
let numRows, numCols, iterations = 0, speed = parseInt(speedControl.value);

// Adjust grid dimensions based on available space
function adjustGridSize() {
  const containerHeight = window.innerHeight - document.querySelector('.header').offsetHeight - document.querySelector('.controls').offsetHeight;
  numCols = Math.floor(window.innerWidth / 20);
  numRows = Math.floor(containerHeight / 20);
  container.style.gridTemplateColumns = `repeat(${numCols}, 20px)`;
  container.style.gridTemplateRows = `repeat(${numRows}, 20px)`;
}

// Create grid and attach necessary event listeners
function createGrid() {
  grid = Array.from({ length: numRows }, () => Array(numCols).fill(0));
  previousGridStates = [];
  shouldCount = true;
  container.innerHTML = '';

  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.addEventListener('mousedown', () => toggleDrawing(i, j));
      cell.addEventListener('mouseenter', () => isDrawing && toggleCell(i, j));
      container.appendChild(cell);
    }
  }
}

// Toggle drawing mode for grid cells
function toggleDrawing(row, col) {
  isDrawing = true;
  toggleCell(row, col);
  document.addEventListener('mouseup', () => (isDrawing = false), { once: true });
}

// Toggle a specific cell's state
function toggleCell(row, col) {
  const cell = container.children[row * numCols + col];
  grid[row][col] = grid[row][col] ? 0 : 1;
  cell.classList.toggle('active', grid[row][col]);
}

// Start or pause the game simulation
function playGame() {
  isPlaying = !isPlaying;
  playBtn.textContent = isPlaying ? 'Pause' : 'Play';
  isPlaying ? (intervalId = setInterval(updateGrid, speed)) : clearInterval(intervalId);
}

// Reset the game grid and states
function resetGame() {
  clearInterval(intervalId);
  isPlaying = false;
  playBtn.textContent = 'Play';
  iterations = 0;
  iterationCounter.textContent = iterations;
  createGrid();
}

// Update the grid according to Game of Life rules
function updateGrid() {
  const newGrid = grid.map((row, rowIndex) =>
    row.map((cell, colIndex) => {
      const neighbors = countNeighbors(rowIndex, colIndex);
      return cell === 1 ? (neighbors === 2 || neighbors === 3 ? 1 : 0) : neighbors === 3 ? 1 : 0;
    })
  );

  const changes = newGrid.some((row, i) => row.some((cell, j) => cell !== grid[i][j]));

  if (!changes || isOscillating(newGrid)) shouldCount = false;

  grid = newGrid;
  renderGrid();
  if (shouldCount) iterationCounter.textContent = ++iterations;
  saveGridState(grid);
}

// Count the living neighbors of a cell
function countNeighbors(row, col) {
  return [-1, 0, 1]
    .flatMap(i => [-1, 0, 1].map(j => (i === 0 && j === 0 ? 0 : grid[(row + i + numRows) % numRows][(col + j + numCols) % numCols])))
    .reduce((acc, cur) => acc + cur, 0);
}

// Render the grid
function renderGrid() {
  grid.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      const div = container.children[rowIndex * numCols + colIndex];
      div.classList.toggle('active', cell === 1);
    });
  });
}

// Check if the grid is oscillating (repeat of previous states)
function isOscillating(newGrid) {
  return previousGridStates.length >= 3 && previousGridStates.some(state => compareGrids(newGrid, state));
}

// Save the current grid state, keeping only the last 3 states
function saveGridState(currentGrid) {
  if (previousGridStates.length >= 3) previousGridStates.shift();
  previousGridStates.push(copyGrid(currentGrid));
}

// Compare two grids
function compareGrids(grid1, grid2) {
  return grid1.every((row, i) => row.every((cell, j) => cell === grid2[i][j]));
}

// Deep copy the grid to avoid reference issues
function copyGrid(gridToCopy) {
  return gridToCopy.map(row => [...row]);
}

// Event listener for speed control
speedControl.addEventListener('input', () => {
  speed = parseInt(speedControl.value);
  if (isPlaying) {
    clearInterval(intervalId);
    intervalId = setInterval(updateGrid, speed);
  }
});

// Event listener for resizing the window
window.addEventListener('resize', () => {
  adjustGridSize();
  createGrid();
});

// Initial setup
adjustGridSize();
createGrid();
playBtn.addEventListener('click', playGame);
resetBtn.addEventListener('click', resetGame);
