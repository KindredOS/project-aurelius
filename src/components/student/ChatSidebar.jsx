// components/student/ChatSidebar.jsx
import React, { useEffect, useState } from 'react';
import { MessageSquare, Clock, X } from 'lucide-react';
import { fetchChatThreads } from '../../api/Science';

const ChatSidebar = ({ email, activeThreadId, onSelectThread, isOpen, onClose, styles }) => {
  const [threads, setThreads] = useState([]);

  useEffect(() => {
    if (email) {
      fetchChatThreads(email).then(setThreads);
    }
  }, [email]);

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && <div className={styles.backdrop} onClick={onClose} />}
      
      {/* Sidebar */}
      <div className={`${styles.chatSidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.sidebarHeader}>
          <h3 className={styles.sidebarTitle}>
            <MessageSquare className={styles.sidebarIcon} />
            Chat Threads
          </h3>
          <button
            onClick={onClose}
            className={styles.closeButton}
          >
            <X className={styles.closeIcon} />
          </button>
        </div>
        
        <div className={styles.threadListContainer}>
          {threads.length === 0 ? (
            <div className={styles.emptyThreads}>
              <MessageSquare className={styles.emptyThreadsIcon} />
              <p className={styles.emptyThreadsText}>No chat threads yet</p>
            </div>
          ) : (
            <ul className={styles.threadList}>
              {threads.map((thread) => (
                <li
                  key={thread.threadId}
                  className={`${styles.threadItem} ${thread.threadId === activeThreadId ? styles.active : ''}`}
                  onClick={() => onSelectThread(thread.threadId)}
                >
                  <div className={styles.threadHeader}>
                    <div className={styles.threadSubject}>{thread.subject || 'General'}</div>
                    <div className={styles.threadTimestamp}>
                      <Clock className={styles.clockIcon} />
                      {new Date(thread.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                  <div className={styles.threadPreview}>{thread.preview || 'No preview available'}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
};

export default ChatSidebar;