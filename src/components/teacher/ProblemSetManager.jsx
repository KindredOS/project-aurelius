import React from 'react';
import { Link } from 'react-router-dom';
import styles from './ProblemSetManager.module.css';

function ProblemSetManager() {
  const [savedProblems, setSavedProblems] = React.useState([]);

  React.useEffect(() => {
    const saved = localStorage.getItem('teacherContributions');
    if (saved) {
      setSavedProblems(JSON.parse(saved));
    }
  }, []);

  return (
    <div className={styles.card}>
      <div className={styles.topStatBox}>
        <div>
          <div className={styles.statLabel}>Total Problems</div>
          <span className={styles.statNumber}>{savedProblems.length}</span>
        </div>
      </div>

      <h3 className={styles.cardTitle}>Problem Set Manager</h3>
      <span className={styles.cardCategory}>Custom Problem Entry</span>
      <p className={styles.cardDescription}>
        Add and manage personalized problem sets aligned with lesson plans. Perfect for tailoring classwork and homework.
      </p>

      <div className={styles.cardFooter}>
        <Link to="/Dashboard/teacher/problemsets" className={styles.viewLink}>View full page →</Link>
      </div>
    </div>
  );
}

export default ProblemSetManager;
