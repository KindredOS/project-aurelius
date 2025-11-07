// ApiMaster.js — Unified Environment Logic + Dispatcher Layer for Cross-Subject Compatibility
import { useState } from "react";

// ✅ Unified environment logic
export const MODE = process.env.REACT_APP_MODE || 'LOCAL';

export const API_BASE =
  process.env.REACT_APP_API_URL ||
  (MODE === 'LOCAL'
    ? 'http://localhost:8000/api'
    : 'https://eduos-worker.shepherdn.workers.dev/api');

console.log('[API] MODE:', MODE);
console.log('[API] BASE:', API_BASE);

// Reactive Hook Support
let apiUrl = API_BASE;

export const setApiUrl = (newUrl) => {
  apiUrl = newUrl;
};

export const getApiUrl = () => apiUrl;

export const useApiUrl = () => {
  const [currentApiUrl, setCurrentApiUrl] = useState(apiUrl);
  const updateApiUrl = (newUrl) => {
    setApiUrl(newUrl);
    setCurrentApiUrl(newUrl);
  };
  return [currentApiUrl, updateApiUrl];
};

// === Static Subject Routes for Safe Imports ===
export const EDU_SCIENCE = `${API_BASE}/edu/science`;
export const EDU_TECHNOLOGY = `${API_BASE}/edu/technology`;
export const EDU_ENGINEERING = `${API_BASE}/edu/engineering`;
export const EDU_ARTS = `${API_BASE}/edu/arts`;
export const EDU_MATH = `${API_BASE}/edu/math`;
export const EDU_LIFESTYLE = `${API_BASE}/edu/lifestyle`;
export const OPENAI_ROUTE = `${API_BASE}/openai`;

// === Role and General APIs ===
export * from './User.js';
export * from './Student.js';
export * from './Teacher.js';
export * from './Admin.js';

// === Subject-Specific APIs ===
export * as ScienceAPI from './Science.js';
export * as TechnologyAPI from './Technology.js';
export * as EngineeringAPI from './Engineering.js';
export * as ArtsAPI from './Arts.js';
export * as MathAPI from './Math.js';
export * as LifestyleAPI from './Lifestyle.js';

// === Subject Dispatcher Layer: Mirrors backend subject routers ===
const subjectMap = {
  science: () => import('./Science.js'),
  math: () => import('./Math.js'),
  technology: () => import('./Technology.js'),
  engineering: () => import('./Engineering.js'),
  arts: () => import('./Arts.js'),
  lifestyle: () => import('./Lifestyle.js')
};

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

export async function fetchChatThread(subject, email, threadId) {
  const mod = await subjectMap[subject]?.();
  return mod?.[`fetch${capitalize(subject)}ChatThread`](email, threadId);
}

export async function fetchChatThreads(subject, email) {
  const mod = await subjectMap[subject]?.();
  return mod?.[`fetch${capitalize(subject)}ChatThreads`](email);
}

export async function saveChatThread(subject, payload) {
  const mod = await subjectMap[subject]?.();
  return mod?.[`save${capitalize(subject)}ChatThread`](payload);
}

export async function fetchStudentMarkdown(subject, email, filepath) {
  const mod = await subjectMap[subject]?.();
  return mod?.[`fetch${capitalize(subject)}StudentMarkdown`](email, filepath);
}

export async function saveStudentMarkdown(subject, email, filepath, content) {
  const mod = await subjectMap[subject]?.();
  return mod?.[`save${capitalize(subject)}StudentMarkdown`](email, filepath, content);
}

export async function logStudyStreak(subject, userId, streakCount) {
  const mod = await subjectMap[subject]?.();
  return mod?.[`log${capitalize(subject)}StudyStreak`](userId, streakCount);
}

export async function submitQuizResult(subject, data) {
  const mod = await subjectMap[subject]?.();
  return mod?.[`submit${capitalize(subject)}QuizResult`](data);
}

export async function logQuizAnalytics(subject, payload) {
  const mod = await subjectMap[subject]?.();
  return mod?.[`log${capitalize(subject)}QuizAnalytics`](payload);
}

export async function fetchTopics(subject) {
  const mod = await subjectMap[subject]?.();
  return mod?.[`fetch${capitalize(subject)}Topics`]();
}

export async function fetchUserProgress(subject, email) {
  const mod = await subjectMap[subject]?.();
  return mod?.[`fetchUser${capitalize(subject)}Progress`](email);
}

export async function queryModel(subject, prompt, modelKey = 'hermes', max_new_tokens = 750) {
  const mod = await subjectMap[subject]?.();
  return mod?.[`query${capitalize(subject)}Model`](prompt, modelKey, max_new_tokens);
}
