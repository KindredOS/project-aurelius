import React, { useMemo, useState, useEffect } from 'react';
import { BookOpen, Palette, Music, Mic, Users, Camera, RotateCcw, Brush, Play } from 'lucide-react';
import { useSubjectDashboard } from '../../../utils/useSubjectDashboard';
import Sidebar from '../../../components/student/Sidebar';
import ChatWindow from '../../../components/student/ChatWindow';
import TopicHeader from '../../../components/student/TopicHeader';
import VisualResources from '../../../components/student/VisualResources';
import QuizAssessmentTool from '../../../components/student/QuizAssessmentTool';
import SubscribeModal from '../../../components/SubscribeModal';
import ArtsGame from '../../../components/student/arts/game/ArtsGame';
import { MODE } from '../../../api/ApiMaster';
import styles from './ArtsDash.module.css';

const ArtsDash = () => {
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
    currentTopicData, chatHistory, userInput, setUserInput,
    learningResources, learningModes, achievements, studyStreak,
    topics, loading, user,
    sendMessage
  } = dashboardState;

  const localPremiumCache = localStorage.getItem('isPremiumCached') === 'true';
  const isEdge = MODE === 'EDGE';
  const isPremium = isEdge || user?.isPremium || localPremiumCache || isOffline;

  if (user?.isPremium) {
    localStorage.setItem('isPremiumCached', 'true');
  }

  const freeProjectAccessIds = ['overview', 'visual', 'music', 'theater'];
  const isProjectFree = freeProjectAccessIds.includes(selectedTopic);

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

  const renderProject = () => (
    <div className={styles.simulationCard}>
      <ArtsGame />
    </div>
  );

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
            subject="arts"
            userEmail={user.email}
          />

          {/* 🎨 Interactive Art Game */}
          {learningMode === 'interactive' && (
            isPremium || isProjectFree ? renderProject() : (
              <div className={styles.lockedContent} onClick={() => setShowSubscribe(true)}>
                <div className={styles.lockedOverlay}>
                  🔒 This creative project is a Premium feature.
                  <button className={styles.subscribeButton}>Learn More</button>
                </div>
              </div>
            )
          )}

          {/* 📝 Quiz & Assessment */}
          {learningMode === 'assessment' && (
            <QuizAssessmentTool
              content={currentTopicData?.content || "This section evaluates your knowledge of the arts."}
              subject="arts"
              sectionTitle={currentTopicData?.title || "Arts Portfolio Review"}
              topicId={selectedTopic}
              topicData={topic}
              userEmail={user.email}
              isLimited={!isPremium}
            />
          )}

          {/* 🧠 AI Arts Mentor */}
          {learningMode === 'collaborative' && (
            <ChatWindow
              chatHistory={chatHistory}
              userInput={userInput}
              setUserInput={setUserInput}
              sendMessage={sendMessage}
              styles={styles}
              tutorName="AI Arts Mentor"
              placeholder="Ask about art techniques, history, or inspiration..."
              subject="arts"
              user={user}
              isLimited={!isPremium}
            />
          )}

          {/* 🎥 Visual Resources */}
          {learningMode === 'visual' && (
            isPremium ? (
              <VisualResources
                resources={learningResources}
                styles={styles}
                title="Visual Inspiration Gallery"
              />
            ) : (
              <div className={styles.lockedContent} onClick={() => setShowSubscribe(true)}>
                <div className={styles.lockedOverlay}>
                  🔒 Visual gallery is available with Premium Access.
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

export default ArtsDash;
