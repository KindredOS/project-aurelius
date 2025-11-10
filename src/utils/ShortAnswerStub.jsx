// Enhanced short answer scoring system

/**
 * Calculates similarity between two strings using various methods
 */
const calculateStringSimilarity = (str1, str2) => {
  if (!str1 || !str2) return 0;
  
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  // Exact match
  if (s1 === s2) return 1.0;
  
  // Levenshtein distance similarity
  const levenshteinSimilarity = 1 - (levenshteinDistance(s1, s2) / Math.max(s1.length, s2.length));
  
  // Word overlap similarity
  const wordOverlapSimilarity = calculateWordOverlap(s1, s2);
  
  // Substring similarity
  const substringSimilarity = calculateSubstringSimilarity(s1, s2);
  
  // Return the highest similarity score
  return Math.max(levenshteinSimilarity, wordOverlapSimilarity, substringSimilarity);
};

/**
 * Calculates Levenshtein distance between two strings
 */
const levenshteinDistance = (str1, str2) => {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
};

/**
 * Calculates word overlap similarity
 */
const calculateWordOverlap = (str1, str2) => {
  const words1 = str1.split(/\s+/).filter(word => word.length > 2);
  const words2 = str2.split(/\s+/).filter(word => word.length > 2);
  
  if (words1.length === 0 || words2.length === 0) return 0;
  
  const commonWords = words1.filter(word => words2.includes(word));
  return (2 * commonWords.length) / (words1.length + words2.length);
};

/**
 * Calculates substring similarity
 */
const calculateSubstringSimilarity = (str1, str2) => {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const longestCommonSubstring = findLongestCommonSubstring(longer, shorter);
  return longestCommonSubstring.length / longer.length;
};

/**
 * Finds the longest common substring
 */
const findLongestCommonSubstring = (str1, str2) => {
  let longest = '';
  
  for (let i = 0; i < str1.length; i++) {
    for (let j = i + 1; j <= str1.length; j++) {
      const substring = str1.substring(i, j);
      if (str2.includes(substring) && substring.length > longest.length) {
        longest = substring;
      }
    }
  }
  
  return longest;
};

/**
 * Enhanced short answer scoring with multiple approaches
 */
export const scoreShortAnswer = (userAnswer, correctAnswer, options = {}) => {
  const {
    exactMatchPoints = 1.0,
    highSimilarityThreshold = 0.85,
    highSimilarityPoints = 0.9,
    mediumSimilarityThreshold = 0.70,
    mediumSimilarityPoints = 0.75,
    lowSimilarityThreshold = 0.50,
    lowSimilarityPoints = 0.5,
    minimumLength = 3,
    keywordWeighting = true,
    alternativeAnswers = [] // Array of alternative correct answers
  } = options;
  
  if (!userAnswer || typeof userAnswer !== 'string') {
    return { points: 0, feedback: 'No answer provided', similarity: 0 };
  }
  
  const trimmedAnswer = userAnswer.trim();
  
  if (trimmedAnswer.length < minimumLength) {
    return { 
      points: 0, 
      feedback: `Answer too short (minimum ${minimumLength} characters)`, 
      similarity: 0 
    };
  }
  
  // Check against all possible correct answers
  const allCorrectAnswers = [correctAnswer, ...alternativeAnswers].filter(Boolean);
  let bestMatch = { points: 0, similarity: 0, matchedAnswer: '' };
  
  for (const correct of allCorrectAnswers) {
    const similarity = calculateStringSimilarity(trimmedAnswer, correct);
    
    let points = 0;
    let feedback = '';
    
    // Determine points based on similarity
    if (similarity >= 0.99) {
      points = exactMatchPoints;
      feedback = 'Exact match';
    } else if (similarity >= highSimilarityThreshold) {
      points = highSimilarityPoints;
      feedback = 'Very close match';
    } else if (similarity >= mediumSimilarityThreshold) {
      points = mediumSimilarityPoints;
      feedback = 'Good match with minor differences';
    } else if (similarity >= lowSimilarityThreshold) {
      points = lowSimilarityPoints;
      feedback = 'Partial match';
    } else if (trimmedAnswer.length >= 5) {
      points = 0.25;
      feedback = 'Answer provided but does not match expected response';
    } else {
      points = 0;
      feedback = 'Answer does not match expected response';
    }
    
    // Apply keyword weighting if enabled
    if (keywordWeighting && points > 0) {
      const keywordBonus = calculateKeywordBonus(trimmedAnswer, correct);
      points = Math.min(exactMatchPoints, points + keywordBonus);
    }
    
    if (points > bestMatch.points) {
      bestMatch = {
        points,
        similarity,
        feedback,
        matchedAnswer: correct
      };
    }
  }
  
  return bestMatch;
};

/**
 * Calculates bonus points for including key terms
 */
const calculateKeywordBonus = (userAnswer, correctAnswer) => {
  const userWords = userAnswer.toLowerCase().split(/\s+/);
  const correctWords = correctAnswer.toLowerCase().split(/\s+/);
  
  // Identify important words (longer than 3 characters)
  const keyWords = correctWords.filter(word => word.length > 3);
  const keyWordsFound = keyWords.filter(word => 
    userWords.some(userWord => userWord.includes(word) || word.includes(userWord))
  );
  
  if (keyWords.length === 0) return 0;
  
  const keywordRatio = keyWordsFound.length / keyWords.length;
  return keywordRatio * 0.1; // Up to 10% bonus
};

/**
 * Enhanced short answer case for the main scoring function
 */
export const enhancedShortAnswerCase = (question, userAnswer) => {
  const options = {
    alternativeAnswers: question.alternativeAnswers || [],
    keywordWeighting: question.keywordWeighting !== false,
    exactMatchPoints: 1.0,
    highSimilarityThreshold: question.highSimilarityThreshold || 0.85,
    mediumSimilarityThreshold: question.mediumSimilarityThreshold || 0.70,
    lowSimilarityThreshold: question.lowSimilarityThreshold || 0.50,
    minimumLength: question.minimumLength || 3
  };
  
  const result = scoreShortAnswer(userAnswer, question.correctAnswer, options);
  
  console.log('📝 Short Answer Scoring:', {
    question: question.question?.substring(0, 50) + '...',
    userAnswer: userAnswer?.substring(0, 50) + '...',
    correctAnswer: question.correctAnswer?.substring(0, 50) + '...',
    similarity: result.similarity?.toFixed(3),
    points: result.points,
    feedback: result.feedback
  });
  
  return {
    isCorrect: result.points >= 1.0,
    points: result.points,
    feedback: result.feedback,
    similarity: result.similarity
  };
};

/**
 * Example of how to integrate this into your main scoring function
 */
export const calculateQuizScoreWithEnhancedShortAnswer = (quiz, userAnswers) => {
  if (!quiz || !quiz.questions || !userAnswers) {
    return { score: 0, total: 0, percentage: 0, details: [] };
  }
  
  let totalScore = 0;
  const details = [];
  
  quiz.questions.forEach((question, index) => {
    const userAnswer = userAnswers[question.id];
    let isCorrect = false;
    let points = 0;
    let feedback = '';
    const maxPoints = 1;
    
    switch (question.type) {
      case 'multiple-choice': {
        if (typeof userAnswer === 'number' && typeof question.correctAnswer === 'number') {
          isCorrect = userAnswer === question.correctAnswer;
        } else if (question.options && typeof question.correctAnswer === 'number') {
          const correctText = question.options[question.correctAnswer];
          isCorrect = userAnswer === correctText || question.options.indexOf(userAnswer) === question.correctAnswer;
        } else {
          isCorrect = userAnswer === question.correctAnswer;
        }
        points = isCorrect ? 1 : 0;
        break;
      }
      
      case 'true-false': {
        isCorrect =
          userAnswer === question.correctAnswer ||
          Boolean(userAnswer) === Boolean(question.correctAnswer) ||
          String(userAnswer).toLowerCase() === String(question.correctAnswer).toLowerCase();
        points = isCorrect ? 1 : 0;
        break;
      }
      
      case 'matching': {
        if (userAnswer && question.correctAnswer && typeof question.correctAnswer === 'object') {
          const userKeys = Object.keys(userAnswer);
          const correctMatches = userKeys.filter(
            key => userAnswer[key] === question.correctAnswer[key]
          ).length;
          points = correctMatches / userKeys.length;
          isCorrect = points >= 1;
        }
        break;
      }
      
      case 'short-answer': {
        const result = enhancedShortAnswerCase(question, userAnswer);
        isCorrect = result.isCorrect;
        points = result.points;
        feedback = result.feedback;
        break;
      }
      
      default:
        points = 0;
        isCorrect = false;
    }
    
    totalScore += points;
    details.push({
      questionIndex: index,
      questionId: question.id,
      isCorrect: points >= 1,
      points,
      maxPoints,
      userAnswer,
      correctAnswer: question.correctAnswer,
      feedback: feedback || undefined
    });
  });
  
  const total = quiz.questions.length;
  const percentage = Math.round((totalScore / total) * 100);
  
  return {
    score: totalScore,
    total,
    percentage,
    details
  };
};