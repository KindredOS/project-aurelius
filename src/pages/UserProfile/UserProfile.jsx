// File: UserProfile.jsx
// Updated Version

import React, { useState, useEffect } from 'react';
import { getBillingApiUrl } from '../../config/ApiConfig';
import styles from './UserProfile.module.css';
import { useGoogleLogin } from '@react-oauth/google';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_live_51QZz55Dasl4Ek9fMi1GBDxyP4xWVK8psazWpNumMWQPve8Wspit2CbQFaonG49GkjO4RAsHk320oE9o6I23Y8kPE00TNeDQZRZ'); // Replace with your Stripe publishable key

const UserProfile = ({ user, setUser }) => {
  const [subscription, setSubscription] = useState({ plan: 'StoryBook Lite', status: 'Free Plan' });

  useEffect(() => {
    const fetchUserData = () => {
      if (user && user.email !== 'guest@example.com') {
        console.log("User already set:", user); // Debugging log
        setSubscription({
          plan: 'StoryBook Premium',
          status: 'Active',
        });
      } else {
        console.log("Setting default Guest user."); // Debugging log
        setUser((prevUser) => {
          if (prevUser && prevUser.email !== 'guest@example.com') {
            return prevUser; // Do not overwrite if user is already set
          }
          return {
            name: 'Guest',
            email: 'guest@example.com',
            savedStories: 0,
            avatar: '',
          };
        });
        setSubscription({
          plan: 'StoryBook Lite',
          status: 'Free Plan',
        });
      }
    };

    fetchUserData();
  }, [user, setUser]);

  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      console.log("Google login successful:", tokenResponse); // Debugging log
      fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          console.log("Fetched user info:", data); // Debugging log
          const avatarUrl = data.picture || 'https://via.placeholder.com/150'; // Fallback if picture is missing
          setUser({
            name: data.name,
            email: data.email,
            savedStories: JSON.parse(localStorage.getItem('library'))?.length || 0,
            avatar: avatarUrl,
          });
          console.log("Avatar URL:", avatarUrl); // Debugging log
        })
        .catch((error) => {
          console.error("Failed to fetch user info:", error);
          alert("Error fetching user information. Please try again.");
        });
    },
    onError: (error) => {
      console.error("Login Failed:", error);
      alert("Google Login failed. Please try again.");
    },
  });

  const handleBilling = async () => {
  try {
    const stripe = await stripePromise;
    let billingApiUrl = getBillingApiUrl();
    console.log("Original Billing API URL:", billingApiUrl);

    // Sanitize URL
    billingApiUrl = billingApiUrl.replace(/\/+$/, '');
    console.log("Sanitized Billing API URL:", billingApiUrl);
    console.log("Billing API URL used in fetch:", billingApiUrl); // Get the Billing API URL dynamically
          const response = await fetch(`${billingApiUrl}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000',
      },
      body: JSON.stringify({
        name: 'Test Product',
        price: 9.99,
      }),
    });
    console.log("Response from fetch:", response);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
      const session = await response.json();
    console.log("Stripe Session:", session);

    // Redirect to Stripe Checkout
    const result = await stripe.redirectToCheckout({ sessionId: session.id });
        if (result.error) {
      console.error("Stripe Checkout Error:", result.error.message);
    }
  } catch (error) {
    console.error("Billing Error:", error.message);
    alert("Error with billing. Please try again later.");
  }
  };

  return (
    <div className={styles.userProfilePage}>
      <h1>Account Settings</h1>

      {!user || user.email === 'guest@example.com' ? (
        <button className={styles.googleLoginButton} onClick={() => login()}>Login with Google</button>
      ) : (
        <>
          {/* Avatar Section */}
          <div className={styles.avatarContainer}>
            <div className={styles.avatar}>
              {user.avatar ? (
                <img src={user.avatar} alt="User Avatar" style={{ width: '100%', height: '100%' }} />
              ) : (
                <img
                  src="https://via.placeholder.com/150" // Placeholder avatar
                  alt="Default Avatar"
                  style={{ width: '100%', height: '100%' }}
                />
              )}
            </div>
            <button className={styles.changeAvatarButton} onClick={() => alert('Avatar change functionality coming soon!')}>
              Change Avatar
            </button>
          </div>

          {/* User Details Section */}
          <div className={styles.userDetails}>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Saved Stories:</strong> {user.savedStories}</p>
          </div>

          {/* Subscription Section */}
          <div className={styles.userDetails}>
            <h2>Subscription Plan</h2>
            <p><strong>Current Plan:</strong> {subscription.plan}</p>
            <p><strong>Status:</strong> {subscription.status}</p>
            <button className={styles.editProfileButton} onClick={handleBilling}>
              Manage Billing
            </button>
          </div>

          <button
            className={styles.editProfileButton}
            onClick={() => alert('Edit Profile functionality coming soon!')}
          >
            Edit Profile
          </button>
        </>
      )}
    </div>
  );
};

export default UserProfile;
