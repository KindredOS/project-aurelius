// components/student/Quiz.jsx
import React from 'react';
import { Trophy, Award } from 'lucide-react';

const Quiz = ({ 
  currentQuiz, 
  topics, 
  answerQuestion, 
  setCurrentQuiz, 
  startQuiz, 
  selectedTopic, 
  quizData, 
  styles,
  completionTitle = "Quiz Complete!",
  startTitle = "Ready for a Quiz?"
}) => {
  if (!currentQuiz) {
    return (
      <div className={styles.quizStartCard}>
        <Award className={styles.quizStartIcon} />
        <h3 className={styles.quizStartTitle}>{startTitle}</h3>
        <p className={styles.quizStartDescription}>
          Test your knowledge of {topics.find(t => t.id === selectedTopic)?.name}
        </p>
        <button
          onClick={() => startQuiz(selectedTopic)}
          className={styles.quizStartButton}
          disabled={!quizData || quizData.length === 0}
        >
          {quizData && quizData.length > 0 ? 'Start Quiz' : 'Quiz Coming Soon'}
        </button>
      </div>
    );
  }

  if (currentQuiz.completed) {
    return (
      <div className={styles.quizCard}>
        <div className={styles.quizCompletion}>
          <Trophy className={styles.completionIcon} />
          <h3 className={styles.completionTitle}>{completionTitle}</h3>
          <p className={styles.completionScore}>
            Score: {currentQuiz.finalScore}/{currentQuiz.questions.length} ({currentQuiz.percentage}%)
          </p>
          <div className={styles.completionActions}>
            <button 
              onClick={() => setCurrentQuiz(null)}
              className={`${styles.completionButton} ${styles.completionButtonPrimary}`}
            >
              Continue Learning
            </button>
            <button 
              onClick={() => startQuiz(currentQuiz.topic)}
              className={`${styles.completionButton} ${styles.completionButtonSecondary}`}
            >
              Retake Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = currentQuiz.questions[currentQuiz.currentQuestion];
  
  return (
    <div className={styles.quizCard}>
      <div className={styles.quizHeader}>
        <div className={styles.quizTitleRow}>
          <h3 className={styles.quizTitle}>
            Quiz: {topics.find(t => t.id === currentQuiz.topic)?.name}
          </h3>
          <span className={styles.quizCounter}>
            {currentQuiz.currentQuestion + 1} / {currentQuiz.questions.length}
          </span>
        </div>
        <div className={styles.quizProgressBar}>
          <div 
            className={styles.quizProgressFill}
            style={{ width: `${((currentQuiz.currentQuestion + 1) / currentQuiz.questions.length) * 100}%` }}
          ></div>
        </div>
      </div>
      
      <h4 className={styles.quizQuestion}>{question.question}</h4>
      
      <div className={styles.quizOptions}>
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => answerQuestion(index)}
            className={styles.quizOption}
          >
            {String.fromCharCode(65 + index)}. {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Quiz;
