// Path: src/utils/premiumHelper.js
// Focus: Generate and send complete user object with trial subscription during onboarding
// Version Update: Initial scaffolding of trial user creation functionality with subscription management

import { registerOrUpdateUserProfile } from '../api/ApiMaster';

/**
 * Creates a complete user object with trial subscription and sends it via API
 * @param {Object} userData - Minimal user data from onboarding form
 * @param {string} userData.email - User's email address
 * @param {string} userData.name - User's full name
 * @param {string} [userData.password] - User's password (if needed by API)
 * @param {string} [userData.inviteCode] - Optional invite code
 * @param {string} [userData.role] - User role (defaults to 'student')
 * @returns {Promise<Object>} API response with created user data
 */
export async function createTrialUser(userData) {
  try {
    // Validate required fields
    if (!userData?.email || !userData?.name) {
      throw new Error('Email and name are required fields');
    }

    const currentTimestamp = new Date().toISOString();
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 14); // 14 days from now
    const trialEndTimestamp = trialEndDate.toISOString();

    // Generate complete user object
    const completeUserData = {
      // User basic information
      email: userData.email,
      name: userData.name,
      role: userData.role || 'student',
      
      // Include password and invite code if provided
      ...(userData.password && { password: userData.password }),
      ...(userData.inviteCode && { inviteCode: userData.inviteCode }),
      
      // Default metadata
      created_at: currentTimestamp,
      updated_at: currentTimestamp,
      
      // Trial subscription object
      subscription: {
        status: 'trialing',
        plan: 'trial',
        is_trial: true,
        start_date: currentTimestamp,
        trial_end_date: trialEndTimestamp,
        end_date: trialEndTimestamp,
        cancel_at_period_end: false,
        created_at: currentTimestamp,
        updated_at: currentTimestamp
      }
    };

    console.log('Creating trial user with data:', {
      email: completeUserData.email,
      name: completeUserData.name,
      role: completeUserData.role,
      subscription_status: completeUserData.subscription.status
    });

    // Send to API
    const response = await registerOrUpdateUserProfile(completeUserData);
    
    console.log('Trial user created successfully:', {
      email: response.email || completeUserData.email,
      subscription_status: response.subscription?.status || 'created'
    });

    return response;

  } catch (error) {
    console.error('Error creating trial user:', {
      message: error.message,
      email: userData?.email,
      timestamp: new Date().toISOString()
    });
    
    // Re-throw with more context
    throw new Error(`Failed to create trial user: ${error.message}`);
  }
}

/**
 * Creates multiple trial users for different roles (family, classroom, school scenarios)
 * @param {Object} userData - Base user data
 * @param {string[]} roles - Array of roles to create accounts for
 * @returns {Promise<Object[]>} Array of API responses for each created user
 */
export async function createMultipleTrialUsers(userData, roles = ['student']) {
  try {
    const createdUsers = [];
    
    for (const role of roles) {
      const userDataWithRole = {
        ...userData,
        role: role
      };
      
      const createdUser = await createTrialUser(userDataWithRole);
      createdUsers.push(createdUser);
    }
    
    console.log(`Successfully created ${createdUsers.length} trial users with roles:`, roles);
    return createdUsers;

  } catch (error) {
    console.error('Error creating multiple trial users:', error.message);
    throw new Error(`Failed to create multiple trial users: ${error.message}`);
  }
}

/**
 * Utility function to check if a user's trial is still active
 * @param {Object} subscription - User's subscription object
 * @returns {boolean} True if trial is still active
 */
export function isTrialActive(subscription) {
  if (!subscription || !subscription.is_trial) {
    return false;
  }
  
  const now = new Date();
  const trialEnd = new Date(subscription.trial_end_date);
  
  return now < trialEnd && subscription.status === 'trialing';
}

/**
 * Get days remaining in trial
 * @param {Object} subscription - User's subscription object
 * @returns {number} Days remaining in trial (0 if expired or not a trial)
 */
export function getTrialDaysRemaining(subscription) {
  if (!isTrialActive(subscription)) {
    return 0;
  }
  
  const now = new Date();
  const trialEnd = new Date(subscription.trial_end_date);
  const diffTime = trialEnd - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
}