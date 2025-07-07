import React, { useState, useEffect } from 'react';
import { BookOpen, Lightbulb, Users, Award, Play, Pause, RotateCcw, ChevronRight, Star, Trophy, Brain, Palette, Brush, Music, Camera, Scissors, Mic } from 'lucide-react';
import styles from './ArtsDash.module.css';

const ArtsDash = () => {
  const [selectedTopic, setSelectedTopic] = useState('overview');
  const [gradeLevel, setGradeLevel] = useState(6);
  const [learningMode, setLearningMode] = useState('interactive');
  const [userProgress, setUserProgress] = useState({});
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [projectRunning, setProjectRunning] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [achievements, setAchievements] = useState([]);
  const [studyStreak, setStudyStreak] = useState(0);

  const topics = [
    { 
      id: 'overview', 
      name: 'Overview', 
      icon: BookOpen,
      description: 'Welcome to your creative arts learning journey!',
      concepts: ['Art History', 'Creative Process', 'Art Criticism', 'Media Exploration'],
      difficulty: 1
    },
    { 
      id: 'visual', 
      name: 'Visual Arts', 
      icon: Palette,
      description: 'Explore drawing, painting, sculpture, and digital art techniques.',
      concepts: ['Drawing Fundamentals', 'Color Theory', 'Composition', 'Digital Art'],
      difficulty: 2
    },
    { 
      id: 'music', 
      name: 'Music', 
      icon: Music,
      description: 'Learn about rhythm, melody, harmony, and musical expression.',
      concepts: ['Music Theory', 'Rhythm & Beat', 'Instruments', 'Composition'],
      difficulty: 3
    },
    { 
      id: 'theater', 
      name: 'Theater Arts', 
      icon: Mic,
      description: 'Discover acting, directing, stagecraft, and dramatic expression.',
      concepts: ['Acting Techniques', 'Script Analysis', 'Stage Design', 'Performance'],
      difficulty: 3
    },
    { 
      id: 'dance', 
      name: 'Dance', 
      icon: Users,
      description: 'Study movement, choreography, and various dance styles.',
      concepts: ['Movement Basics', 'Choreography', 'Dance Styles', 'Performance'],
      difficulty: 2
    },
    { 
      id: 'media', 
      name: 'Media Arts', 
      icon: Camera,
      description: 'Explore photography, film, animation, and digital media creation.',
      concepts: ['Photography', 'Video Production', 'Animation', 'Digital Design'],
      difficulty: 4
    }
  ];

  const learningModes = [
    { id: 'interactive', name: 'Interactive', icon: Play, description: 'Hands-on projects and creative activities' },
    { id: 'visual', name: 'Visual', icon: Lightbulb, description: 'Gallery tours, visual references, and inspiration' },
    { id: 'collaborative', name: 'Studio Group', icon: Users, description: 'Group critiques and collaborative projects' },
    { id: 'assessment', name: 'Assessment', icon: Award, description: 'Portfolio reviews and knowledge testing' }
  ];

  const quizzes = {
    visual: [
      {
        question: "What are the three primary colors in traditional color theory?",
        options: [
          "Red, Blue, Yellow",
          "Red, Green, Blue",
          "Cyan, Magenta, Yellow",
          "Red, Orange, Blue"
        ],
        correct: 0
      },
      {
        question: "What is the rule of thirds in composition?",
        options: [
          "Dividing the canvas into three equal sections",
          "Using only three colors in a painting",
          "Placing important elements along grid lines that divide the image into nine parts",
          "Making three sketches before the final artwork"
        ],
        correct: 2
      }
    ],
    music: [
      {
        question: "How many beats are in a 4/4 time signature?",
        options: ["2", "3", "4", "8"],
        correct: 2
      },
      {
        question: "What is the distance between two notes called?",
        options: ["Rhythm", "Tempo", "Interval", "Harmony"],
        correct: 2
      }
    ],
    theater: [
      {
        question: "What is the area of the stage closest to the audience called?",
        options: ["Upstage", "Downstage", "Stage Left", "Center Stage"],
        correct: 1
      },
      {
        question: "What does 'breaking the fourth wall' mean in theater?",
        options: [
          "Destroying stage props",
          "Actors acknowledging the audience directly",
          "Changing scenes quickly",
          "Using special effects"
        ],
        correct: 1
      }
    ]
  };

  const projects = {
    visual: {
      name: "Color Wheel Creation",
      description: "Create a digital color wheel exploring primary, secondary, and tertiary colors",
      interactive: true
    },
    music: {
      name: "Rhythm Composer",
      description: "Compose a simple rhythm using different time signatures",
      interactive: true
    },
    theater: {
      name: "Character Development",
      description: "Develop a character through improvisation exercises",
      interactive: false
    },
    dance: {
      name: "Movement Sequence",
      description: "Create a dance sequence expressing different emotions",
      interactive: true
    },
    media: {
      name: "Photo Story",
      description: "Tell a story through a series of photographs",
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
      if (percentage >= 80 && !achievements.includes('arts_scholar')) {
        setAchievements(prev => [...prev, 'arts_scholar']);
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

  const runProject = (topicId) => {
    setProjectRunning(true);
    setTimeout(() => {
      setProjectRunning(false);
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
        "That's a wonderful creative question! Let me share some artistic insights about that...",
        "Interesting artistic concept! Here's what art history and theory tell us...",
        "Excellent creative thinking! This relates to several important artistic principles...",
        "Great question! Let's explore this artistic technique step by step..."
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
            <h3 className={styles.completionTitle}>Portfolio Review Complete!</h3>
            <p className={styles.completionScore}>
              Score: {currentQuiz.finalScore}/{currentQuiz.questions.length} ({currentQuiz.percentage}%)
            </p>
            <div className={styles.completionActions}>
              <button 
                onClick={() => setCurrentQuiz(null)}
                className={`${styles.completionButton} ${styles.completionButtonPrimary}`}
              >
                Continue Creating
              </button>
              <button 
                onClick={() => startQuiz(currentQuiz.topic)}
                className={`${styles.completionButton} ${styles.completionButtonSecondary}`}
              >
                Retake Review
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
            <h3 className={styles.quizTitle}>Portfolio Review: {topics.find(t => t.id === currentQuiz.topic)?.name}</h3>
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

  const renderProject = (topicId) => {
    const project = projects[topicId];
    if (!project) return null;

    return (
      <div className={styles.projectCard}>
        <div className={styles.projectHeader}>
          <h3 className={styles.projectTitle}>{project.name}</h3>
          <Brush className={styles.projectIcon} />
        </div>
        <p className={styles.projectDescription}>{project.description}</p>
        
        <div className={styles.projectWindow}>
          {projectRunning ? (
            <div className={styles.projectLoader}>
              <div className={styles.projectSpinner}></div>
              <p>Creating project...</p>
            </div>
          ) : (
            <p className={styles.projectPlaceholder}>Click "Start Project" to begin creating</p>
          )}
        </div>
        
        <div className={styles.projectControls}>
          <button
            onClick={() => runProject(topicId)}
            disabled={projectRunning}
            className={`${styles.projectButton} ${styles.projectButtonPrimary}`}
          >
            <Play className={styles.buttonIcon} />
            {projectRunning ? 'Creating...' : 'Start Project'}
          </button>
          <button className={`${styles.projectButton} ${styles.projectButtonSecondary}`}>
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
          AI Arts Mentor
        </h3>
      </div>
      
      <div className={styles.chatMessages}>
        {chatHistory.length === 0 && (
          <div className={styles.chatMessagesEmpty}>
            Ask me anything about art, creativity, or artistic techniques! I'm here to inspire your creativity.
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
            placeholder="Ask about art techniques, history, or inspiration..."
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

        {learningMode === 'interactive' && renderProject(selectedTopic)}
        
        {learningMode === 'assessment' && (
          <div>
            {currentQuiz ? renderQuiz() : (
              <div className={styles.quizStartCard}>
                <Award className={styles.quizStartIcon} />
                <h3 className={styles.quizStartTitle}>Ready for Portfolio Review?</h3>
                <p className={styles.quizStartDescription}>Test your knowledge of {topic.name}</p>
                <button
                  onClick={() => startQuiz(selectedTopic)}
                  className={styles.quizStartButton}
                  disabled={!quizzes[selectedTopic]}
                >
                  {quizzes[selectedTopic] ? 'Start Review' : 'Review Coming Soon'}
                </button>
              </div>
            )}
          </div>
        )}

        {learningMode === 'collaborative' && renderChatWindow()}

        {learningMode === 'visual' && (
          <div className={styles.visualResourcesCard}>
            <h3 className={styles.visualResourcesTitle}>Visual Inspiration Gallery</h3>
            <div className={styles.visualResourcesGrid}>
              <div className={`${styles.visualResourceCard} ${styles.green}`}>
                <h4 className={styles.resourceTitle}>Master Artworks</h4>
                <p className={styles.resourceDescription}>Study famous paintings and sculptures</p>
              </div>
              <div className={`${styles.visualResourceCard} ${styles.purple}`}>
                <h4 className={styles.resourceTitle}>Technique Demos</h4>
                <p className={styles.resourceDescription}>Watch artists demonstrate techniques</p>
              </div>
              <div className={`${styles.visualResourceCard} ${styles.yellow}`}>
                <h4 className={styles.resourceTitle}>Virtual Museum Tours</h4>
                <p className={styles.resourceDescription}>Explore world-renowned art collections</p>
              </div>
              <div className={`${styles.visualResourceCard} ${styles.red}`}>
                <h4 className={styles.resourceTitle}>Artist Spotlights</h4>
                <p className={styles.resourceDescription}>Learn about influential artists and movements</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.artsPageContainer}>
      {/* Sidebar */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h1 className={styles.sidebarTitle}>Arts Learning Studio</h1>
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
          <h2 className={styles.topicsTitle}>Art Disciplines</h2>
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
                  Arts Scholar
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

export default ArtsDash;