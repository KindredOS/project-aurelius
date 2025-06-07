import React from 'react';
import styles from './DashboardTeacher.module.css';

// Stub Components
function StudentHeatmap() {
  return <div className={styles.section}>[Heatmap Component Placeholder]</div>;
}

function LearningProfileList() {
  return <div className={styles.section}>[Learning Profiles Component Placeholder]</div>;
}

function ProblemSetManager() {
  const [formData, setFormData] = React.useState({
    question: '',
    answer: '',
    concept: '',
    difficulty: '',
    type: ''
  });
  const [savedProblems, setSavedProblems] = React.useState([]);

  React.useEffect(() => {
    const saved = localStorage.getItem('teacherContributions');
    if (saved) {
      setSavedProblems(JSON.parse(saved));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newProblem = { ...formData, id: `T-${Date.now()}` };
    const updated = [...savedProblems, newProblem];
    setSavedProblems(updated);
    localStorage.setItem('teacherContributions', JSON.stringify(updated));
    setFormData({ question: '', answer: '', concept: '', difficulty: '', type: '' });
  };

  return (
    <div className={styles.section}>
      <form onSubmit={handleSubmit}>
        <label>Question:<br />
          <input name="question" value={formData.question} onChange={handleChange} required />
        </label><br />
        <label>Answer:<br />
          <input name="answer" value={formData.answer} onChange={handleChange} required />
        </label><br />
        <label>Concept:<br />
          <input name="concept" value={formData.concept} onChange={handleChange} required />
        </label><br />
        <label>Difficulty:<br />
          <select name="difficulty" value={formData.difficulty} onChange={handleChange} required>
            <option value="">Select</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </label><br />
        <label>Type:<br />
          <input name="type" value={formData.type} onChange={handleChange} required />
        </label><br />
        <button type="submit">Add Problem</button>
      </form>

      <h4>Submitted Problems:</h4>
      <ul>
        {savedProblems.map((prob) => (
          <li key={prob.id}>{prob.question} → {prob.answer}</li>
        ))}
      </ul>
    </div>
  );

}

function QuickActionsPanel() {
  return (
    <div className={styles.section}>
      <h2>📝 Quick Actions</h2>
      <ul>
        <li>View flagged students</li>
        <li>Send encouragement or feedback</li>
        <li>Export progress reports</li>
      </ul>
    </div>
  );
}

function DashboardTeacher() {
  const CardWrapper = ({ title, children }) => {
    const [isOpen, setIsOpen] = React.useState(true);
    return (
      <div className={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>{title}</h2>
          <button onClick={() => setIsOpen(prev => !prev)}>
            {isOpen ? '−' : '+'}
          </button>
        </div>
        {isOpen && <div>{children}</div>}
      </div>
    );
  };

  return (
    <div className={styles.dashboardTeacherContainer}>
    
      <div className={styles.dashboardGrid}>
    

      <CardWrapper title="📊 Student Performance Overview">
  <StudentHeatmap />
</CardWrapper>

      <CardWrapper title="🧠 Learning Profiles">
  <LearningProfileList />
</CardWrapper>

      <CardWrapper title="📂 Manage Assigned Problem Sets">
  <ProblemSetManager />
</CardWrapper>

      <CardWrapper title="📝 Quick Actions">
  <QuickActionsPanel />
</CardWrapper>
      </div>
    </div>
  );
}

export default DashboardTeacher;
