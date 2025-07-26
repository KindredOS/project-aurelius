import React, { useMemo, useState, useEffect } from 'react';
import { Home, Dumbbell, Utensils, Smile, Activity, Heart } from 'lucide-react';
import { useSubjectDashboard } from '../../../utils/useSubjectDashboard';
import Sidebar from '../../../components/student/Sidebar';
import ChatWindow from '../../../components/student/ChatWindow';
import TopicHeader from '../../../components/student/TopicHeader';
import VisualResources from '../../../components/student/VisualResources';
import QuizAssessmentTool from '../../../components/student/QuizAssessmentTool';
import LifestyleGame from '../../../components/student/lifestyle/game/LifestyleGame';
import SubscribeModal from '../../../components/SubscribeModal';
import styles from './LifestyleDash.module.css';
import { MODE } from '../../../api/ApiMaster';

const LifestyleDash = () => {
  const [showSubscribe, setShowSubscribe] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const updateStatus = () => setIsOffline(!navigator.onLine);
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

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
    userProgress,
    chatHistory, setChatHistory,
    userInput, setUserInput,
    achievements, lifestyleStreak,
    topics, currentTopicData, learningResources, learningModes,
    loading,
    user
  } = dashboardState;

  const localPremiumCache = localStorage.getItem('isPremiumCached') === 'true';
  const isEdge = MODE === 'EDGE';
  const isPremium = isEdge || user?.isPremium || localPremiumCache || isOffline;

  if (user?.isPremium) {
    localStorage.setItem('isPremiumCached', 'true');
  }

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

  const runGame = () => (
    <div className={styles.simulationCard}>
      <LifestyleGame />
    </div>
  );

  if (loading) {
    return <div className={styles.loadingContainer}>Loading Lifestyle Dashboard...</div>;
  }

  const topic = topics.find(t => t.id === selectedTopic) || currentTopicData;
  const freeGameAccessIds = ['overview', 'fitness', 'nutrition', 'mindfulness'];
  const isGameFree = freeGameAccessIds.includes(selectedTopic);

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
        achievements={achievements}
        renderProgressBar={renderProgressBar}
        styles={styles}
        gradeLevelLabel="Experience Level"
        gradeLevels={['beginner', 'intermediate', 'advanced']}
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
            subject="lifestyle"
            userEmail={user.email}
          />

          {learningMode === 'collaborative' && (
            <ChatWindow
              chatHistory={chatHistory}
              setChatHistory={setChatHistory}
              userInput={userInput}
              setUserInput={setUserInput}
              sendMessage={dashboardState.sendMessage}
              styles={styles}
              tutorName="AI Lifestyle Coach"
              placeholder="Ask about lifestyle improvements..."
              subject="lifestyle"
              user={user}
              isLimited={!isPremium}
            />
          )}

          {learningMode === 'assessment' && (
            <QuizAssessmentTool
              content={currentTopicData?.content || "This section covers key concepts in lifestyle topics."}
              subject="lifestyle"
              sectionTitle={currentTopicData?.title || "Lifestyle Assessment"}
              topicId={selectedTopic}
              topicData={topic}
              userEmail={user.email}
              isLimited={!isPremium}
            />
          )}

          {learningMode === 'interactive' && (
            isPremium || isGameFree ? runGame() : (
              <div className={styles.lockedContent} onClick={() => setShowSubscribe(true)}>
                <div className={styles.lockedOverlay}>
                  🔒 This interactive simulation is a Premium feature.
                  <button className={styles.subscribeButton}>Learn More</button>
                </div>
              </div>
            )
          )}

          {learningMode === 'visual' && (
            isPremium ? (
              <VisualResources
                resources={learningResources}
                styles={styles}
                title="Visual Learning Resources"
              />
            ) : (
              <div className={styles.lockedContent} onClick={() => setShowSubscribe(true)}>
                <div className={styles.lockedOverlay}>
                  🔒 Visual resources are part of Premium Access.
                  <button className={styles.subscribeButton}>Unlock</button>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {showSubscribe && (
        <SubscribeModal
          isOpen={true}
          onClose={() => setShowSubscribe(false)}
          user={user}
        />
      )}
    </div>
  );
};

export default LifestyleDash;
