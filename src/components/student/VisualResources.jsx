// components/common/VisualResources.jsx
import React from 'react';

const VisualResources = ({ resources, styles, title = "Visual Learning Resources" }) => {
  const defaultResources = [
    {
      title: "Interactive Diagrams",
      description: "Explore detailed diagrams",
      color: "green"
    },
    {
      title: "3D Models",
      description: "Rotate and examine 3D structures",
      color: "purple"
    },
    {
      title: "Animations",
      description: "Watch processes in motion",
      color: "yellow"
    },
    {
      title: "Video Lessons",
      description: "Expert explanations and demonstrations",
      color: "red"
    }
  ];

  const resourcesToShow = resources.length > 0 ? resources : defaultResources;

  return (
    <div className={styles.visualResourcesCard}>
      <h3 className={styles.visualResourcesTitle}>{title}</h3>
      <div className={styles.visualResourcesGrid}>
        {resourcesToShow.map((resource, index) => (
          <div key={index} className={`${styles.visualResourceCard} ${styles[resource.color || 'green']}`}>
            <h4 className={styles.resourceTitle}>{resource.title}</h4>
            <p className={styles.resourceDescription}>{resource.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VisualResources;