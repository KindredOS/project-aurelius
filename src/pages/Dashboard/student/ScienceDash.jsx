// Pathing: src/pages/Dashboard/student/ScienceDash.jsx
// Focus: An aggregated file for the various components, utils, and functionalities to make the Science Learning Hub Work. 
// Version Update: Updated top commments, and added subject carry variable to achievements. 

import React, { useMemo, useState, useEffect } from 'react';
import { BookOpen, Atom, Calculator, Rocket, Landmark, Wrench, Dna, Globe, Sparkles } from 'lucide-react';
import { useSubjectDashboard } from '../../../utils/useSubjectDashboard';
import Sidebar from '../../../components/student/Sidebar';
import ChatWindow from '../../../components/student/ChatWindow';
import TopicHeader from '../../../components/student/TopicHeader';
import VisualResources from '../../../components/student/VisualResources';
import QuizAssessmentTool from '../../../components/student/QuizAssessmentTool';
import ChemistryGame from '../../../components/student/science/game/ChemistryGame';
import AchievementsCard from '../../../components/student/AchievementsCard';
import SubscribeModal from '../../../components/SubscribeModal';
import styles from './ScienceDash.module.css';
import { MODE } from '../../../api/ApiMaster';

const ScienceDash = () => {
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
    'module1': Atom,
    'module2': Calculator,
    'module3': Rocket,
    'module4': Globe,
    'module5': Dna,
    'module6': Landmark,
    'module7': Wrench,
    'module8': Sparkles,    
    'default': BookOpen
  }), []);

  //Passes hooks to our various programs and applications, although I suspect doubling in a number of places, and we may want to do a review. 
  const dashboardState = useSubjectDashboard('science', iconMap);
  const {
    selectedTopic, setSelectedTopic,
    gradeLevel, setGradeLevel,
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
      <ChemistryGame />
    </div>
  );

  if (loading) {
    return <div className={styles.loadingContainer}>Loading Science Dashboard...</div>;
  }

  const topic = topics.find(t => t.id === selectedTopic) || currentTopicData;
  const freeGameAccessIds = ['overview', 'physics', 'chemistry', 'biology'];
  const isGameFree = freeGameAccessIds.includes(selectedTopic);

  // REMOVED: normalizedLearningModes logic - no longer needed since Sidebar is self-contained

  //Sidebar, topic header, and AI Tutor, Quiz Assessment, Game, and Visual component variable pass. 
  return (
    <div className={styles.sciencePageContainer}>
      <Sidebar
        title="Science Learning Hub"
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
        subject="science"
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
            subject="science"
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
              tutorName="AI Science Tutor"
              placeholder="Ask me anything about science..."
              subject="science"
              user={user}
              isLimited={!isPremium}
            />
          )}

          {/* Assessment Mode */}
          {learningMode === 'assessment' && (
            <QuizAssessmentTool
              content={currentTopicData?.content || "This section covers key concepts in science."}
              subject="science"
              sectionTitle={currentTopicData?.title || "Science Assessment"}
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
            subject="science" 
            styles={styles}
            />
          )}
        </div>
      </div>

      {/* Monetization CTA for subscription */}
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

export default ScienceDash;