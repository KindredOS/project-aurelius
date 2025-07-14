// utils/polishMarkdown.js - IMPROVED VERSION

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
 * IMPROVED: Process enhanced markdown with better special element handling
 * @param {string} rawResult - The raw result from AI
 * @returns {string} - Processed markdown
 */
export const processEnhancedMarkdown = (rawResult) => {
  let processed = rawResult;

  if (typeof processed === 'string') {
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
    processed = processed.replace(/^"(#{1,6}\s+[^"]+)"$/gm, '$1');
    processed = processed.replace(/^"([^"]*?)$/gm, '$1');

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
 * IMPROVED: Enhanced markdown polishing with better special element handling and deduplication
 * @param {Object} params - Parameters for polishing
 * @param {string} params.text - The text to enhance
 * @param {string} params.action - The enhancement action
 * @param {string} params.personality - The personality to use
 * @param {string} params.model_key - The model key
 * @returns {string} - Enhanced markdown
 */
export async function polishMarkdown({ text, action, personality = 'default', model_key = 'hermes' }) {
  try {
    const specialElements = extractSpecialElements(text);
    const cleanedText = removeSpecialElements(text);

    console.log('Original text:', text);
    console.log('Cleaned text for AI:', cleanedText);
    console.log('Extracted special elements:', specialElements);

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

    // 🔍 DEBUG STAMP TO TRACE STACKING
    const debugStamp = `\n\n---\n⚠️ [SANITIZED at ${new Date().toISOString()}]\n---\n`;
    enhanced += debugStamp;

    console.log('Raw AI response:', data.result);
    console.log('Processed enhanced text:', enhanced);

    if (detectContentDuplication(enhanced)) {
      console.log('Duplicate content detected, removing...');
      enhanced = removeDuplicateContent(enhanced);
    }

    const final = restoreSpecialElements(enhanced, specialElements, text);

    console.log('Final text with special elements restored:', final);

    return final;
  } catch (error) {
    console.error('AI Markdown Enhancement failed:', error);
    return 'Error enhancing content.';
  }
}
