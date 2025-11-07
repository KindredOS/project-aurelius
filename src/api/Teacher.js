// Teacher.js — Teacher operations only
// Endpoints from system guide: create invite, list students, close classes, class status.
// NOTE: All routes are under /api/edu/teachers/... 
// ApiMaster.getApiUrl() prepends the /api base and environment-specific host.
// Backend router: teacher.py (APIRouter prefix="/teachers")

import { getApiUrl } from './ApiMaster';

// === CLASS INVITES ===

// Create a class invite (teacher)
export async function createClassInvite({ teacherEmail, classCode, options = {} }) {
  const response = await fetch(
    `${getApiUrl()}/edu/teachers/${encodeURIComponent(teacherEmail)}/classes/${encodeURIComponent(classCode)}/invite-codes`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(options),
    }
  );
  if (!response.ok) throw new Error(`Create class invite failed: ${response.statusText}`);
  return await response.json();
}

// View teacher's students in a given class
export async function getClassStudents(teacherEmail, classCode) {
  const response = await fetch(
    `${getApiUrl()}/edu/teachers/${encodeURIComponent(teacherEmail)}/classes/${encodeURIComponent(classCode)}/students`
  );
  if (!response.ok) throw new Error(`Fetching class students failed: ${response.statusText}`);
  return await response.json();
}

// === CLASS MANAGEMENT ===

// Create a new class for a teacher
export async function createTeacherClass(teacherEmail, payload) {
  const response = await fetch(
    `${getApiUrl()}/edu/teachers/${encodeURIComponent(teacherEmail)}/classes`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to create class: ${response.status} ${errText}`);
  }

  return response.json();
}

// List all classes for a teacher
export async function listTeacherClasses(teacherEmail) {
  const response = await fetch(
    `${getApiUrl()}/edu/teachers/${encodeURIComponent(teacherEmail)}/classes`
  );
  if (!response.ok) throw new Error(`List classes failed: ${response.statusText}`);
  return await response.json();
}

// Delete (deactivate) a teacher class
export async function deleteTeacherClass(teacherEmail, classCode) {
  const response = await fetch(
    `${getApiUrl()}/edu/teachers/${encodeURIComponent(teacherEmail)}/classes/${encodeURIComponent(classCode)}`,
    { method: "DELETE" }
  );
  if (!response.ok) throw new Error(`Delete class failed: ${response.statusText}`);
  return await response.json();
}

// === CLASS STATUS (optional helper) ===
export async function getClassStatus(teacherEmail, classCode) {
  const response = await fetch(
    `${getApiUrl()}/edu/teachers/${encodeURIComponent(teacherEmail)}/classes/${encodeURIComponent(classCode)}`
  );
  if (!response.ok) throw new Error(`Fetching class status failed: ${response.statusText}`);
  return await response.json();
}

// === NEW: ADD STUDENT ===
export async function addStudentToClass(teacherEmail, classCode, studentEmail, inviteCode) {
  const response = await fetch(
    `${getApiUrl()}/edu/teachers/${encodeURIComponent(teacherEmail)}/classes/${encodeURIComponent(classCode)}/students`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        student_email: studentEmail,
        invite_code: inviteCode,   // ✅ include invite_code
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to add student: ${response.status} ${errText}`);
  }

  return await response.json();
}

// === MBTI SUPPORT ===
export async function saveTeacherMBTI({ email, mbti }) {
  const response = await fetch(
    `${getApiUrl()}/edu/teachers/${encodeURIComponent(email)}/save-mbti`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mbti }),
    }
  );
  if (!response.ok) throw new Error(`Save MBTI failed: ${response.statusText}`);
  return await response.json();
}

export async function fetchTeacherMBTI(email) {
  const response = await fetch(
    `${getApiUrl()}/edu/teachers/${encodeURIComponent(email)}/mbti`
  );
  if (!response.ok) throw new Error(`Fetch MBTI failed: ${response.statusText}`);
  return await response.json();
}
