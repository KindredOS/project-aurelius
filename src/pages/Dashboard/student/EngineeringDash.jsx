import React, { useState, useEffect } from 'react';
import { BookOpen, Lightbulb, Users, Award, Play, Pause, RotateCcw, ChevronRight, Star, Trophy, Brain, Settings, Calculator, Zap, Cog, Wrench } from 'lucide-react';
import styles from './EngineeringDash.module.css';

const EngineeringDash = () => {
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
      description: 'Welcome to your personalized engineering learning journey!',
      concepts: ['Engineering Design Process', 'Problem Solving', 'Safety Standards'],
      difficulty: 1
    },
    { 
      id: 'mechanical', 
      name: 'Mechanical Engineering', 
      icon: Cog,
      description: 'Explore machines, mechanisms, thermodynamics, and mechanical systems.',
      concepts: ['Mechanisms', 'Thermodynamics', 'Materials Science', 'Fluid Mechanics'],
      difficulty: 3
    },
    { 
      id: 'electrical', 
      name: 'Electrical Engineering', 
      icon: Zap,
      description: 'Study circuits, electronics, power systems, and electrical design.',
      concepts: ['Circuit Analysis', 'Electronics', 'Power Systems', 'Control Systems'],
      difficulty: 4
    },
    { 
      id: 'civil', 
      name: 'Civil Engineering', 
      icon: Settings,
      description: 'Learn about structures, construction, infrastructure, and urban planning.',
      concepts: ['Structural Design', 'Construction', 'Transportation', 'Environmental Systems'],
      difficulty: 2
    },
    { 
      id: 'computer', 
      name: 'Computer Engineering', 
      icon: Calculator,
      description: 'Understand hardware, software, programming, and digital systems.',
      concepts: ['Programming', 'Digital Logic', 'Computer Architecture', 'Software Engineering'],
      difficulty: 3
    },
    { 
      id: 'chemical', 
      name: 'Chemical Engineering', 
      icon: Wrench,
      description: 'Explore chemical processes, materials, and industrial applications.',
      concepts: ['Process Design', 'Chemical Reactions', 'Mass Transfer', 'Process Control'],
      difficulty: 4
    }
  ];

  const learningModes = [
    { id: 'interactive', name: 'Interactive', icon: Play, description: 'Hands-on simulations and design challenges' },
    { id: 'visual', name: 'Visual', icon: Lightbulb, description: 'Diagrams, CAD models, and visual learning' },
    { id: 'collaborative', name: 'Study Group', icon: Users, description: 'Team projects and peer collaboration' },
    { id: 'assessment', name: 'Assessment', icon: Award, description: 'Quizzes and engineering problem solving' }
  ];

  const quizzes = {
    mechanical: [
      {
        question: "What is the primary function of a gear system?",
        options: [
          "To change the speed and torque of rotational motion",
          "To convert electrical energy to mechanical energy",
          "To store potential energy",
          "To measure temperature"
        ],
        correct: 0
      },
      {
        question: "Which law describes the relationship between force, mass, and acceleration?",
        options: ["Hooke's Law", "Newton's Second Law", "Ohm's Law", "Boyle's Law"],
        correct: 1
      }
    ],
    electrical: [
      {
        question: "What is Ohm's Law?",
        options: ["V = I × R", "P = V × I", "F = m × a", "E = m × c²"],
        correct: 0
      },
      {
        question: "What component stores electrical energy in a circuit?",
        options: ["Resistor", "Inductor", "Capacitor", "Transistor"],
        correct: 2
      }
    ],
    civil: [
      {
        question: "What is the primary consideration in structural design?",
        options: ["Color", "Safety and load-bearing capacity", "Cost only", "Speed of construction"],
        correct: 1
      },
      {
        question: "Which material is commonly used for reinforcing concrete?",
        options: ["Wood", "Steel rebar", "Plastic", "Glass"],
        correct: 1
      }
    ],
    computer: [
      {
        question: "What does CPU stand for?",
        options: ["Computer Processing Unit", "Central Processing Unit", "Core Processing Unit", "Computer Program Unit"],
        correct: 1
      },
      {
        question: "Which programming concept allows code reuse?",
        options: ["Variables", "Functions", "Comments", "Loops"],
        correct: 1
      }
    ]
  };

  const simulations = {
    mechanical: {
      name: "Gear Train Simulator",
      description: "Design and test different gear configurations",
      interactive: true
    },
    electrical: {
      name: "Circuit Builder",
      description: "Build and analyze electrical circuits",
      interactive: true
    },
    civil: {
      name: "Bridge Load Testing",
      description: "Test structural integrity under various loads",
      interactive: true
    },
    computer: {
      name: "Algorithm Visualizer",
      description: "Watch sorting algorithms in action",
      interactive: false
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
      if (percentage >= 80 && !achievements.includes('engineering_expert')) {
        setAchievements(prev => [...prev, 'engineering_expert']);
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
        "That's an excellent engineering question! Let me break down the technical principles...",
        "Great problem-solving approach! Here's how engineers tackle this challenge...",
        "Interesting design consideration! This involves several engineering concepts...",
        "Good engineering thinking! Let's analyze this step by step..."
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
        className={styles.progressBarFill}
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );

  const renderMainProgressBar = (progress) => (
    <div className={styles.mainProgressBar}>
      <div 
        className={styles.mainProgressBarFill}
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );

  const renderQuiz = () => {
    if (!currentQuiz) return null;

    if (currentQuiz.completed) {
      return (
        <div className={styles.quizContainer}>
          <div className={styles.quizComplete}>
            <Trophy className={styles.quizCompleteIcon} />
            <h3 className={styles.quizCompleteTitle}>Quiz Complete!</h3>
            <p className={styles.quizCompleteScore}>
              Score: {currentQuiz.finalScore}/{currentQuiz.questions.length} ({currentQuiz.percentage}%)
            </p>
            <div className={styles.quizButtons}>
              <button 
                onClick={() => setCurrentQuiz(null)}
                className={`${styles.button} ${styles.primary} ${styles.large}`}
              >
                Continue Learning
              </button>
              <button 
                onClick={() => startQuiz(currentQuiz.topic)}
                className={`${styles.button} ${styles.secondary} ${styles.large}`}
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
      <div className={styles.quizContainer}>
        <div className={styles.quizHeader}>
          <div className={styles.quizTitleRow}>
            <h3 className={styles.quizTitle}>Quiz: {topics.find(t => t.id === currentQuiz.topic)?.name}</h3>
            <span className={styles.quizCounter}>
              {currentQuiz.currentQuestion + 1} / {currentQuiz.questions.length}
            </span>
          </div>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressBarFill}
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
      <div className={styles.simulationContainer}>
        <div className={styles.simulationHeader}>
          <h3 className={styles.simulationTitle}>{sim.name}</h3>
          <Settings className={`${styles.w6} ${styles.h6}`} />
        </div>
        <p className={styles.simulationDescription}>{sim.description}</p>
        
        <div className={styles.simulationArea}>
          {simulationRunning ? (
            <div className={styles.simulationRunning}>
              <div className={styles.simulationSpinner}></div>
              <p className={styles.simulationPlaceholder}>Simulation running...</p>
            </div>
          ) : (
            <p className={styles.simulationPlaceholder}>Click "Run Simulation" to start</p>
          )}
        </div>
        
        <div className={styles.simulationControls}>
          <button
            onClick={() => runSimulation(topicId)}
            disabled={simulationRunning}
            className={`${styles.button} ${styles.primary} ${simulationRunning ? styles.disabled : ''}`}
          >
            <Play className={`${styles.w4} ${styles.h4}`} />
            {simulationRunning ? 'Running...' : 'Run Simulation'}
          </button>
          <button className={`${styles.button} ${styles.secondary}`}>
            <RotateCcw className={`${styles.w4} ${styles.h4}`} />
            Reset
          </button>
        </div>
      </div>
    );
  };

  const renderChatWindow = () => (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>
        <h3 className={styles.chatHeaderTitle}>
          <Brain className={`${styles.w5} ${styles.h5}`} />
          AI Engineering Tutor
        </h3>
      </div>
      
      <div className={styles.chatMessages}>
        {chatHistory.length === 0 && (
          <div className={styles.chatEmpty}>
            Ask me anything about engineering! I'm here to help you learn and solve problems.
          </div>
        )}
        {chatHistory.map((message, index) => (
          <div
            key={index}
            className={`${styles.chatMessageContainer} ${message.role === 'user' ? styles.user : styles.assistant}`}
          >
            <div className={`${styles.chatMessage} ${message.role === 'user' ? styles.user : styles.assistant}`}>
              {message.content}
            </div>
          </div>
        ))}
      </div>
      
      <div className={styles.chatInput}>
        <div className={styles.chatInputContainer}>
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask an engineering question..."
            className={styles.chatInputField}
          />
          <button
            onClick={sendMessage}
            className={`${styles.button} ${styles.primary}`}
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
      <div className={styles.mainContent}>
        <div className={styles.contentCard}>
          <div className={styles.contentHeader}>
            <topic.icon className={styles.contentIcon} />
            <div>
              <h2 className={styles.contentTitle}>{topic.name}</h2>
              <p className={styles.contentDescription}>{topic.description}</p>
            </div>
          </div>
          
          <div className={styles.progressSection}>
            <div className={styles.progressHeader}>
              <span className={styles.progressLabel}>Progress</span>
              <span className={styles.progressLabel}>{userProgress[selectedTopic] || 0}%</span>
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
              <div className={styles.assessmentCenter}>
                <Award className={styles.assessmentIcon} />
                <h3 className={styles.assessmentTitle}>Ready for an Engineering Challenge?</h3>
                <p className={styles.assessmentDescription}>Test your knowledge of {topic.name}</p>
                <button
                  onClick={() => startQuiz(selectedTopic)}
                  className={`${styles.button} ${styles.primary} ${styles.large} ${!quizzes[selectedTopic] ? styles.disabled : ''}`}
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
          <div className={styles.contentCard}>
            <h3 className={styles.contentTitle}>Engineering Visual Resources</h3>
            <div className={styles.visualGrid}>
              <div className={`${styles.visualCard} ${styles.green}`}>
                <h4 className={styles.visualCardTitle}>CAD Models</h4>
                <p className={styles.visualCardDescription}>Interactive 3D engineering designs</p>
              </div>
              <div className={`${styles.visualCard} ${styles.purple}`}>
                <h4 className={styles.visualCardTitle}>Circuit Diagrams</h4>
                <p className={styles.visualCardDescription}>Detailed electrical schematics</p>
              </div>
              <div className={`${styles.visualCard} ${styles.yellow}`}>
                <h4 className={styles.visualCardTitle}>Process Animations</h4>
                <p className={styles.visualCardDescription}>Watch engineering processes in action</p>
              </div>
              <div className={`${styles.visualCard} ${styles.red}`}>
                <h4 className={styles.visualCardTitle}>Video Tutorials</h4>
                <p className={styles.visualCardDescription}>Expert engineering demonstrations</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h1 className={styles.sidebarTitle}>Engineering Learning Hub</h1>
          <div className={styles.streakContainer}>
            <Star className={`${styles.w4} ${styles.h4}`} />
            <span className={styles.streakText}>{studyStreak} day streak</span>
          </div>
        </div>

        {/* Grade Level Selector */}
        <div className={styles.formSection}>
          <label className={styles.formLabel}>Grade Level</label>
          <select
            value={gradeLevel}
            onChange={(e) => setGradeLevel(Number(e.target.value))}
            className={styles.formSelect}
          >
            {[6, 7, 8, 9, 10, 11, 12].map(grade => (
              <option key={grade} value={grade}>Grade {grade}</option>
            ))}
          </select>
        </div>

        {/* Learning Mode Selector */}
        <div className={styles.formSection}>
          <label className={styles.formLabel}>Learning Mode</label>
          <div className={styles.learningModeContainer}>
            {learningModes.map(mode => (
              <button
                key={mode.id}
                onClick={() => setLearningMode(mode.id)}
                className={`${styles.learningModeButton} ${learningMode === mode.id ? styles.active : ''}`}
              >
                <div className={styles.learningModeContent}>
                  <mode.icon className={`${styles.w5} ${styles.h5}`} />
                  <div>
                    <div className={styles.learningModeTitle}>{mode.name}</div>
                    <div className={styles.learningModeDescription}>{mode.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Topics */}
        <div className={styles.topicsContainer}>
          <h2 className={styles.topicsTitle}>Topics</h2>
          <div className={styles.topicsGrid}>
            {topics.map(topic => (
              <button
                key={topic.id}
                onClick={() => setSelectedTopic(topic.id)}
                className={`${styles.topicButton} ${selectedTopic === topic.id ? styles.active : ''}`}
              >
                <div className={styles.topicHeader}>
                  <div className={styles.topicHeaderLeft}>
                    <topic.icon className={`${styles.w5} ${styles.h5} ${styles.topicIcon}`} />
                    <span className={styles.topicName}>{topic.name}</span>
                  </div>
                  <div className={styles.topicHeaderRight}>
                    <span className={styles.topicProgress}>{userProgress[topic.id] || 0}%</span>
                    <ChevronRight className={`${styles.w4} ${styles.h4}`} />
                  </div>
                </div>
                {renderProgressBar(userProgress[topic.id] || 0)}
              </button>
            ))}
          </div>
        </div>

        {/* Achievements */}
        {achievements.length > 0 && (
          <div className={styles.achievementsContainer}>
            <h3 className={styles.achievementsTitle}>Achievements</h3>
            <div className={styles.achievementsGrid}>
              {achievements.map((achievement, index) => (
                <div key={index} className={styles.achievementItem}>
                  <Trophy className={`${styles.w4} ${styles.h4}`} />
                  <span className={styles.achievementText}>Engineering Expert</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      {renderContent()}
    </div>
  );
};

export default EngineeringDash;