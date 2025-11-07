import React from 'react';
import { MessageSquare, Clock, X, Plus } from 'lucide-react';

const ChatSidebar = ({
  email,
  subject = 'general',
  threads = [],
  activeThreadId,
  onSelectThread,
  isOpen,
  onClose,
  styles,
  theme
}) => {
  const handleNewChat = () => {
    const newThreadId = crypto.randomUUID();
    onSelectThread(newThreadId);
  };

  return (
    <>
      {isOpen && <div className={styles.backdrop} onClick={onClose} />}

      <div className={`${styles.chatSidebar} ${isOpen ? styles.open : ''}`}>
        <div
          className={styles.sidebarHeader}
          style={{
            background: theme.gradient,
            color: '#fff',
            boxShadow: `0 2px 8px ${theme.primary}33`,
          }}
        >
          <h3 className={styles.sidebarTitle}>
            <MessageSquare className={styles.sidebarIcon} />
            Chat Threads
          </h3>
          <button
            onClick={onClose}
            className={styles.closeButton}
            style={{ background: 'rgba(255,255,255,0.15)' }}
          >
            <X className={styles.closeIcon} />
          </button>
        </div>

        <div className={styles.threadListContainer}>
          <button
            className={styles.newChatButton}
            onClick={handleNewChat}
            style={{
              background: theme.gradient,
              color: '#fff',
              boxShadow: `0 2px 6px ${theme.primary}55`,
            }}
          >
            <Plus className={styles.plusIcon} />
            New Chat
          </button>

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
                  className={`${styles.threadItem} ${
                    thread.threadId === activeThreadId ? styles.active : ''
                  }`}
                  onClick={() => onSelectThread(thread.threadId)}
                  style={
                    thread.threadId === activeThreadId
                      ? {
                          borderColor: theme.primary,
                          background: `${theme.primary}10`,
                          boxShadow: `0 2px 6px ${theme.primary}22`,
                        }
                      : {}
                  }
                >
                  <div className={styles.threadHeader}>
                    <div className={styles.threadSubject}>
                      {thread.subject || 'General'}
                    </div>
                    <div className={styles.threadTimestamp}>
                      <Clock className={styles.clockIcon} />
                      {new Date(thread.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                  <div className={styles.threadPreview}>
                    {thread.preview || 'No preview available'}
                  </div>
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

