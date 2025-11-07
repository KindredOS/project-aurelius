// Path: src/components/student/AdaptiveTextbook.jsx 
// Function: Production-ready adaptive textbook component with AI-powered section enhancement
// Version Update: Auditing file (9.18.25)

import React, { useState, useCallback, useEffect, useRef } from 'react';
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

// ✅ Thinking messages for friendly feedback
const thinkingMessages = [
  '🧠 Reworking that into something smoother...',
  '📖 Giving it a quick polish...',
  '✏️ Tightening up the explanation...',
  '💬 Making this sound like it makes sense...',
  '🔄 Cleaning up the wording...',
  '📝 Double-checking the important stuff...',
  '⏳ Almost done rewriting this part...'
];

// ✨ Typewriter Component for simulated streaming
const TypewriterText = ({ text, speed = 30, onComplete, className = '' }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef(null);
  const indexRef = useRef(0);

  useEffect(() => {
    if (!text) return;
    
    // Reset state when text changes
    setDisplayedText('');
    setIsComplete(false);
    indexRef.current = 0;

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Start typewriter effect
    intervalRef.current = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayedText(text.slice(0, indexRef.current + 1));
        indexRef.current++;
      } else {
        setIsComplete(true);
        clearInterval(intervalRef.current);
        if (onComplete) onComplete();
      }
    }, speed);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [text, speed, onComplete]);

  return (
    <span className={`${className} ${!isComplete ? styles.typewriting : ''}`}>
      {displayedText}
      {!isComplete && <span className={styles.cursor}>|</span>}
    </span>
  );
};

const AdaptiveTextbook = ({ content, onContentSave, subject = 'science', userMBTI }) => {
  const [enhancedSections, setEnhancedSections] = useState({});
  const [expandedHeader, setExpandedHeader] = useState(null);
  const [collapsedHeaders, setCollapsedHeaders] = useState({});
  const [promptToggles, setPromptToggles] = useState({});
  const [interactiveToggles, setInteractiveToggles] = useState({});
  const [isEnhancing, setIsEnhancing] = useState({});
  const [currentContent, setCurrentContent] = useState(content);
  const [forceRenderCounter, setForceRenderCounter] = useState(0);
  
  // ✅ Animation states
  const [recentlyEnhancedHeader, setRecentlyEnhancedHeader] = useState(null);
  const [thinkingMessageIndex, setThinkingMessageIndex] = useState(0);
  
  // ✨ NEW: Typewriter states
  const [typewriterSections, setTypewriterSections] = useState({});
  const [completedTypewriters, setCompletedTypewriters] = useState({});

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
  const getEffectiveContent = useCallback(() => {
    let effectiveContent = currentContent;
    
    // Apply all valid enhancements to the content before parsing
    Object.entries(enhancedSections).forEach(([header, enhancedBody]) => {
      if (enhancedBody && !enhancedBody.includes('⚠️')) {
        // Use typewriter content if available and not completed, otherwise use full content
        const shouldUseTypewriter = typewriterSections[header] && !completedTypewriters[header];
        const contentToUse = shouldUseTypewriter ? typewriterSections[header] : enhancedBody;
        effectiveContent = replaceSection(effectiveContent, header, contentToUse);
      }
    });
    
    return effectiveContent;
  }, [currentContent, enhancedSections, typewriterSections, completedTypewriters]);

  // ✨ NEW: Handle typewriter completion
  const handleTypewriterComplete = useCallback((header) => {
    setCompletedTypewriters(prev => ({ ...prev, [header]: true }));
    
    // Update the actual content after typewriter completes
    const finalContent = enhancedSections[header];
    if (finalContent) {
      const updatedContent = replaceSection(currentContent, header, finalContent);
      setCurrentContent(updatedContent);
      
      if (onContentSave) {
        onContentSave(updatedContent);
      }
    }
    
    // Clear typewriter content
    setTypewriterSections(prev => {
      const newSections = { ...prev };
      delete newSections[header];
      return newSections;
    });
    
    setForceRenderCounter(prev => prev + 1);
  }, [enhancedSections, currentContent, onContentSave]);

  const handleEnhancement = async (header, action) => {
    // Prevent duplicate enhancement requests for the same header
    if (isEnhancing[header]) {
      return;
    }

    setIsEnhancing(prev => ({ ...prev, [header]: true }));

    // ✅ Add message cycling logic
    let messageTimer = setInterval(() => {
      setThinkingMessageIndex(prev => (prev + 1) % thinkingMessages.length);
    }, 6000);

    try {
      // Use current effective content to get the most up-to-date section
      const effectiveContent = getEffectiveContent();
      const sectionBody = extractSectionUnderHeader(effectiveContent, header, true);

      if (!sectionBody || sectionBody.trim().length === 0) {
        throw new Error('No content found under header');
      }

      // Extract special elements before AI processing to preserve educational features
      const specialElements = extractSpecialElements(sectionBody);
      const cleanedSectionBody = removeSpecialElements(sectionBody);

      // Build AI enhancement prompt with cleaned content
      const prompt = buildPromptWrap({ 
        header, 
        paragraph: cleanedSectionBody,
        action, 
        userMBTI
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

      // Clean up common AI response artifacts
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

      // Restore special elements to preserve educational functionality
      enhancedBody = restoreSpecialElements(enhancedBody, specialElements, sectionBody);

      // ✨ NEW: Store the final enhanced content but don't update UI immediately
      setEnhancedSections(prev => ({ ...prev, [header]: enhancedBody }));

      // ✨ NEW: Initialize typewriter with empty content
      setTypewriterSections(prev => ({ ...prev, [header]: '' }));
      setCompletedTypewriters(prev => ({ ...prev, [header]: false }));

      // ✅ Add animation trigger after enhancement starts
      setRecentlyEnhancedHeader(header);
      setTimeout(() => {
        setRecentlyEnhancedHeader(null);
      }, 1000);

      // Force re-render to show typewriter starting
      setForceRenderCounter(prev => prev + 1);

      // ✨ NEW: Start typewriter effect after a brief delay
      setTimeout(() => {
        setTypewriterSections(prev => ({ ...prev, [header]: enhancedBody }));
      }, 200);

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
      // ✅ Clear timer and reset enhancing state
      clearInterval(messageTimer);
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

  // Helper function to find the current header context for an element
  const findCurrentHeader = (elements, currentIndex) => {
    // Look backwards for the most recent header
    for (let i = currentIndex - 1; i >= 0; i--) {
      if (elements[i].type === 'header') {
        return elements[i].content;
      }
    }
    return null;
  };

  const renderElement = (element, index, allElements, sectionHeader = null) => {
    const elementKey = `${element.type}-${element.lineIndex}-${forceRenderCounter}`;
    
    // 🔧 FIX: Properly determine the current header context
    const currentHeader = element.type === 'header' 
      ? element.content 
      : (findCurrentHeader(allElements, index) || sectionHeader);
    
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
        // ✅ FIXED: Proper thinking messages and animations with correct header context
        const htmlContent = convertMarkdownBold(element.content);
        
        // Show thinking message while enhancing
        if (isEnhancing[currentHeader]) {
          return (
            <p key={elementKey} className={`${styles.paragraph} ${styles.thinkingMessage}`}>
              {thinkingMessages[thinkingMessageIndex]}
            </p>
          );
        }
        
        // ✨ NEW: Show typewriter effect for enhanced content
        if (typewriterSections[currentHeader] && !completedTypewriters[currentHeader]) {
          return (
            <p key={elementKey} className={`${styles.paragraph} ${styles.typewriterParagraph}`}>
              <TypewriterText 
                text={htmlContent}
                speed={25}
                onComplete={() => handleTypewriterComplete(currentHeader)}
                className={styles.typewriterContent}
              />
            </p>
          );
        }
        
        // Regular paragraph rendering
        return (
          <p
            key={elementKey}
            className={`${styles.paragraph} ${
              currentHeader === recentlyEnhancedHeader ? styles.enhancedReveal : ''
            }`}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
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
          <div 
            key={`section-${sectionIndex}-${forceRenderCounter}`}
            className={`${styles.contentSection} ${
              section.header === recentlyEnhancedHeader ? styles.sectionAnimatedReveal : ''
            }`}
          >
            {section.elements.map((element, elementIndex) => {
              if (element.type === 'header') {
                const renderedHeader = renderElement(element, elementIndex, section.elements, section.header);
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
              
              // 🔧 FIX: Pass all elements and section header for proper context
              return renderElement(element, elementIndex, section.elements, section.header);
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