// 2. ContentManager.jsx - NEW component for data orchestration
import React, { useState, useEffect } from 'react';
import AdaptiveTextbook from './AdaptiveTextbook';
import { fetchStudentMarkdown, saveStudentMarkdown } from '../../api/Science';
import styles from './TopicHeader.module.css';

const ContentManager = ({ selectedConcept, subject, userEmail }) => {
  const [markdownText, setMarkdownText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load content when concept changes
  useEffect(() => {
    const loadMarkdown = async () => {
      if (!selectedConcept?.markdown || !subject || !userEmail) {
        setMarkdownText('');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const content = await fetchStudentMarkdown(userEmail, selectedConcept.markdown);
        setMarkdownText(content);
      } catch (err) {
        console.error('Error loading markdown:', err);

        // Fallback to public path (PATCHED)
        try {
          const encodedPath = encodeURIComponent(selectedConcept.markdown);
          const publicPath = `/data/${subject}/markdown/${encodedPath}`;
          const publicRes = await fetch(publicPath);
          if (publicRes.ok) {
            const fallbackText = await publicRes.text();
            setMarkdownText(fallbackText);

            // Save to user's storage (UNENCODED for internal match)
            await saveStudentMarkdown(userEmail, decodeURIComponent(selectedConcept.markdown), fallbackText);
          } else {
            throw new Error('Failed to load from public path');
          }
        } catch (fallbackErr) {
          console.error('Fallback failed:', fallbackErr);
          setError('Error loading content.');
          setMarkdownText('');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadMarkdown();
  }, [selectedConcept, subject, userEmail]);

  // Save content when it's updated
  const handleContentSave = async (updatedContent) => {
    if (!selectedConcept?.markdown || !userEmail) return;

    try {
      const cleanPath = decodeURIComponent(selectedConcept.markdown);
      await saveStudentMarkdown(userEmail, cleanPath, updatedContent);
      setMarkdownText(updatedContent);
    } catch (err) {
      console.error('Error saving markdown:', err);
      setError('Error saving content.');
    }
  };

  if (isLoading) {
    return (
      <div className={styles.conceptDetailCard}>
        <h3>{selectedConcept.title || selectedConcept}</h3>
        <div className={styles.loadingState}>Loading content...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.conceptDetailCard}>
        <h3>{selectedConcept.title || selectedConcept}</h3>
        <div className={styles.errorState}>{error}</div>
      </div>
    );
  }

  return (
    <div className={styles.conceptDetailCard}>
      <h3>{selectedConcept.title || selectedConcept}</h3>
      {selectedConcept.markdown ? (
        <AdaptiveTextbook 
          content={markdownText} 
          onContentSave={handleContentSave}
        />
      ) : (
        <p>
          {selectedConcept.content || 
            `Here we'll show details, activities, or lessons for: ${selectedConcept.title || selectedConcept}`
          }
        </p>
      )}
    </div>
  );
};

export default ContentManager;
