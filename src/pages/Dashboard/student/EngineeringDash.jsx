import React, { useMemo } from 'react';
import { BookOpen, Cog, Zap, Settings, Calculator, Wrench, Play, RotateCcw } from 'lucide-react';
import { useSubjectDashboard } from '../../../utils/useSubjectDashboard';
import Sidebar from '../../../components/student/Sidebar';
import Quiz from '../../../components/student/Quiz';
import ChatWindow from '../../../components/student/ChatWindow';
import TopicHeader from '../../../components/student/TopicHeader';
import VisualResources from '../../../components/student/VisualResources';
import styles from './EngineeringDash.module.css';

const EngineeringDash = () => {
  const iconMap = useMemo(() => ({
    'overview': BookOpen,
    'mechanical': Cog,
    'electrical': Zap,
    'civil': Settings,
    'computer': Calculator,
    'chemical': Wrench,
    'default': BookOpen
  }), []);

  const dashboardState = useSubjectDashboard('engineering', iconMap);
  const {
    selectedTopic, setSelectedTopic,
    gradeLevel, setGradeLevel,
    learningMode, setLearningMode,
    userProgress, setUserProgress,
    currentQuiz, setCurrentQuiz,
    chatHistory, userInput, setUserInput,
    achievements, studyStreak,
    topics, currentTopicData, quizData, simulationData, learningResources, learningModes,
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

  const renderSimulation = (topicId) => {
    if (!simulationData) return null;

    return (
      <div className={styles.simulationContainer}>
        <div className={styles.simulationHeader}>
          <h3 className={styles.simulationTitle}>{simulationData.name}</h3>
          <Settings className={`${styles.w6} ${styles.h6}`} />
        </div>
        <p className={styles.simulationDescription}>{simulationData.description}</p>
        
        <div className={styles.simulationArea}>
          <p className={styles.simulationPlaceholder}>
            {simulationData.placeholder || "Click 'Run Simulation' to start"}
          </p>
        </div>
        
        <div className={styles.simulationControls}>
          <button
            onClick={() => runSimulation(topicId)}
            className={`${styles.button} ${styles.primary}`}
          >
            <Play className={`${styles.w4} ${styles.h4}`} />
            Run Simulation
          </button>
          <button className={`${styles.button} ${styles.secondary}`}>
            <RotateCcw className={`${styles.w4} ${styles.h4}`} />
            Reset
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className={styles.loadingContainer}>Loading Engineering Dashboard...</div>;
  }

  const topic = topics.find(t => t.id === selectedTopic) || currentTopicData;

  return (
    <div className={styles.container}>
      <Sidebar
        title="Engineering Learning Hub"
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
        <div className={styles.contentCard}>
          <TopicHeader
            topic={topic}
            userProgress={userProgress}
            selectedTopic={selectedTopic}
            renderMainProgressBar={renderMainProgressBar}
            styles={styles}
            subject="engineering"
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
              completionTitle="Engineering Challenge Complete!"
              startTitle="Ready for an Engineering Challenge?"
            />
          )}

          {learningMode === 'collaborative' && (
            <ChatWindow
              chatHistory={chatHistory}
              userInput={userInput}
              setUserInput={setUserInput}
              sendMessage={sendMessage}
              styles={styles}
              tutorName="AI Engineering Tutor"
              placeholder="Ask me anything about engineering..."
            />
          )}

          {learningMode === 'visual' && (
            <VisualResources
              resources={learningResources}
              styles={styles}
              title="Engineering Visual Resources"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EngineeringDash;