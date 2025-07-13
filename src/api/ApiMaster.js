// APIMaster.js — Hybrid Router Index and Config for Frontend API
// Acts as central config and optional single-import hub
import { useState } from "react";

export const MODE = (typeof process !== 'undefined' && process.env?.REACT_APP_MODE) || 'LOCAL';

if (!process.env?.REACT_APP_MODE) {
  console.warn('[API] ⚠️ No REACT_APP_MODE set. Falling back to LOCAL.');
}

export const API_BASE = MODE === 'LOCAL'
  ? 'http://localhost:8000/api'
  : 'https://eduos-worker.shepherdn.workers.dev/api'; // Updated with full https path

// Static route constants for safe imports
export const EDU_SCIENCE = `${API_BASE}/edu/science`;
export const OPENAI_ROUTE = `${API_BASE}/openai`;

console.log('[API] MODE:', MODE);
console.log('[API] BASE:', API_BASE);
console.log('[API] EDU_SCIENCE:', EDU_SCIENCE);
console.log('[API] OpenAI Route:', OPENAI_ROUTE);

// Reactive Hook Support for Dynamic API URL
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

// Central re-exports (hybrid style) - like your other app
export * from './User.js';
export * from './Math.js';
export * from './Admin.js';
export * from './Science.js';
