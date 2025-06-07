// Import necessary libraries
import React, { useState } from 'react';
import { HfInference } from '@huggingface/inference'; // Import Hugging Face inference library
import { useNavigate } from 'react-router-dom';

const client = new HfInference('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'); // Replace with your API key

const CreateStoryPage = () => {
    const [genre, setGenre] = useState('');
    const [theme, setTheme] = useState('');
    const [character, setCharacter] = useState('');
    const [storyLength, setStoryLength] = useState('short');
    const [storyPreview, setStoryPreview] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Function to request AI-generated story stub with streaming
    const handleAiRequest = async () => {
        const aiInputText = `Generate a ${storyLength} ${genre} story about ${character} with the theme of ${theme}.`;

        setLoading(true);
        setStoryPreview(''); // Clear previous preview

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
                    setStoryPreview((prev) => prev + newContent); // Append streamed content
                }
            }
        } catch (error) {
            setStoryPreview(`Error: ${error.message}`); // Handle errors
        } finally {
            setLoading(false); // Hide loading state
        }
    };

    const handleExpandStory = () => {
        if (storyPreview) {
            navigate('/page/Dashboard/Storybook/ExpandStoryPage', { state: { story: storyPreview } });
        }
    };

    return (
        <div style={{ fontFamily: 'Roboto, Arial, sans-serif', padding: '20px', background: 'linear-gradient(135deg, #eef2f3, #dbe6f6)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h1 style={{ fontSize: '2.8rem', color: '#003366', marginBottom: '20px', fontWeight: 'bold' }}>Create Your Story</h1>
            <p style={{ fontSize: '1.3rem', color: '#555', textAlign: 'center', maxWidth: '600px', marginBottom: '30px' }}>Unleash your imagination and craft a unique story with the help of AI. Let your creativity shine!</p>

            <div style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '25px', marginBottom: '40px', padding: '20px', borderRadius: '10px', background: '#ffffff', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
                <label style={{ display: 'flex', flexDirection: 'column', fontSize: '1rem', color: '#444', fontWeight: '500' }}>
                    Genre
                    <select
                        value={genre}
                        onChange={(e) => setGenre(e.target.value)}
                        style={{ marginTop: '10px', padding: '12px', border: '1px solid #ccc', borderRadius: '8px' }}
                    >
                        <option value="">Select Genre</option>
                        <option value="fantasy">Fantasy</option>
                        <option value="sci-fi">Sci-Fi</option>
                        <option value="adventure">Adventure</option>
                        <option value="mystery">Mystery</option>
                    </select>
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', fontSize: '1rem', color: '#444', fontWeight: '500' }}>
                    Theme
                    <input
                        type="text"
                        value={theme}
                        onChange={(e) => setTheme(e.target.value)}
                        placeholder="E.g., Friendship, Courage"
                        style={{ marginTop: '10px', padding: '12px', border: '1px solid #ccc', borderRadius: '8px' }}
                    />
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', fontSize: '1rem', color: '#444', fontWeight: '500' }}>
                    Main Character
                    <input
                        type="text"
                        value={character}
                        onChange={(e) => setCharacter(e.target.value)}
                        placeholder="E.g., Brave Knight, Space Explorer"
                        style={{ marginTop: '10px', padding: '12px', border: '1px solid #ccc', borderRadius: '8px' }}
                    />
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', fontSize: '1rem', color: '#444', fontWeight: '500' }}>
                    Story Length
                    <select
                        value={storyLength}
                        onChange={(e) => setStoryLength(e.target.value)}
                        style={{ marginTop: '10px', padding: '12px', border: '1px solid #ccc', borderRadius: '8px' }}
                    >
                        <option value="short">Short</option>
                        <option value="medium">Medium</option>
                        <option value="long">Long</option>
                    </select>
                </label>
            </div>

            <button
                onClick={handleAiRequest}
                style={{ padding: '15px 30px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold', transition: 'background-color 0.3s', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)' }}
                onMouseOver={(e) => (e.target.style.backgroundColor = '#0056b3')}
                onMouseOut={(e) => (e.target.style.backgroundColor = '#007bff')}
                disabled={loading}
            >
                {loading ? 'Generating...' : 'Generate Story'}
            </button>

            {storyPreview && (
                <button
                    onClick={handleExpandStory}
                    style={{ marginTop: '20px', padding: '15px 30px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold', transition: 'background-color 0.3s', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)' }}
                    onMouseOver={(e) => (e.target.style.backgroundColor = '#1e7e34')}
                    onMouseOut={(e) => (e.target.style.backgroundColor = '#28a745')}
                >
                    Expand Story
                </button>
            )}

            <div style={{ marginTop: '40px', padding: '25px', border: '1px solid #ddd', borderRadius: '10px', backgroundColor: '#ffffff', width: '100%', maxWidth: '600px', minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
                {loading ? <p style={{ fontSize: '1.3rem', color: '#555' }}>Generating your story...</p> : <p style={{ fontSize: '1.3rem', color: '#333' }}>{storyPreview || 'Your story preview will appear here.'}</p>}
            </div>
        </div>
    );
};

export default CreateStoryPage;
