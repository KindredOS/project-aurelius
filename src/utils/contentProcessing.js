// utils/contentProcessing.js - Handles content structure, deduplication, and section management

import { extractSpecialElements, restoreSpecialElements } from './specialElements.js';

/**
 * Extracts the content under a specific header in markdown text
 * @param {string} text - The markdown text
 * @param {string} header - The header text to find
 * @returns {string} - The content under the header
 */
export function extractSectionUnderHeader(text, header) {
  if (!text || !header) return '';

  const lines = text.split('\n');
  const headerIndex = lines.findIndex(line => line.replace(/^#+\s*/, '') === header);
  if (headerIndex === -1) return '';

  const currentLevel = (lines[headerIndex].match(/^#+/) || [''])[0].length;

  let startIndex = headerIndex + 1;
  let endIndex = lines.length;

  // Always skip any prompt wrap (if present)
  let skipPromptWrap = false;
  const bodyLines = [];

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];

    const headerMatch = line.match(/^#{1,6}\s+/);
    const level = headerMatch ? headerMatch[0].length : 0;

    // Stop if we hit a header that's not a subheader
    if (level && level <= currentLevel) {
      endIndex = i;
      break;
    }

    // Handle skipping prompt wraps
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
      endIndex = i;
      break;
    }

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
 * @param {string} originalContent - The original markdown content
 * @param {string} header - The header text to find
 * @param {string} newContent - The new content to replace with
 * @returns {string} - The updated markdown content
 */
export function replaceSection(originalContent, header, newContent) {
  if (!originalContent || !header) return originalContent;

  const specialElements = extractSpecialElements(originalContent);

  const lines = originalContent.split('\n');
  const headerIndex = lines.findIndex(line => {
    const cleanLine = line.replace(/^#+\s*/, '');
    return cleanLine === header;
  });

  if (headerIndex === -1) return originalContent;

  const currentLevel = (lines[headerIndex].match(/^#+/) || [''])[0].length;
  const newLines = [...lines];

  let endIndex = newLines.length;
  for (let i = headerIndex + 1; i < newLines.length; i++) {
    const line = newLines[i];
    const lineLevel = (line.match(/^#+/) || [''])[0].length;
    if (lineLevel && lineLevel <= currentLevel) {
      endIndex = i;
      break;
    }
  }

  newLines.splice(headerIndex + 1, endIndex - headerIndex - 1);

  if (newContent && typeof newContent === 'string') {
    let cleanedContent = newContent
      .replace(/^#{1,6}\s+.*$/gm, '')
      .replace(/^\n+/, '')
      .trim();

    cleanedContent = removeDuplicateContent(cleanedContent);

    if (cleanedContent) {
      const enhancedLines = cleanedContent.split('\n');
      newLines.splice(headerIndex + 1, 0, '', ...enhancedLines, '');
    }
  }

  let result = newLines.join('\n');

  // const sectionSpecialElements = {
  //   promptWraps: specialElements.promptWraps.filter(pw =>
  //     pw.lineNumber > headerIndex && pw.lineNumber < endIndex
  //   ),
  //   interactiveElements: specialElements.interactiveElements.filter(ie =>
  //     ie.lineNumber > headerIndex && ie.lineNumber < endIndex
  //   )
  // };

  // const restored = restoreSpecialElements(result, sectionSpecialElements, originalContent);

  // return removeDuplicateContent(restored);
  return removeDuplicateContent(result);
}
