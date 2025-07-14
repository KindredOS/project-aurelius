// utils/markdownParsing.js - Handles UI parsing, element conversion, and enhancement actions

import { containsInteractiveElement } from './specialElements.js';
import { removeSpecialElements } from './specialElements.js';

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

/**
 * Utility function to create button configurations for enhancement actions
 * @returns {Array} - Array of button configuration objects
 */
export function getEnhancementButtons() {
  return [
    {
      action: 'simplify',
      icon: 'Sparkles',
      label: 'Simplify',
      title: 'Simplify explanation',
      className: 'simplifyButton'
    },
    {
      action: 'add_detail',
      icon: 'Plus',
      label: 'Detail',
      title: 'Add more detail',
      className: 'detailButton'
    },
    {
      action: 'contract',
      icon: 'Minimize',
      label: 'Contract',
      title: 'Make more concise',
      className: 'contractButton'
    },
    {
      action: 'reframe',
      icon: 'Brain',
      label: 'Reframe',
      title: 'Reframe perspective',
      className: 'reframeButton'
    }
  ];
}