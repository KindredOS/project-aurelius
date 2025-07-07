import React, { useState, useEffect } from 'react';
import { Home, Heart, Users, Award, Play, Pause, RotateCcw, ChevronRight, Star, Trophy, Brain, Activity, Utensils, MapPin, Dumbbell, Smile } from 'lucide-react';
import styles from './LifestyleDash.module.css';

const LifestyleDash = () => {
  const [selectedTopic, setSelectedTopic] = useState('overview');
  const [experienceLevel, setExperienceLevel] = useState('beginner');
  const [learningMode, setLearningMode] = useState('interactive');
  const [userProgress, setUserProgress] = useState({});
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [activityRunning, setActivityRunning] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [achievements, setAchievements] = useState([]);
  const [lifestyleStreak, setLifestyleStreak] = useState(0);

  const topics = [
    { 
      id: 'overview', 
      name: 'Overview', 
      icon: Home,
      description: 'Welcome to your personalized lifestyle improvement journey!',
      concepts: ['Goal Setting', 'Habit Formation', 'Progress Tracking'],
      difficulty: 1
    },
    { 
      id: 'fitness', 
      name: 'Fitness & Health', 
      icon: Dumbbell,
      description: 'Build strength, improve cardio, and maintain physical wellness.',
      concepts: ['Strength Training', 'Cardio Workouts', 'Flexibility', 'Recovery'],
      difficulty: 3
    },
    { 
      id: 'nutrition', 
      name: 'Nutrition', 
      icon: Utensils,
      description: 'Learn about balanced eating, meal planning, and healthy choices.',
      concepts: ['Balanced Diet', 'Meal Planning', 'Hydration', 'Supplements'],
      difficulty: 2
    },
    { 
      id: 'mindfulness', 
      name: 'Mindfulness & Mental Health', 
      icon: Smile,
      description: 'Develop emotional intelligence and stress management skills.',
      concepts: ['Meditation', 'Stress Management', 'Emotional Wellness', 'Sleep'],
      difficulty: 2
    },
    { 
      id: 'productivity', 
      name: 'Productivity', 
      icon: Activity,
      description: 'Optimize your time, build better habits, and achieve your goals.',
      concepts: ['Time Management', 'Goal Setting', 'Habit Building', 'Focus'],
      difficulty: 3
    },
    { 
      id: 'relationships', 
      name: 'Relationships & Social', 
      icon: Heart,
      description: 'Strengthen connections and improve communication skills.',
      concepts: ['Communication', 'Conflict Resolution', 'Empathy', 'Boundaries'],
      difficulty: 4
    }
  ];

  const learningModes = [
    { id: 'interactive', name: 'Interactive', icon: Play, description: 'Hands-on activities and challenges' },
    { id: 'visual', name: 'Visual', icon: MapPin, description: 'Guides, infographics, and visual learning' },
    { id: 'collaborative', name: 'Community', icon: Users, description: 'Group discussions and peer support' },
    { id: 'assessment', name: 'Assessment', icon: Award, description: 'Quizzes and self-evaluation tools' }
  ];

  const quizzes = {
    fitness: [
      {
        question: "How many minutes of moderate exercise per week does the WHO recommend?",
        options: [
          "75 minutes",
          "150 minutes",
          "300 minutes",
          "450 minutes"
        ],
        correct: 1
      },
      {
        question: "What is the best time to stretch for flexibility?",
        options: ["Before workout", "After workout", "Only on rest days", "It doesn't matter"],
        correct: 1
      }
    ],
    nutrition: [
      {
        question: "How many servings of fruits and vegetables should you eat daily?",
        options: ["3-4", "5-9", "10-12", "15+"],
        correct: 1
      },
      {
        question: "What percentage of your daily calories should come from protein?",
        options: [
          "5-10%",
          "10-15%", 
          "15-25%",
          "30-35%"
        ],
        correct: 2
      }
    ],
    mindfulness: [
      {
        question: "How long should a beginner meditate daily?",
        options: ["1-2 minutes", "5-10 minutes", "20-30 minutes", "60+ minutes"],
        correct: 1
      },
      {
        question: "What is the recommended amount of sleep for adults?",
        options: ["5-6 hours", "6-7 hours", "7-9 hours", "10+ hours"],
        correct: 2
      }
    ]
  };

  const activities = {
    fitness: {
      name: "7-Minute Workout",
      description: "High-intensity interval training routine",
      interactive: true
    },
    nutrition: {
      name: "Meal Planner",
      description: "Plan your weekly meals and track nutrition",
      interactive: true
    },
    mindfulness: {
      name: "Guided Meditation",
      description: "5-minute breathing and mindfulness exercise",
      interactive: false
    }
  };

  const experienceLevels = ['beginner', 'intermediate', 'advanced'];

  useEffect(() => {
    // Initialize user progress
    const initialProgress = {};
    topics.forEach(topic => {
      initialProgress[topic.id] = Math.floor(Math.random() * 100);
    });
    setUserProgress(initialProgress);
    setLifestyleStreak(Math.floor(Math.random() * 30) + 1);
  }, []);

  const startQuiz = (topicId) => {
    if (quizzes[topicId]) {
      setCurrentQuiz({
        topic: topicId,
        questions: quizzes[topicId],
        currentQuestion: 0,
        userAnswers: []
      });
      setQuizScore(0);
    }
  };

  const answerQuestion = (answerIndex) => {
    if (!currentQuiz) return;
    
    const newAnswers = [...currentQuiz.userAnswers, answerIndex];
    const isCorrect = answerIndex === currentQuiz.questions[currentQuiz.currentQuestion].correct;
    
    if (isCorrect) {
      setQuizScore(quizScore + 1);
    }

    if (currentQuiz.currentQuestion + 1 < currentQuiz.questions.length) {
      setCurrentQuiz({
        ...currentQuiz,
        currentQuestion: currentQuiz.currentQuestion + 1,
        userAnswers: newAnswers
      });
    } else {
      // Quiz completed
      const finalScore = quizScore + (isCorrect ? 1 : 0);
      const percentage = Math.round((finalScore / currentQuiz.questions.length) * 100);
      
      // Update progress
      setUserProgress(prev => ({
        ...prev,
        [currentQuiz.topic]: Math.min(100, prev[currentQuiz.topic] + 10)
      }));

      // Check for achievements
      if (percentage >= 80 && !achievements.includes('lifestyle_expert')) {
        setAchievements(prev => [...prev, 'lifestyle_expert']);
      }

      setCurrentQuiz({
        ...currentQuiz,
        completed: true,
        finalScore: finalScore,
        percentage: percentage,
        userAnswers: newAnswers
      });
    }
  };

  const runActivity = (topicId) => {
    setActivityRunning(true);
    setTimeout(() => {
      setActivityRunning(false);
      setUserProgress(prev => ({
        ...prev,
        [topicId]: Math.min(100, prev[topicId] + 5)
      }));
    }, 3000);
  };

  const sendMessage = () => {
    if (!userInput.trim()) return;

    const newMessage = { role: 'user', content: userInput };
    setChatHistory(prev => [...prev, newMessage]);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "That's a great lifestyle goal! Let me help you create a plan to achieve it...",
        "Excellent question! Here's what wellness experts recommend for this situation...",
        "I love your motivation! Let's break this down into manageable steps...",
        "That's a common challenge! Here are some proven strategies to help you..."
      ];
      
      const response = {
        role: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)] + " " + userInput
      };
      
      setChatHistory(prev => [...prev, response]);
    }, 1000);

    setUserInput('');
  };

  const renderProgressBar = (progress) => (
    <div className={styles.progressBar}>
      <div 
        className={styles.progressFill}
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );

  const renderMainProgressBar = (progress) => (
    <div className={styles.mainProgressBar}>
      <div 
        className={styles.mainProgressFill}
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );

  const renderQuiz = () => {
    if (!currentQuiz) return null;

    if (currentQuiz.completed) {
      return (
        <div className={styles.quizCard}>
          <div className={styles.quizCompletion}>
            <Trophy className={styles.completionIcon} />
            <h3 className={styles.completionTitle}>Assessment Complete!</h3>
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
                Retake Assessment
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
            <h3 className={styles.quizTitle}>Assessment: {topics.find(t => t.id === currentQuiz.topic)?.name}</h3>
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

  const renderActivity = (topicId) => {
    const activity = activities[topicId];
    if (!activity) return null;

    return (
      <div className={styles.activityCard}>
        <div className={styles.activityHeader}>
          <h3 className={styles.activityTitle}>{activity.name}</h3>
          <Activity className={styles.activityIcon} />
        </div>
        <p className={styles.activityDescription}>{activity.description}</p>
        
        <div className={styles.activityWindow}>
          {activityRunning ? (
            <div className={styles.activityLoader}>
              <div className={styles.activitySpinner}></div>
              <p>Activity in progress...</p>
            </div>
          ) : (
            <p className={styles.activityPlaceholder}>Click "Start Activity" to begin</p>
          )}
        </div>
        
        <div className={styles.activityControls}>
          <button
            onClick={() => runActivity(topicId)}
            disabled={activityRunning}
            className={`${styles.activityButton} ${styles.activityButtonPrimary}`}
          >
            <Play className={styles.buttonIcon} />
            {activityRunning ? 'In Progress...' : 'Start Activity'}
          </button>
          <button className={`${styles.activityButton} ${styles.activityButtonSecondary}`}>
            <RotateCcw className={styles.buttonIcon} />
            Reset
          </button>
        </div>
      </div>
    );
  };

  const renderChatWindow = () => (
    <div className={styles.chatWindow}>
      <div className={styles.chatHeader}>
        <h3 className={styles.chatHeaderContent}>
          <Brain className={styles.chatHeaderIcon} />
          AI Lifestyle Coach
        </h3>
      </div>
      
      <div className={styles.chatMessages}>
        {chatHistory.length === 0 && (
          <div className={styles.chatMessagesEmpty}>
            Ask me anything about improving your lifestyle! I'm here to help you grow.
          </div>
        )}
        {chatHistory.map((message, index) => (
          <div
            key={index}
            className={`${styles.chatMessageRow} ${message.role === 'user' ? styles.user : styles.assistant}`}
          >
            <div className={`${styles.chatMessage} ${styles[message.role]}`}>
              {message.content}
            </div>
          </div>
        ))}
      </div>
      
      <div className={styles.chatInput}>
        <div className={styles.chatInputRow}>
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask about lifestyle improvements..."
            className={styles.chatInputField}
          />
          <button
            onClick={sendMessage}
            className={styles.chatSendButton}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    const topic = topics.find(t => t.id === selectedTopic);
    
    return (
      <div className={styles.contentSection}>
        <div className={styles.topicHeaderCard}>
          <div className={styles.topicHeader}>
            <topic.icon className={styles.topicHeaderIcon} />
            <div className={styles.topicHeaderContent}>
              <h2>{topic.name}</h2>
              <p>{topic.description}</p>
            </div>
          </div>
          
          <div className={styles.topicProgressSection}>
            <div className={styles.progressHeader}>
              <span className={styles.progressLabel}>Progress</span>
              <span className={styles.progressPercentage}>{userProgress[selectedTopic] || 0}%</span>
            </div>
            {renderMainProgressBar(userProgress[selectedTopic] || 0)}
          </div>

          <div className={styles.conceptsGrid}>
            {topic.concepts.map((concept, index) => (
              <div key={index} className={styles.conceptCard}>
                <div className={styles.conceptText}>{concept}</div>
              </div>
            ))}
          </div>
        </div>

        {learningMode === 'interactive' && renderActivity(selectedTopic)}
        
        {learningMode === 'assessment' && (
          <div>
            {currentQuiz ? renderQuiz() : (
              <div className={styles.quizStartCard}>
                <Award className={styles.quizStartIcon} />
                <h3 className={styles.quizStartTitle}>Ready for an Assessment?</h3>
                <p className={styles.quizStartDescription}>Test your knowledge of {topic.name}</p>
                <button
                  onClick={() => startQuiz(selectedTopic)}
                  className={styles.quizStartButton}
                  disabled={!quizzes[selectedTopic]}
                >
                  {quizzes[selectedTopic] ? 'Start Assessment' : 'Assessment Coming Soon'}
                </button>
              </div>
            )}
          </div>
        )}

        {learningMode === 'collaborative' && renderChatWindow()}

        {learningMode === 'visual' && (
          <div className={styles.visualResourcesCard}>
            <h3 className={styles.visualResourcesTitle}>Visual Learning Resources</h3>
            <div className={styles.visualResourcesGrid}>
              <div className={`${styles.visualResourceCard} ${styles.green}`}>
                <h4 className={styles.resourceTitle}>Infographics</h4>
                <p className={styles.resourceDescription}>Visual guides for healthy living</p>
              </div>
              <div className={`${styles.visualResourceCard} ${styles.purple}`}>
                <h4 className={styles.resourceTitle}>Progress Charts</h4>
                <p className={styles.resourceDescription}>Track your improvement over time</p>
              </div>
              <div className={`${styles.visualResourceCard} ${styles.yellow}`}>
                <h4 className={styles.resourceTitle}>Habit Trackers</h4>
                <p className={styles.resourceDescription}>Monitor daily habits and routines</p>
              </div>
              <div className={`${styles.visualResourceCard} ${styles.red}`}>
                <h4 className={styles.resourceTitle}>Video Guides</h4>
                <p className={styles.resourceDescription}>Expert tips and demonstrations</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.lifestylePageContainer}>
      {/* Sidebar */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h1 className={styles.sidebarTitle}>Lifestyle Hub</h1>
          <div className={styles.studyStreak}>
            <Star className={styles.streakIcon} />
            {lifestyleStreak} day streak
          </div>
        </div>

        {/* Experience Level Selector */}
        <div className={styles.experienceLevelSection}>
          <label className={styles.sectionLabel}>Experience Level</label>
          <select
            value={experienceLevel}
            onChange={(e) => setExperienceLevel(e.target.value)}
            className={styles.experienceSelect}
          >
            {experienceLevels.map(level => (
              <option key={level} value={level}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Learning Mode Selector */}
        <div className={styles.learningModeSection}>
          <label className={styles.sectionLabel}>Learning Mode</label>
          <div className={styles.learningModeList}>
            {learningModes.map(mode => (
              <button
                key={mode.id}
                onClick={() => setLearningMode(mode.id)}
                className={`${styles.learningModeButton} ${learningMode === mode.id ? styles.active : ''}`}
              >
                <div className={styles.modeContent}>
                  <mode.icon className={styles.modeIcon} />
                  <div className={styles.modeDetails}>
                    <div className={styles.modeName}>{mode.name}</div>
                    <div className={styles.modeDescription}>{mode.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Topics */}
        <div className={styles.topicsSection}>
          <h2 className={styles.topicsTitle}>Topics</h2>
          <div className={styles.topicsList}>
            {topics.map(topic => (
              <button
                key={topic.id}
                onClick={() => setSelectedTopic(topic.id)}
                className={`${styles.topicButton} ${selectedTopic === topic.id ? styles.active : ''}`}
              >
                <div className={styles.topicContent}>
                  <div className={styles.topicInfo}>
                    <topic.icon className={styles.topicIcon} />
                    <span className={styles.topicName}>{topic.name}</span>
                  </div>
                  <div className={styles.topicProgress}>
                    <span className={styles.progressText}>{userProgress[topic.id] || 0}%</span>
                    <ChevronRight className={styles.chevronIcon} />
                  </div>
                </div>
                <div>
                  {renderProgressBar(userProgress[topic.id] || 0)}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Achievements */}
        {achievements.length > 0 && (
          <div className={styles.achievementsSection}>
            <h3 className={styles.achievementsTitle}>Achievements</h3>
            <div className={styles.achievementsList}>
              {achievements.map((achievement, index) => (
                <div key={index} className={styles.achievementBadge}>
                  <Trophy className={styles.achievementIcon} />
                  Lifestyle Expert
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {renderContent()}
      </div>
    </div>
  );
};

export default LifestyleDash;