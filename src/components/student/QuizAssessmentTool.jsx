// Fixed QuizAssessmentTool.jsx - Now properly integrated with dashboard data
import React, { useState, useRef } from 'react';
import { Award, Play, AlertCircle } from 'lucide-react';
import styles from './QuizAssessmentTool.module.css';

import {
  renderQuestionType,
  createInitialQuizState,
  calculateProgress,
  getAnswerDisplayText,
  getCorrectAnswerDisplayText,
  renderGenerator
} from '../../utils/quizGenerator';
import { renderResults, calculateQuizScore } from '../../utils/quizScoring';
import { validateQuizCompletion } from '../../utils/quizValidation';
import { logQuizAnalytics } from '../../api/ApiMaster';

const QuizAssessmentTool = ({ 
  content, 
  subject = 'science', 
  sectionTitle = 'Overview',
  topicId = null,           // NEW: Get the actual topic ID from dashboard
  topicData = null,         // NEW: Get the full topic data object
  userEmail = null          // NEW: For analytics
}) => {
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
  const [loadError, setLoadError] = useState(null);
  const quizStartTimeRef = useRef(null);

  // Smart filename determination based on available data
  const getQuizFilename = () => {
    console.log('🔍 getQuizFilename called with:');
    console.log('  topicId:', topicId);
    console.log('  topicData:', topicData);
    console.log('  sectionTitle:', sectionTitle);
    
    // Priority 1: Use topicId if available (most reliable for modular structure)
    if (topicId) {
      console.log('🎯 Using topicId directly:', topicId);
      return topicId;
    }
    
    // Priority 2: Use topic data ID if available
    if (topicData && topicData.id) {
      console.log('🎯 Using topicData.id:', topicData.id);
      return topicData.id;
    }
    
    // Priority 3: Try to extract module info from sectionTitle
    const moduleMatch = sectionTitle.match(/module\s*(\d+)/i);
    if (moduleMatch) {
      const moduleId = `module${moduleMatch[1]}`;
      console.log('🎯 Extracted module from title:', moduleId);
      return moduleId;
    }
    
    // Priority 4: Generic fallbacks for common titles
    const titleMap = {
      'Science Assessment': 'overview',
      'Overview': 'overview',
      'General': 'overview'
    };
    
    const mapped = titleMap[sectionTitle];
    if (mapped) {
      console.log('🎯 Mapped title to:', mapped);
      return mapped;
    }
    
    // Priority 5: Default fallback
    console.log('🎯 Using default fallback: overview');
    return 'overview';
  };

  const fetchStaticQuiz = async () => {
    setIsGenerating(true);
    setLoadError(null);
    
    const filename = getQuizFilename();
    const filePath = `/data/${subject}/quiz/${encodeURIComponent(filename)}.json`;
    
    // Debug logging
    console.log('=== QUIZ LOADING DEBUG ===');
    console.log('Subject:', subject);
    console.log('Section Title:', sectionTitle);
    console.log('Topic ID:', topicId);
    console.log('Topic Data:', topicData);
    console.log('Determined filename:', filename);
    console.log('Full file path:', filePath);
    console.log('========================');
    
    try {
      console.log('Attempting to fetch:', filePath);
      const res = await fetch(filePath);
      
      console.log('Fetch response status:', res.status);
      console.log('Fetch response ok:', res.ok);
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      console.log('Raw JSON data:', data);
      
      if (!data.questions || !Array.isArray(data.questions)) {
        console.error('Invalid data structure. Expected questions array, got:', data);
        throw new Error('Invalid format: missing or invalid questions array');
      }
      
      console.log('Questions found:', data.questions.length);
      console.log('First question sample:', data.questions[0]);
      
      setQuiz({ questions: data.questions });
      const initialState = createInitialQuizState({ questions: data.questions });
      setCurrentQuestion(initialState.currentQuestion);
      setUserAnswers(initialState.userAnswers);
      setShowResults(initialState.showResults);
      setQuizStarted(initialState.quizStarted);
      
      console.log('Quiz loaded successfully!');
      
    } catch (err) {
      console.error('Quiz loading failed:', err);
      setLoadError(`Failed to load quiz: ${err.message}`);
      setQuiz(null);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSettingsChange = (key, value) => {
    setQuizSettings(prev => ({ ...prev, [key]: value }));
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
    
    // Use the new calculateQuizScore function for consistent scoring
    const scoreResult = calculateQuizScore(quiz, userAnswers);
    const { score, total, percentage, details } = scoreResult;
    
    // Calculate additional metrics for analytics
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
      loadMethod: 'static',
      scoreDetails: details
    };

    await logQuizAnalytics(analyticsPayload);

    setShowResults(true);
    setQuizStarted(false);
  };

  const handlePreviousQuestion = () => setCurrentQuestion(prev => Math.max(0, prev - 1));
  const handleNextQuestion = () => setCurrentQuestion(prev => Math.min(quiz.questions.length - 1, prev + 1));
  
  const resetQuiz = () => {
    setShowResults(false);
    setQuiz(null);
    setUserAnswers({});
    setCurrentQuestion(0);
    setQuizStarted(false);
    setValidationErrors([]);
    setLoadError(null);
  };
  
  const retakeQuiz = () => {
    const initialState = createInitialQuizState(quiz);
    setQuizStarted(initialState.quizStarted);
    setShowResults(initialState.showResults);
    setUserAnswers(initialState.userAnswers);
    setCurrentQuestion(initialState.currentQuestion);
  };

  // Get display title for the quiz
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
          <span>Instructions</span>
        </div>
        <ul className={styles.instructionsList}>
          <li>• Read each question carefully before answering</li>
          <li>• You can navigate between questions using the navigation buttons</li>
          <li>• Make sure to answer all questions before submitting</li>
          <li>• Your progress will be saved automatically</li>
        </ul>
        <div className={styles.loadMethodTag}>
          Quiz file: {getQuizFilename()}.json
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
          Determined filename: {getQuizFilename()}
        </div>
      </div>
      <button onClick={fetchStaticQuiz} className={styles.startButton}>
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
        {!quiz && !loadError && renderGenerator({
          quizSettings,
          onSettingsChange: handleSettingsChange,
          onGenerateQuiz: fetchStaticQuiz,
          isGenerating,
          content,
          styles
        })}
        {loadError && renderLoadError()}
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