import React from 'react';
import StudentHeatmap from '../../components/teacher/StudentHeatmap';
import LearningProfileList from '../../components/teacher/LearningProfileList';
import QuickActionsPanel from '../../components/teacher/QuickActionsPanel';
import styles from './DashboardTeacher.module.css';
import ProblemSetManager from '../../components/teacher/ProblemSetManager';

function DashboardTeacher() {
  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.horizontalLayout}>
        <StudentHeatmap />
        <LearningProfileList />
        <ProblemSetManager />
      </div>

      <div className={styles.footerMenu}>
        <QuickActionsPanel />
      </div>
    </div>
  );
}

export default DashboardTeacher;
