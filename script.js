document.addEventListener('DOMContentLoaded', () => {
    // Game configurations
    const BOARD_WIDTH = 12; // Cambiado de 20 a 12
    const BOARD_HEIGHT = 15;
    const CELL_SIZE = 30;

    // Debug mode
    let debugGridEnabled = false;

    // Player animation configurations
    const PLAYER_SPRITE_SIZE = 128; // 128x128 píxeles por sprite
    // Ajustamos la escala para que el personaje sea del mismo tamaño que un bloque (caja)
    const PLAYER_SCALE = CELL_SIZE / PLAYER_SPRITE_SIZE;
    const PLAYER_WIDTH = CELL_SIZE;
    const PLAYER_HEIGHT = CELL_SIZE;
    const ANIMATION_SPEED = 100; // Milisegundos por frame

    // Animación del personaje
    const PLAYER_ANIMATIONS = {
        IDLE: 0,
        SQUASHED: 1,
        WALKING_RIGHT: 2,
        WALKING_LEFT: 3,
        JUMPING_RIGHT: 4, 
        JUMPING_LEFT: 5,
        PUSHING_RIGHT: 6,
        PUSHING_LEFT: 7,
        PULLING_RIGHT: 8,
        PULLING_LEFT: 9
    };

    // Tetromino shapes and their rotations
    const TETROMINOES = {
        C: {
            shape: [
                [1],
            ],
            color: 'C'
        },
    };

    // DOM elements
    const board = document.getElementById('board');
    const scoreElement = document.getElementById('score');
    const linesElement = document.getElementById('lines');
    const levelElement = document.getElementById('level');
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
    let referenceSpeed = 500; // Reference speed for level calculation
    let speedIncrement = 100; // Speed increment per level
    let dropSpeed = referenceSpeed; // Initial drop speed in ms

    // Player state variables
    let player = {
        col: Math.floor(BOARD_WIDTH / 2), // Columna de la cuadrícula (posición horizontal)
        row: 0, // Fila de la cuadrícula (posición vertical)
        x: 0, // Posición actual en píxeles para movimiento suave
        y: 0, // Posición actual en píxeles para movimiento suave
        targetX: 0, // Posición objetivo en píxeles
        targetY: 0, // Posición objetivo en píxeles
        width: PLAYER_WIDTH,
        height: PLAYER_HEIGHT,
        speed: 3, // Velocidad reducida a 3 (antes era 6) para un movimiento más lento
        jumpForce: 10,
        gravity: 0.5,
        velocityY: 0,
        isJumping: false,
        isPushing: false,
        isPulling: false,
        isMovingLeft: false,
        isMovingRight: false,
        facingRight: true,
        currentAnimation: PLAYER_ANIMATIONS.IDLE,
        currentFrame: 0,
        frameCount: 6, // 6 frames por animación
        frameTimer: 0,
        moveTimer: 0,        
        moveDelay: 200,      // Aumentado a 200ms para que haya más tiempo entre movimientos de celda
        lastDirection: null  // Recordar la última dirección para movimiento continuo
    };

    // Create audio elements for row clear sounds
    const lineClearSound = new Audio();
    lineClearSound.src = 'sounds/mixkit-winning-a-coin-video-game-2069.wav';
    lineClearSound.volume = 0.5; // Adjust volume as needed

    const tetrisSound = new Audio();
    tetrisSound.src = 'sounds/mixkit-game-bonus-reached-2065.wav';
    tetrisSound.volume = 0.6; // Slightly louder for the special tetris clear

    // Create game over sound
    const gameOverSound = new Audio();
    gameOverSound.src = 'sounds/mixkit-funny-fail-low-tone-2876.wav';
    gameOverSound.volume = 0.7; // Adjust volume as needed

    // Guardar referencias DOM para evitar búsquedas repetitivas
    let playerElement;
    let boardElement;
    let cellElements = [];

    // Create player element
    function createPlayer() {
        playerElement = document.createElement('div');
        playerElement.id = 'player';
        playerElement.style.position = 'absolute';
        playerElement.style.width = `${PLAYER_WIDTH}px`;
        playerElement.style.height = `${PLAYER_HEIGHT}px`;
        playerElement.style.backgroundImage = 'url("sprites/player-tileset.png")';
        playerElement.style.backgroundSize = `${PLAYER_SPRITE_SIZE * 6 * PLAYER_SCALE}px ${PLAYER_SPRITE_SIZE * 10 * PLAYER_SCALE}px`;
        playerElement.style.zIndex = '10';
        updatePlayerSprite();
        return playerElement;
    }

    // Update player sprite based on the current animation and frame
    function updatePlayerSprite() {
        if (playerElement) {
            // Calcular coordenadas del sprite
            const col = player.currentFrame;
            const row = player.currentAnimation;
            
            // Actualizar la posición del background para mostrar el sprite correcto
            playerElement.style.backgroundPosition = 
                `-${col * PLAYER_SPRITE_SIZE * PLAYER_SCALE}px -${row * PLAYER_SPRITE_SIZE * PLAYER_SCALE}px`;
            
            // Actualizar posición del jugador en la pantalla con píxeles para movimiento suave
            playerElement.style.left = `${player.x}px`;
            playerElement.style.top = `${player.y}px`;
        }
    }

    // Actualizar animación del personaje basado en su estado
    function updatePlayerAnimation() {
        // Determinar la animación correcta según el estado del jugador
        if (player.isJumping) {
            player.currentAnimation = player.facingRight ? 
                PLAYER_ANIMATIONS.JUMPING_RIGHT : 
                PLAYER_ANIMATIONS.JUMPING_LEFT;
        } else if (player.isPushing) {
            player.currentAnimation = player.facingRight ? 
                PLAYER_ANIMATIONS.PUSHING_RIGHT : 
                PLAYER_ANIMATIONS.PUSHING_LEFT;
        } else if (player.isPulling) {
            player.currentAnimation = player.facingRight ? 
                PLAYER_ANIMATIONS.PULLING_RIGHT : 
                PLAYER_ANIMATIONS.PULLING_LEFT;
        } else if (player.isMovingLeft) {
            player.currentAnimation = PLAYER_ANIMATIONS.WALKING_LEFT;
            player.facingRight = false;
        } else if (player.isMovingRight) {
            player.currentAnimation = PLAYER_ANIMATIONS.WALKING_RIGHT;
            player.facingRight = true;
        } else {
            player.currentAnimation = PLAYER_ANIMATIONS.IDLE;
        }

        // Actualizar frame de animación
        player.frameTimer += 16; // Asumimos aproximadamente 60fps
        if (player.frameTimer >= ANIMATION_SPEED) {
            player.currentFrame = (player.currentFrame + 1) % player.frameCount;
            player.frameTimer = 0;
        }

        updatePlayerSprite();
    }

    // Handle player movement - optimizado para reducir cálculos redundantes
    function handlePlayerMovement() {
        // Verificaciones para reducir cálculos innecesarios
        if (!player || isPaused || isGameOver) return;
        
        // Actualizar las posiciones objetivo basadas en la cuadrícula y la dirección actual
        const isAtHorizontalTarget = Math.abs(player.x - player.targetX) < player.speed;
        
        // Si estamos cerca del objetivo, podemos actualizar la posición de la cuadrícula
        if (isAtHorizontalTarget) {
            let moved = false;

            // Verificar si estamos empujando o jalando cajas
            if (player.isPushing) {
                moved = handlePushBox();
            } else if (player.isPulling) {
                moved = handlePullBox();
            } 
            
            // Si no se movió ninguna caja con push/pull, intentamos mover solo al personaje
            if (!moved) {
                // Comprobar si hay una caja en la celda de destino antes de moverse
                if (player.isMovingLeft && player.col > 0) {
                    // Verificar si la celda a la izquierda está vacía
                    if (!isCellOccupied(player.row, player.col - 1)) {
                        player.col -= 1;
                        player.lastDirection = 'left';
                    }
                } else if (player.isMovingRight && player.col < BOARD_WIDTH - 1) {
                    // Verificar si la celda a la derecha está vacía
                    if (!isCellOccupied(player.row, player.col + 1)) {
                        player.col += 1;
                        player.lastDirection = 'right';
                    }
                }
            }
        }
        
        // Actualizar las posiciones objetivo para el movimiento horizontal
        player.targetX = player.col * CELL_SIZE;
        
        // Movimiento suave hacia la posición objetivo horizontal
        if (player.x < player.targetX) {
            player.x += player.speed;
            if (player.x > player.targetX) player.x = player.targetX; // Evitar overshooting
        } else if (player.x > player.targetX) {
            player.x -= player.speed;
            if (player.x < player.targetX) player.x = player.targetX; // Evitar overshooting
        }
        
        // Manejar el movimiento vertical de forma independiente al horizontal
        handleVerticalMovement();
        
        updatePlayerAnimation();
    }
    
    // Función independiente para manejar el movimiento vertical (salto y caída)
    function handleVerticalMovement() {
        // Aplicar gravedad siempre
        if (player.isJumping) {
            // Aplicar velocidad vertical sin restricciones de la cuadrícula para un salto más fluido
            player.velocityY += player.gravity;
            
            // Calcular la siguiente posición en píxeles directamente
            const nextY = player.y + player.velocityY;
            const nextRow = Math.floor(nextY / CELL_SIZE);
            
            // Verificar colisiones verticales con cajas
            if (player.velocityY > 0) { // Solo verificamos colisiones cuando caemos
                // Verificar si hay una caja debajo
                if (nextRow < BOARD_HEIGHT && isCellOccupied(nextRow, player.col)) {
                    // Hay una caja debajo, detener en la celda justo encima de la caja
                    player.row = nextRow - 1;
                    player.y = player.row * CELL_SIZE;
                    player.isJumping = false;
                    player.velocityY = 0;
                    return;
                }
            }
            
            // Si no hay colisión, aplicar el movimiento
            player.y = nextY;
            player.row = Math.floor(player.y / CELL_SIZE);
            
            // Verificar si llegó al suelo
            if (player.y >= (BOARD_HEIGHT - 1) * CELL_SIZE) {
                player.y = (BOARD_HEIGHT - 1) * CELL_SIZE;
                player.row = BOARD_HEIGHT - 1;
                player.isJumping = false;
                player.velocityY = 0;
            }
        } 
        // Si no está saltando pero no está en el suelo o en una caja, aplicar gravedad
        else if (player.row < BOARD_HEIGHT - 1) {
            const cellBelow = player.row + 1;
            
            // Verificar si hay suelo o una caja debajo
            if (cellBelow >= BOARD_HEIGHT || isCellOccupied(cellBelow, player.col)) {
                // Ya está sobre algo sólido, mantener posición
                player.y = player.row * CELL_SIZE;
            } else {
                // No hay nada debajo, aplicar caída
                player.isJumping = true;
                player.velocityY = 1; // Velocidad inicial pequeña para caída
            }
        }
        
        // Actualizar posición objetivo vertical
        player.targetY = player.row * CELL_SIZE;
    }

    // Función para verificar si una celda está ocupada por una caja
    function isCellOccupied(row, col) {
        // Verificar que la celda está dentro de los límites
        if (row < 0 || row >= BOARD_HEIGHT || col < 0 || col >= BOARD_WIDTH) {
            return false;
        }
        
        // Verificar si hay una caja en esta celda
        return grid[row][col] === 'C'; // 'C' es el identificador de las cajas
    }

    // Función para verificar si una caja tiene otra caja encima
    function hasBoxAbove(row, col) {
        // Si es la fila superior, no puede tener nada encima
        if (row <= 0) return false;
        
        // Verificar si hay una caja en la celda superior
        return grid[row - 1][col] === 'C';
    }

    // Función para manejar el empuje de cajas
    function handlePushBox() {
        let targetCol = player.col;
        let boxCol = player.col;
        let targetBoxCol = player.col;
        
        if (player.isMovingLeft && player.col > 0) {
            targetCol = player.col - 1;
            boxCol = player.col - 1;
            targetBoxCol = player.col - 2;
        } else if (player.isMovingRight && player.col < BOARD_WIDTH - 1) {
            targetCol = player.col + 1;
            boxCol = player.col + 1;
            targetBoxCol = player.col + 2;
        } else {
            return false; // No hay intención de mover horizontalmente
        }
        
        // Verificar si hay una caja en la dirección del movimiento
        if (isCellOccupied(player.row, boxCol)) {
            // Verificar si la caja tiene otra caja encima (no se puede mover)
            if (hasBoxAbove(player.row, boxCol)) {
                return false; // No se puede empujar una caja que tiene otra caja encima
            }
            
            // Verificar si hay espacio para empujar la caja
            if (targetBoxCol >= 0 && targetBoxCol < BOARD_WIDTH && !isCellOccupied(player.row, targetBoxCol)) {
                // Mover la caja
                grid[player.row][targetBoxCol] = grid[player.row][boxCol];
                grid[player.row][boxCol] = null;
                
                // Mover al personaje a la posición donde estaba la caja
                player.col = targetCol;
                
                // Actualizar el tablero visualmente
                redrawBoard();
                
                // Aplicar gravedad a la caja que se acaba de mover
                applyGravityToBoxes();
                
                return true;
            }
        }
        
        return false;
    }

    // Función para manejar el jalado de cajas
    function handlePullBox() {
        let targetCol = player.col;
        let boxCol = player.col;
        let targetPlayerCol = player.col;
        
        if (player.isMovingLeft && player.col > 0) {
            targetCol = player.col - 1;
            boxCol = player.col + 1;
            targetPlayerCol = player.col - 1;
        } else if (player.isMovingRight && player.col < BOARD_WIDTH - 1) {
            targetCol = player.col + 1;
            boxCol = player.col - 1;
            targetPlayerCol = player.col + 1;
        } else {
            return false; // No hay intención de mover horizontalmente
        }
        
        // Verificar si hay una caja detrás del personaje para jalar
        if (boxCol >= 0 && boxCol < BOARD_WIDTH && isCellOccupied(player.row, boxCol)) {
            // Verificar si la caja tiene otra caja encima (no se puede mover)
            if (hasBoxAbove(player.row, boxCol)) {
                return false; // No se puede jalar una caja que tiene otra caja encima
            }
            
            // Verificar si hay espacio para moverse el personaje
            if (targetPlayerCol >= 0 && targetPlayerCol < BOARD_WIDTH && !isCellOccupied(player.row, targetPlayerCol)) {
                // Mover la caja a la posición actual del personaje
                grid[player.row][player.col] = grid[player.row][boxCol];
                grid[player.row][boxCol] = null;
                
                // Mover al personaje a la nueva posición
                player.col = targetPlayerCol;
                
                // Actualizar el tablero visualmente
                redrawBoard();
                
                // Aplicar gravedad a la caja que se acaba de mover
                applyGravityToBoxes();
                
                return true;
            }
        }
        
        return false;
    }

    // Variables para el sistema de animación de cajas
    let animatingBoxes = false;
    const boxAnimationSpeed = 300; // Velocidad de la animación de caída en milisegundos

    // Función para aplicar gravedad a las cajas - versión corregida para evitar parpadeo
    function applyGravityToBoxes() {
        if (animatingBoxes) return; // Si ya hay una animación en curso, no iniciar otra
        
        // Crear una copia del estado actual del grid para análisis
        const gridCopy = grid.map(row => [...row]);
        let boxesInfo = [];
        
        // Identificar todas las cajas que necesitan caer
        for (let col = 0; col < BOARD_WIDTH; col++) {
            // Comenzar desde la parte inferior del tablero
            for (let row = BOARD_HEIGHT - 2; row >= 0; row--) {
                if (gridCopy[row][col] === 'C') {
                    // Verificar si esta caja puede caer
                    if (gridCopy[row + 1][col] === null) {
                        let targetRow = row + 1;
                        
                        // Encontrar la posición final de caída
                        while (targetRow + 1 < BOARD_HEIGHT && gridCopy[targetRow + 1][col] === null) {
                            targetRow++;
                        }
                        
                        // Añadir información a la lista de cajas que caerán
                        boxesInfo.push({
                            startRow: row,
                            startCol: col,
                            targetRow: targetRow,
                            distance: targetRow - row
                        });
                        
                        // Actualizar la copia del grid para futuras comprobaciones
                        gridCopy[targetRow][col] = 'C';
                        gridCopy[row][col] = null;
                    }
                }
            }
        }
        
        // Si no hay cajas para animar, salir
        if (boxesInfo.length === 0) return;
        
        // Iniciar la animación
        animatingBoxes = true;
        
        // Recopilar todas las cajas en un solo array para animarlas juntas
        const boxElements = [];
        
        // Preparar todas las animaciones a la vez
        boxesInfo.forEach(boxInfo => {
            // Eliminar la caja de su posición original en el grid real
            grid[boxInfo.startRow][boxInfo.startCol] = null;
            
            // Crear el elemento visual para la animación
            const boxElement = document.createElement('div');
            boxElement.className = 'cell tetromino C';
            boxElement.style.position = 'absolute';
            boxElement.style.width = `${CELL_SIZE}px`;
            boxElement.style.height = `${CELL_SIZE}px`;
            boxElement.style.left = `${boxInfo.startCol * CELL_SIZE}px`;
            boxElement.style.top = `${boxInfo.startRow * CELL_SIZE}px`;
            boxElement.style.zIndex = '5';
            boxElement.style.backgroundImage = 'url("sprites/box.svg")';
            boxElement.style.backgroundSize = 'cover';
            boxElement.style.backgroundPosition = 'center';
            boxElement.style.backgroundRepeat = 'no-repeat';
            
            const boardContainer = document.querySelector('.game-board-container');
            boardContainer.appendChild(boxElement);
            
            boxElements.push({
                element: boxElement,
                info: boxInfo
            });
        });
        
        // Actualizar el tablero visualmente (sin las cajas que se moverán)
        redrawBoard();
        
        // Esperar un breve momento antes de iniciar la animación para evitar parpadeos
        requestAnimationFrame(() => {
            // Iniciar todas las animaciones a la vez
            boxElements.forEach(box => {
                const distanceY = box.info.distance * CELL_SIZE;
                box.element.style.transition = `transform ${boxAnimationSpeed}ms ease-in`;
                box.element.style.transform = `translateY(${distanceY}px)`;
            });
            
            // Cuando termine la última animación, actualizar el tablero
            setTimeout(() => {
                // Actualizar el grid con las nuevas posiciones
                boxElements.forEach(box => {
                    grid[box.info.targetRow][box.info.startCol] = 'C';
                    box.element.remove();
                });
                
                // Redibujar el tablero
                redrawBoard();
                
                // Verificar si el jugador sigue teniendo soporte
                checkPlayerSupport();
                
                // Finalizar la animación
                animatingBoxes = false;
                
                // Verificar si hay más cajas que puedan caer después de esta animación
                setTimeout(() => {
                    if (checkForFloatingBoxes()) {
                        applyGravityToBoxes();
                    }
                }, 10);
                
            }, boxAnimationSpeed + 50); // Añadir un pequeño margen para asegurar que todas las animaciones terminen
        });
    }

    // Verificar si hay cajas flotantes que necesitan caer
    function checkForFloatingBoxes() {
        for (let col = 0; col < BOARD_WIDTH; col++) {
            for (let row = BOARD_HEIGHT - 2; row >= 0; row--) {
                if (grid[row][col] === 'C' && grid[row + 1][col] === null) {
                    return true; // Encontramos al menos una caja flotante
                }
            }
        }
        return false; // No hay cajas flotantes
    }

    // Verificar si el jugador sigue teniendo soporte después de que caigan cajas
    function checkPlayerSupport() {
        // Si el jugador no está saltando y no está en el suelo
        if (!player.isJumping && player.row < BOARD_HEIGHT - 1) {
            // Verificar si hay soporte debajo
            if (!isCellOccupied(player.row + 1, player.col)) {
                // No hay nada debajo, aplicar caída
                player.isJumping = true;
                player.velocityY = 1; // Velocidad inicial pequeña para caída
            }
        }
    }

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

        // Guardar referencia al tablero
        boardElement = board;
        
        // Crear y guardar referencias a todas las celdas de una vez
        cellElements = [];
        for (let row = 0; row < BOARD_HEIGHT; row++) {
            const rowElements = [];
            for (let col = 0; col < BOARD_WIDTH; col++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.row = row;
                cell.dataset.col = col;
                board.appendChild(cell);
                rowElements.push(cell);
            }
            cellElements.push(rowElements);
        }
    }

    // Get a random tetromino
    function getRandomTetromino() {
        const tetrominoNames = Object.keys(TETROMINOES);
        const randomName = tetrominoNames[Math.floor(Math.random() * tetrominoNames.length)];
        
        // Generar una posición aleatoria en el eje horizontal
        const randomCol = Math.floor(Math.random() * (BOARD_WIDTH - 1));
        
        return {
            type: randomName,
            shape: TETROMINOES[randomName].shape,
            color: TETROMINOES[randomName].color,
            row: 0, // Siempre empezar desde la parte superior
            col: randomCol // Posición aleatoria en el eje horizontal
        };
    }

    // Draw a tetromino on the board - optimizado
    function drawTetromino(tetromino) {
        for (let row = 0; row < tetromino.shape.length; row++) {
            for (let col = 0; col < tetromino.shape[row].length; col++) {
                if (tetromino.shape[row][col]) {
                    const cellRow = tetromino.row + row;
                    const cellCol = tetromino.col + col;

                    if (cellRow >= 0 && cellRow < BOARD_HEIGHT && cellCol >= 0 && cellCol < BOARD_WIDTH) {
                        // Usar referencia directa a la celda
                        const cell = cellElements[cellRow][cellCol];
                        cell.classList.add('tetromino', tetromino.color);
                    }
                }
            }
        }
    }

    // Clear the tetromino from the board - optimizado
    function clearTetromino(tetromino) {
        for (let row = 0; row < tetromino.shape.length; row++) {
            for (let col = 0; col < tetromino.shape[row].length; col++) {
                if (tetromino.shape[row][col]) {
                    const cellRow = tetromino.row + row;
                    const cellCol = tetromino.col + col;

                    if (cellRow >= 0 && cellRow < BOARD_HEIGHT && cellCol >= 0 && cellCol < BOARD_WIDTH) {
                        // Usar referencia directa a la celda
                        const cell = cellElements[cellRow][cellCol];
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
        
        // Aplicar gravedad a cualquier caja que pueda necesitarla
        applyGravityToBoxes();

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
            // Play sound when lines are cleared
            playLineClearSound(linesCleared);

            updateLines(linesCleared);
            redrawBoard();
            
            // Aplicar gravedad después de eliminar líneas
            applyGravityToBoxes();
        }
    }

    // Play line clear sound
    function playLineClearSound(linesCleared) {
        // Use tetris sound for 4 lines, regular sound for 1-3 lines
        const sound = linesCleared === 4 ? tetrisSound.cloneNode() : lineClearSound.cloneNode();

        sound.play().catch(error => {
            console.log("Audio couldn't play. This may be due to browser autoplay policies.", error);
        });
    }

    // Redraw the entire board based on the grid state - optimizado
    function redrawBoard() {
        // Actualizar solo las celdas necesarias
        for (let row = 0; row < BOARD_HEIGHT; row++) {
            for (let col = 0; col < BOARD_WIDTH; col++) {
                const cell = cellElements[row][col];
                const color = grid[row][col];
                
                // Resetear clase
                cell.className = 'cell';
                
                // Añadir clases si hay color
                if (color) {
                    cell.classList.add('tetromino', color);
                }
            }
        }
    }

    // Spawn a new tetromino
    function spawnNewPiece() {
        currentPiece = getRandomTetromino();

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
    }

    // Variables para el control de tiempo y nivel
    let levelTimer = 0;
    const levelUpInterval = 15000; // 15 segundos en milisegundos

    // Función para actualizar el nivel basado en el tiempo
    function updateLevel() {
        if (isPaused || isGameOver) return;
        
        // Incrementar en milisegundos según la velocidad del juego (en lugar de un valor fijo)
        // El valor de dropSpeed es el intervalo actual del juego en milisegundos
        levelTimer += dropSpeed;
        
        // Si han pasado 10 segundos, subir de nivel
        if (levelTimer >= levelUpInterval) {
            level++;
            levelElement.textContent = level;
            //console.log("Nivel incrementado a: " + level); // Debug para verificar
            levelTimer = 0; // Reiniciar el temporizador
            
            // Aumentar la velocidad con cada nivel
            dropSpeed = Math.max(speedIncrement, referenceSpeed - (level - 1) * speedIncrement);
            clearInterval(gameInterval);
            gameInterval = setInterval(gameLoop, dropSpeed);
            
            // Reproducir sonido de subida de nivel
            tetrisSound.play().catch(error => {
                console.log("Level up audio couldn't play. This may be due to browser autoplay policies.", error);
            });
        }
    }

    // Game loop - move the tetromino down one step
    function gameLoop() {
        if (!isPaused && !isGameOver) {
            moveTetromino('down');
            handlePlayerMovement();
            updateLevel(); // Actualizar el nivel basado en el tiempo
        }
    }

    // Game over
    function gameOver() {
        isGameOver = true;
        clearInterval(gameInterval);
        finalScoreElement.textContent = score;
        gameOverModal.style.display = 'flex';
        
        // Play game over sound
        gameOverSound.play().catch(error => {
            console.log("Game over audio couldn't play. This may be due to browser autoplay policies.", error);
        });
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
        dropSpeed = referenceSpeed;

        // Reset UI
        scoreElement.textContent = '0';
        linesElement.textContent = '0';
        levelElement.textContent = '1';

        // Clear the board
        redrawBoard();
        gameOverModal.style.display = 'none';

        // Initialize new piece and start the game
        spawnNewPiece();

        // Start the game loop
        clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, dropSpeed);

        // Focus the board at game start
        board.focus();
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

        // Make the board focusable
        board.setAttribute('tabindex', '0');

        // Create and add player
        const playerElement = createPlayer();
        const boardContainer = document.querySelector('.game-board-container');
        boardContainer.style.position = 'relative';
        boardContainer.appendChild(playerElement);
        
        // Configurar el botón de debug
        setupDebugButton();
        
        // Inicializar el personaje en una posición elevada para que caiga
        player.row = 0;
        player.col = Math.floor(BOARD_WIDTH / 2);
        player.x = player.col * CELL_SIZE;
        player.y = player.row * CELL_SIZE;
        player.targetX = player.x;
        player.targetY = player.y;
        player.velocityY = 0;
        updatePlayerSprite();

        // Event listeners
        document.addEventListener('keydown', e => {
            if (isGameOver) return;

            switch (e.key) {
                case 'ArrowLeft':
                    player.isMovingLeft = true;
                    e.preventDefault();
                    break;
                case 'ArrowRight':
                    player.isMovingRight = true;
                    e.preventDefault();
                    break;
                case 'ArrowDown':
                    moveTetromino('down');
                    e.preventDefault();
                    break;
                case 'ArrowUp':
                    if (!player.isJumping) {
                        player.isJumping = true;
                        player.velocityY = -player.jumpForce;
                    }
                    e.preventDefault();
                    break;
                case ' ':
                    hardDrop();
                    e.preventDefault(); // Prevent page scrolling
                    break;
                case 'p':
                case 'P':
                    togglePause();
                    e.preventDefault();
                    break;
                case 'z':
                case 'Z':
                    player.isPushing = true;
                    e.preventDefault();
                    break;
                case 'x':
                case 'X':
                    player.isPulling = true;
                    e.preventDefault();
                    break;
            }
        });

        document.addEventListener('keyup', e => {
            switch (e.key) {
                case 'ArrowLeft':
                    player.isMovingLeft = false;
                    break;
                case 'ArrowRight':
                    player.isMovingRight = false;
                    break;
                case 'z':
                case 'Z':
                    player.isPushing = false;
                    break;
                case 'x':
                case 'X':
                    player.isPulling = false;
                    break;
            }
        });

        // Focus the board when clicked
        board.addEventListener('click', () => {
            board.focus();
        });

        startButton.addEventListener('click', () => {
            if (isGameOver || !gameInterval) {
                startGame();
            } else {
                togglePause();
            }
            // Focus the board after starting or pausing
            board.focus();
        });

        restartButton.addEventListener('click', () => {
            startGame();
            // Focus the board after restarting
            board.focus();
        });

        // Set up animation loop for player
        requestAnimationFrame(animationLoop);
    }

    // Configurar el botón de debug en lugar de añadirlo dinámicamente
    function setupDebugButton() {
        const debugButton = document.getElementById('debug-button');
        debugButton.addEventListener('click', toggleDebugGrid);
    }
    
    // Función para activar/desactivar la cuadrícula de debug
    function toggleDebugGrid() {
        debugGridEnabled = !debugGridEnabled;
        
        const board = document.querySelector('.game-board');
        const debugButton = document.getElementById('debug-button');
        
        if (debugGridEnabled) {
            board.classList.add('debug-grid-enabled');
            debugButton.textContent = 'Ocultar cuadrícula';
        } else {
            board.classList.remove('debug-grid-enabled');
            debugButton.textContent = 'Mostrar cuadrícula';
        }
    }

    // Animation loop for smoother player movement - optimizado
    let lastTime = 0;
    const targetFPS = 60;
    const frameInterval = 1000 / targetFPS;

    function animationLoop(timestamp) {
        // Control de FPS para evitar sobrecarga
        const elapsed = timestamp - lastTime;
        
        if (elapsed > frameInterval) {
            lastTime = timestamp - (elapsed % frameInterval);
            
            if (!isPaused && !isGameOver) {
                handlePlayerMovement();
            }
        }
        
        requestAnimationFrame(animationLoop);
    }

    // Start the game initialization
    initialize();
});