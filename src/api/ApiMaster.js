// APIMaster.js — Hybrid Router Index and Config for Frontend API
// Acts as central config and optional single-import hub

export const MODE =
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_MODE)
  || 'CLOUDFLARE'; // Default to CLOUDFLARE if .env is absent

if (!process.env?.REACT_APP_MODE) {
  console.warn('[API] ⚠️ No REACT_APP_MODE set. Falling back to CLOUDFLARE.');
}

export const API_BASE = MODE === 'LOCAL'
  ? 'http://localhost:8000'
  : 'https://your-cloudflare-worker-url';

console.log('[API] MODE:', MODE);
console.log('[API] BASE:', API_BASE);

// Optional: Central re-exports (hybrid style)
export * from './User.js';

