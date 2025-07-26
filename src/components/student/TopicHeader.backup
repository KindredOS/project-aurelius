// 1. TopicHeader.jsx - ONLY handles navigation and progress
import React, { useState, useEffect } from 'react';
import ContentManager from './ContentManager';
import { getApiUrl } from '../../api/ApiMaster';
import styles from './TopicHeader.module.css';

const TopicHeader = ({ 
  topic, 
  userProgress, 
  selectedTopic, 
  renderMainProgressBar, 
  onConceptClick, 
  subject, 
  userEmail 
}) => {
  const [selectedConcept, setSelectedConcept] = useState(null);
  const [progressData, setProgressData] = useState({});

  useEffect(() => {
    const fetchProgressIndex = async () => {
      try {
        const res = await fetch(`${getApiUrl()}/edu/science/user-index?email=${encodeURIComponent(userEmail)}`);
        if (res.ok) {
          const data = await res.json();
          setProgressData(data);
        }
      } catch (err) {
        console.error('Error loading user index:', err);
      }
    };

    if (userEmail) fetchProgressIndex();
  }, [userEmail]);

  const saveProgressIndex = async (updated) => {
    try {
      await fetch(`${getApiUrl()}/edu/science/user-index/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          progressData: updated
        })
      });
    } catch (err) {
      console.error('Error saving progress index:', err);
    }
  };

  const handleConceptClick = (conceptObj, index) => {
    setSelectedConcept(conceptObj);
    onConceptClick?.(conceptObj, index);

    // Update progress
    const topicId = topic?.id;
    if (topicId && userEmail) {
      const updated = {
        ...progressData,
        [topicId]: Math.min(100, (progressData[topicId] || 0) + 5)
      };
      setProgressData(updated);
      saveProgressIndex(updated);
    }
  };

  const renderProgressBar = (progress) => {
    return (
      <div className={styles.mainProgressBar}>
        <div 
          className={styles.mainProgressFill}
          style={{ width: `${progress}%` }}
        />
      </div>
    );
  };

  if (!topic) return null;

  const isObjectConcepts = topic.concepts && topic.concepts.length > 0 && typeof topic.concepts[0] === 'object';
  const currentProgress = progressData[selectedTopic] || 0;

  return (
    <div className={styles.topicHeaderCard}>
      <div className={styles.topicHeader}>
        <topic.icon className={styles.topicHeaderIcon} />
        <div className={styles.topicHeaderContent}>
          <h2>{topic.name}</h2>
          <p>{topic.description}</p>
        </div>
      </div>

      <div className={styles.topicProgressSection}>
        <div className={styles.progressHeader}>
          <span className={styles.progressLabel}>Progress</span>
          <span className={styles.progressPercentage}>{currentProgress}%</span>
        </div>
        {renderMainProgressBar ? renderMainProgressBar(currentProgress) : renderProgressBar(currentProgress)}
      </div>

      {topic.concepts && topic.concepts.length > 0 && (
        <div className={styles.conceptsGrid}>
          {topic.concepts.map((concept, index) => {
            const conceptTitle = isObjectConcepts ? concept.title : concept;
            const isActive = selectedConcept && (
              isObjectConcepts 
                ? selectedConcept.title === conceptTitle 
                : selectedConcept === conceptTitle
            );

            return (
              <button
                key={index}
                className={`${styles.conceptCard} ${isActive ? styles.activeConcept : ''}`}
                onClick={() => handleConceptClick(concept, index)}
              >
                <div className={styles.conceptText}>{conceptTitle}</div>
              </button>
            );
          })}
        </div>
      )}

      {/* Content Manager handles everything below this point */}
      {selectedConcept && (
        <ContentManager
          selectedConcept={selectedConcept}
          subject={subject}
          userEmail={userEmail}
        />
      )}
    </div>
  );
};

export default TopicHeader;