// Pathing: src/pages/Dashboard/UserProfile/UserProfile.jsx
// Focus: Polished User Profile with Modern Design
// VersionUpdate: StudyBuddy Version — Enhanced UI/UX, Integrated SubscribeModal, Login Required

import React, { useState, useEffect } from 'react';
import styles from './UserProfile.module.css';
import { fetchUserMBTI } from '../../api/ApiMaster';
import SubscribeModal from '../../components/SubscribeModal';
import identityTypes from './IdentityTypes.json';

const UserProfile = ({ user, setUser }) => {
  const [subscription, setSubscription] = useState({ plan: 'Basic', status: 'Free Plan' });
  const [showSubscribe, setShowSubscribe] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail');
    const storedName = localStorage.getItem('userName');
    const storedAvatar = localStorage.getItem('userAvatar');
    
    if (storedEmail) {
      setUser((prev) => ({
        ...prev,
        email: storedEmail,
        name: storedName || storedEmail.split('@')[0],
        avatar: prev?.avatar || storedAvatar || 'https://via.placeholder.com/150',
      }));
    } else {
      console.warn('No stored userEmail found. Cannot populate profile.');
      setIsLoading(false);
    }
  }, [setUser]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userEmail = user?.email;
        if (!userEmail) {
          setIsLoading(false);
          return;
        }

        setIsLoading(true);
        const data = await fetchUserMBTI(userEmail);
        console.log("Fetched enriched user profile:", data);

        // Use functional update to avoid dependency on user object
        setUser(prevUser => ({
          name: data.name || prevUser.name,
          email: data.email || prevUser.email,
          avatar: prevUser.avatar || 'https://via.placeholder.com/150',
          mbti: data.mbti || 'Not set',
          age: data.age || 'Not provided',
          interests: data.interests || [],
          identityScore: data.identityScore || 0,
          identityType: data.identityType || data.mbti || 'Not set',
        }));

        // Determine subscription status based on user data
        if (data.mbti || (data.interests && data.interests.length)) {
          setSubscription({ plan: 'Premium', status: 'Active' });
        } else {
          setSubscription({ plan: 'Basic', status: 'Free Plan' });
        }
      } catch (err) {
        console.error("User profile load error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user?.email, setUser]);

  const openBillingModal = () => {
    setShowSubscribe(true);
  };

  const handleEditPersonalInfo = () => {
    // TODO: Implement edit personal info functionality
    alert('Edit Personal Information functionality coming soon!');
  };

  const handleEditInterests = () => {
    // TODO: Implement edit interests functionality
    alert('Edit Interests functionality coming soon!');
  };

  const handleEditPersonalityType = () => {
    // TODO: Implement edit personality type functionality
    alert('Edit Personality Type functionality coming soon!');
  };

  const handleChangeAvatar = () => {
    // TODO: Implement avatar change functionality
    alert('Avatar change functionality coming soon!');
  };

  if (isLoading) {
    return (
      <div className={styles.userProfilePage}>
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user || !user.email) {
    return (
      <div className={styles.userProfilePage}>
        <div className={styles.loadingState}>
          <p>You are not currently logged in.</p>
        </div>
      </div>
    );
  }

  const statusBadgeClass = subscription.status === 'Active' ? styles.active : styles.free;

  return (
    <div className={styles.userProfilePage}>
      <div className={styles.profileHeader}>
        <h1>Account Settings</h1>
        <p className={styles.profileSubtitle}>Manage your profile and preferences</p>
        
        <div className={styles.avatarContainer}>
          <div className={styles.avatar}>
            <img
              src={user.avatar || 'https://via.placeholder.com/150'}
              alt="User Avatar"
              style={{ width: '100%', height: '100%' }}
            />
          </div>
          <button
            className={styles.changeAvatarButton}
            onClick={handleChangeAvatar}
          >
            Change Avatar
          </button>
        </div>
      </div>

      <div className={styles.profileContent}>
        <div className={styles.profileGrid}>
          <div className={styles.userDetails}>
            <div className={styles.sectionHeader}>
              <h2>Personal Information</h2>
              <button 
                className={styles.editSectionButton}
                onClick={handleEditPersonalInfo}
                title="Edit Personal Information"
              >
                Edit
              </button>
            </div>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>MBTI:</strong> {user.mbti}</p>
            <p><strong>Age:</strong> {user.age}</p>
          </div>

          <div className={styles.userDetails}>
            <div className={styles.sectionHeader}>
              <h2>Interests</h2>
              <button 
                className={styles.editSectionButton}
                onClick={handleEditInterests}
                title="Edit Interests"
              >
                Edit
              </button>
            </div>
            {Array.isArray(user.interests) && user.interests.length > 0 ? (
              <ul>
                {user.interests.map((interest, index) => (
                  <li key={index}>{interest}</li>
                ))}
              </ul>
            ) : (
              <p>No interests provided.</p>
            )}
          </div>

          <div className={styles.userDetails}>
            <div className={styles.sectionHeader}>
              <h2>Personality Type</h2>
              <button 
                className={styles.editSectionButton}
                onClick={handleEditPersonalityType}
                title="Edit Personality Type"
              >
                Edit
              </button>
            </div>
            <p><strong>Type:</strong> {user.mbti}</p>
            {identityTypes[user.mbti] && (
              <div className={styles.identityExplanation}>
                <p><strong>Tone:</strong> {identityTypes[user.mbti]?.tone}</p>
                <p><strong>Style:</strong> {identityTypes[user.mbti]?.style}</p>
                <p><strong>Structure:</strong> {identityTypes[user.mbti]?.structure}</p>
                <p><strong>Engagement:</strong> {identityTypes[user.mbti]?.engagement}</p>
              </div>
            )}
          </div>

          <div className={`${styles.userDetails} ${styles.subscriptionCard}`}>
            <div className={styles.sectionHeader}>
              <h2>Subscription Plan</h2>
            </div>
            <p>
              <strong>Current Plan:</strong> {subscription.plan}
              <span className={`${styles.statusBadge} ${statusBadgeClass}`}>
                {subscription.status}
              </span>
            </p>
            <button 
              className={`${styles.editProfileButton} ${styles.secondary}`} 
              onClick={openBillingModal}
              style={{ marginTop: '15px' }}
            >
              Manage Billing
            </button>
          </div>
        </div>
      </div>

      <SubscribeModal
        isOpen={showSubscribe}
        onClose={() => setShowSubscribe(false)}
        user={user}
      />
    </div>
  );
};

export default UserProfile;