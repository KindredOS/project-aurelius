// ===================================================================
// utils/contentProcessing.js - FIXED VERSION
// ===================================================================

/**
 * FIXED: Replaces a section under a specific header with new content
 * Prevents accumulation of processing artifacts
 * @param {string} originalContent - The original markdown content
 * @param {string} header - The header text to find
 * @param {string} newContent - The new content to replace with
 * @returns {string} - The updated markdown content
 */
export function replaceSection(originalContent, header, newContent) {
  if (!originalContent || !header) return originalContent;

  // FIXED: Clean the original content first
  const cleanedOriginal = cleanExistingProcessingArtifacts(originalContent);
  
  const specialElements = extractSpecialElements(cleanedOriginal);

  const lines = cleanedOriginal.split('\n');
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
    // FIXED: Clean the new content of any processing artifacts
    let cleanedContent = cleanExistingProcessingArtifacts(newContent);
    
    cleanedContent = cleanedContent
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

  const sectionSpecialElements = {
    promptWraps: specialElements.promptWraps.filter(pw =>
      pw.lineNumber > headerIndex && pw.lineNumber < endIndex
    ),
    interactiveElements: specialElements.interactiveElements.filter(ie =>
      ie.lineNumber > headerIndex && ie.lineNumber < endIndex
    )
  };

  const restored = restoreSpecialElements(result, sectionSpecialElements, cleanedOriginal);

  return removeDuplicateContent(restored);
}