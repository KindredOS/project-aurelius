import React, { useState } from 'react';
import styles from './LifestyleGame.module.css';

const LifestyleGame = () => {
  const [started, setStarted] = useState(false);
  const [message, setMessage] = useState('Click start to begin your lifestyle activity!');

  const handleStart = () => {
    setStarted(true);
    setMessage('Great job! Keep going with your healthy choices!');
  };

  const handleReset = () => {
    setStarted(false);
    setMessage('Click start to begin your lifestyle activity!');
  };

  return (
    <div className={styles.lifestyleGameContainer}>
      <h2 className={styles.title}>Lifestyle Challenge</h2>
      <p className={styles.description}>{message}</p>

      <div className={styles.controls}>
        <button className={styles.primaryButton} onClick={handleStart} disabled={started}>
          Start
        </button>
        <button className={styles.secondaryButton} onClick={handleReset}>
          Reset
        </button>
      </div>

      {started && (
        <div className={styles.simulationWindow}>
          <p>🌱 Simulated lifestyle activity is running...</p>
        </div>
      )}
    </div>
  );
};

export default LifestyleGame;
