// Path: src/components/teacher/StudentHeatmap.jsx
// Function: A streamlined widget for the dashboard to provide a quick view of student overall progress. 

import React, { useState, useMemo } from 'react';
import { aggregateSubjectScores } from '../../utils/aggregateScores';
import styles from './StudentHeatmap.module.css';

function StudentHeatmap({ user, students = [], subject }) {
  const [viewMode, setViewMode] = useState('overview'); // 'overview' or 'detailed'

  // Calculate analytics from student data
  const analytics = useMemo(() => {
    if (!students.length) return { avgPerformance: 0, heatmapData: [], subjects: [] };

    const subjects = ['science', 'math', 'technology', 'engineering', 'arts', 'lifestyle'];
    let totalProgress = 0;
    let studentCount = 0;
    const heatmapData = [];

    // Inside the analytics useMemo
students.forEach((student, studentIndex) => {
  const studentData = {
    email: student.email,
    name: student.name || student.email.split('@')[0],
    subjects: {}
  };

  if (subject) {
    // Single subject view with aggregation
    const progress = aggregateSubjectScores(student.progress, subject);
    console.log(`[DEBUG] Single-subject: ${subject}`, {
      student: student.email,
      rawProgress: student.progress,
      aggregated: progress
    });
    totalProgress += progress;
    studentCount++;
    studentData.subjects[subject] = progress;
  } else {
    // Multi-subject view
    if (typeof student.progress === 'object' && student.progress) {
      subjects.forEach(sub => {
        const progress = aggregateSubjectScores(student.progress, sub);
        console.log(`[DEBUG] Multi-subject: ${sub}`, {
          student: student.email,
          rawProgress: student.progress,
          aggregated: progress
        });
        studentData.subjects[sub] = progress;
        totalProgress += progress;
        studentCount++;
      });
    }
  }
  
  heatmapData.push(studentData);
});

    const avgPerformance = studentCount > 0 ? Math.round(totalProgress / studentCount) : 0;
    
    return {
      avgPerformance,
      heatmapData,
      subjects: subject ? [subject] : subjects
    };
  }, [students, subject]);

  // Get color intensity for heatmap cells
  const getHeatmapColor = (value) => {
    const intensity = Math.min(Math.max(value / 100, 0), 1);
    const red = Math.round(255 * (1 - intensity));
    const green = Math.round(255 * intensity);
    return `rgb(${red}, ${green}, 100)`;
  };

  // Get performance level text
  const getPerformanceLevel = (value) => {
    if (value >= 90) return 'Excellent';
    if (value >= 80) return 'Good';
    if (value >= 70) return 'Average';
    if (value >= 60) return 'Below Average';
    return 'Needs Attention';
  };

  if (!students.length) {
    return (
      <div className={styles.card}>
        <div className={styles.topStatBox}>
          <div>
            <div className={styles.statLabel}>Performance Avg</div>
            <span className={styles.statNumber}>--</span>
          </div>
        </div>

        <h3 className={styles.cardTitle}>Student Performance</h3>
        <span className={styles.cardCategory}>Engagement Heatmap</span>
        <p className={styles.cardDescription}>
          No student data available. Add students to your class to see performance analytics.
        </p>

        <div className={styles.cardFooter}>
          <span className={styles.viewLinkDisabled}>No data to display</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.topStatBox}>
        <div>
          <div className={styles.statLabel}>Performance Avg</div>
          <span className={styles.statNumber}>{analytics.avgPerformance}%</span>
        </div>
        <div className={styles.performanceLevel}>
          {getPerformanceLevel(analytics.avgPerformance)}
        </div>
      </div>

      <h3 className={styles.cardTitle}>Student Performance</h3>
      <span className={styles.cardCategory}>
        {subject ? `${subject.charAt(0).toUpperCase() + subject.slice(1)} Heatmap` : 'Multi-Subject Heatmap'}
      </span>
      
      {viewMode === 'overview' ? (
        <>
          <div className={styles.heatmapContainer}>
            <div className={`${styles.heatmapGrid} ${styles.scrollableGrid}`}>
              {analytics.heatmapData.map((student, idx) => (
                <div key={idx} className={styles.studentCell}>
                  <div className={styles.studentName}>
                    {student.name.length > 8 ? student.name.substring(0, 8) + '...' : student.name}
                  </div>
                  <div className={styles.subjectRow}>
                    {analytics.subjects.slice(0, 3).map(sub => {
                      const value = student.subjects[sub] || 0;
                      return (
                        <div
                          key={sub}
                          className={styles.heatCell}
                          style={{ backgroundColor: getHeatmapColor(value) }}
                          title={`${sub}: ${value}%`}
                        >
                          {value}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.quickStats}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{students.length}</span>
              <span className={styles.statLabel}>Students</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{analytics.subjects.length}</span>
              <span className={styles.statLabel}>Subjects</span>
            </div>
          </div>
        </>
      ) : (
        <div className={styles.detailedView}>
          <div className={`${styles.heatmapTable} ${styles.scrollableTable}`}>
            <div className={styles.tableHeader}>
              <div className={styles.studentHeader}>Student</div>
              {analytics.subjects.map(sub => (
                <div key={sub} className={styles.subjectHeader}>
                  {sub.charAt(0).toUpperCase() + sub.slice(1)}
                </div>
              ))}
            </div>
            
            <div className={styles.tableBody}>
              {analytics.heatmapData.map((student, idx) => (
                <div key={idx} className={styles.tableRow}>
                  <div className={styles.studentName}>{student.name}</div>
                  {analytics.subjects.map(sub => {
                    const value = student.subjects[sub] || 0;
                    return (
                      <div
                        key={sub}
                        className={styles.tableCell}
                        style={{ backgroundColor: getHeatmapColor(value) }}
                      >
                        {value}%
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className={styles.cardFooter}>
        <button
          className={styles.viewToggle}
          onClick={() => setViewMode(viewMode === 'overview' ? 'detailed' : 'overview')}
        >
          {viewMode === 'overview' ? 'View Detailed →' : '← Back to Overview'}
        </button>
      </div>
    </div>
  );
}

export default StudentHeatmap;