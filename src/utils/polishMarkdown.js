// utils/polishMarkdown.js

import { getApiUrl } from '../api/ApiMaster';

export const processEnhancedMarkdown = (rawResult) => {
  let processed = rawResult;

  if (typeof processed === 'string') {
    // Remove outer quotes if present
    if ((processed.startsWith('"') && processed.endsWith('"')) || 
        (processed.startsWith("'") && processed.endsWith("'"))) {
      try {
        processed = JSON.parse(processed);
      } catch (e) {
        processed = processed.slice(1, -1);
      }
    }

    // FIX: Handle literal \n sequences that should be actual newlines
    // This is the main fix for your double \n issue
    processed = processed.replace(/\\n/g, '\n');
    processed = processed.replace(/\\t/g, '\t');
    processed = processed.replace(/\\r/g, '\r');
    processed = processed.replace(/\\"/g, '"');
    processed = processed.replace(/\\'/g, "'");
    processed = processed.replace(/\\\\/g, '\\');
    
    // FIX: Handle malformed headers that start with quotes
    // This fixes the "# What is Science? issue
    processed = processed.replace(/^"#\s*/gm, '# ');
    
    // Also handle cases where the entire header line is quoted
    processed = processed.replace(/^"(#{1,6}\s+[^"]+)"$/gm, '$1');
    
    // Clean up any remaining quotes at the start of lines that shouldn't be there
    processed = processed.replace(/^"([^"]*?)$/gm, '$1');
    
    // Clean up any remaining double-escaped newlines
    processed = processed.replace(/\n\n\n+/g, '\n\n'); // Replace 3+ newlines with just 2
    
    // Ensure proper spacing after headers
    processed = processed.replace(/(#{1,6}\s+[^\n]+)\n([^\n#])/g, '$1\n\n$2');
  }

  return processed;
};

export async function polishMarkdown({ text, action, personality = 'default', model_key = 'hermes' }) {
  try {
      const response = await fetch(`${getApiUrl()}/markdown/enhance`, {
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