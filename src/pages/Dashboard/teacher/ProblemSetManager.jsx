import React from 'react';
import styles from './ProblemSetManager.module.css';

function ProblemSetManager() {
  const [formData, setFormData] = React.useState({
    question: '',
    answer: '',
    concept: '',
    difficulty: '',
    type: ''
  });
  const [savedProblems, setSavedProblems] = React.useState([]);
  const [isOpen, setIsOpen] = React.useState(true);

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
    <div className={styles.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>📂 Manage Assigned Problem Sets</h2>
        <button onClick={() => setIsOpen(prev => !prev)}>
          {isOpen ? '−' : '+'}
        </button>
      </div>
      {isOpen && (
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
      )}
    </div>
  );
}

export default ProblemSetManager;
