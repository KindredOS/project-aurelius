// utils/markdownStructure.js - IMPROVED VERSION

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
 * IMPROVED: Extracts special elements with better position tracking
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
      // Add line number for better tracking
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
 * FIXED: Removes special elements from content for AI processing
 * This ensures the AI doesn't see or process special elements
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
 * IMPROVED: Restores special elements to enhanced content with better deduplication
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
  
  // Create a more robust deduplication check
  const normalizeText = (text) => text.replace(/\s+/g, ' ').trim().toLowerCase();
  const restoredNormalized = normalizeText(restored);
  
  // Restore prompt wraps
  specialElements.promptWraps.forEach(promptWrap => {
    const cleanedPrompt = promptWrap.originalText.replace(/^#{1,6}\s+.*$/gm, '').trim();
    const normalizedPrompt = normalizeText(cleanedPrompt);
    
    // Check if this prompt wrap is already in the content
    if (cleanedPrompt && !restoredNormalized.includes(normalizedPrompt)) {
      restored += `\n\n${cleanedPrompt}`;
    }
  });
  
  // Restore interactive elements
  specialElements.interactiveElements.forEach(interactive => {
    const cleanedInteractive = interactive.originalText.replace(/^#{1,6}\s+.*$/gm, '').trim();
    const normalizedInteractive = normalizeText(cleanedInteractive);
    
    if (cleanedInteractive && !restoredNormalized.includes(normalizedInteractive)) {
      restored += `\n\n${cleanedInteractive}`;
    }
  });
  
  return restored;
}

/**
 * IMPROVED: Replaces a section under a specific header with new content
 * Now handles special elements properly
 * @param {string} originalContent - The original markdown content
 * @param {string} header - The header text to find
 * @param {string} newContent - The new content to replace with
 * @returns {string} - The updated markdown content
 */
export function replaceSection(originalContent, header, newContent) {
  if (!originalContent || !header) return originalContent;
  
  // First, extract special elements from the original content
  const specialElements = extractSpecialElements(originalContent);
  
  const lines = originalContent.split('\n');
  const headerIndex = lines.findIndex(line => {
    const cleanLine = line.replace(/^#+\s*/, '');
    return cleanLine === header;
  });
  
  if (headerIndex === -1) return originalContent;

  const currentLevel = (lines[headerIndex].match(/^#+/) || [''])[0].length;
  const newLines = [...lines];
  
  // Find the end of this section
  let endIndex = newLines.length;
  for (let i = headerIndex + 1; i < newLines.length; i++) {
    const line = newLines[i];
    const lineLevel = (line.match(/^#+/) || [''])[0].length;
    if (lineLevel && lineLevel <= currentLevel) {
      endIndex = i;
      break;
    }
  }
  
  // Remove the old section content (keep the header)
  newLines.splice(headerIndex + 1, endIndex - headerIndex - 1);
  
  // Insert the new content
  if (newContent && typeof newContent === 'string') {
    // Clean the new content to ensure no header duplication
    const cleanedContent = newContent
      .replace(/^#{1,6}\s+.*$/gm, '') // Remove headers to prevent duplication
      .replace(/^\n+/, '') // Remove leading newlines
      .trim();
    
    if (cleanedContent) {
      const enhancedLines = cleanedContent.split('\n');
      newLines.splice(headerIndex + 1, 0, '', ...enhancedLines, '');
    }
  }
  
  const result = newLines.join('\n');
  
  // Restore special elements that might have been in this section
  const sectionSpecialElements = {
    promptWraps: specialElements.promptWraps.filter(pw => 
      pw.lineNumber > headerIndex && pw.lineNumber < endIndex
    ),
    interactiveElements: specialElements.interactiveElements.filter(ie => 
      ie.lineNumber > headerIndex && ie.lineNumber < endIndex
    )
  };
  
  return restoreSpecialElements(result, sectionSpecialElements, originalContent);
}

// ... (rest of the existing functions remain the same)

/**
 * Extracts the content under a specific header in markdown text
 * @param {string} text - The markdown text
 * @param {string} header - The header text to find
 * @returns {string} - The content under the header
 */
export function extractSectionUnderHeader(text, header) {
  if (!text || !header) return '';
  
  const lines = text.split('\n');
  const headerIndex = lines.findIndex(line => {
    const cleanLine = line.replace(/^#+\s*/, '');
    return cleanLine === header;
  });
  
  if (headerIndex === -1) return '';

  const currentLevel = (lines[headerIndex].match(/^#+/) || [''])[0].length;
  const bodyLines = [];

  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    const lineLevel = (line.match(/^#+/) || [''])[0].length;
    if (lineLevel && lineLevel <= currentLevel) break;
    bodyLines.push(line);
  }

  return bodyLines.join('\n').trim();
}

/**
 * Parses markdown text and extracts headers with their levels
 * @param {string} text - The markdown text
 * @returns {Array} - Array of header objects with {text, level, lineIndex}
 */
export function extractHeaders(text) {
  if (!text) return [];
  
  const lines = text.split('\n');
  const headers = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const headerMatch = line.match(/^(#+)\s*(.+)$/);
    
    if (headerMatch) {
      const level = headerMatch[1].length;
      const text = headerMatch[2].trim();
      headers.push({ text, level, lineIndex: i });
    }
  }
  
  return headers;
}

/**
 * Converts markdown bold syntax to HTML
 * @param {string} text - Text with markdown bold syntax
 * @returns {string} - Text with HTML bold tags
 */
export function convertMarkdownBold(text) {
  if (!text) return '';
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

/**
 * Parses markdown content and categorizes lines into different types
 * @param {string} text - The markdown text
 * @returns {Array} - Array of parsed elements with type and content
 */
export function parseMarkdownElements(text) {
  if (!text) return [];
  
  const lines = text.split('\n');
  const elements = [];
  let insidePrompt = false;
  let promptBuffer = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Handle prompt wraps
    if (line.includes('[Prompt Wrap Start]')) {
      insidePrompt = true;
      promptBuffer = [];
      continue;
    }
    if (line.includes('[Prompt Wrap End]')) {
      insidePrompt = false;
      const fullPromptText = promptBuffer.join(' ').replace(/Prompt:\s*/i, '').trim();
      if (fullPromptText) {
        elements.push({
          type: 'prompt',
          content: fullPromptText,
          lineIndex: i
        });
      }
      continue;
    }
    if (insidePrompt) {
      promptBuffer.push(line);
      continue;
    }

    // Handle headers
    if (line.startsWith('# ')) {
      elements.push({
        type: 'header',
        level: 1,
        content: line.substring(2),
        lineIndex: i
      });
    } else if (line.startsWith('## ')) {
      elements.push({
        type: 'header',
        level: 2,
        content: line.substring(3),
        lineIndex: i
      });
    } else if (line.startsWith('### ')) {
      elements.push({
        type: 'header',
        level: 3,
        content: line.substring(4),
        lineIndex: i
      });
    } else if (line.startsWith('#### ')) {
      elements.push({
        type: 'header',
        level: 4,
        content: line.substring(5),
        lineIndex: i
      });
    } else if (line.includes('[interactive element]') || containsInteractiveElement(line)) {
      elements.push({
        type: 'interactive',
        content: line,
        lineIndex: i
      });
    } else if (line.trim() !== '') {
      elements.push({
        type: 'paragraph',
        content: line,
        lineIndex: i
      });
    }
  }

  return elements;
}

/**
 * Action map for different enhancement types
 */
export const ENHANCEMENT_ACTIONS = {
  simplify: 'Simplify the following section',
  add_detail: 'Add more depth to the following section',
  contract: 'Make the following section shorter and more concise',
  reframe: 'Reframe the following section from a new perspective'
};

/**
 * Creates an enhancement prompt for a given section
 * @param {string} header - The section header
 * @param {string} content - The section content
 * @param {string} action - The enhancement action type
 * @returns {string} - The formatted prompt
 */
export function createEnhancementPrompt(header, content, action) {
  const actionText = ENHANCEMENT_ACTIONS[action];
  if (!actionText) {
    throw new Error(`Unknown enhancement action: ${action}`);
  }
  
  // Remove special elements from content before sending to AI
  const cleanedContent = removeSpecialElements(content);
  
  return `${actionText}:\n\n## ${header.trim()}\n\n${cleanedContent.trim()}`;
}