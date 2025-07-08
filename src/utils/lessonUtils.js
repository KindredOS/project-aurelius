// lessonUtils.js - General utility for dynamic lesson plan loading

/**
 * Generic lesson data loader that can work with any subject
 * @param {string} subject - The subject name (e.g., 'arts', 'science', 'math')
 * @param {string} topicId - The specific topic ID to load
 * @returns {Promise<Object>} - The lesson data for the topic
 */
export const findLesson = async (subject, topicId) => {
  try {
    const response = await fetch(`/data/${subject}/topics/${topicId}_topics.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${subject}/${topicId}`);
    }
    return await response.json();
  } catch (error) {
    console.warn(`Could not load lesson data for ${subject}/${topicId}:`, error);
    return null;
  }
};

/**
 * Load all available topics for a subject
 * @param {string} subject - The subject name
 * @returns {Promise<Array>} - Array of all topics for the subject
 */
export const loadAllTopics = async (subject) => {
  const topicFiles = [
    'overview',
    'module1',
    'module2',
    'module3',
    'module4',
    'module5',
    'module6',
    'module7',
    'module8'
  ];

  const topics = [];

  for (const topicId of topicFiles) {
    try {
      const lessonData = await findLesson(subject, topicId);
      if (lessonData) {
        topics.push({
          id: topicId,
          ...lessonData
        });
      }
    } catch (error) {
      console.warn(`Failed to load topic ${topicId} for ${subject}:`, error);
    }
  }

  return topics;
};

/**
 * Get quiz data for a specific topic
 * @param {string} subject - The subject name
 * @param {string} topicId - The topic ID
 * @returns {Promise<Array>} - Array of quiz questions
 */
export const getQuizData = async (subject, topicId) => {
  try {
    const lessonData = await findLesson(subject, topicId);
    return lessonData?.quiz || [];
  } catch (error) {
    console.warn(`Could not load quiz data for ${subject}/${topicId}:`, error);
    return [];
  }
};

/**
 * Get project data for a specific topic
 * @param {string} subject - The subject name
 * @param {string} topicId - The topic ID
 * @returns {Promise<Object>} - Project configuration
 */
export const getProjectData = async (subject, topicId) => {
  try {
    const lessonData = await findLesson(subject, topicId);
    return lessonData?.project || null;
  } catch (error) {
    console.warn(`Could not load project data for ${subject}/${topicId}:`, error);
    return null;
  }
};

/**
 * Get learning resources for a specific topic
 * @param {string} subject - The subject name
 * @param {string} topicId - The topic ID
 * @returns {Promise<Array>} - Array of learning resources
 */
export const getLearningResources = async (subject, topicId) => {
  try {
    const lessonData = await findLesson(subject, topicId);
    return lessonData?.resources || [];
  } catch (error) {
    console.warn(`Could not load resources for ${subject}/${topicId}:`, error);
    return [];
  }
};

/**
 * Validate lesson data structure
 * @param {Object} lessonData - The lesson data to validate
 * @returns {boolean} - Whether the data is valid
 */
export const validateLessonData = (lessonData) => {
  if (!lessonData || typeof lessonData !== 'object') {
    return false;
  }

  // Check for required fields
  const requiredFields = ['name', 'description', 'concepts'];
  return requiredFields.every(field => lessonData.hasOwnProperty(field));
};

/**
 * Get available subjects by scanning the directory structure
 * @returns {Promise<Array>} - Array of available subjects
 */
export const getAvailableSubjects = async () => {
  return ['arts', 'science', 'math', 'engineering', 'technology', 'lifestyle'];
};

/**
 * Cache for loaded lesson data to improve performance
 */
const lessonCache = new Map();

/**
 * Cached version of findLesson for better performance
 * @param {string} subject - The subject name
 * @param {string} topicId - The topic ID
 * @param {boolean} forceRefresh - Whether to bypass cache
 * @returns {Promise<Object>} - The lesson data
 */
export const findLessonCached = async (subject, topicId, forceRefresh = false) => {
  const cacheKey = `${subject}_${topicId}`;

  if (!forceRefresh && lessonCache.has(cacheKey)) {
    return lessonCache.get(cacheKey);
  }

  const lessonData = await findLesson(subject, topicId);

  if (lessonData) {
    lessonCache.set(cacheKey, lessonData);
  }

  return lessonData;
};

/**
 * Clear the lesson cache (useful for development or when content updates)
 */
export const clearLessonCache = () => {
  lessonCache.clear();
};

/**
 * Get learning mode configuration
 * @returns {Array} - Array of learning modes
 */
export const getLearningModes = () => {
  return [
    { id: 'interactive', name: 'Interactive', description: 'Hands-on projects and creative activities' },
    { id: 'visual', name: 'Visual', description: 'Gallery tours, visual references, and inspiration' },
    { id: 'collaborative', name: 'Studio Group', description: 'Group critiques and collaborative projects' },
    { id: 'assessment', name: 'Assessment', description: 'Portfolio reviews and knowledge testing' }
  ];
};
