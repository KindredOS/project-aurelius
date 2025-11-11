// utils/aiPromptTools.js

/**
 * Builds a wrapped prompt for AI enhancement of a markdown section.
 * @param {Object} params
 * @param {string} params.header - The markdown header/title of the section.
 * @param {string} params.paragraph - The main content to be modified.
 * @param {string} params.action - The action to apply (e.g., simplify, reframe).
 * @returns {string} - The wrapped prompt string for the AI model.
 */
export function buildPromptWrap({ header, paragraph, action }) {
  return `[Prompt Wrap Start]
Prompt: Please ${action} the following educational section while retaining core meaning.

## ${header}

${paragraph}
[Prompt Wrap End]`;
}

/**
 * (Optional) Future scaffolding for other types of prompt generation can go here.
 * For example, if you want to build a reframe-from-perspective prompt, you could do:
 *
 * export function buildReframePrompt({ header, paragraph, perspective }) {
 *   return `[Prompt Wrap Start]
 * Prompt: Reframe the following section from the perspective of ${perspective}.
 *
 * ## ${header}
 *
 * ${paragraph}
 * [Prompt Wrap End]`;
 * }
 */
