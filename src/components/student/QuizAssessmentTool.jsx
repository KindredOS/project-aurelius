//Path: src/components/student/QuizAssessmentTool.jsx
//Focus: Fixed version with proper state management and flow control
//Version Update: Updated QuizAssessmentTool.jsx - Fixed loading and state issues

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Award, Play, AlertCircle } from 'lucide-react';
import styles from './QuizAssessmentTool.module.css';

import {
  renderQuestionType,
  calculateProgress,
  getAnswerDisplayText,
  getCorrectAnswerDisplayText,
  renderQuizSettings,
  selectQuestionsFromStatic
} from '../../utils/quizGenerator';
import { renderResults, calculateQuizScore } from '../../utils/quizScoring';
import { validateQuizCompletion } from '../../utils/quizValidation';
import { logQuizAnalytics } from '../../api/ApiMaster';

const QuizAssessmentTool = ({ 
  content, 
  subject = 'science', 
  sectionTitle = 'Overview',
  topicId = null,
  topicData = null,
  userEmail = null
}) => {
  const [quiz, setQuiz] = useState(null);
  const [rawQuizData, setRawQuizData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizSettings, setQuizSettings] = useState({
    difficulty: 'medium',
    questionCount: 5,
    showExplanations: true
  });
  const [validationErrors, setValidationErrors] = useState([]);
  const [loadError, setLoadError] = useState(null);
  const quizStartTimeRef = useRef(null);

  // Smart filename determination based on available data
  const getQuizFilename = () => {
    if (topicId) {
      return topicId;
    }
    
    if (topicData && topicData.id) {
      return topicData.id;
    }
    
    const moduleMatch = sectionTitle.match(/module\s*(\d+)/i);
    if (moduleMatch) {
      return `module${moduleMatch[1]}`;
    }
    
    const titleMap = {
      'Science Assessment': 'overview',
      'Overview': 'overview',
      'General': 'overview'
    };
    
    return titleMap[sectionTitle] || 'overview';
  };

  const loadStaticQuizData = async () => {
    setIsLoading(true);
    setLoadError(null);
    
    const filename = getQuizFilename();
    const filePath = `/data/${subject}/quiz/${encodeURIComponent(filename)}.json`;
    
    try {
      const res = await fetch(filePath);
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      
      if (!data.questions || !Array.isArray(data.questions)) {
        throw new Error('Invalid format: missing or invalid questions array');
      }
      
      setRawQuizData(data);
      
    } catch (err) {
      console.error('Quiz loading failed:', err);
      setLoadError(`Failed to load quiz: ${err.message}`);
      setRawQuizData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const createDynamicQuiz = useCallback(() => {
    if (!rawQuizData || !rawQuizData.questions) {
      console.error('No raw quiz data available');
      return;
    }

    // Select questions based on settings
    const selectedQuestions = selectQuestionsFromStatic(rawQuizData.questions, quizSettings);

    // Create the quiz object
    const dynamicQuiz = {
      questions: selectedQuestions,
      metadata: {
        ...rawQuizData.metadata,
        selectedDifficulty: quizSettings.difficulty,
        requestedCount: quizSettings.questionCount,
        actualCount: selectedQuestions.length
      }
    };

    setQuiz(dynamicQuiz);
    
    // Reset other states
    setCurrentQuestion(0);
    setUserAnswers({});
    setShowResults(false);
    setQuizStarted(false);
    setValidationErrors([]);
  }, [rawQuizData, quizSettings]);

  // Auto-create quiz when rawQuizData is loaded
  useEffect(() => {
    if (rawQuizData && !quiz) {
      createDynamicQuiz();
    }
  }, [rawQuizData, quiz, createDynamicQuiz]);

  const handleSettingsChange = (key, value) => {
    setQuizSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleLoadQuiz = async () => {
    if (rawQuizData) {
      // We already have the data, just create the dynamic quiz
      createDynamicQuiz();
    } else {
      // Need to load the data first
      await loadStaticQuizData();
      // Note: createDynamicQuiz will be called automatically by useEffect
    }
  };

  const handleStartQuiz = () => {
    quizStartTimeRef.current = Date.now();
    setQuizStarted(true);
    setUserAnswers({});
    setCurrentQuestion(0);
    setShowResults(false);
    setValidationErrors([]);
  };

  const handleAnswerChange = (questionId, answer) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmitQuiz = async () => {
    const validation = validateQuizCompletion(quiz, userAnswers);
    if (!validation.isComplete) {
      const messages = validation.unansweredQuestions.map(q => `Question ${q.questionIndex + 1} is unanswered.`);
      setValidationErrors(messages);
      return;
    }

    const endTime = Date.now();
    const timeSpentMs = endTime - (quizStartTimeRef.current || endTime);
    
    const scoreResult = calculateQuizScore(quiz, userAnswers);
    const { score, total, percentage, details } = scoreResult;
    
    const totalAttempts = Object.keys(userAnswers).length;
    const correctAnswers = details.filter(d => d.isCorrect).length;
    const incorrectAnswers = totalAttempts - correctAnswers;
    const partialCreditQuestions = details.filter(d => d.points > 0 && d.points < 1).length;

    const analyticsPayload = {
      subject,
      sectionTitle,
      topicId: topicId || getQuizFilename(),
      userEmail,
      timestamp: new Date().toISOString(),
      quizSettings,
      timeSpentMs,
      totalQuestions: total,
      totalAttempts,
      correctAnswers,
      incorrectAnswers,
      partialCreditQuestions,
      finalScore: score,
      percentage,
      loadMethod: 'static-dynamic',
      scoreDetails: details,
      availableQuestions: rawQuizData?.questions?.length || 0
    };

    try {
      await logQuizAnalytics(analyticsPayload);
    } catch (error) {
      console.error('Analytics logging failed:', error);
    }

    setShowResults(true);
    setQuizStarted(false);
  };

  const handlePreviousQuestion = () => setCurrentQuestion(prev => Math.max(0, prev - 1));
  const handleNextQuestion = () => setCurrentQuestion(prev => Math.min(quiz.questions.length - 1, prev + 1));
  
  const resetQuiz = () => {
    setShowResults(false);
    setQuiz(null);
    setRawQuizData(null);
    setUserAnswers({});
    setCurrentQuestion(0);
    setQuizStarted(false);
    setValidationErrors([]);
    setLoadError(null);
  };
  
  const retakeQuiz = () => {
    // Regenerate quiz with same settings
    createDynamicQuiz();
    setQuizStarted(false);
    setShowResults(false);
    setUserAnswers({});
    setCurrentQuestion(0);
    setValidationErrors([]);
  };

  const getDisplayTitle = () => {
    if (topicData && topicData.title) {
      return topicData.title;
    }
    return sectionTitle;
  };

  const renderQuizStart = () => (
    <div className={styles.quizStart}>
      <Award className={styles.quizStartIcon} size={48} />
      <h2 className={styles.quizStartTitle}>Ready for a Quiz?</h2>
      <p className={styles.quizStartSubtitle}>
        Test your knowledge of {getDisplayTitle()}
      </p>

      <div className={styles.instructionsCard}>
        <div className={styles.instructionsHeader}>
          <AlertCircle size={16} />
          <span>Quiz Details</span>
        </div>
        <ul className={styles.instructionsList}>
          <li>• {quiz.questions.length} questions selected from {rawQuizData.questions.length} available</li>
          <li>• Difficulty: {quizSettings.difficulty === 'mixed' ? 'All levels' : quizSettings.difficulty}</li>
          <li>• Read each question carefully before answering</li>
          <li>• You can navigate between questions using the navigation buttons</li>
          <li>• Make sure to answer all questions before submitting</li>
        </ul>
        <div className={styles.loadMethodTag}>
          Quiz source: {getQuizFilename()}.json ({rawQuizData.questions.length} total questions)
        </div>
      </div>

      <button onClick={handleStartQuiz} className={styles.startButton}>
        <Play size={16} />
        Start Quiz
      </button>
    </div>
  );

  const renderLoadError = () => (
    <div className={styles.quizStart}>
      <AlertCircle className={styles.quizStartIcon} size={48} color="red" />
      <h2 className={styles.quizStartTitle}>Quiz Loading Failed</h2>
      <div className={styles.errorMessage}>
        <p><strong>Error:</strong> {loadError}</p>
        <p><strong>Expected file path:</strong> /data/{subject}/quiz/{encodeURIComponent(getQuizFilename())}.json</p>
        <p><strong>Make sure the file exists in your public folder at:</strong></p>
        <code>public/data/{subject}/quiz/{getQuizFilename()}.json</code>
        <div style={{ marginTop: '10px', fontSize: '0.9em', color: '#666' }}>
          <strong>Debug Info:</strong><br/>
          Topic ID: {topicId || 'null'}<br/>
          Section Title: {sectionTitle}<br/>
          Determined filename: {getQuizFilename()}<br/>
          Raw Quiz Data: {rawQuizData ? 'Loaded' : 'Not loaded'}<br/>
          Quiz Object: {quiz ? 'Created' : 'Not created'}
        </div>
      </div>
      <button onClick={loadStaticQuizData} className={styles.startButton}>
        Try Again
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
            <div className={styles.difficultyBadge}>
              {question.difficulty || 'Standard'}
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
        {/* Initial settings screen */}
        {!rawQuizData && !loadError && !isLoading && renderQuizSettings({
          quizSettings,
          onSettingsChange: handleSettingsChange,
          onLoadQuiz: handleLoadQuiz,
          isLoading: false,
          styles
        })}
        
        {/* Loading state */}
        {isLoading && (
          <div className={styles.quizStart}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading quiz data...</p>
          </div>
        )}
        
        {/* Load error */}
        {loadError && renderLoadError()}
        
        {/* Quiz ready to start */}
        {quiz && !quizStarted && !showResults && renderQuizStart()}
        
        {/* Quiz in progress */}
        {quiz && quizStarted && !showResults && renderQuizQuestion()}
        
        {/* Quiz results */}
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