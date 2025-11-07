// AdminLessonPlanner.jsx
import React, { useEffect, useRef, useState } from "react";
import styles from "./AdminLessonPlanner.module.css";

const AdminLessonPlanner = ({ onClose }) => {
  const overlayRef = useRef();

  // --- Mock state ---
  const [teachers, setTeachers] = useState([
    { id: 1, name: "Alice Johnson", classes: 3 },
    { id: 2, name: "Mark Thompson", classes: 2 },
  ]);
  const [schoolClasses, setSchoolClasses] = useState([
    { id: 101, name: "Algebra I", teacher: "Alice Johnson" },
    { id: 102, name: "World History", teacher: "Mark Thompson" },
  ]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (overlayRef.current && !overlayRef.current.contains(event.target)) {
        onClose?.();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // --- Handlers ---
  const handleAddTeacher = () => {
    const newTeacher = {
      id: Date.now(),
      name: `New Teacher ${teachers.length + 1}`,
      classes: 0,
    };
    setTeachers((prev) => [...prev, newTeacher]);
  };

  const handleAddClass = () => {
    const newClass = {
      id: Date.now(),
      name: `New Class ${schoolClasses.length + 1}`,
      teacher: "Unassigned",
    };
    setSchoolClasses((prev) => [...prev, newClass]);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.lessonPlannerContainer} ref={overlayRef}>
        <h2 className={styles.title}>🏫 Admin Lesson Planner</h2>
        <p className={styles.subtitle}>
          Manage teachers, school-wide classes, and system tools.
        </p>

        {/* Manage Teachers */}
        <div className={styles.section}>
          <h3>👨‍🏫 Manage Teachers</h3>
          {teachers.map((t) => (
            <div key={t.id} className={styles.item}>
              {t.name} — {t.classes} classes
            </div>
          ))}
          <button className={styles.primaryButton} onClick={handleAddTeacher}>
            + Add Teacher
          </button>
        </div>

        {/* School-wide Classes */}
        <div className={styles.section}>
          <h3>📚 School-wide Classes</h3>
          {schoolClasses.map((c) => (
            <div key={c.id} className={styles.item}>
              {c.name} — Teacher: {c.teacher}
            </div>
          ))}
          <button className={styles.primaryButton} onClick={handleAddClass}>
            + Add Class
          </button>
        </div>

        {/* Analytics Dashboard (stubbed) */}
        <div className={`${styles.section} ${styles.stub}`}>
          <h3>📊 Analytics Dashboard</h3>
          <p>Stub — track overall performance, engagement, and outcomes.</p>
        </div>

        {/* Reports (stubbed) */}
        <div className={`${styles.section} ${styles.stub}`}>
          <h3>📝 Reports</h3>
          <p>Stub — generate and export school-wide reports.</p>
        </div>

        {/* System Tools (stubbed) */}
        <div className={`${styles.section} ${styles.stub}`}>
          <h3>🛠 System Tools</h3>
          <p>Stub — manage invite codes, reset school year, configure settings.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLessonPlanner;
