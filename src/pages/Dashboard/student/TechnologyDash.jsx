// Pathing: src/pages/Dashboard/student/TechnologyDash.jsx
// Focus: An aggregated file for the various components, utils, and functionalities to make the Technology Learning Hub Work.
// Refactored TechnologyDash.jsx - Simulation aligned to match ChemistryGame-style logic
import React, { useMemo, useState, useEffect } from 'react';
import { BookOpen, Brain, Globe, Smartphone, Code, Monitor } from 'lucide-react';
import { useSubjectDashboard } from '../../../utils/useSubjectDashboard';
import Sidebar from '../../../components/student/Sidebar';
import ChatWindow from '../../../components/student/ChatWindow';
import TopicHeader from '../../../components/student/TopicHeader';
import VisualResources from '../../../components/student/VisualResources';
import QuizAssessmentTool from '../../../components/student/QuizAssessmentTool';
import TechnologyGame from '../../../components/student/technology/game/TechnologyGame';
import AchievementsCard from '../../../components/student/AchievementsCard';
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

   //Iconmap isn't being used as far as I can tell, it needs to be reintregrated with the module architechture. 
  const iconMap = useMemo(() => ({
    'overview': BookOpen,
    'programming': Code,
    'ai': Brain,
    'web': Globe,
    'mobile': Smartphone,
    'systems': Monitor,
    'default': BookOpen
  }), []);

  //Passes hooks to our various programs and applications, although I suspect doubling in a number of places, and we may want to do a review. 
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

  //Edge use case, and protections on montization of content in a off line mode. 
  const localPremiumCache = localStorage.getItem('isPremiumCached') === 'true';
  const isEdge = MODE === 'EDGE';
  const isPremium = isEdge || user?.isPremium || localPremiumCache || isOffline;

  if (user?.isPremium) {
    localStorage.setItem('isPremiumCached', 'true');
  }

  //Render progressbar, needs updating, I think there might be a conflict somewhere in there. 
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

  //Run game interactive element, with a focus on being the start of a game loader component.
  const runGame = () => (
    <div className={styles.simulationCard}>
      <TechnologyGame />
    </div>
  );


  if (loading) {
    return <div className={styles.loadingContainer}>Loading Technology Dashboard...</div>;
  }

  const topic = topics.find(t => t.id === selectedTopic) || currentTopicData;
  const freeGameAccessIds = ['overview', 'programming', 'ai', 'web'];
  const isGameFree = freeGameAccessIds.includes(selectedTopic);

  //Sidebard, topic header, and AI Tutor, Quiz Assessment, Game, and Visual component variable pass. 
  return (
    <div className={styles.techPageContainer}>
      <Sidebar
        title="Technology Learning Hub"
        studyStreak={studyStreak}
        learningMode={learningMode}
        setLearningMode={setLearningMode}
        topics={topics}
        selectedTopic={selectedTopic}
        setSelectedTopic={setSelectedTopic}
        achievements={achievements}
        renderProgressBar={renderProgressBar}
        styles={styles}
        email={user.email}
        subject="technology"
      />

      <div className={styles.mainContent}>
        <div className={styles.contentSection}>
          <TopicHeader
            topic={topic}
            userProgress={userProgress}
            gradeLevel={gradeLevel}
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

          {/* Achievement Mode */}
          {learningMode === 'achievements' && (
            <AchievementsCard 
            achievements={achievements} 
            styles={styles}
            />
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
