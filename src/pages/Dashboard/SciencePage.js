// Import necessary libraries
import React, { useState } from 'react';
import { HfInference } from "@huggingface/inference"; // Hugging Face API

const client = new HfInference("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");

const SciencePage = () => {
    const [selectedTopic, setSelectedTopic] = useState('overview');
    const [gradeLevel, setGradeLevel] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [userInput, setUserInput] = useState('');
    const [loading, setLoading] = useState(false);

    const topics = [
        { id: 'overview', name: 'Overview', description: 'General overview of science topics.' },
        { id: 'physics', name: 'Physics', description: 'Explore the laws of motion, energy, and forces.' },
        { id: 'chemistry', name: 'Chemistry', description: 'Learn about periodic table, reactions, and molar masses.' },
        { id: 'biology', name: 'Biology', description: 'Dive into the world of living organisms.' },
        { id: 'earth', name: 'Earth Science', description: 'Discover Earth layers, weather, and geology.' },
        { id: 'space', name: 'Space Science', description: 'Explore the cosmos and space exploration.' }
    ];

    const sendMessage = async () => {
        if (!userInput.trim()) return;

        setChatHistory((prev) => [...prev, { role: 'user', content: userInput }]);
        setLoading(true);
        setUserInput('');

        try {
            const stream = client.chatCompletionStream({
                model: "NousResearch/Hermes-3-Llama-3.1-8B",
                messages: [
                    { role: "system", content: `You are a knowledgeable science teacher for ${gradeLevel} grade.` },
                    ...chatHistory,
                    { role: "user", content: userInput }
                ],
                temperature: 0.7,
                max_tokens: 2048,
                top_p: 0.7
            });

            let responseText = "";
            for await (const chunk of stream) {
                if (chunk.choices && chunk.choices.length > 0) {
                    const newContent = chunk.choices[0].delta.content;
                    responseText += newContent;
                }
            }

            setChatHistory((prev) => [...prev, { role: 'assistant', content: responseText }]);
        } catch (error) {
            setChatHistory((prev) => [...prev, { role: 'assistant', content: 'Error generating response.' }]);
        } finally {
            setLoading(false);
        }
    };

    const renderChatWindow = () => (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', border: '1px solid #ddd', borderRadius: '5px', overflow: 'hidden' }}>
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px', backgroundColor: '#f9f9f9' }}>
                {chatHistory.map((message, index) => (
                    <div key={index} style={{ marginBottom: '10px', textAlign: message.role === 'user' ? 'right' : 'left' }}>
                        <p style={{ margin: 0, padding: '10px', borderRadius: '5px', backgroundColor: message.role === 'user' ? '#007bff' : '#e8e8e8', color: message.role === 'user' ? '#fff' : '#000', display: 'inline-block', maxWidth: '80%' }}>
                            {message.content}
                        </p>
                    </div>
                ))}
            </div>
            <div style={{ display: 'flex', padding: '5px', borderTop: '1px solid #ddd', backgroundColor: '#fff' }}>
                <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Type your question here..."
                    style={{ flex: 2, padding: '10px', border: '1px solid #ddd', borderRadius: '5px', marginRight: '10px', minWidth: '0' }}
                />
                <button
                    onClick={sendMessage}
                    style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', flex: 0.5, minWidth: '75px' }}
                    disabled={loading}
                >
                    {loading ? '...' : 'Send'}
                </button>
            </div>
        </div>
    );

    const renderContent = () => (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <h2 style={{ marginBottom: '10px' }}>{topics.find((t) => t.id === selectedTopic)?.name || 'Science Page'}</h2>
            <p style={{ marginBottom: '20px' }}>{topics.find((t) => t.id === selectedTopic)?.description}</p>
            {renderChatWindow()}
        </div>
    );

    return (
        <div style={{ display: 'flex', fontFamily: 'Arial, sans-serif', height: '100vh', backgroundColor: '#f4f4f4' }}>
            <div style={{ width: '250px', backgroundColor: '#fdfdfd', borderRight: '1px solid #ddd', padding: '15px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', flexShrink: 0 }}>
                <h1 style={{ fontSize: '1.8rem', color: '#333', marginBottom: '10px' }}>Science Learning Center</h1>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#333' }}>Topics</h2>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {topics.map((topic) => (
                        <li
                            key={topic.id}
                            style={{
                                padding: '10px',
                                margin: '5px 0',
                                cursor: 'pointer',
                                backgroundColor: selectedTopic === topic.id ? '#3cb371' : '#e8e8e8',
                                color: selectedTopic === topic.id ? 'white' : '#000',
                                fontWeight: selectedTopic === topic.id ? 'bold' : 'normal',
                                borderRadius: '5px',
                                textAlign: 'center',
                                transition: 'background-color 0.3s ease, transform 0.2s ease',
                                transform: selectedTopic === topic.id ? 'scale(1.05)' : 'scale(1)'
                            }}
                            onClick={() => setSelectedTopic(topic.id)}
                        >
                            {topic.name}
                        </li>
                    ))}
                </ul>
            </div>

            <div style={{ flex: 1, padding: '20px', backgroundColor: '#fff', borderRadius: '5px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', marginLeft: '20px', overflowY: 'auto' }}>
                {renderContent()}
            </div>
        </div>
    );
};

export default SciencePage;
