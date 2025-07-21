import React, { useEffect } from 'react';
import styles from './SubscribeModal.module.css';
import { redirectToStripeCheckout } from '../utils/stripeHelper';
import { Brain } from 'lucide-react';

const SubscribeModal = ({ 
  isOpen, 
  onClose, 
  children, 
  user, 
  onConfirm = redirectToStripeCheckout, 
  confirmText = 'Start Your Studybuddy Journey' 
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.position = 'unset';
      document.body.style.width = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.position = 'unset';
      document.body.style.width = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFreeContinue = () => {
    onClose();
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <button className={styles.closeButton} onClick={onClose}>&times;</button>

        {/* Header Section */}
        <div className={styles.header}>
          <div className={styles.icon}>
            <Brain className={styles.brainIcon} />
          </div>
          <h1 className={styles.title}>Like StudyBuddy? Subscribe now!</h1>
          <p className={styles.subtitle}>
            Kindred's Edu OS - Your personalized learning companion
          </p>
        </div>

        {/* Plan Selection */}
        <div className={styles.planSection}>
          <h2 className={styles.planTitle}>Choose Your Plan</h2>

          <div className={styles.premiumCard}>
            <h3 className={styles.planName}>Premium Access</h3>
            <div className={styles.pricing}>
              <span className={styles.price}>$9.99</span>
              <span className={styles.period}>/month</span>
            </div>
            <div className={styles.billingTag}>billed yearly</div>

            <div className={styles.features}>
              <div className={styles.feature}>
                <div className={styles.bullet}></div>
                <span>AI-powered tutoring and homework assistance</span>
              </div>
              <div className={styles.feature}>
                <div className={styles.bullet}></div>
                <span>Personalized study plans and progress tracking</span>
              </div>
              <div className={styles.feature}>
                <div className={styles.bullet}></div>
                <span>24/7 access to your intelligent study companion</span>
              </div>
              <div className={styles.feature}>
                <div className={styles.bullet}></div>
                <span>Advanced learning analytics and insights</span>
              </div>
            </div>

            {onConfirm && (
              <button className={styles.confirmButton} onClick={() => onConfirm(user)}>
                {confirmText}
              </button>
            )}

            <button className={styles.freeButton} onClick={handleFreeContinue}>
              Continue with free account
            </button>
          </div>

        <div className={styles.bottomText}>
          <p>Unlock full features, premium tools, and priority support by subscribing.</p>
        </div>
      </div>
      </div>
    </div>
  );
};

export default SubscribeModal;
