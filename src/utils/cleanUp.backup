// utils/cleanUp.js

/**
 * Cleans up repetitive and malformed AI responses by:
 * - Removing duplicate sections (header + paragraph block)
 * - Normalizing spacing
 *
 * @param {string} text - Raw AI response to sanitize
 * @returns {string} - Cleaned markdown
 */
export const cleanUpResponse = (text) => {
  if (!text || typeof text !== 'string') return '';

  const lines = text.split('\n');
  const seenBlocks = new Set();
  const cleanedLines = [];
  let buffer = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Start a new section block when a header is found
    if (/^#{2,}\s+/.test(line)) {
      if (buffer.length > 0) {
        const block = buffer.join('\n').trim();
        if (!seenBlocks.has(block)) {
          cleanedLines.push(...buffer);
          seenBlocks.add(block);
        }
        buffer = [];
      }
    }

    buffer.push(lines[i]);
  }

  // Final block
  if (buffer.length > 0) {
    const block = buffer.join('\n').trim();
    if (!seenBlocks.has(block)) {
      cleanedLines.push(...buffer);
    }
  }

  const final = cleanedLines.join('\n').replace(/\n{3,}/g, '\n\n');
  return final.trim();
};
