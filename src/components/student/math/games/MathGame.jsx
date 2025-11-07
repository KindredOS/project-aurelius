import React, { useState, useEffect } from 'react';
import styles from './MathGame.module.css';

const MathDetectiveGame = () => {
  const [gameState, setGameState] = useState({
    score: 0,
    caseSolved: 0,
    currentCase: 0,
    badges: new Set(),
    streak: 0,
    timeLeft: 60
  });

  const [gameFlow, setGameFlow] = useState('case-intro'); // case-intro, method-select, investigation, answer-submit, result
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [investigationStep, setInvestigationStep] = useState(0);
  const [userWork, setUserWork] = useState({});
  const [finalAnswer, setFinalAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // Enhanced cases with step-by-step solutions
  const cases = [
    {
      title: "The Missing Pizza Mystery",
      story: "The cafeteria ordered 150 pizza slices at $2 each and 75 drinks at $1.50 each. They should have $412.50, but only have $250 in the register. How much money is missing?",
      correctAnswer: 162.5,
      icon: "🍕",
      methods: {
        visual: {
          name: "🎨 Draw It Out",
          steps: [
            { prompt: "Draw or describe 150 pizza slices at $2 each. What's the total?", answer: 300, type: "number" },
            { prompt: "Draw or describe 75 drinks at $1.50 each. What's the total?", answer: 112.5, type: "number" },
            { prompt: "Add both totals together. What should they have?", answer: 412.5, type: "number" },
            { prompt: "They actually have $250. What's missing?", answer: 162.5, type: "number" }
          ]
        },
        equation: {
          name: "🔢 Build Equations",
          steps: [
            { prompt: "Write the equation for pizza cost: 150 × $2 = ?", answer: 300, type: "number" },
            { prompt: "Write the equation for drink cost: 75 × $1.50 = ?", answer: 112.5, type: "number" },
            { prompt: "Total expected: $300 + $112.50 = ?", answer: 412.5, type: "number" },
            { prompt: "Missing money: $412.50 - $250 = ?", answer: 162.5, type: "number" }
          ]
        },
        story: {
          name: "📖 Story Method",
          steps: [
            { prompt: "What did they spend on pizzas? (150 slices × $2)", answer: 300, type: "number" },
            { prompt: "What did they spend on drinks? (75 drinks × $1.50)", answer: 112.5, type: "number" },
            { prompt: "How much should be in the register total?", answer: 412.5, type: "number" },
            { prompt: "If they only have $250, how much is missing?", answer: 162.5, type: "number" }
          ]
        }
      }
    },
    {
      title: "The Playground Pattern Puzzle",
      story: "Students noticed a pattern in the monkey bars: 3, 6, 12, 24, ?. What's the next number?",
      correctAnswer: 48,
      icon: "🎪",
      methods: {
        pattern: {
          name: "🧩 Find the Pattern",
          steps: [
            { prompt: "What do you get when you multiply 3 × 2?", answer: 6, type: "number" },
            { prompt: "What do you get when you multiply 6 × 2?", answer: 12, type: "number" },
            { prompt: "What do you get when you multiply 12 × 2?", answer: 24, type: "number" },
            { prompt: "Following the pattern, what's 24 × 2?", answer: 48, type: "number" }
          ]
        },
        visual: {
          name: "🎨 Visualize It",
          steps: [
            { prompt: "Draw 3 circles, then double them. How many?", answer: 6, type: "number" },
            { prompt: "Draw 6 circles, then double them. How many?", answer: 12, type: "number" },
            { prompt: "Draw 12 circles, then double them. How many?", answer: 24, type: "number" },
            { prompt: "Draw 24 circles, then double them. How many?", answer: 48, type: "number" }
          ]
        }
      }
    },
    {
      title: "The Cookie Jar Mystery",
      story: "A cookie jar had some cookies. After eating 12 cookies and adding 8 more, there are now 23 cookies. How many were originally there?",
      correctAnswer: 27,
      icon: "🍪",
      methods: {
        logical: {
          name: "🧠 Work Backwards",
          steps: [
            { prompt: "We end with 23 cookies. Before adding 8, how many were there?", answer: 15, type: "number" },
            { prompt: "Before eating 12 cookies, how many were in the jar originally?", answer: 27, type: "number" }
          ]
        },
        equation: {
          name: "🔢 Algebra Method",
          steps: [
            { prompt: "Let X = original cookies. After eating 12: X - 12", answer: "X-12", type: "text" },
            { prompt: "After adding 8 more: (X - 12) + 8 = 23. Simplify the left side.", answer: "X-4", type: "text" },
            { prompt: "So X - 4 = 23. What is X?", answer: 27, type: "number" }
          ]
        }
      }
    }
  ];

  const currentCase = cases[gameState.currentCase] || cases[0];
  const availableMethods = Object.keys(currentCase.methods).map(key => ({
    id: key,
    ...currentCase.methods[key]
  }));

  // Timer effect
  useEffect(() => {
    let interval;
    if (isTimerActive && gameState.timeLeft > 0) {
      interval = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          timeLeft: prev.timeLeft - 1
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, gameState.timeLeft]);

  const startCase = () => {
    setGameFlow('method-select');
    setIsTimerActive(true);
    setGameState(prev => ({ ...prev, timeLeft: 60 }));
  };

  const selectMethod = (method) => {
    setSelectedMethod(method);
    setGameFlow('investigation');
    setInvestigationStep(0);
    setUserWork({});
    
    // Award badge
    const badgeName = `${method.name.split(' ')[1]} Detective`;
    if (!gameState.badges.has(badgeName)) {
      setGameState(prev => ({
        ...prev,
        badges: new Set([...prev.badges, badgeName])
      }));
    }
  };

  const handleStepAnswer = (answer) => {
    const currentStepData = selectedMethod.steps[investigationStep];
    const isCorrect = currentStepData.type === 'number' 
      ? Math.abs(parseFloat(answer) - currentStepData.answer) < 0.01
      : answer.toLowerCase().replace(/\s/g, '') === currentStepData.answer.toLowerCase().replace(/\s/g, '');

    setUserWork(prev => ({
      ...prev,
      [investigationStep]: { answer, correct: isCorrect }
    }));

    if (isCorrect) {
      if (investigationStep < selectedMethod.steps.length - 1) {
        setInvestigationStep(prev => prev + 1);
      } else {
        // All steps completed, move to final answer
        setFinalAnswer(selectedMethod.steps[selectedMethod.steps.length - 1].answer.toString());
        setGameFlow('answer-submit');
      }
    }
  };

  const submitFinalAnswer = () => {
    const isCorrect = Math.abs(parseFloat(finalAnswer) - currentCase.correctAnswer) < 0.01;
    
    if (isCorrect) {
      const completedSteps = Object.values(userWork).filter(work => work.correct).length;
      const basePoints = 10;
      const stepBonus = completedSteps * 2;
      const timeBonus = Math.floor(gameState.timeLeft / 10);
      const totalPoints = basePoints + stepBonus + timeBonus;
      
      setGameState(prev => ({
        ...prev,
        score: prev.score + totalPoints,
        caseSolved: prev.caseSolved + 1,
        streak: prev.streak + 1,
        currentCase: (prev.currentCase + 1) % cases.length
      }));
    } else {
      setGameState(prev => ({ ...prev, streak: 0 }));
    }
    
    setShowResult(true);
    setIsTimerActive(false);
    setTimeout(() => {
      setShowResult(false);
      setGameFlow('case-intro');
      setSelectedMethod(null);
      setInvestigationStep(0);
      setUserWork({});
      setFinalAnswer('');
    }, 3000);
  };

  const resetCase = () => {
    setGameFlow('case-intro');
    setSelectedMethod(null);
    setInvestigationStep(0);
    setUserWork({});
    setFinalAnswer('');
    setIsTimerActive(false);
    setGameState(prev => ({ ...prev, timeLeft: 60 }));
  };

  return (
    <div className={styles.gameContainer}>
      
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>
          🕵️ Math Detective Agency
        </h1>
        <p className={styles.subtitle}>
          Follow the clues step by step to solve each mystery!
        </p>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.statCardScore}`}>
          <div className={styles.statValue}>{gameState.score}</div>
          <div className={styles.statLabel}>💎 Score</div>
        </div>
        <div className={`${styles.statCard} ${styles.statCardSolved}`}>
          <div className={styles.statValue}>{gameState.caseSolved}</div>
          <div className={styles.statLabel}>🏆 Solved</div>
        </div>
        <div className={`${styles.statCard} ${styles.statCardBadges}`}>
          <div className={styles.statValue}>{gameState.badges.size}</div>
          <div className={styles.statLabel}>🎖️ Badges</div>
        </div>
        <div className={`${styles.statCard} ${gameState.timeLeft > 10 ? styles.statCardTime : styles.statCardTimeUrgent}`}>
          <div className={styles.statValue}>{gameState.timeLeft}s</div>
          <div className={styles.statLabel}>⏱️ Time</div>
        </div>
      </div>

      {/* Case Introduction */}
      {gameFlow === 'case-intro' && (
        <div style={{ 
          background: 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))', 
          padding: '30px', 
          borderRadius: '20px',
          marginBottom: '25px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>{currentCase.icon}</div>
          <h2 style={{ fontSize: '28px', margin: '0 0 15px 0' }}>
            Case #{gameState.currentCase + 1}: {currentCase.title}
          </h2>
          <p style={{ 
            fontSize: '18px', 
            lineHeight: '1.6',
            background: 'rgba(255,255,255,0.1)',
            padding: '20px',
            borderRadius: '15px',
            marginBottom: '25px'
          }}>
            {currentCase.story}
          </p>
          <button
            onClick={startCase}
            style={{
              background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '25px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '18px',
              fontWeight: 'bold',
              boxShadow: '0 6px 20px rgba(220, 38, 38, 0.4)'
            }}
          >
            🔍 Start Investigation!
          </button>
        </div>
      )}

      {/* Method Selection */}
      {gameFlow === 'method-select' && (
        <div className={styles.cardContainer}>
          <h3 className={styles.methodTitle}>
            🔍 Choose Your Investigation Method:
          </h3>
          <p className={styles.methodSubtitle}>
            Each method will guide you through different steps to solve the mystery!
          </p>
          <div className={styles.methodGrid}>
            {availableMethods.map(method => (
              <button
                key={method.id}
                onClick={() => selectMethod(method)}
                className={styles.methodButton}
              >
                {method.name}
                <div className={styles.methodSteps}>
                  {method.steps.length} steps to solve
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Investigation Steps */}
      {gameFlow === 'investigation' && selectedMethod && (
        <div className={styles.cardContainer}>
          <div className={styles.investigationHeader}>
            <h3 className={styles.investigationTitle}>
              {selectedMethod.name}
            </h3>
            <div className={styles.investigationStep}>
              Step {investigationStep + 1} of {selectedMethod.steps.length}
            </div>
          </div>
          
          {/* Progress bar */}
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill}
              style={{ width: `${((investigationStep + 1) / selectedMethod.steps.length) * 100}%` }}
            />
          </div>

          {/* Current step */}
          <div className={styles.stepContainer}>
            <h4 className={styles.stepPrompt}>
              🤔 {selectedMethod.steps[investigationStep].prompt}
            </h4>
            <StepInput 
              step={selectedMethod.steps[investigationStep]}
              onAnswer={handleStepAnswer}
              userWork={userWork[investigationStep]}
            />
          </div>

          {/* Previous steps summary */}
          {investigationStep > 0 && (
            <div className={styles.progressSummary}>
              <h5 className={styles.progressSummaryTitle}>✅ Your Progress:</h5>
              {selectedMethod.steps.slice(0, investigationStep).map((step, idx) => (
                <div key={idx} className={styles.progressStep}>
                  <span className={styles.progressStepText}>Step {idx + 1}: {step.prompt}</span>
                  <span className={`${styles.progressStepAnswer} ${userWork[idx]?.correct ? styles.progressStepCorrect : styles.progressStepIncorrect}`}>
                    {userWork[idx]?.answer} {userWork[idx]?.correct ? '✅' : '❌'}
                  </span>
                </div>
              ))}
            </div>
          )}

          <button onClick={resetCase} className={styles.resetButton}>
            🔄 Start Over
          </button>
        </div>
      )}

      {/* Final Answer Submission */}
      {gameFlow === 'answer-submit' && (
        <div className={`${styles.cardContainer} ${styles.cardContainerCenter}`}>
          <h3 className={styles.finalAnswerTitle}>🎯 Final Answer</h3>
          <p className={styles.finalAnswerSubtitle}>
            Great detective work! Based on your investigation, what's your final answer?
          </p>
          
          <div className={styles.inputContainer}>
            <input
              type="number"
              step="0.01"
              value={finalAnswer}
              onChange={(e) => setFinalAnswer(e.target.value)}
              className={styles.numberInput}
            />
            <button onClick={submitFinalAnswer} className={styles.submitButton}>
              🕵️ Solve Case!
            </button>
          </div>
        </div>
      )}

      {/* Result Display */}
      {showResult && (
        <div className={`${styles.resultOverlay} ${Math.abs(parseFloat(finalAnswer) - currentCase.correctAnswer) < 0.01 ? styles.resultSuccess : styles.resultFailure}`}>
          <div className={styles.resultIcon}>
            {Math.abs(parseFloat(finalAnswer) - currentCase.correctAnswer) < 0.01 ? '🎉' : '🤔'}
          </div>
          <h2 className={styles.resultTitle}>
            {Math.abs(parseFloat(finalAnswer) - currentCase.correctAnswer) < 0.01 
              ? 'Case Closed!' 
              : 'Case Remains Open'
            }
          </h2>
          <p>
            {Math.abs(parseFloat(finalAnswer) - currentCase.correctAnswer) < 0.01 
              ? `Excellent detective work! You earned points for each correct step plus time bonus!` 
              : `The correct answer was ${currentCase.correctAnswer}. Review your investigation and try again!`
            }
          </p>
        </div>
      )}
    </div>
  );
};

// Component for handling different step input types
const StepInput = ({ step, onAnswer, userWork }) => {
  const [input, setInput] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);

  const handleSubmit = () => {
    onAnswer(input);
    setShowFeedback(true);
    
    if (step.type === 'number' ? Math.abs(parseFloat(input) - step.answer) < 0.01 : 
        input.toLowerCase().replace(/\s/g, '') === step.answer.toLowerCase().replace(/\s/g, '')) {
      setTimeout(() => {
        setInput('');
        setShowFeedback(false);
      }, 1500);
    }
  };

  return (
    <div>
      <div className={styles.stepInputContainer}>
        {step.type === 'number' ? (
          <input
            type="number"
            step="0.01"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter your answer..."
            className={styles.stepInput}
          />
        ) : (
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter your answer..."
            className={styles.stepInput}
          />
        )}
        <button
          onClick={handleSubmit}
          disabled={!input}
          className={`${styles.checkButton} ${!input ? styles.checkButtonDisabled : ''}`}
        >
          Check Answer
        </button>
      </div>
      
      {showFeedback && userWork && (
        <div className={`${styles.feedbackContainer} ${userWork.correct ? styles.feedbackSuccess : styles.feedbackError}`}>
          <p className={styles.feedbackText}>
            {userWork.correct ? '✅ Correct! Moving to next step...' : `❌ Not quite. The answer is ${step.answer}. Try the next step!`}
          </p>
        </div>
      )}
    </div>
  );
};

export default MathDetectiveGame;