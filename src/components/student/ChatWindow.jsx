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

// content-safety imports (dynamic util version + neutral routing)
import {
  screenText,
  defaultPolicy,
  buildStudentMessage,
  postSafetyFlag,
  shouldNotifyStaff,
  computeSafeguardRouting,
} from '../../utils/contentSafety';

// 🔹 Brand theming import
import { getThemeColors } from '../../utils/stylesBranding';

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

  // 🔹 Get theme based on subject
  const theme = getThemeColors(subject);

  useEffect(() => {
    setThreadId(uuidv4());
  }, [subject]);

  const fetchThreadsData = useCallback(async () => {
    try {
      const threadsData = await fetchChatThreads(subject, user.email);
      setThreads(threadsData);
    } catch (err) {
      console.error('❌ Failed to fetch threads:', err);
    }
  }, [subject, user.email]);

  useEffect(() => {
    if (user.email) {
      fetchThreadsData();
    }
  }, [user.email, fetchThreadsData]);

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

    const screen = screenText(userInput, defaultPolicy);

    if (shouldNotifyStaff(screen.flags)) {
      const { routing, mentionedRoles, roleEvidence, roleConfidence } =
        computeSafeguardRouting(userInput, screen);
      postSafetyFlag({
        studentEmail: user.email,
        subject,
        threadId,
        message: userInput,
        screen,
        routing,
        mentionedRoles,
        roleEvidence,
        roleConfidence,
      });
    }

    if (screen.category === "abuse" && screen.confidence >= 0.6) {
      const msg = buildStudentMessage(screen) ||
        "I’m really sorry you’re dealing with this. Please reach out to a trusted adult (teacher, counselor, or parent/guardian). If you feel in immediate danger, contact your local emergency number (U.S.: 911).";
      const abuseHistory = [...newHistory, { role: 'assistant', content: msg }];
      setChatHistory(abuseHistory);
      setUserInput('');
      await saveChatToThread(abuseHistory);
      return;
    }

    if (screen.severity === "block") {
      const msg =
        buildStudentMessage(screen) ||
        "I’m not equipped to answer that. Please speak with a trusted adult for guidance.";
      const blockedHistory = [...newHistory, { role: 'assistant', content: msg }];
      setChatHistory(blockedHistory);
      setUserInput('');
      await saveChatToThread(blockedHistory);
      return;
    }

    let baseHistory = newHistory;
    if (screen.severity === "warn") {
      const msg = buildStudentMessage(screen);
      if (msg) {
        const warnedHistory = [...newHistory, { role: 'assistant', content: msg }];
        setChatHistory(warnedHistory);
        baseHistory = warnedHistory;
      }
    }

    setUserInput('');
    setIsLoading(true);

    try {
      const subjectPrompt = `[${subject.toUpperCase()}] ${userInput}`;
      const aiResponse = await queryModel(subject, subjectPrompt);

      const outScreen = screenText(aiResponse, defaultPolicy);
      let safeOut = aiResponse;

      if (outScreen.severity === "block") {
        safeOut = "I can’t share that. Let’s switch to a safe, educational angle or try another question.";
      } else if (outScreen.severity === "warn") {
        if (outScreen.flags.abuse) {
          safeOut =
            "I’m really sorry you’re dealing with this. Your safety matters.\n\n" +
            "• Please reach out to a trusted adult right away (teacher, school counselor, or parent/guardian).\n" +
            "• If you feel in immediate danger, contact your local emergency number (U.S.: 911).\n" +
            "You’re not alone—there are people who want to help.";
        } else if (outScreen.flags.warning) {
          safeOut =
            "Thanks for sharing—your well-being is important.\n\n" +
            "• Please talk with a trusted adult (teacher, school counselor, or parent/guardian).\n" +
            "• In the U.S., you can also call or text **988** (Suicide & Crisis Lifeline).\n" +
            "We can continue at a pace that feels comfortable.";
        }
      }

      const assistantMessage = { role: 'assistant', content: safeOut };
      const updatedHistory = [...baseHistory, assistantMessage];

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
      setChatHistory((prev) => [
        ...prev,
        { role: 'assistant', content: 'Error: Could not fetch response.' }
      ]);
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
        subject={subject}
        theme={theme}
        activeThreadId={threadId}
        onSelectThread={handleSelectThread}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        styles={styles}
        threads={threads}
        showOnDesktop={showSidebarOnDesktop}
      />

      <div className={`${styles.chatWindow} ${showSidebarOnDesktop ? styles.withSidebar : ''}`}>
        {/* 🔹 Dynamic Header */}
        <div
          className={styles.chatHeader}
          style={{
            background: theme.gradient,
            boxShadow: `0 2px 8px ${theme.primary}33`
          }}
        >
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
              <div
                className={`${styles.chatMessage} ${styles[message.role]}`}
                style={
                  message.role === 'user'
                    ? { background: theme.gradient }
                    : {}
                }
              >
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
              style={{
                background: theme.gradient,
                boxShadow: `0 2px 4px ${theme.primary}33`
              }}
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
