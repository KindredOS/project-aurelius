import React from 'react';
import styles from './ArtsGame.module.css';

const ArtsGame = () => {
  return (
    <div className={styles.artsGameContainer}>
      <h2 className={styles.title}>🎨 Arts Game: Creative Challenge</h2>
      <p className={styles.description}>
        Welcome to your virtual studio! Choose your tools, explore your imagination, and bring your vision to life.
      </p>

      <div className={styles.canvasArea}>
        <p className={styles.placeholder}>
          (Interactive canvas or mini art challenge will go here)
        </p>
      </div>

      <div className={styles.controls}>
        <button className={styles.toolButton}>🎨 Paint</button>
        <button className={styles.toolButton}>✏️ Sketch</button>
        <button className={styles.toolButton}>🗑️ Clear</button>
      </div>
    </div>
  );
};

export default ArtsGame;
