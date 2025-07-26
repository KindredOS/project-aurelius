// utils/polishMarkdown.js - DEBUGGED VERSION - Just polish, no AI calls
import {
  extractSpecialElements,
  removeSpecialElements,
  restoreSpecialElements
} from './specialElements';
// TEMPORARILY DISABLED - Testing without cleanup
// import {
//   detectContentDuplication,
//   removeDuplicateContent
// } from './contentProcessing';

/**
 * Clean existing debug stamps and processing artifacts
 * @param {string} text - The text to clean
 * @returns {string} - Cleaned text
 */
const cleanExistingProcessingArtifacts = (text) => {
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
 * Process AI-generated markdown - clean up formatting issues
 * @param {string} rawResult - The raw result from AI
 * @returns {string} - Processed markdown
 */
export const processEnhancedMarkdown = (rawResult) => {
  console.log(`[PROCESS_ENHANCED] Input length: ${rawResult?.length || 0}`);
  
  let processed = rawResult;

  if (typeof processed === 'string') {
    // First, clean any existing processing artifacts
    processed = cleanExistingProcessingArtifacts(processed);
    console.log(`[PROCESS_ENHANCED] After cleaning artifacts: ${processed.length}`);

    // Remove outer quotes if present
    if ((processed.startsWith('"') && processed.endsWith('"')) || 
        (processed.startsWith("'") && processed.endsWith("'"))) {
      try {
        processed = JSON.parse(processed);
      } catch (e) {
        processed = processed.slice(1, -1);
      }
    }
    console.log(`[PROCESS_ENHANCED] After quote removal: ${processed.length}`);

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

    // Remove AI prompt wrapper artifacts
    processed = processed.replace(/\[Prompt Wrap Start\][\s\S]*?\[Prompt Wrap End\]/g, '');
    
    // Remove common AI response prefixes
    processed = processed.replace(/^(Here's the|Here is the|Based on the request|According to the prompt).*?:\s*/gm, '');
    
    // Remove "I'll help you" type responses
    processed = processed.replace(/^I'll\s+\w+.*?\.\s*/gm, '');

    console.log(`[PROCESS_ENHANCED] After AI artifact removal: ${processed.length}`);

    // Deduplicate consecutive identical headers
    const lines = processed.split('\n');
    const cleanedLines = [];
    let lastHeader = null;

    for (const line of lines) {
      const isHeader = /^#{1,6}\s+/.test(line);
      if (isHeader && line === lastHeader) {
        continue; // skip duplicate header
      }
      cleanedLines.push(line);
      if (isHeader) {
        lastHeader = line;
      }
    }

    processed = cleanedLines.join('\n');
    console.log(`[PROCESS_ENHANCED] After header dedup: ${processed.length}`);

    // Clean up multiple consecutive newlines
    processed = processed.replace(/^\n+/, '').replace(/\n{3,}/g, '\n\n');

    // Ensure proper spacing after headers
    processed = processed.replace(/(#{1,6}\s+[^\n]+)\n([^\n#])/g, '$1\n\n$2');

    // Final cleanup - remove leading/trailing whitespace but preserve internal structure
    processed = processed.trim();
    
    console.log(`[PROCESS_ENHANCED] Final processed length: ${processed.length}`);
  }

  return processed;
};

/**
 * Polish markdown content - NO AI CALLS, just cleaning/formatting
 * This function should only be used to clean up AI-generated content,
 * NOT to generate new content via AI
 * 
 * @param {Object} params - Parameters for polishing
 * @param {string} params.text - The AI-generated text to polish
 * @param {string} params.action - The action that was performed (for context)
 * @returns {string} - Polished markdown
 */
export async function polishMarkdown({ text, action = 'enhance' }) {
  try {
    console.log(`[POLISH_MARKDOWN] Starting polish for ${action}, input length: ${text?.length || 0}`);
    console.log(`[POLISH_MARKDOWN] Input preview: "${text?.substring(0, 100)}..."`);
    
    if (!text || typeof text !== 'string') {
      console.error('[POLISH_MARKDOWN] No valid text provided');
      throw new Error('No valid text provided to polish');
    }

    // If text is empty or just whitespace, return as-is
    if (text.trim().length === 0) {
      console.log('[POLISH_MARKDOWN] Input is empty or whitespace only');
      return text;
    }

    // Extract special elements before processing
    let cleanedText, elements;
    try {
      const extracted = extractSpecialElements(text);
      cleanedText = extracted.content;
      elements = extracted.elements;
      console.log(`[POLISH_MARKDOWN] After extractSpecialElements: ${cleanedText?.length || 0} chars`);
    } catch (error) {
      console.warn('[POLISH_MARKDOWN] extractSpecialElements failed, using original text:', error);
      cleanedText = text;
      elements = [];
    }

    // Process the enhanced markdown
    let enhanced = processEnhancedMarkdown(cleanedText);
    console.log(`[POLISH_MARKDOWN] After processEnhancedMarkdown: ${enhanced?.length || 0} chars`);

    // TEMPORARILY DISABLED - Check for content duplication and remove if found
    // try {
    //   if (detectContentDuplication && typeof detectContentDuplication === 'function' && detectContentDuplication(enhanced)) {
    //     console.log('[POLISH_MARKDOWN] Content duplication detected, removing...');
    //     enhanced = removeDuplicateContent(enhanced);
    //     console.log(`[POLISH_MARKDOWN] After removeDuplicateContent: ${enhanced?.length || 0} chars`);
    //   }
    // } catch (error) {
    //   console.warn('[POLISH_MARKDOWN] Content duplication check failed:', error);
    // }

    // Restore special elements
    let final;
    try {
      final = restoreSpecialElements(enhanced, elements);
      console.log(`[POLISH_MARKDOWN] After restoreSpecialElements: ${final?.length || 0} chars`);
    } catch (error) {
      console.warn('[POLISH_MARKDOWN] restoreSpecialElements failed, using enhanced text:', error);
      final = enhanced;
    }

    // Final safety check - if we somehow lost all content, return original
    if (!final || final.trim().length === 0) {
      console.warn('[POLISH_MARKDOWN] Final result is empty, returning original text');
      final = text;
    }

    console.log(`[POLISH_MARKDOWN] Polishing complete: ${final.length} characters`);
    console.log(`[POLISH_MARKDOWN] Output preview: "${final.substring(0, 100)}..."`);
    return final;

  } catch (error) {
    console.error('[POLISH_MARKDOWN] Polishing failed:', error);
    
    // Return the original text if polishing fails
    return text || 'Error: No content to polish';
  }
}

// Export utility functions for testing
export { cleanExistingProcessingArtifacts };