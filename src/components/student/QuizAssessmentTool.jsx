// Refactored QuizAssessmentTool.jsx without timer functionality
import React, { useState } from 'react';
import {Award, Brain, CheckCircle, XCircle, RotateCcw, Play, AlertCircle} from 'lucide-react';
import styles from './QuizAssessmentTool.module.css';

import { 
  generateQuizContent, 
  renderQuestionType, 
  createInitialQuizState, 
  calculateProgress,
  getAnswerDisplayText,
  getCorrectAnswerDisplayText,
  renderGenerator
} from '../../utils/quizGenerator';
import { renderResults } from '../../utils/quizScoring';
import { validateQuizCompletion } from '../../utils/quizValidation';

const QuizAssessmentTool = ({ content, sectionTitle = "Overview" }) => {
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizSettings, setQuizSettings] = useState({
    difficulty: 'medium',
    questionCount: 5,
    showExplanations: true
  });
  const [validationErrors, setValidationErrors] = useState([]);

  // Handler for settings changes
  const handleSettingsChange = (key, value) => {
    setQuizSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleGenerateQuiz = async () => {
    setIsGenerating(true);
    try {
      const generatedQuiz = await generateQuizContent(content, quizSettings);
      setQuiz(generatedQuiz);
      // Reset to initial state
      const initialState = createInitialQuizState(generatedQuiz);
      setCurrentQuestion(initialState.currentQuestion);
      setUserAnswers(initialState.userAnswers);
      setShowResults(initialState.showResults);
      setQuizStarted(initialState.quizStarted);
    } catch (error) {
      console.error('Quiz generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartQuiz = () => {
    setQuizStarted(true);
    setUserAnswers({});
    setCurrentQuestion(0);
    setShowResults(false);
    setValidationErrors([]);
  };

  const handleAnswerChange = (questionId, answer) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmitQuiz = () => {
    const validation = validateQuizCompletion(quiz, userAnswers);
    if (!validation.isComplete) {
      const messages = validation.unansweredQuestions.map(q => `Question ${q.questionIndex + 1} is unanswered.`);
      setValidationErrors(messages);
      return;
    }

    setShowResults(true);
    setQuizStarted(false);
  };

  const handlePreviousQuestion = () => {
    setCurrentQuestion(prev => Math.max(0, prev - 1));
  };

  const handleNextQuestion = () => {
    setCurrentQuestion(prev => Math.min(quiz.questions.length - 1, prev + 1));
  };

  const resetQuiz = () => {
    setShowResults(false);
    setQuiz(null);
    setUserAnswers({});
    setCurrentQuestion(0);
    setQuizStarted(false);
    setValidationErrors([]);
  };

  const retakeQuiz = () => {
    const initialState = createInitialQuizState(quiz);
    setQuizStarted(initialState.quizStarted);
    setShowResults(initialState.showResults);
    setUserAnswers(initialState.userAnswers);
    setCurrentQuestion(initialState.currentQuestion);
  };

  const renderQuizStart = () => (
    <div className={styles.quizStart}>
      <Award className={styles.quizStartIcon} size={48} />
      <h2 className={styles.quizStartTitle}>Ready for a Quiz?</h2>
      <p className={styles.quizStartSubtitle}>
        Test your knowledge of {sectionTitle}
      </p>

      <div className={styles.instructionsCard}>
        <div className={styles.instructionsHeader}>
          <AlertCircle size={16} />
          <span>Instructions</span>
        </div>
        <ul className={styles.instructionsList}>
          <li>• Read each question carefully before answering</li>
          <li>• You can navigate between questions using the navigation buttons</li>
          <li>• Make sure to answer all questions before submitting</li>
          <li>• Your progress will be saved automatically</li>
        </ul>
      </div>

      <button onClick={handleStartQuiz} className={styles.startButton}>
        <Play size={16} />
        Start Quiz
      </button>
    </div>
  );

  const renderQuizQuestion = () => {
    const question = quiz.questions[currentQuestion];
    const progress = calculateProgress(currentQuestion, quiz.questions.length);
    const userAnswer = userAnswers[question.id];

    return (
      <div className={styles.quizContainer}>
        <div className={styles.quizHeader}>
          <div className={styles.quizHeaderTop}>
            <div className={styles.questionCounter}>
              Question {currentQuestion + 1} of {quiz.questions.length}
            </div>
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className={styles.questionCard}>
          <div className={styles.questionType}>{question.type.replace('-', ' ')}</div>
          <div className={styles.questionText}>{question.question}</div>
          {renderQuestionType(question, userAnswer, handleAnswerChange, styles)}
        </div>

        <div className={styles.quizNavigation}>
          <button
            onClick={handlePreviousQuestion}
            disabled={currentQuestion === 0}
            className={styles.navButton}
          >
            Previous
          </button>
          
          <div className={styles.navButtonGroup}>
            {currentQuestion < quiz.questions.length - 1 ? (
              <button onClick={handleNextQuestion} className={styles.nextButton}>
                Next
              </button>
            ) : (
              <button onClick={handleSubmitQuiz} className={styles.submitButton}>
                Submit Quiz
              </button>
            )}
          </div>
        </div>

        {validationErrors.length > 0 && (
          <div className={styles.validationErrors}>
            <ul>
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Quiz Assessment Tool</h1>
      </div>

      <div className={styles.content}>
        {!quiz && renderGenerator({
          quizSettings,
          onSettingsChange: handleSettingsChange,
          onGenerateQuiz: handleGenerateQuiz,
          isGenerating,
          content,
          styles
        })}
        {quiz && !quizStarted && !showResults && renderQuizStart()}
        {quiz && quizStarted && !showResults && renderQuizQuestion()}
        {quiz && showResults && renderResults({
          quiz,
          userAnswers,
          quizSettings,
          resetQuiz,
          retakeQuiz,
          getAnswerDisplayText,
          getCorrectAnswerDisplayText,
          styles
        })}
      </div>
    </div>
  );
};

export default QuizAssessmentTool;