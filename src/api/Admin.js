// Admin.js — Enhanced Admin API functions
import { getApiUrl } from './ApiMaster';

// ======== Dashboard Initialization ========
export async function fetchAdminInit() {
  try {
    const response = await fetch(`${getApiUrl()}/edu/admin/init`); // Updated path
    if (!response.ok) {
      throw new Error(`Failed to fetch admin init: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('[AdminAPI] Init Error:', error);
    throw error;
  }
}

// ======== User Management ========
export async function fetchAllUsers() {
  try {
    const response = await fetch(`${getApiUrl()}/edu/admin/users`); // Updated path
    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('[AdminAPI] Fetch Users Error:', error);
    throw error;
  }
}

export async function fetchUsersByRole(role) {
  try {
    const response = await fetch(`${getApiUrl()}/edu/admin/users/${role}`); // Updated path
    if (!response.ok) {
      throw new Error(`Failed to fetch ${role} users: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`[AdminAPI] Fetch ${role} Users Error:`, error);
    throw error;
  }
}

export async function deleteUser(userEmail) {
  try {
    const response = await fetch(`${getApiUrl()}/edu/admin/users/${userEmail}`, { // Updated path
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete user: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('[AdminAPI] Delete User Error:', error);
    throw error;
  }
}

// ======== Notices Management ========
export async function fetchNotices() {
  try {
    const response = await fetch(`${getApiUrl()}/edu/admin/notices`); // Updated path
    if (!response.ok) {
      throw new Error(`Failed to fetch notices: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('[AdminAPI] Fetch Notices Error:', error);
    throw error;
  }
}

export async function createNotice(noticeData) {
  try {
    const response = await fetch(`${getApiUrl()}/edu/admin/notices`, { // Updated path
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(noticeData),
    });
    if (!response.ok) {
      throw new Error(`Failed to create notice: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('[AdminAPI] Create Notice Error:', error);
    throw error;
  }
}

export async function deleteNotice(noticeId) {
  try {
    const response = await fetch(`${getApiUrl()}/edu/admin/notices/${noticeId}`, { // Updated path
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete notice: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('[AdminAPI] Delete Notice Error:', error);
    throw error;
  }
}

// ======== Invite Codes Management ========
export async function fetchInviteCodes() {
  try {
    const response = await fetch(`${getApiUrl()}/edu/admin/invite-codes`); // Updated path
    if (!response.ok) {
      throw new Error(`Failed to fetch invite codes: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('[AdminAPI] Fetch Invite Codes Error:', error);
    throw error;
  }
}

export async function createInviteCode(codeData) {
  try {
    const response = await fetch(`${getApiUrl()}/edu/admin/invite-codes`, { // Updated path
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(codeData),
    });
    if (!response.ok) {
      throw new Error(`Failed to create invite code: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('[AdminAPI] Create Invite Code Error:', error);
    throw error;
  }
}

export async function deleteInviteCode(code) {
  try {
    const response = await fetch(`${getApiUrl()}/edu/admin/invite-codes/${code}`, { // Updated path
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete invite code: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('[AdminAPI] Delete Invite Code Error:', error);
    throw error;
  }
}

// ======== Metrics and Analytics ========
export async function fetchSchoolMetrics() {
  try {
    const response = await fetch(`${getApiUrl()}/edu/admin/metrics`); // Updated path
    if (!response.ok) {
      throw new Error(`Failed to fetch metrics: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('[AdminAPI] Fetch Metrics Error:', error);
    throw error;
  }
}

// ======== System Administration ========
export async function createSystemBackup() {
  try {
    const response = await fetch(`${getApiUrl()}/edu/admin/system/backup`, { // Updated path
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error(`Failed to create backup: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('[AdminAPI] Create Backup Error:', error);
    throw error;
  }
}

export async function fetchSystemLogs() {
  try {
    const response = await fetch(`${getApiUrl()}/edu/admin/system/logs`); // Updated path
    if (!response.ok) {
      throw new Error(`Failed to fetch logs: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('[AdminAPI] Fetch Logs Error:', error);
    throw error;
  }
}
