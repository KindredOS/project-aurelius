import React from 'react';
import styles from './QuickActionsPanel.module.css';

function QuickActionsPanel() {
  const [isOpen, setIsOpen] = React.useState(true);

  return (
    <div className={styles.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>📝 Quick Actions</h2>
        <button onClick={() => setIsOpen(prev => !prev)}>
          {isOpen ? '−' : '+'}
        </button>
      </div>
      {isOpen && (
        <div className={styles.section}>
          <ul>
            <li>View flagged students</li>
            <li>Send encouragement or feedback</li>
            <li>Export progress reports</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default QuickActionsPanel;