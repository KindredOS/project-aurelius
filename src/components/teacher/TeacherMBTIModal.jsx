// Path: src/components/teacher/TeacherMBTIModal.jsx
// Function: First time assessment and class setup
// Version Control: Scaffold

import React, { useEffect, useMemo, useState } from 'react';
import styles from './TeacherMBTIModal.module.css';

/**
 * TeacherMBTIModal
 * Advanced-only MBTI assessment + Add Classes step (no interests/activities).
 *
 * Props:
 *   user: { email: string, ... }
 *   onClose: () => void
 *   onSaveMBTI?: (payload: { mbti: string }) => Promise<void>   // optional; wire to your backend
 *   onCreateClasses?: (rows: Array<{name:string, grade_level:string, term:string, section?:string}>) => Promise<void> // optional
 *
 * Behavior:
 *   - Loads mbti_advanced.json only.
 *   - After results, calls onSaveMBTI (if provided), sets localStorage flag, and continues to class setup.
 *   - On Save Classes, calls onCreateClasses (if provided) and then closes.
 *   - If the localStorage key "mbti-complete-${user.email}" exists, this modal auto-closes on mount.
 */
const TeacherMBTIModal = ({ user, onClose, onSaveMBTI, onCreateClasses }) => {
  // MBTI state
  const [questions, setQuestions] = useState([]);
  const [step, setStep] = useState(0); // 0=intro, 1..N=questions, 'results', 'classSetup'
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [mbtiSaved, setMbtiSaved] = useState(false);

  // Class setup state
  const [classRows, setClassRows] = useState([{ name: '', grade_level: '', term: '', section: '' }]);
  const [classError, setClassError] = useState('');
  const [savingClasses, setSavingClasses] = useState(false);

  // Load advanced questions once
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const mod = await import('./mbti_advanced.json');
        if (mounted) setQuestions(mod.default || []);
      } catch (err) {
        console.error('Failed to load advanced MBTI questions:', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Respect prior completion guard
  useEffect(() => {
    const completed = localStorage.getItem(`mbti-complete-${user?.email}`);
    if (completed) onClose?.();
  }, [user, onClose]);

  // Progress math: intro(1) + questions + results(1) + classSetup(1)
  const totalSteps = useMemo(() => 1 + questions.length + 1 + 1, [questions.length]);
  const visualIndex = useMemo(() => {
    if (step === 0) return 0;
    if (typeof step === 'number' && step >= 1 && step <= questions.length) return step;
    if (step === 'results') return questions.length + 1;
    if (step === 'classSetup') return questions.length + 2;
    return 0;
  }, [step, questions.length]);
  const currentProgress = ((visualIndex + 1) / totalSteps) * 100;

  // MBTI helpers
  const handleAnswer = (type) => {
    const qIdx = step - 1; // step 1 => questions[0]
    const question = questions[qIdx];
    if (!question) return;

    setAnswers(prev => ({ ...prev, [question.dimension]: type }));

    const more = step < questions.length;
    setStep(more ? step + 1 : 'results');
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

  const saveMbtiAndProceed = async () => {
    const mbti = calculateMBTI();
    setIsLoading(true);
    try {
      if (!mbtiSaved && typeof onSaveMBTI === 'function') {
        await onSaveMBTI({ mbti });
      }
      localStorage.setItem(`mbti-complete-${user?.email}`, 'true');
      setMbtiSaved(true);
      setStep('classSetup');
    } catch (error) {
      console.error('Error saving MBTI data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Class setup
  const isValidRow = (r) => r.name.trim() && r.grade_level.trim() && r.term.trim();
  const allClassRowsValid = useMemo(() => classRows.every(isValidRow), [classRows]);

  const addClassRow = () =>
    setClassRows(prev => [...prev, { name: '', grade_level: '', term: '', section: '' }]);

  const removeClassRow = (idx) =>
    setClassRows(prev => prev.filter((_, i) => i !== idx));

  const updateClassRow = (idx, key, val) =>
    setClassRows(prev => prev.map((r, i) => (i === idx ? { ...r, [key]: val } : r)));

  const handleSaveClasses = async () => {
    setClassError('');
    if (!allClassRowsValid) {
      setClassError('Please complete required fields (Name, Grade, Term).');
      return;
    }
    setSavingClasses(true);
    try {
      if (typeof onCreateClasses === 'function') {
        await onCreateClasses(classRows);
      }
      onClose?.();
    } catch (e) {
      console.error(e);
      setClassError(e?.message || 'Unable to save classes right now.');
    } finally {
      setSavingClasses(false);
    }
  };

  // Step indicator (uses minimal dot UI)
  const renderStepIndicator = () => {
    const totalDots = Math.min(5, totalSteps);
    const activeIdx = Math.min(visualIndex, totalDots - 1);
    return (
      <div className={styles.stepIndicator}>
        {Array.from({ length: totalDots }).map((_, i) => (
          <div
            key={i}
            className={`${styles.stepDot} ${i === activeIdx ? styles.active : ''} ${i < activeIdx ? styles.completed : ''}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <button className={styles.closeButton} onClick={onClose} aria-label="Close">×</button>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.icon}>
            <svg className={styles.profileIcon} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 7C14.4 7 14 7.4 14 8V22C14 22.6 14.4 23 15 23H17C17.6 23 18 22.6 18 22V16H21C21.6 16 22 15.6 22 15V13C22 12.4 21.6 12 21 12H18V10C18 9.4 17.6 9 17 9H21ZM9 8C9 7.4 8.6 7 8 7H3V9H6V12H3C2.4 12 2 12.4 2 13V15C2 15.6 2.4 16 3 16H6V22C6 22.6 6.4 23 7 23H9C9.6 23 10 22.6 10 22V8H9Z"/>
            </svg>
          </div>
          <h2 className={styles.title}>
            {step === 0 && 'Welcome! Let’s do a quick personality setup'}
            {typeof step === 'number' && step >= 1 && step <= questions.length && 'Personality Assessment'}
            {step === 'results' && 'Assessment Complete'}
            {step === 'classSetup' && 'Add your classes'}
          </h2>
          <p className={styles.subtitle}>
            {step === 0 && 'We’ll personalize your experience using a short assessment.'}
            {typeof step === 'number' && step >= 1 && step <= questions.length && 'Answer based on your natural tendencies.'}
            {step === 'results' && 'Your personality type is ready.'}
            {step === 'classSetup' && 'Create your classes now. You can edit them later from the dashboard.'}
          </p>
        </div>

        {/* Progress */}
        <div className={styles.progressSection}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${currentProgress}%` }} />
          </div>
          <div className={styles.progressText}>
            {step === 'classSetup' ? 'Final step' : `Step ${visualIndex + 1} of ${totalSteps}`}
          </div>
        </div>

        {renderStepIndicator()}

        {/* Flow */}
        {step === 0 && (
          <div className={styles.section}>
            <button
              className={`${styles.button} ${styles.primaryButton}`}
              onClick={() => setStep(1)}
              disabled={!questions.length}
            >
              Start Assessment
            </button>
          </div>
        )}

        {typeof step === 'number' && step >= 1 && step <= questions.length && (
          <div className={styles.section}>
            <div className={styles.questionContainer}>
              <p className={styles.question}>
                {questions[step - 1]?.question}
              </p>
              <div className={styles.buttonGroup}>
                <button
                  className={`${styles.button} ${styles.primaryButton}`}
                  onClick={() => handleAnswer(questions[step - 1]?.typeIfAgree)}
                >
                  Agree
                </button>
                <button
                  className={`${styles.button} ${styles.secondaryButton}`}
                  onClick={() => handleAnswer(questions[step - 1]?.typeIfDisagree)}
                >
                  Disagree
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'results' && (
          <div className={styles.section}>
            <div className={styles.resultsContainer}>
              <div className={styles.mbtiResult}>{calculateMBTI()}</div>
              <p className={styles.resultDescription}>
                Your personality type has been determined! This will help us personalize your experience.
              </p>
            </div>
            <button
              className={`${styles.button} ${styles.primaryButton} ${isLoading ? styles.loading : ''}`}
              onClick={saveMbtiAndProceed}
              disabled={isLoading}
            >
              {isLoading ? 'Saving…' : 'Continue to Class Setup'}
            </button>
          </div>
        )}

        {step === 'classSetup' && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Add your classes</h3>

            <div className={styles.mbtiClassRows}>
              {classRows.map((row, idx) => (
                <div key={idx} className={styles.mbtiClassRow}>
                  <input
                    className={styles.input}
                    placeholder="Class Name (e.g., Algebra 1 - 7A)"
                    value={row.name}
                    onChange={(e) => updateClassRow(idx, 'name', e.target.value)}
                  />
                  <input
                    className={styles.input}
                    placeholder="Grade (e.g., 7)"
                    value={row.grade_level}
                    onChange={(e) => updateClassRow(idx, 'grade_level', e.target.value)}
                  />
                  <input
                    className={styles.input}
                    placeholder="Term (e.g., 2025-Fall)"
                    value={row.term}
                    onChange={(e) => updateClassRow(idx, 'term', e.target.value)}
                  />
                  <input
                    className={styles.input}
                    placeholder="Section (optional)"
                    value={row.section}
                    onChange={(e) => updateClassRow(idx, 'section', e.target.value)}
                  />
                  {classRows.length > 1 && (
                    <button
                      type="button"
                      className={styles.ghostButton}
                      onClick={() => removeClassRow(idx)}
                      aria-label="Remove class row"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className={styles.actions}>
              <button type="button" className={styles.secondaryButton} onClick={addClassRow}>
                + Add another class
              </button>
              <button
                type="button"
                className={`${styles.button} ${styles.primaryButton}`}
                onClick={handleSaveClasses}
                disabled={!allClassRowsValid || savingClasses}
              >
                {savingClasses ? 'Saving…' : 'Save classes'}
              </button>
            </div>

            {classError && <div className={styles.error} style={{ color: '#b91c1c', marginTop: '.5rem' }}>{classError}</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherMBTIModal;
