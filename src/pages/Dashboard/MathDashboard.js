// MathDashboard.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './MathDashboard.module.css';
import { getMasteryLog } from './mathmodule/utils/LessonEngine';

const mathJokes = [
  "Why was the math book sad? Because it had too many problems.",
  "What did zero say to eight? Nice belt!",
  "Why don’t calculus majors throw house parties? Because you should never drink and derive.",
  "Why was the equal sign so humble? Because it knew it wasn’t less than or greater than anyone else.",
  "What do you call friends who love math? Alge-bros."
];

const conceptTitles = {
  exponents_and_powers: "Exponents and Powers",
  expressions_and_equations: "Expressions and Equations",
  factoring: "Factoring",
  geometry_connections_with_algebra: "Geometry Connections with Algebra",
  inequalities: "Inequalities",
  linear_functions: "Linear Functions",
  rational_expressions: "Rational Expressions",
  ratios_and_proportional_relationships: "Ratios and Proportional Relationships",
  statistics_and_data_representations: "Statistics and Data Representations",
  systems_of_equations: "Systems of Equations"
};

const cardImages = {
  expressions_and_equations: "PlayCardExpressions.png",
  linear_functions: "PlayCardLinear.png",
  inequalities: "PlayCardInequalities.png",
  factoring: "PlayCardFactoring.png",
  exponents_and_powers: "PlayCardExponents.png",
  systems_of_equations: "PlayCardSystems.png",
  rational_expressions: "PlayCardRational.png",
  ratios_and_proportional_relationships: "PlayCardRatios.png",
  functions: "PlayCardFunctions.png",
  geometry_connections_with_algebra: "PlayCardGeometry.png",
  statistics_and_data_representations: "PlayCardStatistics.png"
};

const getBadge = (accuracy) => {
  if (accuracy === 100) return { label: "🏅 Perfect", color: "gold" };
  if (accuracy >= 90) return { label: "🥈 Excellent", color: "silver" };
  if (accuracy >= 75) return { label: "🥉 Great", color: "#cd7f32" };
  if (accuracy >= 50) return { label: "👍 Keep Going", color: "#4caf50" };
  return { label: "📘 Learning", color: "#2196f3" };
};

const MathDashboard = () => {
  const [joke, setJoke] = useState("");
  const [mastery, setMastery] = useState({});
  const [expanded, setExpanded] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const randomJoke = mathJokes[Math.floor(Math.random() * mathJokes.length)];
    setJoke(randomJoke);
    setMastery(getMasteryLog());
  }, []);

  const handleStartLearning = () => {
    navigate("/page/Dashboard/mathmodule/LearningSession");
  };

  const handleDownloadCard = (concept) => {
    const filename = cardImages[concept];
    if (!filename) return;
    const link = document.createElement('a');
    link.href = `/page/Dashboard/mathmodule/assets/${filename}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const groupedByConcept = {};
  Object.entries(mastery).forEach(([key, stats]) => {
    const [concept] = key.split("::");
    if (!groupedByConcept[concept]) groupedByConcept[concept] = [];
    groupedByConcept[concept].push({ key, ...stats });
  });

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Math Learning Hub</h1>
      <p>Click below to begin your personalized math journey:</p>

      <div className={styles.buttonGrid}>
        <button className={styles.button} onClick={handleStartLearning}>Start Learning 🚀</button>
      </div>

      <div className={styles.jokeBox}>
        <p>{joke}</p>
      </div>

      <div className={styles.analyticsSection}>
        <h2>Your Concept Mastery</h2>
        {Object.entries(groupedByConcept).map(([concept, entries]) => {
          const title = conceptTitles[concept] || concept;
          const totalAttempts = entries.reduce((sum, e) => sum + e.attempts, 0);
          const totalCorrect = entries.reduce((sum, e) => sum + e.correct, 0);
          const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
          const badge = getBadge(accuracy);

          return (
            <div key={concept} className={styles.card}>
              <div className={styles.cardHeader} onClick={() => setExpanded(prev => ({ ...prev, [concept]: !prev[concept] }))}>
                <h3>{title}</h3>
                <span>{expanded[concept] ? '▼' : '▶'}</span>
              </div>
              {expanded[concept] && (
                <div className={styles.cardBody}>
                  <p><strong>Attempts:</strong> {totalAttempts}</p>
                  <p><strong>Correct:</strong> {totalCorrect}</p>
                  <p><strong>Accuracy:</strong> {accuracy}%</p>
                  <p><strong>Badge:</strong> <span style={{ backgroundColor: badge.color, color: 'white', padding: '4px 10px', borderRadius: '8px' }}>{badge.label}</span></p>
                  {accuracy >= 75 && cardImages[concept] && (
                    <button className={styles.button} onClick={() => handleDownloadCard(concept)}>
                      🎁 Download Reward Card
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MathDashboard;
