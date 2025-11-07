import React, { useState, useEffect } from 'react';
import { fetchSchoolMetrics, fetchAllEngagement } from '../../api/Admin';
import styles from './SchoolPerformanceOverview.module.css';

function SchoolPerformanceOverview({ dashboardData }) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState('overview'); // 'overview', 'engagement', 'performance'
  const [engagementData, setEngagementData] = useState({});
  const [loadingEngagement, setLoadingEngagement] = useState(false);

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

  const loadEngagementData = async () => {
    if (Object.keys(engagementData).length === 0) {
      try {
        setLoadingEngagement(true);
        const data = await fetchAllEngagement();
        setEngagementData(data);
      } catch (err) {
        console.error("Failed to fetch engagement detail", err);
      } finally {
        setLoadingEngagement(false);
      }
    }
  };

  const formatPercentage = (value) => {
    return `${Math.round(value * 100) / 100}%`;
  };

  const calcMinutesPerPoint = (avgScore, totalMinutes) => {
    if (!avgScore || avgScore === 0) return 0;
    if (!totalMinutes || totalMinutes === 0) return 0;
    return (totalMinutes / avgScore).toFixed(1);
  };

  const calcSuccessMarker = (avgScore, allSubjects) => {
    const scores = Object.values(allSubjects).map(s => s.average_score || 0);
    if (!scores.length) return "N/A";
    const programAvg = scores.reduce((a, b) => a + b, 0) / scores.length;
    if (avgScore > programAvg * 1.1) return "excellent";
    if (avgScore > programAvg) return "good";
    if (avgScore < programAvg * 0.9) return "needsAttention";
    return "average";
  };

  const getPerformanceColor = (score) => {
    if (score >= 80) return styles.excellent;
    if (score >= 70) return styles.good;
    if (score >= 60) return styles.average;
    return styles.needsAttention;
  };

  const handleViewChange = (view) => {
    setActiveView(view);
    if (view === 'engagement') {
      loadEngagementData();
    }
  };

  if (loading) {
    return (
      <div className={styles.cardContainer}>
        <div className={styles.cardHeader}>
          <h2>📊 School Performance</h2>
        </div>
        <div className={styles.loadingSpinner}>
          <div className={styles.spinner}></div>
          <p>Loading school metrics...</p>
        </div>
      </div>
    );
  }

  const overallPerformance = metrics?.student_metrics?.subject_scores 
    ? Object.values(metrics.student_metrics.subject_scores)
        .reduce((sum, subj) => sum + (subj.average_score || 0), 0) / 
      Object.keys(metrics.student_metrics.subject_scores).length
    : 0;

  return (
    <div className={styles.cardContainer}>
      <div className={styles.cardHeader}>
        <h2>📊 School Performance</h2>
        <button 
          className={styles.refreshBtn}
          onClick={loadMetrics}
          disabled={loading}
          title="Refresh Metrics"
        >
          🔄
        </button>
      </div>

      {/* Performance Summary */}
      <div className={styles.performanceSummary}>
        <div className={styles.mainMetric}>
          <div className={styles.metricValue}>{Math.round(overallPerformance)}%</div>
          <div className={styles.metricLabel}>Performance Avg</div>
          <div className={`${styles.statusBadge} ${getPerformanceColor(overallPerformance)}`}>
            {overallPerformance >= 70 ? 'On Track' : 'Needs Attention'}
          </div>
        </div>
        <div className={styles.quickStats}>
          <div className={styles.quickStat}>
            <div className={styles.statValue}>{metrics?.user_metrics?.active_last_7d || 0}</div>
            <div className={styles.statLabel}>Active (7d)</div>
          </div>
          <div className={styles.quickStat}>
            <div className={styles.statValue}>{Math.round((metrics?.student_metrics?.total_engagement_minutes || 0) / 60)}h</div>
            <div className={styles.statLabel}>Study Time</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className={styles.tabNavigation}>
        <button 
          className={`${styles.tab} ${activeView === 'overview' ? styles.activeTab : ''}`}
          onClick={() => handleViewChange('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`${styles.tab} ${activeView === 'performance' ? styles.activeTab : ''}`}
          onClick={() => handleViewChange('performance')}
        >
          🎯 Performance
        </button>
        <button 
          className={`${styles.tab} ${activeView === 'engagement' ? styles.activeTab : ''}`}
          onClick={() => handleViewChange('engagement')}
        >
          👨‍💻 Engagement
        </button>
      </div>

      {/* Content Area */}
      <div className={styles.contentArea}>
        {activeView === 'overview' && (
          <div className={styles.overviewContent}>
            <div className={styles.metricsGrid}>
              <div className={styles.metric}>
                <span className={styles.metricIcon}>👥</span>
                <div>
                  <div className={styles.metricNumber}>{metrics?.user_metrics?.active_last_30d || 0}</div>
                  <div className={styles.metricDesc}>Active Students (30d)</div>
                </div>
              </div>
              <div className={styles.metric}>
                <span className={styles.metricIcon}>📈</span>
                <div>
                  <div className={styles.metricNumber}>{formatPercentage(metrics?.user_metrics?.retention_rate_30d || 0)}</div>
                  <div className={styles.metricDesc}>Retention Rate</div>
                </div>
              </div>
              <div className={styles.metric}>
                <span className={styles.metricIcon}>🏃‍♂️</span>
                <div>
                  <div className={styles.metricNumber}>{Math.round(metrics?.student_metrics?.average_current_streak || 0)}</div>
                  <div className={styles.metricDesc}>Avg Streak</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'performance' && (
          <div className={styles.performanceContent}>
            <div className={styles.subjectsList}>
              {metrics?.student_metrics?.subject_scores && 
                Object.entries(metrics.student_metrics.subject_scores)
                  .sort(([,a], [,b]) => (b.average_score || 0) - (a.average_score || 0))
                  .map(([subject, data]) => {
                    const score = Math.round(data.average_score || 0);
                    const marker = calcSuccessMarker(data.average_score, metrics.student_metrics.subject_scores);
                    return (
                      <div key={subject} className={styles.subjectItem}>
                        <div>
                          <div className={styles.subjectName}>
                            {subject.charAt(0).toUpperCase() + subject.slice(1)}
                          </div>
                          <div className={styles.subjectMeta}>
                            {calcMinutesPerPoint(data.average_score, metrics?.student_metrics?.total_engagement_minutes)} min/pt
                          </div>
                        </div>
                        <div className={`${styles.subjectScore} ${styles[marker]}`}>
                          {score}%
                        </div>
                      </div>
                    );
                  })
              }
            </div>
          </div>
        )}

        {activeView === 'engagement' && (
          <div className={styles.engagementContent}>
            {loadingEngagement ? (
              <div className={styles.loadingSpinner}>
                <div className={styles.spinner}></div>
                <p>Loading engagement data...</p>
              </div>
            ) : (
              <div className={styles.studentsList}>
                {Object.entries(engagementData)
                  .sort(([,a], [,b]) => (b.active_minutes || 0) - (a.active_minutes || 0))
                  .map(([email, data]) => (
                    <div key={email} className={styles.studentItem}>
                      <div className={styles.studentInfo}>
                        <div className={styles.studentEmail}>{email}</div>
                        <div className={styles.studentStats}>
                          {data.active_minutes || 0}m • {data.current_streak_days || 0} day streak
                        </div>
                      </div>
                      <div className={styles.studentBadges}>
                        <div className={styles.minutesBadge}>{data.active_minutes || 0}m</div>
                      </div>
                    </div>
                  ))
                }
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SchoolPerformanceOverview;