// ScienceGame.jsx
import React, { useState } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  XCircle,
  Lightbulb,
  FlaskConical,
  BarChart3,
  FileText
} from 'lucide-react';
import styles from './ScienceGame.module.css';

const HypothesisTester = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [currentScenario, setCurrentScenario] = useState(0);
  const [userInputs, setUserInputs] = useState({
    observations: '',
    hypothesis: '',
    variables: { independent: '', dependent: '', controls: '' },
    prediction: '',
    conclusion: ''
  });

  const scenarios = [
    {
      title: 'Plant Growth Mystery',
      description:
        'You notice that plants in your classroom window grow taller than plants in the back of the room.',
      image: '🌱',
      correctAnswers: {
        hypothesis:
          'Plants near the window grow taller because they receive more sunlight',
        independent: 'amount of sunlight/light exposure',
        dependent: 'plant height/growth',
        controls: 'same plant type, soil, water, temperature'
      }
    },
    {
      title: 'Paper Airplane Distance',
      description:
        'Some paper airplanes in your class fly much farther than others, even when thrown with similar force.',
      image: '✈️',
      correctAnswers: {
        hypothesis:
          'Paper airplanes with pointed noses fly farther because they have less air resistance',
        independent: 'airplane design/nose shape',
        dependent: 'distance flown',
        controls: 'same paper, throwing force, person throwing'
      }
    },
    {
      title: 'Ice Melting Rate',
      description:
        'Ice cubes seem to melt at different rates when placed in different locations around the school.',
      image: '🧊',
      correctAnswers: {
        hypothesis:
          'Ice melts faster in warmer locations because heat increases melting rate',
        independent: 'temperature/location',
        dependent: 'melting rate/time to melt',
        controls: 'same ice cube size, same container'
      }
    }
  ];

  const steps = [
    { name: 'Observation', icon: <Lightbulb className={styles.iconMd} />, description: 'What did you observe?' },
    { name: 'Hypothesis', icon: <FlaskConical className={styles.iconMd} />, description: 'Form your testable hypothesis' },
    { name: 'Variables', icon: <BarChart3 className={styles.iconMd} />, description: 'Identify your variables' },
    { name: 'Results', icon: <FileText className={styles.iconMd} />, description: 'Analyze and conclude' }
  ];

  const currentScenarioData = scenarios[currentScenario];

  const checkAnswer = (userAnswer, correctAnswer) => {
    if (!userAnswer) return null;
    const keywords = correctAnswer.toLowerCase().split(/[,/]/);
    const userLower = userAnswer.toLowerCase();
    const hasKeyword = keywords.some((keyword) => userLower.includes(keyword.trim()));
    return hasKeyword;
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const newScenario = () => {
    const nextScenario = (currentScenario + 1) % scenarios.length;
    setCurrentScenario(nextScenario);
    setCurrentStep(0);
    setUserInputs({
      observations: '',
      hypothesis: '',
      variables: { independent: '', dependent: '', controls: '' },
      prediction: '',
      conclusion: ''
    });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className={styles.stack}>
            <div className={styles.center}>
              <div className={styles.emoji}>{currentScenarioData.image}</div>
              <h3 className={styles.h2}>{currentScenarioData.title}</h3>
              <p className={styles.pLead}>{currentScenarioData.description}</p>
            </div>

            <div className={`${styles.panel} ${styles.panelBlue}`}>
              <label className={styles.label}>
                What observations can you make from this scenario? What patterns do you notice?
              </label>
              <textarea
                className={styles.textarea}
                rows="4"
                value={userInputs.observations}
                onChange={(e) =>
                  setUserInputs({ ...userInputs, observations: e.target.value })
                }
                placeholder="Describe what you observe and any patterns you notice..."
              />
            </div>
          </div>
        );

      case 1:
        return (
          <div className={styles.stack}>
            <div className={`${styles.panel} ${styles.panelGreen}`}>
              <h4 className={styles.hintTitle}>💡 Hypothesis Tips:</h4>
              <ul className={styles.hintList}>
                <li>• Start with "If... then..." or "Because..."</li>
                <li>• Make it testable and specific</li>
                <li>• Explain the cause and effect relationship</li>
              </ul>
            </div>

            <div>
              <label className={styles.label}>
                Form your hypothesis (educated guess with reasoning):
              </label>
              <textarea
                className={styles.textarea}
                rows="3"
                value={userInputs.hypothesis}
                onChange={(e) =>
                  setUserInputs({ ...userInputs, hypothesis: e.target.value })
                }
                placeholder="If..., then... because..."
              />
              {userInputs.hypothesis && (
                <div className={styles.feedback}>
                  {checkAnswer(
                    userInputs.hypothesis,
                    currentScenarioData.correctAnswers.hypothesis
                  ) ? (
                    <CheckCircle className={`${styles.iconMd} ${styles.iconOk}`} />
                  ) : (
                    <XCircle className={`${styles.iconMd} ${styles.iconBad}`} />
                  )}
                  <span className={styles.feedbackText}>
                    {checkAnswer(
                      userInputs.hypothesis,
                      currentScenarioData.correctAnswers.hypothesis
                    )
                      ? 'Great hypothesis! You identified the key relationship.'
                      : 'Consider what factor might be causing the difference you observed.'}
                  </span>
                </div>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className={styles.stack}>
            <div className={`${styles.panel} ${styles.panelPurple}`}>
              <h4 className={styles.varTitle}>🔬 Variable Types:</h4>
              <div className={styles.varExplain}>
                <p><strong>Independent:</strong> What you change/manipulate</p>
                <p><strong>Dependent:</strong> What you measure/observe</p>
                <p><strong>Controls:</strong> What you keep the same</p>
              </div>
            </div>

            <div className={styles.grid3}>
              <div>
                <label className={styles.label}>
                  Independent Variable (what you would change):
                </label>
                <input
                  type="text"
                  className={styles.input}
                  value={userInputs.variables.independent}
                  onChange={(e) =>
                    setUserInputs({
                      ...userInputs,
                      variables: { ...userInputs.variables, independent: e.target.value }
                    })
                  }
                  placeholder="The factor you would manipulate..."
                />
                {userInputs.variables.independent && (
                  <div className={styles.feedback}>
                    {checkAnswer(
                      userInputs.variables.independent,
                      currentScenarioData.correctAnswers.independent
                    ) ? (
                      <CheckCircle className={`${styles.iconSm} ${styles.iconOk}`} />
                    ) : (
                      <XCircle className={`${styles.iconSm} ${styles.iconBad}`} />
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className={styles.label}>
                  Dependent Variable (what you would measure):
                </label>
                <input
                  type="text"
                  className={styles.input}
                  value={userInputs.variables.dependent}
                  onChange={(e) =>
                    setUserInputs({
                      ...userInputs,
                      variables: { ...userInputs.variables, dependent: e.target.value }
                    })
                  }
                  placeholder="The outcome you would measure..."
                />
                {userInputs.variables.dependent && (
                  <div className={styles.feedback}>
                    {checkAnswer(
                      userInputs.variables.dependent,
                      currentScenarioData.correctAnswers.dependent
                    ) ? (
                      <CheckCircle className={`${styles.iconSm} ${styles.iconOk}`} />
                    ) : (
                      <XCircle className={`${styles.iconSm} ${styles.iconBad}`} />
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className={styles.label}>
                  Control Variables (what you would keep the same):
                </label>
                <input
                  type="text"
                  className={styles.input}
                  value={userInputs.variables.controls}
                  onChange={(e) =>
                    setUserInputs({
                      ...userInputs,
                      variables: { ...userInputs.variables, controls: e.target.value }
                    })
                  }
                  placeholder="Factors you would keep constant..."
                />
                {userInputs.variables.controls && (
                  <div className={styles.feedback}>
                    {checkAnswer(
                      userInputs.variables.controls,
                      currentScenarioData.correctAnswers.controls
                    ) ? (
                      <CheckCircle className={`${styles.iconSm} ${styles.iconOk}`} />
                    ) : (
                      <XCircle className={`${styles.iconSm} ${styles.iconBad}`} />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 3: {
        const allCorrect = [
          checkAnswer(userInputs.hypothesis, currentScenarioData.correctAnswers.hypothesis),
          checkAnswer(userInputs.variables.independent, currentScenarioData.correctAnswers.independent),
          checkAnswer(userInputs.variables.dependent, currentScenarioData.correctAnswers.dependent),
          checkAnswer(userInputs.variables.controls, currentScenarioData.correctAnswers.controls)
        ].every((check) => check === true);

        return (
          <div className={styles.stack}>
            <div
              className={`${styles.panel} ${
                allCorrect ? styles.panelGreenEmph : styles.panelYellow
              }`}
            >
              <h4 className={styles.h2} style={{ marginBottom: '1rem', color: allCorrect ? 'var(--g-800)' : 'var(--g-800)' }}>
                {allCorrect ? '🎉 Excellent Scientific Thinking!' : "🤔 Good Effort! Let's Review"}
              </h4>

              <div className={styles.stack} style={{ gap: '0.75rem' }}>
                <div>
                  <h5 className={styles.resultHead}>Your Hypothesis:</h5>
                  <p className={styles.resultText}>
                    "{userInputs.hypothesis || 'No hypothesis entered'}"
                  </p>
                </div>

                <div>
                  <h5 className={styles.resultHead}>Sample Expert Hypothesis:</h5>
                  <p className={styles.resultText} style={{ fontStyle: 'normal' }}>
                    "{currentScenarioData.correctAnswers.hypothesis}"
                  </p>
                </div>

                <div className={styles.grid3} style={{ marginTop: '1rem' }}>
                  <div>
                    <h6 className={styles.resultHead}>Independent Variable:</h6>
                    <p className={styles.feedbackText}>
                      {currentScenarioData.correctAnswers.independent}
                    </p>
                  </div>
                  <div>
                    <h6 className={styles.resultHead}>Dependent Variable:</h6>
                    <p className={styles.feedbackText}>
                      {currentScenarioData.correctAnswers.dependent}
                    </p>
                  </div>
                  <div>
                    <h6 className={styles.resultHead}>Controls:</h6>
                    <p className={styles.feedbackText}>
                      {currentScenarioData.correctAnswers.controls}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className={`${styles.panel} ${styles.panelBlue}`}>
              <h5 className={styles.resultHead}>🧠 Scientific Method Reflection:</h5>
              <p className={styles.feedbackText}>
                You've just practiced the key steps of scientific inquiry! In real science, you would now conduct the experiment,
                collect data, and analyze results to see if they support your hypothesis. Remember: even if results don't support
                your hypothesis, that's still valuable scientific knowledge!
              </p>
            </div>

            <button onClick={newScenario} className={styles.cta}>
              Try New Scenario 🚀
            </button>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.headerTitle}>Scientific Method: Hypothesis Tester</h1>
          <p className={styles.headerSub}>
            Practice forming hypotheses and identifying variables like a real scientist!
          </p>
        </div>

        {/* Progress Steps */}
        <div className={styles.progressBar}>
          <div className={styles.stepsRow}>
            {steps.map((step, index) => {
              const stepClass = `${styles.step} ${
                index === currentStep
                  ? styles.stepCurrent
                  : index < currentStep
                  ? styles.stepDone
                  : styles.stepUpcoming
              }`;
              return (
                <div key={index} className={styles.stepWrap}>
                  <div className={stepClass}>
                    {step.icon}
                    <span>{step.name}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <ChevronRight className={styles.chevron} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className={styles.content}>{renderStep()}</div>

        {/* Navigation */}
        <div className={styles.nav}>
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`${styles.btn} ${
              currentStep === 0 ? styles.btnDisabled : styles.btnPrimary
            }`}
          >
            <ChevronLeft className={styles.iconSm} />
            <span>Previous</span>
          </button>

          <div className={styles.meta}>
            Scenario {currentScenario + 1} of {scenarios.length} • Step {currentStep + 1} of {steps.length}
          </div>

          <button
            onClick={nextStep}
            disabled={currentStep === steps.length - 1}
            className={`${styles.btn} ${
              currentStep === steps.length - 1 ? styles.btnDisabled : styles.btnPrimary
            }`}
          >
            <span>Next</span>
            <ChevronRight className={styles.iconSm} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HypothesisTester;
