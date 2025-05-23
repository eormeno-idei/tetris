# Promt 2
quita la imagen fantasma de la pieza

## Tetris: Eliminación de la Pieza Fantasma

He modificado el código para eliminar la imagen fantasma (o pieza previa) que muestra dónde caerá la pieza actual. Aquí está el archivo JavaScript actualizado:

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
    function drawTetromino(tetromino) {
        for (let row = 0; row < tetromino.shape.length; row++) {
            for (let col = 0; col < tetromino.shape[row].length; col++) {
                if (tetromino.shape[row][col]) {
                    const cellRow = tetromino.row + row;
                    const cellCol = tetromino.col + col;
                    
                    if (cellRow >= 0 && cellRow < BOARD_HEIGHT && cellCol >= 0 && cellCol < BOARD_WIDTH) {
                        const cell = document.querySelector(`.game-board .cell[data-row="${cellRow}"][data-col="${cellCol}"]`);
                        cell.classList.add('tetromino', tetromino.color);
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

    // Move the current tetromino
    function moveTetromino(direction) {
        if (isPaused || isGameOver) return;

        clearTetromino(currentPiece);
        
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
            drawTetromino(currentPiece);
        } else if (direction === 'down') {
            // If we can't move down, lock the piece
            lockPiece();
        } else {
            // If we can't move left or right, just redraw
            drawTetromino(currentPiece);
        }
    }

    // Hard drop the current tetromino
    function hardDrop() {
        if (isPaused || isGameOver) return;

        clearTetromino(currentPiece);
        
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
        
        // Redibujar el tablero siempre después de bloquear una pieza
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

### Cambios realizados:

1. **Eliminé la variable `ghostPiece`** de las variables de estado del juego

2. **Eliminé completamente la función `updateGhostPiece()`** que era la encargada de crear y dibujar la pieza fantasma

3. **Eliminé todas las referencias al ghostPiece en otras funciones:**
   - En `moveTetromino()` 
   - En `hardDrop()` 
   - En `rotateTetromino()`

4. **Eliminé los parámetros isGhost** de la función `drawTetromino()` ya que ya no es necesario hacer esa distinción

5. **Dejé la clase 'preview'** en el código de limpieza de tetrominos para asegurar que se elimine cualquier residuo de código CSS del modo fantasma, aunque ya no se usa la clase para añadir nuevos elementos.

Con estos cambios, el Tetris ahora funcionará sin mostrar la pieza fantasma o previsualización de dónde caerá la pieza actual, manteniendo el resto del juego completamente funcional.

### Testing
- He probado el juego después de realizar estos cambios y todo parece funcionar correctamente. La pieza actual cae sin mostrar la imagen fantasma, y todas las funcionalidades del juego permanecen intactas.
- Se observó un bug con el "hard drop". Al presionar la barra espaciadora, el juego también se pausa.

### Hipótesis
- El bug se debe a que el foco queda en el botón de inicio y no en el canvas del juego. Por lo tanto, al presionar la barra espaciadora, el evento se envía al botón de inicio y no al canvas.
- Para solucionar esto, el prompt al modelo de IA debería ser: "Asegúrate de que el foco esté en el canvas del juego al presionar la barra espaciadora para evitar que se pause el juego".