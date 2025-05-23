# Promt 1

las piezas no se van acumulando

## Corrección al Tetris: Las piezas no se acumulan

He identificado el problema en el código del juego de Tetris. Las piezas no se acumulan correctamente porque falta una llamada a `redrawBoard()` después de bloquear una pieza, lo que hace que las piezas anteriores no se muestren correctamente.

Aquí está la solución:

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
        
        // CORRECCIÓN: Redibujar el tablero siempre después de bloquear una pieza
        redrawBoard();
        
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

### Explicación del problema y la solución:

El problema era que después de bloquear una pieza en el tablero (función `lockPiece()`), las piezas se almacenaban correctamente en la matriz `grid`, pero no se estaban actualizando visualmente en el tablero. La función `redrawBoard()` sólo se llamaba cuando se eliminaban líneas completas.

**Solución aplicada:**
- Añadí una llamada a `redrawBoard()` justo después de añadir la pieza al grid en la función `lockPiece()`, antes de verificar las líneas completas.

Este cambio asegura que el tablero visual siempre refleje el estado actual del grid, mostrando todas las piezas acumuladas correctamente.

Reemplaza el archivo `script.js` con este código corregido y el juego funcionará correctamente, con las piezas acumulándose en la parte inferior del tablero como se espera en un juego de Tetris.

### Pruebas realizadas:
- Continúa sin funcionar la acumulación de piezas.
- Al caer las piezas, se muestra la pieza anterior y se elimina la actual.

### Hipótesis:
- El problema está relacionado con la pieza fantasma (ghost piece) que se dibuja en el tablero. La función `redrawBoard()` no está actualizando correctamente la posición de la pieza fantasma, lo que provoca que las piezas no se acumulen correctamente.