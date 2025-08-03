import React, { useState } from 'react';
import styles from './AchievementsCard.module.css';

const AchievementsCard = ({ achievements = [] }) => {
  const [selected, setSelected] = useState(null);

  const allAchievements = [
    { id: 'science_master', name: 'Science Master', image: '/badges/science_master.png', description: 'Completed all science modules' },
    { id: 'quiz_pro', name: 'Quiz Pro', image: '/badges/quiz_pro.png', description: 'Scored 90%+ on 5 quizzes' },
    { id: 'curiosity', name: 'Curiosity Badge', image: '/badges/curiosity.png', description: 'Asked 10 great questions' },
    { id: 'streak_master', name: 'Streak Master', image: '/badges/streak_master.png', description: 'Maintained 7-day study streak' },
    { id: 'science_scholar', name: 'Science Scholar', image: '/badges/science_scholar.png', description: 'Excelled in science assessments' },
    { id: 'explorer', name: 'Explorer', image: '/badges/explorer.png', description: 'Visited all learning modes' },
  ];

  // Handle both array of strings and array of objects
  const isUnlocked = (id) => {
    if (Array.isArray(achievements)) {
      return achievements.some(achievement => 
        typeof achievement === 'string' ? achievement === id : achievement.key === id
      );
    }
    return false;
  };

  const unlockedCount = allAchievements.filter(badge => isUnlocked(badge.id)).length;
  const progressPercentage = Math.round((unlockedCount / allAchievements.length) * 100);

  return (
    <div className={styles.achievementsCard}>
      <div className={styles.progressHeader}>
        <h2>Your Achievements</h2>
        <div>
          <span className={styles.progressText}>
            {unlockedCount} of {allAchievements.length} earned
          </span>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill} 
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {unlockedCount === 0 ? (
        <div className={styles.emptyState}>
          <h3>No achievements yet!</h3>
          <p>Keep learning and exploring to unlock your first badge. Try completing a quiz or maintaining a study streak!</p>
        </div>
      ) : (
        <div className={styles.badgeGrid}>
          {allAchievements.map((badge) => (
            <div
              key={badge.id}
              className={`${styles.badge} ${isUnlocked(badge.id) ? styles.unlocked : styles.locked}`}
              onClick={() => isUnlocked(badge.id) && setSelected(badge)}
            >
              <img 
                src={badge.image} 
                alt={badge.name} 
                className={styles.badgeImage}
                onError={(e) => {
                  // Fallback for missing images
                  e.target.src = '/badges/placeholder.png';
                }}
              />
              <span>{badge.name}</span>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className={styles.modal} onClick={() => setSelected(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <img 
              src={selected.image} 
              alt={selected.name} 
              className={styles.modalImage}
              onError={(e) => {
                e.target.src = '/badges/placeholder.png';
              }}
            />
            <h3>{selected.name}</h3>
            <p>{selected.description}</p>
            <button onClick={() => window.print()}>Download Certificate</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AchievementsCard;
