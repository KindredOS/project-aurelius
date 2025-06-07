import React from 'react';
import styles from './QuickActionsPanel.module.css';
import { FaFlag, FaCommentDots, FaDownload } from 'react-icons/fa';

function QuickActionsPanel() {
  return (
    <div className={styles.footerMenu}>
      <button className={styles.iconButton} title="View Flagged Students">
        <FaFlag />
      </button>
      <button className={styles.iconButton} title="Send Feedback">
        <FaCommentDots />
      </button>
      <button className={styles.iconButton} title="Export Reports">
        <FaDownload />
      </button>
    </div>
  );
}

export default QuickActionsPanel;