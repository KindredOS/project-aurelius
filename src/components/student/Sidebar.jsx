// Path: components/student/Sidebar.jsx
// Focus: Navigation sidebar for student dashboard - displays topics with progress tracking, learning mode tools, and achievements access
// Version Update Notes: Made fully self-contained - all learning modes now defined locally for better developer experience. No more hunting in lessonUtils for UI changes!

import React, { useEffect, useState } from 'react';
import { Star, ChevronRight, Trophy, MessageSquare, Gamepad2, Eye, Brain } from 'lucide-react';
import { fetchUserProgress } from '../../api/ApiMaster';

// Hardcoded learning modes (AI Tutor is already first)
const LEARNING_MODES = [
  {
    id: 'collaborative',
    name: 'AI Tutor',
    description: 'Ask questions, get answers, and explore ideas with your intelligent assistant.',
    icon: MessageSquare
  },
  {
    id: 'interactive',
    name: 'Play & Learn',
    description: 'Dive into games, challenges, and interactive tools to reinforce key concepts.',
    icon: Gamepad2
  },
  {
    id: 'visual',
    name: 'Coming Soon',
    description: 'Visual journeys and media-rich experiences are on the way!',
    icon: Eye,
    disabled: true
  },
  {
    id: 'assessment',
    name: 'Quiz Yourself!',
    description: 'Test your knowledge with fun quizzes and challenges.',
    icon: Brain
  }
];

const Sidebar = ({ 
  title, 
  studyStreak, 
  learningMode, 
  setLearningMode, 
  topics, 
  selectedTopic, 
  setSelectedTopic, 
  email,
  subject,
  achievements, 
  renderProgressBar,
  styles 
}) => {
  const [userProgress, setUserProgress] = useState({});

  useEffect(() => {
    async function loadProgress() {
      if (!email || !subject) return;
      const data = await fetchUserProgress(subject, email);
      setUserProgress(data);
    }
    loadProgress();
  }, [email, subject]);

  // Set default learning mode to "AI Tutor" (collaborative)
  useEffect(() => {
    if (!learningMode) {
      setLearningMode('collaborative');
    }
  }, [learningMode, setLearningMode]);

  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <h1 className={styles.sidebarTitle}>{title}</h1>
        <div className={styles.studyStreak}>
          <Star className={styles.streakIcon} />
          {studyStreak} day streak
        </div>
      </div>

      {/* Topics */}
      <div className={styles.topicsSection}>
        <h2 className={styles.topicsTitle}>Topics</h2>
        <div className={styles.topicsList}>
          {topics.map(topic => (
            <button
              key={topic.id}
              onClick={() => setSelectedTopic(topic.id)}
              className={`${styles.topicButton} ${selectedTopic === topic.id ? styles.active : ''}`}
            >
              <div className={styles.topicContent}>
                <div className={styles.topicInfo}>
                  <topic.icon className={styles.topicIcon} />
                  <span className={styles.topicName}>{topic.name}</span>
                </div>
                <div className={styles.topicProgress}>
                  <span className={styles.progressText}>{userProgress[topic.id] || 0}%</span>
                  <ChevronRight className={styles.chevronIcon} />
                </div>
              </div>
              <div>
                {renderProgressBar(userProgress[topic.id] || 0)}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tools and Assessments */}
      <div className={styles.learningModeSection}>
        <label className={styles.sectionLabel}>Tools and Assessments</label>
        <div className={styles.learningModeList}>
          {LEARNING_MODES.map(mode => (
            <button
              key={mode.id}
              onClick={() => !mode.disabled && setLearningMode(learningMode === mode.id ? null : mode.id)}
              className={`${styles.learningModeButton} ${learningMode === mode.id ? styles.active : ''} ${mode.disabled ? styles.disabled : ''}`}
              disabled={mode.disabled}
            >
              <div className={styles.modeContent}>
                <mode.icon className={styles.modeIcon} />
                <div className={styles.modeDetails}>
                  <div className={styles.modeName}>{mode.name}</div>
                  <div className={styles.modeDescription}>{mode.description}</div>
                </div>
              </div>
            </button>
          ))}

          {/* View Achievements Button */}
          <button
            onClick={() => setLearningMode('achievements')}
            className={`${styles.learningModeButton} ${learningMode === 'achievements' ? styles.active : ''}`}
          >
            <div className={styles.modeContent}>
              <Trophy className={styles.modeIcon} />
              <div className={styles.modeDetails}>
                <div className={styles.modeName}>View Achievements</div>
                <div className={styles.modeDescription}>See all your unlocked badges ({achievements.length} earned)</div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
