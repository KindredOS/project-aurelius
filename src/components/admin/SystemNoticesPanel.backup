import React, { useState, useEffect } from 'react';
import { fetchNotices, createNotice, deleteNotice } from '../../api/Admin';
import styles from './AdminModules.module.css';

function SystemNoticesPanel({ dashboardData }) {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newNotice, setNewNotice] = useState({
    title: '',
    content: '',
    priority: 'medium',
    target_audience: 'all',
    expires_at: ''
  });

  useEffect(() => {
    loadNotices();
  }, []);

  const loadNotices = async () => {
    try {
      setLoading(true);
      const noticeData = await fetchNotices();
      setNotices(noticeData);
    } catch (error) {
      console.error('Failed to load notices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNotice = async (e) => {
    e.preventDefault();
    
    if (!newNotice.title.trim() || !newNotice.content.trim()) {
      alert('Please fill in title and content');
      return;
    }

    try {
      await createNotice(newNotice);
      setNewNotice({
        title: '',
        content: '',
        priority: 'medium',
        target_audience: 'all',
        expires_at: ''
      });
      setShowCreateForm(false);
      loadNotices(); // Refresh the notices list
      alert('Notice created successfully!');
    } catch (error) {
      console.error('Failed to create notice:', error);
      alert('Failed to create notice. Please try again.');
    }
  };

  const handleDeleteNotice = async (noticeId) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) {
      return;
    }

    try {
      await deleteNotice(noticeId);
      loadNotices(); // Refresh the notices list
      alert('Notice deleted successfully!');
    } catch (error) {
      console.error('Failed to delete notice:', error);
      alert('Failed to delete notice. Please try again.');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#ff4757';
      case 'high': return '#ff6b6b';
      case 'medium': return '#ffa502';
      case 'low': return '#2ed573';
      default: return '#57606f';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '📢';
      case 'low': return 'ℹ️';
      default: return '📝';
    }
  };

  const getAudienceIcon = (audience) => {
    switch (audience) {
      case 'students': return '🎓';
      case 'teachers': return '👨‍🏫';
      case 'all': return '👥';
      default: return '👤';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No expiration';
    return new Date(dateString).toLocaleDateString();
  };

  const isExpired = (expiresAt) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2>🔔 System Notices</h2>
        <button 
          className={styles.createBtn}
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : '+ Create Notice'}
        </button>
      </div>

      {/* Create Notice Form */}
      {showCreateForm && (
        <div className={styles.createForm}>
          <form onSubmit={handleCreateNotice}>
            <div className={styles.formGroup}>
              <label>Title:</label>
              <input
                type="text"
                value={newNotice.title}
                onChange={(e) => setNewNotice({...newNotice, title: e.target.value})}
                placeholder="Enter notice title"
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>Content:</label>
              <textarea
                value={newNotice.content}
                onChange={(e) => setNewNotice({...newNotice, content: e.target.value})}
                placeholder="Enter notice content"
                rows="3"
                required
              />
            </div>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Priority:</label>
                <select
                  value={newNotice.priority}
                  onChange={(e) => setNewNotice({...newNotice, priority: e.target.value})}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              
              <div className={styles.formGroup}>
                <label>Target Audience:</label>
                <select
                  value={newNotice.target_audience}
                  onChange={(e) => setNewNotice({...newNotice, target_audience: e.target.value})}
                >
                  <option value="all">All Users</option>
                  <option value="students">Students</option>
                  <option value="teachers">Teachers</option>
                </select>
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <label>Expires At (optional):</label>
              <input
                type="datetime-local"
                value={newNotice.expires_at}
                onChange={(e) => setNewNotice({...newNotice, expires_at: e.target.value})}
              />
            </div>
            
            <div className={styles.formActions}>
              <button type="submit" className={styles.submitBtn}>
                Create Notice
              </button>
              <button 
                type="button" 
                className={styles.cancelBtn}
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Notices List */}
      {loading ? (
        <div className={styles.loading}>Loading notices...</div>
      ) : (
        <div className={styles.noticesList}>
          {notices.length === 0 ? (
            <div className={styles.noNotices}>
              <p>No active notices</p>
              <small>Create a notice to communicate with users</small>
            </div>
          ) : (
            notices.map((notice, index) => (
              <div 
                key={notice.id || index} 
                className={`${styles.noticeCard} ${isExpired(notice.expires_at) ? styles.expired : ''}`}
              >
                <div className={styles.noticeHeader}>
                  <div className={styles.noticeTitle}>
                    <span className={styles.priorityIcon}>
                      {getPriorityIcon(notice.priority)}
                    </span>
                    <h4>{notice.title}</h4>
                    <span className={styles.audienceIcon}>
                      {getAudienceIcon(notice.target_audience)}
                    </span>
                  </div>
                  <button 
                    className={styles.deleteNoticeBtn}
                    onClick={() => handleDeleteNotice(notice.id)}
                    title="Delete notice"
                  >
                    🗑️
                  </button>
                </div>
                
                <div className={styles.noticeContent}>
                  <p>{notice.content}</p>
                </div>
                
                <div className={styles.noticeMeta}>
                  <span 
                    className={styles.priorityTag}
                    style={{ backgroundColor: getPriorityColor(notice.priority) }}
                  >
                    {notice.priority}
                  </span>
                  <span className={styles.audience}>
                    Target: {notice.target_audience}
                  </span>
                  <span className={styles.expiry}>
                    Expires: {formatDate(notice.expires_at)}
                  </span>
                  <span className={styles.created}>
                    Created: {formatDate(notice.created_at)}
                  </span>
                </div>
                
                {isExpired(notice.expires_at) && (
                  <div className={styles.expiredBanner}>
                    ⚠️ This notice has expired
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      <div className={styles.actionButtons}>
        <button 
          className={styles.refreshBtn}
          onClick={loadNotices}
          disabled={loading}
        >
          🔄 Refresh Notices
        </button>
      </div>
    </div>
  );
}

export default SystemNoticesPanel;