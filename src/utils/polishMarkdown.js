// utils/markdownPolisher.js

import { getApiUrl } from '../api/ApiMaster';

export const processEnhancedMarkdown = (rawResult) => {
  let processed = rawResult;

  if (typeof processed === 'string') {
    if ((processed.startsWith('"') && processed.endsWith('"')) || 
        (processed.startsWith("'") && processed.endsWith("'"))) {
      try {
        processed = JSON.parse(processed);
      } catch (e) {
        processed = processed.slice(1, -1);
      }
    }

    if (processed.includes('\\')) {
      processed = processed
        .replace(/\\n/g, '\n')
        .replace(/\\t/g, '\t')
        .replace(/\\r/g, '\r')
        .replace(/\\"/g, '"')
        .replace(/\\'/g, "'")
        .replace(/\\\\/g, '\\');
    }
  }

  return processed;
};

export async function polishMarkdown({ text, action, personality = 'default', model_key = 'hermes' }) {
  try {
    const response = await fetch(`${getApiUrl()}/edu/science/markdown/enhance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, action, personality, model_key })
    });

    const data = await response.json();
    const enhanced = processEnhancedMarkdown(data.result);

    console.log('Raw API response:', data.result);
    console.log('Processed markdown:', enhanced);

    return enhanced;
  } catch (error) {
    console.error('AI Markdown Enhancement failed:', error);
    return 'Error enhancing content.';
  }
}