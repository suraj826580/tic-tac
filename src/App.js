import React, { useState, useEffect } from "react";
const PLAYER_IMAGES = {
  cow: "https://d1uy1wopdv0whp.cloudfront.net/sticky_images/britannia/cow.png",
  milk: "https://d1uy1wopdv0whp.cloudfront.net/sticky_images/britannia/milk.png",
};

function Square({ value, onClick, isHighlighted }) {
  return (
    <button
      className={`square ${isHighlighted ? "highlighted" : ""}`}
      onClick={onClick}>
      {value && (
        <img src={PLAYER_IMAGES[value]} alt={value} className="square-image" />
      )}
    </button>
  );
}

function Board({ squares, onClick, winningLine }) {
  return (
    <div className="board">
      {squares.map((value, index) => (
        <Square
          key={index}
          value={value}
          onClick={() => onClick(index)}
          isHighlighted={winningLine && winningLine.includes(index)}
        />
      ))}
    </div>
  );
}

function Game() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [cowIsNext, setCowIsNext] = useState(true);
  const [winningLine, setWinningLine] = useState(null);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    if (
      !cowIsNext &&
      !calculateWinner(board).winner &&
      !board.every((square) => square)
    ) {
      const timer = setTimeout(() => {
        makeComputerMove();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [cowIsNext, board]);

  const handleClick = (i) => {
    if (calculateWinner(board).winner || board[i] || !cowIsNext || gameOver)
      return;
    const newBoard = board.slice();
    newBoard[i] = "cow";
    setBoard(newBoard);
    setCowIsNext(false);
    checkGameOver(newBoard);
  };

  const makeComputerMove = () => {
    const newBoard = board.slice();
    const move = getBestMove(newBoard);
    newBoard[move] = "milk";
    setBoard(newBoard);
    setCowIsNext(true);
    checkGameOver(newBoard);
  };

  const checkGameOver = (currentBoard) => {
    const { winner, line } = calculateWinner(currentBoard);
    if (winner) {
      setWinningLine(line);
      setGameOver(true);
    } else if (currentBoard.every((square) => square)) {
      setGameOver(true);
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCowIsNext(true);
    setWinningLine(null);
    setGameOver(false);
  };

  const { winner } = calculateWinner(board);
  let status;
  if (winner) {
    status = `Winner: ${winner === "cow" ? "Cow" : "Milk"}`;
  } else if (board.every((square) => square)) {
    status = "Draw!";
  } else {
    status = `Next player: ${cowIsNext ? "Cow" : "Milk"}`;
  }

  return (
    <div className="game">
      <div className="status">{status}</div>
      <Board squares={board} onClick={handleClick} winningLine={winningLine} />
      <div className="game-controls">
        <button onClick={resetGame}>Reset</button>
        {gameOver && <button onClick={resetGame}>Play Again</button>}
      </div>
    </div>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // Horizontal
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // Vertical
    [0, 4, 8],
    [2, 4, 6], // Diagonal
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: lines[i] };
    }
  }
  return { winner: null, line: null };
}

function getBestMove(board) {
  // Win if possible
  const winMove = findWinningMove(board, "milk");
  if (winMove !== -1) return winMove;

  // Block opponent's win
  const blockMove = findWinningMove(board, "cow");
  if (blockMove !== -1) return blockMove;

  // Take center if available
  if (board[4] === null) return 4;

  // Take a corner
  const corners = [0, 2, 6, 8];
  const availableCorners = corners.filter((i) => board[i] === null);
  if (availableCorners.length > 0) {
    return availableCorners[
      Math.floor(Math.random() * availableCorners.length)
    ];
  }

  // Take any available side
  const sides = [1, 3, 5, 7];
  const availableSides = sides.filter((i) => board[i] === null);
  if (availableSides.length > 0) {
    return availableSides[Math.floor(Math.random() * availableSides.length)];
  }

  // No move available
  return -1;
}

function findWinningMove(board, player) {
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      const testBoard = board.slice();
      testBoard[i] = player;
      if (calculateWinner(testBoard).winner === player) {
        return i;
      }
    }
  }
  return -1;
}

export default Game;
