import React, { useState, useEffect } from 'react';
import { BookOpen, Lightbulb, Users, Award, Play, Pause, RotateCcw, ChevronRight, Star, Trophy, Brain, Microscope, Calculator, Globe, Atom, Dna } from 'lucide-react';
import styles from './SciencePage.module.css';

const EnhancedSciencePage = () => {
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
      description: 'Welcome to your personalized science learning journey!',
      concepts: ['Scientific Method', 'Lab Safety', 'Data Analysis'],
      difficulty: 1
    },
    { 
      id: 'physics', 
      name: 'Physics', 
      icon: Atom,
      description: 'Explore forces, energy, motion, and the fundamental laws of nature.',
      concepts: ['Newton\'s Laws', 'Energy Conservation', 'Waves', 'Electricity'],
      difficulty: 3
    },
    { 
      id: 'chemistry', 
      name: 'Chemistry', 
      icon: Calculator,
      description: 'Discover atoms, molecules, reactions, and the periodic table.',
      concepts: ['Atomic Structure', 'Chemical Bonds', 'Reactions', 'Periodic Table'],
      difficulty: 4
    },
    { 
      id: 'biology', 
      name: 'Biology', 
      icon: Dna,
      description: 'Study living organisms, cells, genetics, and ecosystems.',
      concepts: ['Cell Structure', 'Genetics', 'Evolution', 'Ecosystems'],
      difficulty: 2
    },
    { 
      id: 'earth', 
      name: 'Earth Science', 
      icon: Globe,
      description: 'Understand our planet\'s systems, weather, and geological processes.',
      concepts: ['Rock Cycle', 'Weather Systems', 'Plate Tectonics', 'Climate'],
      difficulty: 2
    },
    { 
      id: 'space', 
      name: 'Space Science', 
      icon: Star,
      description: 'Journey through the cosmos and explore astronomical phenomena.',
      concepts: ['Solar System', 'Stars', 'Galaxies', 'Space Exploration'],
      difficulty: 3
    }
  ];

  const learningModes = [
    { id: 'interactive', name: 'Interactive', icon: Play, description: 'Hands-on simulations and activities' },
    { id: 'visual', name: 'Visual', icon: Lightbulb, description: 'Diagrams, animations, and visual learning' },
    { id: 'collaborative', name: 'Study Group', icon: Users, description: 'Group discussions and peer learning' },
    { id: 'assessment', name: 'Assessment', icon: Award, description: 'Quizzes and knowledge testing' }
  ];

  const quizzes = {
    physics: [
      {
        question: "What is Newton's First Law of Motion?",
        options: [
          "An object at rest stays at rest unless acted upon by a force",
          "Force equals mass times acceleration",
          "For every action, there is an equal and opposite reaction",
          "Energy cannot be created or destroyed"
        ],
        correct: 0
      },
      {
        question: "What type of energy does a moving object have?",
        options: ["Potential Energy", "Kinetic Energy", "Thermal Energy", "Chemical Energy"],
        correct: 1
      }
    ],
    chemistry: [
      {
        question: "How many protons does a carbon atom have?",
        options: ["4", "6", "8", "12"],
        correct: 1
      },
      {
        question: "What happens during a chemical reaction?",
        options: [
          "Atoms are created",
          "Atoms are destroyed", 
          "Bonds between atoms are broken and formed",
          "Nothing changes"
        ],
        correct: 2
      }
    ],
    biology: [
      {
        question: "What is the basic unit of life?",
        options: ["Atom", "Molecule", "Cell", "Organ"],
        correct: 2
      },
      {
        question: "Which process do plants use to make food?",
        options: ["Respiration", "Photosynthesis", "Digestion", "Circulation"],
        correct: 1
      }
    ]
  };

  const simulations = {
    physics: {
      name: "Pendulum Motion",
      description: "Observe how changing length affects pendulum swing",
      interactive: true
    },
    chemistry: {
      name: "Molecular Builder",
      description: "Build molecules and see chemical bonds",
      interactive: true
    },
    biology: {
      name: "Cell Division",
      description: "Watch mitosis in action",
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
      if (percentage >= 80 && !achievements.includes('quiz_master')) {
        setAchievements(prev => [...prev, 'quiz_master']);
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
        "That's a great question! Let me explain the scientific concept behind that...",
        "Interesting observation! Here's what science tells us about this phenomenon...",
        "Excellent thinking! This relates to several important scientific principles...",
        "Good question! Let's explore this topic step by step..."
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
          <Microscope className={styles.simulationIcon} />
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
          AI Science Tutor
        </h3>
      </div>
      
      <div className={styles.chatMessages}>
        {chatHistory.length === 0 && (
          <div className={styles.chatMessagesEmpty}>
            Ask me anything about science! I'm here to help you learn.
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
            placeholder="Ask a science question..."
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
              <div className={`${styles.visualResourceCard} ${styles.green}`}>
                <h4 className={styles.resourceTitle}>Interactive Diagrams</h4>
                <p className={styles.resourceDescription}>Explore detailed scientific diagrams</p>
              </div>
              <div className={`${styles.visualResourceCard} ${styles.purple}`}>
                <h4 className={styles.resourceTitle}>3D Models</h4>
                <p className={styles.resourceDescription}>Rotate and examine 3D structures</p>
              </div>
              <div className={`${styles.visualResourceCard} ${styles.yellow}`}>
                <h4 className={styles.resourceTitle}>Animations</h4>
                <p className={styles.resourceDescription}>Watch processes in motion</p>
              </div>
              <div className={`${styles.visualResourceCard} ${styles.red}`}>
                <h4 className={styles.resourceTitle}>Video Lessons</h4>
                <p className={styles.resourceDescription}>Expert explanations and demonstrations</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.sciencePageContainer}>
      {/* Sidebar */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h1 className={styles.sidebarTitle}>Science Learning Hub</h1>
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
                  Quiz Master
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

export default EnhancedSciencePage;