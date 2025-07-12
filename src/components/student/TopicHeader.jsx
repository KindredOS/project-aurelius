// components/student/TopicHeader.jsx
import React, { useState, useEffect } from 'react';
import AdaptiveTextbook from './AdaptiveTextbook';
import { getApiUrl } from '../../api/ApiMaster';
import { fetchStudentMarkdown, saveStudentMarkdown } from '../../api/Science';
import { polishMarkdown } from '../../utils/polishMarkdown';
import { generateAISection } from '../../utils/genAISection';
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
  const [markdownText, setMarkdownText] = useState('');
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

  useEffect(() => {
    const loadMarkdown = async () => {
      if (selectedConcept?.markdown && subject && userEmail) {
        try {
          // Use the enhanced API function that cleans markdown
          const content = await fetchStudentMarkdown(userEmail, selectedConcept.markdown);
          setMarkdownText(content);
        } catch (err) {
          console.error('Error loading markdown:', err);
          
          // Fallback to public path
          try {
            const publicPath = `/data/${subject}/markdown/${selectedConcept.markdown}`;
            const publicRes = await fetch(publicPath);
            if (publicRes.ok) {
              const fallbackText = await publicRes.text();
              setMarkdownText(fallbackText);
              
              // Save to user's storage
              await saveStudentMarkdown(userEmail, selectedConcept.markdown, fallbackText);
            } else {
              setMarkdownText('Error loading content.');
            }
          } catch (fallbackErr) {
            console.error('Fallback failed:', fallbackErr);
            setMarkdownText('Error loading content.');
          }
        }
      } else {
        setMarkdownText('');
      }
    };

    loadMarkdown();
  }, [selectedConcept, subject, userEmail]);

  const handleEnhance = async (promptText, action) => {
    try {
      const rawAI = await generateAISection(promptText, 'hermes', 750);
      const enhanced = await polishMarkdown({
        text: rawAI,
        action,
        personality: 'default',
        model_key: 'hermes'
      });
      handleMarkdownUpdate(enhanced);
      return enhanced;
    } catch (err) {
      console.error("Enhancement failed:", err);
      return 'Error during enhancement.';
    }
  };

  const handleMarkdownUpdate = async (updatedContent) => {
    setMarkdownText(updatedContent);

    if (selectedConcept?.markdown && userEmail) {
      try {
        await saveStudentMarkdown(userEmail, selectedConcept.markdown, updatedContent);
      } catch (err) {
        console.error('Error saving markdown:', err);
      }
    }
  };

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

      {selectedConcept && (
        <div className={styles.conceptDetailCard}>
          <h3>{selectedConcept.title || selectedConcept}</h3>
          {selectedConcept.markdown ? (
            <AdaptiveTextbook 
              content={markdownText} 
              onEnhance={handleEnhance} 
              onMarkdownUpdate={handleMarkdownUpdate} 
            />
          ) : (
            <p>
              {selectedConcept.content || 
                `Here we'll show details, activities, or lessons for: ${selectedConcept.title || selectedConcept}`
              }
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default TopicHeader;