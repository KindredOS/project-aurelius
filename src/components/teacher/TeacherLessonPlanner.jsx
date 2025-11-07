// Path: src/components/teacher/TeacherLessonPlanner.jsx
// Function: A drop down "catch all" menu for features and functionality ancillary to role function. 
// Version Update: Fixed backend compatibility, data handling, and linting issues

import React, { useEffect, useRef, useState } from "react";
import styles from "./TeacherLessonPlanner.module.css";
import {
  BookOpen,
  Users,
  Plus,
  Copy,
  X,
  UserPlus,
  UserMinus,
  Check,
  AlertCircle,
  Loader2,
  GraduationCap
} from "lucide-react";
import {
  createClassFlow,
  assignStudentFlow,
  removeStudentFlow,
  copyInviteFlow,
  createEmptyClassForm,
  createStateUpdater,
  SUBJECT_OPTIONS,
} from "../../utils/teacherClassHelper";
import { listTeacherClasses } from "../../api/ApiMaster";

const TeacherLessonPlanner = ({ onClose }) => {
  const overlayRef = useRef();
  const modalRef = useRef();

  // --- State ---
  const [state, setState] = useState({
    classes: [],
    showNewClassForm: false,
    isLoading: false,
    error: "",
    message: "",
    ...createEmptyClassForm(),
  });

  const [selectedClass, setSelectedClass] = useState(
    JSON.parse(localStorage.getItem("selectedClassObj")) || null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const stateUpdater = createStateUpdater(setState);
  const teacherEmail = localStorage.getItem("userEmail");

  // --- Close planner if clicking outside (but not when modal is open) ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isModalOpen) return;
      if (overlayRef.current && !overlayRef.current.contains(event.target)) {
        onClose?.();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose, isModalOpen]);

  // --- Close modal if clicking outside modal content ---
  useEffect(() => {
    const handleModalClickOutside = (event) => {
      if (isModalOpen && modalRef.current && !modalRef.current.contains(event.target)) {
        setIsModalOpen(false);
      }
    };
    document.addEventListener("mousedown", handleModalClickOutside);
    return () => document.removeEventListener("mousedown", handleModalClickOutside);
  }, [isModalOpen]);

  // --- Load classes on mount ---
  useEffect(() => {
    const load = async () => {
      if (!teacherEmail) {
        stateUpdater.setError("No teacher email found. Please log in again.");
        return;
      }

      stateUpdater.setLoading(true);
      try {
        const data = await listTeacherClasses(teacherEmail);
        console.log("Raw API response:", data); // Debug log
        stateUpdater.updateClasses(data);
      } catch (err) {
        console.error("Load classes error:", err); // Debug log
        stateUpdater.setError(err);
      } finally {
        stateUpdater.setLoading(false);
      }
    };
    load();
  }, [teacherEmail, stateUpdater]);

  // --- Clear messages after timeout ---
  useEffect(() => {
    if (state.error || state.message) {
      const timer = setTimeout(() => {
        stateUpdater.clearMessages();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [state.error, state.message, stateUpdater]);

  // --- Handlers ---
  const handleCreateClass = () =>
    createClassFlow(teacherEmail, state, stateUpdater);

  const handleAssignStudent = (classCode, inviteCode) =>
    assignStudentFlow(
      teacherEmail,
      classCode,
      inviteCode,
      stateUpdater,
      setSelectedClass
    );

  const handleRemoveStudent = (classCode, email) =>
    removeStudentFlow(teacherEmail, classCode, email, stateUpdater);

  const handleCopyInvite = (code) => copyInviteFlow(code, stateUpdater);

  const handleSelectClass = (cls) => {
    // Ensure we have all necessary data
    const classData = {
      ...cls,
      students: cls.students || []
    };
    
    setSelectedClass(classData);
    setIsModalOpen(true);
    localStorage.setItem("selectedClass", classData.class_code);
    localStorage.setItem("selectedClassObj", JSON.stringify(classData));
  };

  const closeModal = () => setIsModalOpen(false);

  const updateFormField = (field, value) => {
    setState((prev) => ({ ...prev, [field]: value }));
  };

  const showNewClassForm = () =>
    setState((prev) => ({ ...prev, showNewClassForm: true }));

  const hideNewClassForm = () =>
    setState((prev) => ({
      ...prev,
      showNewClassForm: false,
      ...createEmptyClassForm(),
    }));

  // Helper function to safely get student count
  const getStudentCount = (cls) => {
    if (!cls.students) return 0;
    if (Array.isArray(cls.students)) return cls.students.length;
    return cls.current_students || 0;
  };

  // Helper function to get student list for display
  const getStudentList = (cls) => {
    if (!cls.students || !Array.isArray(cls.students)) return [];
    
    // Handle both string format and object format
    return cls.students.map(student => {
      if (typeof student === 'string') {
        return student;
      } else if (student.email) {
        return student.email;
      }
      return String(student);
    });
  };

  // --- Render ---
  return (
    <div className={styles.overlay}>
      <div className={styles.lessonPlannerContainer} ref={overlayRef}>
        <div className={styles.header}>
          <BookOpen className={styles.headerIcon} />
          <h2>Teacher Lesson Planner</h2>
        </div>

        {state.error && (
          <div className={`${styles.message} ${styles.errorMessage}`}>
            <AlertCircle className={styles.messageIcon} />
            {state.error}
          </div>
        )}
        {state.message && (
          <div className={`${styles.message} ${styles.successMessage}`}>
            <Check className={styles.messageIcon} />
            {state.message}
          </div>
        )}
        {state.isLoading && (
          <div className={`${styles.message} ${styles.loadingMessage}`}>
            <Loader2 className={`${styles.messageIcon} ${styles.spinning}`} />
            Loading...
          </div>
        )}

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <Users className={styles.sectionIcon} />
            <h3>My Classes</h3>
          </div>

          {state.classes.map((cls) => {
            const studentCount = getStudentCount(cls);
            return (
              <div
                key={cls.class_code || cls.id}
                className={`${styles.classItem} ${
                  selectedClass?.class_code === cls.class_code
                    ? styles.selected
                    : ""
                }`}
                onClick={() => handleSelectClass(cls)}
              >
                <div className={styles.classContent}>
                  <div className={styles.classInfo}>
                    <div className={styles.classHeader}>
                      <GraduationCap className={styles.classIcon} />
                      <strong>{cls.class_name || cls.name}</strong>
                    </div>
                    <div className={styles.classCode}>
                      {cls.class_code}
                    </div>
                  </div>
                  <div className={styles.classStats}>
                    <Users className={styles.statsIcon} />
                    <span className={styles.classMeta}>
                      {studentCount} {studentCount === 1 ? "student" : "students"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {!state.showNewClassForm ? (
            <button
              className={styles.primaryButton}
              onClick={showNewClassForm}
              disabled={state.isLoading}
            >
              <Plus className={styles.buttonIcon} />
              Create New Class
            </button>
          ) : (
            <div className={styles.newClassForm}>
              <input
                type="text"
                value={state.name}
                onChange={(e) => updateFormField("name", e.target.value)}
                placeholder="Class name"
                className={styles.input}
                disabled={state.isLoading}
              />
              <input
                type="text"
                value={state.inviteCode}
                onChange={(e) => updateFormField("inviteCode", e.target.value)}
                placeholder="Custom invite code (optional)"
                className={styles.input}
                disabled={state.isLoading}
              />
              <select
                value={state.subject}
                onChange={(e) => updateFormField("subject", e.target.value)}
                className={styles.select}
                disabled={state.isLoading}
              >
                {SUBJECT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <div className={styles.actions}>
                <button
                  className={styles.cancelButton}
                  onClick={hideNewClassForm}
                  disabled={state.isLoading}
                >
                  Cancel
                </button>
                <button
                  className={styles.createButton}
                  onClick={handleCreateClass}
                  disabled={state.isLoading || !state.name.trim()}
                >
                  {state.isLoading ? (
                    <Loader2 className={`${styles.buttonIcon} ${styles.spinning}`} />
                  ) : (
                    <Plus className={styles.buttonIcon} />
                  )}
                  Create
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- Student Modal --- */}
      {isModalOpen && selectedClass && (
        <div className={styles.modalOverlay}>
          <div
            className={styles.modalContent}
            ref={modalRef}
          >
            <button className={styles.closeButton} onClick={closeModal}>
              <X className={styles.closeIcon} />
            </button>

            <div className={styles.modalHeader}>
              <BookOpen className={styles.modalTitleIcon} />
              <h3>{selectedClass.class_name}</h3>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.codeSection}>
                <div className={styles.codeLabel}>Class Code:</div>
                <div className={styles.codeValue}>{selectedClass.class_code}</div>
              </div>

              <div className={styles.inviteSection}>
                <div className={styles.inviteHeader}>
                  <div>
                    <div className={styles.codeLabel}>Invite Code:</div>
                    <div className={styles.inviteCode}>
                      {selectedClass.class_code}
                    </div>
                  </div>
                  <button
                    className={styles.copyButton}
                    onClick={() => handleCopyInvite(selectedClass.class_code)}
                  >
                    <Copy className={styles.copyIcon} />
                    Copy
                  </button>
                </div>
              </div>

              <div className={styles.studentsSection}>
                <div className={styles.studentsHeader}>
                  <Users className={styles.studentsIcon} />
                  <h4>Students Enrolled ({getStudentCount(selectedClass)})</h4>
                </div>

                {getStudentCount(selectedClass) > 0 ? (
                  <ul className={styles.studentList}>
                    {getStudentList(selectedClass).map((studentEmail, index) => (
                      <li key={`${studentEmail}-${index}`} className={styles.studentItem}>
                        <span className={styles.studentEmail}>{studentEmail}</span>
                        <button
                          className={styles.removeButton}
                          onClick={() => handleRemoveStudent(selectedClass.class_code, studentEmail)}
                          title={`Remove ${studentEmail}`}
                        >
                          <UserMinus className={styles.removeIcon} />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className={styles.emptyState}>
                    <Users className={styles.emptyIcon} />
                    <p>No students enrolled yet</p>
                  </div>
                )}

                <button
                  className={styles.addStudentButton}
                  onClick={() => handleAssignStudent(
                    selectedClass.class_code,
                    selectedClass.class_code // Use class_code as invite_code
                  )}
                  disabled={state.isLoading}
                >
                  <UserPlus className={styles.buttonIcon} />
                  Add Student
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherLessonPlanner;