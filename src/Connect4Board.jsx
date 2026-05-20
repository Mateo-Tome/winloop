import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

console.log('🧪 Top-level code running (outside component)');

const socket = io('http://localhost:3001');

export default function Connect4Board({ onRestart }) {
  console.log('🔥 Connect4Board component rendering');

  const rows = 6;
  const columns = 7;

  const [board, setBoard] = useState(
    Array.from({ length: rows }, () => Array(columns).fill(null))
  );
  const [currentPlayer, setCurrentPlayer] = useState('red');
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    console.log('🚀 useEffect running');

    socket.on('connect', () => {
      console.log('✅ Connected to Socket.IO server:', socket.id);
    });

    return () => {
      socket.disconnect();
      console.log('❌ Disconnected socket');
    };
  }, []);

  const checkWinner = (board) => {
    const directions = [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, -1],
    ];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const player = board[row][col];
        if (!player) continue;

        for (const [dx, dy] of directions) {
          let count = 1;

          for (let step = 1; step < 4; step++) {
            const newRow = row + dx * step;
            const newCol = col + dy * step;

            if (
              newRow < 0 || newRow >= rows ||
              newCol < 0 || newCol >= columns ||
              board[newRow][newCol] !== player
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
        const updated = [...board];
        updated[row] = [...updated[row]];
        updated[row][colIndex] = currentPlayer;
        setBoard(updated);

        const foundWinner = checkWinner(updated);
        if (foundWinner) {
          setWinner(foundWinner);
        } else {
          setCurrentPlayer(currentPlayer === 'red' ? 'yellow' : 'red');
        }

        break;
      }
    }
  };

  return (
    <>
      {winner && (
        <div style={{ color: 'white', fontSize: '1.5rem', marginBottom: '20px' }}>
          🎉 {winner.toUpperCase()} wins!
          <button
            onClick={onRestart}
            style={{
              marginLeft: '15px',
              padding: '8px 16px',
              fontSize: '1rem',
              backgroundColor: '#f39c12',
              color: '#000',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Play Again
          </button>
        </div>
      )}

      {!winner && (
        <div style={{ color: 'white', fontSize: '1.2rem', marginBottom: '10px' }}>
          {currentPlayer === 'red' ? '🔴 Red' : '🟡 Yellow'}'s Turn
        </div>
      )}

      <div style={styles.board}>
        {board.map((row, rowIndex) => (
          <div key={rowIndex} style={styles.row}>
            {row.map((cell, colIndex) => (
              <div
                key={colIndex}
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
              ></div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

const styles = {
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
    backgroundColor: '#0f4c81',
    boxShadow: 'inset 0 0 10px rgba(0,0,0,0.7)',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
};

