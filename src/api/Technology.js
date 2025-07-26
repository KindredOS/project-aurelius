// api/Technology.js
// This file contains all technology-specific API helper functions for use with ApiMaster

import { getApiUrl } from './ApiMaster.js';

const getBase = () => `${getApiUrl()}/edu/technology`;

export async function submitTechnologyQuizResult({ topicId, score, total, percentage }) {
  try {
    const response = await fetch(`${getBase()}/quiz/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topicId, score, total, percentage })
    });
    return await response.json();
  } catch (err) {
    console.error('[TechnologyAPI] submitTechnologyQuizResult error:', err);
    return null;
  }
}

export async function logTechnologyQuizAnalytics(payload) {
  try {
    const response = await fetch(`${getBase()}/quiz/analytics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await response.json();
  } catch (err) {
    console.error('[TechnologyAPI] logTechnologyQuizAnalytics error:', err);
    return null;
  }
}

export async function fetchTechnologyTopics() {
  try {
    const response = await fetch(`${getBase()}/topics`);
    return await response.json();
  } catch (err) {
    console.error('[TechnologyAPI] fetchTechnologyTopics error:', err);
    return [];
  }
}

export async function logTechnologyStudyStreak(userId, streakCount) {
  try {
    const response = await fetch(`${getBase()}/streak`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, streakCount })
    });
    return await response.json();
  } catch (err) {
    console.error('[TechnologyAPI] logTechnologyStudyStreak error:', err);
    return null;
  }
}

export async function fetchTechnologyStudentMarkdown(email, filepath) {
  try {
    const url = `${getBase()}/markdown?email=${encodeURIComponent(email)}&filepath=${encodeURIComponent(filepath)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Markdown fetch failed');

    const rawContent = await response.text();
    return rawContent;
  } catch (err) {
    console.error('[TechnologyAPI] fetchTechnologyStudentMarkdown error:', err);
    return 'Error loading content.';
  }
}

export async function saveTechnologyStudentMarkdown(email, filepath, content) {
  try {
    const response = await fetch(`${getBase()}/markdown/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, filepath, content })
    });
    return await response.json();
  } catch (err) {
    console.error('[TechnologyAPI] saveTechnologyStudentMarkdown error:', err);
    return null;
  }
}

export async function queryTechnologyModel(prompt, modelKey = 'hermes', max_new_tokens = 750) {
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
    console.error('[TechnologyAPI] queryTechnologyModel error:', err);
    return 'Error during model query.';
  }
}

export async function saveTechnologyChatThread({ email, threadId, subject, history }) {
  try {
    const response = await fetch(`${getBase()}/chats/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, threadId, subject, history, timestamp: new Date().toISOString() })
    });
    return await response.json();
  } catch (err) {
    console.error('[TechnologyAPI] saveTechnologyChatThread error:', err);
    return null;
  }
}

export async function fetchTechnologyChatThreads(email) {
  try {
    const response = await fetch(`${getBase()}/chats/list?email=${encodeURIComponent(email)}`);
    if (!response.ok) throw new Error('Failed to fetch chat threads');
    return await response.json();
  } catch (err) {
    console.error('[TechnologyAPI] fetchTechnologyChatThreads error:', err);
    return [];
  }
}

export async function fetchTechnologyChatThread(email, threadId) {
  try {
    const response = await fetch(`${getBase()}/chats/${threadId}.json?email=${encodeURIComponent(email)}`);
    if (!response.ok) throw new Error('Failed to fetch chat thread');
    return await response.json();
  } catch (err) {
    console.error('[TechnologyAPI] fetchTechnologyChatThread error:', err);
    return null;
  }
}

export async function fetchUserTechnologyProgress(email) {
  try {
    const response = await fetch(`${getBase()}/user-index?email=${encodeURIComponent(email)}`);
    if (!response.ok) throw new Error('Failed to fetch user progress');
    return await response.json();
  } catch (err) {
    console.error('[TechnologyAPI] fetchUserTechnologyProgress error:', err);
    return {};
  }
}
