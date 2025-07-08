import React, { useMemo } from 'react';
import { BookOpen, Calculator, Target, BarChart3, TrendingUp, Sigma, Play, RotateCcw } from 'lucide-react';
import { useSubjectDashboard } from '../../../utils/useSubjectDashboard';
import Sidebar from '../../../components/student/Sidebar';
import Quiz from '../../../components/student/Quiz';
import ChatWindow from '../../../components/student/ChatWindow';
import TopicHeader from '../../../components/student/TopicHeader';
import VisualResources from '../../../components/student/VisualResources';
import styles from './MathDash.module.css';

const MathDash = () => {
  const iconMap = useMemo(() => ({
    'overview': BookOpen,
    'algebra': Calculator,
    'geometry': Target,
    'statistics': BarChart3,
    'calculus': TrendingUp,
    'trigonometry': Sigma,
    'default': BookOpen
  }), []);

  const dashboardState = useSubjectDashboard('math', iconMap);
  const {
    selectedTopic, setSelectedTopic,
    gradeLevel, setGradeLevel,
    learningMode, setLearningMode,
    userProgress, setUserProgress,
    currentQuiz, setCurrentQuiz,
    chatHistory, userInput, setUserInput,
    achievements, studyStreak,
    topics, currentTopicData, quizData, projectData, learningResources, learningModes,
    loading, error,
    startQuiz, answerQuestion, sendMessage
  } = dashboardState;

  const runSimulation = (topicId) => {
    setTimeout(() => {
      setUserProgress(prev => ({
        ...prev,
        [topicId]: Math.min(100, prev[topicId] + 5)
      }));
    }, 3000);
  };

  const renderProgressBar = (progress) => (
    <div className={styles.progressBar}>
      <div className={styles.progressFill} style={{ width: `${progress}%` }}></div>
    </div>
  );

  const renderMainProgressBar = (progress) => (
    <div className={styles.mainProgressBar}>
      <div className={styles.mainProgressFill} style={{ width: `${progress}%` }}></div>
    </div>
  );

  const renderSimulation = (topicId) => {
    if (!projectData) return null;

    return (
      <div className={styles.simulationCard}>
        <div className={styles.simulationHeader}>
          <h3 className={styles.simulationTitle}>{projectData.name}</h3>
          <Calculator className={styles.simulationIcon} />
        </div>
        <p className={styles.simulationDescription}>{projectData.description}</p>

        <div className={styles.simulationWindow}>
          <p className={styles.simulationPlaceholder}>
            {projectData.placeholder || "Click 'Start Calculator' to begin"}
          </p>
        </div>

        <div className={styles.simulationControls}>
          <button
            onClick={() => runSimulation(topicId)}
            className={`${styles.simulationButton} ${styles.simulationButtonPrimary}`}
          >
            <Play className={styles.buttonIcon} />
            Start Calculator
          </button>
          <button className={`${styles.simulationButton} ${styles.simulationButtonSecondary}`}>
            <RotateCcw className={styles.buttonIcon} />
            Reset
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className={styles.loadingContainer}>Loading Math Dashboard...</div>;
  }

  if (error) {
    return <div className={styles.errorContainer}>Error: {error}</div>;
  }

  const topic = topics.find(t => t.id === selectedTopic) || currentTopicData;

  return (
    <div className={styles.mathPageContainer}>
      <Sidebar
        title="Math Learning Hub"
        studyStreak={studyStreak}
        gradeLevel={gradeLevel}
        setGradeLevel={setGradeLevel}
        learningMode={learningMode}
        setLearningMode={setLearningMode}
        learningModes={learningModes}
        topics={topics}
        selectedTopic={selectedTopic}
        setSelectedTopic={setSelectedTopic}
        userProgress={userProgress}
        achievements={achievements}
        renderProgressBar={renderProgressBar}
        styles={styles}
      />

      <div className={styles.mainContent}>
        <div className={styles.contentSection}>
          <TopicHeader
            topic={topic}
            userProgress={userProgress}
            selectedTopic={selectedTopic}
            renderMainProgressBar={renderMainProgressBar}
            styles={styles}
          />

          {learningMode === 'interactive' && renderSimulation(selectedTopic)}

          {learningMode === 'assessment' && (
            <Quiz
              currentQuiz={currentQuiz}
              topics={topics}
              answerQuestion={answerQuestion}
              setCurrentQuiz={setCurrentQuiz}
              startQuiz={startQuiz}
              selectedTopic={selectedTopic}
              quizData={quizData}
              styles={styles}
              completionTitle="Quiz Complete!"
              startTitle="Ready for a Quiz?"
            />
          )}

          {learningMode === 'collaborative' && (
            <ChatWindow
              chatHistory={chatHistory}
              userInput={userInput}
              setUserInput={setUserInput}
              sendMessage={sendMessage}
              styles={styles}
              tutorName="AI Math Tutor"
              placeholder="Ask me anything about math! I'm here to help you solve problems."
            />
          )}

          {learningMode === 'visual' && (
            <VisualResources
              resources={learningResources}
              styles={styles}
              title="Visual Learning Resources"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MathDash;