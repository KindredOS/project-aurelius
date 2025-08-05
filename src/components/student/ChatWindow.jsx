// components/student/ChatWindow.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Brain, Menu } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import {
  queryModel,
  saveChatThread,
  fetchChatThreads,
  fetchChatThread
} from '../../api/ApiMaster';
import ChatSidebar from './ChatSidebar';
import styles from './ChatWindow.module.css';

const ChatWindow = ({ 
  chatHistory, 
  userInput, 
  setUserInput, 
  setChatHistory, 
  tutorName = "AI Science Tutor",
  placeholder = "Ask a question about science...",
  subject = "general",
  user = { email: "", name: "" }
}) => {
  const [threadId, setThreadId] = useState(uuidv4());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [threads, setThreads] = useState([]);

  useEffect(() => {
    setThreadId(uuidv4());
  }, [subject]);

  // Memoize fetchThreadsData with useCallback
  const fetchThreadsData = useCallback(async () => {
    try {
      const threadsData = await fetchChatThreads(subject, user.email);
      setThreads(threadsData);
    } catch (err) {
      console.error('❌ Failed to fetch threads:', err);
    }
  }, [subject, user.email]); // Dependencies that fetchThreadsData uses

  useEffect(() => {
    if (user.email) {
      fetchThreadsData();
    }
  }, [user.email, fetchThreadsData]); // Now include fetchThreadsData

  const saveChatToThread = async (messageLog) => {
    try {
      await saveChatThread(subject, {
        email: user.email,
        threadId,
        subject,
        history: messageLog
      });
      fetchThreadsData();
    } catch (err) {
      console.error('❌ Failed to save chat thread:', err);
    }
  };

  const loadChatThread = async (id) => {
    try {
      const threadData = await fetchChatThread(subject, user.email, id);
      if (threadData) {
        setChatHistory(threadData.history || []);
      }
    } catch (err) {
      console.error('❌ Failed to load chat thread:', err);
    }
  };

  const sendMessage = async () => {
    if (!userInput.trim() || isLoading) return;

    const userMessage = { role: 'user', content: userInput };
    const newHistory = [...chatHistory, userMessage];
    setChatHistory(newHistory);
    setUserInput('');
    setIsLoading(true);

    try {
      const subjectPrompt = `[${subject.toUpperCase()}] ${userInput}`;
      const aiResponse = await queryModel(subject, subjectPrompt);
      const assistantMessage = { role: 'assistant', content: aiResponse };

      const updatedHistory = [...newHistory, assistantMessage];
      setChatHistory(updatedHistory);

      console.log('📚 Chat Log:', {
        user: user.email,
        subject,
        prompt: userInput,
        response: aiResponse,
        threadId
      });

      await saveChatToThread(updatedHistory);

    } catch (err) {
      console.error(err);
      setChatHistory((prev) => [...prev, { role: 'assistant', content: 'Error: Could not fetch response.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSelectThread = (id) => {
    setThreadId(id);
    loadChatThread(id);
    setSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const showSidebarOnDesktop = threads.length > 0;

  return (
    <div className={styles.chatWindowContainer}>
      <ChatSidebar
        email={user.email}
        activeThreadId={threadId}
        onSelectThread={handleSelectThread}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        styles={styles}
        threads={threads}
        showOnDesktop={showSidebarOnDesktop}
      />

      <div className={`${styles.chatWindow} ${showSidebarOnDesktop ? styles.withSidebar : ''}`}>
        <div className={styles.chatHeader}>
          <button onClick={toggleSidebar} className={styles.sidebarToggle}>
            <Menu className={styles.menuIcon} />
          </button>
          <h3 className={styles.chatHeaderContent}>
            <Brain className={styles.chatHeaderIcon} />
            {tutorName}
          </h3>
        </div>

        <div className={styles.chatMessages}>
          {chatHistory.length === 0 && (
            <div className={styles.chatMessagesEmpty}>
              <Brain className={styles.emptyIcon} />
              <p className={styles.emptyTitle}>Welcome to {tutorName}!</p>
              <p className={styles.emptySubtitle}>{placeholder}</p>
            </div>
          )}

          {chatHistory.map((message, index) => (
            <div
              key={index}
              className={`${styles.chatMessageRow} ${message.role === 'user' ? styles.user : styles.assistant}`}
            >
              <div className={`${styles.chatMessage} ${styles[message.role]}`}>
                {message.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className={`${styles.chatMessageRow} ${styles.assistant}`}>
              <div className={`${styles.chatMessage} ${styles.assistant} ${styles.loadingMessage}`}>
                <div className={styles.loadingDots}>
                  <div className={styles.dot}></div>
                  <div className={styles.dot}></div>
                  <div className={styles.dot}></div>
                </div>
                <span className={styles.loadingText}>AI is thinking...</span>
              </div>
            </div>
          )}
        </div>

        <div className={styles.chatInput}>
          <div className={styles.chatInputRow}>
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              className={styles.chatInputField}
              rows="1"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={!userInput.trim() || isLoading}
              className={styles.chatSendButton}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;