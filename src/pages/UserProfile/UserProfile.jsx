// Pathing: src/pages/Dashboard/UserProfile/UserProfile.jsx
// Focus: Polished User Profile with Modern Design
// VersionUpdate: StudyBuddy Version â€" Enhanced UI/UX, Integrated SubscribeModal, Login Required

import React, { useState, useEffect } from 'react';
import styles from './UserProfile.module.css';
import { fetchUserMBTI } from '../../api/ApiMaster';
import SubscribeModal from '../../components/SubscribeModal';
import identityTypes from './IdentityTypes.json';
import SubscriptionCard from '../../components/SubscriptionCard';

// Optional: local avatar placeholder to avoid external DNS failures
const DEFAULT_AVATAR = '/assets/avatar-placeholder.png';

const UserProfile = ({ user, setUser }) => {
  const [subscription, setSubscription] = useState({ plan: 'Basic', status: 'Free Plan' });
  const [showSubscribe, setShowSubscribe] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Bootstrap user from localStorage (email is our key identity)
  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail');
    const storedName = localStorage.getItem('userName');
    const storedAvatar = localStorage.getItem('userAvatar');

    if (storedEmail) {
      setUser(prev => ({
        ...prev,
        email: storedEmail,
        name: storedName || storedEmail.split('@')[0],
        avatar: prev?.avatar || storedAvatar || DEFAULT_AVATAR,
      }));
    } else {
      console.warn('No stored userEmail found. Cannot populate profile.');
      setIsLoading(false);
    }
  }, [setUser]);

  // Fetch enriched profile (MBTI, etc.)
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
        console.log('Fetched enriched user profile:', data);

        setUser(prevUser => ({
          name: data.name || prevUser.name,
          email: data.email || prevUser.email,
          avatar: prevUser.avatar || DEFAULT_AVATAR,
          mbti: data.mbti || 'Not set',
          age: data.age || 'Not provided',
          interests: data.interests || [],
          identityScore: data.identityScore || 0,
          identityType: data.identityType || data.mbti || 'Not set',
          // keep any existing username if you track it elsewhere
          username: prevUser.username || prevUser.name || (prevUser.email ? prevUser.email.split('@')[0] : undefined),
        }));

        // Simple subscription inference for now
        if (data.mbti || (data.interests && data.interests.length)) {
          setSubscription({ plan: 'Premium', status: 'Active' });
        } else {
          setSubscription({ plan: 'Basic', status: 'Free Plan' });
        }
      } catch (err) {
        console.error('User profile load error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user?.email, setUser]);

  const handleEditPersonalInfo = () => alert('Edit Personal Information functionality coming soon!');
  const handleEditInterests = () => alert('Edit Interests functionality coming soon!');
  const handleEditPersonalityType = () => alert('Edit Personality Type functionality coming soon!');
  const handleChangeAvatar = () => alert('Avatar change functionality coming soon!');

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

  // Resolve username weâ€™ll pass to the SubscriptionCard
  const resolvedUsername =
    user.username || user.name || (user.email ? user.email.split('@')[0] : undefined);

  return (
    <div className={styles.userProfilePage}>
      <div className={styles.profileHeader}>
        <h1>Account Settings</h1>
        <p className={styles.profileSubtitle}>Manage your profile and preferences</p>

        <div className={styles.avatarContainer}>
          <div className={styles.avatar}>
            <img
              src={user.avatar || DEFAULT_AVATAR}
              alt="User Avatar"
              style={{ width: '100%', height: '100%' }}
              onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }}
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

          {/* Subscription */}
          <SubscriptionCard
            /** >>> These props are the important part <<< */
            email={user.email}
            username={resolvedUsername}
            initialSubscription={subscription}
            /** Leave insights off for now (different worker). You can wire later:
             * insightsUrls={[
             *   `${USER_WORKER_BASE}/subscription?email=${encodeURIComponent(user.email)}`
             * ]}
             */
          />
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