// Refactored TechnologyDash.jsx - Simulation aligned to match ChemistryGame-style logic
import React, { useMemo, useState, useEffect } from 'react';
import { BookOpen, Brain, Globe, Smartphone, Code, Monitor } from 'lucide-react';
import { useSubjectDashboard } from '../../../utils/useSubjectDashboard';
import Sidebar from '../../../components/student/Sidebar';
import ChatWindow from '../../../components/student/ChatWindow';
import TopicHeader from '../../../components/student/TopicHeader';
import VisualResources from '../../../components/student/VisualResources';
import QuizAssessmentTool from '../../../components/student/QuizAssessmentTool';
import SubscribeModal from '../../../components/SubscribeModal';
import styles from './TechnologyDash.module.css';
import { MODE } from '../../../api/ApiMaster';

const TechnologyDash = () => {
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
    userProgress,
    chatHistory, setChatHistory,
    userInput, setUserInput,
    achievements, studyStreak,
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
      <div className={styles.simulationWindow}>
        <p className={styles.simulationPlaceholder}>🕹️ Technology simulation coming soon! This module will teach you how to code a basic app and explore system interactions.</p>
      </div>
    </div>
  );

  if (loading) {
    return <div className={styles.loadingContainer}>Loading Technology Dashboard...</div>;
  }

  const topic = topics.find(t => t.id === selectedTopic) || currentTopicData;

  const freeGameAccessIds = ['overview', 'programming', 'ai', 'web'];
  const isGameFree = freeGameAccessIds.includes(selectedTopic);

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
            subject="technology"
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
              tutorName="AI Tech Mentor"
              placeholder="Ask a tech question..."
              subject="technology"
              user={user}
              isLimited={!isPremium}
            />
          )}

          {learningMode === 'assessment' && (
            <QuizAssessmentTool
              content={currentTopicData?.content || "This section covers key concepts in technology."}
              subject="technology"
              sectionTitle={currentTopicData?.title || "Technology Assessment"}
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

export default TechnologyDash;
