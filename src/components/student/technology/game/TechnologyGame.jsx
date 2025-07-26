// TechnologyGame.jsx — Stub simulation game component for TechnologyDash
import React from 'react';
import styles from './TechnologyGame.module.css';

const TechnologyGame = () => {
  return (
    <div className={styles.gameContainer}>
      <h2 className={styles.title}>Technology Simulation</h2>
      <p className={styles.description}>🧠 In this module, you'll simulate building a basic app with logic and UI structure.</p>
      <div className={styles.simulationBox}>
        <p className={styles.placeholderText}>Simulation environment coming soon...</p>
      </div>
    </div>
  );
};

export default TechnologyGame;
