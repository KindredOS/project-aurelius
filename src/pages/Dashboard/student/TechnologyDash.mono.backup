import React, { useState, useEffect } from 'react';
import { BookOpen, Lightbulb, Users, Award, Play, Pause, RotateCcw, ChevronRight, Star, Trophy, Brain, Monitor, Calculator, Globe, Smartphone, Code } from 'lucide-react';
import styles from './TechnologyDash.module.css';

const TechnologyDash = () => {
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
      description: 'Welcome to your personalized technology learning journey!',
      concepts: ['Digital Literacy', 'Tech Ethics', 'Problem Solving'],
      difficulty: 1
    },
    { 
      id: 'programming', 
      name: 'Programming', 
      icon: Code,
      description: 'Learn coding languages, algorithms, and software development.',
      concepts: ['Python Basics', 'Web Development', 'Data Structures', 'Debugging'],
      difficulty: 4
    },
    { 
      id: 'ai', 
      name: 'AI & Machine Learning', 
      icon: Brain,
      description: 'Explore artificial intelligence, machine learning, and neural networks.',
      concepts: ['Neural Networks', 'Machine Learning', 'Deep Learning', 'AI Ethics'],
      difficulty: 5
    },
    { 
      id: 'web', 
      name: 'Web Technologies', 
      icon: Globe,
      description: 'Master HTML, CSS, JavaScript, and modern web frameworks.',
      concepts: ['HTML/CSS', 'JavaScript', 'React', 'APIs'],
      difficulty: 3
    },
    { 
      id: 'mobile', 
      name: 'Mobile Development', 
      icon: Smartphone,
      description: 'Build mobile apps for iOS and Android platforms.',
      concepts: ['App Design', 'React Native', 'UI/UX', 'App Store'],
      difficulty: 4
    },
    { 
      id: 'systems', 
      name: 'Computer Systems', 
      icon: Monitor,
      description: 'Understand hardware, networks, databases, and system architecture.',
      concepts: ['Hardware', 'Networks', 'Databases', 'Cloud Computing'],
      difficulty: 3
    }
  ];

  const learningModes = [
    { id: 'interactive', name: 'Interactive', icon: Play, description: 'Hands-on coding and simulations' },
    { id: 'visual', name: 'Visual', icon: Lightbulb, description: 'Diagrams, flowcharts, and visual learning' },
    { id: 'collaborative', name: 'Study Group', icon: Users, description: 'Group projects and peer programming' },
    { id: 'assessment', name: 'Assessment', icon: Award, description: 'Coding challenges and knowledge testing' }
  ];

  const quizzes = {
    programming: [
      {
        question: "What does HTML stand for?",
        options: [
          "HyperText Markup Language",
          "High Tech Modern Language",
          "Home Tool Markup Language",
          "Hyperlink and Text Markup Language"
        ],
        correct: 0
      },
      {
        question: "Which programming language is known as the 'language of the web'?",
        options: ["Python", "JavaScript", "C++", "Java"],
        correct: 1
      }
    ],
    ai: [
      {
        question: "What is machine learning?",
        options: [
          "A type of computer hardware",
          "A method for computers to learn from data",
          "A programming language",
          "A type of software application"
        ],
        correct: 1
      },
      {
        question: "Which of these is a popular machine learning framework?",
        options: ["TensorFlow", "Photoshop", "Microsoft Word", "Chrome"],
        correct: 0
      }
    ],
    web: [
      {
        question: "What does CSS stand for?",
        options: ["Computer Style Sheets", "Cascading Style Sheets", "Creative Style Sheets", "Colorful Style Sheets"],
        correct: 1
      },
      {
        question: "Which HTML tag is used to create a hyperlink?",
        options: ["<link>", "<a>", "<href>", "<url>"],
        correct: 1
      }
    ]
  };

  const simulations = {
    programming: {
      name: "Code Editor Simulator",
      description: "Practice writing and debugging code in a safe environment",
      interactive: true
    },
    ai: {
      name: "Neural Network Visualizer",
      description: "See how neural networks process information",
      interactive: true
    },
    web: {
      name: "Website Builder",
      description: "Build and preview websites in real-time",
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
      if (percentage >= 80 && !achievements.includes('code_master')) {
        setAchievements(prev => [...prev, 'code_master']);
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
        "Great question! Let me explain the technical concept behind that...",
        "Interesting! Here's how this technology works...",
        "Excellent thinking! This relates to several important programming principles...",
        "Good question! Let's break down this tech concept step by step..."
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
            <h3 className={styles.completionTitle}>Challenge Complete!</h3>
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
                Retake Challenge
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
            <h3 className={styles.quizTitle}>Challenge: {topics.find(t => t.id === currentQuiz.topic)?.name}</h3>
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
          <Monitor className={styles.simulationIcon} />
        </div>
        <p className={styles.simulationDescription}>{sim.description}</p>
        
        <div className={styles.simulationWindow}>
          {simulationRunning ? (
            <div className={styles.simulationLoader}>
              <div className={styles.simulationSpinner}></div>
              <p>Simulation running...</p>
            </div>
          ) : (
            <p className={styles.simulationPlaceholder}>Click "Run Simulation" to start</p>
          )}
        </div>
        
        <div className={styles.simulationControls}>
          <button
            onClick={() => runSimulation(topicId)}
            disabled={simulationRunning}
            className={`${styles.simulationButton} ${styles.simulationButtonPrimary}`}
          >
            <Play className={styles.buttonIcon} />
            {simulationRunning ? 'Running...' : 'Run Simulation'}
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
          AI Tech Mentor
        </h3>
      </div>
      
      <div className={styles.chatMessages}>
        {chatHistory.length === 0 && (
          <div className={styles.chatMessagesEmpty}>
            Ask me anything about technology! I'm here to help you learn to code and understand tech concepts.
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
            placeholder="Ask a tech question..."
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
                <h3 className={styles.quizStartTitle}>Ready for a Challenge?</h3>
                <p className={styles.quizStartDescription}>Test your knowledge of {topic.name}</p>
                <button
                  onClick={() => startQuiz(selectedTopic)}
                  className={styles.quizStartButton}
                  disabled={!quizzes[selectedTopic]}
                >
                  {quizzes[selectedTopic] ? 'Start Challenge' : 'Challenge Coming Soon'}
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
                <h4 className={styles.resourceTitle}>Code Flowcharts</h4>
                <p className={styles.resourceDescription}>Visualize programming logic and algorithms</p>
              </div>
              <div className={`${styles.visualResourceCard} ${styles.purple}`}>
                <h4 className={styles.resourceTitle}>System Architecture</h4>
                <p className={styles.resourceDescription}>Explore how tech systems connect</p>
              </div>
              <div className={`${styles.visualResourceCard} ${styles.yellow}`}>
                <h4 className={styles.resourceTitle}>Interactive Demos</h4>
                <p className={styles.resourceDescription}>Watch code execute step by step</p>
              </div>
              <div className={`${styles.visualResourceCard} ${styles.red}`}>
                <h4 className={styles.resourceTitle}>Tech Tutorials</h4>
                <p className={styles.resourceDescription}>Expert coding tutorials and walkthroughs</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.techPageContainer}>
      {/* Sidebar */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h1 className={styles.sidebarTitle}>Technology Learning Hub</h1>
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
                  Code Master
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

export default TechnologyDash;