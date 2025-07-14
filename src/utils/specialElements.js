// utils/specialElements.js - Handles prompt wraps and interactive elements

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
 * Restores special elements to enhanced content with deduplication
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

  const normalizeText = (text) => text.replace(/\s+/g, ' ').trim().toLowerCase();
  const restoredNormalized = normalizeText(restored);

  // Restore prompt wraps
  specialElements.promptWraps.forEach(promptWrap => {
    const cleanedPrompt = promptWrap.originalText.replace(/^#{1,6}\s+.*$/gm, '').trim();
    const normalizedPrompt = normalizeText(cleanedPrompt);

    if (
      cleanedPrompt &&
      !restored.includes(cleanedPrompt) &&
      !restoredNormalized.includes(normalizedPrompt)
    ) {
      restored += restored.endsWith('\n') ? `\n${cleanedPrompt}` : `\n\n${cleanedPrompt}`;
    }
  });

  // Restore interactive elements
  specialElements.interactiveElements.forEach(interactive => {
    const cleanedInteractive = interactive.originalText.replace(/^#{1,6}\s+.*$/gm, '').trim();
    const normalizedInteractive = normalizeText(cleanedInteractive);

    if (
      cleanedInteractive &&
      !restored.includes(cleanedInteractive) &&
      !restoredNormalized.includes(normalizedInteractive)
    ) {
      restored += restored.endsWith('\n') ? `\n${cleanedInteractive}` : `\n\n${cleanedInteractive}`;
    }
  });

  return restored;
}
