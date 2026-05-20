import { useState } from 'react';
import Connect4Board from './Connect4Board';

export default function App() {
  const [inGame, setInGame] = useState(false);

  return (
    <div style={styles.container}>
      {inGame ? (
        <Connect4Board onRestart={() => setInGame(false)} />
      ) : (
        <>
          <h1 style={styles.title}>🎮 Welcome to Winloop</h1>
          <button style={styles.button} onClick={() => setInGame(true)}>
            Play Connect 4
          </button>
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    height: '100vh',
    width: '100vw',
    backgroundColor: '#111',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    textAlign: 'center',
  },
  title: {
    fontSize: '2rem',
    marginBottom: '20px',
  },
  button: {
    fontSize: '1.2rem',
    padding: '10px 20px',
    backgroundColor: '#f39c12',
    color: '#000',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
};
