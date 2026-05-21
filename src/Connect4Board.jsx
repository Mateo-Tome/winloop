import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3001');
const ROOM_ID = 'test-room';

export default function Connect4Board({ onRestart }) {
  const rows = 6;
  const columns = 7;

  const [board, setBoard] = useState(
    Array.from({ length: rows }, () => Array(columns).fill(null))
  );

  const [currentPlayer, setCurrentPlayer] = useState('red');
  const [winner, setWinner] = useState(null);
  const [playerCount, setPlayerCount] = useState(0);

  useEffect(() => {
    socket.emit('joinRoom', ROOM_ID);

    socket.on('connect', () => {
      console.log('Connected to server:', socket.id);
    });

    socket.on('playerCount', (count) => {
      console.log('Player count:', count);
      setPlayerCount(count);
    });

    socket.on('opponentMove', ({ board, currentPlayer, winner }) => {
      setBoard(board);
      setCurrentPlayer(currentPlayer);
      setWinner(winner);
    });

    return () => {
      socket.off('connect');
      socket.off('playerCount');
      socket.off('opponentMove');
    };
  }, []);

  const checkWinner = (boardToCheck) => {
    const directions = [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, -1],
    ];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const player = boardToCheck[row][col];
        if (!player) continue;

        for (const [dx, dy] of directions) {
          let count = 1;

          for (let step = 1; step < 4; step++) {
            const newRow = row + dx * step;
            const newCol = col + dy * step;

            if (
              newRow < 0 ||
              newRow >= rows ||
              newCol < 0 ||
              newCol >= columns ||
              boardToCheck[newRow][newCol] !== player
            ) {
              break;
            }

            count++;
          }

          if (count === 4) return player;
        }
      }
    }

    return null;
  };

  const handleClick = (colIndex) => {
    if (winner) return;

    for (let row = rows - 1; row >= 0; row--) {
      if (!board[row][colIndex]) {
        const updatedBoard = board.map((boardRow) => [...boardRow]);
        updatedBoard[row][colIndex] = currentPlayer;

        const foundWinner = checkWinner(updatedBoard);
        const nextPlayer = currentPlayer === 'red' ? 'yellow' : 'red';

        setBoard(updatedBoard);
        setWinner(foundWinner);
        setCurrentPlayer(foundWinner ? currentPlayer : nextPlayer);

        socket.emit('makeMove', {
          roomId: ROOM_ID,
          board: updatedBoard,
          currentPlayer: foundWinner ? currentPlayer : nextPlayer,
          winner: foundWinner,
        });

        break;
      }
    }
  };

  return (
    <>
      <div style={styles.status}>
        Players in room: {playerCount}
      </div>

      {winner && (
        <div style={styles.winnerText}>
          {winner.toUpperCase()} wins!
          <button onClick={onRestart} style={styles.playAgainButton}>
            Play Again
          </button>
        </div>
      )}

      {!winner && (
        <div style={styles.turnText}>
          {currentPlayer === 'red' ? 'Red' : 'Yellow'}&apos;s Turn
        </div>
      )}

      <div style={styles.board}>
        {board.map((row, rowIndex) => (
          <div key={rowIndex} style={styles.row}>
            {row.map((cell, colIndex) => (
              <button
                key={colIndex}
                type="button"
                onClick={() => handleClick(colIndex)}
                style={{
                  ...styles.cell,
                  backgroundColor:
                    cell === 'red'
                      ? 'red'
                      : cell === 'yellow'
                        ? 'gold'
                        : '#0f4c81',
                }}
                aria-label={`Column ${colIndex + 1}`}
              />
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

const styles = {
  status: {
    color: 'white',
    fontSize: '1rem',
    marginBottom: '10px',
  },
  winnerText: {
    color: 'white',
    fontSize: '1.5rem',
    marginBottom: '20px',
  },
  turnText: {
    color: 'white',
    fontSize: '1.2rem',
    marginBottom: '10px',
  },
  playAgainButton: {
    marginLeft: '15px',
    padding: '8px 16px',
    fontSize: '1rem',
    backgroundColor: '#f39c12',
    color: '#000',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  board: {
    backgroundColor: '#0f4c81',
    padding: '15px',
    borderRadius: '20px',
    boxShadow: '0 0 30px rgba(0,0,0,0.6)',
    display: 'inline-block',
    marginTop: '20px',
  },
  row: {
    display: 'flex',
  },
  cell: {
    width: '70px',
    height: '70px',
    margin: '5px',
    borderRadius: '50%',
    border: 'none',
    boxShadow: 'inset 0 0 10px rgba(0,0,0,0.7)',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
};