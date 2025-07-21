// User.js — Handles all user-related API logic
import { getApiUrl } from './ApiMaster';

// General Meta Profile APIs
export async function registerOrUpdateUserProfile(profile) {
  const response = await fetch(`${getApiUrl()}/meta/user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile)
  });
  if (!response.ok) throw new Error(`Failed to store user profile: ${response.statusText}`);
  return await response.json();
}

export async function getUserProfile(email) {
  const response = await fetch(`${getApiUrl()}/meta/user/${encodeURIComponent(email)}`);
  if (!response.ok) throw new Error(`Failed to retrieve user profile: ${response.statusText}`);
  return await response.json();
}

// Legacy User Functions (if still needed)
export async function signupUser(userId, name, email) {
  const response = await fetch(`${getApiUrl()}/users/signup/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, name, email }),
  });
  if (!response.ok) throw new Error(`Signup failed: ${response.statusText}`);
  return await response.json();
}

export async function loginUser(userId) {
  const response = await fetch(`${getApiUrl()}/users/login/${userId}`);
  if (!response.ok) throw new Error(`Login failed: ${response.statusText}`);
  return await response.json();
}

export async function addFleetData(userId, fleet) {
  const response = await fetch(`${getApiUrl()}/users/fleet/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, fleet }),
  });
  if (!response.ok) throw new Error(`Adding fleet data failed: ${response.statusText}`);
  return await response.json();
}

export async function deleteFleetData(userId, tileId) {
  const response = await fetch(`${getApiUrl()}/users/fleet/${userId}/${tileId}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error(`Deleting fleet data failed: ${response.statusText}`);
  return await response.json();
}

export async function getFleetData(userId) {
  const response = await fetch(`${getApiUrl()}/users/fleet/${userId}`);
  if (!response.ok) throw new Error(`Fetching fleet data failed: ${response.statusText}`);
  return await response.json();
}
