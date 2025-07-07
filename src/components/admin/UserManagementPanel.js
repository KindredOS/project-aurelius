import React, { useState, useEffect } from 'react';
import { fetchAllUsers, fetchUsersByRole, deleteUser } from '../../api/Admin';
import styles from './AdminModules.module.css';

function UserManagementPanel({ dashboardData }) {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedRole, setSelectedRole] = useState('all');
  const [loading, setLoading] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);

  // Load initial users
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const userData = await fetchAllUsers();
      setUsers(userData);
      setFilteredUsers(userData);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleFilter = async (role) => {
    setSelectedRole(role);
    try {
      setLoading(true);
      if (role === 'all') {
        const userData = await fetchAllUsers();
        setFilteredUsers(userData);
      } else {
        const userData = await fetchUsersByRole(role);
        setFilteredUsers(userData);
      }
    } catch (error) {
      console.error(`Failed to filter users by ${role}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userEmail) => {
    if (!window.confirm(`Are you sure you want to delete user: ${userEmail}?`)) {
      return;
    }

    try {
      await deleteUser(userEmail);
      // Refresh the user list
      loadUsers();
      alert('User deleted successfully');
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user. Please try again.');
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return '#ff6b6b';
      case 'teacher': return '#4dabf7';
      case 'student': return '#51cf66';
      default: return '#868e96';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2>👥 User Management</h2>
        <button 
          className={styles.toggleButton}
          onClick={() => setShowUserDetails(!showUserDetails)}
        >
          {showUserDetails ? 'Hide Details' : 'Show Details'}
        </button>
      </div>

      {/* Role Filter Buttons */}
      <div className={styles.filterButtons}>
        <button 
          className={`${styles.filterBtn} ${selectedRole === 'all' ? styles.active : ''}`}
          onClick={() => handleRoleFilter('all')}
        >
          All ({users.length})
        </button>
        <button 
          className={`${styles.filterBtn} ${selectedRole === 'student' ? styles.active : ''}`}
          onClick={() => handleRoleFilter('student')}
        >
          Students ({dashboardData?.summary?.role_distribution?.student || 0})
        </button>
        <button 
          className={`${styles.filterBtn} ${selectedRole === 'teacher' ? styles.active : ''}`}
          onClick={() => handleRoleFilter('teacher')}
        >
          Teachers ({dashboardData?.summary?.role_distribution?.teacher || 0})
        </button>
        <button 
          className={`${styles.filterBtn} ${selectedRole === 'admin' ? styles.active : ''}`}
          onClick={() => handleRoleFilter('admin')}
        >
          Admins ({dashboardData?.summary?.role_distribution?.admin || 0})
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading users...</div>
      ) : (
        <div className={styles.userList}>
          {showUserDetails ? (
            // Detailed user cards
            <div className={styles.userCards}>
              {filteredUsers.map((user, index) => (
                <div key={index} className={styles.userCard}>
                  <div className={styles.userCardHeader}>
                    <span 
                      className={styles.roleTag}
                      style={{ backgroundColor: getRoleColor(user.role) }}
                    >
                      {user.role}
                    </span>
                    <button 
                      className={styles.deleteBtn}
                      onClick={() => handleDeleteUser(user.email)}
                      title="Delete user"
                    >
                      🗑️
                    </button>
                  </div>
                  <h4>{user.name || 'No name'}</h4>
                  <p className={styles.userEmail}>{user.email}</p>
                  <div className={styles.userMeta}>
                    <small>Created: {formatDate(user.created_at)}</small>
                    <small>Last login: {formatDate(user.last_login)}</small>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Simple user list
            <ul className={styles.simpleUserList}>
              {filteredUsers.slice(0, 10).map((user, index) => (
                <li key={index} className={styles.userListItem}>
                  <span 
                    className={styles.roleIndicator}
                    style={{ backgroundColor: getRoleColor(user.role) }}
                  ></span>
                  <span className={styles.userName}>{user.name || user.email}</span>
                  <span className={styles.userRole}>({user.role})</span>
                </li>
              ))}
              {filteredUsers.length > 10 && (
                <li className={styles.moreUsers}>
                  ...and {filteredUsers.length - 10} more users
                </li>
              )}
            </ul>
          )}
        </div>
      )}

      {filteredUsers.length === 0 && !loading && (
        <p className={styles.noUsers}>No users found for selected filter.</p>
      )}
    </div>
  );
}

export default UserManagementPanel;