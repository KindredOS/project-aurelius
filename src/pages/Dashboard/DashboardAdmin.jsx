import React, { useState, useEffect } from 'react';
import UserManagementPanel from '../../components/admin/UserManagementPanel';
import SchoolPerformanceOverview from '../../components/admin/SchoolPerformanceOverview';
import SystemNoticesPanel from '../../components/admin/SystemNoticesPanel';
import QuickActionsPanel from '../../components/teacher/QuickActionsPanel';
import { fetchAdminInit } from '../../api/Admin';
import styles from './DashboardAdmin.module.css';

function DashboardAdmin() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const data = await fetchAdminInit();
        console.log('Admin Dashboard Data:', data);
        setDashboardData(data);
        setError(null);
      } catch (error) {
        console.error('Failed to fetch admin dashboard data:', error);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  if (loading) {
    return (
      <div className={styles.dashboardContainer}>
        <div className={styles.loadingState}>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.dashboardContainer}>
        <div className={styles.errorState}>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      {/* Summary Cards Only */}
      {dashboardData?.summary && (
        <div className={styles.summaryCards}>
          <div className={styles.summaryCard}>
            <h3>Total Users</h3>
            <p className={styles.summaryNumber}>
              {dashboardData.summary.total_users}
            </p>
          </div>
          <div className={styles.summaryCard}>
            <h3>Students</h3>
            <p className={styles.summaryNumber}>
              {dashboardData.summary.role_distribution.student}
            </p>
          </div>
          <div className={styles.summaryCard}>
            <h3>Teachers</h3>
            <p className={styles.summaryNumber}>
              {dashboardData.summary.role_distribution.teacher}
            </p>
          </div>
          <div className={styles.summaryCard}>
            <h3>Active (30d)</h3>
            <p className={styles.summaryNumber}>
              {dashboardData.summary.active_users_30d}
            </p>
          </div>
        </div>
      )}

      <div className={styles.horizontalLayout}>
        <SchoolPerformanceOverview dashboardData={dashboardData} />
        <UserManagementPanel dashboardData={dashboardData} />
        <SystemNoticesPanel dashboardData={dashboardData} />
      </div>

      <div className={styles.footerMenu}>
        <QuickActionsPanel />
      </div>
    </div>
  );
}

export default DashboardAdmin;
