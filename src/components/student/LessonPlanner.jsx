import React, { useEffect, useRef } from 'react';
import styles from './LessonPlanner.module.css';

const LessonPlanner = ({ onClose }) => {
  const overlayRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (overlayRef.current && !overlayRef.current.contains(event.target)) {
        onClose?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className={styles.overlay}>
      <div className={styles.lessonPlannerContainer} ref={overlayRef}>
        <h2>Lesson Planner</h2>
        <p>This is a stub for the lesson planner module. More features coming soon.</p>

        <div className={styles.placeholderSection}>
          <h3>📅 Calendar View</h3>
          <p>Plan your lessons across the week or month.</p>
        </div>

        <div className={styles.placeholderSection}>
          <h3>🧠 Topic Review Builder</h3>
          <p>Create review sessions for previously covered topics.</p>
        </div>

        <div className={styles.placeholderSection}>
          <h3>📚 Curriculum Tracks</h3>
          <p>Organize subjects into structured, progressive tracks.</p>
        </div>

        <div className={styles.placeholderSection}>
          <h3>✅ Assignments & Checklists</h3>
          <p>Track deliverables and upcoming due dates for students.</p>
        </div>

        <div className={styles.placeholderSection}>
          <h3>📊 Analytics Overview</h3>
          <p>Review lesson completion and student engagement stats.</p>
        </div>
      </div>
    </div>
  );
};

export default LessonPlanner;
