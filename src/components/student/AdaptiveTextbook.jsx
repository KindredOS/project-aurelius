// AdaptiveTextbook.jsx - Rebuilt to POST raw AI response directly, bypassing all utils
import React, { useState, useEffect } from 'react';

const AdaptiveTextbook = ({ content, onContentSave }) => {
  const [localContent, setLocalContent] = useState(content);
  const [enhancedSections, setEnhancedSections] = useState({});
  const [isEnhancing, setIsEnhancing] = useState({});

  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  const handleEnhancement = async (header, paragraph) => {
    if (isEnhancing[header]) return;

    setIsEnhancing(prev => ({ ...prev, [header]: true }));
    try {
      const res = await fetch('/api/model/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Enhance this section titled "${header}":\n\n${paragraph}`,
          model: 'hermes',
          max_tokens: 750
        })
      });

      const data = await res.json();
      const result = data?.response?.trim();
      if (result) {
        setEnhancedSections(prev => ({ ...prev, [header]: result }));
        const newContent = localContent.replace(paragraph, result);
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
          <div key={currentHeader + '-body'} style={{ marginBottom: '1em' }}>
            <p>{enhanced}</p>
            <button onClick={() => handleEnhancement(currentHeader, paraText)} disabled={isEnhancing[currentHeader]}>
              {isEnhancing[currentHeader] ? 'Enhancing...' : 'Enhance Section'}
            </button>
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
        output.push(<h2 key={`header-${idx}`}>{currentHeader}</h2>);
      } else {
        currentParagraph.push(line);
      }
    });
    flushParagraph();
    return output;
  };

  return (
    <div style={{ padding: '1rem' }}>
      {localContent ? parseContent(localContent) : <p>No content available.</p>}
    </div>
  );
};

export default AdaptiveTextbook;
