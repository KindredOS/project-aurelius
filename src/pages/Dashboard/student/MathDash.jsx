// Pathing: src/pages/Dashboard/student/MathDash.jsx
// Focus: An aggregated file for the various components, utils, and functionalities to make the Math Learning Hub Work.
// VerisonUpdate: Refactored MathDash.jsx - Generalized game loader with selector UI from inventory

import React, { useMemo, useState, useEffect, lazy, Suspense } from 'react';
import { BookOpen, FunctionSquare, SquareStack, BarChart2, Sigma, Code2, Globe, BrainCircuit, Calculator } from 'lucide-react';
import { useSubjectDashboard } from '../../../utils/useSubjectDashboard';
import Sidebar from '../../../components/student/Sidebar';
import ChatWindow from '../../../components/student/ChatWindow';
import TopicHeader from '../../../components/student/TopicHeader';
import VisualResources from '../../../components/student/VisualResources';
import QuizAssessmentTool from '../../../components/student/QuizAssessmentTool';
import gameList from '../../../components/student/math/game/MathGameInventory.json';
import AchievementsCard from '../../../components/student/AchievementsCard';
import SubscribeModal from '../../../components/SubscribeModal';
import styles from './MathDash.module.css';
import { MODE } from '../../../api/ApiMaster';

const MathDash = () => {
  const [showSubscribe, setShowSubscribe] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [selectedGameId, setSelectedGameId] = useState(null);

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
  const mathIconMap = useMemo(() => ({
  "overview": BookOpen,           // Course Overview
  "module1": Calculator,          // Foundations of Mathematical Thinking
  "module2": FunctionSquare,      // Patterns, Relationships, and Functions
  "module3": SquareStack,         // Structures, Systems, and Representation
  "module4": BarChart2,           // Applied Mathematics and Data Literacy
  "module5": Sigma,               // Mathematical Modeling and Optimization
  "module6": Code2,               // Computation, Algorithms, and Calculus Foundations
  "module7": Globe,               // Global Challenges Through a Mathematical Lens
  "module8": BrainCircuit,        // Future Mathematics and Theoretical Frontiers
  "default": BookOpen
}), []);

  //Passes hooks to our various programs and applications, although I suspect doubling in a number of places, and we may want to do a review. 
  const dashboardState = useSubjectDashboard('math', mathIconMap);
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
  if (user?.isPremium) localStorage.setItem('isPremiumCached', 'true');

  //Render progressbar, needs updating, I think there might be a conflict somewhere in there. 
  const renderProgressBar = (progress) => (
    <div className={styles.progressBar}>
      <div className={styles.progressFill} style={{ width: `${progress}%` }}></div>
    </div>
  );

  //Render progressbar for topic-level display
  const renderMainProgressBar = (progress) => (
    <div className={styles.mainProgressBar}>
      <div className={styles.mainProgressFill} style={{ width: `${progress}%` }}></div>
    </div>
  );

  //Run game interactive element, now supports JSON-based game loader to allow extensible game selection
  const RenderInteractiveGame = () => {
    if (!selectedGameId) return null;

    const gameEntry = gameList.find(g => g.id === selectedGameId);
    if (!gameEntry) return <div className={styles.lockedOverlay}>❗ Game not found in inventory.</div>;

    const GameComponent = lazy(() =>
      import(`../../../components/student/math/game/${gameEntry.component}.jsx`)
    );

    if (!isPremium) {
      return (
        <div className={styles.lockedContent} onClick={() => setShowSubscribe(true)}>
          <div className={styles.lockedOverlay}>
            🔒 This interactive simulation is a Premium feature.
            <button className={styles.subscribeButton}>Learn More</button>
          </div>
        </div>
      );
    }

    return (
      <div className={styles.simulationCard}>
        <Suspense fallback={<div>Loading game...</div>}>
          <GameComponent />
        </Suspense>
      </div>
    );
  };

  //Game selector dynamically creates buttons with thumbnails from JSON inventory, allowing for scalable UI injection
  const GameSelector = () => (
    <div className={styles.gameSelectorGrid}>
      {gameList.map(game => (
        <button
          key={game.id}
          className={styles.gameTile}
          onClick={() => setSelectedGameId(game.id)}
        >
          {game.thumbnail && (
            <img
              src={game.thumbnail}
              alt={`${game.title} thumbnail`}
              className={styles.thumbnail}
            />
          )}
          <div className={styles.gameTitle}>🎮 {game.title}</div>
        </button>
      ))}
    </div>
  );

  if (loading) return <div className={styles.loadingContainer}>Loading Math Dashboard...</div>;

  //Topic fallback in case user clicks before sync, fallback to current topicData object
  const topic = topics.find(t => t.id === selectedTopic) || currentTopicData;

  return (
    <div className={styles.mathPageContainer}>
      <Sidebar
        title="Math Learning Hub"
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
        subject="math"
      />

      <div className={styles.mainContent}>
        <div className={styles.contentSection}>
          <TopicHeader
            topic={topic}
            userProgress={userProgress}
            selectedTopic={selectedTopic}
            renderMainProgressBar={renderMainProgressBar}
            gradeLevel={gradeLevel}
            setGradeLevel={setGradeLevel}
            styles={styles}
            subject="math"
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
              tutorName="AI Math Tutor"
              placeholder="Ask me anything about math! I'm here to help you solve problems."
              subject="math"
              user={user}
              isLimited={!isPremium}
            />
          )}

          {learningMode === 'assessment' && (
            <QuizAssessmentTool
              content={currentTopicData?.content || "This section covers key concepts in math."}
              subject="math"
              sectionTitle={currentTopicData?.title || "Math Assessment"}
              topicId={selectedTopic}
              topicData={topic}
              userEmail={user.email}
              isLimited={!isPremium}
            />
          )}

          {learningMode === 'interactive' && (
            <>
              <GameSelector />
              <RenderInteractiveGame />
            </>
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

export default MathDash;
