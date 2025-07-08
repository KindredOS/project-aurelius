// components/student/Sidebar.jsx
import React from 'react';
import { Star, ChevronRight, Trophy } from 'lucide-react';

const Sidebar = ({ 
  title, 
  studyStreak, 
  gradeLevel, 
  setGradeLevel, 
  learningMode, 
  setLearningMode, 
  learningModes, 
  topics, 
  selectedTopic, 
  setSelectedTopic, 
  userProgress, 
  achievements, 
  renderProgressBar,
  styles 
}) => {
  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <h1 className={styles.sidebarTitle}>{title}</h1>
        <div className={styles.studyStreak}>
          <Star className={styles.streakIcon} />
          {studyStreak} day streak
        </div>
      </div>

      {/* Grade Level Selector */}
      <div className={styles.gradeLevelSection}>
        <label className={styles.sectionLabel}>Grade Level</label>
        <select
          value={gradeLevel}
          onChange={(e) => setGradeLevel(Number(e.target.value))}
          className={styles.gradeSelect}
        >
          {[6, 7, 8, 9, 10, 11, 12].map(grade => (
            <option key={grade} value={grade}>Grade {grade}</option>
          ))}
        </select>
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
          {learningModes.map(mode => (
            <button
              key={mode.id}
              onClick={() => setLearningMode(mode.id)}
              className={`${styles.learningModeButton} ${learningMode === mode.id ? styles.active : ''}`}
            >
              <div className={styles.modeContent}>
                {mode.icon && <mode.icon className={styles.modeIcon} />}
                <div className={styles.modeDetails}>
                  <div className={styles.modeName}>{mode.name}</div>
                  <div className={styles.modeDescription}>{mode.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Achievements */}
      {achievements.length > 0 && (
        <div className={styles.achievementsSection}>
          <h3 className={styles.achievementsTitle}>Achievements</h3>
          <div className={styles.achievementsList}>
            {achievements.map((achievement, index) => (
              <div key={index} className={styles.achievementBadge}>
                <Trophy className={styles.achievementIcon} />
                {achievement.name || 'Achievement'}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
