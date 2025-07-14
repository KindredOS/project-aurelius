// utils/polishMarkdown.js - IMPROVED VERSION

import { getApiUrl } from '../api/ApiMaster';

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
    // Instead of removing ALL headers, only remove ones that might be duplicates
    // This is more conservative and preserves legitimate structure
    
    // Remove headers only if they appear at the very beginning of the response
    // (which indicates they might be duplicates from the prompt)
    const lines = processed.split('\n');
    const cleanedLines = [];
    let skipInitialHeaders = true;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const isHeader = /^#{1,6}\s+/.test(line);
      
      if (skipInitialHeaders && isHeader) {
        // Skip headers at the beginning that might be duplicates
        continue;
      } else if (skipInitialHeaders && line.trim() !== '') {
        // Once we hit non-empty, non-header content, stop skipping headers
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
    // Import here to avoid circular dependency
    const { 
      removeSpecialElements, 
      extractSpecialElements, 
      restoreSpecialElements, 
      detectContentDuplication, 
      removeDuplicateContent 
    } = await import('./markdownStructure.js');
    
    // Extract special elements before sending to AI
    const specialElements = extractSpecialElements(text);
    
    // Remove special elements from the text before AI processing
    const cleanedText = removeSpecialElements(text);
    
    console.log('Original text:', text);
    console.log('Cleaned text for AI:', cleanedText);
    console.log('Extracted special elements:', specialElements);
    
    const response = await fetch(`${getApiUrl()}/markdown/enhance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        text: cleanedText, // Send cleaned text without special elements
        action, 
        personality, 
        model_key 
      })
    });

    const data = await response.json();
    let enhanced = processEnhancedMarkdown(data.result);
    
    console.log('Raw AI response:', data.result);
    console.log('Processed enhanced text:', enhanced);
    
    // Check for and remove duplicates in the enhanced content
    if (detectContentDuplication(enhanced)) {
      console.log('Duplicate content detected, removing...');
      enhanced = removeDuplicateContent(enhanced);
    }
    
    // Restore special elements to the enhanced content
    const final = restoreSpecialElements(enhanced, specialElements, text);
    
    console.log('Final text with special elements restored:', final);

    return final;
  } catch (error) {
    console.error('AI Markdown Enhancement failed:', error);
    return 'Error enhancing content.';
  }
}