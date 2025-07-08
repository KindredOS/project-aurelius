// components/common/TopicHeader.jsx
import React from 'react';

const TopicHeader = ({ topic, userProgress, selectedTopic, renderMainProgressBar, styles }) => {
  if (!topic) return null;

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
          {topic.concepts.map((concept, index) => (
            <div key={index} className={styles.conceptCard}>
              <div className={styles.conceptText}>{concept}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TopicHeader;
