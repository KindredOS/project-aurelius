// api/Arts.js
// This file contains all arts-specific API helper functions for use with ApiMaster

import { getApiUrl } from './ApiMaster.js';

const getBase = () => `${getApiUrl()}/edu/arts`;

export async function submitArtsQuizResult({ topicId, score, total, percentage }) {
  try {
    const response = await fetch(`${getBase()}/quiz/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topicId, score, total, percentage })
    });
    return await response.json();
  } catch (err) {
    console.error('[ArtsAPI] submitArtsQuizResult error:', err);
    return null;
  }
}

export async function logArtsQuizAnalytics(payload) {
  try {
    const response = await fetch(`${getBase()}/quiz/analytics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await response.json();
  } catch (err) {
    console.error('[ArtsAPI] logArtsQuizAnalytics error:', err);
    return null;
  }
}

export async function fetchArtsTopics() {
  try {
    const response = await fetch(`${getBase()}/topics`);
    return await response.json();
  } catch (err) {
    console.error('[ArtsAPI] fetchArtsTopics error:', err);
    return [];
  }
}

export async function logArtsStudyStreak(userId, streakCount) {
  try {
    const response = await fetch(`${getBase()}/streak`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, streakCount })
    });
    return await response.json();
  } catch (err) {
    console.error('[ArtsAPI] logArtsStudyStreak error:', err);
    return null;
  }
}

export async function fetchArtsStudentMarkdown(email, filepath) {
  try {
    const url = `${getBase()}/markdown?email=${encodeURIComponent(email)}&filepath=${encodeURIComponent(filepath)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Markdown fetch failed');

    const rawContent = await response.text();
    return rawContent;
  } catch (err) {
    console.error('[ArtsAPI] fetchArtsStudentMarkdown error:', err);
    return 'Error loading content.';
  }
}

export async function saveArtsStudentMarkdown(email, filepath, content) {
  try {
    const response = await fetch(`${getBase()}/markdown/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, filepath, content })
    });
    return await response.json();
  } catch (err) {
    console.error('[ArtsAPI] saveArtsStudentMarkdown error:', err);
    return null;
  }
}

export async function queryArtsModel(prompt, modelKey = 'hermes', max_new_tokens = 750) {
  try {
    const response = await fetch(`${getApiUrl()}/model/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: prompt, model_key: modelKey, max_new_tokens })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Model query failed: ${errorText}`);
    }

    const result = await response.json();
    return result.response || 'No response received.';
  } catch (err) {
    console.error('[ArtsAPI] queryArtsModel error:', err);
    return 'Error during model query.';
  }
}

export async function saveArtsChatThread({ email, threadId, subject, history }) {
  try {
    const response = await fetch(`${getBase()}/chats/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, threadId, subject, history, timestamp: new Date().toISOString() })
    });
    return await response.json();
  } catch (err) {
    console.error('[ArtsAPI] saveArtsChatThread error:', err);
    return null;
  }
}

export async function fetchArtsChatThreads(email) {
  try {
    const response = await fetch(`${getBase()}/chats/list?email=${encodeURIComponent(email)}`);
    if (!response.ok) throw new Error('Failed to fetch chat threads');
    return await response.json();
  } catch (err) {
    console.error('[ArtsAPI] fetchArtsChatThreads error:', err);
    return [];
  }
}

export async function fetchArtsChatThread(email, threadId) {
  try {
    const response = await fetch(`${getBase()}/chats/${threadId}.json?email=${encodeURIComponent(email)}`);
    if (!response.ok) throw new Error('Failed to fetch chat thread');
    return await response.json();
  } catch (err) {
    console.error('[ArtsAPI] fetchArtsChatThread error:', err);
    return null;
  }
}

export async function fetchUserArtsProgress(email) {
  try {
    const response = await fetch(`${getBase()}/user-index?email=${encodeURIComponent(email)}`);
    if (!response.ok) throw new Error('Failed to fetch user progress');
    return await response.json();
  } catch (err) {
    console.error('[ArtsAPI] fetchUserArtsProgress error:', err);
    return {};
  }
}
