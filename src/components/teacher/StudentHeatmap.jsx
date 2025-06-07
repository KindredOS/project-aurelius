import React from 'react';
import styles from './StudentHeatmap.module.css';

function StudentHeatmap() {
  return (
    <div className={styles.card}>
      <div className={styles.topStatBox}>
        <div>
          <div className={styles.statLabel}>Performance Avg</div>
          <span className={styles.statNumber}>84%</span>
        </div>
      </div>

      <h3 className={styles.cardTitle}>Student Performance</h3>
      <span className={styles.cardCategory}>Engagement Heatmap</span>
      <p className={styles.cardDescription}>
        Visual analysis of student activity patterns across subjects and time to help identify learning gaps.
      </p>

      <div className={styles.cardFooter}>
        <span className={styles.viewLink}>Open full heatmap →</span>
      </div>
    </div>
  );
}

export default StudentHeatmap;
