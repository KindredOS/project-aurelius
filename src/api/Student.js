// student.js

import { API_BASE } from "./ApiMaster";

// Engagement tracker endpoint
export async function logStudentEngagement(userEmail, minutes, token) {
  const endpoint = `${API_BASE}/edu/student/${encodeURIComponent(userEmail)}/engagement`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ minutes }),
  });

  if (!res.ok) {
    throw new Error(`[API] Engagement log failed (${res.status})`);
  }

  return res.json();
}
