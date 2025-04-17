# Promt 3
 "Asegúrate de que el foco esté en el canvas del juego al presionar la barra espaciadora para evitar que se pause el juego"
 Documentos de contexto:
 - script.js

## Fixing Focus for Space Bar Controls

To ensure that the focus stays on the game canvas when pressing the space bar (preventing unwanted page scrolling), I'll add the following improvements:

1. Prevent the default space bar behavior (page scrolling)
2. Make the game board focusable
3. Set focus to the game board at appropriate times

Here's how to implement these changes:

````javascript
document.addEventListener('DOMContentLoaded', () => {
    // ...existing code...
    
    // Initialize the game
    function initialize() {
        initializeBoard();
        initializeNextPiecePreview();
        
        // Make the board focusable
        board.setAttribute('tabindex', '0');
        
        // Event listeners
        document.addEventListener('keydown', e => {
            if (isGameOver) return;
            
            switch (e.key) {
                case 'ArrowLeft':
                    moveTetromino('left');
                    e.preventDefault();
                    break;
                case 'ArrowRight':
                    moveTetromino('right');
                    e.preventDefault();
                    break;
                case 'ArrowDown':
                    moveTetromino('down');
                    e.preventDefault();
                    break;
                case 'ArrowUp':
                    rotateTetromino();
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
    }

    // Start/reset the game
    function startGame() {
        // ...existing code...
        
        // Focus the board at game start
        board.focus();
    }
    
    // ...existing code...
});
````

These changes will:

1. Make the game board focusable with `tabindex="0"`
2. Prevent default browser actions for all game control keys
3. Focus the board automatically when:
   - Starting the game
   - Clicking on the game board
   - Clicking the start/pause button
   - Clicking the restart button

This will ensure that the space bar properly triggers the hard drop action without causing the page to scroll.

## Testing
- El bug de la barra espaciadora se ha solucionado y ahora el juego no se pausa al presionar la barra espaciadora.
- El foco se mantiene en el canvas del juego, lo que permite que las teclas de dirección y la barra espaciadora funcionen correctamente.