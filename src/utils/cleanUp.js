// utils/cleanUp.js

/**
 * Removes repeated headers and paragraphs from generative responses
 * @param {string} text
 * @returns {string} cleanedText
 */
export const cleanUpResponse = (text) => {
  if (!text) return '';

  let lines = text.split('\n');
  const seenHeaders = new Set();
  const seenParagraphs = new Set();
  const cleanedLines = [];

  for (let line of lines) {
    const trimmed = line.trim();

    // Deduplicate headers
    if (/^#+\s+/.test(trimmed)) {
      if (seenHeaders.has(trimmed)) continue;
      seenHeaders.add(trimmed);
    }

    // Deduplicate near-identical paragraphs
    if (trimmed.length > 20 && seenParagraphs.has(trimmed)) continue;
    seenParagraphs.add(trimmed);

    cleanedLines.push(line);
  }

  return cleanedLines.join('\n').trim();
};
