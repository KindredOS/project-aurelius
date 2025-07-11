// components/student/TopicHeader.jsx
import React, { useState, useEffect } from 'react';
import AdaptiveTextbook from './AdaptiveTextbook';
import { getApiUrl } from '../../api/ApiMaster';
import { polishMarkdown } from '../../utils/polishMarkdown';
import { generateAISection } from '../../utils/genAISection';

const TopicHeader = ({ topic, userProgress, selectedTopic, renderMainProgressBar, styles, onConceptClick, subject, userEmail }) => {
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
        const encodedFilepath = encodeURIComponent(`${selectedConcept.markdown}`);
        const encodedEmail = encodeURIComponent(userEmail);
        const apiUrl = `${getApiUrl()}/edu/science/markdown?email=${encodedEmail}&filepath=${encodedFilepath}`;

        try {
          const res = await fetch(apiUrl);
          if (res.ok) {
            const text = await res.text();
            setMarkdownText(text);
          } else {
            const publicPath = `/data/${subject}/markdown/${selectedConcept.markdown}`;
            console.log("Public path attempt:", publicPath);
            const publicRes = await fetch(publicPath);
            if (!publicRes.ok) throw new Error('Public markdown not found');
            const fallbackText = await publicRes.text();
            setMarkdownText(fallbackText);

            await fetch(`${getApiUrl()}/edu/science/markdown/save`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: userEmail,
                filepath: selectedConcept.markdown,
                content: fallbackText
              })
            });
          }
        } catch (err) {
          console.error('Error loading markdown fallback:', err);
          setMarkdownText('Error loading content.');
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

    await fetch(`${getApiUrl()}/edu/science/markdown/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userEmail,
        filepath: selectedConcept.markdown,
        content: updatedContent
      })
    });
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
    if (topicId) {
      const updated = {
        ...progressData,
        [topicId]: Math.min(100, (progressData[topicId] || 0) + 5)
      };
      setProgressData(updated);
      saveProgressIndex(updated);
    }
  };

  if (!topic) return null;

  const isObjectConcepts = topic.concepts.length > 0 && typeof topic.concepts[0] === 'object';

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
          <span className={styles.progressPercentage}>{progressData[selectedTopic] || 0}%</span>
        </div>
        {renderMainProgressBar(progressData[selectedTopic] || 0)}
      </div>

      {topic.concepts && (
        <div className={styles.conceptsGrid}>
          {topic.concepts.map((concept, index) => {
            const conceptTitle = isObjectConcepts ? concept.title : concept;
            return (
              <button
                key={index}
                className={`${styles.conceptCard} ${selectedConcept?.title === conceptTitle ? styles.activeConcept : ''}`}
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
            <AdaptiveTextbook content={markdownText} onEnhance={handleEnhance} onMarkdownUpdate={handleMarkdownUpdate} />
          ) : (
            <p>{selectedConcept.content || `Here we'll show details, activities, or lessons for: ${selectedConcept.title || selectedConcept}`}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default TopicHeader;
