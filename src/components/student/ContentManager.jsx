// Path: src/components/student/ContentManager.jsx 
// Function: Inbound pulls from public or back end file systems, with a focus on first step sanitiztion.

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

const ContentManager = ({ selectedConcept, subject, userEmail, userMBTI }) => {
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
        // Primary attempt: fetch from user backend copy
        const raw = await fetchStudentMarkdown(subject, userEmail, selectedConcept.markdown);
        if (!raw || raw.toLowerCase().includes('error') || raw.trim() === '') {
          throw new Error('Primary fetch failed with backend 500 or invalid content');
        }
        setMarkdownText(cleanMarkdownContent(raw));
      } catch (err) {
        console.warn('[Primary] Markdown fetch failed. Attempting fallback to public template →', err);

        try {
          let fallbackText = '';

          // ✅ Correct public folder path
          // public/data/<subject>/markdown/<filepath>
          const rawPath = `/data/${subject}/markdown/${selectedConcept.markdown}`;

          // ✅ Normalize slashes + ensure nested path encoding works
          const normalized = rawPath.replace(/\\/g, '/');
          const encoded = normalized
            .split('/')
            .map((seg) => encodeURIComponent(seg))
            .join('/');

          // ✅ First try raw (works when no spaces)
          let res = await fetch(normalized);

          // ✅ If that fails, try encoded path (handles overview/ + spaces)
          if (!res.ok) {
            res = await fetch(encoded);
            if (!res.ok) throw new Error(`Public template fetch failed (${normalized} → ${encoded})`);
          }

          fallbackText = await res.text();
          const cleaned = cleanMarkdownContent(fallbackText);
          setMarkdownText(cleaned);

          // ✅ Save seeded template to backend so future loads come from student copy
          try {
            await saveStudentMarkdown(subject, userEmail, selectedConcept.markdown, cleaned);
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
      await saveStudentMarkdown(subject, userEmail, selectedConcept.markdown, updatedContent);
      setMarkdownText(updatedContent);
    } catch (err) {
      console.error('Error saving markdown:', err);
      setError('Error saving content.');
    }
  };

  const renderBody = () => {
    if (isLoading) return <div className={styles.loadingState}>Loading content...</div>;
    if (error) return <div className={styles.errorState}>{error}</div>;

    if (selectedConcept.markdown) {
      return (
        <AdaptiveTextbook 
          content={markdownText} 
          onContentSave={handleContentSave} 
          subject={subject}
          userMBTI={userMBTI} 
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
