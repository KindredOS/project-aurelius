// api/Science.js
// This file contains all science-specific API helper functions for use with ApiMaster

import { getApiUrl } from './ApiMaster.js';

const getBase = () => `${getApiUrl()}/edu/science`;

// Helper function to clean markdown content
function cleanMarkdownContent(content) {
  if (typeof content !== 'string') return content;

  let cleaned = content.replace(/\n/g, '\n');
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  cleaned = cleaned
    .replace(/\t/g, '\t')
    .replace(/\r/g, '\r')
    .replace(/\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\\\\/g, '\\');
  cleaned = cleaned.replace(/^"#\s*/gm, '# ');
  cleaned = cleaned.replace(/^"(#{1,6}\s+[^"]+)"$/gm, '$1');
  cleaned = cleaned.replace(/^"([^"]*?)$/gm, '$1');
  cleaned = cleaned.replace(/(#{1,6}\s+[^\n]+)\n([^\n#])/g, '$1\n\n$2');
  return cleaned;
}

export async function submitScienceQuizResult({ topicId, score, total, percentage }) {
  try {
    const response = await fetch(`${getBase()}/quiz/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topicId, score, total, percentage })
    });
    return await response.json();
  } catch (err) {
    console.error('[ScienceAPI] submitScienceQuizResult error:', err);
    return null;
  }
}

export async function logScienceQuizAnalytics(payload) {
  try {
    const response = await fetch(`${getBase()}/quiz/analytics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await response.json();
  } catch (err) {
    console.error('[ScienceAPI] logScienceQuizAnalytics error:', err);
    return null;
  }
}

export async function fetchScienceTopics() {
  try {
    const response = await fetch(`${getBase()}/topics`);
    return await response.json();
  } catch (err) {
    console.error('[ScienceAPI] fetchScienceTopics error:', err);
    return [];
  }
}

export async function logScienceStudyStreak(userId, streakCount) {
  try {
    const response = await fetch(`${getBase()}/streak`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, streakCount })
    });
    return await response.json();
  } catch (err) {
    console.error('[ScienceAPI] logScienceStudyStreak error:', err);
    return null;
  }
}

export async function fetchScienceStudentMarkdown(email, filepath) {
  try {
    const url = `${getBase()}/markdown?email=${encodeURIComponent(email)}&filepath=${encodeURIComponent(filepath)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Markdown fetch failed');

    const rawContent = await response.text();
    const cleanedContent = cleanMarkdownContent(rawContent);

    console.log('[ScienceAPI] Raw markdown:', rawContent.substring(0, 200));
    console.log('[ScienceAPI] Cleaned markdown:', cleanedContent.substring(0, 200));

    return cleanedContent;
  } catch (err) {
    console.error('[ScienceAPI] fetchScienceStudentMarkdown error:', err);
    return 'Error loading content.';
  }
}

export async function saveScienceStudentMarkdown(email, filepath, content) {
  try {
    const cleanedContent = cleanMarkdownContent(content);
    const response = await fetch(`${getBase()}/markdown/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, filepath, content: cleanedContent })
    });
    return await response.json();
  } catch (err) {
    console.error('[ScienceAPI] saveScienceStudentMarkdown error:', err);
    return null;
  }
}

export async function queryScienceModel(prompt, modelKey = 'hermes', max_new_tokens = 750) {
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
    console.error('[ScienceAPI] queryScienceModel error:', err);
    return 'Error during model query.';
  }
}

export async function saveScienceChatThread({ email, threadId, subject, history }) {
  try {
    const response = await fetch(`${getBase()}/chats/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, threadId, subject, history, timestamp: new Date().toISOString() })
    });
    return await response.json();
  } catch (err) {
    console.error('[ScienceAPI] saveScienceChatThread error:', err);
    return null;
  }
}

export async function fetchScienceChatThreads(email) {
  try {
    const response = await fetch(`${getBase()}/chats/list?email=${encodeURIComponent(email)}`);
    if (!response.ok) throw new Error('Failed to fetch chat threads');
    return await response.json();
  } catch (err) {
    console.error('[ScienceAPI] fetchScienceChatThreads error:', err);
    return [];
  }
}

export async function fetchScienceChatThread(email, threadId) {
  try {
    const response = await fetch(`${getBase()}/chats/${threadId}.json?email=${encodeURIComponent(email)}`);
    if (!response.ok) throw new Error('Failed to fetch chat thread');
    return await response.json();
  } catch (err) {
    console.error('[ScienceAPI] fetchScienceChatThread error:', err);
    return null;
  }
}

export async function fetchUserScienceProgress(email) {
  try {
    const response = await fetch(`${getBase()}/user-index?email=${encodeURIComponent(email)}`);
    if (!response.ok) throw new Error('Failed to fetch user progress');
    return await response.json();
  } catch (err) {
    console.error('[ScienceAPI] fetchUserScienceProgress error:', err);
    return {};
  }
}
