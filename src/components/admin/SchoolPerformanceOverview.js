import React, { useState, useEffect } from 'react';
import { fetchSchoolMetrics } from '../../api/Admin';
import styles from './AdminModules.module.css';

function SchoolPerformanceOverview({ dashboardData }) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDetailedMetrics, setShowDetailedMetrics] = useState(false);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const metricsData = await fetchSchoolMetrics();
      setMetrics(metricsData);
    } catch (error) {
      console.error('Failed to load metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatPercentage = (value) => {
    return `${Math.round(value * 100) / 100}%`;
  };

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2>📊 School Performance Overview</h2>
        <button 
          className={styles.toggleButton}
          onClick={() => setShowDetailedMetrics(!showDetailedMetrics)}
        >
          {showDetailedMetrics ? 'Simple View' : 'Detailed View'}
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading metrics...</div>
      ) : (
        <div className={styles.metricsContainer}>
          {!showDetailedMetrics ? (
            // Simple overview
            <div className={styles.simpleMetrics}>
              <div className={styles.metricCard}>
                <h4>User Activity</h4>
                <p>Active (7d): {metrics?.user_metrics?.active_last_7d || 0}</p>
                <p>Active (30d): {metrics?.user_metrics?.active_last_30d || 0}</p>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill}
                    style={{ 
                      width: `${metrics?.user_metrics?.retention_rate_30d || 0}%` 
                    }}
                  ></div>
                </div>
                <small>30-day retention: {formatPercentage(metrics?.user_metrics?.retention_rate_30d || 0)}</small>
              </div>

              <div className={styles.metricCard}>
                <h4>Student Performance</h4>
                <p>Total Sessions: {metrics?.student_metrics?.total_sessions || 0}</p>
                <p>Accuracy: {formatPercentage(metrics?.student_metrics?.average_accuracy || 0)}</p>
                <p>Concepts Mastered: {metrics?.student_metrics?.concepts_mastered || 0}</p>
              </div>

              <div className={styles.metricCard}>
                <h4>Teacher Activity</h4>
                <p>Total Lessons: {metrics?.teacher_metrics?.total_lessons || 0}</p>
                <p>Avg per Teacher: {Math.round((metrics?.teacher_metrics?.average_lessons_per_teacher || 0) * 100) / 100}</p>
              </div>
            </div>
          ) : (
            // Detailed metrics
            <div className={styles.detailedMetrics}>
              <div className={styles.metricsSection}>
                <h3>User Metrics</h3>
                <div className={styles.metricsGrid}>
                  <div className={styles.metricItem}>
                    <label>Total Users:</label>
                    <span>{metrics?.user_metrics?.total_users || 0}</span>
                  </div>
                  <div className={styles.metricItem}>
                    <label>7-day Active:</label>
                    <span>{metrics?.user_metrics?.active_last_7d || 0}</span>
                  </div>
                  <div className={styles.metricItem}>
                    <label>30-day Active:</label>
                    <span>{metrics?.user_metrics?.active_last_30d || 0}</span>
                  </div>
                  <div className={styles.metricItem}>
                    <label>7-day Retention:</label>
                    <span>{formatPercentage(metrics?.user_metrics?.retention_rate_7d || 0)}</span>
                  </div>
                  <div className={styles.metricItem}>
                    <label>30-day Retention:</label>
                    <span>{formatPercentage(metrics?.user_metrics?.retention_rate_30d || 0)}</span>
                  </div>
                </div>
              </div>

              <div className={styles.metricsSection}>
                <h3>Student Performance</h3>
                <div className={styles.metricsGrid}>
                  <div className={styles.metricItem}>
                    <label>Total Sessions:</label>
                    <span>{metrics?.student_metrics?.total_sessions || 0}</span>
                  </div>
                  <div className={styles.metricItem}>
                    <label>Total Questions:</label>
                    <span>{metrics?.student_metrics?.total_questions || 0}</span>
                  </div>
                  <div className={styles.metricItem}>
                    <label>Correct Answers:</label>
                    <span>{metrics?.student_metrics?.total_correct || 0}</span>
                  </div>
                  <div className={styles.metricItem}>
                    <label>Average Accuracy:</label>
                    <span>{formatPercentage(metrics?.student_metrics?.average_accuracy || 0)}</span>
                  </div>
                  <div className={styles.metricItem}>
                    <label>Concepts Mastered:</label>
                    <span>{metrics?.student_metrics?.concepts_mastered || 0}</span>
                  </div>
                  <div className={styles.metricItem}>
                    <label>Rewards Earned:</label>
                    <span>{metrics?.student_metrics?.rewards_earned || 0}</span>
                  </div>
                </div>
              </div>

              <div className={styles.metricsSection}>
                <h3>Teacher Activity</h3>
                <div className={styles.metricsGrid}>
                  <div className={styles.metricItem}>
                    <label>Total Lessons:</label>
                    <span>{metrics?.teacher_metrics?.total_lessons || 0}</span>
                  </div>
                  <div className={styles.metricItem}>
                    <label>Avg per Teacher:</label>
                    <span>{Math.round((metrics?.teacher_metrics?.average_lessons_per_teacher || 0) * 100) / 100}</span>
                  </div>
                </div>
                
                {metrics?.teacher_metrics?.lessons_by_subject && Object.keys(metrics.teacher_metrics.lessons_by_subject).length > 0 && (
                  <div className={styles.subjectBreakdown}>
                    <h4>Lessons by Subject:</h4>
                    {Object.entries(metrics.teacher_metrics.lessons_by_subject).map(([subject, count]) => (
                      <div key={subject} className={styles.subjectItem}>
                        <span>{subject}:</span>
                        <span>{count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.metricsSection}>
                <h3>System Health</h3>
                <div className={styles.metricsGrid}>
                  <div className={styles.metricItem}>
                    <label>Data Size:</label>
                    <span>{formatBytes(metrics?.system_health?.data_directory_size || 0)}</span>
                  </div>
                  <div className={styles.metricItem}>
                    <label>Total Files:</label>
                    <span>{metrics?.system_health?.total_files || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className={styles.actionButtons}>
        <button 
          className={styles.refreshBtn}
          onClick={loadMetrics}
          disabled={loading}
        >
          🔄 Refresh Metrics
        </button>
      </div>
    </div>
  );
}

export default SchoolPerformanceOverview;