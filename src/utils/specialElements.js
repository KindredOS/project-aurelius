// ===================================================================
// utils/specialElements.js - FIXED VERSION
// ===================================================================

/**
 * FIXED: Restores special elements without accumulating duplicates
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

  // FIXED: Create a set to track what we've already added
  const addedElements = new Set();

  // Restore prompt wraps
  specialElements.promptWraps.forEach(promptWrap => {
    const cleanedPrompt = promptWrap.originalText.replace(/^#{1,6}\s+.*$/gm, '').trim();
    const normalizedPrompt = normalizeText(cleanedPrompt);
    
    // FIXED: Check if we've already added this element
    if (
      cleanedPrompt &&
      !restored.includes(cleanedPrompt) &&
      !restoredNormalized.includes(normalizedPrompt) &&
      !addedElements.has(normalizedPrompt)
    ) {
      restored += restored.endsWith('\n') ? `\n${cleanedPrompt}` : `\n\n${cleanedPrompt}`;
      addedElements.add(normalizedPrompt);
    }
  });

  // Restore interactive elements
  specialElements.interactiveElements.forEach(interactive => {
    const cleanedInteractive = interactive.originalText.replace(/^#{1,6}\s+.*$/gm, '').trim();
    const normalizedInteractive = normalizeText(cleanedInteractive);
    
    // FIXED: Check if we've already added this element
    if (
      cleanedInteractive &&
      !restored.includes(cleanedInteractive) &&
      !restoredNormalized.includes(normalizedInteractive) &&
      !addedElements.has(normalizedInteractive)
    ) {
      restored += restored.endsWith('\n') ? `\n${cleanedInteractive}` : `\n\n${cleanedInteractive}`;
      addedElements.add(normalizedInteractive);
    }
  });

  return restored;
}