import React from 'react';
import styles from './StudentHeatmap.module.css';

function StudentHeatmap({ students = [], subject = null }) {
  // 🔎 Debugging: show what data is coming in
  console.group("[StudentHeatmap Debug]");
  console.log("Subject filter:", subject || "(all subjects)");
  console.log("Total students received:", students.length);
  if (students.length > 0) {
    console.log("Sample student object:", students[0]);
  }
  console.groupEnd();

  // === STEP 1: Collect numeric scores from students ===
  const scores = students.map(s => {
    if (typeof s.progress === "number") {
      return s.progress; // already a single % value
    }
    if (typeof s.progress === "object" && s.progress !== null) {
      if (subject && s.progress[subject] !== undefined) {
        return Number(s.progress[subject]) || 0; // subject-specific
      }
      const vals = Object.values(s.progress).map(v => Number(v) || 0);
      return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    }
    return 0; // if nothing present
  });

  // === STEP 2: Calculate overall average ===
  const avg =
    scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

  // === STEP 3: Build per-subject breakdown (only if no subject selected) ===
  let subjectBreakdown = {};
  if (!subject && students.length > 0) {
    students.forEach(s => {
      if (typeof s.progress === "object" && s.progress !== null) {
        Object.entries(s.progress).forEach(([subj, val]) => {
          const num = Number(val) || 0;
          if (!subjectBreakdown[subj]) {
            subjectBreakdown[subj] = { total: 0, count: 0 };
          }
          subjectBreakdown[subj].total += num;
          subjectBreakdown[subj].count += 1;
        });
      }
    });
  }

  const breakdownRows = Object.entries(subjectBreakdown).map(([subj, data]) => {
    const subjAvg = Math.round(data.total / data.count) || 0;
    return (
      <div key={subj} className={styles.breakdownRow}>
        <span className={styles.subjLabel}>{subj}</span>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${subjAvg}%` }}
          />
        </div>
        <span className={styles.subjValue}>{subjAvg}%</span>
      </div>
    );
  });

  // === STEP 4: Render Card ===
  return (
    <div className={styles.card}>
      {/* Top Stat Box */}
      <div className={styles.topStatBox}>
        <div>
          <div className={styles.statLabel}>
            {subject ? `${subject} Avg` : "Performance Avg"}
          </div>
          <span className={styles.statNumber}>{avg}%</span>
        </div>
      </div>

      {/* Title + Description */}
      <h3 className={styles.cardTitle}>Student Performance</h3>
      <span className={styles.cardCategory}>
        {subject ? `Focused on ${subject}` : "Engagement Heatmap"}
      </span>
      <p className={styles.cardDescription}>
        {subject
          ? `Performance view filtered for ${subject}.`
          : "Visual analysis of student activity patterns across subjects and time to help identify learning gaps."}
      </p>

      {/* Subject Breakdown (when no subject filter applied) */}
      {!subject && breakdownRows.length > 0 && (
        <div className={styles.breakdownSection}>
          <h4 className={styles.breakdownTitle}>By Subject</h4>
          {breakdownRows}
        </div>
      )}

      {/* Footer Link */}
      <div className={styles.cardFooter}>
        <span className={styles.viewLink}>Open full heatmap →</span>
      </div>
    </div>
  );
}

export default StudentHeatmap;
