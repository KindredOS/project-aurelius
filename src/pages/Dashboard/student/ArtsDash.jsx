// Pathing: src/pages/Dashboard/student/ArtDash.jsx
// Focus: An aggregated file for the various components, utils, and functionalities to make the Arts Learning Hub Work. 
// Verison Update: Audited to add in the game menu and feature, creating parity. 08.24.25

import React, { useMemo, useState, useEffect } from 'react';
import { BookOpen, Palette, PenLine, Mic2, Video, PencilRuler, Soup, Combine, Theater } from 'lucide-react';
import { useSubjectDashboard } from '../../../utils/useSubjectDashboard';
import Sidebar from '../../../components/student/Sidebar';
import ChatWindow from '../../../components/student/ChatWindow';
import TopicHeader from '../../../components/student/TopicHeader';
import VisualResources from '../../../components/student/VisualResources';
import QuizAssessmentTool from '../../../components/student/QuizAssessmentTool';
import GameMenu from '../../../components/student/GameMenu';
import AchievementsCard from '../../../components/student/AchievementsCard';
import SubscribeModal from '../../../components/SubscribeModal';
import styles from './ArtsDash.module.css';
import { MODE } from '../../../api/ApiMaster';

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

  //Iconmap is now is functional, and attached each to a different module. 
  const artsIconMap = useMemo(() => ({
  "overview": BookOpen,       // Foundations of Artistic Expression
  "module1": Palette,         // Visual Arts
  "module2": PenLine,         // Literary Arts
  "module3": Mic2,            // Performing Arts
  "module4": Video,           // Media Arts
  "module5": PencilRuler,     // Applied Arts & Design
  "module6": Soup,            // Culinary Arts
  "module7": Combine,         // Interdisciplinary & Experiential Arts
  "module8": Theater,         // Arts for Social Change & Future Frontiers
  "default": BookOpen
}), []);

  //Passes hooks to our various programs and applications, although I suspect doubling in a number of places, and we may want to do a review. 
  const dashboardState = useSubjectDashboard('arts', artsIconMap);
  const {
    selectedTopic, setSelectedTopic,
    gradeLevel, 
    learningMode, setLearningMode,
    userProgress, 
    chatHistory, setChatHistory,
    userInput, setUserInput,
    achievements, studyStreak,
    topics, currentTopicData, learningResources,  
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

  //Render progressbar, should be fully functional. Had to resolve it in a module.css 
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

  //Run game interactive element, common component built to use GameMenu handles everything internally now
  const runGame = () => (
      <GameMenu
        subject="arts"
        isPremium={isPremium}
        onLaunch={() => {}}
      />
  );

  if (loading) {
    return <div className={styles.loadingContainer}>Loading Arts Dashboard...</div>;
  }

  const topic = topics.find(t => t.id === selectedTopic) || currentTopicData;
  const freeGameAccessIds = ['overview', 'visual', 'music', 'theater'];
  const isGameFree = freeGameAccessIds.includes(selectedTopic);

  // Sidebard, topic header, and AI Tutor, Quiz Assessment, Game, and Visual component variable pass. 
  return (
    <div className={styles.artsPageContainer}>
      <Sidebar
        title="Arts Learning Studio"
        studyStreak={studyStreak}
        learningMode={learningMode}
        setLearningMode={setLearningMode}
        topics={topics}
        selectedTopic={selectedTopic}
        setSelectedTopic={setSelectedTopic}
        userProgress={userProgress} //<----- Must check
        achievements={achievements}
        renderProgressBar={renderProgressBar}
        styles={styles}
        email={user.email}
        subject="arts"
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
            subject="arts"
            userEmail={user.email}
          />

          {/* Chat-based collaboration mode */}
          {learningMode === 'collaborative' && (
            <ChatWindow
              chatHistory={chatHistory}
              setChatHistory={setChatHistory}
              userInput={userInput}
              setUserInput={setUserInput}
              sendMessage={dashboardState.sendMessage}
              styles={styles}
              tutorName="AI Arts Mentor"
              placeholder="Ask about art techniques, history, or inspiration..."
              subject="arts"
              user={user}
              isLimited={!isPremium}
            />
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

          {/* Interactive Game Mode */}
          {learningMode === 'interactive' && (
            isPremium || isGameFree ? runGame() : (
              <div className={styles.lockedContent} onClick={() => setShowSubscribe(true)}>
                <div className={styles.lockedOverlay}>
                  🔒 This creative project is a Premium feature.
                  <button className={styles.subscribeButton}>Learn More</button>
                </div>
              </div>
            )
          )}               

          {/* Visual Learning Resources Mode */}
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

          {/* Achievement Mode */}
          {learningMode === 'achievements' && (
            <AchievementsCard 
            achievements={achievements}
            subject="arts" 
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

export default ArtsDash;