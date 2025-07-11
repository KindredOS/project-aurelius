// api/Science.js
// This file contains all science-specific API helper functions for use with ApiMaster

import { getApiUrl } from './ApiMaster';

export async function submitQuizResult({ topicId, score, total, percentage }) {
  try {
    const response = await fetch(`${getApiUrl()}/science/quiz/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topicId, score, total, percentage })
    });
    return await response.json();
  } catch (err) {
    console.error('[ScienceAPI] submitQuizResult error:', err);
    return null;
  }
}

export async function fetchScienceTopics() {
  try {
    const response = await fetch(`${getApiUrl()}/science/topics`);
    return await response.json();
  } catch (err) {
    console.error('[ScienceAPI] fetchScienceTopics error:', err);
    return [];
  }
}

export async function logStudyStreak(userId, streakCount) {
  try {
    const response = await fetch(`${getApiUrl()}/science/streak`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, streakCount })
    });
    return await response.json();
  } catch (err) {
    console.error('[ScienceAPI] logStudyStreak error:', err);
    return null;
  }
}

// Add more science-specific endpoints as needed (e.g. concept mastery, simulation tracking, etc.)
