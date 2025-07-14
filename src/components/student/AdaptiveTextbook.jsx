// components/student/AdaptiveTextbook.jsx
// Fixed version with better error handling and content manipulation

import React, { useState } from 'react';
import { Sparkles, Plus, Minimize, Brain, ChevronDown, ChevronRight } from 'lucide-react';
import styles from './AdaptiveTextbook.module.css';
import { extractPromptWrap, containsInteractiveElement } from '../../utils/extensionsMarkdown';

const AdaptiveTextbook = ({ content, onEnhance, onMarkdownUpdate }) => {
  const [enhancedSections, setEnhancedSections] = useState({});
  const [expandedHeader, setExpandedHeader] = useState(null);
  const [promptToggles, setPromptToggles] = useState({});
  const [interactiveToggles, setInteractiveToggles] = useState({});
  const [isEnhancing, setIsEnhancing] = useState({});

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
    if (!text || !header) return '';
    
    const lines = text.split('\n');
    const headerIndex = lines.findIndex(line => {
      const cleanLine = line.replace(/^#+\s*/, '');
      return cleanLine === header;
    });
    
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

  const replaceSection = (originalContent, header, newContent) => {
    if (!originalContent || !header) return originalContent;
    
    const lines = originalContent.split('\n');
    const headerIndex = lines.findIndex(line => {
      const cleanLine = line.replace(/^#+\s*/, '');
      return cleanLine === header;
    });
    
    if (headerIndex === -1) return originalContent;

    const currentLevel = (lines[headerIndex].match(/^#+/) || [''])[0].length;
    const newLines = [...lines];
    
    // Find the end of this section
    let endIndex = newLines.length;
    for (let i = headerIndex + 1; i < newLines.length; i++) {
      const line = newLines[i];
      const lineLevel = (line.match(/^#+/) || [''])[0].length;
      if (lineLevel && lineLevel <= currentLevel) {
        endIndex = i;
        break;
      }
    }
    
    // Remove the old section content (keep the header)
    newLines.splice(headerIndex + 1, endIndex - headerIndex - 1);
    
    // Insert the new content
    if (newContent && typeof newContent === 'string') {
      const enhancedLines = newContent.split('\n');
      newLines.splice(headerIndex + 1, 0, '', ...enhancedLines, '');
    }
    
    return newLines.join('\n');
  };

  const handleEnhancement = async (header, action) => {
    console.log('Enhancement triggered:', header, action);
    
    // Set loading state
    setIsEnhancing(prev => ({ ...prev, [header]: true }));
    
    try {
      const sectionBody = extractSectionUnderHeader(content, header);
      const prompt = `${actionMap[action]}:\n\n## ${header.trim()}\n\n${sectionBody.trim()}`;

      console.log('Calling onEnhance with prompt:', prompt);
      
      if (!onEnhance) {
        throw new Error('onEnhance function not provided');
      }

      const enhancedBody = await onEnhance(prompt, action);
      console.log('Enhancement response:', enhancedBody);

      // Better validation for the response
      if (!enhancedBody) {
        throw new Error('No response received from enhancement service');
      }

      if (typeof enhancedBody !== 'string') {
        throw new Error('Enhancement response is not a string');
      }

      if (enhancedBody.trim().length === 0) {
        throw new Error('Enhancement response is empty');
      }

      // Check if the response is an error message
      if (enhancedBody.includes('404') || enhancedBody.includes('Failed to load')) {
        throw new Error('Enhancement service unavailable');
      }

      // Replace the section in the content
      const updatedContent = replaceSection(content, header, enhancedBody);
      
      // Update the enhanced sections state for display
      setEnhancedSections(prev => ({ ...prev, [header]: enhancedBody }));
      
      // Call the markdown update function
      if (onMarkdownUpdate) {
        onMarkdownUpdate(updatedContent);
      }
      
      console.log('Enhancement successful for:', header);
      
    } catch (error) {
      console.error('Enhancement failed:', error);
      
      // More specific error messages
      let errorMessage = '⚠️ Enhancement failed. ';
      
      if (error.message.includes('404') || error.message.includes('unavailable')) {
        errorMessage += 'Service temporarily unavailable. Please try again later.';
      } else if (error.message.includes('No response') || error.message.includes('empty')) {
        errorMessage += 'No response from enhancement service. Please check your connection.';
      } else if (error.message.includes('not provided')) {
        errorMessage += 'Enhancement function not configured.';
      } else {
        errorMessage += 'Please try again later.';
      }
      
      setEnhancedSections(prev => ({ ...prev, [header]: errorMessage }));
    } finally {
      // Clear loading state
      setIsEnhancing(prev => ({ ...prev, [header]: false }));
    }
  };

  const toggleIconBar = (headerText) => {
    setExpandedHeader(prev => prev === headerText ? null : headerText);
  };

  const parseMarkdown = (text) => {
    if (!text) return [];
    
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
    const isLoading = isEnhancing[headerText];

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
              disabled={isLoading}
            >
              <Sparkles size={16} />
              <span>{isLoading ? 'Loading...' : 'Simplify'}</span>
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
              disabled={isLoading}
            >
              <Plus size={16} />
              <span>{isLoading ? 'Loading...' : 'Detail'}</span>
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
              disabled={isLoading}
            >
              <Minimize size={16} />
              <span>{isLoading ? 'Loading...' : 'Contract'}</span>
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
              disabled={isLoading}
            >
              <Brain size={16} />
              <span>{isLoading ? 'Loading...' : 'Reframe'}</span>
            </button>
          </div>
        )}

        {enhancedText && (
          <div className={styles.enhancedContent}>
            <div className={styles.enhancedHeader}>
              <Sparkles size={16} className={styles.toggleIcon} />
              <span className={styles.enhancedLabel}>AI Enhancement</span>
            </div>
            <div className={styles.enhancedText}>
              {enhancedText.startsWith('⚠️') ? (
                <p style={{ color: '#ff6b6b' }}>{enhancedText}</p>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: enhancedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
              )}
            </div>
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