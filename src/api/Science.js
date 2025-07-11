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

export async function fetchStudentMarkdown(email, filepath) {
  try {
    const url = `${getApiUrl()}/science/markdown?email=${encodeURIComponent(email)}&filepath=${encodeURIComponent(filepath)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Markdown fetch failed');
    return await response.text();
  } catch (err) {
    console.error('[ScienceAPI] fetchStudentMarkdown error:', err);
    return 'Error loading content.';
  }
}

export async function saveStudentMarkdown(email, filepath, content) {
  try {
    const response = await fetch(`${getApiUrl()}/science/markdown/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, filepath, content })
    });
    return await response.json();
  } catch (err) {
    console.error('[ScienceAPI] saveStudentMarkdown error:', err);
    return null;
  }
}
