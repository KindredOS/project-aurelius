// utils/quizGenerator.js

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
    timeLimit = 10,
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
      correct: 0,
      explanation: "The section focuses on establishing fundamental understanding before moving to applications."
    },
    {
      id: 2,
      type: 'true-false',
      question: "The concepts presented build upon each other sequentially.",
      correct: true,
      explanation: "Yes, the material is structured to build knowledge progressively."
    },
    {
      id: 3,
      type: 'short-answer',
      question: "Explain the key takeaway from this section in your own words.",
      sampleAnswer: "The key takeaway involves understanding the fundamental principles and their practical applications.",
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
      correct: 1,
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
      timeLimit,
      showExplanations
    }
  };
};

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
  
  if (settings.timeLimit < 1 || settings.timeLimit > 120) {
    errors.push('Time limit must be between 1 and 120 minutes');
  }
  
  if (!['easy', 'medium', 'hard'].includes(settings.difficulty)) {
    errors.push('Difficulty must be easy, medium, or hard');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};