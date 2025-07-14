// 3. AdaptiveTextbook.jsx - Self-contained content engine with AI
import React, { useState } from 'react';
import { Sparkles, Plus, Minimize, Brain, ChevronDown, ChevronRight } from 'lucide-react';
import styles from './AdaptiveTextbook.module.css';
import { 
  extractPromptWrap, 
  containsInteractiveElement,
  extractSectionUnderHeader,
  replaceSection,
  parseMarkdownElements,
  convertMarkdownBold
} from '../../utils/markdownStructure';
import { generateAISection } from '../../utils/genAIContent';
import { polishMarkdown } from '../../utils/polishMarkdown';
import { buildPromptWrap } from '../../utils/aiPromptTools';

const AdaptiveTextbook = ({ content, onContentSave }) => {
  const [localContent, setLocalContent] = useState(content);
  const [enhancedSections, setEnhancedSections] = useState({});
  const [expandedHeader, setExpandedHeader] = useState(null);
  const [promptToggles, setPromptToggles] = useState({});
  const [interactiveToggles, setInteractiveToggles] = useState({});
  const [isEnhancing, setIsEnhancing] = useState({});

  // Update local content when prop changes
  React.useEffect(() => {
    setLocalContent(content);
  }, [content]);

  const togglePrompt = (key) => {
    setPromptToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleInteractive = (key) => {
    setInteractiveToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Self-contained AI enhancement logic
  const handleEnhancement = async (header, action) => {
    console.log('Enhancement triggered:', header, action);

    setIsEnhancing(prev => ({ ...prev, [header]: true }));

    try {
      const sectionBody = extractSectionUnderHeader(localContent, header);
      const prompt = buildPromptWrap({ header, paragraph: sectionBody, action });

      // Generate AI content
      const rawAI = await generateAISection(prompt, 'hermes', 750);

      // Polish the response
      const enhancedBody = await polishMarkdown({
        text: rawAI,
        action,
        personality: 'default',
        model_key: 'hermes'
      });

      // Validate response
      if (!enhancedBody || typeof enhancedBody !== 'string' || enhancedBody.trim().length === 0) {
        throw new Error('Invalid enhancement response');
      }

      if (enhancedBody.includes('404') || enhancedBody.includes('Failed to load')) {
        throw new Error('Enhancement service unavailable');
      }

      // Update local content
      const updatedContent = replaceSection(localContent, header, enhancedBody);
      setLocalContent(updatedContent);

      // Update enhanced sections for display
      setEnhancedSections(prev => ({ ...prev, [header]: enhancedBody }));

      // Save to backend
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

    elements.forEach((element, index) => {
      switch (element.type) {
        case 'prompt':
          renderedElements.push(
            <div key={`prompt-${element.lineIndex}`} className={styles.promptBox}>
              <button
                className={styles.promptToggle}
                onClick={() => togglePrompt(element.lineIndex)}
              >
                {promptToggles[element.lineIndex] ? <ChevronDown size={16} /> : <ChevronRight size={16} />} <strong>Prompt</strong>
              </button>
              {promptToggles[element.lineIndex] && (
                <div className={styles.promptContent}>{element.content}</div>
              )}
            </div>
          );
          break;

        case 'header':
          renderedElements.push(renderHeader(element.content, element.level, element.lineIndex));
          break;

        case 'interactive':
          renderedElements.push(
            <div key={`interactive-${element.lineIndex}`} className={styles.interactiveBox}>
              <button
                className={styles.interactiveToggle}
                onClick={() => toggleInteractive(element.lineIndex)}
              >
                {interactiveToggles[element.lineIndex] ? <ChevronDown size={16} /> : <ChevronRight size={16} />} <strong>Interactive Module</strong>
              </button>
              {interactiveToggles[element.lineIndex] && (
                <div className={styles.interactiveContent}><em>Content coming soon...</em></div>
              )}
            </div>
          );
          break;

        case 'paragraph':
          const htmlContent = convertMarkdownBold(element.content);
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
                <div dangerouslySetInnerHTML={{ __html: convertMarkdownBold(enhancedText) }} />
              )}
            </div>
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
