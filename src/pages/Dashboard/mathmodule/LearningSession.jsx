// LearningSession.jsx
import React, { useState, useEffect } from 'react';
import styles from './LearningSession.module.css';
import { getNextProblem, submitAnswer } from './utils/LessonEngine';
import CalculatorMath from './CalculatorMath';
import AITutor from './utils/useAITutor';
import feedbackMessages from './dataseries/MotivationBank.json';
import { MathAPI } from '../../../api/ApiMaster';

const LOCAL_STORAGE_KEY = 'studybuddy_math_attempt_log';

const getRandom = (list) => list[Math.floor(Math.random() * list.length)];

const LearningSession = () => {
  const [currentProblem, setCurrentProblem] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [attemptLog, setAttemptLog] = useState([]);
  const [scratchPad, setScratchPad] = useState('');
  const [showChat, setShowChat] = useState(false);
  const userEmail = localStorage.getItem('userEmail') || 'anonymous@fallback.com';

  useEffect(() => {
    const problem = getNextProblem();
    setCurrentProblem(problem);

    const storedLog = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedLog) {
      setAttemptLog(JSON.parse(storedLog));
    }
  }, []);

  const handleSubmit = async () => {
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

    try {
      await MathAPI.logSessionResult(userEmail, logEntry);
    } catch (error) {
      console.error('Error sending session data to backend:', error);
    }

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

      {/* Embedded AI Tutor */}
      <AITutor chatVisible={showChat} toggleChat={() => setShowChat(!showChat)} />
    </div>
  );
};

export default LearningSession;
