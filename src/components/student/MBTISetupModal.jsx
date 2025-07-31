import React, { useEffect, useState } from 'react';
import * as ApiMaster from '../../api/ApiMaster';
import styles from './MBTISetupModal.module.css';
import activities from './activities.json';

const MBTISetupModal = ({ user, onClose }) => {
  const [age, setAge] = useState('');
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [finished, setFinished] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Total steps: Age (0) -> Interests (1) -> Questions (2+) -> Results
  const totalSteps = questions.length + 2;
  const currentProgress = step >= 2 ? ((step - 1) / totalSteps) * 100 : (step / totalSteps) * 100;

  useEffect(() => {
    const completed = localStorage.getItem(`mbti-complete-${user.email}`);
    if (completed) onClose();
  }, [user, onClose]);

  const handleInterestToggle = (interest) => {
    setSelectedInterests(prev =>
      prev.includes(interest)
        ? prev.filter(item => item !== interest)
        : prev.length < 4
          ? [...prev, interest]
          : prev
    );
  };

  const loadQuestions = async () => {
    const ageNum = parseInt(age);
    if (!ageNum) return;

    setIsLoading(true);
    try {
      const questionSet = ageNum >= 14
        ? await import('./mbti_advanced.json')
        : await import('./data/mbti_basic.json');

      setQuestions(questionSet.default);
      setStep(2);
    } catch (error) {
      console.error("Error loading questions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = (type) => {
    const question = questions[step - 2];
    setAnswers(prev => ({
      ...prev,
      [question.dimension]: type
    }));
    
    if (step - 1 < questions.length) {
      setStep(step + 1);
    } else {
      setFinished(true);
    }
  };

  const calculateMBTI = () => {
    const final = {
      E: answers['E/I'] === 'E' ? 1 : 0,
      I: answers['E/I'] === 'I' ? 1 : 0,
      N: answers['N/S'] === 'N' ? 1 : 0,
      S: answers['N/S'] === 'S' ? 1 : 0,
      T: answers['T/F'] === 'T' ? 1 : 0,
      F: answers['T/F'] === 'F' ? 1 : 0,
      J: answers['J/P'] === 'J' ? 1 : 0,
      P: answers['J/P'] === 'P' ? 1 : 0
    };
    return `${final.E ? 'E' : 'I'}${final.N ? 'N' : 'S'}${final.T ? 'T' : 'F'}${final.J ? 'J' : 'P'}`;
  };

  const handleSubmit = async () => {
    const mbti = calculateMBTI();
    const payload = {
      age: parseInt(age),
      mbti,
      interests: selectedInterests
    };
    
    setIsLoading(true);
    try {
      await ApiMaster.updateUserData(user.email, payload);
      localStorage.setItem(`mbti-complete-${user.email}`, 'true');
      onClose();
    } catch (error) {
      console.error("Error saving MBTI data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const renderStepIndicator = () => {
    const dots = [];
    const totalDots = Math.min(5, totalSteps); // Limit dots for visual clarity
    
    for (let i = 0; i < totalDots; i++) {
      const isActive = i === Math.min(step, totalDots - 1);
      const isCompleted = i < step;
      
      dots.push(
        <div
          key={i}
          className={`${styles.stepDot} ${isActive ? styles.active : ''} ${isCompleted ? styles.completed : ''}`}
        />
      );
    }
    
    return <div className={styles.stepIndicator}>{dots}</div>;
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.icon}>
            <svg className={styles.profileIcon} fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 7C14.4 7 14 7.4 14 8V22C14 22.6 14.4 23 15 23H17C17.6 23 18 22.6 18 22V16H21C21.6 16 22 15.6 22 15V13C22 12.4 21.6 12 21 12H18V10C18 9.4 17.6 9 17 9H21ZM9 8C9 7.4 8.6 7 8 7H3V9H6V12H3C2.4 12 2 12.4 2 13V15C2 15.6 2.4 16 3 16H6V22C6 22.6 6.4 23 7 23H9C9.6 23 10 22.6 10 22V8H9Z"/>
            </svg>
          </div>
          <h2 className={styles.title}>
            {step === 0 && "Welcome! Let's set up your profile"}
            {step === 1 && "Choose your interests"}
            {step >= 2 && !finished && "Personality Assessment"}
            {finished && "Assessment Complete!"}
          </h2>
          <p className={styles.subtitle}>
            {step === 0 && "We'll customize your experience based on your age and preferences"}
            {step === 1 && "Select up to 4 activities that interest you most"}
            {step >= 2 && !finished && "Answer honestly based on your natural tendencies"}
            {finished && "Your personality type has been determined"}
          </p>
        </div>

        {/* Progress Bar */}
        {step > 0 && (
          <div className={styles.progressSection}>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${currentProgress}%` }}
              />
            </div>
            <div className={styles.progressText}>
              {finished ? 'Complete!' : `Step ${step + 1} of ${totalSteps + 1}`}
            </div>
          </div>
        )}

        {/* Step Indicator */}
        {renderStepIndicator()}

        {!finished ? (
          <>
            {/* Step 0: Age Input */}
            {step === 0 && (
              <div className={styles.section}>
                <label className={styles.label}>What is your age?</label>
                <input
                  type="number"
                  className={styles.input}
                  value={age}
                  onChange={e => setAge(e.target.value)}
                  placeholder="Enter your age"
                  min="10"
                  max="100"
                />
                <button 
                  className={`${styles.button} ${styles.primaryButton}`}
                  onClick={() => setStep(1)} 
                  disabled={!age || age < 10}
                >
                  Continue
                </button>
              </div>
            )}

            {/* Step 1: Interests Selection */}
            {step === 1 && (
              <div className={styles.section}>
                {step > 0 && (
                  <button className={styles.backButton} onClick={goBack}>
                    ← Back
                  </button>
                )}
                
                <div className={`${styles.interestCounter} ${selectedInterests.length === 4 ? styles.complete : ''}`}>
                  Selected: {selectedInterests.length}/4
                </div>
                
                <div className={styles.interestGrid}>
                  {activities.map((interest, idx) => (
                    <button
                      key={idx}
                      className={`${styles.interestButton} ${selectedInterests.includes(interest) ? styles.selected : ''}`}
                      onClick={() => handleInterestToggle(interest)}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
                
                <button
                  className={`${styles.button} ${styles.primaryButton} ${isLoading ? styles.loading : ''}`}
                  onClick={loadQuestions}
                  disabled={selectedInterests.length !== 4 || isLoading}
                >
                  {isLoading ? 'Loading Questions...' : 'Start Assessment'}
                </button>
              </div>
            )}

            {/* Step 2+: MBTI Questions */}
            {step >= 2 && step - 2 < questions.length && (
              <div className={styles.section}>
                <div className={styles.questionContainer}>
                  <p className={styles.question}>
                    {questions[step - 2].question}
                  </p>
                  <div className={styles.buttonGroup}>
                    <button 
                      className={`${styles.button} ${styles.primaryButton}`}
                      onClick={() => handleAnswer(questions[step - 2].typeIfAgree)}
                    >
                      Agree
                    </button>
                    <button 
                      className={`${styles.button} ${styles.secondaryButton}`}
                      onClick={() => handleAnswer(questions[step - 2].typeIfDisagree)}
                    >
                      Disagree
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Results Screen */
          <div className={styles.section}>
            <div className={styles.resultsContainer}>
              <div className={styles.mbtiResult}>
                {calculateMBTI()}
              </div>
              <p className={styles.resultDescription}>
                Your personality type has been determined! This will help us personalize your experience.
              </p>
            </div>
            
            <button 
              className={`${styles.button} ${styles.primaryButton} ${isLoading ? styles.loading : ''}`}
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Complete Setup'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MBTISetupModal;