import React from 'react';
import StudentHeatmap from '../../components/teacher/StudentHeatmap';
import LearningProfileList from '../../components/teacher/LearningProfileList';
import QuickActionsPanel from '../../components/teacher/QuickActionsPanel';
import styles from './DashboardTeacher.module.css';
import ProblemSetManager from '../../components/teacher/ProblemSetManager';

// Stub Components
function DashboardTeacher() {
    return (
    <div className={styles.dashboardTeacherContainer}>
      <div className={styles.dashboardGrid}>
        <StudentHeatmap />

        <LearningProfileList />

        <ProblemSetManager />

        <QuickActionsPanel />
      </div>
    </div>
  );
}

export default DashboardTeacher;
