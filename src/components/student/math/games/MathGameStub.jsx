import React from 'react';
import styles from './MathGame.module.css';

const MathGame = () => {
  return (
    <div className={styles.gameContainer}>
      <h2 className={styles.title}>🧮 Welcome to Math Explorer!</h2>
      <p className={styles.description}>
        This is a placeholder for the interactive math simulation. Solve puzzles, balance equations,
        and explore core math concepts in a fun, hands-on way.
      </p>
      <div className={styles.placeholderArea}>
        <p>[ Your math game logic will render here ]</p>
      </div>
    </div>
  );
};

export default MathGame;
