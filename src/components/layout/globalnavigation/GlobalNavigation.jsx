import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { isOnline } from '../../../utils/networkStatus';
import styles from './GlobalNavigation.module.css';
import SubscribeModal from '../../SubscribeModal';
import kindredLogo from '../../../assets/images/kindred-logo.png';
import LessonPlanner from '../../student/LessonPlanner';

const GlobalNavigation = ({ user: propUser }) => {
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [user, setUser] = useState(propUser || {});
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [showLessonMenu, setShowLessonMenu] = useState(false);

  useEffect(() => {
    if (!propUser) {
      const storedRole = localStorage.getItem('userRole');
      const imageUrl = localStorage.getItem('userImageUrl');
      const email = localStorage.getItem('userEmail');
      setUser({ role: storedRole, imageUrl, email });
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

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.leftSection}>
          <div className={styles.logo} onClick={() => navigate(`/dashboard/${user?.role || 'student'}`)}> {/* Logo Click Home */}
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
            onClick={() => setShowSubscribeModal(true)}
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
        title="Subscribe to KOSEdu SDK"
        user={user}
      >
        <p>Unlock full features, premium tools, and priority support by subscribing.</p>
      </SubscribeModal>
    </>
  );
};

export default GlobalNavigation;
