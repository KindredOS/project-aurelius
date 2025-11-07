// Path: src/components/student/TopicHeader.jsx
// Function: Works as a Flimisy UI element that handles navigation, pass through data and progress with dynamic theming
// Version Update: Auditing file (9.18.25), adding legacy of info comments, and MBTI Passthrough. 

import React, { useState, useEffect } from 'react';
import ContentManager from './ContentManager';
import { fetchUserMBTI, getApiUrl } from '../../api/ApiMaster';
import styles from './TopicHeader.module.css';

const TopicHeader = ({ 
  topic, 
  selectedTopic, 
  renderMainProgressBar, 
  onConceptClick, 
  subject, 
  userEmail 
}) => {
  const [selectedConcept, setSelectedConcept] = useState(null);
  const [progressData, setProgressData] = useState({});
  const [userMBTI, setUserMBTI] = useState(null);

  // Define theme colors based on subject
  const getThemeColors = (subject) => {
    const themes = {
      science: {
        primary: '#3b82f6',      // Blue
        primaryHover: '#2563eb',
        shadow: 'rgba(59, 130, 246, 0.3)',
        progressGradient: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)'
      },
      engineering: {
        primary: '#f59e0b',      // Orange
        primaryHover: '#d97706',
        shadow: 'rgba(245, 158, 11, 0.3)',
        progressGradient: 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)'
      },
      technology: {
        primary: '#8b5cf6',      // Purple
        primaryHover: '#7c3aed',
        shadow: 'rgba(139, 92, 246, 0.3)',
        progressGradient: 'linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%)'
      },
      arts: {
        primary: '#ec4899',      // Pink
        primaryHover: '#db2777',
        shadow: 'rgba(236, 72, 153, 0.3)',
        progressGradient: 'linear-gradient(90deg, #ec4899 0%, #db2777 100%)'
      },
      math: {
        primary: '#ef4444',      // Bold red
        primaryHover: '#dc2626',
        shadow: 'rgba(239, 68, 68, 0.3)',
        progressGradient: 'linear-gradient(135deg, #fef2f2 0%, #ef4444 100%)'
      },
      lifestyle: {
        primary: '#10b981',      // Energetic green
        primaryHover: '#059669',
        shadow: 'rgba(16, 185, 129, 0.3)',
        progressGradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'
      }
    };
    return themes[subject] || themes.science; // Fallback to science
  };

  const themeColors = getThemeColors(subject);

  useEffect(() => {
    const fetchProgressIndex = async () => {
      try {
        const res = await fetch(`${getApiUrl()}/edu/${subject}/user-index?email=${encodeURIComponent(userEmail)}`);
        if (res.ok) {
          const data = await res.json();
          setProgressData(data);
        }
      } catch (err) {
        console.error('Error loading user index:', err);
      }
    };

    if (userEmail && subject) fetchProgressIndex();
  }, [userEmail, subject]);

    useEffect(() => {
    const fetchMBTI = async () => {
      try {
        const mbtiData = await fetchUserMBTI(userEmail);
        setUserMBTI(mbtiData);
      } catch (err) {
        console.error('Error fetching MBTI:', err);
      }
    };

  if (userEmail) fetchMBTI();
}, [userEmail]);

  const saveProgressIndex = async (updated) => {
    try {
      await fetch(`${getApiUrl()}/edu/${subject}/user-index/save`, {
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
    const isObjectConcept = typeof conceptObj === 'object';
    const conceptTitle = isObjectConcept ? conceptObj.title : conceptObj;

    const isCurrentlySelected = selectedConcept && (
      isObjectConcept
        ? selectedConcept.title === conceptTitle
        : selectedConcept === conceptTitle
    );

    const newSelection = isCurrentlySelected ? null : conceptObj;
    setSelectedConcept(newSelection);
    onConceptClick?.(newSelection, index);

    if (!isCurrentlySelected && topic?.id && userEmail) {
      const topicId = topic.id;
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
          style={{ 
            width: `${progress}%`,
            background: themeColors.progressGradient
          }}
        />
      </div>
    );
  };

  if (!topic) return null;

  const isObjectConcepts = topic.concepts && topic.concepts.length > 0 && typeof topic.concepts[0] === 'object';
  const currentProgress = progressData[selectedTopic] || 0;

  return (
    <div 
      className={styles.topicHeaderCard}
      style={{
        '--theme-primary': themeColors.primary,
        '--theme-primary-hover': themeColors.primaryHover,
        '--theme-shadow': themeColors.shadow,
        '--theme-progress-gradient': themeColors.progressGradient
      }}
    >
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

      {/* Content Manager handles everything below this point. Feature stack is Topic Header -> Content Manager -> Adaptive Textbook */}
      {selectedConcept && (
        <ContentManager
          selectedConcept={selectedConcept}
          subject={subject}
          userEmail={userEmail}
          userMBTI={userMBTI}
        />
      )}
    </div>
  );
};

export default TopicHeader;