// Path: src/pages/Dashboard/DashboardTeacher.jsx

import React, { useState, useEffect } from 'react';
import StudentHeatmap from '../../components/teacher/StudentHeatmap';
import LearningProfileList from '../../components/teacher/LearningProfileList';
import QuickActionsPanel from '../../components/teacher/QuickActionsPanel';
import ProblemSetManager from '../../components/teacher/ProblemSetManager';
import TeacherMBTIModal from '../../components/teacher/TeacherMBTIModal';
import styles from './DashboardTeacher.module.css';

import {
  createTeacherClass,
  listTeacherClasses,
  fetchUserProgress, // unified subject-aware progress fetch
} from '../../api/ApiMaster';

import {
  fetchUserMBTI,
  updateUserData,
} from '../../api/User';

function DashboardTeacher() {
  const [user, setUser] = useState(null);
  const [userMBTI, setUserMBTI] = useState(null);
  const [showMBTIModal, setShowMBTIModal] = useState(false);

  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedClassCode = localStorage.getItem('selectedClass');

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    const userRole = localStorage.getItem('userRole');
    const accessRole = localStorage.getItem('accessRole');
    setUser({
      email: userEmail,
      role: userRole,
      accessRole: accessRole || userRole,
    });
  }, []);

  // === Fetch MBTI ===
  useEffect(() => {
    const loadMBTI = async () => {
      if (!user?.email) return;
      try {
        const data = await fetchUserMBTI(user.email);
        if (data?.mbti) {
          setUserMBTI(data.mbti);
        } else {
          setShowMBTIModal(true);
        }
      } catch (err) {
        console.warn("Failed to fetch teacher MBTI:", err);
      }
    };
    loadMBTI();
  }, [user]);

  const handleSaveMBTI = async (mbtiPayload) => {
    try {
      await updateUserData(user?.email, { mbti: mbtiPayload });
      setUserMBTI(mbtiPayload);
      setShowMBTIModal(false);
    } catch (err) {
      console.error("Failed to save teacher MBTI:", err);
      setShowMBTIModal(false);
    }
  };

  const handleCreateClasses = async (classesPayload) => {
    try {
      await createTeacherClass(user?.email, classesPayload);
      setShowMBTIModal(false);
    } catch (err) {
      console.error("Failed to create class:", err);
      setShowMBTIModal(false);
    }
  };

  // === Normalize Students: attach email + subject/module progress ===
  const normalizeStudents = async (studentList = []) => {
    const promises = studentList.map(async (s) => {
      const email = typeof s === "string" ? s : s.email;
      let progress = {};

      try {
        // Multi-subject: attach raw maps per subject
        const subjects = ["science", "math", "technology", "engineering", "arts", "lifestyle"];
        const results = await Promise.all(subjects.map(sub =>
          fetchUserProgress(sub, email).catch(() => ({}))
        ));

        const subjectScores = {};
        results.forEach((r, idx) => {
          if (r && Object.keys(r).length > 0) {
            subjectScores[subjects[idx]] = r; // full module map
          }
        });
        progress = subjectScores;
      } catch (err) {
        console.warn(`[DashboardTeacher] Failed to fetch progress for ${email}:`, err);
      }

      return {
        email,
        ...(typeof s === "object" ? s : {}),
        progress,
      };
    });

    return Promise.all(promises);
  };

  // === Load Classes + Students ===
  useEffect(() => {
    const loadData = async () => {
      if (!user?.email) return;
      setLoading(true);
      try {
        const data = await listTeacherClasses(user.email);
        const classList = Array.isArray(data) ? data : data.classes || [];
        setClasses(classList);

        let rawStudents = [];
        if (selectedClassCode) {
          const activeClass = classList.find(c => c.class_code === selectedClassCode);
          rawStudents = activeClass?.students || [];
        } else if (classList.length > 1) {
          rawStudents = classList.flatMap(c => c.students || []);
        } else {
          const onlyClass = classList[0];
          rawStudents = onlyClass?.students || [];
        }

        const normalized = await normalizeStudents(rawStudents);
        setStudents(normalized);

        // Debug
        console.group("[DashboardTeacher Debug]");
        console.log("Loaded classes:", classList.length);
        console.log("Selected class:", selectedClassCode || "(none)");
        console.log("Students passed to heatmap:", normalized.length);
        if (normalized.length > 0) {
          console.log("Sample normalized student:", normalized[0]);
        }
        console.groupEnd();
      } catch (err) {
        setError(`Failed to load dashboard: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user, selectedClassCode]);

  if (!user) return <div>Loading...</div>;

  return (
    <div className={styles.dashboardContainer}>
      {/* Header Strip */}
      <div className={styles.headerStrip}>
        {selectedClassCode ? (
          <p>
            Active Class:{' '}
            <span className={styles.activeClass}>
              {classes.find((c) => c.class_code === selectedClassCode)?.class_name ||
                selectedClassCode}
            </span>
          </p>
        ) : classes.length > 1 ? (
          <p>All Classes — Quick Overview</p>
        ) : classes.length === 1 ? (
          <p>
            Active Class:{' '}
            <span className={styles.activeClass}>{classes[0].class_name}</span>
          </p>
        ) : (
          <p className={styles.info}>
            👩‍🏫 No classes yet — create your first class in the Lesson Planner.
          </p>
        )}
      </div>

      {loading && <p className={styles.loading}>Loading...</p>}
      {error && <p className={styles.error}>{error}</p>}

      {/* 3-card layout */}
      <div className={styles.horizontalLayout}>
        <StudentHeatmap
          user={user}
          students={students}
        />
        <LearningProfileList user={user} students={students} mbti={userMBTI} />
        <div className={styles.disabled}>
          <ProblemSetManager user={user} students={students} />
        </div>
      </div>

      {/* Footer Quick Actions */}
      <div className={styles.footerMenu}>
        <QuickActionsPanel user={user} onOpenMBTI={() => setShowMBTIModal(true)} />
      </div>

      {showMBTIModal && (
        <TeacherMBTIModal
          user={user}
          onClose={() => setShowMBTIModal(false)}
          onSaveMBTI={handleSaveMBTI}
          onCreateClasses={handleCreateClasses}
        />
      )}
    </div>
  );
}

export default DashboardTeacher;