// issueReportApi.js
// Utility for submitting issue reports to Cloudflare Worker

const API_ENDPOINT = 'https://studybuddy-issue-worker.shepherdn.workers.dev/api/issues';

/**
 * Submits an issue report to the Cloudflare Worker
 * @param {Object} payload - The issue report payload from IssueReportModal
 * @param {string} payload.summary - Brief issue summary
 * @param {string} payload.description - Detailed description
 * @param {string[]} payload.steps - Steps to reproduce
 * @param {string} payload.expected - Expected behavior
 * @param {string} payload.actual - Actual behavior
 * @param {string} payload.severity - Issue severity (low, medium, high, critical)
 * @param {string} [payload.category] - Issue category
 * @param {string} [payload.component] - Component name
 * @param {string} [payload.email] - User email
 * @param {boolean} payload.allowContact - Allow contact permission
 * @param {File[]} payload.attachments - File attachments
 * @param {Object} [payload.diagnostics] - System diagnostics
 * @returns {Promise<Object>} Response from the worker
 */
export async function submitIssueReport(payload) {
  try {
    // Create FormData to handle file uploads and mixed content
    const formData = new FormData();
    
    // Add all the text fields
    const textData = {
      summary: payload.summary,
      description: payload.description,
      steps: payload.steps,
      expected: payload.expected,
      actual: payload.actual,
      severity: payload.severity,
      category: payload.category,
      component: payload.component,
      email: payload.email,
      allowContact: payload.allowContact,
      diagnostics: payload.diagnostics,
      timestamp: new Date().toISOString()
    };
    
    // Add the main data as JSON
    formData.append('data', JSON.stringify(textData));
    
    // Add file attachments
    if (payload.attachments && payload.attachments.length > 0) {
      payload.attachments.forEach((file, index) => {
        formData.append(`attachment_${index}`, file);
      });
      formData.append('attachmentCount', payload.attachments.length.toString());
    }
    
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header - let browser set it with boundary for multipart/form-data
    });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    
    // Log successful submission for debugging
    console.log('Issue report submitted successfully:', {
      id: result.id,
      summary: payload.summary,
      severity: payload.severity
    });
    
    return result;
    
  } catch (error) {
    console.error('Failed to submit issue report:', error);
    
    // Enhance error with context for better debugging
    const enhancedError = new Error(`Issue report submission failed: ${error.message}`);
    enhancedError.originalError = error;
    enhancedError.payload = {
      summary: payload.summary,
      severity: payload.severity,
      hasAttachments: !!(payload.attachments && payload.attachments.length > 0),
      hasDiagnostics: !!payload.diagnostics
    };
    
    throw enhancedError;
  }
}

/**
 * Validates the payload before submission
 * @param {Object} payload - The issue report payload
 * @returns {string[]} Array of validation errors (empty if valid)
 */
export function validateIssueReport(payload) {
  const errors = [];
  
  if (!payload.summary || !payload.summary.trim()) {
    errors.push('Summary is required');
  }
  
  if (payload.summary && payload.summary.length > 200) {
    errors.push('Summary must be 200 characters or less');
  }
  
  if (payload.description && payload.description.length > 5000) {
    errors.push('Description must be 5000 characters or less');
  }
  
  if (payload.email && payload.email.trim() && !isValidEmail(payload.email.trim())) {
    errors.push('Please enter a valid email address');
  }
  
  if (!['low', 'medium', 'high', 'critical'].includes(payload.severity)) {
    errors.push('Invalid severity level');
  }
  
  // Validate file attachments
  if (payload.attachments && payload.attachments.length > 0) {
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    const maxFiles = 5;
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'text/plain', 'text/csv',
      'application/json',
      'application/pdf'
    ];
    
    if (payload.attachments.length > maxFiles) {
      errors.push(`Maximum ${maxFiles} files allowed`);
    }
    
    payload.attachments.forEach((file, index) => {
      if (file.size > maxFileSize) {
        errors.push(`File "${file.name}" is too large (max 10MB)`);
      }
      
      if (!allowedTypes.includes(file.type)) {
        errors.push(`File "${file.name}" has unsupported type: ${file.type}`);
      }
    });
  }
  
  return errors;
}

/**
 * Simple email validation
 * @param {string} email 
 * @returns {boolean}
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Configuration for the API endpoint
 */
export const config = {
  endpoint: API_ENDPOINT,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 5,
  allowedFileTypes: [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'text/plain', 'text/csv',
    'application/json',
    'application/pdf'
  ]
};

/**
 * Test function to verify the API endpoint is reachable
 * @returns {Promise<boolean>}
 */
export async function testConnection() {
  try {
    const response = await fetch(API_ENDPOINT.replace('/issues', '/health'), {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    return response.ok;
  } catch (error) {
    console.warn('API connection test failed:', error);
    return false;
  }
}