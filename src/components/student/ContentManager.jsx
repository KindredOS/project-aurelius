//Path: src/components/student/ContentManager.jsx 
//Focus:
//Version Update: Handles 500 Failover to Template Markdown

import React, { useState, useEffect } from 'react';
import AdaptiveTextbook from './AdaptiveTextbook';
import { fetchStudentMarkdown, saveStudentMarkdown } from '../../api/ApiMaster';
import styles from './TopicHeader.module.css';

const cleanMarkdownContent = (content) => {
  if (typeof content !== 'string') return content;
  return content
    .replace(/^"(#{1,6}\s+.*?)"$/gm, '$1')
    .replace(/^"([^"]*?)$/gm, '$1')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\\\\/g, '\\')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/(#{1,6}\s+[^\n]+)\n([^\n#])/g, '$1\n\n$2');
};

const ContentManager = ({ selectedConcept, subject, userEmail }) => {
  const [markdownText, setMarkdownText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadMarkdown = async () => {
      if (!selectedConcept?.markdown || !subject || !userEmail) {
        setMarkdownText('');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const raw = await fetchStudentMarkdown(subject, userEmail, selectedConcept.markdown);
        if (!raw || raw.toLowerCase().includes('error') || raw.trim() === '') {
          throw new Error('Primary fetch failed with backend 500 or invalid content');
        }
        setMarkdownText(cleanMarkdownContent(raw));
      } catch (err) {
        console.warn('[Primary] Markdown fetch failed, loading template:', err);
        try {
          let fallbackText = '';
          let attemptedPaths = [];

          const rawPath = `/data/${subject}/markdown/${selectedConcept.markdown}`;
          attemptedPaths.push(rawPath);
          let res = await fetch(rawPath);

          if (!res.ok) {
            const encodedPath = `/data/${subject}/markdown/${encodeURIComponent(selectedConcept.markdown)}`;
            attemptedPaths.push(encodedPath);
            res = await fetch(encodedPath);
            if (!res.ok) throw new Error(`Both fetch attempts failed: ${res.status}`);
          }

          fallbackText = await res.text();
          const cleaned = cleanMarkdownContent(fallbackText);
          setMarkdownText(cleaned);

          try {
            await saveStudentMarkdown(subject, userEmail, decodeURIComponent(selectedConcept.markdown), cleaned);
          } catch (saveErr) {
            console.warn('[Template Save] Failed:', saveErr);
          }
        } catch (templateErr) {
          console.error('[Template Fallback] Failed:', templateErr);
          setError('Error loading content.');
          setMarkdownText('');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadMarkdown();
  }, [selectedConcept, subject, userEmail]);

  const handleContentSave = async (updatedContent) => {
    if (!selectedConcept?.markdown || !userEmail) return;
    try {
      const cleanPath = decodeURIComponent(selectedConcept.markdown);
      await saveStudentMarkdown(subject, userEmail, cleanPath, updatedContent);
      setMarkdownText(updatedContent);
    } catch (err) {
      console.error('Error saving markdown:', err);
      setError('Error saving content.');
    }
  };

  const renderBody = () => {
    if (isLoading) {
      return <div className={styles.loadingState}>Loading content...</div>;
    }
    if (error) {
      return <div className={styles.errorState}>{error}</div>;
    }
    if (selectedConcept.markdown) {
      return (
        <AdaptiveTextbook 
          content={markdownText} 
          onContentSave={handleContentSave} 
          subject={subject} 
        />
      );
    }
    return (
      <p>
        {selectedConcept.content || `Here we'll show details, activities, or lessons for: ${selectedConcept.title || selectedConcept}`}
      </p>
    );
  };

  return (
    <div className={styles.conceptDetailCard}>
      <h3>{selectedConcept.title || selectedConcept}</h3>
      {renderBody()}
    </div>
  );
};

export default ContentManager;
