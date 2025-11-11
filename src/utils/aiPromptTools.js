// utils/aiPromptTools.js

/**
 * Builds a wrapped prompt for AI enhancement of a markdown section.
 * IMPORTANT: This preserves embedded textbook functionality and formatting.
 *
 * @param {Object} params
 * @param {string} params.header - The markdown header/title of the section.
 * @param {string} params.paragraph - The main content to be modified.
 * @param {string} params.action - The action to apply (e.g., simplify, reframe).
 * @param {string} [params.userMBTI] - Optional MBTI type used to personalize tone.
 * @returns {string} - The wrapped prompt string for the AI model.
 */
export function buildPromptWrap({ header, paragraph, action, userMBTI }) {
  return `
You are an expert adaptive learning tutor rewriting the section below.

CRITICAL FORMAT RULES (DO NOT BREAK THESE):
- **Do NOT alter, remove, or reformat embedded special elements.**
- Do not modify or delete:
  - \`:::prompt\` blocks
  - \`:::interactive\` blocks
  - \`[STEP]\`, \`[TRY IT]\`, \`[EXAMPLE]\`, or any custom markers
  - Code fences (\`\`\`)
- Do not change header levels, bullet structure, or spacing between blocks.
- Only rewrite **explanatory prose text** — everything else must remain exactly as-is.

LEARNER PERSONALIZATION:
- Tailor tone toward MBTI type: **${userMBTI || "INTJ"}**
- Be direct, supportive, and clear — avoid generic textbook voice.

OUTPUT STRUCTURE:
1. Start with a **one-sentence statement of the core concept**.
2. Explain the concept plainly using **simple but accurate language**.
3. Include **a real-world analogy** to make the idea concrete.
4. Provide a **3–5 step reasoning breakdown**.
5. End with **a self-check question** for learner reflection.

ACTION REQUESTED:
"${action}"

Rewrite ONLY the plain text explanation within this section:

## ${header}
${paragraph}

Return **only the rewritten markdown section**, with embedded elements untouched.
`;
}
