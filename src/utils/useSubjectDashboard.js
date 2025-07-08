// hooks/useSubjectDashboard.js
import { useState, useEffect, useCallback } from 'react';
import { 
  findLessonCached, 
  loadAllTopics, 
  getQuizData, 
  getProjectData, 
  getLearningResources,
  getLearningModes,
  validateLessonData 
} from '../utils/lessonUtils';

export const useSubjectDashboard = (subject, iconMap) => {
  const [selectedTopic, setSelectedTopic] = useState('overview');
  const [gradeLevel, setGradeLevel] = useState(6);
  const [learningMode, setLearningMode] = useState('interactive');
  const [userProgress, setUserProgress] = useState({});
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [chatHistory, setChatHistory] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [achievements, setAchievements] = useState([]);
  const [studyStreak, setStudyStreak] = useState(0);
  
  // Dynamic data
  const [topics, setTopics] = useState([]);
  const [currentTopicData, setCurrentTopicData] = useState(null);
  const [quizData, setQuizData] = useState([]);
  const [projectData, setProjectData] = useState(null);
  const [learningResources, setLearningResources] = useState([]);
  const [learningModes, setLearningModes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize topics
  useEffect(() => {
    const initializeTopics = async () => {
      try {
        setLoading(true);
        const loadedTopics = await loadAllTopics(subject);
        
        const topicsWithIcons = loadedTopics.map(topic => ({
          ...topic,
          icon: iconMap[topic.id] || iconMap.default
        }));
        
        setTopics(topicsWithIcons);
        setLearningModes(getLearningModes());
        
        // Initialize user progress
        const initialProgress = {};
        topicsWithIcons.forEach(topic => {
          initialProgress[topic.id] = Math.floor(Math.random() * 100);
        });
        setUserProgress(initialProgress);
        setStudyStreak(Math.floor(Math.random() * 15) + 1);
        
      } catch (err) {
        console.error('Failed to load topics:', err);
        setError('Failed to load lesson content. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    initializeTopics();
  }, [subject, iconMap]);

  // Load topic data
  useEffect(() => {
    const loadTopicData = async () => {
      if (!selectedTopic) return;
      
      try {
        const topicData = await findLessonCached(subject, selectedTopic);
        if (topicData && validateLessonData(topicData)) {
          setCurrentTopicData(topicData);
        }

        const quiz = await getQuizData(subject, selectedTopic);
        setQuizData(quiz);

        const project = await getProjectData(subject, selectedTopic);
        setProjectData(project);

        const resources = await getLearningResources(subject, selectedTopic);
        setLearningResources(resources);

      } catch (err) {
        console.error(`Failed to load data for topic ${selectedTopic}:`, err);
      }
    };

    loadTopicData();
  }, [selectedTopic, subject]);

  const startQuiz = useCallback((topicId) => {
    if (quizData && quizData.length > 0) {
      setCurrentQuiz({
        topic: topicId,
        questions: quizData,
        currentQuestion: 0,
        userAnswers: []
      });
      setQuizScore(0);
    }
  }, [quizData]);

  const answerQuestion = useCallback((answerIndex) => {
    if (!currentQuiz) return;
    
    const newAnswers = [...currentQuiz.userAnswers, answerIndex];
    const isCorrect = answerIndex === currentQuiz.questions[currentQuiz.currentQuestion].correct;
    
    if (isCorrect) {
      setQuizScore(prev => prev + 1);
    }

    if (currentQuiz.currentQuestion + 1 < currentQuiz.questions.length) {
      setCurrentQuiz(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1,
        userAnswers: newAnswers
      }));
    } else {
      const finalScore = quizScore + (isCorrect ? 1 : 0);
      const percentage = Math.round((finalScore / currentQuiz.questions.length) * 100);
      
      setUserProgress(prev => ({
        ...prev,
        [currentQuiz.topic]: Math.min(100, prev[currentQuiz.topic] + 10)
      }));

      if (percentage >= 80) {
        const achievementKey = `${subject}_scholar`;
        if (!achievements.some(a => a.key === achievementKey)) {
          setAchievements(prev => [...prev, { key: achievementKey, name: `${subject} Scholar` }]);
        }
      }

      setCurrentQuiz(prev => ({
        ...prev,
        completed: true,
        finalScore: finalScore,
        percentage: percentage,
        userAnswers: newAnswers
      }));
    }
  }, [currentQuiz, quizScore, achievements, subject]);

  const sendMessage = useCallback(() => {
    if (!userInput.trim()) return;

    const newMessage = { role: 'user', content: userInput };
    setChatHistory(prev => [...prev, newMessage]);

    setTimeout(() => {
      const responses = [
        "That's a great question! Let me explain...",
        "Interesting observation! Here's what we know...",
        "Excellent thinking! This relates to...",
        "Good question! Let's explore this..."
      ];
      
      const response = {
        role: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)] + " " + userInput
      };
      
      setChatHistory(prev => [...prev, response]);
    }, 1000);

    setUserInput('');
  }, [userInput]);

  return {
    // State
    selectedTopic, setSelectedTopic,
    gradeLevel, setGradeLevel,
    learningMode, setLearningMode,
    userProgress, setUserProgress,
    currentQuiz, setCurrentQuiz,
    quizScore, setQuizScore,
    chatHistory, setChatHistory,
    userInput, setUserInput,
    achievements, setAchievements,
    studyStreak, setStudyStreak,
    topics, setTopics,
    currentTopicData, setCurrentTopicData,
    quizData, setQuizData,
    projectData, setProjectData,
    learningResources, setLearningResources,
    learningModes, setLearningModes,
    loading, setLoading,
    error, setError,

    // Actions
    startQuiz,
    answerQuestion,
    sendMessage
  };
};
