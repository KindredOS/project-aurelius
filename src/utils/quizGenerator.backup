// utils/quizGenerator.js

import React from 'react';
import { ChevronRight, Brain } from 'lucide-react';

/**
 * Generates quiz content based on provided content and settings
 * @param {string} content - The source content to generate quiz from
 * @param {Object} settings - Quiz generation settings
 * @returns {Promise<Object>} Generated quiz object
 */
export const generateQuizContent = async (content, settings = {}) => {
  const {
    difficulty = 'medium',
    questionCount = 5,
    showExplanations = true
  } = settings;

  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock quiz generation - in real implementation, this would call an AI service
  const mockQuestions = [
    {
      id: 1,
      type: 'multiple-choice',
      question: "What is the main concept discussed in this section?",
      options: [
        "Basic principles of the topic",
        "Advanced applications only",
        "Historical context exclusively",
        "Future predictions"
      ],
      correctAnswer: 0, // Fixed: changed from 'correct' to 'correctAnswer'
      explanation: "The section focuses on establishing fundamental understanding before moving to applications."
    },
    {
      id: 2,
      type: 'true-false',
      question: "The concepts presented build upon each other sequentially.",
      correctAnswer: true, // Fixed: changed from 'correct' to 'correctAnswer'
      explanation: "Yes, the material is structured to build knowledge progressively."
    },
    {
      id: 3,
      type: 'short-answer',
      question: "Explain the key takeaway from this section in your own words.",
      sampleAnswer: "The key takeaway involves understanding the fundamental principles and their practical applications.",
      correctAnswer: "sample answer", // Add this for consistency
      explanation: "Look for understanding of core concepts and ability to synthesize information."
    },
    {
      id: 4,
      type: 'multiple-choice',
      question: "Which of the following best describes the relationship between the concepts?",
      options: [
        "They are completely independent",
        "They build upon each other",
        "They contradict each other",
        "They are only theoretically related"
      ],
      correctAnswer: 1, // Fixed: changed from 'correct' to 'correctAnswer'
      explanation: "The concepts are designed to build upon each other for comprehensive understanding."
    },
    {
      id: 5,
      type: 'matching',
      question: "Match the concepts with their descriptions:",
      pairs: [
        { left: "Concept A", right: "Primary foundation" },
        { left: "Concept B", right: "Secondary application" },
        { left: "Concept C", right: "Advanced implementation" }
      ],
      correctAnswer: { // Add correct matching structure
        "Concept A": "Primary foundation",
        "Concept B": "Secondary application", 
        "Concept C": "Advanced implementation"
      },
      explanation: "Understanding these relationships helps grasp the overall structure of the material."
    }
  ];

  // Select questions based on count
  const selectedQuestions = mockQuestions.slice(0, questionCount);

  return {
    questions: selectedQuestions,
    metadata: {
      difficulty,
      estimatedTime: questionCount * 2,
      totalPoints: questionCount * 10,
      showExplanations
    }
  };
};

/**
 * Renders the quiz generator interface
 * @param {Object} props - Component props
 * @param {Object} props.quizSettings - Current quiz settings
 * @param {Function} props.onSettingsChange - Callback for settings changes
 * @param {Function} props.onGenerateQuiz - Callback for quiz generation
 * @param {boolean} props.isGenerating - Whether quiz is currently being generated
 * @param {string} props.content - Content to generate quiz from
 * @param {Object} props.styles - CSS modules styles object
 * @returns {JSX.Element} Rendered generator component
 */
export const renderGenerator = ({
  quizSettings,
  onSettingsChange,
  onGenerateQuiz,
  isGenerating,
  content,
  styles
}) => (
  <div className={styles.generatorContainer}>
    <div className={styles.generatorHeader}>
      <Brain className={styles.generatorIcon} size={48} />
      <h2 className={styles.generatorTitle}>Quiz Generator</h2>
    </div>

    <div className={styles.settingsCard}>
      <h3 className={styles.settingsTitle}>Quiz Settings</h3>
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
        onClick={onGenerateQuiz}
        disabled={isGenerating || !content}
        className={styles.generateButton}
      >
        {isGenerating ? (
          <>
            <div className={styles.loadingSpinner} />
            Generating Quiz...
          </>
        ) : (
          <>
            <Brain size={16} />
            Generate Quiz
          </>
        )}
      </button>
    </div>
  </div>
);

/**
 * Validates quiz generation settings
 * @param {Object} settings - Settings to validate
 * @returns {Object} Validation result with isValid and errors
 */
export const validateQuizSettings = (settings) => {
  const errors = [];
  
  if (settings.questionCount < 1 || settings.questionCount > 50) {
    errors.push('Question count must be between 1 and 50');
  }
  
  if (!['easy', 'medium', 'hard'].includes(settings.difficulty)) {
    errors.push('Difficulty must be easy, medium, or hard');
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