// utils/quizScoring.js - TARGETED DEBUG VERSION
import React from 'react';
import { CheckCircle, XCircle, RotateCcw, Play } from 'lucide-react';

/**
 * Calculates the score for a completed quiz - DEBUG VERSION
 * @param {Object} quiz - The quiz object
 * @param {Object} userAnswers - Object containing user answers keyed by question ID
 * @returns {Object} Score calculation result
 */
export const calculateQuizScore = (quiz, userAnswers) => {
  if (!quiz || !quiz.questions || !userAnswers) {
    return { score: 0, total: 0, percentage: 0, details: [] };
  }
  
  console.log('🔍 TARGETED DEBUG - Looking for the 0.5 point issue');
  console.log('Quiz has', quiz.questions.length, 'questions');
  console.log('UserAnswers keys:', Object.keys(userAnswers));
  
  let totalScore = 0;
  const details = [];
  
  quiz.questions.forEach((question, index) => {
    const userAnswer = userAnswers[question.id];
    let isCorrect = false;
    let points = 0;
    const maxPoints = 1;
    
    console.log(`\n--- Question ${index + 1} (ID: ${question.id}) ---`);
    console.log('Type:', question.type);
    console.log('User Answer:', JSON.stringify(userAnswer), typeof userAnswer);
    console.log('Correct Answer:', JSON.stringify(question.correctAnswer), typeof question.correctAnswer);
    
    switch (question.type) {
      case 'multiple-choice': {
        console.log('Processing multiple-choice...');
        if (question.options) {
          console.log('Options:', question.options);
          if (typeof question.correctAnswer === 'number') {
            console.log('Correct option text:', question.options[question.correctAnswer]);
          }
        }
        
        if (typeof userAnswer === 'number' && typeof question.correctAnswer === 'number') {
          isCorrect = userAnswer === question.correctAnswer;
          console.log('✓ Number comparison:', isCorrect);
        } else if (question.options && typeof question.correctAnswer === 'number') {
          const correctText = question.options[question.correctAnswer];
          const method1 = userAnswer === correctText;
          const method2 = question.options.indexOf(userAnswer) === question.correctAnswer;
          isCorrect = method1 || method2;
          console.log('✓ Text comparison - Method 1 (user === correctText):', method1);
          console.log('✓ Text comparison - Method 2 (indexOf):', method2);
          console.log('✓ Final result:', isCorrect);
        } else {
          isCorrect = userAnswer === question.correctAnswer;
          console.log('✓ Direct comparison:', isCorrect);
        }
        points = isCorrect ? 1 : 0;
        break;
      }
      
      case 'true-false': {
        console.log('Processing true-false...');
        const method1 = userAnswer === question.correctAnswer;
        const method2 = Boolean(userAnswer) === Boolean(question.correctAnswer);
        const method3 = String(userAnswer).toLowerCase() === String(question.correctAnswer).toLowerCase();
        
        console.log('✓ Method 1 (direct):', method1);
        console.log('✓ Method 2 (Boolean conversion):', method2); 
        console.log('✓ Method 3 (string comparison):', method3);
        
        isCorrect = method1 || method2 || method3;
        console.log('✓ Final true/false result:', isCorrect);
        points = isCorrect ? 1 : 0;
        break;
      }
      
      case 'matching': {
        console.log('Processing matching...');
        if (userAnswer && question.correctAnswer && typeof question.correctAnswer === 'object') {
          console.log('User matches:', userAnswer);
          console.log('Correct matches:', question.correctAnswer);
          const userKeys = Object.keys(userAnswer);
          const correctMatches = userKeys.filter(
            key => userAnswer[key] === question.correctAnswer[key]
          ).length;
          points = correctMatches / userKeys.length;
          isCorrect = points >= 1;
          console.log('✓ Matching - correct matches:', correctMatches, 'out of', userKeys.length);
          console.log('✓ Matching points:', points);
        }
        break;
      }
      
      case 'short-answer': {
        console.log('Processing short-answer...');
        if (userAnswer && typeof userAnswer === 'string') {
          const trimmed = userAnswer.trim().toLowerCase();
          const expected = question.correctAnswer?.trim().toLowerCase();
          console.log('✓ Trimmed user answer:', JSON.stringify(trimmed));
          console.log('✓ Expected answer:', JSON.stringify(expected));
          
          if (expected && trimmed === expected) {
            points = 1;
            isCorrect = true;
            console.log('✓ Exact match found - full credit');
          } else if (trimmed.length >= 5) {
            points = 0.5;
            isCorrect = false;
            console.log('✓ Partial credit - answer length >= 5');
          } else {
            console.log('✓ No credit - answer too short or empty');
          }
        }
        break;
      }
      
      default:
        console.log('❌ Unknown question type:', question.type);
        points = 0;
        isCorrect = false;
    }
    
    console.log(`🎯 FINAL: isCorrect=${isCorrect}, points=${points}`);
    console.log('=====================================');
    
    totalScore += points;
    details.push({
      questionIndex: index,
      questionId: question.id,
      isCorrect: points >= 1,
      points,
      maxPoints,
      userAnswer,
      correctAnswer: question.correctAnswer
    });
  });
  
  const total = quiz.questions.length;
  const percentage = Math.round((totalScore / total) * 100);
  
  console.log('\n🎯 FINAL SUMMARY:');
  console.log('Total score:', totalScore);
  console.log('Total questions:', total);
  console.log('Percentage:', percentage);
  console.log('Details:', details.map(d => ({ id: d.questionId, points: d.points, isCorrect: d.isCorrect })));
  
  return {
    score: totalScore,
    total,
    percentage,
    details
  };
};

/**
 * Determines letter grade based on percentage
 * @param {number} percentage - Score percentage
 * @returns {string} Letter grade
 */
export const getLetterGrade = (percentage) => {
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
};

/**
 * Gets CSS class for grade styling
 * @param {number} percentage - Score percentage
 * @returns {string} CSS class name
 */
export const getGradeClass = (percentage) => {
  if (percentage >= 90) return 'gradeA';
  if (percentage >= 80) return 'gradeB';
  if (percentage >= 70) return 'gradeC';
  return 'gradeD';
};

/**
 * Generates performance feedback based on score
 * @param {number} percentage - Score percentage
 * @returns {Object} Feedback object with message and suggestions
 */
export const generatePerformanceFeedback = (percentage) => {
  if (percentage >= 90) {
    return {
      message: "Excellent work! You have a strong understanding of the material.",
      suggestions: [
        "Consider helping others who might be struggling with this topic",
        "Try advancing to more challenging material"
      ]
    };
  }
  
  if (percentage >= 80) {
    return {
      message: "Good job! You have a solid grasp of most concepts.",
      suggestions: [
        "Review the questions you missed to strengthen weak areas",
        "Practice similar problems to reinforce your understanding"
      ]
    };
  }
  
  if (percentage >= 70) {
    return {
      message: "Fair performance. You understand the basics but need more practice.",
      suggestions: [
        "Focus on reviewing the explanations for missed questions",
        "Consider re-reading the relevant sections",
        "Take additional practice quizzes"
      ]
    };
  }
  
  return {
    message: "You may need to spend more time with the material.",
    suggestions: [
      "Review the source material thoroughly",
      "Consider seeking additional help or resources",
      "Take your time with each concept before moving on"
    ]
  };
};

/**
 * Renders the quiz results component
 * @param {Object} params - Parameters object
 * @param {Object} params.quiz - The quiz object
 * @param {Object} params.userAnswers - User answers keyed by question ID
 * @param {Object} params.quizSettings - Quiz settings including showExplanations
 * @param {Function} params.resetQuiz - Function to reset the quiz
 * @param {Function} params.retakeQuiz - Function to retake the quiz
 * @param {Function} params.getAnswerDisplayText - Function to get display text for user answer
 * @param {Function} params.getCorrectAnswerDisplayText - Function to get display text for correct answer
 * @param {Object} params.styles - CSS styles object
 * @returns {JSX.Element} The rendered results component
 */
export const renderResults = ({
  quiz,
  userAnswers,
  quizSettings,
  resetQuiz,
  retakeQuiz,
  getAnswerDisplayText,
  getCorrectAnswerDisplayText,
  styles
}) => {
  const scoreResult = calculateQuizScore(quiz, userAnswers);
  const { score, total, percentage, details } = scoreResult;
  const feedback = generatePerformanceFeedback(percentage);
  const letterGrade = getLetterGrade(percentage);
  
  return (
    <div className={styles.resultsContainer}>
      <div className={styles.scoreCard}>
        <div className={styles.scoreDisplay}>
          <div className={styles.scoreNumber}>{score.toFixed(1)}</div>
          <div className={styles.scoreTotal}>/ {total}</div>
        </div>
        <div className={styles.scorePercentage}>
          {percentage}%
        </div>
        <div className={styles.scoreGrade}>
          Grade: {letterGrade}
        </div>
        <div className={styles.scoreLabel}>
          Questions Correct
        </div>
        {/* DEBUG INFO */}
        <div style={{fontSize: '12px', color: '#666', marginTop: '10px'}}>
          DEBUG: Check console for detailed scoring breakdown
        </div>
      </div>

      <div className={styles.feedbackSection}>
        <div className={styles.feedbackMessage}>
          {feedback.message}
        </div>
        {feedback.suggestions.length > 0 && (
          <div className={styles.feedbackSuggestions}>
            <h4>Suggestions for improvement:</h4>
            <ul>
              {feedback.suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {quizSettings.showExplanations && (
        <div className={styles.reviewSection}>
          <h3 className={styles.reviewTitle}>Question Review</h3>
          {quiz.questions.map((question, index) => {
            const questionDetail = details.find(d => d.questionId === question.id);
            const userAnswer = userAnswers[question.id];
            const isCorrect = questionDetail ? questionDetail.isCorrect : false;
            const points = questionDetail ? questionDetail.points : 0;
            
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
                        Your answer: {getAnswerDisplayText(question, userAnswer)}
                      </div>
                      {!isCorrect && (
                        <div className={styles.reviewCorrectAnswer}>
                          Correct answer: {getCorrectAnswerDisplayText(question)}
                        </div>
                      )}
                      {points > 0 && points < 1 && (
                        <div className={styles.reviewPartialCredit}>
                          Partial credit: {points.toFixed(2)} / 1.0 points
                        </div>
                      )}
                      {/* DEBUG INFO */}
                      <div style={{fontSize: '11px', color: '#999', marginTop: '5px'}}>
                        DEBUG: Points={points} | Type={question.type} | User={JSON.stringify(userAnswer)} | Correct={JSON.stringify(question.correctAnswer)}
                      </div>
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
        <button onClick={resetQuiz} className={styles.actionButton}>
          <RotateCcw size={16} />
          New Quiz
        </button>
        <button onClick={retakeQuiz} className={`${styles.actionButton} ${styles.actionButtonPrimary}`}>
          <Play size={16} />
          Retake Quiz
        </button>
      </div>
    </div>
  );
};