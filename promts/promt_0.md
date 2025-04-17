# Promt 0
programá un tetris con html, css y javascript

## Tetris Game Implementation

I'll create a complete Tetris game implementation using HTML, CSS, and JavaScript. Here are the files:

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tetris Game</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <div class="game-info">
            <h1>TETRIS</h1>
            <div class="score-container">
                <p>Score: <span id="score">0</span></p>
                <p>Lines: <span id="lines">0</span></p>
                <p>Level: <span id="level">1</span></p>
            </div>
            <div class="next-piece-container">
                <p>Next Piece:</p>
                <div class="next-piece-preview" id="next-piece"></div>
            </div>
            <div class="controls-info">
                <p>Controls:</p>
                <ul>
                    <li>← → : Move</li>
                    <li>↑ : Rotate</li>
                    <li>↓ : Soft Drop</li>
                    <li>Space : Hard Drop</li>
                    <li>P : Pause</li>
                </ul>
            </div>
            <button id="start-button">Start / Pause</button>
        </div>
        <div class="game-board-container">
            <div class="game-board" id="board"></div>
        </div>
    </div>
    <div id="game-over-modal" class="modal">
        <div class="modal-content">
            <h2>Game Over!</h2>
            <p>Your score: <span id="final-score"></span></p>
            <button id="restart-button">Play Again</button>
        </div>
    </div>
    <script src="script.js"></script>
</body>
</html>
```

```css
/* style.css */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Arial', sans-serif;
    background-color: #2c3e50;
    color: #ecf0f1;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
}

.container {
    display: flex;
    gap: 20px;
}

.game-info {
    width: 200px;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.game-info h1 {
    text-align: center;
    color: #e74c3c;
    letter-spacing: 3px;
}

.score-container {
    background-color: #34495e;
    padding: 10px;
    border-radius: 5px;
}

.score-container p {
    margin: 5px 0;
}

.next-piece-container {
    background-color: #34495e;
    padding: 10px;
    border-radius: 5px;
}

.next-piece-preview {
    height: 80px;
    margin-top: 10px;
    background-color: #2c3e50;
    position: relative;
}

.controls-info {
    background-color: #34495e;
    padding: 10px;
    border-radius: 5px;
}

.controls-info ul {
    list-style-type: none;
    margin-top: 5px;
}

.controls-info li {
    margin-bottom: 3px;
}

button {
    padding: 10px;
    background-color: #e74c3c;
    border: none;
    border-radius: 5px;
    color: white;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.3s;
}

button:hover {
    background-color: #c0392b;
}

.game-board-container {
    border: 2px solid #7f8c8d;
    border-radius: 5px;
    padding: 2px;
    background-color: #34495e;
}

.game-board {
    width: 300px;
    height: 600px;
    display: grid;
    grid-template-rows: repeat(20, 1fr);
    grid-template-columns: repeat(10, 1fr);
    background-color: #2c3e50;
    gap: 1px;
}

.cell {
    width: 100%;
    height: 100%;
    border-radius: 2px;
}

.tetromino {
    border: 1px solid rgba(255, 255, 255, 0.3);
}

.preview {
    opacity: 0.5;
}

/* Tetromino Colors */
.I {
    background-color: #00f0f0;
}

.O {
    background-color: #f0f000;
}

.T {
    background-color: #a000f0;
}

.S {
    background-color: #00f000;
}

.Z {
    background-color: #f00000;
}

.J {
    background-color: #0000f0;
}

.L {
    background-color: #f0a000;
}

.modal {
    display: none;
    position: fixed;
    z-index: 1;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    justify-content: center;
    align-items: center;
}

.modal-content {
    background-color: #34495e;
    padding: 30px;
    border-radius: 10px;
    text-align: center;
    width: 300px;
}

.modal-content h2 {
    margin-bottom: 15px;
    color: #e74c3c;
}

.modal-content p {
    margin-bottom: 20px;
}

#restart-button {
    width: 100%;
}
```

```javascript
// script.js
document.addEventListener('DOMContentLoaded', () => {
    // Game configurations
    const BOARD_WIDTH = 10;
    const BOARD_HEIGHT = 20;
    const CELL_SIZE = 30;
    
    // Tetromino shapes and their rotations
    const TETROMINOES = {
        I: {
            shape: [
                [0, 0, 0, 0],
                [1, 1, 1, 1],
                [0, 0, 0, 0],
                [0, 0, 0, 0]
            ],
            color: 'I'
        },
        O: {
            shape: [
                [1, 1],
                [1, 1]
            ],
            color: 'O'
        },
        T: {
            shape: [
                [0, 1, 0],
                [1, 1, 1],
                [0, 0, 0]
            ],
            color: 'T'
        },
        S: {
            shape: [
                [0, 1, 1],
                [1, 1, 0],
                [0, 0, 0]
            ],
            color: 'S'
        },
        Z: {
            shape: [
                [1, 1, 0],
                [0, 1, 1],
                [0, 0, 0]
            ],
            color: 'Z'
        },
        J: {
            shape: [
                [1, 0, 0],
                [1, 1, 1],
                [0, 0, 0]
            ],
            color: 'J'
        },
        L: {
            shape: [
                [0, 0, 1],
                [1, 1, 1],
                [0, 0, 0]
            ],
            color: 'L'
        }
    };

    // DOM elements
    const board = document.getElementById('board');
    const scoreElement = document.getElementById('score');
    const linesElement = document.getElementById('lines');
    const levelElement = document.getElementById('level');
    const nextPieceElement = document.getElementById('next-piece');
    const startButton = document.getElementById('start-button');
    const gameOverModal = document.getElementById('game-over-modal');
    const finalScoreElement = document.getElementById('final-score');
    const restartButton = document.getElementById('restart-button');
    
    // Game state variables
    let grid = createGrid();
    let score = 0;
    let lines = 0;
    let level = 1;
    let gameInterval;
    let isPaused = false;
    let isGameOver = false;
    let currentPiece;
    let nextPiece;
    let ghostPiece;
    let dropSpeed = 1000; // Initial drop speed in ms

    // Create game board grid
    function createGrid() {
        const grid = [];
        for (let row = 0; row < BOARD_HEIGHT; row++) {
            grid.push(Array(BOARD_WIDTH).fill(null));
        }
        return grid;
    }

    // Initialize the game board UI
    function initializeBoard() {
        board.innerHTML = '';
        board.style.gridTemplateRows = `repeat(${BOARD_HEIGHT}, 1fr)`;
        board.style.gridTemplateColumns = `repeat(${BOARD_WIDTH}, 1fr)`;
        
        for (let row = 0; row < BOARD_HEIGHT; row++) {
            for (let col = 0; col < BOARD_WIDTH; col++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.row = row;
                cell.dataset.col = col;
                board.appendChild(cell);
            }
        }
    }

    // Initialize the next piece preview UI
    function initializeNextPiecePreview() {
        nextPieceElement.style.display = 'grid';
        nextPieceElement.style.gridTemplateRows = `repeat(4, 20px)`;
        nextPieceElement.style.gridTemplateColumns = `repeat(4, 20px)`;
        
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.row = row;
                cell.dataset.col = col;
                nextPieceElement.appendChild(cell);
            }
        }
    }

    // Get a random tetromino
    function getRandomTetromino() {
        const tetrominoNames = Object.keys(TETROMINOES);
        const randomName = tetrominoNames[Math.floor(Math.random() * tetrominoNames.length)];
        return {
            type: randomName,
            shape: TETROMINOES[randomName].shape,
            color: TETROMINOES[randomName].color,
            row: 0,
            col: Math.floor((BOARD_WIDTH - TETROMINOES[randomName].shape[0].length) / 2)
        };
    }

    // Draw a tetromino on the board
    function drawTetromino(tetromino, isGhost = false) {
        for (let row = 0; row < tetromino.shape.length; row++) {
            for (let col = 0; col < tetromino.shape[row].length; col++) {
                if (tetromino.shape[row][col]) {
                    const cellRow = tetromino.row + row;
                    const cellCol = tetromino.col + col;
                    
                    if (cellRow >= 0 && cellRow < BOARD_HEIGHT && cellCol >= 0 && cellCol < BOARD_WIDTH) {
                        const cell = document.querySelector(`.game-board .cell[data-row="${cellRow}"][data-col="${cellCol}"]`);
                        cell.classList.add('tetromino', tetromino.color);
                        if (isGhost) {
                            cell.classList.add('preview');
                        }
                    }
                }
            }
        }
    }

    // Draw next piece preview
    function drawNextPiecePreview() {
        // Clear previous preview
        const previewCells = nextPieceElement.querySelectorAll('.cell');
        previewCells.forEach(cell => {
            cell.className = 'cell';
        });
        
        // Center the tetromino in the preview
        const offsetRow = Math.floor((4 - nextPiece.shape.length) / 2);
        const offsetCol = Math.floor((4 - nextPiece.shape[0].length) / 2);
        
        // Draw next piece
        for (let row = 0; row < nextPiece.shape.length; row++) {
            for (let col = 0; col < nextPiece.shape[row].length; col++) {
                if (nextPiece.shape[row][col]) {
                    const previewRow = offsetRow + row;
                    const previewCol = offsetCol + col;
                    const cell = nextPieceElement.querySelector(`.cell[data-row="${previewRow}"][data-col="${previewCol}"]`);
                    if (cell) {
                        cell.classList.add('tetromino', nextPiece.color);
                    }
                }
            }
        }
    }

    // Clear the tetromino from the board
    function clearTetromino(tetromino) {
        for (let row = 0; row < tetromino.shape.length; row++) {
            for (let col = 0; col < tetromino.shape[row].length; col++) {
                if (tetromino.shape[row][col]) {
                    const cellRow = tetromino.row + row;
                    const cellCol = tetromino.col + col;
                    
                    if (cellRow >= 0 && cellRow < BOARD_HEIGHT && cellCol >= 0 && cellCol < BOARD_WIDTH) {
                        const cell = document.querySelector(`.game-board .cell[data-row="${cellRow}"][data-col="${cellCol}"]`);
                        cell.classList.remove('tetromino', tetromino.color, 'preview');
                    }
                }
            }
        }
    }

    // Check if a move is valid
    function isValidMove(tetromino) {
        for (let row = 0; row < tetromino.shape.length; row++) {
            for (let col = 0; col < tetromino.shape[row].length; col++) {
                if (tetromino.shape[row][col]) {
                    const cellRow = tetromino.row + row;
                    const cellCol = tetromino.col + col;
                    
                    // Check boundaries
                    if (cellRow >= BOARD_HEIGHT || cellCol < 0 || cellCol >= BOARD_WIDTH) {
                        return false;
                    }
                    
                    // Check collision with existing blocks
                    if (cellRow >= 0 && grid[cellRow][cellCol] !== null) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    // Update ghost piece (preview of where the piece will land)
    function updateGhostPiece() {
        // Clear previous ghost
        if (ghostPiece) {
            clearTetromino(ghostPiece);
        }
        
        // Create a deep copy of the current piece
        ghostPiece = {
            ...currentPiece,
            shape: JSON.parse(JSON.stringify(currentPiece.shape))
        };
        
        // Drop the ghost piece as far down as it can go
        while (isValidMove({ ...ghostPiece, row: ghostPiece.row + 1 })) {
            ghostPiece.row++;
        }
        
        // Only draw if the ghost is in a different position than the current piece
        if (ghostPiece.row !== currentPiece.row) {
            drawTetromino(ghostPiece, true);
        }
    }

    // Move the current tetromino
    function moveTetromino(direction) {
        if (isPaused || isGameOver) return;

        clearTetromino(currentPiece);
        if (ghostPiece) clearTetromino(ghostPiece);
        
        const newPosition = { ...currentPiece };
        
        switch (direction) {
            case 'left':
                newPosition.col -= 1;
                break;
            case 'right':
                newPosition.col += 1;
                break;
            case 'down':
                newPosition.row += 1;
                break;
        }
        
        if (isValidMove(newPosition)) {
            currentPiece = newPosition;
            updateGhostPiece();
            drawTetromino(currentPiece);
        } else if (direction === 'down') {
            // If we can't move down, lock the piece
            lockPiece();
        } else {
            // If we can't move left or right, just redraw
            updateGhostPiece();
            drawTetromino(currentPiece);
        }
    }

    // Hard drop the current tetromino
    function hardDrop() {
        if (isPaused || isGameOver) return;

        clearTetromino(currentPiece);
        if (ghostPiece) clearTetromino(ghostPiece);
        
        // Drop the piece as far down as it can go
        while (isValidMove({ ...currentPiece, row: currentPiece.row + 1 })) {
            currentPiece.row++;
            score += 1; // Add points for hard drop
        }
        
        updateScore();
        drawTetromino(currentPiece);
        lockPiece();
    }

    // Rotate the current tetromino
    function rotateTetromino() {
        if (isPaused || isGameOver) return;

        clearTetromino(currentPiece);
        if (ghostPiece) clearTetromino(ghostPiece);
        
        const rotated = {
            ...currentPiece,
            shape: rotateMatrix(currentPiece.shape)
        };
        
        // Try normal rotation
        if (isValidMove(rotated)) {
            currentPiece = rotated;
        } 
        // Wall kick - try offset if rotation failed
        else {
            // Try offsetting to the left
            rotated.col -= 1;
            if (isValidMove(rotated)) {
                currentPiece = rotated;
            } else {
                // Try offsetting to the right
                rotated.col += 2;
                if (isValidMove(rotated)) {
                    currentPiece = rotated;
                }
                // If all fails, don't rotate
            }
        }
        
        updateGhostPiece();
        drawTetromino(currentPiece);
    }

    // Helper function to rotate a matrix (2D array)
    function rotateMatrix(matrix) {
        const n = matrix.length;
        const rotated = Array(n).fill().map(() => Array(n).fill(0));
        
        for (let row = 0; row < n; row++) {
            for (let col = 0; col < n; col++) {
                rotated[col][n - 1 - row] = matrix[row][col];
            }
        }
        
        return rotated;
    }

    // Lock the piece in place and check for line clears
    function lockPiece() {
        // Add the tetromino to the grid
        for (let row = 0; row < currentPiece.shape.length; row++) {
            for (let col = 0; col < currentPiece.shape[row].length; col++) {
                if (currentPiece.shape[row][col]) {
                    const gridRow = currentPiece.row + row;
                    const gridCol = currentPiece.col + col;
                    
                    if (gridRow >= 0) {
                        grid[gridRow][gridCol] = currentPiece.color;
                    } else {
                        // Game over - piece locked outside visible area
                        gameOver();
                        return;
                    }
                }
            }
        }
        
        // Check for completed lines
        checkForLines();
        
        // Create next piece
        spawnNewPiece();
    }

    // Check and clear completed lines
    function checkForLines() {
        let linesCleared = 0;
        
        for (let row = BOARD_HEIGHT - 1; row >= 0; row--) {
            if (grid[row].every(cell => cell !== null)) {
                // Remove the completed line
                grid.splice(row, 1);
                // Add a new empty line at the top
                grid.unshift(Array(BOARD_WIDTH).fill(null));
                linesCleared++;
                
                // Since we removed a line, we need to check the same row again
                row++;
            }
        }
        
        // Update score based on lines cleared
        if (linesCleared > 0) {
            updateLines(linesCleared);
            redrawBoard();
        }
    }

    // Redraw the entire board based on the grid state
    function redrawBoard() {
        const cells = board.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.className = 'cell';
        });
        
        for (let row = 0; row < BOARD_HEIGHT; row++) {
            for (let col = 0; col < BOARD_WIDTH; col++) {
                const color = grid[row][col];
                if (color) {
                    const cell = document.querySelector(`.game-board .cell[data-row="${row}"][data-col="${col}"]`);
                    cell.classList.add('tetromino', color);
                }
            }
        }
    }

    // Spawn a new tetromino
    function spawnNewPiece() {
        if (nextPiece) {
            currentPiece = {
                ...nextPiece,
                row: 0,
                col: Math.floor((BOARD_WIDTH - nextPiece.shape[0].length) / 2)
            };
        } else {
            currentPiece = getRandomTetromino();
        }
        
        nextPiece = getRandomTetromino();
        drawNextPiecePreview();
        
        // Check if game over (can't place new piece)
        if (!isValidMove(currentPiece)) {
            gameOver();
            return;
        }
        
        updateGhostPiece();
        drawTetromino(currentPiece);
    }

    // Update score
    function updateScore(points = 0) {
        score += points;
        scoreElement.textContent = score;
    }

    // Update lines and level
    function updateLines(linesCleared) {
        // Points for cleared lines (more points for more lines at once)
        const pointsPerLine = [0, 100, 300, 500, 800]; // 0, 1, 2, 3, 4 lines
        const linePoints = pointsPerLine[linesCleared] * level;
        
        updateScore(linePoints);
        lines += linesCleared;
        linesElement.textContent = lines;
        
        // Update level every 10 lines
        const newLevel = Math.floor(lines / 10) + 1;
        if (newLevel > level) {
            level = newLevel;
            levelElement.textContent = level;
            
            // Increase speed with level
            dropSpeed = Math.max(100, 1000 - (level - 1) * 100);
            clearInterval(gameInterval);
            gameInterval = setInterval(gameLoop, dropSpeed);
        }
    }

    // Game loop - move the tetromino down one step
    function gameLoop() {
        if (!isPaused && !isGameOver) {
            moveTetromino('down');
        }
    }

    // Game over
    function gameOver() {
        isGameOver = true;
        clearInterval(gameInterval);
        finalScoreElement.textContent = score;
        gameOverModal.style.display = 'flex';
    }

    // Start/reset the game
    function startGame() {
        // Reset game state
        isGameOver = false;
        isPaused = false;
        score = 0;
        lines = 0;
        level = 1;
        grid = createGrid();
        dropSpeed = 1000;
        
        // Reset UI
        scoreElement.textContent = '0';
        linesElement.textContent = '0';
        levelElement.textContent = '1';
        
        // Clear the board
        redrawBoard();
        gameOverModal.style.display = 'none';
        
        // Initialize new pieces
        nextPiece = getRandomTetromino();
        drawNextPiecePreview();
        spawnNewPiece();
        
        // Start the game loop
        clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, dropSpeed);
    }

    // Toggle pause
    function togglePause() {
        if (isGameOver) return;
        
        isPaused = !isPaused;
        startButton.textContent = isPaused ? 'Resume' : 'Pause';
    }

    // Initialize the game
    function initialize() {
        initializeBoard();
        initializeNextPiecePreview();
        
        // Event listeners
        document.addEventListener('keydown', e => {
            if (isGameOver) return;
            
            switch (e.key) {
                case 'ArrowLeft':
                    moveTetromino('left');
                    break;
                case 'ArrowRight':
                    moveTetromino('right');
                    break;
                case 'ArrowDown':
                    moveTetromino('down');
                    break;
                case 'ArrowUp':
                    rotateTetromino();
                    break;
                case ' ':
                    hardDrop();
                    break;
                case 'p':
                case 'P':
                    togglePause();
                    break;
            }
        });
        
        startButton.addEventListener('click', () => {
            if (isGameOver || !gameInterval) {
                startGame();
            } else {
                togglePause();
            }
        });
        
        restartButton.addEventListener('click', startGame);
    }

    // Start the game initialization
    initialize();
});
```

### How to Use

1. Create three files: `index.html`, `style.css`, and `script.js` with the code provided above.

2. Open the `index.html` file in your web browser.

3. Click the "Start / Pause" button to begin the game.

4. Use the following controls:
   - Left/Right Arrow: Move piece horizontally
   - Up Arrow: Rotate piece
   - Down Arrow: Soft drop (faster descent)
   - Space: Hard drop (instant placement)
   - P: Pause/Resume game

The game features:
- Score tracking
- Level progression (speed increases)
- Next piece preview
- Ghost piece to show where the current piece will land
- Game over detection with restart option

Enjoy playing your Tetris game!

### Testing comments
- Esta versión del juego no funcionaba correctamente porque las piezas no se apilaban.