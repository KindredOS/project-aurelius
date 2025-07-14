import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { isOnline } from '../../../utils/networkStatus';
import styles from './GlobalNavigation.module.css';

const GlobalNavigation = ({ user: propUser }) => {
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [user, setUser] = useState(propUser || {});
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    if (!propUser) {
      const storedRole = localStorage.getItem('userRole');
      const imageUrl = localStorage.getItem('userImageUrl');
      setUser({ role: storedRole, imageUrl });
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
    setShowLogoutConfirm(false);
    setTimeout(() => navigate('/'), 100);
  };

  const handleDashboardNavigation = () => {
    const role = user?.role;
    if (['student', 'teacher', 'admin'].includes(role)) {
      navigate(`/dashboard/${role}`);
    } else {
      console.warn('No valid role found for dashboard navigation. Redirecting to home.');
      navigate('/');
    }
  };

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.leftSection}>
          <div className={styles.logo} onClick={handleDashboardNavigation}>
            <span className={styles.logoIcon}>🎓</span>
            <span className={styles.logoText}>KOSEdu SDK</span>
          </div>
          
          <div className={styles.connectionIndicator}>
            <div className={`${styles.statusDot} ${isConnected ? styles.connected : styles.disconnected}`}></div>
            <span className={styles.statusText}>
              {isConnected ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        <div className={styles.centerSection}>
          <button
            onClick={handleDashboardNavigation}
            className={styles.dashboardButton}
          >
            <span className={styles.dashboardIcon}>📊</span>
            Dashboard
          </button>
        </div>

        <div className={styles.rightSection}>
          <NavLink
            to="/settings"
            className={({ isActive }) => 
              `${styles.iconButton} ${isActive ? styles.active : ''}`
            }
            title="Settings"
          >
            <span className={styles.settingsIcon}>⚙️</span>
          </NavLink>

          <div className={styles.profile} onClick={() => navigate('/profile')} title="Profile">
            {user?.imageUrl ? (
              <img src={user.imageUrl} alt="Profile Avatar" className={styles.avatar} />
            ) : (
              <div className={styles.placeholderAvatar}>
                <span>👤</span>
              </div>
            )}
          </div>

          <button 
            className={styles.subscribeButton} 
            onClick={() => window.open('https://yb8bhot2zodnchlt.vercel.app/', '_blank')}
          >
            <span className={styles.subscribeIcon}>✨</span>
            Subscribe
          </button>

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
    </>
  );
};

export default GlobalNavigation;