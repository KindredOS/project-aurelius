import React, { useState } from 'react';
import { ChevronRight, Brain, BarChart3, Trophy, Mail, User, UserCheck, Lock, Key } from 'lucide-react';
import { registerOrUpdateUserProfile } from '../../api/ApiMaster'; // adjust path based on actual location
import styles from './Onboarding.module.css';

function Onboarding() {
  const [step, setStep] = useState('signup');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [role, setRole] = useState('myself');
  const [isAnimating, setIsAnimating] = useState(false);

  const handleStepTransition = (nextStep) => {
    setIsAnimating(true);
    setTimeout(() => {
      setStep(nextStep);
      setIsAnimating(false);
    }, 300);
  };

  const handleSignupSubmit = async () => {
    if (name && email && password) {
      try {
        // Determine roles based on selection
        let roles = [];
        switch(role) {
          case 'myself':
            roles = ['student'];
            break;
          case 'family':
            roles = ['parent', 'student'];
            break;
          case 'classroom':
            roles = ['teacher', 'student'];
            break;
          case 'school':
            roles = ['admin', 'teacher', 'student'];
            break;
          default:
            roles = ['student'];
        }

        // Create user accounts for each role
        for (const userRole of roles) {
          const userData = {
            email,
            password,
            role: userRole,
            name,
            inviteCode: inviteCode || undefined // Only include if provided
          };
          
          await registerOrUpdateUserProfile(userData);
        }
        
        handleStepTransition('tutorial');
      } catch (error) {
        console.error('Error creating user:', error);
        alert('There was an error creating your account. Please try again.');
      }
    }
  };

  const handleNextFromTutorial = () => {
    handleStepTransition('subscribe');
  };

  const handleSkipSubscribe = () => {
    alert('You can subscribe anytime from your dashboard.');
    window.location.href = '/dashboard';
  };

  const getStepNumber = () => {
    switch(step) {
      case 'signup': return 1;
      case 'tutorial': return 2;
      case 'subscribe': return 3;
      default: return 1;
    }
  };

  return (
    <div className={styles.onboardingWrapper}>
      <div style={{ width: '100%', maxWidth: '28rem' }}>
        {/* Progress indicator */}
        <div className={styles.progressContainer}>
          <div className={styles.progressHeader}>
            <span className={styles.progressStep}>Step {getStepNumber()} of 3</span>
            <span className={styles.progressPercent}>{Math.round((getStepNumber() / 3) * 100)}% complete</span>
          </div>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill}
              style={{ width: `${(getStepNumber() / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Main content */}
        <div className={`${styles.modal} ${isAnimating ? styles.animating : ''}`}>
          <div className={styles.welcomeText}>
            <div className={styles.logoContainer}>
              <Brain style={{ width: '2rem', height: '2rem', color: 'white' }} />
            </div>
            <h1>Welcome to Studybuddy!</h1>
            <p>Kindred's Edu OS - Your personalized learning companion</p>
          </div>

          {step === 'signup' && (
            <div>
              <h2>Let's get started</h2>
              <div className={styles.signupForm}>
                <div className={styles.inputGroup}>
                  <label>Full Name</label>
                  <div className={styles.inputWrapper}>
                    <User className={styles.inputIcon} />
                    <input 
                      type="text"
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      required 
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label>Email Address</label>
                  <div className={styles.inputWrapper}>
                    <Mail className={styles.inputIcon} />
                    <input 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      required 
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label>Password</label>
                  <div className={styles.inputWrapper}>
                    <Lock className={styles.inputIcon} />
                    <input 
                      type="password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      required 
                      placeholder="Enter your password"
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label>Invite Code (Optional)</label>
                  <div className={styles.inputWrapper}>
                    <Key className={styles.inputIcon} />
                    <input 
                      type="text" 
                      value={inviteCode} 
                      onChange={(e) => setInviteCode(e.target.value)} 
                      placeholder="Enter invite code (if you have one)"
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label>Who is this for?</label>
                  <div className={styles.inputWrapper}>
                    <UserCheck className={styles.inputIcon} />
                    <select 
                      value={role} 
                      onChange={(e) => setRole(e.target.value)}
                    >
                      <option value="myself">Myself</option>
                      <option value="family">My Family</option>
                      <option value="classroom">My Classroom</option>
                      <option value="school">My School</option>
                    </select>
                  </div>
                </div>

                <button 
                  onClick={handleSignupSubmit} 
                  className={styles.primaryButton}
                >
                  Continue
                  <ChevronRight style={{ width: '1.25rem', height: '1.25rem' }} />
                </button>
              </div>
            </div>
          )}

          {step === 'tutorial' && (
            <div>
              <h2>Why Studybuddy?</h2>
              <div className={styles.featureList}>
                <div className={styles.featureItem}>
                  <div className={styles.featureIcon}>
                    <Brain style={{ width: '1.5rem', height: '1.5rem' }} />
                  </div>
                  <div className={styles.featureContent}>
                    <h3>AI-Powered Learning</h3>
                    <p>Smart content that adapts to your unique learning pace and style with Kindred's advanced AI</p>
                  </div>
                </div>
                
                <div className={styles.featureItem}>
                  <div className={styles.featureIcon}>
                    <BarChart3 style={{ width: '1.5rem', height: '1.5rem' }} />
                  </div>
                  <div className={styles.featureContent}>
                    <h3>Real-time Analytics</h3>
                    <p>Track your progress with detailed insights and performance metrics</p>
                  </div>
                </div>
                
                <div className={styles.featureItem}>
                  <div className={styles.featureIcon}>
                    <Trophy style={{ width: '1.5rem', height: '1.5rem' }} />
                  </div>
                  <div className={styles.featureContent}>
                    <h3>Smart Study Companion</h3>
                    <p>Your AI study buddy that helps with homework, projects, and exam preparation</p>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={handleNextFromTutorial}
                className={styles.primaryButton}
              >
                Next
                <ChevronRight style={{ width: '1.25rem', height: '1.25rem' }} />
              </button>
            </div>
          )}

          {step === 'subscribe' && (
            <div>
              <h2>Choose Your Plan</h2>
              
              <div className={styles.pricingCard}>
                <div className={styles.pricingHeader}>
                  <h3>Premium Access</h3>
                  <div className={styles.price}>
                    <span className={styles.amount}>$9.99</span>
                    <span className={styles.period}>/month</span>
                  </div>
                </div>
                
                <ul className={styles.featuresList}>
                  <li>
                    <div className={styles.featureBullet}></div>
                    AI-powered tutoring and homework assistance
                  </li>
                  <li>
                    <div className={styles.featureBullet}></div>
                    Personalized study plans and progress tracking
                  </li>
                  <li>
                    <div className={styles.featureBullet}></div>
                    24/7 access to your intelligent study companion
                  </li>
                  <li>
                    <div className={styles.featureBullet}></div>
                    Advanced learning analytics and insights
                  </li>
                </ul>
                
                <button className={styles.primaryButton}>
                  Start Your Studybuddy Journey
                </button>
                
                <button 
                  onClick={handleSkipSubscribe}
                  className={styles.secondaryButton}
                >
                  Continue with free account
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
            By continuing, you agree to our{' '}
            <a href="#" style={{ color: '#2563eb', textDecoration: 'underline' }}>Terms of Service</a>{' '}
            and{' '}
            <a href="#" style={{ color: '#2563eb', textDecoration: 'underline' }}>Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Onboarding;