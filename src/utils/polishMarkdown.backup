// utils/polishMarkdown.js - FIXED VERSION
import { getApiUrl } from '../api/ApiMaster';
import {
  extractSpecialElements,
  removeSpecialElements,
  restoreSpecialElements
} from './specialElements';
import {
  detectContentDuplication,
  removeDuplicateContent
} from './contentProcessing';

/**
 * FIXED: Clean existing debug stamps and processing artifacts
 * @param {string} text - The text to clean
 * @returns {string} - Cleaned text
 */
export const cleanExistingProcessingArtifacts = (text) => {
  if (!text) return '';

  // Remove existing debug stamps
  let cleaned = text.replace(/\n\n---\n⚠️ \[SANITIZED at [^\]]+\]\n---\n/g, '');

  // Remove duplicate processing indicators
  cleaned = cleaned.replace(/\n\n---\n⚠️ \[SANITIZED at [^\]]+\]\n---\n/g, '');

  // Remove any leftover processing markers
  cleaned = cleaned.replace(/---\n⚠️ \[SANITIZED[^\]]*\]\n---/g, '');

  // Clean up excessive whitespace
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim();

  return cleaned;
};

/**
 * FIXED: Process enhanced markdown with artifact cleanup
 * @param {string} rawResult - The raw result from AI
 * @returns {string} - Processed markdown
 */
export const processEnhancedMarkdown = (rawResult) => {
  let processed = rawResult;

  if (typeof processed === 'string') {
    // First, clean any existing processing artifacts
    processed = cleanExistingProcessingArtifacts(processed);

    // Remove outer quotes if present
    if ((processed.startsWith('"') && processed.endsWith('"')) || 
        (processed.startsWith("'") && processed.endsWith("'"))) {
      try {
        processed = JSON.parse(processed);
      } catch (e) {
        processed = processed.slice(1, -1);
      }
    }

    // Handle literal escape sequences
    processed = processed.replace(/\\n/g, '\n');
    processed = processed.replace(/\\t/g, '\t');
    processed = processed.replace(/\\r/g, '\r');
    processed = processed.replace(/\\"/g, '"');
    processed = processed.replace(/\\'/g, "'");
    processed = processed.replace(/\\\\/g, '\\');

    // Fix malformed headers that start with quotes
    processed = processed.replace(/^"#\s*/gm, '# ');
    processed = processed.replace(/^"(#{1,6}\s+[^"}]+)"$/gm, '$1');
    processed = processed.replace(/^"([^"}]*?)$/gm, '$1');

    // IMPROVED: Only remove headers that are likely duplicates
    const lines = processed.split('\n');
    const cleanedLines = [];
    let skipInitialHeaders = true;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const isHeader = /^#{1,6}\s+/.test(line);

      if (skipInitialHeaders && isHeader) {
        continue;
      } else if (skipInitialHeaders && line.trim() !== '') {
        skipInitialHeaders = false;
        cleanedLines.push(line);
      } else {
        cleanedLines.push(line);
      }
    }

    processed = cleanedLines.join('\n');

    // Clean up multiple consecutive newlines
    processed = processed.replace(/^\n+/, '').replace(/\n{3,}/g, '\n\n');

    // Ensure proper spacing after headers
    processed = processed.replace(/(#{1,6}\s+[^\n]+)\n([^\n#])/g, '$1\n\n$2');

    // Final cleanup - remove leading/trailing whitespace but preserve internal structure
    processed = processed.trim();
  }

  return processed;
};

/**
 * FIXED: Enhanced markdown polishing with proper content replacement
 * @param {Object} params - Parameters for polishing
 * @param {string} params.text - The text to enhance
 * @param {string} params.action - The enhancement action
 * @param {string} params.personality - The personality to use
 * @param {string} params.model_key - The model key
 * @returns {string} - Enhanced markdown
 */
export async function polishMarkdown({ text, action, personality = 'default', model_key = 'hermes' }) {
  try {
    const cleanedInputText = cleanExistingProcessingArtifacts(text);

    // Strip special elements before send (may be unnecessary now)
    const cleanedText = cleanedInputText; // no longer stripping special elements

    const response = await fetch(`${getApiUrl()}/markdown/enhance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        text: cleanedText,
        action, 
        personality, 
        model_key 
      })
    });

    const data = await response.json();
    let enhanced = processEnhancedMarkdown(data.result);

    // Deduplicate internally
    if (detectContentDuplication(enhanced)) {
      enhanced = removeDuplicateContent(enhanced);
    }

    // Restore special elements (currently commented out systemwide)
    // const final = restoreSpecialElements(enhanced, extractSpecialElements(cleanedInputText), cleanedInputText);
    const final = enhanced;

    return final;
  } catch (error) {
    console.error('AI Markdown Enhancement failed:', error);
    return 'Error enhancing content.';
  }
}
