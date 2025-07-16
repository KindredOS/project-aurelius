// utils/quizScoring.js

/**
 * Calculates the score for a completed quiz
 * @param {Object} quiz - The quiz object
 * @param {Object} userAnswers - Object containing user answers keyed by question ID
 * @returns {Object} Score calculation result
 */
export const calculateQuizScore = (quiz, userAnswers) => {
  if (!quiz || !quiz.questions || !userAnswers) {
    return { score: 0, total: 0, percentage: 0, details: [] };
  }
  
  let correct = 0;
  const details = [];
  
  quiz.questions.forEach((question, index) => {
    const userAnswer = userAnswers[question.id];
    let isCorrect = false;
    let points = 0;
    
    switch (question.type) {
      case 'multiple-choice':
        isCorrect = userAnswer === question.correct;
        points = isCorrect ? 1 : 0;
        break;
        
      case 'true-false':
        isCorrect = userAnswer === question.correct;
        points = isCorrect ? 1 : 0;
        break;
        
      case 'matching':
        if (userAnswer && question.pairs) {
          const correctPairs = question.pairs.filter(pair => 
            userAnswer[pair.left] === pair.right
          );
          points = correctPairs.length / question.pairs.length;
          isCorrect = points === 1;
        }
        break;
        
      case 'short-answer':
        // Basic validation for short answers
        if (userAnswer && userAnswer.trim().length > 10) {
          points = 0.5; // Partial credit for attempt
          isCorrect = true;
        }
        break;
        
      default:
        points = 0;
        isCorrect = false;
    }
    
    correct += points;
    details.push({
      questionIndex: index,
      questionId: question.id,
      isCorrect,
      points,
      maxPoints: 1,
      userAnswer,
      correctAnswer: question.correct
    });
  });
  
  const total = quiz.questions.length;
  const percentage = Math.round((correct / total) * 100);
  
  return {
    score: correct,
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