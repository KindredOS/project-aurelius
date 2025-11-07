// Admin.js — Enhanced Admin API (drop-in)
// Preserves your existing endpoints and adds:
// - transferStudent
// - getDomainOverview
// - setSchoolYearConfig / getSchoolYearConfig
// - migrateLegacyInvites
//
// Paths & capabilities aligned to system guide and your User.js conventions.
// Guide refs: /edu/admin/transfer-student, /edu/admin/{email}/domain-overview,
// /edu/school-year/config (GET/PUT), /edu/admin/migrate-legacy-invites
// See: user_management_guide.md and User.js for parity.

import { getApiUrl } from './ApiMaster'; // :contentReference[oaicite:2]{index=2}

// ----- small helper to DRY error handling -----
async function request(path, opts = {}) {
  const res = await fetch(`${getApiUrl()}${path}`, opts);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`[AdminAPI] ${opts.method || 'GET'} ${path} failed: ${res.status} ${text}`);
  }
  // Some admin actions may return 204; normalize to {}.
  if (res.status === 204) return {};
  return res.json();
}

// ======== Dashboard Initialization ========
export async function fetchAdminInit() {
  try {
    return await request(`/edu/admin/init`);
  } catch (error) {
    console.error('[AdminAPI] Init Error:', error);
    throw error;
  }
}

// ======== User Management ========
export async function fetchAllUsers() {
  try {
    return await request(`/edu/admin/users`);
  } catch (error) {
    console.error('[AdminAPI] Fetch Users Error:', error);
    throw error;
  }
}

export async function fetchUsersByRole(role) {
  try {
    const r = encodeURIComponent(role);
    return await request(`/edu/admin/users/${r}`);
  } catch (error) {
    console.error(`[AdminAPI] Fetch ${role} Users Error:`, error);
    throw error;
  }
}

export async function deleteUser(userEmail) {
  try {
    const email = encodeURIComponent(userEmail);
    return await request(`/edu/admin/users/${email}`, { method: 'DELETE' });
  } catch (error) {
    console.error('[AdminAPI] Delete User Error:', error);
    throw error;
  }
}

// ======== Notices Management ========
export async function fetchNotices() {
  try {
    return await request(`/edu/admin/notices`);
  } catch (error) {
    console.error('[AdminAPI] Fetch Notices Error:', error);
    throw error;
  }
}

export async function createNotice(noticeData) {
  try {
    return await request(`/edu/admin/notices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(noticeData),
    });
  } catch (error) {
    console.error('[AdminAPI] Create Notice Error:', error);
    throw error;
  }
}

export async function deleteNotice(noticeId) {
  try {
    const id = encodeURIComponent(noticeId);
    return await request(`/edu/admin/notices/${id}`, { method: 'DELETE' });
  } catch (error) {
    console.error('[AdminAPI] Delete Notice Error:', error);
    throw error;
  }
}

// ======== Invite Codes Management ========
export async function fetchInviteCodes() {
  try {
    return await request(`/edu/admin/invite-codes`);
  } catch (error) {
    console.error('[AdminAPI] Fetch Invite Codes Error:', error);
    throw error;
  }
}

export async function createInviteCode(codeData) {
  try {
    return await request(`/edu/admin/invite-codes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(codeData),
    });
  } catch (error) {
    console.error('[AdminAPI] Create Invite Code Error:', error);
    throw error;
  }
}

export async function deleteInviteCode(code) {
  try {
    const c = encodeURIComponent(code);
    return await request(`/edu/admin/invite-codes/${c}`, { method: 'DELETE' });
  } catch (error) {
    console.error('[AdminAPI] Delete Invite Code Error:', error);
    throw error;
  }
}

// ======== Metrics and Analytics ========
export async function fetchSchoolMetrics() {
  try {
    return await request(`/edu/admin/metrics`);
  } catch (error) {
    console.error('[AdminAPI] Fetch Metrics Error:', error);
    throw error;
  }
}

// ======== System Administration ========
export async function createSystemBackup() {
  try {
    return await request(`/edu/admin/system/backup`, { method: 'POST' });
  } catch (error) {
    console.error('[AdminAPI] Create Backup Error:', error);
    throw error;
  }
}

export async function fetchSystemLogs() {
  try {
    return await request(`/edu/admin/system/logs`);
  } catch (error) {
    console.error('[AdminAPI] Fetch Logs Error:', error);
    throw error;
  }
}

// ======== NEW: Domain Overview (Admin) ========
// Guide: GET /edu/admin/{email}/domain-overview
export async function getDomainOverview(adminEmail) {
  try {
    const email = encodeURIComponent(adminEmail);
    return await request(`/edu/admin/${email}/domain-overview`); // :contentReference[oaicite:3]{index=3}
  } catch (error) {
    console.error('[AdminAPI] Domain Overview Error:', error);
    throw error;
  }
}

// ======== NEW: Transfer Student (Admin) ========
// Guide: POST /edu/admin/transfer-student
export async function transferStudent({
  adminEmail,
  studentEmail,
  targetTeacherEmail,
  targetClassCode,
  reason = '',
}) {
  try {
    return await request(`/edu/admin/transfer-student`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adminEmail,
        studentEmail,
        targetTeacherEmail,
        targetClassCode,
        reason,
      }),
    }); // :contentReference[oaicite:4]{index=4}
  } catch (error) {
    console.error('[AdminAPI] Transfer Student Error:', error);
    throw error;
  }
}

// ======== NEW: School Year Config (Admin) ========
// Guide: PUT /edu/school-year/config, GET /edu/school-year/config?domain=...
export async function setSchoolYearConfig(domain, config) {
  try {
    return await request(`/edu/school-year/config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain, ...config }),
    }); // :contentReference[oaicite:5]{index=5}
  } catch (error) {
    console.error('[AdminAPI] Set School Year Config Error:', error);
    throw error;
  }
}

export async function getSchoolYearConfig(domain) {
  try {
    const q = `?domain=${encodeURIComponent(domain)}`;
    return await request(`/edu/school-year/config${q}`); // :contentReference[oaicite:6]{index=6}
  } catch (error) {
    console.error('[AdminAPI] Get School Year Config Error:', error);
    throw error;
  }
}

// ======== NEW: Legacy Migrations ========
// Guide: POST /edu/admin/migrate-legacy-invites
export async function migrateLegacyInvites(adminEmail) {
  try {
    return await request(`/edu/admin/migrate-legacy-invites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminEmail }),
    }); // :contentReference[oaicite:7]{index=7}
  } catch (error) {
    console.error('[AdminAPI] Migrate Legacy Invites Error:', error);
    throw error;
  }
}

// ======== Engagement Analytics (Admin) ========
export async function fetchAllEngagement() {
  try {
    return await request(`/edu/admin/engagement`);
  } catch (error) {
    console.error('[AdminAPI] Fetch Engagement Error:', error);
    throw error;
  }
}
 