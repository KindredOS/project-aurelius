import React, { useMemo } from 'react';
import { BookOpen, Atom, Calculator, Dna, Globe, Star, Play, RotateCcw, Microscope } from 'lucide-react';
import { useSubjectDashboard } from '../../../utils/useSubjectDashboard';
import Sidebar from '../../../components/student/Sidebar';
import Quiz from '../../../components/student/Quiz';
import ChatWindow from '../../../components/student/ChatWindow';
import TopicHeader from '../../../components/student/TopicHeader';
import VisualResources from '../../../components/student/VisualResources';
import styles from './ScienceDash.module.css';

const ScienceDash = () => {
  const iconMap = useMemo(() => ({
    'overview': BookOpen,
    'physics': Atom,
    'chemistry': Calculator,
    'biology': Dna,
    'earth': Globe,
    'space': Star,
    'default': BookOpen
  }), []);

  const dashboardState = useSubjectDashboard('science', iconMap);
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
          <Microscope className={styles.simulationIcon} />
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
    return <div className={styles.loadingContainer}>Loading Science Dashboard...</div>;
  }

  const topic = topics.find(t => t.id === selectedTopic) || currentTopicData;

  return (
    <div className={styles.sciencePageContainer}>
      <Sidebar
        title="Science Learning Hub"
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
            subject="science"
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
              tutorName="AI Science Tutor"
              placeholder="Ask me anything about science..."
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

export default ScienceDash;
