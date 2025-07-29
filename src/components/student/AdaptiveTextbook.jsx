// AdaptiveTextbook.jsx - Enhanced with Collapsible Headers and Side Scroll
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

/**
 * Enhanced cleanup function specifically for removing AI metadata brackets
 * This addresses the [Mathematical Inquiry: Detailed] type artifacts
 */
const removeAIMetadataBrackets = (text) => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  let cleaned = text;

  console.log('[BRACKET_CLEANUP] Starting bracket removal...');
  console.log('[BRACKET_CLEANUP] Input preview:', text.substring(0, 200));

  // Remove AI metadata patterns like [Mathematical Inquiry: Detailed], [Analysis: Complete], etc.
  cleaned = cleaned.replace(/\[[A-Za-z\s]*:\s*[A-Za-z\s]*\]/g, '');
  
  // Remove standalone bracket words like [Summary], [Analysis], [Overview], etc.
  cleaned = cleaned.replace(/\[[A-Za-z\s]+\]/g, '');
  
  // Remove brackets with numbers like [1], [2] at line ends (citations)
  cleaned = cleaned.replace(/\[\d+\]\s*$/gm, '');
  
  // Remove empty bracket lines
  cleaned = cleaned.replace(/^\s*\[\s*\]\s*$/gm, '');
  
  // Remove lines that are just brackets with content
  cleaned = cleaned.replace(/^\s*\[[^\]]+\]\s*$/gm, '');
  
  // Remove any remaining isolated brackets at start of lines
  cleaned = cleaned.replace(/^\[[^\]]*\]\s*/gm, '');
  
  // Clean up multiple consecutive newlines that may result from bracket removal
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  
  // Remove empty lines at the start
  cleaned = cleaned.replace(/^\s*\n+/, '');
  
  // Trim whitespace but preserve internal structure
  cleaned = cleaned.trim();

  console.log('[BRACKET_CLEANUP] After cleanup preview:', cleaned.substring(0, 200));
  console.log('[BRACKET_CLEANUP] Removed', text.length - cleaned.length, 'characters');

  return cleaned;
};

const AdaptiveTextbook = ({ content, onContentSave, subject = 'science' }) => {
  const [enhancedSections, setEnhancedSections] = useState({});
  const [expandedHeader, setExpandedHeader] = useState(null);
  const [collapsedHeaders, setCollapsedHeaders] = useState({}); // New state for collapsed headers
  const [promptToggles, setPromptToggles] = useState({});
  const [interactiveToggles, setInteractiveToggles] = useState({});
  const [isEnhancing, setIsEnhancing] = useState({});
  const [currentContent, setCurrentContent] = useState(content);
  const [forceRenderCounter, setForceRenderCounter] = useState(0);

  // Sync with parent content changes
  React.useEffect(() => {
    if (content !== currentContent) {
      console.log('Content prop changed, syncing internal state');
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

  // New function to toggle header collapse
  const toggleHeaderCollapse = (headerText) => {
    setCollapsedHeaders(prev => ({ ...prev, [headerText]: !prev[headerText] }));
  };

  // Memoized function to get the effective content for rendering
  const getEffectiveContent = useCallback(() => {
    console.log('=== GETTING EFFECTIVE CONTENT ===');
    console.log('Current content length:', currentContent?.length || 0);
    console.log('Enhanced sections:', Object.keys(enhancedSections));
    
    let effectiveContent = currentContent;
    
    // Apply all enhancements to the content before parsing
    Object.entries(enhancedSections).forEach(([header, enhancedBody]) => {
      if (enhancedBody && !enhancedBody.includes('⚠️')) {
        console.log(`Applying enhancement for header: ${header}`);
        effectiveContent = replaceSection(effectiveContent, header, enhancedBody);
      }
    });
    
    console.log('Final effective content length:', effectiveContent?.length || 0);
    return effectiveContent;
  }, [currentContent, enhancedSections, forceRenderCounter]);

  const handleEnhancement = async (header, action) => {
    if (enhancedSections[header] && !enhancedSections[header].includes('⚠️')) {
      console.log(`Skipping enhancement for "${header}" — already enhanced.`);
      return;
    }

    console.log('Enhancement triggered:', header, action);
    setIsEnhancing(prev => ({ ...prev, [header]: true }));

    try {
      const sectionBody = extractSectionUnderHeader(currentContent, header);

      if (!sectionBody || sectionBody.trim().length === 0) {
        throw new Error('No content found under header');
      }

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

      // Extract final output if wrapped
      const match = enhancedBody.match(/FINAL OUTPUT[^\n]*\n---\n([\s\S]*)$/);
      if (match && match[1]) {
        enhancedBody = match[1].trim();
      }

      // CRITICAL FIX: Enhanced bracket cleanup - this removes the [Mathematical Inquiry: Detailed] artifacts
      console.log('[ENHANCEMENT] Before bracket cleanup:', enhancedBody.substring(0, 200));
      enhancedBody = removeAIMetadataBrackets(enhancedBody);
      console.log('[ENHANCEMENT] After bracket cleanup:', enhancedBody.substring(0, 200));

      // Apply existing cleanup
      enhancedBody = cleanUpResponse(enhancedBody);

      // Remove header if it was accidentally included
      const headerPattern = new RegExp(`^##\s+${header}\s*\n+`, 'i');
      enhancedBody = enhancedBody.replace(headerPattern, '').trim();

      // Final validation and cleanup
      if (!enhancedBody || typeof enhancedBody !== 'string' || enhancedBody.trim().length === 0) {
        throw new Error('Invalid enhancement response');
      }

      if (enhancedBody.includes('404') || enhancedBody.includes('Failed to load')) {
        throw new Error('Enhancement service unavailable');
      }

      // Additional safety check for common AI response artifacts
      if (enhancedBody.toLowerCase().includes('i cannot') || 
          enhancedBody.toLowerCase().includes('i apologize') ||
          enhancedBody.toLowerCase().includes('as an ai')) {
        console.warn('[ENHANCEMENT] AI response contains refusal patterns, cleaning...');
        // Try to extract useful content after common refusal patterns
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

      console.log('=== ENHANCEMENT SUCCESSFUL ===');
      console.log('Enhanced body (final):', enhancedBody.substring(0, 200) + '...');

      // Update enhanced sections first
      setEnhancedSections(prev => {
        const updated = { ...prev, [header]: enhancedBody };
        console.log('Updated enhanced sections:', Object.keys(updated));
        return updated;
      });

      // Force a re-render by incrementing the counter
      setForceRenderCounter(prev => {
        const newValue = prev + 1;
        console.log('Force render counter updated to:', newValue);
        return newValue;
      });

      // Update the actual content and save
      const updatedContent = replaceSection(currentContent, header, enhancedBody);
      setCurrentContent(updatedContent);

      if (onContentSave) {
        console.log('Saving updated content...');
        await onContentSave(updatedContent);
      }

      console.log('Enhancement and save completed successfully');
    } catch (error) {
      console.error('Enhancement failed:', error);

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

  const toggleIconBar = (headerText) => {
    setExpandedHeader(prev => prev === headerText ? null : headerText);
  };

  // Group content into sections based on h1 headers
  const groupContentIntoSections = (elements) => {
    const sections = [];
    let currentSection = null;

    elements.forEach((element) => {
      if (element.type === 'header' && element.level === 1) {
        // Start a new section
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          header: element.content,
          elements: [element]
        };
      } else if (currentSection) {
        // Add to current section
        currentSection.elements.push(element);
      } else {
        // Content before first h1 - create a default section
        if (sections.length === 0) {
          currentSection = {
            header: 'Introduction',
            elements: [element]
          };
        }
      }
    });

    // Don't forget the last section
    if (currentSection) {
      sections.push(currentSection);
    }

    return sections;
  };

  const parseMarkdown = (text) => {
    console.log('=== PARSING MARKDOWN ===');
    console.log('Input text length:', text?.length || 0);
    console.log('Force render counter:', forceRenderCounter);
    
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
        // Apply additional bracket cleanup to paragraph content before rendering
        let paragraphContent = element.content;
        paragraphContent = removeAIMetadataBrackets(paragraphContent);
        
        const htmlContent = convertMarkdownBold(paragraphContent);
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
      <div key={`header-${lineIndex}-${headerText}-${forceRenderCounter}`} className={styles.headerBlock}>
        <div className={styles.headerRow}>
          <div className={styles.headerLeft}>
            {/* Collapse toggle button */}
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

  if (!currentContent) {
    return <div className={styles.noContent}>No content available</div>;
  }

  // Use the effective content that has all enhancements applied
  const contentToRender = getEffectiveContent();
  const elements = parseMarkdown(contentToRender);
  const sections = groupContentIntoSections(elements);

  return (
    <div className={styles.container}>
      <div className={styles.sideScrollContainer}>
        {sections.map((section, sectionIndex) => (
          <div key={`section-${sectionIndex}-${forceRenderCounter}`} className={styles.contentSection}>
            {section.elements.map((element, elementIndex) => {
              // For headers, check if they should be collapsed
              if (element.type === 'header') {
                const renderedHeader = renderElement(element, elementIndex);
                const isCollapsed = collapsedHeaders[element.content];
                
                // If this is a collapsed header, only show the header itself
                if (isCollapsed && element.level <= 2) {
                  return (
                    <div key={`collapsed-${elementIndex}`}>
                      {renderedHeader}
                    </div>
                  );
                }
                
                return renderedHeader;
              }
              
              // For non-header elements, check if they should be hidden due to collapsed parent
              const parentHeader = findParentHeader(section.elements, elementIndex);
              if (parentHeader && collapsedHeaders[parentHeader]) {
                return null; // Hide content under collapsed headers
              }
              
              return renderElement(element, elementIndex);
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper function to find the parent header for an element
const findParentHeader = (elements, currentIndex) => {
  for (let i = currentIndex - 1; i >= 0; i--) {
    if (elements[i].type === 'header' && elements[i].level <= 2) {
      return elements[i].content;
    }
  }
  return null;
};

export default AdaptiveTextbook;