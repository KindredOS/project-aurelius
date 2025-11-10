// Import necessary libraries
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HfInference } from '@huggingface/inference'; // Import Hugging Face inference library

const client = new HfInference('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'); // Replace with your API key

const StoryBookPage = () => {
    const navigate = useNavigate(); // Use React Router's useNavigate hook

    const navigateTo = (page) => {
        navigate(`/page/Dashboard/Storybook/${page}`); // Adjusted navigation for proper paths
    };

    return (
        <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', backgroundColor: '#f4f4f4', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h1 style={{ fontSize: '2rem', color: '#333', marginBottom: '20px' }}>StoryBook Page</h1>
            <div style={{ display: 'flex', gap: '20px' }}>
                <div
                    onClick={() => navigateTo('CreateStoryPage')}
                    style={{ width: '150px', height: '150px', backgroundColor: '#007bff', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', cursor: 'pointer', fontSize: '1.2rem', textAlign: 'center' }}
                >
                    Create Story
                </div>
                <div
                    onClick={() => navigateTo('ExpandStoryPage')}
                    style={{ width: '150px', height: '150px', backgroundColor: '#28a745', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', cursor: 'pointer', fontSize: '1.2rem', textAlign: 'center' }}
                >
                    Expand Story
                </div>
                <div
                    onClick={() => navigateTo('LibraryPage')}
                    style={{ width: '150px', height: '150px', backgroundColor: '#ffc107', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', cursor: 'pointer', fontSize: '1.2rem', textAlign: 'center' }}
                >
                    Library
                </div>
            </div>
        </div>
    );
};

export const CreateStoryPage = () => {
    const [genre, setGenre] = useState('');
    const [theme, setTheme] = useState('');
    const [character, setCharacter] = useState('');
    const [storyLength, setStoryLength] = useState('short');
    const [storyPreview, setStoryPreview] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAiRequest = async () => {
        const aiInputText = `Generate a ${storyLength} ${genre} story about ${character} with the theme of ${theme}.`;

        setLoading(true);
        setStoryPreview('');

        try {
            const stream = client.chatCompletionStream({
                model: 'NousResearch/Hermes-3-Llama-3.1-8B',
                messages: [{ role: 'user', content: aiInputText }],
                temperature: 0.7,
                max_tokens: 2048,
                top_p: 0.7,
            });

            for await (const chunk of stream) {
                if (chunk.choices && chunk.choices.length > 0) {
                    const newContent = chunk.choices[0].delta.content;
                    setStoryPreview((prev) => prev + newContent);
                }
            }
        } catch (error) {
            setStoryPreview(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', backgroundColor: '#f4f4f4', height: '100vh' }}>
            <h1 style={{ fontSize: '2rem', color: '#333', marginBottom: '20px' }}>Create Story</h1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
                <label>Genre: <input type="text" value={genre} onChange={(e) => setGenre(e.target.value)} /></label>
                <label>Theme: <input type="text" value={theme} onChange={(e) => setTheme(e.target.value)} /></label>
                <label>Main Character: <input type="text" value={character} onChange={(e) => setCharacter(e.target.value)} /></label>
                <label>Story Length: <select value={storyLength} onChange={(e) => setStoryLength(e.target.value)}><option value="short">Short</option><option value="medium">Medium</option><option value="long">Long</option></select></label>
            </div>
            <button onClick={handleAiRequest}>{loading ? 'Generating...' : 'Generate Story'}</button>
            <div>{storyPreview}</div>
        </div>
    );
};

export const ExpandStoryPage = () => (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', backgroundColor: '#f4f4f4', height: '100vh' }}>
        <h1 style={{ fontSize: '2rem', color: '#333', marginBottom: '20px' }}>Expand Story</h1>
        <p>Expand existing stories or add details.</p>
    </div>
);

export const LibraryPage = () => (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', backgroundColor: '#f4f4f4', height: '100vh' }}>
        <h1 style={{ fontSize: '2rem', color: '#333', marginBottom: '20px' }}>Library</h1>
        <p>Access your saved stories here.</p>
    </div>
);

export default StoryBookPage;
