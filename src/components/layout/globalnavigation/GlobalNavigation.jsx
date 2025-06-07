import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { isOnline } from '../../../utils/networkStatus'; // Import the network status utility
import styles from './GlobalNavigation.module.css';

const GlobalNavigation = ({ user }) => {
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const checkConnectivity = async () => {
      try {
        const online = await isOnline();
        console.log("Connectivity Check: Online Status -", online); // Debug log
        setIsConnected(online);
      } catch (error) {
        console.error("Error checking connectivity:", error);
        setIsConnected(false);
      }
    };

    checkConnectivity();

    // Set an interval to regularly check connectivity
    const interval = setInterval(checkConnectivity, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('googleLoggedIn'); // Clear the Google login token
    alert('You have been logged out.');
    setTimeout(() => navigate('/pages/Login'), 100); // Redirect to the correct login page after a short delay
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo} onClick={() => navigate('/dashboard')}>KOSEdu SDK</div>
      <ul className={styles.navLinks} style={{ justifyContent: 'flex-end' }}>
        <li>
          <NavLink
            to="/dashboard"
            className={({ isActive }) => (isActive ? styles.active : undefined)}
          >
            Dashboard
          </NavLink>
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
        <span
          className={isConnected ? styles.connected : styles.disconnected}
        >
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
