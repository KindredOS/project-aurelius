// components/student/ChatWindow.jsx
import React, { useState, useEffect } from 'react';
import { Brain } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { getApiUrl, ScienceAPI } from '../../api/ApiMaster';
import ChatSidebar from './ChatSidebar';

const ChatWindow = ({ 
  chatHistory, 
  userInput, 
  setUserInput, 
  setChatHistory, 
  styles, 
  tutorName = "AI Tutor",
  placeholder = "Ask a question...",
  subject = "general",
  user = { email: "", name: "" }
}) => {
  const [threadId, setThreadId] = useState(uuidv4());

  useEffect(() => {
    setThreadId(uuidv4());
  }, [subject]);

  const saveChatToThread = async (messageLog) => {
    try {
      await fetch(`${getApiUrl()}/science/chats/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          threadId,
          subject,
          history: messageLog,
          timestamp: new Date().toISOString()
        })
      });
    } catch (err) {
      console.error('❌ Failed to save chat thread:', err);
    }
  };

  const loadChatThread = async (id) => {
    try {
      const response = await fetch(`${getApiUrl()}/science/chats/list?email=${encodeURIComponent(user.email)}`);
      const threads = await response.json();
      const selected = threads.find(t => t.threadId === id);
      if (!selected) return;

      const threadDataResponse = await fetch(`${getApiUrl()}/science/chats/${id}/thread.json?email=${encodeURIComponent(user.email)}`);
      const threadData = await threadDataResponse.json();

      setChatHistory(threadData.history || []);
    } catch (err) {
      console.error('❌ Failed to load chat thread:', err);
    }
  };

  const sendMessage = async () => {
    if (!userInput.trim()) return;

    const userMessage = { role: 'user', content: userInput };
    const newHistory = [...chatHistory, userMessage];
    setChatHistory(newHistory);

    try {
      const subjectPrompt = `[${subject.toUpperCase()}] ${userInput}`;
      const aiResponse = await ScienceAPI.queryModel(subjectPrompt);
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
    }

    setUserInput('');
  };

  const handleSelectThread = (id) => {
    setThreadId(id);
    loadChatThread(id);
  };

  return (
    <div className={styles.chatWindowContainer}>
      <ChatSidebar
        email={user.email}
        activeThreadId={threadId}
        onSelectThread={handleSelectThread}
      />
      <div className={styles.chatWindow}>
        <div className={styles.chatHeader}>
          <h3 className={styles.chatHeaderContent}>
            <Brain className={styles.chatHeaderIcon} />
            {tutorName}
          </h3>
        </div>

        <div className={styles.chatMessages}>
          {chatHistory.length === 0 && (
            <div className={styles.chatMessagesEmpty}>
              Ask me anything! I'm here to help you learn.
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
        </div>

        <div className={styles.chatInput}>
          <div className={styles.chatInputRow}>
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder={placeholder}
              className={styles.chatInputField}
            />
            <button
              onClick={sendMessage}
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