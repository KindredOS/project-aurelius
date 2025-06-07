import React from 'react';
import styles from './LearningProfileList.module.css';

function LearningProfileList() {
  return (
    <div className={styles.card}>
      <div className={styles.topStatBox}>
        <div>
          <div className={styles.statLabel}>Profiles Loaded</div>
          <span className={styles.statNumber}>8</span>
        </div>
      </div>

      <h3 className={styles.cardTitle}>Learning Profiles</h3>
      <span className={styles.cardCategory}>Student Overview</span>
      <p className={styles.cardDescription}>
        A dynamic breakdown of student learning styles and academic behaviors to help tailor instruction for optimal outcomes.
      </p>

      <div className={styles.cardFooter}>
        <span className={styles.viewLink}>View full profiles →</span>
      </div>
    </div>
  );
}

export default LearningProfileList;
