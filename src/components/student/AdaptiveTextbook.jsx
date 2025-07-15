// utils/polishMarkdown.js - RESTORED DEBUG VERSION (with full annotation return)
import { getApiUrl } from '../api/ApiMaster';
import {
  extractSpecialElements,
  removeSpecialElements,
  restoreSpecialElements
} from './specialElements';
import {
  detectContentDuplication,
  removeDuplicateContent
} from './contentProcessing';

export const cleanExistingProcessingArtifacts = (text) => {
  if (!text) return '';

  let cleaned = text.replace(/\n\n---\n⚠️ \[SANITIZED at [^\]]+\]\n---\n/g, '');
  cleaned = cleaned.replace(/---\n⚠️ \[SANITIZED[^\]]*\]\n---/g, '');
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim();

  return cleaned;
};

export const processEnhancedMarkdown = (rawResult) => {
  let processed = rawResult;

  if (typeof processed === 'string') {
    processed = cleanExistingProcessingArtifacts(processed);

    if ((processed.startsWith('"') && processed.endsWith('"')) || 
        (processed.startsWith("'") && processed.endsWith("'"))) {
      try {
        processed = JSON.parse(processed);
      } catch (e) {
        processed = processed.slice(1, -1);
      }
    }

    processed = processed.replace(/\\n/g, '\n');
    processed = processed.replace(/\\t/g, '\t');
    processed = processed.replace(/\\r/g, '\r');
    processed = processed.replace(/\\"/g, '"');
    processed = processed.replace(/\\'/g, "'");
    processed = processed.replace(/\\\\/g, '\\');

    processed = processed.replace(/^"#\s*/gm, '# ');
    processed = processed.replace(/^"(#{1,6}\s+[^"}]+)"$/gm, '$1');
    processed = processed.replace(/^"([^"}]*?)$/gm, '$1');

    const lines = processed.split('\n');
    const cleanedLines = [];
    let lastHeader = null;

    for (const line of lines) {
      const isHeader = /^#{1,6}\s+/.test(line);
      if (isHeader && line === lastHeader) continue;
      cleanedLines.push(line);
      if (isHeader) lastHeader = line;
    }

    processed = cleanedLines.join('\n');
    processed = processed.replace(/^\n+/, '').replace(/\n{3,}/g, '\n\n');
    processed = processed.replace(/(#{1,6}\s+[^\n]+)\n([^\n#])/g, '$1\n\n$2');
    processed = processed.trim();
  }

  return processed;
};

export async function polishMarkdown({ text, action, personality = 'default', model_key = 'hermes' }) {
  try {
    const cleanedInputText = cleanExistingProcessingArtifacts(text);
    const cleanedText = cleanedInputText;

    const response = await fetch(`${getApiUrl()}/markdown/enhance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: cleanedText, action, personality, model_key })
    });

    const data = await response.json();
    let enhanced = processEnhancedMarkdown(data.result);

    if (detectContentDuplication(enhanced)) {
      enhanced = removeDuplicateContent(enhanced);
    }

    const final = enhanced;
    const timestamp = new Date().toISOString();

    const annotated = [
      `---\n⚠️ [SANITIZED - ORIGINAL at ${timestamp}]\n---\n${text.trim()}`,
      `---\n⚠️ [SANITIZED - ENHANCED at ${timestamp}]\n---\n${enhanced.trim()}`,
      `---\n⚠️ [SANITIZED - FINAL OUTPUT at ${timestamp}]\n---\n${final.trim()}`
    ].join('\n\n');

    return annotated;
  } catch (error) {
    console.error('AI Markdown Enhancement failed:', error);
    return 'Error enhancing content.';
  }
}
