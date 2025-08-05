// utils/specialElements.js - Handles prompt wraps and interactive elements with improved deduplication

/**
 * Extracts prompt from `[Prompt Wrap Start]...Prompt: ...[Prompt Wrap End]`
 * @param {string} markdown
 * @returns {string|null}
 */
export function extractPromptWrap(markdown) {
  const match = markdown.match(/\[Prompt Wrap Start\](.*?)\[Prompt Wrap End\]/s);
  return match ? match[1].replace(/Prompt:\s*/i, '').trim() : null;
}

/**
 * Checks for presence of `[interactive element]`
 * @param {string} markdown
 * @returns {boolean}
 */
export function containsInteractiveElement(markdown) {
  return markdown.includes('[interactive element]');
}

/**
 * Extracts special elements with position tracking
 * @param {string} content - The markdown content
 * @returns {object} - Object containing arrays of special elements with metadata
 */
export function extractSpecialElements(content) {
  const elements = {
    promptWraps: [],
    interactiveElements: []
  };

  if (!content) return elements;

  // Extract prompt wraps with their positions and content
  const promptWrapRegex = /\[Prompt Wrap Start\](.*?)\[Prompt Wrap End\]/gs;
  let match;
  while ((match = promptWrapRegex.exec(content)) !== null) {
    const promptContent = match[1].replace(/Prompt:\s*/i, '').trim();
    elements.promptWraps.push({
      fullMatch: match[0],
      content: promptContent,
      rawContent: match[1],
      index: match.index,
      originalText: match[0],
      lineNumber: content.substring(0, match.index).split('\n').length
    });
  }

  // Extract interactive elements with their positions
  const interactiveRegex = /\[interactive element\]/g;
  while ((match = interactiveRegex.exec(content)) !== null) {
    elements.interactiveElements.push({
      fullMatch: match[0],
      index: match.index,
      originalText: match[0],
      lineNumber: content.substring(0, match.index).split('\n').length
    });
  }

  return elements;
}

/**
 * Removes special elements from content for AI processing
 * @param {string} content - The original content
 * @returns {string} - Content with special elements removed
 */
export function removeSpecialElements(content) {
  if (!content) return '';

  let cleaned = content;

  // Remove prompt wraps completely
  cleaned = cleaned.replace(/\[Prompt Wrap Start\].*?\[Prompt Wrap End\]/gs, '');

  // Remove interactive elements
  cleaned = cleaned.replace(/\[interactive element\]/g, '');

  // Clean up extra whitespace but preserve paragraph structure
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim();

  return cleaned;
}

/**
 * Improved normalization for better deduplication
 * @param {string} text - Text to normalize
 * @returns {string} - Normalized text
 */
function normalizeForComparison(text) {
  return text
    .replace(/\s+/g, ' ')           // Collapse whitespace
    .replace(/\n+/g, ' ')           // Replace newlines with spaces
    .replace(/[^\w\s]/g, '')        // Remove punctuation for comparison
    .trim()
    .toLowerCase();
}

/**
 * Extract the core content from a prompt wrap for comparison
 * @param {string} promptWrap - The full prompt wrap text
 * @returns {string} - Core content for comparison
 */
function extractPromptCore(promptWrap) {
  // Remove the wrapper tags and extract just the inner content
  const innerContent = promptWrap
    .replace(/\[Prompt Wrap Start\]/g, '')
    .replace(/\[Prompt Wrap End\]/g, '')
    .replace(/Prompt:\s*/gi, '')
    .trim();
  
  return normalizeForComparison(innerContent);
}

/**
 * Restores special elements to enhanced content with improved deduplication
 * @param {string} enhancedContent - The AI-enhanced content
 * @param {object} specialElements - The extracted special elements
 * @param {string} originalContent - The original content for reference
 * @returns {string} - Content with special elements restored
 */
export function restoreSpecialElements(enhancedContent, specialElements, originalContent = '') {
  let restored = enhancedContent || '';

  if (!specialElements || (!specialElements.promptWraps?.length && !specialElements.interactiveElements?.length)) {
    return restored;
  }

  console.log('[RESTORE_SPECIAL] Starting restoration process');
  console.log('[RESTORE_SPECIAL] Prompt wraps to restore:', specialElements.promptWraps?.length || 0);
  console.log('[RESTORE_SPECIAL] Interactive elements to restore:', specialElements.interactiveElements?.length || 0);

  // Create sets to track what we've already added
  const addedPromptCores = new Set();
  const addedInteractiveCores = new Set();

  // Normalize the current restored content for comparison
  const restoredNormalized = normalizeForComparison(restored);

  // Restore prompt wraps with improved deduplication
  specialElements.promptWraps?.forEach((promptWrap, index) => {
    const promptCore = extractPromptCore(promptWrap.originalText);
    console.log(`[RESTORE_SPECIAL] Processing prompt ${index + 1}, core: "${promptCore.substring(0, 50)}..."`);

    // Check if this prompt is already in the content
    const alreadyInContent = restoredNormalized.includes(promptCore);
    const alreadyAdded = addedPromptCores.has(promptCore);

    if (!alreadyInContent && !alreadyAdded && promptCore.length > 0) {
      console.log(`[RESTORE_SPECIAL] Adding prompt ${index + 1}`);
      restored += restored.endsWith('\n') ? `\n${promptWrap.originalText}` : `\n\n${promptWrap.originalText}`;
      addedPromptCores.add(promptCore);
    } else {
      console.log(`[RESTORE_SPECIAL] Skipping prompt ${index + 1} - already present or duplicate`);
    }
  });

  // Restore interactive elements with deduplication
  specialElements.interactiveElements?.forEach((interactive, index) => {
    const interactiveCore = normalizeForComparison(interactive.originalText);
    console.log(`[RESTORE_SPECIAL] Processing interactive ${index + 1}`);

    const alreadyInContent = restoredNormalized.includes(interactiveCore);
    const alreadyAdded = addedInteractiveCores.has(interactiveCore);

    if (!alreadyInContent && !alreadyAdded && interactiveCore.length > 0) {
      console.log(`[RESTORE_SPECIAL] Adding interactive ${index + 1}`);
      restored += restored.endsWith('\n') ? `\n${interactive.originalText}` : `\n\n${interactive.originalText}`;
      addedInteractiveCores.add(interactiveCore);
    } else {
      console.log(`[RESTORE_SPECIAL] Skipping interactive ${index + 1} - already present`);
    }
  });

  console.log('[RESTORE_SPECIAL] Restoration complete');
  return restored;
}