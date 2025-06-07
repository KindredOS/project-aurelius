// LearningSession.jsx
import React, { useState, useEffect } from 'react';
import styles from './LearningSession.module.css';
import { getNextProblem, submitAnswer } from './utils/LessonEngine';
import CalculatorMath from './CalculatorMath';
import { FaDownload } from 'react-icons/fa';
import CourseChat from '../../../components/layout/CourseChat';
import feedbackMessages from './dataseries/MotivationBank.json';

const LOCAL_STORAGE_KEY = 'studybuddy_math_attempt_log';

const getRandom = (list) => list[Math.floor(Math.random() * list.length)];

const LearningSession = () => {
  const [currentProblem, setCurrentProblem] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [attemptLog, setAttemptLog] = useState([]);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [scratchPad, setScratchPad] = useState('');
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    const problem = getNextProblem();
    setCurrentProblem(problem);

    const storedLog = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedLog) {
      setAttemptLog(JSON.parse(storedLog));
    }
  }, []);

  const handleSubmit = () => {
    const correct = submitAnswer(userAnswer);

    const logEntry = {
      id: currentProblem.id,
      question: currentProblem.question,
      answer: userAnswer,
      correct,
      timestamp: new Date().toISOString(),
    };

    const updatedLog = [...attemptLog, logEntry];
    setAttemptLog(updatedLog);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedLog));

    // Feedback message logic
    const milestoneMessage = feedbackMessages.milestone[updatedLog.length];
    const fallbackMessage = correct
      ? getRandom(feedbackMessages.positive)
      : getRandom(feedbackMessages.encouraging);
    setFeedback(milestoneMessage || fallbackMessage);

    if (correct) {
      const nextProblem = getNextProblem();
      setTimeout(() => {
        setCurrentProblem(nextProblem);
        setUserAnswer('');
        setFeedback('');
      }, 1000);
    }
  };

  const handlePasswordCheck = () => {
    if (passwordInput === '1234') {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'math_attempt_log.json';
      a.click();
      URL.revokeObjectURL(url);
    } else {
      alert('Incorrect password.');
    }
    setShowPasswordPrompt(false);
    setPasswordInput('');
  };

  return (
    <div className={styles.container}>
      <div className={styles.section}>{/* Left: Calculator */}
        <CalculatorMath />
      </div>

      <div className={`${styles.section} ${styles.centerSection}`}>{/* Center: Problem & Answer */}
        <h2>Your Personalized Session</h2>
        {currentProblem ? (
          <>
            <p><strong>Problem:</strong> {currentProblem.question}</p>
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className={styles.inputField}
              placeholder="Your answer"
            />
            <button className={styles.button} onClick={handleSubmit}>Submit</button>
            {feedback && <p>{feedback}</p>}
          </>
        ) : (
          <p>Loading your first problem...</p>
        )}
      </div>

      <div className={styles.section}>{/* Right: Scratch Pad */}
        <h3>Scratch Pad</h3>
        <textarea
          className={styles.inputField}
          style={{ minHeight: '100px' }}
          value={scratchPad}
          onChange={(e) => setScratchPad(e.target.value)}
          placeholder="Use this space to write out your work..."
        />
      </div>

      {/* Download Button Bubble */}
      <button
        className={styles.downloadIconButton}
        onClick={() => setShowPasswordPrompt(true)}
        title="Download Attempt Log"
      >
        <FaDownload />
      </button>

      {/* Chat Bubble */}
      <CourseChat chatVisible={showChat} toggleChat={() => setShowChat(!showChat)} />

      {showPasswordPrompt && (
        <div style={{ position: 'absolute', top: '6rem', right: '1rem' }}>
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            placeholder="Enter password"
            className={styles.inputField}
          />
          <button className={styles.button} onClick={handlePasswordCheck}>
            Confirm
          </button>
        </div>
      )}
    </div>
  );
};

export default LearningSession;
