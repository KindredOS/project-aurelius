import React, { useState, useEffect } from 'react';
import styles from './AchievementsCard.module.css';

const AchievementsCard = ({ achievements = [], subject = 'all' }) => {
  const [selected, setSelected] = useState(null);
  const [enlargedImage, setEnlargedImage] = useState(null);
  const [allAchievements, setAllAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const response = await fetch('/assets/achievements.json');
        if (!response.ok) throw new Error('Failed to fetch achievement data');
        const data = await response.json();
        setAllAchievements(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchAchievements();
  }, []);

  const isUnlocked = (id) => {
    if (Array.isArray(achievements)) {
      return achievements.some((achievement) =>
        typeof achievement === 'string' ? achievement === id : achievement.key === id
      );
    }
    return false;
  };

  const unlockedCount = allAchievements.filter(badge => isUnlocked(badge.id)).length;
  
  const handlePlaySound = () => {
    const audio = new Audio('/assets/unlock.mp3');
    audio.play().catch(() => {});
  };

  const handleClickBadge = (badge) => {
    if (isUnlocked(badge.id)) {
      handlePlaySound();
      setSelected(badge);
    }
  };

  const downloadImage = (src) => {
    const link = document.createElement('a');
    link.href = src;
    link.download = 'achievement.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredBadges = allAchievements
    .filter(badge => subject === 'all' || badge.category === subject)
    .sort((a, b) => {
      const aUnlocked = isUnlocked(a.id);
      const bUnlocked = isUnlocked(b.id);
      if (aUnlocked === bUnlocked) return 0;
      return aUnlocked ? -1 : 1;
    });

  if (loading) {
    return (
      <div className={styles.achievementsCard}>
        <p>Loading achievements...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={styles.achievementsCard}>
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className={styles.achievementsCard}>
      <div className={styles.progressHeader}>
        <h2>Your Achievements</h2>
        <div className={styles.progressSection}>
          <span className={styles.progressText}>
            {unlockedCount} of {allAchievements.length} earned
          </span>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill} 
              style={{ width: `${Math.round((unlockedCount / allAchievements.length) * 100)}%` }} 
            />
          </div>
        </div>
      </div>

      <div className={styles.badgeGrid}>
        {filteredBadges.map((badge) => (
          <div
            key={badge.id}
            className={`${styles.badge} ${isUnlocked(badge.id) ? styles.unlocked : styles.locked}`}
            onClick={() => handleClickBadge(badge)}
          >
            <img
              src={isUnlocked(badge.id) ? badge.image : '/assets/Eduos_Generic.png'}
              alt={badge.name}
              className={styles.badgeImage}
              onError={(e) => {
                e.target.src = '/assets/Eduos_Generic.png';
              }}
              onDoubleClick={() => isUnlocked(badge.id) && setEnlargedImage(badge.image)}
            />
            <span>{badge.name}</span>
          </div>
        ))}
      </div>

      {unlockedCount === 0 && (
        <div className={styles.encouragementText}>
          <p>Keep learning and exploring to unlock your first badge. Try completing a quiz or maintaining a study streak!</p>
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
                e.target.src = '/assets/Eduos_Generic.png';
              }}
            />
            <h3>{selected.name}</h3>
            <p>{selected.description}</p>
            <button onClick={() => window.print()}>Print Certificate</button>
            <button onClick={() => downloadImage(selected.image)}>Download Badge</button>
          </div>
        </div>
      )}

      {enlargedImage && (
        <div className={styles.modal} onClick={() => setEnlargedImage(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <img
              src={enlargedImage}
              alt="Enlarged Badge"
              style={{ width: '100%', height: 'auto', borderRadius: '12px' }}
              onError={(e) => {
                e.target.src = '/assets/Eduos_Generic.png';
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AchievementsCard;