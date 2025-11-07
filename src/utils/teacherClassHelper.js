// src/utils/teacherClassHelper.js
// Fixed utilities for class management - compatible with existing backend

import {
  listTeacherClasses,
  createTeacherClass,
  addStudentToClass,
  // removeStudentFromClass (TODO: when endpoint ready)
} from "../api/ApiMaster";

const SUBJECT_MAP = {
  Science: "SCI",
  Technology: "TEC",
  Engineering: "ENG",
  Arts: "ART",
  Math: "MAT",
  Lifestyle: "LIF",
};

const SUBJECT_OPTIONS = [
  "Science",
  "Technology",
  "Engineering",
  "Arts",
  "Math",
  "Lifestyle",
];

// --- Code Generation ---
export function generateInviteCode(name, subject) {
  const prefix = SUBJECT_MAP[subject] || "CLS";
  const cleanName = name.replace(/[^a-zA-Z0-9]/g, "").substring(0, 4).toUpperCase();

  const now = new Date();
  const year = now.getFullYear();
  const shortYear = String(year).slice(-2);
  const nextYear = String(year + 1).slice(-2);

  return `${prefix}-${cleanName}${shortYear}-${nextYear}`;
}

// --- Validation ---
export function validateClassData(classData) {
  const errors = [];

  if (!classData.name?.trim()) {
    errors.push("Class name is required");
  }

  if (classData.name && classData.name.length > 50) {
    errors.push("Class name must be 50 characters or less");
  }

  if (classData.inviteCode && !/^[A-Z0-9-]+$/i.test(classData.inviteCode)) {
    errors.push("Invite code can only contain letters, numbers, and hyphens");
  }

  if (!SUBJECT_OPTIONS.includes(classData.subject)) {
    errors.push("Invalid subject selection");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email?.trim());
}

// --- UI Helper Functions ---
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return { success: true, message: `Copied: ${text}` };
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    return { success: false, message: "Failed to copy to clipboard" };
  }
}

export function promptForEmail(message = "Enter student email:") {
  const email = window.prompt(message);
  if (!email) return null;

  const trimmedEmail = email.trim();
  if (!validateEmail(trimmedEmail)) {
    window.alert("Please enter a valid email address");
    return null;
  }

  return trimmedEmail;
}

export function confirmStudentRemoval(email) {
  return window.confirm(`Remove ${email} from this class?`);
}

// --- Form State Helpers ---
export function createEmptyClassForm() {
  return {
    name: "",
    inviteCode: "",
    subject: "Science",
  };
}

export function prepareClassDataForSubmission(formData) {
  return {
    name: formData.name.trim(),
    subject: formData.subject,
    inviteCode:
      formData.inviteCode.trim() ||
      generateInviteCode(formData.name, formData.subject),
  };
}

// --- Payload Builder for API ---
export function buildClassPayload(state) {
  const classData = {
    name: state.name,
    inviteCode: state.inviteCode,
    subject: state.subject,
  };

  const validation = validateClassData(classData);
  if (!validation.isValid) {
    throw new Error(validation.errors.join(", "));
  }

  const prepared = prepareClassDataForSubmission(classData);

  // ✅ Match backend expectations exactly
  return {
    class_name: prepared.name,
    class_code: prepared.inviteCode,
    grade_level: "5", // String as backend expects
    subject: prepared.subject,
    max_students: 30,
    description: "eat the code",
  };
}

// --- Data Normalization for Backend Response ---
export function normalizeClassData(rawClass) {
  // Handle both response formats from your backend
  return {
    class_code: rawClass.class_code,
    class_name: rawClass.class_name || rawClass.name,
    grade_level: rawClass.grade_level,
    subject: rawClass.subject,
    description: rawClass.description,
    max_students: rawClass.max_students,
    current_students: rawClass.current_students || (rawClass.students ? rawClass.students.length : 0),
    created_at: rawClass.created_at,
    status: rawClass.status,
    students: rawClass.students || [], // Always ensure this is an array
  };
}

export function normalizeClassesResponse(response) {
  // Handle different response structures from your backend
  let classes = [];
  
  if (Array.isArray(response)) {
    classes = response;
  } else if (response.classes && Array.isArray(response.classes)) {
    classes = response.classes;
  } else if (response.data && Array.isArray(response.data)) {
    classes = response.data;
  }

  return classes.map(normalizeClassData);
}

// --- Error Message Helpers ---
export function getErrorMessage(error, operation = "operation") {
  if (error?.response?.data?.detail) {
    return error.response.data.detail;
  }
  if (error?.message) return error.message;
  if (typeof error === "string") return error;
  return `Failed to complete ${operation}. Please try again.`;
}

export function isValidationError(error) {
  const message = getErrorMessage(error);
  return (
    message.includes("required") ||
    message.includes("invalid") ||
    message.includes("validation") ||
    message.includes("already exists")
  );
}

// --- State Management Helpers ---
export function createStateUpdater(setState) {
  return {
    setLoading: (loading) =>
      setState((prev) => ({ ...prev, isLoading: loading })),
    setError: (error) =>
      setState((prev) => ({ ...prev, error: getErrorMessage(error) })),
    setMessage: (message) => setState((prev) => ({ ...prev, message })),
    clearMessages: () =>
      setState((prev) => ({ ...prev, error: "", message: "" })),
    updateClasses: (classes) =>
      setState((prev) => ({ ...prev, classes: normalizeClassesResponse(classes) })),
    resetForm: () =>
      setState((prev) => ({
        ...prev,
        showNewClassForm: false,
        ...createEmptyClassForm(),
      })),
  };
}

// --- Orchestration Flows (Async with API) ---
export async function createClassFlow(teacherEmail, state, stateUpdater) {
  if (!teacherEmail) {
    stateUpdater.setError("No teacher email found. Please log in again.");
    return;
  }

  stateUpdater.setLoading(true);
  stateUpdater.clearMessages();
  
  try {
    const payload = buildClassPayload(state);
    await createTeacherClass(teacherEmail, payload);
    
    // Refresh the classes list
    const updated = await listTeacherClasses(teacherEmail);
    stateUpdater.updateClasses(updated);
    stateUpdater.resetForm();
    stateUpdater.setMessage(`Class "${payload.class_name}" created successfully!`);
  } catch (err) {
    console.error("Create class error:", err);
    stateUpdater.setError(err);
  } finally {
    stateUpdater.setLoading(false);
  }
}

export async function assignStudentFlow(
  teacherEmail,
  classCode,
  inviteCode, // This will be the same as classCode
  stateUpdater,
  setSelectedClass
) {
  if (!teacherEmail) {
    stateUpdater.setError("No teacher email found. Please log in again.");
    return;
  }

  const email = promptForEmail();
  if (!email) return;

  stateUpdater.setLoading(true);
  try {
    // Your backend expects the class_code in the URL and invite_code in the payload
    await addStudentToClass(teacherEmail, classCode, email, inviteCode);
    
    // Refresh classes list
    const updated = await listTeacherClasses(teacherEmail);
    const normalizedClasses = normalizeClassesResponse(updated);
    stateUpdater.updateClasses(normalizedClasses);

    // Update selected class
    const refreshedClass = normalizedClasses.find((c) => c.class_code === classCode);
    if (refreshedClass && setSelectedClass) {
      setSelectedClass(refreshedClass);
      localStorage.setItem("selectedClassObj", JSON.stringify(refreshedClass));
    }

    stateUpdater.setMessage(`Student ${email} added successfully!`);
  } catch (err) {
    console.error("Add student error:", err);
    stateUpdater.setError(err);
  } finally {
    stateUpdater.setLoading(false);
  }
}

export async function removeStudentFlow(
  teacherEmail,
  classCode,
  email,
  stateUpdater
) {
  if (!confirmStudentRemoval(email)) return;

  stateUpdater.setLoading(true);
  try {
    // TODO: Replace with real API call when available
    // await removeStudentFromClass(teacherEmail, classCode, email);
    stateUpdater.setMessage(
      `Student ${email} removal not yet implemented`
    );
  } catch (err) {
    stateUpdater.setError(err);
  } finally {
    stateUpdater.setLoading(false);
  }
}

export async function copyInviteFlow(code, stateUpdater) {
  const { success, message } = await copyToClipboard(code);
  if (success) {
    stateUpdater.setMessage(message);
  } else {
    stateUpdater.setError(message);
  }
}

// Export constants
export { SUBJECT_OPTIONS };