import React, { useMemo } from 'react';
import { BookOpen, Brain, Globe, Smartphone, Code, Monitor, Play, RotateCcw } from 'lucide-react';
import { useSubjectDashboard } from '../../../utils/useSubjectDashboard';
import Sidebar from '../../../components/student/Sidebar';
import Quiz from '../../../components/student/Quiz';
import ChatWindow from '../../../components/student/ChatWindow';
import TopicHeader from '../../../components/student/TopicHeader';
import VisualResources from '../../../components/student/VisualResources';
import styles from './TechnologyDash.module.css';

const TechnologyDash = () => {
  const iconMap = useMemo(() => ({
    'overview': BookOpen,
    'programming': Code,
    'ai': Brain,
    'web': Globe,
    'mobile': Smartphone,
    'systems': Monitor,
    'default': BookOpen
  }), []);

  const dashboardState = useSubjectDashboard('technology', iconMap);
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
          <Monitor className={styles.simulationIcon} />
        </div>
        <p className={styles.simulationDescription}>{projectData.description}</p>

        <div className={styles.simulationWindow}>
          <p className={styles.simulationPlaceholder}>
            {projectData.placeholder || "Click 'Run Simulation' to start"}
          </p>
        </div>

        <div className={styles.simulationControls}>
          <button
            onClick={() => runSimulation(topicId)}
            className={`${styles.simulationButton} ${styles.simulationButtonPrimary}`}
          >
            <Play className={styles.buttonIcon} />
            Run Simulation
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
    return <div className={styles.loadingContainer}>Loading Technology Dashboard...</div>;
  }

  if (error) {
    return <div className={styles.errorContainer}>{error}</div>;
  }

  const topic = topics.find(t => t.id === selectedTopic) || currentTopicData;

  return (
    <div className={styles.techPageContainer}>
      <Sidebar
        title="Technology Learning Hub"
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
            subject="technology"
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
              completionTitle="Challenge Complete!"
              startTitle="Ready for a Challenge?"
            />
          )}

          {learningMode === 'collaborative' && (
            <ChatWindow
              chatHistory={chatHistory}
              userInput={userInput}
              setUserInput={setUserInput}
              sendMessage={sendMessage}
              styles={styles}
              tutorName="AI Tech Mentor"
              placeholder="Ask a tech question..."
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

export default TechnologyDash;
