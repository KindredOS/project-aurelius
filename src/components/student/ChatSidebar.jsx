// components/student/ChatSidebar.jsx
import React, { useEffect, useState } from 'react';
import { fetchChatThreads } from '../../api/Science';

const ChatSidebar = ({ email, activeThreadId, onSelectThread }) => {
  const [threads, setThreads] = useState([]);

  useEffect(() => {
    if (email) {
      fetchChatThreads(email).then(setThreads);
    }
  }, [email]);

  return (
    <div className="chat-sidebar">
      <h3 className="sidebar-title">Chat Threads</h3>
      <ul className="thread-list">
        {threads.map((thread) => (
          <li
            key={thread.threadId}
            className={`thread-item ${thread.threadId === activeThreadId ? 'active' : ''}`}
            onClick={() => onSelectThread(thread.threadId)}
          >
            <div className="thread-subject">{thread.subject || 'Untitled'}</div>
            <div className="thread-preview">{thread.preview || 'No preview available'}</div>
            <div className="thread-timestamp">{new Date(thread.timestamp).toLocaleString()}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatSidebar;
