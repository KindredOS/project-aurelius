// Now your ArtsDash.jsx becomes much smaller:
import React, { useMemo } from 'react';
import { BookOpen, Palette, Music, Mic, Users, Camera, Play, RotateCcw, Brush } from 'lucide-react';
import { useSubjectDashboard } from '../../../utils/useSubjectDashboard';
import Sidebar from '../../../components/student/Sidebar';
import Quiz from '../../../components/student/Quiz';
import ChatWindow from '../../../components/student/ChatWindow';
import TopicHeader from '../../../components/student/TopicHeader';
import VisualResources from '../../../components/student/VisualResources';
import styles from './ArtsDash.module.css';

const ArtsDash = () => {
  const iconMap = useMemo(() => ({
    'overview': BookOpen,
    'visual': Palette,
    'music': Music,
    'theater': Mic,
    'dance': Users,
    'media': Camera,
    'default': BookOpen
  }), []);

  const dashboardState = useSubjectDashboard('arts', iconMap);
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

  const runProject = (topicId) => {
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

  const renderProject = (topicId) => {
    if (!projectData) return null;

    return (
      <div className={styles.projectCard}>
        <div className={styles.projectHeader}>
          <h3 className={styles.projectTitle}>{projectData.name}</h3>
          <Brush className={styles.projectIcon} />
        </div>
        <p className={styles.projectDescription}>{projectData.description}</p>

        <div className={styles.projectWindow}>
          <p className={styles.projectPlaceholder}>
            {projectData.placeholder || "Click 'Start Project' to begin creating"}
          </p>
        </div>

        <div className={styles.projectControls}>
          <button
            onClick={() => runProject(topicId)}
            className={`${styles.projectButton} ${styles.projectButtonPrimary}`}
          >
            <Play className={styles.buttonIcon} />
            Start Project
          </button>
          <button className={`${styles.projectButton} ${styles.projectButtonSecondary}`}>
            <RotateCcw className={styles.buttonIcon} />
            Reset
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className={styles.loadingContainer}>Loading Arts Dashboard...</div>;
  }

  const topic = topics.find(t => t.id === selectedTopic) || currentTopicData;

  return (
    <div className={styles.artsPageContainer}>
      <Sidebar
        title="Arts Learning Studio"
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
            subject="arts"
          />

          {learningMode === 'interactive' && renderProject(selectedTopic)}

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
              completionTitle="Portfolio Review Complete!"
              startTitle="Ready for Portfolio Review?"
            />
          )}

          {learningMode === 'collaborative' && (
            <ChatWindow
              chatHistory={chatHistory}
              userInput={userInput}
              setUserInput={setUserInput}
              sendMessage={sendMessage}
              styles={styles}
              tutorName="AI Arts Mentor"
              placeholder="Ask about art techniques, history, or inspiration..."
            />
          )}

          {learningMode === 'visual' && (
            <VisualResources
              resources={learningResources}
              styles={styles}
              title="Visual Inspiration Gallery"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtsDash;
