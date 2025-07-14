import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { isOnline } from '../../../utils/networkStatus';
import styles from './GlobalNavigation.module.css';

const GlobalNavigation = ({ user: propUser }) => {
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [user, setUser] = useState(propUser || {});

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
    alert('You have been logged out.');
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
    <nav className={styles.navbar}>
      <div className={styles.logo} onClick={handleDashboardNavigation}>KOSEdu SDK</div>
      <ul className={styles.navLinks} style={{ justifyContent: 'flex-end' }}>
        <li>
          <div
            onClick={handleDashboardNavigation}
            className={styles.navLink}
            style={{ cursor: 'pointer' }}
          >
            Dashboard
          </div>
        </li>
        <li>
          <NavLink
            to="/settings"
            className={({ isActive }) => (isActive ? styles.active : undefined)}
          >
            <span className={styles.gearIcon}>⚙️</span>
          </NavLink>
        </li>
        <li>
          <div className={styles.profile} onClick={() => navigate('/profile')}>
            {user?.imageUrl ? (
              <img src={user.imageUrl} alt="Profile Avatar" className={styles.avatar} />
            ) : (
              <div className={styles.placeholderAvatar}>👤</div>
            )}
          </div>
        </li>
      </ul>
      <div className={styles.connectionIndicator} style={{ textAlign: 'center', flex: 1 }}>
        <span className={isConnected ? styles.connected : styles.disconnected}>
          {isConnected ? '● Connected' : '● Not Connected'}
        </span>
      </div>
      <button 
        className={styles.subscribeButton} 
        onClick={() => window.open('https://yb8bhot2zodnchlt.vercel.app/', '_blank')}
      >
        Subscribe
      </button>
      <button 
        className={styles.logoutButton} 
        onClick={handleLogout}
        style={{ marginLeft: '10px', backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '5px', padding: '5px 10px' }}
      >
        Power Off
      </button>
    </nav>
  );
};

export default GlobalNavigation;
