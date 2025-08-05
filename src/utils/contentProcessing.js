// utils/contentProcessing.js - Production version with comprehensive markdown processing utilities

/**
 * Extracts the content under a specific header in markdown text
 * 
 * Implementation Notes:
 * - Respects markdown header hierarchy to prevent reading multiple sections
 * - Stops at any header of equal or higher level (proper section boundaries)
 * - Handles up to 6 levels of markdown headers (# through ######)
 * - Special element handling for prompt wraps and interactive elements
 * - Designed to work with documents containing multiple content blocks
 * 
 * @param {string} text - The markdown text
 * @param {string} header - The header text to find
 * @param {boolean} preserveSpecialElements - If true, preserves prompt wraps and interactive elements
 * @returns {string} - The content under the header (stops at section boundaries)
 */
export function extractSectionUnderHeader(text, header, preserveSpecialElements = false) {
  if (!text || !header) return '';

  const lines = text.split('\n');
  const headerIndex = lines.findIndex(line => line.replace(/^#+\s*/, '').trim() === header.trim());
  if (headerIndex === -1) return '';

  const currentLevel = (lines[headerIndex].match(/^#+/) || [''])[0].length;
  const startIndex = headerIndex + 1;

  // Handle special elements based on mode
  let skipPromptWrap = false;
  const bodyLines = [];

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];

    // Check for headers - more robust matching
    const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      // Stop if we hit a header that's not a subheader (section boundary)
      if (level <= currentLevel) {
        break;
      }
    }

    if (preserveSpecialElements) {
      // In preserve mode, include all special elements as-is BUT still respect section boundaries
      bodyLines.push(line);
    } else {
      // Original behavior: skip prompt wraps and stop at interactive elements
      if (line.includes('[Prompt Wrap Start]')) {
        skipPromptWrap = true;
        continue;
      }
      if (line.includes('[Prompt Wrap End]')) {
        skipPromptWrap = false;
        continue;
      }
      if (skipPromptWrap) continue;

      // Stop before interactive elements
      if (line.includes('[interactive element]')) {
        break;
      }

      bodyLines.push(line);
    }
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
 * Check if content has been duplicated by comparing normalized versions
 * @param {string} content - The content to check
 * @returns {boolean} - True if duplication is detected
 */
export function detectContentDuplication(content) {
  if (!content) return false;

  const paragraphs = content.split('\n\n').filter(p => p.trim().length > 50);
  const normalizedParagraphs = paragraphs.map(p => p.replace(/\s+/g, ' ').trim().toLowerCase());

  // Check for exact duplicates
  const uniqueParagraphs = new Set(normalizedParagraphs);
  return uniqueParagraphs.size !== normalizedParagraphs.length;
}

/**
 * Remove duplicate content sections
 * @param {string} content - The content to deduplicate
 * @returns {string} - Content with duplicates removed
 */
export function removeDuplicateContent(content) {
  if (!content) return '';

  const lines = content.split('\n');
  const processedLines = [];
  const seenSections = new Set();

  let currentSection = [];
  let inSection = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if this is a header or significant content start
    if (line.match(/^#{1,6}\s+/) || (line.trim() && !inSection)) {
      // Process the previous section if it exists
      if (currentSection.length > 0) {
        const sectionText = currentSection.join('\n');
        const normalizedSection = sectionText.replace(/\s+/g, ' ').trim().toLowerCase();

        if (!seenSections.has(normalizedSection)) {
          seenSections.add(normalizedSection);
          processedLines.push(...currentSection);
        }
      }

      // Start new section
      currentSection = [line];
      inSection = true;
    } else {
      // Add to current section
      currentSection.push(line);
    }
  }

  // Process the last section
  if (currentSection.length > 0) {
    const sectionText = currentSection.join('\n');
    const normalizedSection = sectionText.replace(/\s+/g, ' ').trim().toLowerCase();

    if (!seenSections.has(normalizedSection)) {
      processedLines.push(...currentSection);
    }
  }

  return processedLines.join('\n');
}

/**
 * Replaces a section under a specific header with new content
 * Handles special elements properly and prevents duplication
 * 
 * Implementation Notes:
 * - Properly handles section boundaries by respecting header hierarchy
 * - Removes any headers from new content to prevent nesting issues
 * - Maintains consistent spacing around replaced content
 * - Handles edge cases like missing headers and empty content
 * 
 * @param {string} originalContent - The original markdown content
 * @param {string} header - The header text to find
 * @param {string} newContent - The new content to replace with
 * @returns {string} - The updated markdown content
 */
export function replaceSection(originalContent, header, newContent) {
  if (!originalContent || !header) return originalContent;

  const lines = originalContent.split('\n');
  const headerIndex = lines.findIndex(line => {
    const cleanLine = line.replace(/^#+\s*/, '');
    return cleanLine === header;
  });

  if (headerIndex === -1) {
    return originalContent;
  }

  const currentLevel = (lines[headerIndex].match(/^#+/) || [''])[0].length;

  // Find the end of this section (next header of same or higher level)
  let endIndex = lines.length;
  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    const headerMatch = line.match(/^#+/);
    if (headerMatch) {
      const lineLevel = headerMatch[0].length;
      if (lineLevel <= currentLevel) {
        endIndex = i;
        break;
      }
    }
  }

  // Build the new content array
  const newLines = [];
  
  // Add everything BEFORE the header
  for (let i = 0; i < headerIndex; i++) {
    newLines.push(lines[i]);
  }
  
  // Add the header itself
  newLines.push(lines[headerIndex]);
  
  // Add the new content (if any)
  if (newContent && typeof newContent === 'string') {
    let cleanedContent = newContent
      .replace(/^#{1,6}\s+.*$/gm, '') // Remove any headers from the new content
      .replace(/^\n+/, '') // Remove leading newlines
      .trim();

    if (cleanedContent) {
      newLines.push(''); // Add spacing after header
      const enhancedLines = cleanedContent.split('\n');
      newLines.push(...enhancedLines);
      newLines.push(''); // Add spacing after content
    }
  }
  
  // Add everything AFTER the original section
  for (let i = endIndex; i < lines.length; i++) {
    newLines.push(lines[i]);
  }

  const result = newLines.join('\n');
  
  // Clean up excessive whitespace
  const cleanResult = result.replace(/\n{3,}/g, '\n\n');
  
  return cleanResult;
}