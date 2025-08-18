import React, { useEffect, useState, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { isOnline } from '../../../utils/networkStatus';
import styles from './GlobalNavigation.module.css';
import SubscribeModal from '../../SubscribeModal';
import kindredLogo from '../../../assets/images/kindred-logo.png';
import LessonPlanner from '../../student/LessonPlanner';
import IssueReportModal from '../../IssueReportModal';

const GlobalNavigation = ({ user: propUser }) => {
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [user, setUser] = useState(propUser || {});
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [showLessonMenu, setShowLessonMenu] = useState(false);

  // Issue reporting modal state + lightweight recent logs ring
  const [showIssueModal, setShowIssueModal] = useState(false);
  const recentLogsRef = useRef([]);

  // Optional: simple client log capture (swap with your logger if present)
  useEffect(() => {
    const origLog = console.log;
    const origErr = console.error;
    const push = (type, args) => {
      const entry = `[${new Date().toISOString()}] ${type}: ${Array.from(args).map(String).join(' ')}`;
      recentLogsRef.current.push(entry);
      if (recentLogsRef.current.length > 100) recentLogsRef.current.shift();
    };
    console.log = (...args) => { push('log', args); origLog(...args); };
    console.error = (...args) => { push('error', args); origErr(...args); };
    return () => { console.log = origLog; console.error = origErr; };
  }, []);

  useEffect(() => {
    if (!propUser) {
      const storedRole = localStorage.getItem('userRole');
      const imageUrl = localStorage.getItem('userImageUrl');
      const email = localStorage.getItem('userEmail');
      const isPremium = localStorage.getItem('isPremium') === 'true';
      setUser({ role: storedRole, imageUrl, email, isPremium });
    }
  }, [propUser]);

  useEffect(() => {
    const checkConnectivity = async () => {
      try {
        const online = await isOnline();
        console.log("Connectivity Check: Online Status -", online);
        setIsConnected(online);
      } catch (error) {
        console.error("Error checking connectivity:", error);
        setIsConnected(false);
      }
    };

    checkConnectivity();
    const interval = setInterval(checkConnectivity, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('googleLoggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    setShowLogoutConfirm(false);
    setTimeout(() => navigate('/'), 100);
  };

  const toggleLessonMenu = () => {
    setShowLessonMenu(prev => !prev);
  };

  // ---- Issue Report wiring ----
  const collectExtras = async () => {
    try {
      return {
        role: user?.role || 'unknown',
        emailHint: user?.email ? user.email.replace(/(.{2}).+(@.+)/, '$1***$2') : undefined,
        connectivity: isConnected,
        // Add any feature flags or environment bits here if you want
      };
    } catch {
      return { extrasError: true };
    }
  };

  const handleIssueSubmit = async (payload) => {
    // Adjust endpoint to your backend route
    const formData = new FormData();
    formData.set(
      'meta',
      new Blob(
        [JSON.stringify({ ...payload, attachments: undefined })],
        { type: 'application/json' }
      )
    );
    for (const f of payload.attachments) formData.append('files', f);

    const res = await fetch('/api/issue-report', { method: 'POST', body: formData });
    if (!res.ok) throw new Error(`Issue report failed with status ${res.status}`);
  };

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.leftSection}>
          <div
            className={styles.logo}
            onClick={() => navigate(`/dashboard/${user?.role || 'student'}`)}
          >
            <img src={kindredLogo} alt="Kindred Logo" className={styles.logoImage} />
            <span className={styles.logoText}>EDU OS</span>
          </div>

          <div className={styles.connectionIndicator}>
            <div className={`${styles.statusDot} ${isConnected ? styles.connected : styles.disconnected}`}></div>
            <span className={styles.statusText}>
              {isConnected ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        <div className={styles.centerSection}>
          <input
            type="text"
            placeholder="Search..."
            className={styles.searchBar}
          />
        </div>

        <div className={styles.rightSection}>
          <button
            className={styles.iconButton}
            onClick={toggleLessonMenu}
            title="Lesson Planner"
          >
            📘
          </button>

          {/* Warning triangle opens Issue Reporter */}
          <button
            className={styles.iconButton}
            onClick={() => setShowIssueModal(true)}
            title="Report an issue"
            aria-label="Report an issue"
          >
            <span className={styles.settingsIcon} role="img" aria-hidden="true">⚠️</span>
          </button>

          <div
            className={styles.profile}
            onClick={() => navigate('/profile')}
            title="Profile"
          >
            {user?.imageUrl ? (
              <img src={user.imageUrl} alt="Profile Avatar" className={styles.avatar} />
            ) : (
              <div className={styles.placeholderAvatar}>
                <span>👤</span>
              </div>
            )}
          </div>

          {!user?.isPremium && (
            <button
              className={styles.subscribeButton}
              onClick={() => setShowSubscribeModal(true)}
            >
              <span className={styles.subscribeIcon}>✨</span>
              Subscribe
            </button>
          )}

          <button
            className={styles.logoutButton}
            onClick={() => setShowLogoutConfirm(true)}
            title="Log Out"
          >
            <span className={styles.logoutIcon}>🔓</span>
            Log Out
          </button>
        </div>
      </nav>

      {showLessonMenu && (
        <div className={styles.lessonMenuDropdown}>
          <LessonPlanner onClose={() => setShowLessonMenu(false)} />
        </div>
      )}

      {showLogoutConfirm && (
        <div className={styles.modalOverlay}>
          <div className={styles.confirmModal}>
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to log out?</p>
            <div className={styles.modalActions}>
              <button
                className={styles.cancelButton}
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button
                className={styles.confirmButton}
                onClick={handleLogout}
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      <SubscribeModal
        isOpen={showSubscribeModal}
        onClose={() => setShowSubscribeModal(false)}
        title="Subscribe to EDU OS"
        user={user}
      >
        <p>Unlock full features, premium tools, and priority support by subscribing.</p>
      </SubscribeModal>

      <IssueReportModal
        open={showIssueModal}
        onClose={() => setShowIssueModal(false)}
        onSubmit={handleIssueSubmit}
        collectExtras={collectExtras}
        recentLogs={recentLogsRef.current}
        defaultSeverity="medium"
      />
    </>
  );
};

export default GlobalNavigation;
