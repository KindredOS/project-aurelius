// utils/extensionsMarkdown.js

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
