Collecting workspace information# Tetris Game

A classic Tetris game implementation using HTML, CSS, and JavaScript.

## Description

This is a fully functional Tetris game built with vanilla JavaScript. The game features all the standard Tetris mechanics including piece rotation, line clearing, scoring system, and increasing difficulty as levels progress.

## Features

- Complete Tetris gameplay with all 7 standard tetrominoes (I, O, T, S, Z, J, L)
- Responsive game board with a next-piece preview
- Scoring system with points based on lines cleared and hard drops
- Level progression that increases game speed
- Game controls for moving, rotating, and dropping pieces
- Pause functionality
- Game over detection with final score display
- Clean, modern user interface

## Controls

- **Left/Right Arrow**: Move piece horizontally
- **Down Arrow**: Soft drop (move piece down faster)
- **Up Arrow**: Rotate piece
- **Spacebar**: Hard drop (instantly drop piece to bottom)
- **P key**: Pause/Resume game

## Installation

No installation required! Simply clone the repository or download the files and open index.html in your web browser to play.

```
git clone <repository-url>
cd tetris
```

## How to Play

1. Press the "Start" button to begin the game
2. Use the arrow keys to move and rotate falling pieces
3. Complete horizontal lines to clear them and earn points
4. The game ends when pieces stack up to the top of the board
5. Try to achieve the highest score possible!

## Technical Implementation

The game is built using:
- HTML5 for structure
- CSS3 for styling
- Vanilla JavaScript for game logic

The implementation includes:
- Grid-based game board representation
- Piece collision detection
- Wall kick mechanics for rotation near walls
- Scoring system that rewards clearing multiple lines at once
- Level-based speed progression

## Future Improvements

- Add sound effects and background music
- Implement local storage to save high scores
- Add mobile touch controls
- Create difficulty options
- Add customizable themes

## License

Feel free to use, modify, and distribute this code for personal or educational purposes.

Happy gaming!