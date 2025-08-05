// Path: src/components/student/AdaptiveTextbook.jsx 
// Focus: Production-ready adaptive textbook component with AI-powered section enhancement
// Version Update: Removed debugging logic while preserving knowledge comments for maintainability

import React, { useState, useCallback } from 'react';
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

const AdaptiveTextbook = ({ content, onContentSave, subject = 'science' }) => {
  const [enhancedSections, setEnhancedSections] = useState({});
  const [expandedHeader, setExpandedHeader] = useState(null);
  const [collapsedHeaders, setCollapsedHeaders] = useState({});
  const [promptToggles, setPromptToggles] = useState({});
  const [interactiveToggles, setInteractiveToggles] = useState({});
  const [isEnhancing, setIsEnhancing] = useState({});
  const [currentContent, setCurrentContent] = useState(content);
  const [forceRenderCounter, setForceRenderCounter] = useState(0);

  // Sync with parent content changes to maintain consistency across re-renders
  React.useEffect(() => {
    if (content !== currentContent) {
      setCurrentContent(content);
      setForceRenderCounter(prev => prev + 1);
    }
  }, [content, currentContent]);

  const togglePrompt = (key) => {
    setPromptToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleInteractive = (key) => {
    setInteractiveToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleHeaderCollapse = (headerText) => {
    setCollapsedHeaders(prev => ({ ...prev, [headerText]: !prev[headerText] }));
  };

  // Memoized function to get the effective content for rendering
  // Applies all successful enhancements to the base content before parsing
  const getEffectiveContent = useCallback(() => {
    let effectiveContent = currentContent;
    
    // Apply all valid enhancements to the content before parsing
    Object.entries(enhancedSections).forEach(([header, enhancedBody]) => {
      if (enhancedBody && !enhancedBody.includes('⚠️')) {
        effectiveContent = replaceSection(effectiveContent, header, enhancedBody);
      }
    });
    
    return effectiveContent;
  }, [currentContent, enhancedSections]);

  const handleEnhancement = async (header, action) => {
    // Prevent duplicate enhancement requests for the same header
    if (isEnhancing[header]) {
      return;
    }

    setIsEnhancing(prev => ({ ...prev, [header]: true }));

    try {
      // Use current effective content to get the most up-to-date section
      const effectiveContent = getEffectiveContent();
      const sectionBody = extractSectionUnderHeader(effectiveContent, header);

      if (!sectionBody || sectionBody.trim().length === 0) {
        throw new Error('No content found under header');
      }

      // Build AI enhancement prompt with context
      const prompt = buildPromptWrap({ 
        header, 
        paragraph: sectionBody,
        action 
      });

      const rawAI = await generateAISection(prompt, subject, 'hermes', 750);

      let enhancedBody = await polishMarkdown({
        text: rawAI,
        action
      });

      // Extract final output if wrapped in AI response format
      const match = enhancedBody.match(/FINAL OUTPUT[^\n]*\n---\n([^]*)$/);
      if (match && match[1]) {
        enhancedBody = match[1].trim();
      }

      // Apply existing cleanup utilities
      enhancedBody = cleanUpResponse(enhancedBody);

      // Remove duplicate header if AI accidentally included it
      const headerPattern = new RegExp(`^##\\s+${header}\\s*\\n+`, 'i');
      enhancedBody = enhancedBody.replace(headerPattern, '').trim();

      // Validation to ensure we have usable content
      if (!enhancedBody || typeof enhancedBody !== 'string' || enhancedBody.trim().length === 0) {
        throw new Error('Invalid enhancement response');
      }

      if (enhancedBody.includes('404') || enhancedBody.includes('Failed to load')) {
        throw new Error('Enhancement service unavailable');
      }

      // Clean up common AI response artifacts that aren't useful for students
      if (enhancedBody.toLowerCase().includes('i cannot') || 
          enhancedBody.toLowerCase().includes('i apologize') ||
          enhancedBody.toLowerCase().includes('as an ai')) {
        const lines = enhancedBody.split('\n');
        const cleanLines = lines.filter(line => 
          !line.toLowerCase().includes('i cannot') &&
          !line.toLowerCase().includes('i apologize') &&
          !line.toLowerCase().includes('as an ai') &&
          line.trim().length > 0
        );
        enhancedBody = cleanLines.join('\n').trim();
        
        if (enhancedBody.length === 0) {
          throw new Error('No usable content after cleaning AI refusal patterns');
        }
      }

      // Update enhanced sections state first for immediate UI feedback
      setEnhancedSections(prev => ({ ...prev, [header]: enhancedBody }));

      // Force re-render to show changes immediately
      setForceRenderCounter(prev => prev + 1);

      // Update the actual content and persist changes
      const updatedContent = replaceSection(currentContent, header, enhancedBody);
      setCurrentContent(updatedContent);

      if (onContentSave) {
        await onContentSave(updatedContent);
      }

    } catch (error) {
      // Reset expanded state briefly to allow re-clicking on errors
      const currentExpanded = expandedHeader;
      setExpandedHeader(null);
      setTimeout(() => {
        if (currentExpanded === header) {
          setExpandedHeader(header);
        }
      }, 50);

      // Provide user-friendly error messages based on error type
      let errorMessage = '⚠️ Enhancement failed. ';
      if (error.message.includes('404') || error.message.includes('unavailable')) {
        errorMessage += 'Service temporarily unavailable. Please try again later.';
      } else if (error.message.includes('No response') || error.message.includes('empty')) {
        errorMessage += 'No response from enhancement service. Please check your connection.';
      } else if (error.message.includes('Invalid enhancement') || error.message.includes('No usable content')) {
        errorMessage += 'Invalid response received. Please try again.';
      } else if (error.message.includes('No content found')) {
        errorMessage += 'No content found under this header.';
      } else {
        errorMessage += 'Please try again later.';
      }

      setEnhancedSections(prev => ({ ...prev, [header]: errorMessage }));
      setForceRenderCounter(prev => prev + 1);
    } finally {
      setIsEnhancing(prev => ({ ...prev, [header]: false }));
    }
  };

  // Handle Learning Lens toggle for showing/hiding enhancement options
  const handleLearningLensClick = (headerText) => {
    if (expandedHeader === headerText) {
      setExpandedHeader(null);
    } else {
      setExpandedHeader(headerText);
    }
  };

  // Group content into logical sections based on h1 headers for better organization
  const groupContentIntoSections = (elements) => {
    const sections = [];
    let currentSection = null;

    elements.forEach((element) => {
      if (element.type === 'header' && element.level === 1) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          header: element.content,
          elements: [element]
        };
      } else if (currentSection) {
        currentSection.elements.push(element);
      } else {
        // Handle content before first h1 header
        if (sections.length === 0) {
          currentSection = {
            header: 'Introduction',
            elements: [element]
          };
        }
      }
    });

    if (currentSection) {
      sections.push(currentSection);
    }

    return sections;
  };

  const parseMarkdown = (text) => {
    if (!text) return [];
    const elements = parseMarkdownElements(text);
    return elements;
  };

  const renderElement = (element, index, currentHeader) => {
    const elementKey = `${element.type}-${element.lineIndex}-${forceRenderCounter}`;
    
    switch (element.type) {
      case 'header':
        return renderHeader(element.content, element.level, element.lineIndex);

      case 'prompt':
        return (
          <div key={elementKey} className={styles.promptBox}>
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

      case 'interactive':
        return (
          <div key={elementKey} className={styles.interactiveBox}>
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

      case 'paragraph':
        const htmlContent = convertMarkdownBold(element.content);
        return (
          <p key={elementKey} className={styles.paragraph} dangerouslySetInnerHTML={{ __html: htmlContent }} />
        );

      default:
        return null;
    }
  };

  const renderHeader = (headerText, level, lineIndex) => {
    const isExpanded = expandedHeader === headerText;
    const isCollapsed = collapsedHeaders[headerText];
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
      <div key={`header-${headerText}-${forceRenderCounter}`} className={styles.headerBlock}>
        <div className={styles.headerRow}>
          <div className={styles.headerLeft}>
            <button
              onClick={() => toggleHeaderCollapse(headerText)}
              className={styles.collapseToggle}
              title={isCollapsed ? "Expand section" : "Collapse section"}
              type="button"
            >
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
            </button>
            
            <div className={headerClasses[level]}>
              {headerText}
            </div>
          </div>

          <button
            onClick={() => handleLearningLensClick(headerText)}
            className={`${styles.toggleButton} ${isExpanded ? styles.active : ''}`}
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
                  onClick={() => handleEnhancement(headerText, button.action)}
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

  if (!currentContent) {
    return <div className={styles.noContent}>No content available</div>;
  }

  const contentToRender = getEffectiveContent();
  const elements = parseMarkdown(contentToRender);
  const sections = groupContentIntoSections(elements);

  return (
    <div className={styles.container}>
      <div className={styles.sideScrollContainer}>
        {sections.map((section, sectionIndex) => (
          <div key={`section-${sectionIndex}-${forceRenderCounter}`} className={styles.contentSection}>
            {section.elements.map((element, elementIndex) => {
              if (element.type === 'header') {
                const renderedHeader = renderElement(element, elementIndex);
                const isCollapsed = collapsedHeaders[element.content];
                
                // Show only header when collapsed (for h1 and h2 headers)
                if (isCollapsed && element.level <= 2) {
                  return (
                    <div key={`collapsed-${elementIndex}`}>
                      {renderedHeader}
                    </div>
                  );
                }
                
                return renderedHeader;
              }
              
              // Hide content under collapsed headers
              const parentHeader = findParentHeader(section.elements, elementIndex);
              if (parentHeader && collapsedHeaders[parentHeader]) {
                return null;
              }
              
              return renderElement(element, elementIndex);
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper function to find the parent header for an element (used for collapse functionality)
const findParentHeader = (elements, currentIndex) => {
  for (let i = currentIndex - 1; i >= 0; i--) {
    if (elements[i].type === 'header' && elements[i].level <= 2) {
      return elements[i].content;
    }
  }
  return null;
};

export default AdaptiveTextbook;