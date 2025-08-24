// Pathing: src/pages/Dashboard/student/EngineeringDash.jsx
// Focus: An aggregated file for the various components, utils, and functionalities to make the Engineering Learning Hub Work. 
// Verison Update: Audited to add in the game menu and feature, creating parity. 08.24.25

import React, { useMemo, useState, useEffect } from 'react';
import { BookOpen, Ruler, Construction, Layers, Spline, Wrench, Building2, PlugZap, Sparkles } from 'lucide-react';
import { useSubjectDashboard } from '../../../utils/useSubjectDashboard';
import Sidebar from '../../../components/student/Sidebar';
import ChatWindow from '../../../components/student/ChatWindow';
import TopicHeader from '../../../components/student/TopicHeader';
import VisualResources from '../../../components/student/VisualResources';
import QuizAssessmentTool from '../../../components/student/QuizAssessmentTool';
import GameMenu from '../../../components/student/GameMenu';
import AchievementsCard from '../../../components/student/AchievementsCard';
import SubscribeModal from '../../../components/SubscribeModal';
import styles from './EngineeringDash.module.css';
import { MODE } from '../../../api/ApiMaster';

const EngineeringDash = () => {
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
  const engineeringIconMap = useMemo(() => ({
  "overview": BookOpen,       // Overview
  "module1": Ruler,           // Foundations of Engineering
  "module2": Construction,    // Mechanical and Structural Engineering
  "module3": Layers,          // Branches of Engineering
  "module4": Spline,          // Systems Engineering and Integration
  "module5": Wrench,          // Engineering Applications in the Real World
  "module6": Building2,       // Architecture and Urban Design
  "module7": PlugZap,         // Power, Energy, and Transportation Systems
  "module8": Sparkles,        // Frontier Engineering
  "default": BookOpen
}), []);


  //Passes hooks to our various programs and applications, although I suspect doubling in a number of places, and we may want to do a review. 
  const dashboardState = useSubjectDashboard('engineering', engineeringIconMap);
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
      <div className={styles.progressBarFill} style={{ width: `${progress}%` }}></div>
    </div>
  );

  const renderMainProgressBar = (progress) => (
    <div className={styles.mainProgressBar}>
      <div className={styles.mainProgressBarFill} style={{ width: `${progress}%` }}></div>
    </div>
  );

  //Run game interactive element, common component built to use GameMenu handles everything internally now
  const runGame = () => (
    <div className={styles.simulationCard}>
      <GameMenu
        subject="engineering"
        isPremium={isPremium}
        onLaunch={() => {}}
      />
    </div>
  );
  
  if (loading) {
    return <div className={styles.loadingContainer}>Loading Engineering Dashboard...</div>;
  }

  const topic = topics.find(t => t.id === selectedTopic) || currentTopicData;
  const freeGameAccessIds = ['overview', 'mechanical', 'electrical', 'civil'];
  const isGameFree = freeGameAccessIds.includes(selectedTopic);

  // Sidebard, topic header, and AI Tutor, Quiz Assessment, Game, and Visual component variable pass.
  return (
    <div className={styles.engineeringPageContainer}>
      <Sidebar
        title="Engineering Learning Hub"
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
        subject="engineering"
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
            subject="engineering"
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
              tutorName="AI Engineering Tutor"
              placeholder="Ask me anything about engineering..."
              subject="engineering"
              user={user}
              isLimited={!isPremium}
            />
          )}

          {/* 📝 Quiz & Assessment */}
          {learningMode === 'assessment' && (
            <QuizAssessmentTool
              content={currentTopicData?.content || "This section covers key concepts in engineering."}
              subject="engineering"
              sectionTitle={currentTopicData?.title || "Engineering Assessment"}
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
                  🔒 This interactive simulation is a Premium feature.
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
                title="Engineering Visual Resources"
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
            subject="engineering"
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

export default EngineeringDash;
