// AdaptiveTextbook.jsx - Full style layering and backend integration
import React, { useState, useEffect } from 'react';
import styles from './AdaptiveTextbook.module.css';
import { generateAISection } from '../../utils/genAIContent';
import { buildPromptWrap } from '../../utils/aiPromptTools';

const AdaptiveTextbook = ({ content, onContentSave }) => {
  const [localContent, setLocalContent] = useState(content);
  const [enhancedSections, setEnhancedSections] = useState({});
  const [isEnhancing, setIsEnhancing] = useState({});
  const [knownHeaders, setKnownHeaders] = useState([]);

  useEffect(() => {
    setLocalContent(content);
    const headerMatches = [...content.matchAll(/^##\s+(.*)/gm)].map(match => match[1].trim());
    setKnownHeaders(headerMatches);
  }, [content]);

  const handleEnhancement = async (header, paragraph) => {
    if (isEnhancing[header] || !knownHeaders.includes(header)) return;

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
    const lines = text.split('\n');
    const output = [];
    let currentHeader = null;
    let currentParagraph = [];

    const flushParagraph = () => {
      if (currentParagraph.length > 0 && currentHeader) {
        const paraText = currentParagraph.join(' ').trim();
        const enhanced = enhancedSections[currentHeader] || paraText;
        output.push(
          <div key={currentHeader + '-body'} className={styles.sectionBlock}>
            <div className={styles.enhancedTextBox}>
              <p className={styles.paragraph} dangerouslySetInnerHTML={{ __html: enhanced }} />
            </div>
            {knownHeaders.includes(currentHeader) && (
              <div className={styles.enhanceButtonRow}>
                <button
                  className={styles.enhanceButton}
                  onClick={() => handleEnhancement(currentHeader, paraText)}
                  disabled={isEnhancing[currentHeader]}
                >
                  {isEnhancing[currentHeader] ? 'Enhancing...' : 'Enhance Section'}
                </button>
              </div>
            )}
          </div>
        );
      }
      currentParagraph = [];
    };

    lines.forEach((line, idx) => {
      const headerMatch = line.match(/^##\s+(.*)/);
      if (headerMatch) {
        flushParagraph();
        currentHeader = headerMatch[1].trim();
        output.push(
          <div key={`header-${idx}`} className={styles.headerBlock}>
            <div className={styles.headerRow}>
              <h2 className={styles.heading2}>{currentHeader}</h2>
            </div>
          </div>
        );
      } else {
        currentParagraph.push(line);
      }
    });
    flushParagraph();
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
