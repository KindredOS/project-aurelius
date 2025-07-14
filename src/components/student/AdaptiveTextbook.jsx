// components/student/AdaptiveTextbook.jsx
// Refactored to rely on onEnhance prop again (handled via TopicHeader)

import React, { useState } from 'react';
import { Sparkles, Plus, Minimize, Brain, ChevronDown, ChevronRight } from 'lucide-react';
import styles from './AdaptiveTextbook.module.css';
import { extractPromptWrap, containsInteractiveElement } from '../../utils/extensionsMarkdown';

const AdaptiveTextbook = ({ content, onEnhance, onMarkdownUpdate }) => {
  const [enhancedSections, setEnhancedSections] = useState({});
  const [expandedHeader, setExpandedHeader] = useState(null);
  const [promptToggles, setPromptToggles] = useState({});
  const [interactiveToggles, setInteractiveToggles] = useState({});

  const togglePrompt = (key) => {
    setPromptToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleInteractive = (key) => {
    setInteractiveToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

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
      const prompt = `${actionMap[action]}:\n\n## ${header.trim()}\n\n${sectionBody.trim()}`;

      const enhancedBody = await onEnhance?.(prompt, action);

      if (!enhancedBody || typeof enhancedBody !== 'string') {
        throw new Error('Empty or invalid enhancement response');
      }

      const lines = content.split('\n');
      const headerIndex = lines.findIndex(line => line.replace(/^#+\s*/, '') === header);
      const newLines = [...lines];

      let i = headerIndex + 1;
      while (i < newLines.length && !newLines[i].startsWith('#')) {
        newLines.splice(i, 1);
      }

      const enhancedLines = (enhancedBody || '').split('\n');
      newLines.splice(headerIndex + 1, 0, ...enhancedLines);

      const updatedContent = newLines.join('\n');

      setEnhancedSections(prev => ({ ...prev, [header]: enhancedBody }));
      onMarkdownUpdate?.(updatedContent);
    } catch (error) {
      console.error('Enhancement failed:', error);
      setEnhancedSections(prev => ({ ...prev, [header]: '⚠️ Enhancement failed. Please try again later.' }));
    }
  };

  const toggleIconBar = (headerText) => {
    setExpandedHeader(prev => prev === headerText ? null : headerText);
  };

  const parseMarkdown = (text) => {
    const lines = text.split('\n');
    const elements = [];
    let insidePrompt = false;
    let promptBuffer = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.includes('[Prompt Wrap Start]')) {
        insidePrompt = true;
        promptBuffer = [];
        continue;
      }
      if (line.includes('[Prompt Wrap End]')) {
        insidePrompt = false;
        const fullPromptText = promptBuffer.join(' ').replace(/Prompt:\s*/i, '').trim();
        if (fullPromptText) {
          elements.push(
            <div key={`prompt-${i}`} className={styles.promptBox}>
              <button
                className={styles.promptToggle}
                onClick={() => togglePrompt(i)}
              >
                {promptToggles[i] ? <ChevronDown size={16} /> : <ChevronRight size={16} />} <strong>Prompt</strong>
              </button>
              {promptToggles[i] && (
                <div className={styles.promptContent}>{fullPromptText}</div>
              )}
            </div>
          );
        }
        continue;
      }
      if (insidePrompt) {
        promptBuffer.push(line);
        continue;
      }

      if (line.startsWith('# ')) {
        const headerText = line.substring(2);
        elements.push(renderHeader(headerText, 1, i));
      } else if (line.startsWith('## ')) {
        const headerText = line.substring(3);
        elements.push(renderHeader(headerText, 2, i));
      } else if (line.startsWith('### ')) {
        const headerText = line.substring(4);
        elements.push(renderHeader(headerText, 3, i));
      } else if (line.startsWith('#### ')) {
        const headerText = line.substring(5);
        elements.push(renderHeader(headerText, 4, i));
      } else if (line.includes('[interactive element]') || containsInteractiveElement(line)) {
        elements.push(
          <div key={`interactive-${i}`} className={styles.interactiveBox}>
            <button
              className={styles.interactiveToggle}
              onClick={() => toggleInteractive(i)}
            >
              {interactiveToggles[i] ? <ChevronDown size={16} /> : <ChevronRight size={16} />} <strong>Interactive Module</strong>
            </button>
            {interactiveToggles[i] && (
              <div className={styles.interactiveContent}><em>Content coming soon...</em></div>
            )}
          </div>
        );
      } else if (line.trim() !== '') {
        const boldText = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        elements.push(
          <p key={i} className={styles.paragraph} dangerouslySetInnerHTML={{ __html: boldText }} />
        );
      }
    }

    return elements;
  };

  const renderHeader = (headerText, level, lineIndex) => {
    const enhancedText = enhancedSections[headerText] || null;
    const isExpanded = expandedHeader === headerText;

    const headerClasses = {
      1: styles.heading1,
      2: styles.heading2,
      3: styles.heading3,
      4: styles.heading4
    };

    return (
      <div key={`header-${lineIndex}-${headerText}`} className={styles.headerBlock}>
        <div className={styles.headerRow}>
          <div className={headerClasses[level]}>
            {headerText}
          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleIconBar(headerText);
            }}
            className={styles.toggleButton}
            title="Show enhancement options"
            type="button"
          >
            <Brain size={14} className={styles.toggleIcon} />
            <span className={styles.toggleText}>Learning Lens</span>
          </button>
        </div>

        {isExpanded && (
          <div className={styles.iconBar}>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleEnhancement(headerText, 'simplify');
              }}
              className={`${styles.enhanceButton} ${styles.simplifyButton}`}
              title="Simplify explanation"
              type="button"
            >
              <Sparkles size={16} />
              <span>Simplify</span>
            </button>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleEnhancement(headerText, 'add_detail');
              }}
              className={`${styles.enhanceButton} ${styles.detailButton}`}
              title="Add more detail"
              type="button"
            >
              <Plus size={16} />
              <span>Detail</span>
            </button>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleEnhancement(headerText, 'contract');
              }}
              className={`${styles.enhanceButton} ${styles.contractButton}`}
              title="Make more concise"
              type="button"
            >
              <Minimize size={16} />
              <span>Contract</span>
            </button>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleEnhancement(headerText, 'reframe');
              }}
              className={`${styles.enhanceButton} ${styles.reframeButton}`}
              title="Reframe perspective"
              type="button"
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
    return <div className={styles.noContent}>No content available</div>;
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
