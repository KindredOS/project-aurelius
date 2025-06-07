// Import necessary libraries
import React, { useState } from 'react';
import { streamAIResponse } from "../../utils/AiConfig";
import { useApiUrl } from "../../config/ApiConfig";

const HistoryPage = () => {
    const [selectedFigure, setSelectedFigure] = useState(null);
    const [chatHistory, setChatHistory] = useState([]);
    const [userInput, setUserInput] = useState("");
    const [aiApiUrl] = useApiUrl("ai");

    // List of historical figures
    const historicalFigures = [
        { id: 'lincoln', name: 'Abraham Lincoln', description: '16th President of the United States, known for leading the nation during the Civil War.' },
        { id: 'cleopatra', name: 'Cleopatra', description: 'The last active ruler of the Ptolemaic Kingdom of Egypt.' },
        { id: 'gandhi', name: 'Mahatma Gandhi', description: 'Leader of India’s non-violent independence movement.' },
        { id: 'einstein', name: 'Albert Einstein', description: 'Renowned physicist known for the theory of relativity.' },
        { id: 'curie', name: 'Marie Curie', description: 'Pioneer in radioactivity and the first woman to win a Nobel Prize.' },
        { id: 'douglass', name: 'Frederick Douglass', description: 'Abolitionist leader and advocate for social justice and equality.' },
        { id: 'parks', name: 'Rosa Parks', description: 'Civil rights activist known for her pivotal role in the Montgomery Bus Boycott.' },
        { id: 'malcolm', name: 'Malcolm X', description: 'Influential leader in the civil rights movement advocating for Black empowerment.' },
        { id: 'king', name: 'Martin Luther King Jr.', description: 'Civil rights leader famous for his "I Have a Dream" speech and nonviolent activism.' },
        { id: 'tubman', name: 'Harriet Tubman', description: 'Abolitionist and political activist known for her role in the Underground Railroad.' },
        { id: 'truth', name: 'Sojourner Truth', description: 'African American abolitionist and women’s rights activist.' },
        { id: 'madison', name: 'James Madison', description: 'Fourth President of the United States and "Father of the Constitution."' },
        { id: 'washington', name: 'George Washington Carver', description: 'Scientist and inventor known for his work with peanuts and agricultural innovations.' },
        { id: 'hamilton', name: 'Alexander Hamilton', description: 'Founding Father and the first Secretary of the Treasury.' },
        { id: 'jefferson', name: 'Thomas Jefferson', description: 'Third President of the United States and principal author of the Declaration of Independence.' }
    ];

    // Function to handle user input
    const handleSendMessage = async () => {
        if (userInput.trim() && selectedFigure) {
            const updatedChat = [...chatHistory, { sender: 'User', message: userInput }];
            setChatHistory(updatedChat);

            try {
                const stream = await streamAIResponse(aiApiUrl, `You are impersonating ${selectedFigure.name}. Respond as they might. ${userInput}`);
                let aiResponse = "";
                for await (const chunk of stream) {
                    if (chunk.choices && chunk.choices.length > 0) {
                        aiResponse += chunk.choices[0].delta.content;
                    }
                }
                setChatHistory([...updatedChat, { sender: selectedFigure.name, message: aiResponse }]);
            } catch (error) {
                setChatHistory([...updatedChat, { sender: 'System', message: 'Error fetching AI response.' }]);
            }

            setUserInput("");
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'row', fontFamily: 'Arial, sans-serif', height: '100vh', backgroundColor: '#f4f4f4' }}>
            <div style={{ width: '250px', backgroundColor: '#fdfdfd', borderRight: '1px solid #ddd', padding: '15px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', flexShrink: 0 }}>
                <h1 style={{ fontSize: '1.8rem', color: '#333', marginBottom: '10px' }}>Speak with Great People</h1>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {historicalFigures.map((figure) => (
                        <li
                            key={figure.id}
                            style={{
                                padding: '10px',
                                margin: '5px 0',
                                cursor: 'pointer',
                                backgroundColor: selectedFigure?.id === figure.id ? '#3cb371' : '#e8e8e8',
                                color: selectedFigure?.id === figure.id ? 'white' : '#000',
                                fontWeight: selectedFigure?.id === figure.id ? 'bold' : 'normal',
                                borderRadius: '5px',
                                textAlign: 'center',
                                transition: 'background-color 0.3s ease, transform 0.2s ease',
                                transform: selectedFigure?.id === figure.id ? 'scale(1.05)' : 'scale(1)'
                            }}
                            onClick={() => {
                                setSelectedFigure(figure);
                                setChatHistory([{ sender: figure.name, message: `Hello! I am ${figure.name}. Ask me anything about my life or work.` }]);
                            }}
                        >
                            {figure.name}
                        </li>
                    ))}
                </ul>
            </div>

            <div style={{ flex: '1', padding: '20px', backgroundColor: '#fff', overflowY: 'auto', height: '70vh', borderRadius: '5px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
                {selectedFigure ? (
                    <>
                        <h2>Chat with {selectedFigure.name}</h2>
                        <div>{chatHistory.map((entry, index) => (
                            <div key={index}><strong>{entry.sender}:</strong> {entry.message}</div>
                        ))}</div>
                        <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder="Ask a question..." />
                        <button onClick={handleSendMessage}>Send</button>
                    </>
                ) : <h2>Select a historical figure to begin the conversation.</h2>}
            </div>
        </div>
    );
};

export default HistoryPage;
