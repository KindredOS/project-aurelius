// utils/quizGenerator.js - Updated to use static files with dynamic selection

import React from 'react';
import { ChevronRight, Settings } from 'lucide-react';

/**
 * Filters and selects questions from static quiz data based on settings
 * @param {Array} allQuestions - All available questions from JSON file
 * @param {Object} settings - Quiz generation settings
 * @returns {Array} Selected and filtered questions
 */
export const selectQuestionsFromStatic = (allQuestions, settings = {}) => {
  const {
    difficulty = 'medium',
    questionCount = 5
  } = settings;

  // Filter questions by difficulty if difficulty metadata exists
  let filteredQuestions = allQuestions.filter(question => {
    if (question.difficulty) {
      return question.difficulty === difficulty;
    }
    // If no difficulty metadata, include all questions
    return true;
  });

  // If we don't have enough questions after filtering, fall back to all questions
  if (filteredQuestions.length < questionCount) {
    console.warn(`Not enough ${difficulty} questions (${filteredQuestions.length}), using all available questions`);
    filteredQuestions = allQuestions;
  }

  // Shuffle and select the requested number of questions
  const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(questionCount, shuffled.length));
};

/**
 * Renders the quiz settings interface (simplified from AI generator)
 * @param {Object} props - Component props
 * @param {Object} props.quizSettings - Current quiz settings
 * @param {Function} props.onSettingsChange - Callback for settings changes
 * @param {Function} props.onLoadQuiz - Callback for loading quiz
 * @param {boolean} props.isLoading - Whether quiz is currently being loaded
 * @param {Object} props.styles - CSS modules styles object
 * @returns {JSX.Element} Rendered settings component
 */
export const renderQuizSettings = ({
  quizSettings,
  onSettingsChange,
  onLoadQuiz,
  isLoading,
  styles
}) => (
  <div className={styles.generatorContainer}>
    <div className={styles.generatorHeader}>
      <Settings className={styles.generatorIcon} size={48} />
      <h2 className={styles.generatorTitle}>Quiz Settings</h2>
    </div>

    <div className={styles.settingsCard}>
      <h3 className={styles.settingsTitle}>Customize Your Quiz</h3>
      <div className={styles.settingsGrid}>
        <div className={styles.settingGroup}>
          <label className={styles.settingLabel}>Difficulty Level</label>
          <select
            value={quizSettings.difficulty}
            onChange={(e) => onSettingsChange('difficulty', e.target.value)}
            className={styles.settingSelect}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
            <option value="mixed">Mixed (All Levels)</option>
          </select>
        </div>

        <div className={styles.settingGroup}>
          <label className={styles.settingLabel}>Number of Questions</label>
          <select
            value={quizSettings.questionCount}
            onChange={(e) => onSettingsChange('questionCount', parseInt(e.target.value))}
            className={styles.settingSelect}
          >
            <option value="5">5 Questions</option>
            <option value="10">10 Questions</option>
            <option value="15">15 Questions</option>
            <option value="20">20 Questions</option>
            <option value="25">25 Questions</option>
          </select>
        </div>

        <div className={styles.settingGroup}>
          <div className={styles.checkboxGroup}>
            <input
              type="checkbox"
              id="showExplanations"
              checked={quizSettings.showExplanations}
              onChange={(e) => onSettingsChange('showExplanations', e.target.checked)}
              className={styles.checkbox}
            />
            <label htmlFor="showExplanations" className={styles.checkboxLabel}>
              Show explanations after quiz
            </label>
          </div>
        </div>
      </div>

      <button
        onClick={onLoadQuiz}
        disabled={isLoading}
        className={styles.generateButton}
      >
        {isLoading ? (
          <>
            <div className={styles.loadingSpinner} />
            Loading Quiz...
          </>
        ) : (
          <>
            <Settings size={16} />
            Create Quiz
          </>
        )}
      </button>
    </div>
  </div>
);

/**
 * Validates quiz settings
 * @param {Object} settings - Settings to validate
 * @returns {Object} Validation result with isValid and errors
 */
export const validateQuizSettings = (settings) => {
  const errors = [];
  
  if (settings.questionCount < 1 || settings.questionCount > 50) {
    errors.push('Question count must be between 1 and 50');
  }
  
  if (!['easy', 'medium', 'hard', 'mixed'].includes(settings.difficulty)) {
    errors.push('Difficulty must be easy, medium, hard, or mixed');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Renders different question types with consistent styling
 * @param {Object} question - Question object
 * @param {*} userAnswer - Current user answer
 * @param {Function} onAnswerChange - Callback for answer changes
 * @param {Object} styles - CSS modules styles object
 * @returns {JSX.Element} Rendered question component
 */
export const renderQuestionType = (question, userAnswer, onAnswerChange, styles) => {
  switch (question.type) {
    case 'multiple-choice':
      return (
        <div className={styles.optionsContainer}>
          {question.options.map((option, index) => (
            <label key={index} className={styles.optionLabel}>
              <input
                type="radio"
                name={`question-${question.id}`}
                value={index}
                checked={userAnswer === index}
                onChange={() => onAnswerChange(question.id, index)}
                className={styles.optionInput}
              />
              <span className={styles.optionText}>{option}</span>
            </label>
          ))}
        </div>
      );
    
    case 'true-false':
      return (
        <div className={styles.optionsContainer}>
          {[true, false].map((option) => (
            <label key={option.toString()} className={styles.optionLabel}>
              <input
                type="radio"
                name={`question-${question.id}`}
                value={option}
                checked={userAnswer === option}
                onChange={() => onAnswerChange(question.id, option)}
                className={styles.optionInput}
              />
              <span className={styles.optionText}>{option ? 'True' : 'False'}</span>
            </label>
          ))}
        </div>
      );
    
    case 'short-answer':
      return (
        <div className={styles.textareaContainer}>
          <textarea
            value={userAnswer || ''}
            onChange={(e) => onAnswerChange(question.id, e.target.value)}
            className={styles.textarea}
            rows="4"
            placeholder="Enter your answer here..."
          />
          <div className={styles.textareaHint}>
            Provide a clear and concise answer.
          </div>
        </div>
      );
    
    case 'matching':
      return (
        <div className={styles.matchingContainer}>
          <div className={styles.matchingInstructions}>
            Match each item on the left with the correct item on the right.
          </div>
          {question.pairs.map((pair, index) => (
            <div key={index} className={styles.matchingRow}>
              <div className={styles.matchingLeft}>{pair.left}</div>
              <ChevronRight size={16} className={styles.matchingArrow} />
              <select
                value={userAnswer?.[pair.left] || ''}
                onChange={(e) => onAnswerChange(question.id, {
                  ...userAnswer,
                  [pair.left]: e.target.value
                })}
                className={styles.matchingSelect}
              >
                <option value="">Select match...</option>
                {question.pairs.map((p, i) => (
                  <option key={i} value={p.right}>{p.right}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      );
    
    default:
      return <div>Unsupported question type</div>;
  }
};

/**
 * Creates initial quiz state
 * @param {Object} quiz - Quiz object
 * @returns {Object} Initial state object
 */
export const createInitialQuizState = (quiz) => {
  return {
    currentQuestion: 0,
    userAnswers: {},
    showResults: false,
    quizStarted: false,
    validationErrors: []
  };
};

/**
 * Calculates quiz progress percentage
 * @param {number} currentQuestion - Current question index
 * @param {number} totalQuestions - Total number of questions
 * @returns {number} Progress percentage
 */
export const calculateProgress = (currentQuestion, totalQuestions) => {
  return ((currentQuestion + 1) / totalQuestions) * 100;
};

/**
 * Gets display text for user answer based on question type
 * @param {Object} question - Question object
 * @param {*} userAnswer - User's answer
 * @returns {string} Display text for the answer
 */
export const getAnswerDisplayText = (question, userAnswer) => {
  switch (question.type) {
    case 'multiple-choice':
      return question.options[userAnswer] || 'No answer';
    case 'true-false':
      return userAnswer === true ? 'True' : userAnswer === false ? 'False' : 'No answer';
    case 'short-answer':
      return userAnswer || 'No answer';
    case 'matching':
      return userAnswer ? Object.entries(userAnswer).map(([key, value]) => `${key}: ${value}`).join(', ') : 'No answer';
    default:
      return String(userAnswer || 'No answer');
  }
};

/**
 * Gets display text for correct answer based on question type
 * @param {Object} question - Question object
 * @returns {string} Display text for the correct answer
 */
export const getCorrectAnswerDisplayText = (question) => {
  switch (question.type) {
    case 'multiple-choice':
      return question.options[question.correctAnswer];
    case 'true-false':
      return question.correctAnswer ? 'True' : 'False';
    case 'short-answer':
      return question.sampleAnswer || 'See explanation';
    case 'matching':
      return Object.entries(question.correctAnswer).map(([key, value]) => `${key}: ${value}`).join(', ');
    default:
      return String(question.correctAnswer);
  }
};