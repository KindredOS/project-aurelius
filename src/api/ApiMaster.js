// APIMaster.js — Hybrid Router Index and Config for Frontend API
import { useState } from "react";
import * as UserAPI from './User.js';
import * as MathAPI from './Math.js';
import * as AdminAPI from './Admin.js';

export const MODE =
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_MODE)
  || 'LOCAL'; // Default to LOCAL for development

if (!process.env?.REACT_APP_MODE) {
  console.warn('[API] ⚠️ No REACT_APP_MODE set. Falling back to LOCAL.');
}

// Set API base path based on mode
export const API_BASE = MODE === 'LOCAL'
  ? 'http://localhost:8000/api'
  : 'https://your-cloudflare-worker-url/api'; // Update with actual prod URL

console.log('[API] MODE:', MODE);
console.log('[API] BASE:', API_BASE);

// Namespace re-export
export { UserAPI, MathAPI, AdminAPI };

// Reactive Hook Support for Dynamic API URL
let apiUrl = API_BASE; // Start with API_BASE

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
