// components/student/TopicHeader.jsx
import React, { useState, useEffect } from 'react';
import AdaptiveTextbook from './AdaptiveTextbook';
import { getApiUrl } from '../../api/ApiMaster';

const TopicHeader = ({ topic, userProgress, selectedTopic, renderMainProgressBar, styles, onConceptClick, subject, userEmail }) => {
  const [selectedConcept, setSelectedConcept] = useState(null);
  const [markdownText, setMarkdownText] = useState('');

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
            // fallback to public version and push to backend
            const publicPath = `/data/${subject}/markdown/${selectedConcept.markdown}`;
            const publicRes = await fetch(publicPath);
            if (!publicRes.ok) throw new Error('Public markdown not found');
            const fallbackText = await publicRes.text();
            setMarkdownText(fallbackText);

            // save to backend for first-time mirror
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

  const handleEnhance = async (headerText, action) => {
    try {
      const response = await fetch(`${getApiUrl()}/enhanceMarkdown`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: headerText, action, personality: 'default' })
      });
      const data = await response.json();

      await fetch(`${getApiUrl()}/edu/science/markdown/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          filepath: selectedConcept.markdown,
          content: data.result
        })
      });

      return data.result;
    } catch (error) {
      console.error('Enhancement error:', error);
      return 'Error enhancing content.';
    }
  };

  if (!topic) return null;

  const handleConceptClick = (conceptObj, index) => {
    setSelectedConcept(conceptObj);
    onConceptClick?.(conceptObj, index);
  };

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
          <span className={styles.progressPercentage}>{userProgress[selectedTopic] || 0}%</span>
        </div>
        {renderMainProgressBar(userProgress[selectedTopic] || 0)}
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
            <AdaptiveTextbook content={markdownText} onEnhance={handleEnhance} />
          ) : (
            <p>{selectedConcept.content || `Here we’ll show details, activities, or lessons for: ${selectedConcept.title || selectedConcept}`}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default TopicHeader;
