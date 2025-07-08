import React, { useMemo } from 'react';
import { Home, Heart, Users, Award, Play, Pause, RotateCcw, Dumbbell, Activity, Utensils, Smile } from 'lucide-react';
import { useSubjectDashboard } from '../../../utils/useSubjectDashboard';
import Sidebar from '../../../components/student/Sidebar';
import Quiz from '../../../components/student/Quiz';
import ChatWindow from '../../../components/student/ChatWindow';
import TopicHeader from '../../../components/student/TopicHeader';
import VisualResources from '../../../components/student/VisualResources';
import styles from './LifestyleDash.module.css';

const LifestyleDash = () => {
  const iconMap = useMemo(() => ({
    'overview': Home,
    'fitness': Dumbbell,
    'nutrition': Utensils,
    'mindfulness': Smile,
    'productivity': Activity,
    'relationships': Heart,
    'default': Home
  }), []);

  const dashboardState = useSubjectDashboard('lifestyle', iconMap);
  const {
    selectedTopic, setSelectedTopic,
    experienceLevel, setExperienceLevel,
    learningMode, setLearningMode,
    userProgress, setUserProgress,
    currentQuiz, setCurrentQuiz,
    chatHistory, userInput, setUserInput,
    achievements, lifestyleStreak,
    topics, currentTopicData, quizData, activityData, learningResources, learningModes,
    loading, error,
    startQuiz, answerQuestion, sendMessage
  } = dashboardState;

  const runActivity = (topicId) => {
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

  const renderActivity = (topicId) => {
    if (!activityData) return null;

    return (
      <div className={styles.activityCard}>
        <div className={styles.activityHeader}>
          <h3 className={styles.activityTitle}>{activityData.name}</h3>
          <Activity className={styles.activityIcon} />
        </div>
        <p className={styles.activityDescription}>{activityData.description}</p>

        <div className={styles.activityWindow}>
          <p className={styles.activityPlaceholder}>
            {activityData.placeholder || "Click 'Start Activity' to begin"}
          </p>
        </div>

        <div className={styles.activityControls}>
          <button
            onClick={() => runActivity(topicId)}
            className={`${styles.activityButton} ${styles.activityButtonPrimary}`}
          >
            <Play className={styles.buttonIcon} />
            Start Activity
          </button>
          <button className={`${styles.activityButton} ${styles.activityButtonSecondary}`}>
            <RotateCcw className={styles.buttonIcon} />
            Reset
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className={styles.loadingContainer}>Loading Lifestyle Dashboard...</div>;
  }

  const topic = topics.find(t => t.id === selectedTopic) || currentTopicData;

  return (
    <div className={styles.lifestylePageContainer}>
      <Sidebar
        title="Lifestyle Hub"
        studyStreak={lifestyleStreak}
        gradeLevel={experienceLevel}
        setGradeLevel={setExperienceLevel}
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
        gradeLevelLabel="Experience Level"
        gradeLevels={['beginner', 'intermediate', 'advanced']}
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

          {learningMode === 'interactive' && renderActivity(selectedTopic)}

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
              completionTitle="Assessment Complete!"
              startTitle="Ready for an Assessment?"
            />
          )}

          {learningMode === 'collaborative' && (
            <ChatWindow
              chatHistory={chatHistory}
              userInput={userInput}
              setUserInput={setUserInput}
              sendMessage={sendMessage}
              styles={styles}
              tutorName="AI Lifestyle Coach"
              placeholder="Ask about lifestyle improvements..."
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

export default LifestyleDash;