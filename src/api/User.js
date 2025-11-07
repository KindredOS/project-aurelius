// User.js — User & Student API (no teacher/admin ops)
// Keeps your existing structure and /edu prefix for parity.
// Source alignment: current User.js and system guide.

import { getApiUrl } from './ApiMaster';

// ------------------------------
// Registration / Login
// ------------------------------
export async function registerOrUpdateUserProfile(profile) {
  const response = await fetch(`${getApiUrl()}/edu/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile)
  });
  if (!response.ok) throw new Error(`Failed to store user profile: ${response.statusText}`);
  return await response.json();
}

export async function signupUser(userId, name, email) {
  const response = await fetch(`${getApiUrl()}/edu/users/signup/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, name, email }),
  });
  if (!response.ok) throw new Error(`Signup failed: ${response.statusText}`);
  return await response.json();
}

export async function loginUser(userId) {
  const response = await fetch(`${getApiUrl()}/edu/users/login/${encodeURIComponent(userId)}`);
  if (!response.ok) throw new Error(`Login failed: ${response.statusText}`);
  return await response.json();
}

// ------------------------------
// Password / Security (user-facing)
// ------------------------------
export async function requestPasswordReset(email) {
  const response = await fetch(`${getApiUrl()}/edu/request-password-reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) throw new Error(`Request password reset failed: ${response.statusText}`);
  return await response.json();
}

export async function resetPassword(token, new_password) {
  const response = await fetch(`${getApiUrl()}/edu/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, new_password }),
  });
  if (!response.ok) throw new Error(`Reset password failed: ${response.statusText}`);
  return await response.json();
}

export async function upgradeLegacyPassword(email, old_password, new_password) {
  const response = await fetch(`${getApiUrl()}/edu/upgrade-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, old_password, new_password }),
  });
  if (!response.ok) throw new Error(`Upgrade legacy password failed: ${response.statusText}`);
  return await response.json();
}

// ------------------------------
// Profile / Data
// ------------------------------
export async function getUserProfile(email) {
  const response = await fetch(`${getApiUrl()}/edu/users/data/${encodeURIComponent(email)}`);
  if (!response.ok) throw new Error(`Failed to retrieve user profile: ${response.statusText}`);
  return await response.json();
}

export async function updateUserData(email, data) {
  const response = await fetch(`${getApiUrl()}/edu/users/data/${encodeURIComponent(email)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Updating user data failed: ${response.statusText}`);
  return await response.json();
}

export async function fetchUserMBTI(email) {
  const response = await fetch(`${getApiUrl()}/edu/users/data/${encodeURIComponent(email)}`);
  if (!response.ok) throw new Error(`Fetching MBTI data failed: ${response.statusText}`);
  return await response.json();
}

// ------------------------------
// Student: Class & Invite
// ------------------------------
export async function joinClassWithInvite({ email, inviteCode }) {
  const response = await fetch(`${getApiUrl()}/edu/students/join-class`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, inviteCode }),
  });
  if (!response.ok) throw new Error(`Join class failed: ${response.statusText}`);
  return await response.json();
}

export async function getClassHistory(email) {
  const response = await fetch(`${getApiUrl()}/edu/students/${encodeURIComponent(email)}/class-history`);
  if (!response.ok) throw new Error(`Fetching class history failed: ${response.statusText}`);
  return await response.json();
}

// ------------------------------
// (Optional) User-owned Fleet (still user-centric)
// ------------------------------
export async function addFleetData(userId, fleet) {
  const response = await fetch(`${getApiUrl()}/edu/users/fleet/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, fleet }),
  });
  if (!response.ok) throw new Error(`Adding fleet data failed: ${response.statusText}`);
  return await response.json();
}

export async function deleteFleetData(userId, tileId) {
  const response = await fetch(`${getApiUrl()}/edu/users/fleet/${encodeURIComponent(userId)}/${encodeURIComponent(tileId)}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error(`Deleting fleet data failed: ${response.statusText}`);
  return await response.json();
}

export async function getFleetData(userId) {
  const response = await fetch(`${getApiUrl()}/edu/users/fleet/${encodeURIComponent(userId)}`);
  if (!response.ok) throw new Error(`Fetching fleet data failed: ${response.statusText}`);
  return await response.json();
}
