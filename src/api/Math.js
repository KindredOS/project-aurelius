// Math.js — Handles MathDashboard data via API
import { getApiUrl } from './ApiMaster';

export async function getMasteryData(userName) {
  const response = await fetch(`${getApiUrl()}/edu/${userName}/mastery`);
  if (!response.ok) throw new Error(`Failed to retrieve mastery: ${response.statusText}`);
  return await response.json();
}

export async function saveMasteryData(userName, mastery) {
  const response = await fetch(`${getApiUrl()}/edu/${userName}/mastery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mastery)
  });
  if (!response.ok) throw new Error(`Failed to save mastery: ${response.statusText}`);
  return await response.json();
}

export async function logSessionResult(userName, sessionData) {
  const response = await fetch(`${getApiUrl()}/edu/${userName}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sessionData)
  });
  if (!response.ok) throw new Error(`Failed to save session: ${response.statusText}`);
  return await response.json();
}

export async function unlockReward(email, concept) {
  const response = await fetch(`${getApiUrl()}/edu/${email}/rewards/${concept}`, {
    method: 'POST'
  });
  if (!response.ok) throw new Error(`Failed to unlock reward for ${concept}`);
  return await response.json();
}

export async function getUnlockedRewards(email) {
  const response = await fetch(`${getApiUrl()}/edu/${email}/rewards`);
  if (!response.ok) throw new Error(`Failed to fetch unlocked rewards`);
  return await response.json();
}

export async function logToolUsage(email, tool) {
  const response = await fetch(`${getApiUrl()}/edu/${email}/tool_usage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tool,
      timestamp: new Date().toISOString()
    })
  });
  if (!response.ok) throw new Error(`Failed to log tool usage`);
  return await response.json();
}
