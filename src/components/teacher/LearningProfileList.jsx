import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Brain, Users, BookOpen, FlaskConical, RotateCcw, HelpCircle, Eye, List } from 'lucide-react';
import styles from './LearningProfileList.module.css';
import { fetchUserMBTI } from '../../api/User';

function LearningProfileList({ students = [], user, mbti: teacherMBTI }) {
  const [studentProfiles, setStudentProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('overview'); // 'overview' or 'detailed'

  // MBTI compatibility matrix (simplified)
  const compatibilityMatrix = useMemo(() => ({
    'NT': ['NT', 'NF'], // Analysts work well with Analysts and Diplomats
    'NF': ['NF', 'NT'], // Diplomats work well with Diplomats and Analysts
    'SJ': ['SJ', 'SP'], // Sentinels work well with Sentinels and Explorers
    'SP': ['SP', 'SJ']  // Explorers work well with Explorers and Sentinels
  }), []);

  // Learning style mapping based on MBTI
  const getLearningStyle = useCallback((mbtiType) => {
    if (!mbtiType) return 'Unknown';
    
    const type = mbtiType.toUpperCase();
    
    // Analysts (NT)
    if (type.includes('NT') || ['INTJ', 'INTP', 'ENTJ', 'ENTP'].includes(type)) {
      return 'Conceptual';
    }
    // Diplomats (NF)
    if (type.includes('NF') || ['INFJ', 'INFP', 'ENFJ', 'ENFP'].includes(type)) {
      return 'Collaborative';
    }
    // Sentinels (SJ)
    if (type.includes('SJ') || ['ISTJ', 'ISFJ', 'ESTJ', 'ESFJ'].includes(type)) {
      return 'Structured';
    }
    // Explorers (SP)
    if (type.includes('SP') || ['ISTP', 'ISFP', 'ESTP', 'ESFP'].includes(type)) {
      return 'Experiential';
    }
    
    return 'Adaptive';
  }, []);

  // Get MBTI temperament
  const getTemperament = useCallback((mbtiType) => {
    if (!mbtiType) return 'Unknown';
    const type = mbtiType.toUpperCase();
    
    if (['INTJ', 'INTP', 'ENTJ', 'ENTP'].includes(type)) return 'NT';
    if (['INFJ', 'INFP', 'ENFJ', 'ENFP'].includes(type)) return 'NF';
    if (['ISTJ', 'ISFJ', 'ESTJ', 'ESFJ'].includes(type)) return 'SJ';
    if (['ISTP', 'ISFP', 'ESTP', 'ESFP'].includes(type)) return 'SP';
    return 'Unknown';
  }, []);

  // Calculate compatibility score
  const getCompatibilityScore = useCallback((studentMBTI, teacherMBTI) => {
    if (!studentMBTI || !teacherMBTI) return 0;
    
    const studentTemp = getTemperament(studentMBTI);
    const teacherTemp = getTemperament(teacherMBTI);
    
    if (studentTemp === teacherTemp) return 100;
    if (compatibilityMatrix[teacherTemp]?.includes(studentTemp)) return 80;
    return 60;
  }, [getTemperament, compatibilityMatrix]);

  // Load student MBTI profiles
  useEffect(() => {
    const loadProfiles = async () => {
      if (!students || students.length === 0) {
        setStudentProfiles([]);
        return;
      }

      setLoading(true);
      const profiles = [];

      for (const student of students) {
        const email = typeof student === 'string' ? student : student.email;
        const name = typeof student === 'object' && student.name ? student.name : email.split('@')[0];
        
        const studentData = {
          email,
          name,
          mbti: null,
          learningStyle: 'Unknown',
          compatibility: 0,
          progress: typeof student === 'object' ? student.progress : 0
        };

        try {
          const profile = await fetchUserMBTI(email);
          if (profile?.mbti) {
            studentData.mbti = profile.mbti;
            studentData.learningStyle = getLearningStyle(profile.mbti);
            studentData.compatibility = getCompatibilityScore(profile.mbti, teacherMBTI);
          }
        } catch (err) {
          console.warn(`Failed to fetch MBTI for ${email}:`, err.message);
        }

        profiles.push(studentData);
      }

      setStudentProfiles(profiles);
      setLoading(false);
    };

    loadProfiles();
  }, [students, teacherMBTI, getLearningStyle, getCompatibilityScore]);

  // Analytics calculations
  const analytics = useMemo(() => {
    const profilesWithMBTI = studentProfiles.filter(p => p.mbti);
    const totalProfiles = profilesWithMBTI.length;
    
    // Learning style distribution
    const styleDistribution = {};
    profilesWithMBTI.forEach(p => {
      styleDistribution[p.learningStyle] = (styleDistribution[p.learningStyle] || 0) + 1;
    });

    // Average compatibility
    const avgCompatibility = totalProfiles > 0 
      ? Math.round(profilesWithMBTI.reduce((sum, p) => sum + p.compatibility, 0) / totalProfiles)
      : 0;

    // Most common learning style
    const mostCommonStyle = Object.entries(styleDistribution)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Unknown';

    return {
      totalProfiles,
      avgCompatibility,
      mostCommonStyle,
      styleDistribution,
      profilesWithMBTI
    };
  }, [studentProfiles]);

  // Get learning style icon
  const getStyleIcon = (style) => {
    const iconProps = { size: 16, className: styles.styleIconSvg };
    const icons = {
      'Conceptual': <Brain {...iconProps} />,
      'Collaborative': <Users {...iconProps} />,
      'Structured': <BookOpen {...iconProps} />,
      'Experiential': <FlaskConical {...iconProps} />,
      'Adaptive': <RotateCcw {...iconProps} />,
      'Unknown': <HelpCircle {...iconProps} />
    };
    return icons[style] || <HelpCircle {...iconProps} />;
  };

  if (loading) {
    return (
      <div className={styles.card}>
        <div className={styles.topStatBox}>
          <div>
            <div className={styles.statLabel}>Loading...</div>
            <span className={styles.statNumber}>...</span>
          </div>
        </div>
        <h3 className={styles.cardTitle}>Learning Profiles</h3>
        <span className={styles.cardCategory}>Loading student data...</span>
        <div className={styles.cardFooter}>
          <span className={styles.viewLinkDisabled}>Please wait...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.topStatBox}>
        <div>
          <div className={styles.statLabel}>
            {viewMode === 'overview' ? 'Avg Compatibility' : 'Profiles Loaded'}
          </div>
          <span className={styles.statNumber}>
            {viewMode === 'overview' ? `${analytics.avgCompatibility}%` : analytics.totalProfiles}
          </span>
        </div>
        <div className={styles.statSecondary}>
          {viewMode === 'overview' ? (
            <div className={styles.mostCommonStyle}>
              <span className={styles.styleIcon}>{getStyleIcon(analytics.mostCommonStyle)}</span>
              <span className={styles.styleName}>{analytics.mostCommonStyle}</span>
            </div>
          ) : (
            <div className={styles.compatibilityIndicator}>
              {analytics.avgCompatibility >= 80 ? '🎢' : analytics.avgCompatibility >= 60 ? '🎡' : '📴'}
            </div>
          )}
        </div>
      </div>

      <h3 className={styles.cardTitle}>Learning Profiles</h3>
      <span className={styles.cardCategory}>
        {teacherMBTI ? `Teacher: ${teacherMBTI} • Student Compatibility` : 'MBTI Analysis'}
      </span>

      {viewMode === 'overview' ? (
        <div className={styles.overviewContent}>
          {analytics.totalProfiles === 0 ? (
            <p className={styles.cardDescription}>
              No student MBTI profiles available. Encourage students to complete their personality assessments.
            </p>
          ) : (
            <div className={styles.styleDistribution}>
              <h4 className={styles.sectionTitle}>Learning Styles</h4>
              <div className={styles.styleGrid}>
                {Object.entries(analytics.styleDistribution).map(([style, count]) => (
                  <div key={style} className={styles.styleCard}>
                    <span className={styles.styleIcon}>{getStyleIcon(style)}</span>
                    <span className={styles.styleName}>{style}</span>
                    <span className={styles.styleCount}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.detailedView}>
          {studentProfiles.length === 0 ? (
            <p className={styles.cardDescription}>No students enrolled in this class.</p>
          ) : (
            <div className={styles.scrollableTable}>
              <div className={styles.profileTable}>
                <div className={styles.tableHeader}>
                  <span>Student</span>
                  <span>MBTI</span>
                  <span>Style</span>
                  <span>Match</span>
                </div>
                <div className={styles.tableBody}>
                  {studentProfiles.map((student, idx) => (
                    <div key={student.email} className={styles.tableRow}>
                      <span className={styles.studentName} title={student.email}>
                        {student.name}
                      </span>
                      <span className={styles.mbtiType}>
                        {student.mbti || '—'}
                      </span>
                      <span className={styles.learningStyle}>
                        <span className={styles.styleIcon}>{getStyleIcon(student.learningStyle)}</span>
                        {student.learningStyle}
                      </span>
                      <span 
                        className={styles.compatibilityScore}
                      >
                        {student.mbti && teacherMBTI && student.compatibility > 0 
                          ? `${student.compatibility}%` 
                          : student.mbti && !teacherMBTI 
                            ? 'No teacher MBTI'
                            : 'Not taken'
                        }
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className={styles.cardFooter}>
        <button
          className={styles.viewButton}
          onClick={() => setViewMode('overview')}
          disabled={viewMode === 'overview'}
        >
          <Eye size={16} />
          Overview
        </button>
        <button
          className={styles.viewButton}
          onClick={() => setViewMode('detailed')}
          disabled={viewMode === 'detailed'}
        >
          <List size={16} />
          Details
        </button>
      </div>
    </div>
  );
}

export default LearningProfileList;