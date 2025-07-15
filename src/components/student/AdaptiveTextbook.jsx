// AdaptiveTextbook.jsx - Now using modular utilities
import React, { useState } from 'react';
import { Sparkles, Plus, Minimize, Brain, ChevronDown, ChevronRight } from 'lucide-react';
import styles from './AdaptiveTextbook.module.css';

import { 
  extractSpecialElements, 
  restoreSpecialElements, 
  removeSpecialElements 
} from '../../utils/specialElements';

import { 
  extractSectionUnderHeader, 
  replaceSection 
} from '../../utils/contentProcessing';

import { 
  parseMarkdownElements, 
  convertMarkdownBold, 
  getEnhancementButtons 
} from '../../utils/markdownParsing';

import { generateAISection } from '../../utils/genAIContent';
import { polishMarkdown } from '../../utils/polishMarkdown';
import { buildPromptWrap } from '../../utils/aiPromptTools';
import { cleanUpResponse } from '../../utils/cleanUp';

const AdaptiveTextbook = ({ content, onContentSave }) => {
  const [localContent, setLocalContent] = useState(content);
  const [enhancedSections, setEnhancedSections] = useState({});
  const [expandedHeader, setExpandedHeader] = useState(null);
  const [promptToggles, setPromptToggles] = useState({});
  const [interactiveToggles, setInteractiveToggles] = useState({});
  const [isEnhancing, setIsEnhancing] = useState({});

  React.useEffect(() => {
    setLocalContent(content);
  }, [content]);

  const togglePrompt = (key) => {
    setPromptToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleInteractive = (key) => {
    setInteractiveToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleEnhancement = async (header, action) => {
    if (enhancedSections[header]) {
      console.log(`Skipping enhancement for "${header}" — already enhanced.`);
      return;
    }

    console.log('Enhancement triggered:', header, action);
    setIsEnhancing(prev => ({ ...prev, [header]: true }));

    try {
      const sectionBody = extractSectionUnderHeader(localContent, header);

      if (!sectionBody || sectionBody.trim().length === 0) {
        throw new Error('No content found under header');
      }

      const cleanedSectionBody = sectionBody;

      if (!cleanedSectionBody || cleanedSectionBody.trim().length === 0) {
        console.log('No enhanceable content found, preserving original section');
        return;
      }

      const prompt = buildPromptWrap({ 
        header, 
        paragraph: cleanedSectionBody,
        action 
      });

      const rawAI = await generateAISection(prompt, 'hermes', 750);

      let enhancedBody = await polishMarkdown({
        text: rawAI,
        action,
        personality: 'default',
        model_key: 'hermes'
      });

      const match = enhancedBody.match(/FINAL OUTPUT[^\n]*\n---\n([\s\S]*)$/);
      if (match && match[1]) {
        enhancedBody = match[1].trim();
      }

      enhancedBody = cleanUpResponse(enhancedBody);

      const headerPattern = new RegExp(`^##\s+${header}\s*\n+`, 'i');
      enhancedBody = enhancedBody.replace(headerPattern, '').trim();

      if (!enhancedBody || typeof enhancedBody !== 'string' || enhancedBody.trim().length === 0) {
        throw new Error('Invalid enhancement response');
      }

      if (enhancedBody.includes('404') || enhancedBody.includes('Failed to load')) {
        throw new Error('Enhancement service unavailable');
      }

      const updatedContent = replaceSection(localContent, header, enhancedBody);
      setLocalContent(updatedContent);
      setEnhancedSections(prev => ({ ...prev, [header]: enhancedBody }));

      if (onContentSave) {
        await onContentSave(updatedContent);
      }

      console.log('Enhancement successful for:', header);
    } catch (error) {
      console.error('Enhancement failed:', error);

      let errorMessage = '⚠️ Enhancement failed. ';
      if (error.message.includes('404') || error.message.includes('unavailable')) {
        errorMessage += 'Service temporarily unavailable. Please try again later.';
      } else if (error.message.includes('No response') || error.message.includes('empty')) {
        errorMessage += 'No response from enhancement service. Please check your connection.';
      } else if (error.message.includes('Invalid enhancement')) {
        errorMessage += 'Invalid response received. Please try again.';
      } else if (error.message.includes('No content found')) {
        errorMessage += 'No content found under this header.';
      } else {
        errorMessage += 'Please try again later.';
      }

      setEnhancedSections(prev => ({ ...prev, [header]: errorMessage }));
    } finally {
      setIsEnhancing(prev => ({ ...prev, [header]: false }));
    }
  };

  const toggleIconBar = (headerText) => {
    setExpandedHeader(prev => prev === headerText ? null : headerText);
  };

  const parseMarkdown = (text) => {
    const elements = parseMarkdownElements(text);
    const renderedElements = [];
    let currentHeader = null;

    elements.forEach((element, index) => {
      switch (element.type) {
        case 'header':
          currentHeader = element.content;
          renderedElements.push(renderHeader(currentHeader, element.level, element.lineIndex));
          break;

        case 'prompt':
          renderedElements.push(
            <div key={`prompt-${element.lineIndex}`} className={styles.promptBox}>
              <button
                className={styles.promptToggle}
                onClick={() => togglePrompt(element.lineIndex)}
              >
                {promptToggles[element.lineIndex] ? <ChevronDown size={16} /> : <ChevronRight size={16} />} 
                <strong>Prompt</strong>
              </button>
              {promptToggles[element.lineIndex] && (
                <div className={styles.promptContent}>{element.content}</div>
              )}
            </div>
          );
          break;

        case 'interactive':
          renderedElements.push(
            <div key={`interactive-${element.lineIndex}`} className={styles.interactiveBox}>
              <button
                className={styles.interactiveToggle}
                onClick={() => toggleInteractive(element.lineIndex)}
              >
                {interactiveToggles[element.lineIndex] ? <ChevronDown size={16} /> : <ChevronRight size={16} />} 
                <strong>Interactive Module</strong>
              </button>
              {interactiveToggles[element.lineIndex] && (
                <div className={styles.interactiveContent}><em>Content coming soon...</em></div>
              )}
            </div>
          );
          break;

        case 'paragraph':
          const normalizedHeader = currentHeader?.trim().toLowerCase();
          const enhancedKey = Object.keys(enhancedSections).find(
            key => key.trim().toLowerCase() === normalizedHeader
          );
          const effectiveContent = (enhancedKey && enhancedSections[enhancedKey]) || element.content;
          const htmlContent = convertMarkdownBold(effectiveContent);
          renderedElements.push(
            <p key={element.lineIndex} className={styles.paragraph} dangerouslySetInnerHTML={{ __html: htmlContent }} />
          );
          break;

        default:
          break;
      }
    });

    return renderedElements;
  };

  const renderHeader = (headerText, level, lineIndex) => {
    const isExpanded = expandedHeader === headerText;
    const isLoading = isEnhancing[headerText];
    const enhancementButtons = getEnhancementButtons();

    const headerClasses = {
      1: styles.heading1,
      2: styles.heading2,
      3: styles.heading3,
      4: styles.heading4
    };

    const iconMap = {
      Sparkles,
      Plus,
      Minimize,
      Brain
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
            {enhancementButtons.map((button) => {
              const IconComponent = iconMap[button.icon];
              return (
                <button
                  key={button.action}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleEnhancement(headerText, button.action);
                  }}
                  className={`${styles.enhanceButton} ${styles[button.className]}`}
                  title={button.title}
                  type="button"
                  disabled={isLoading}
                >
                  <IconComponent size={16} />
                  <span>{isLoading ? 'Loading...' : button.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  if (!localContent) {
    return <div className={styles.noContent}>No content available</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {parseMarkdown(localContent)}
      </div>
    </div>
  );
};

export default AdaptiveTextbook;