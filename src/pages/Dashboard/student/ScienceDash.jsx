// ScienceDash.jsx
import React, { useMemo } from 'react';
import { BookOpen, Atom, Calculator, Dna, Globe, Star } from 'lucide-react';
import { useSubjectDashboard } from '../../../utils/useSubjectDashboard';
import Sidebar from '../../../components/student/Sidebar';
import ChatWindow from '../../../components/student/ChatWindow';
import TopicHeader from '../../../components/student/TopicHeader';
import VisualResources from '../../../components/student/VisualResources';
import QuizAssessmentTool from '../../../components/student/QuizAssessmentTool';
import ChemistryGame from '../../../components/student/science/game/ChemistryGame';
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
    chatHistory, setChatHistory,
    userInput, setUserInput,
    achievements, studyStreak,
    topics, currentTopicData, quizData, learningResources, learningModes,
    loading,
    startQuiz, answerQuestion, sendMessage,
    user
  } = dashboardState;

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

  const runGame = () => {
    return (
      <div className={styles.simulationCard}>
        <ChemistryGame />
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
        achievements={achievements}
        renderProgressBar={renderProgressBar}
        styles={styles}
        email={user.email}
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
            userEmail={user.email}
          />

          {learningMode === 'interactive' && runGame()}

          {learningMode === 'assessment' && (
            <QuizAssessmentTool
              content={currentTopicData?.content || "This section covers key concepts in science."}
              sectionTitle={currentTopicData?.title || "Science Assessment"}
            />
          )}

          {learningMode === 'collaborative' && (
            <ChatWindow
              chatHistory={chatHistory}
              setChatHistory={setChatHistory}
              userInput={userInput}
              setUserInput={setUserInput}
              sendMessage={sendMessage}
              styles={styles}
              tutorName="AI Science Tutor"
              placeholder="Ask me anything about science..."
              subject="science"
              user={user}
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
