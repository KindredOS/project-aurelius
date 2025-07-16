// utils/quizValidation.js

/**
 * Validates if a user answer is complete for a given question
 * @param {Object} question - The question object
 * @param {*} userAnswer - The user's answer
 * @returns {boolean} True if answer is complete
 */
export const isAnswerComplete = (question, userAnswer) => {
  if (!question) return false;
  
  switch (question.type) {
    case 'multiple-choice':
      return userAnswer !== undefined && userAnswer !== null;
      
    case 'true-false':
      return userAnswer !== undefined && userAnswer !== null;
      
    case 'short-answer':
      return userAnswer && 
             typeof userAnswer === 'string' && 
             userAnswer.trim().length >= 10;
      
    case 'matching':
      if (!userAnswer || !question.pairs) return false;
      return question.pairs.every(pair => 
        userAnswer[pair.left] && userAnswer[pair.left].trim() !== ''
      );
      
    default:
      return false;
  }
};

/**
 * Validates if all quiz questions have been answered
 * @param {Object} quiz - The quiz object
 * @param {Object} userAnswers - Object containing user answers
 * @returns {Object} Validation result
 */
export const validateQuizCompletion = (quiz, userAnswers) => {
  if (!quiz || !quiz.questions) {
    return {
      isComplete: false,
      unansweredQuestions: [],
      totalQuestions: 0,
      answeredQuestions: 0
    };
  }
  
  const unansweredQuestions = [];
  let answeredCount = 0;
  
  quiz.questions.forEach((question, index) => {
    const userAnswer = userAnswers[question.id];
    
    if (isAnswerComplete(question, userAnswer)) {
      answeredCount++;
    } else {
      unansweredQuestions.push({
        questionIndex: index,
        questionId: question.id,
        question: question.question
      });
    }
  });
  
  return {
    isComplete: unansweredQuestions.length === 0,
    unansweredQuestions,
    totalQuestions: quiz.questions.length,
    answeredQuestions: answeredCount
  };
};

/**
 * Validates a single question structure
 * @param {Object} question - Question to validate
 * @returns {Object} Validation result
 */
export const validateQuestionStructure = (question) => {
  const errors = [];
  
  if (!question) {
    errors.push('Question object is required');
    return { isValid: false, errors };
  }
  
  if (!question.id) {
    errors.push('Question ID is required');
  }
  
  if (!question.type) {
    errors.push('Question type is required');
  }
  
  if (!question.question || question.question.trim() === '') {
    errors.push('Question text is required');
  }
  
  // Type-specific validation
  switch (question.type) {
    case 'multiple-choice':
      if (!question.options || !Array.isArray(question.options)) {
        errors.push('Multiple choice questions must have options array');
      } else if (question.options.length < 2) {
        errors.push('Multiple choice questions must have at least 2 options');
      }
      
      if (question.correct === undefined || question.correct === null) {
        errors.push('Multiple choice questions must have a correct answer index');
      } else if (question.options && (question.correct >= question.options.length || question.correct < 0)) {
        errors.push('Correct answer index must be valid for options array');
      }
      break;
      
    case 'true-false':
      if (question.correct !== true && question.correct !== false) {
        errors.push('True/false questions must have a boolean correct answer');
      }
      break;
      
    case 'short-answer':
      // Optional: validate sample answer exists
      break;
      
    case 'matching':
      if (!question.pairs || !Array.isArray(question.pairs)) {
        errors.push('Matching questions must have pairs array');
      } else {
        question.pairs.forEach((pair, index) => {
          if (!pair.left || !pair.right) {
            errors.push(`Matching pair ${index + 1} must have both left and right values`);
          }
        });
      }
      break;
      
    default:
      errors.push(`Unknown question type: ${question.type}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates an entire quiz structure
 * @param {Object} quiz - Quiz to validate
 * @returns {Object} Validation result
 */
export const validateQuizStructure = (quiz) => {
  const errors = [];
  
  if (!quiz) {
    errors.push('Quiz object is required');
    return { isValid: false, errors };
  }
  
  if (!quiz.questions || !Array.isArray(quiz.questions)) {
    errors.push('Quiz must have questions array');
    return { isValid: false, errors };
  }
  
  if (quiz.questions.length === 0) {
    errors.push('Quiz must have at least one question');
  }
  
  // Validate each question
  quiz.questions.forEach((question, index) => {
    const validation = validateQuestionStructure(question);
    if (!validation.isValid) {
      errors.push(`Question ${index + 1}: ${validation.errors.join(', ')}`);
    }
  });
  
  // Validate metadata if present
  if (quiz.metadata) {
    if (quiz.metadata.difficulty && !['easy', 'medium', 'hard'].includes(quiz.metadata.difficulty)) {
      errors.push('Invalid difficulty level in metadata');
    }
    
    if (quiz.metadata.timeLimit && (quiz.metadata.timeLimit < 1 || quiz.metadata.timeLimit > 120)) {
      errors.push('Time limit must be between 1 and 120 minutes');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates user answer format for a specific question type
 * @param {Object} question - The question object
 * @param {*} userAnswer - The user's answer
 * @returns {Object} Validation result
 */
export const validateUserAnswer = (question, userAnswer) => {
  const errors = [];
  
  if (!question) {
    errors.push('Question is required for validation');
    return { isValid: false, errors };
  }
  
  switch (question.type) {
    case 'multiple-choice':
      if (userAnswer !== undefined && userAnswer !== null) {
        if (!Number.isInteger(userAnswer) || userAnswer < 0 || 
            (question.options && userAnswer >= question.options.length)) {
          errors.push('Answer must be a valid option index');
        }
      }
      break;
      
    case 'true-false':
      if (userAnswer !== undefined && userAnswer !== null) {
        if (typeof userAnswer !== 'boolean') {
          errors.push('Answer must be true or false');
        }
      }
      break;
      
    case 'short-answer':
      if (userAnswer !== undefined && userAnswer !== null) {
        if (typeof userAnswer !== 'string') {
          errors.push('Answer must be a string');
        } else if (userAnswer.trim().length < 10) {
          errors.push('Answer must be at least 10 characters long');
        }
      }
      break;
      
    case 'matching':
      if (userAnswer !== undefined && userAnswer !== null) {
        if (typeof userAnswer !== 'object' || Array.isArray(userAnswer)) {
          errors.push('Answer must be an object with left-right pairs');
        }
      }
      break;
      
    default:
      errors.push(`Unknown question type: ${question.type}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};