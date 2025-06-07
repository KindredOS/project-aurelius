// Import necessary libraries
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HfInference } from '@huggingface/inference'; // Import Hugging Face inference library

const client = new HfInference('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'); // Replace with your API key

const ExpandStoryPage = () => {
    const [chapters, setChapters] = useState(
        Array(5).fill({ title: '', content: '', loading: false })
    );
    const [compiledStory, setCompiledStory] = useState('');
    const navigate = useNavigate();

    const generateChapter = async (index) => {
        setChapters((prev) =>
            prev.map((chapter, i) =>
                i === index ? { ...chapter, loading: true } : chapter
            )
        );

        try {
            const aiInputText = `Generate chapter ${index + 1} for the ongoing story. Ensure each chapter is self-contained and fits seamlessly into the narrative.`;

            const stream = client.chatCompletionStream({
                model: 'NousResearch/Hermes-3-Llama-3.1-8B',
                messages: [{ role: 'user', content: aiInputText }],
                temperature: 0.7,
                max_tokens: 1500,
                top_p: 0.9,
            });

            let chapterContent = '';

            for await (const chunk of stream) {
                if (chunk.choices && chunk.choices.length > 0) {
                    const newContent = chunk.choices[0].delta.content;
                    chapterContent += newContent;
                }
            }

            setChapters((prev) =>
                prev.map((chapter, i) =>
                    i === index
                        ? { ...chapter, title: `Chapter ${index + 1}`, content: chapterContent, loading: false }
                        : chapter
                )
            );
        } catch (error) {
            console.error('Error:', error.message);
            setChapters((prev) =>
                prev.map((chapter, i) =>
                    i === index ? { ...chapter, loading: false } : chapter
                )
            );
        }
    };

    const compileStory = () => {
        const fullStory = chapters.map((chapter) => chapter.content).join('\n\n');
        setCompiledStory(fullStory);
    };

    const pushToLibrary = () => {
        if (compiledStory) {
            const storedLibrary = JSON.parse(localStorage.getItem('library')) || [];
            storedLibrary.push({ title: 'Compiled Story', content: compiledStory });
            localStorage.setItem('library', JSON.stringify(storedLibrary));
            navigate('/page/Dashboard/Storybook/LibraryPage');
        }
    };

    return (
        <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', backgroundColor: '#f4f4f4', minHeight: '100vh' }}>
            <h1 style={{ fontSize: '2rem', color: '#333', marginBottom: '20px' }}>Expand Your Story</h1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '30px' }}>
                {chapters.map((chapter, index) => (
                    <div key={index} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '5px', backgroundColor: '#fff' }}>
                        <h2>{chapter.title || `Chapter ${index + 1}`}</h2>
                        {chapter.content ? (
                            <p>{chapter.content}</p>
                        ) : (
                            <button
                                onClick={() => generateChapter(index)}
                                style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1rem' }}
                                disabled={chapter.loading}
                            >
                                {chapter.loading ? 'Generating...' : 'Generate Chapter'}
                            </button>
                        )}
                    </div>
                ))}
            </div>
            {compiledStory ? (
                <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: '#fff' }}>
                    <h2 style={{ marginBottom: '10px', fontSize: '1.2rem', color: '#333' }}>Compiled Story</h2>
                    <p style={{ whiteSpace: 'pre-wrap' }}>{compiledStory}</p>
                </div>
            ) : (
                <button
                    onClick={compileStory}
                    style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1rem', marginBottom: '20px' }}
                >
                    Compile Story
                </button>
            )}
            <button
                onClick={pushToLibrary}
                style={{ padding: '10px 20px', backgroundColor: '#ffc107', color: 'black', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1rem' }}
                disabled={!compiledStory}
            >
                Push to Library
            </button>
        </div>
    );
};

export default ExpandStoryPage;
