// AdaptiveTextbook.jsx - Full style layering with prompt & interactive rendering
import React, { useState, useEffect } from 'react';
import styles from './AdaptiveTextbook.module.css';
import { generateAISection } from '../../utils/genAIContent';
import { buildPromptWrap } from '../../utils/aiPromptTools';
import { parseMarkdownElements, convertMarkdownBold } from '../../utils/markdownParsing';

const AdaptiveTextbook = ({ content, onContentSave }) => {
  const [localContent, setLocalContent] = useState(content);
  const [enhancedSections, setEnhancedSections] = useState({});
  const [isEnhancing, setIsEnhancing] = useState({});
  const [knownHeaders, setKnownHeaders] = useState({});
  const [promptToggles, setPromptToggles] = useState({});
  const [interactiveToggles, setInteractiveToggles] = useState({});

  useEffect(() => {
    setLocalContent(content);
    const headerMatches = [...content.matchAll(/^##\s+(.*)/gm)].map(match => match[1].trim());
    const map = {};
    headerMatches.forEach(h => map[h] = true);
    setKnownHeaders(map);
  }, [content]);

  const togglePrompt = (key) => {
    setPromptToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleInteractive = (key) => {
    setInteractiveToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleEnhancement = async (header, paragraph) => {
    if (isEnhancing[header] || !knownHeaders[header]) return;

    setIsEnhancing(prev => ({ ...prev, [header]: true }));
    try {
      const prompt = buildPromptWrap({ header, paragraph, action: 'enhance' });
      let result = await generateAISection(prompt, 'hermes', 750);

      if (result) {
        const headerLine = `## ${header}`;
        const lines = result.split('\n');
        const filteredLines = lines.filter(line => {
          const trimmed = line.trim();
          if (/^#{1,6}\s+/.test(trimmed)) return false;
          if (trimmed === headerLine) return false;
          return true;
        });

        result = filteredLines.join('\n').trim();

        setEnhancedSections(prev => ({ ...prev, [header]: result }));

        const sectionRegex = new RegExp(`(##\s+${header}\s*\n)([\s\S]*?)(?=\n##\s+|$)`, 'i');
        const newContent = localContent.replace(sectionRegex, `$1${result}\n`);
        setLocalContent(newContent);

        if (onContentSave) await onContentSave(newContent);
      } else {
        setEnhancedSections(prev => ({ ...prev, [header]: '⚠️ No response from AI.' }));
      }
    } catch (err) {
      setEnhancedSections(prev => ({ ...prev, [header]: `⚠️ Error: ${err.message}` }));
    } finally {
      setIsEnhancing(prev => ({ ...prev, [header]: false }));
    }
  };

  const parseContent = (text) => {
    const elements = parseMarkdownElements(text);
    const output = [];
    let currentHeader = null;

    elements.forEach((element, index) => {
      switch (element.type) {
        case 'header':
          currentHeader = element.content;
          output.push(
            <div key={`header-${index}`} className={styles.headerBlock}>
              <div className={styles.headerRow}>
                <h2 className={styles.heading2}>
  {currentHeader}
  <button
    className={styles.lessonLens}
    title="Learning Lens"
    onClick={() => console.log(`Lesson Lens: ${currentHeader}`)}
  >
    🧠
  </button>
</h2>
              </div>
            </div>
          );
          break;

        case 'prompt':
          output.push(
            <div key={`prompt-${index}`} className={styles.promptBox}>
              <button
                className={styles.promptToggle}
                onClick={() => togglePrompt(index)}
              >
                {promptToggles[index] ? '▼ Prompt' : '▶ Prompt'}
              </button>
              {promptToggles[index] && (
                <div className={styles.promptContent}>{element.content}</div>
              )}
            </div>
          );
          break;

        case 'interactive':
          output.push(
            <div key={`interactive-${index}`} className={styles.interactiveBox}>
              <button
                className={styles.interactiveToggle}
                onClick={() => toggleInteractive(index)}
              >
                {interactiveToggles[index] ? '▼ Interactive Module' : '▶ Interactive Module'}
              </button>
              {interactiveToggles[index] && (
                <div className={styles.interactiveContent}><em>Content coming soon...</em></div>
              )}
            </div>
          );
          break;

        case 'paragraph':
          const content = enhancedSections[currentHeader] || element.content;
          const html = convertMarkdownBold(content);
          output.push(
            <div key={`para-${index}`} className={styles.sectionBlock}>
              <div className={styles.enhancedTextBox}>
                <p className={styles.paragraph} dangerouslySetInnerHTML={{ __html: html }} />
              </div>
              {knownHeaders[currentHeader] && (
                <div className={styles.enhanceButtonRow}>
                  <button
                    className={styles.enhanceButton}
                    onClick={() => handleEnhancement(currentHeader, element.content)}
                    disabled={isEnhancing[currentHeader]}
                  >
                    {isEnhancing[currentHeader] ? 'Enhancing...' : 'Enhance Section'}
                  </button>
                </div>
              )}
            </div>
          );
          break;

        default:
          break;
      }
    });

    return output;
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {localContent ? parseContent(localContent) : (
          <p className={styles.noContent}>No content available.</p>
        )}
      </div>
    </div>
  );
};

export default AdaptiveTextbook;
