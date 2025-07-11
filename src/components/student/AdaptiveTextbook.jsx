// components/student/AdaptiveTextbook.jsx
// NOTE: Enhancement logic (AI requests) is delegated via `onEnhance` prop.
// This promotes separation of concerns and keeps this component UI-focused and reusable.

import React, { useState } from 'react';
import { Sparkles, Plus, Minimize, Brain } from 'lucide-react';
import styles from './AdaptiveTextbook.module.css';

const AdaptiveTextbook = ({ content, onEnhance, onMarkdownUpdate }) => {
  const [enhancedSections, setEnhancedSections] = useState({});
  const [expandedHeader, setExpandedHeader] = useState(null);

  const actionMap = {
    simplify: 'Simplify the following section',
    add_detail: 'Add more depth to the following section',
    contract: 'Make the following section shorter and more concise',
    reframe: 'Reframe the following section from a new perspective'
  };

  const extractSectionUnderHeader = (text, header) => {
    const lines = text.split('\n');
    const headerIndex = lines.findIndex(line => line.replace(/^#+\s*/, '') === header);
    if (headerIndex === -1) return '';

    const currentLevel = (lines[headerIndex].match(/^#+/) || [''])[0].length;
    const bodyLines = [];

    for (let i = headerIndex + 1; i < lines.length; i++) {
      const line = lines[i];
      const lineLevel = (line.match(/^#+/) || [''])[0].length;

      if (lineLevel && lineLevel <= currentLevel) break;
      bodyLines.push(line);
    }

    return bodyLines.join('\n').trim();
  };

  const handleEnhancement = async (header, action) => {
    console.log('Enhancement triggered:', header, action);
    try {
      const sectionBody = extractSectionUnderHeader(content, header);
      const prompt = `${actionMap[action]}:\n\n## ${header}\n\n${sectionBody}`;

      const enhancedBody = await onEnhance(prompt, action);

      const lines = content.split('\n');
      const headerIndex = lines.findIndex(line => line.replace(/^#+\s*/, '') === header);
      const newLines = [...lines];

      let i = headerIndex + 1;
      while (i < newLines.length && !newLines[i].startsWith('#')) {
        newLines.splice(i, 1);
      }

      const enhancedLines = enhancedBody.split('\n');
      newLines.splice(headerIndex + 1, 0, ...enhancedLines);

      const updatedContent = newLines.join('\n');

      setEnhancedSections(prev => ({ ...prev, [header]: enhancedBody }));
      onMarkdownUpdate?.(updatedContent);
    } catch (error) {
      console.error('Enhancement failed:', error);
    }
  };

  const toggleIconBar = (headerText) => {
    setExpandedHeader(prev => prev === headerText ? null : headerText);
  };

  const parseMarkdown = (text) => {
    const lines = text.split('\n');
    const elements = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.startsWith('# ')) {
        const headerText = line.substring(2);
        elements.push(renderHeader(headerText, 1));
      } else if (line.startsWith('## ')) {
        const headerText = line.substring(3);
        elements.push(renderHeader(headerText, 2));
      } else if (line.startsWith('### ')) {
        const headerText = line.substring(4);
        elements.push(renderHeader(headerText, 3));
      } else if (line.startsWith('#### ')) {
        const headerText = line.substring(5);
        elements.push(renderHeader(headerText, 4));
      } else if (line.trim() !== '') {
        const boldText = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        elements.push(
          <p key={i} className={styles.paragraph} dangerouslySetInnerHTML={{ __html: boldText }} />
        );
      }
    }

    return elements;
  };

  const renderHeader = (headerText, level) => {
    const enhancedText = enhancedSections[headerText] || null;
    const isExpanded = expandedHeader === headerText;

    const headerClasses = {
      1: styles.heading1,
      2: styles.heading2,
      3: styles.heading3,
      4: styles.heading4
    };

    return (
      <div key={headerText} className={styles.headerBlock}>
        <div className={styles.headerRow}>
          <div className={headerClasses[level]}>
            {headerText}
          </div>

          <button
            onClick={() => toggleIconBar(headerText)}
            className={styles.toggleButton}
            title="Show enhancement options"
          >
            <Sparkles size={14} className={styles.toggleIcon} />
          </button>
        </div>

        {isExpanded && (
          <div className={styles.iconBar}>
            <button
              onClick={() => handleEnhancement(headerText, 'simplify')}
              className={`${styles.enhanceButton} ${styles.simplifyButton}`}
              title="Simplify explanation"
            >
              <Sparkles size={16} />
              <span>Simplify</span>
            </button>

            <button
              onClick={() => handleEnhancement(headerText, 'add_detail')}
              className={`${styles.enhanceButton} ${styles.detailButton}`}
              title="Add more detail"
            >
              <Plus size={16} />
              <span>Detail</span>
            </button>

            <button
              onClick={() => handleEnhancement(headerText, 'contract')}
              className={`${styles.enhanceButton} ${styles.contractButton}`}
              title="Make more concise"
            >
              <Minimize size={16} />
              <span>Contract</span>
            </button>

            <button
              onClick={() => handleEnhancement(headerText, 'reframe')}
              className={`${styles.enhanceButton} ${styles.reframeButton}`}
              title="Reframe perspective"
            >
              <Brain size={16} />
              <span>Reframe</span>
            </button>
          </div>
        )}

        {enhancedText && (
          <div className={styles.enhancedContent}>
            <div className={styles.enhancedHeader}>
              <Sparkles size={16} className={styles.toggleIcon} />
              <span className={styles.enhancedLabel}>AI Enhancement</span>
            </div>
            <p className={styles.enhancedText}>{enhancedText}</p>
          </div>
        )}
      </div>
    );
  };

  if (!content) {
    return (
      <div className={styles.noContent}>
        No content available
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {parseMarkdown(content)}
      </div>
    </div>
  );
};

export default AdaptiveTextbook;
