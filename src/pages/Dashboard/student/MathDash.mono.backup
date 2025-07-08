import React, { useState, useEffect } from 'react';
import { BookOpen, Lightbulb, Users, Award, Play, Pause, RotateCcw, ChevronRight, Star, Trophy, Brain, Calculator, PieChart, BarChart3, TrendingUp, Target, Sigma, Zap } from 'lucide-react';
import styles from './MathDash.module.css';

const MathDash = () => {
  const [selectedTopic, setSelectedTopic] = useState('overview');
  const [gradeLevel, setGradeLevel] = useState(6);
  const [learningMode, setLearningMode] = useState('interactive');
  const [userProgress, setUserProgress] = useState({});
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [achievements, setAchievements] = useState([]);
  const [studyStreak, setStudyStreak] = useState(0);

  const topics = [
    { 
      id: 'overview', 
      name: 'Overview', 
      icon: BookOpen,
      description: 'Welcome to your personalized mathematics learning journey!',
      concepts: ['Problem Solving', 'Mathematical Reasoning', 'Number Sense'],
      difficulty: 1
    },
    { 
      id: 'algebra', 
      name: 'Algebra', 
      icon: Calculator,
      description: 'Master equations, variables, and algebraic expressions.',
      concepts: ['Linear Equations', 'Quadratic Functions', 'Factoring', 'Systems of Equations'],
      difficulty: 3
    },
    { 
      id: 'geometry', 
      name: 'Geometry', 
      icon: Target,
      description: 'Explore shapes, angles, area, volume, and spatial relationships.',
      concepts: ['Angles & Triangles', 'Area & Perimeter', 'Volume', 'Coordinate Geometry'],
      difficulty: 3
    },
    { 
      id: 'statistics', 
      name: 'Statistics', 
      icon: BarChart3,
      description: 'Analyze data, understand probability, and interpret graphs.',
      concepts: ['Mean & Median', 'Probability', 'Data Analysis', 'Graphing'],
      difficulty: 2
    },
    { 
      id: 'calculus', 
      name: 'Calculus', 
      icon: TrendingUp,
      description: 'Study rates of change, derivatives, and integrals.',
      concepts: ['Limits', 'Derivatives', 'Integrals', 'Applications'],
      difficulty: 5
    },
    { 
      id: 'trigonometry', 
      name: 'Trigonometry', 
      icon: Sigma,
      description: 'Understand sine, cosine, tangent, and triangle relationships.',
      concepts: ['Sine & Cosine', 'Unit Circle', 'Trig Identities', 'Inverse Functions'],
      difficulty: 4
    }
  ];

  const learningModes = [
    { id: 'interactive', name: 'Interactive', icon: Play, description: 'Hands-on calculators and problem solving' },
    { id: 'visual', name: 'Visual', icon: Lightbulb, description: 'Graphs, charts, and visual representations' },
    { id: 'collaborative', name: 'Study Group', icon: Users, description: 'Group problem solving and peer learning' },
    { id: 'assessment', name: 'Assessment', icon: Award, description: 'Quizzes and practice problems' }
  ];

  const quizzes = {
    algebra: [
      {
        question: "Solve for x: 2x + 5 = 13",
        options: ["x = 3", "x = 4", "x = 5", "x = 6"],
        correct: 1
      },
      {
        question: "What is the slope of the line y = 3x + 2?",
        options: ["2", "3", "5", "3x"],
        correct: 1
      }
    ],
    geometry: [
      {
        question: "What is the area of a rectangle with length 8 and width 5?",
        options: ["13", "26", "40", "80"],
        correct: 2
      },
      {
        question: "How many degrees are in a triangle?",
        options: ["90°", "180°", "270°", "360°"],
        correct: 1
      }
    ],
    statistics: [
      {
        question: "What is the mean of 2, 4, 6, 8?",
        options: ["4", "5", "6", "20"],
        correct: 1
      },
      {
        question: "If you flip a coin, what's the probability of getting heads?",
        options: ["0.25", "0.5", "0.75", "1.0"],
        correct: 1
      }
    ]
  };

  const simulations = {
    algebra: {
      name: "Equation Grapher",
      description: "Visualize linear and quadratic equations",
      interactive: true
    },
    geometry: {
      name: "Shape Calculator",
      description: "Calculate area and perimeter of various shapes",
      interactive: true
    },
    statistics: {
      name: "Data Visualizer",
      description: "Create graphs and analyze datasets",
      interactive: true
    },
    calculus: {
      name: "Derivative Calculator",
      description: "Explore derivatives and their applications",
      interactive: true
    },
    trigonometry: {
      name: "Unit Circle Explorer",
      description: "Interactive unit circle with angle measurements",
      interactive: true
    }
  };

  useEffect(() => {
    // Initialize user progress
    const initialProgress = {};
    topics.forEach(topic => {
      initialProgress[topic.id] = Math.floor(Math.random() * 100);
    });
    setUserProgress(initialProgress);
    setStudyStreak(Math.floor(Math.random() * 15) + 1);
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
      if (percentage >= 80 && !achievements.includes('math_master')) {
        setAchievements(prev => [...prev, 'math_master']);
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

  const runSimulation = (topicId) => {
    setSimulationRunning(true);
    setTimeout(() => {
      setSimulationRunning(false);
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
        "Great question! Let me break down this mathematical concept for you...",
        "Interesting problem! Here's how we can approach this step by step...",
        "Excellent thinking! This connects to several important mathematical principles...",
        "Good question! Let's solve this together using mathematical reasoning..."
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
            <h3 className={styles.completionTitle}>Quiz Complete!</h3>
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
            <h3 className={styles.quizTitle}>Quiz: {topics.find(t => t.id === currentQuiz.topic)?.name}</h3>
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

  const renderSimulation = (topicId) => {
    const sim = simulations[topicId];
    if (!sim) return null;

    return (
      <div className={styles.simulationCard}>
        <div className={styles.simulationHeader}>
          <h3 className={styles.simulationTitle}>{sim.name}</h3>
          <Calculator className={styles.simulationIcon} />
        </div>
        <p className={styles.simulationDescription}>{sim.description}</p>
        
        <div className={styles.simulationWindow}>
          {simulationRunning ? (
            <div className={styles.simulationLoader}>
              <div className={styles.simulationSpinner}></div>
              <p>Calculating...</p>
            </div>
          ) : (
            <p className={styles.simulationPlaceholder}>Click "Start Calculator" to begin</p>
          )}
        </div>
        
        <div className={styles.simulationControls}>
          <button
            onClick={() => runSimulation(topicId)}
            disabled={simulationRunning}
            className={`${styles.simulationButton} ${styles.simulationButtonPrimary}`}
          >
            <Play className={styles.buttonIcon} />
            {simulationRunning ? 'Calculating...' : 'Start Calculator'}
          </button>
          <button className={`${styles.simulationButton} ${styles.simulationButtonSecondary}`}>
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
          AI Math Tutor
        </h3>
      </div>
      
      <div className={styles.chatMessages}>
        {chatHistory.length === 0 && (
          <div className={styles.chatMessagesEmpty}>
            Ask me anything about math! I'm here to help you solve problems.
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
            placeholder="Ask a math question..."
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

        {learningMode === 'interactive' && renderSimulation(selectedTopic)}
        
        {learningMode === 'assessment' && (
          <div>
            {currentQuiz ? renderQuiz() : (
              <div className={styles.quizStartCard}>
                <Award className={styles.quizStartIcon} />
                <h3 className={styles.quizStartTitle}>Ready for a Quiz?</h3>
                <p className={styles.quizStartDescription}>Test your knowledge of {topic.name}</p>
                <button
                  onClick={() => startQuiz(selectedTopic)}
                  className={styles.quizStartButton}
                  disabled={!quizzes[selectedTopic]}
                >
                  {quizzes[selectedTopic] ? 'Start Quiz' : 'Quiz Coming Soon'}
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
              <div className={`${styles.visualResourceCard} ${styles.blue}`}>
                <h4 className={styles.resourceTitle}>Interactive Graphs</h4>
                <p className={styles.resourceDescription}>Explore mathematical functions and equations</p>
              </div>
              <div className={`${styles.visualResourceCard} ${styles.green}`}>
                <h4 className={styles.resourceTitle}>Geometric Shapes</h4>
                <p className={styles.resourceDescription}>Visualize and manipulate 2D and 3D shapes</p>
              </div>
              <div className={`${styles.visualResourceCard} ${styles.orange}`}>
                <h4 className={styles.resourceTitle}>Step-by-Step Solutions</h4>
                <p className={styles.resourceDescription}>See detailed problem-solving processes</p>
              </div>
              <div className={`${styles.visualResourceCard} ${styles.purple}`}>
                <h4 className={styles.resourceTitle}>Math Animations</h4>
                <p className={styles.resourceDescription}>Watch mathematical concepts come to life</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.mathPageContainer}>
      {/* Sidebar */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h1 className={styles.sidebarTitle}>Math Learning Hub</h1>
          <div className={styles.studyStreak}>
            <Star className={styles.streakIcon} />
            {studyStreak} day streak
          </div>
        </div>

        {/* Grade Level Selector */}
        <div className={styles.gradeLevelSection}>
          <label className={styles.sectionLabel}>Grade Level</label>
          <select
            value={gradeLevel}
            onChange={(e) => setGradeLevel(Number(e.target.value))}
            className={styles.gradeSelect}
          >
            {[6, 7, 8, 9, 10, 11, 12].map(grade => (
              <option key={grade} value={grade}>Grade {grade}</option>
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
                  Math Master
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

export default MathDash;