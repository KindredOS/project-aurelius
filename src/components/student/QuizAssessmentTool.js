// Updated QuizAssessmentTool.jsx with proper CSS integration
import React, { useState, useEffect } from 'react';
import {
  Award, Brain, CheckCircle, XCircle, Clock,
  RotateCcw, Play, BookOpen, Target,
  AlertCircle, ChevronRight
} from 'lucide-react';
import styles from './QuizAssessmentTool.module.css';

import { generateQuizContent } from '../../utils/quizGenerator';
import { calculateQuizScore, getGradeClass, getLetterGrade } from '../../utils/quizScoring';
import { validateQuizCompletion } from '../../utils/quizValidation';

const QuizAssessmentTool = ({ content, sectionTitle = "Overview" }) => {
  const [activeTab, setActiveTab] = useState('generator');
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [quizSettings, setQuizSettings] = useState({
    difficulty: 'medium',
    questionCount: 5,
    timeLimit: 10,
    showExplanations: true
  });
  const [validationErrors, setValidationErrors] = useState([]);

  useEffect(() => {
    let interval;
    if (quizStarted && timeRemaining > 0 && !showResults) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [quizStarted, timeRemaining, showResults]);

  const handleGenerateQuiz = async () => {
    setIsGenerating(true);
    try {
      const generatedQuiz = await generateQuizContent(content, quizSettings);
      setQuiz(generatedQuiz);
      setUserAnswers({});
      setCurrentQuestion(0);
      setShowResults(false);
      setQuizStarted(false);
      setActiveTab('quiz');
    } catch (error) {
      console.error('Quiz generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartQuiz = () => {
    setQuizStarted(true);
    setTimeRemaining(quizSettings.timeLimit * 60);
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
    setActiveTab('results');
  };

  const handlePreviousQuestion = () => {
    setCurrentQuestion(prev => Math.max(0, prev - 1));
  };

  const handleNextQuestion = () => {
    setCurrentQuestion(prev => Math.min(quiz.questions.length - 1, prev + 1));
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderQuestionType = (question) => {
    const userAnswer = userAnswers[question.id];
    
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
                  onChange={() => handleAnswerChange(question.id, index)}
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
                  onChange={() => handleAnswerChange(question.id, option)}
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
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
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
                  onChange={(e) => handleAnswerChange(question.id, {
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

  const renderGenerator = () => (
    <div className={styles.generatorContainer}>
      <div className={styles.generatorHeader}>
        <Brain className={styles.generatorIcon} size={48} />
        <h2 className={styles.generatorTitle}>Quiz Generator</h2>
        <p className={styles.generatorSubtitle}>
          Create a customized quiz based on your content
        </p>
      </div>

      <div className={styles.settingsCard}>
        <h3 className={styles.settingsTitle}>Quiz Settings</h3>
        <div className={styles.settingsGrid}>
          <div className={styles.settingGroup}>
            <label className={styles.settingLabel}>Difficulty Level</label>
            <select
              value={quizSettings.difficulty}
              onChange={(e) => setQuizSettings(prev => ({ ...prev, difficulty: e.target.value }))}
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
              onChange={(e) => setQuizSettings(prev => ({ ...prev, questionCount: parseInt(e.target.value) }))}
              className={styles.settingSelect}
            >
              <option value="5">5 Questions</option>
              <option value="10">10 Questions</option>
              <option value="15">15 Questions</option>
              <option value="20">20 Questions</option>
            </select>
          </div>

          <div className={styles.settingGroup}>
            <label className={styles.settingLabel}>Time Limit (minutes)</label>
            <select
              value={quizSettings.timeLimit}
              onChange={(e) => setQuizSettings(prev => ({ ...prev, timeLimit: parseInt(e.target.value) }))}
              className={styles.settingSelect}
            >
              <option value="5">5 Minutes</option>
              <option value="10">10 Minutes</option>
              <option value="15">15 Minutes</option>
              <option value="20">20 Minutes</option>
              <option value="30">30 Minutes</option>
            </select>
          </div>

          <div className={styles.settingGroup}>
            <div className={styles.checkboxGroup}>
              <input
                type="checkbox"
                id="showExplanations"
                checked={quizSettings.showExplanations}
                onChange={(e) => setQuizSettings(prev => ({ ...prev, showExplanations: e.target.checked }))}
                className={styles.checkbox}
              />
              <label htmlFor="showExplanations" className={styles.checkboxLabel}>
                Show explanations after quiz
              </label>
            </div>
          </div>
        </div>

        <div className={styles.contentSource}>
          <div className={styles.contentSourceHeader}>
            <BookOpen size={16} />
            <span>Content Source</span>
          </div>
          <div className={styles.contentSourceText}>
            {sectionTitle} - {content ? `${content.substring(0, 100)}...` : 'No content provided'}
          </div>
        </div>

        <button
          onClick={handleGenerateQuiz}
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
    const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

    return (
      <div className={styles.quizContainer}>
        <div className={styles.quizHeader}>
          <div className={styles.quizHeaderTop}>
            <div className={styles.quizHeaderLeft}>
              <div className={styles.questionCounter}>
                Question {currentQuestion + 1} of {quiz.questions.length}
              </div>
              <div className={styles.timer}>
                <Clock size={16} />
                <span className={styles.timerText}>{formatTime(timeRemaining)}</span>
              </div>
            </div>
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className={styles.questionCard}>
          <div className={styles.questionType}>{question.type.replace('-', ' ')}</div>
          <div className={styles.questionText}>{question.question}</div>
          {renderQuestionType(question)}
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

  const renderResults = () => {
    const { score, total, percentage } = calculateQuizScore(quiz, userAnswers);
    
    return (
      <div className={styles.resultsContainer}>
        <div className={styles.scoreCard}>
          <div className={`${styles.gradeLetter} ${styles[getGradeClass(percentage)]}`}>
            {getLetterGrade(percentage)}
          </div>
          <div className={styles.scoreDetails}>
            {score.toFixed(1)} / {total} ({percentage}%)
          </div>
          <div className={styles.timeDetails}>
            Completed in {formatTime((quizSettings.timeLimit * 60) - timeRemaining)}
          </div>
        </div>

        {quizSettings.showExplanations && (
          <div className={styles.reviewSection}>
            <h3 className={styles.reviewTitle}>Question Review</h3>
            {quiz.questions.map((question, index) => {
              const userAnswer = userAnswers[question.id];
              const isCorrect = userAnswer === question.correctAnswer;
              
              return (
                <div key={question.id} className={styles.reviewCard}>
                  <div className={styles.reviewContent}>
                    <div className={`${styles.reviewIcon} ${isCorrect ? styles.reviewIconCorrect : styles.reviewIconIncorrect}`}>
                      {isCorrect ? <CheckCircle size={20} /> : <XCircle size={20} />}
                    </div>
                    <div className={styles.reviewDetails}>
                      <div className={styles.reviewQuestion}>
                        {index + 1}. {question.question}
                      </div>
                      <div className={styles.reviewAnswers}>
                        <div className={styles.reviewUserAnswer}>
                          Your answer: {question.type === 'multiple-choice' ? question.options[userAnswer] : String(userAnswer)}
                        </div>
                        {!isCorrect && (
                          <div className={styles.reviewCorrectAnswer}>
                            Correct answer: {question.type === 'multiple-choice' ? question.options[question.correctAnswer] : String(question.correctAnswer)}
                          </div>
                        )}
                      </div>
                      {question.explanation && (
                        <div className={styles.reviewExplanation}>
                          <div className={styles.reviewExplanationLabel}>Explanation:</div>
                          <div className={styles.reviewExplanationText}>{question.explanation}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className={styles.actionButtons}>
          <button
            onClick={() => {
              setActiveTab('generator');
              setShowResults(false);
              setQuiz(null);
            }}
            className={styles.actionButton}
          >
            <RotateCcw size={16} />
            New Quiz
          </button>
          <button
            onClick={() => {
              setQuizStarted(false);
              setShowResults(false);
              setUserAnswers({});
              setCurrentQuestion(0);
              setActiveTab('quiz');
            }}
            className={`${styles.actionButton} ${styles.actionButtonPrimary}`}
          >
            <Play size={16} />
            Retake Quiz
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Quiz Assessment Tool</h1>
        <p className={styles.subtitle}>
          Generate and take quizzes based on your learning content
        </p>
      </div>

      <div className={styles.tabNavigation}>
        <div className={styles.tabContainer}>
          <button
            onClick={() => setActiveTab('generator')}
            className={`${styles.tabButton} ${activeTab === 'generator' ? styles.tabButtonActive : styles.tabButtonInactive}`}
          >
            Generator
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            disabled={!quiz}
            className={`${styles.tabButton} ${activeTab === 'quiz' ? styles.tabButtonActive : styles.tabButtonInactive}`}
          >
            Quiz
          </button>
          <button
            onClick={() => setActiveTab('results')}
            disabled={!showResults}
            className={`${styles.tabButton} ${activeTab === 'results' ? styles.tabButtonActive : styles.tabButtonInactive}`}
          >
            Results
          </button>
        </div>
      </div>

      <div className={styles.tabContent}>
        {activeTab === 'generator' && renderGenerator()}
        {activeTab === 'quiz' && quiz && (
          quizStarted ? renderQuizQuestion() : renderQuizStart()
        )}
        {activeTab === 'results' && showResults && renderResults()}
      </div>
    </div>
  );
};

export default QuizAssessmentTool;