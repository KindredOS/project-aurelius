// Import necessary libraries
import React, { useState } from 'react';
import { HfInference } from "@huggingface/inference";

const client = new HfInference("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");

const CodingPage = () => {
    const [selectedTopic, setSelectedTopic] = useState('overview');
    const [codeInput, setCodeInput] = useState('');
    const [output, setOutput] = useState('');
    const [aiFeedback, setAiFeedback] = useState('');

    // Topics for the coding page
    const topics = [
        { id: 'overview', name: 'Overview', description: 'Introduction to coding and its applications.' },
        { id: 'python', name: 'Python', description: 'Learn the basics of Python programming.' },
        { id: 'javascript', name: 'JavaScript', description: 'Explore JavaScript for web development.' },
        { id: 'cplusplus', name: 'C++', description: 'Write and execute C++ code snippets.' },
        { id: 'java', name: 'Java', description: 'Dive into Java for software development.' }
    ];

    const runCode = (language) => {
        try {
            let result;
            if (language === 'python') {
                // Placeholder for Python code execution logic
                result = "Python code executed successfully.";
            } else if (language === 'javascript') {
                result = new Function(codeInput)();
            } else if (language === 'cplusplus') {
                // Placeholder for C++ code execution logic
                result = "C++ code executed successfully.";
            } else if (language === 'java') {
                // Placeholder for Java code execution logic
                result = "Java code executed successfully.";
            }
            setOutput(String(result));
        } catch (error) {
            setOutput(`Error: ${error.message}`);
        }
    };

    const getAiFeedback = async (inputText) => {
        try {
            const response = await client.textGeneration({
                model: "NousResearch/Hermes-3-Llama-3.1-8B",
                inputs: `Please provide insights or assistance for the following input:\n\n${inputText}`,
                parameters: {
                    max_new_tokens: 300,
                    return_full_text: false
                }
            });
            setAiFeedback(response.generated_text || "No feedback provided.");
        } catch (error) {
            setAiFeedback(`Error: Unable to retrieve feedback. ${error.message}`);
        }
    };

    const renderContent = () => {
        switch (selectedTopic) {
            case 'overview':
                return (
                    <div>
                        <h2>AI Interface</h2>
                        <p>Use this interface to ask AI for coding assistance, explanations, or suggestions.</p>
                        <textarea
                            value={codeInput}
                            onChange={(e) => setCodeInput(e.target.value)}
                            placeholder="Enter your query or request here..."
                            style={{ width: '100%', height: '150px', marginBottom: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                        ></textarea>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                            <button onClick={() => getAiFeedback(codeInput)} style={{ flex: 1, padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                                Get AI Insights
                            </button>
                        </div>
                        <div style={{ marginTop: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
                            <strong>AI Feedback:</strong>
                            <pre>{aiFeedback}</pre>
                        </div>
                    </div>
                );
            case 'python':
                return (
                    <div>
                        <h2>Python Code Runner</h2>
                        <p>Write and execute Python code snippets.</p>
                        <textarea
                            value={codeInput}
                            onChange={(e) => setCodeInput(e.target.value)}
                            placeholder="Write your Python code here..."
                            style={{ width: '100%', height: '150px', marginBottom: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                        ></textarea>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                            <button onClick={() => runCode('python')} style={{ flex: 1, padding: '10px', backgroundColor: '#3cb371', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                                Run Python Code
                            </button>
                            <button onClick={() => getAiFeedback(codeInput)} style={{ flex: 1, padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                                AI Assist
                            </button>
                        </div>
                        <div style={{ marginTop: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
                            <strong>Output:</strong>
                            <pre>{output}</pre>
                        </div>
                        <div style={{ marginTop: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
                            <strong>AI Feedback:</strong>
                            <pre>{aiFeedback}</pre>
                        </div>
                    </div>
                );
            case 'javascript':
                return (
                    <div>
                        <h2>JavaScript Code Runner</h2>
                        <p>Write and execute JavaScript code snippets.</p>
                        <textarea
                            value={codeInput}
                            onChange={(e) => setCodeInput(e.target.value)}
                            placeholder="Write your JavaScript code here..."
                            style={{ width: '100%', height: '150px', marginBottom: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                        ></textarea>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                            <button onClick={() => runCode('javascript')} style={{ flex: 1, padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                                Run JavaScript Code
                            </button>
                            <button onClick={() => getAiFeedback(codeInput)} style={{ flex: 1, padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                                AI Assist
                            </button>
                        </div>
                        <div style={{ marginTop: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
                            <strong>Output:</strong>
                            <pre>{output}</pre>
                        </div>
                        <div style={{ marginTop: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
                            <strong>AI Feedback:</strong>
                            <pre>{aiFeedback}</pre>
                        </div>
                    </div>
                );
            case 'cplusplus':
                return (
                    <div>
                        <h2>C++ Code Runner</h2>
                        <p>Write and execute C++ code snippets.</p>
                        <textarea
                            value={codeInput}
                            onChange={(e) => setCodeInput(e.target.value)}
                            placeholder="Write your C++ code here..."
                            style={{ width: '100%', height: '150px', marginBottom: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                        ></textarea>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                            <button onClick={() => runCode('cplusplus')} style={{ flex: 1, padding: '10px', backgroundColor: '#ffa500', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                                Run C++ Code
                            </button>
                            <button onClick={() => getAiFeedback(codeInput)} style={{ flex: 1, padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                                AI Assist
                            </button>
                        </div>
                        <div style={{ marginTop: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
                            <strong>Output:</strong>
                            <pre>{output}</pre>
                        </div>
                        <div style={{ marginTop: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
                            <strong>AI Feedback:</strong>
                            <pre>{aiFeedback}</pre>
                        </div>
                    </div>
                );
            case 'java':
                return (
                    <div>
                        <h2>Java Code Runner</h2>
                        <p>Write and execute Java code snippets.</p>
                        <textarea
                            value={codeInput}
                            onChange={(e) => setCodeInput(e.target.value)}
                            placeholder="Write your Java code here..."
                            style={{ width: '100%', height: '150px', marginBottom: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                        ></textarea>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                            <button onClick={() => runCode('java')} style={{ flex: 1, padding: '10px', backgroundColor: '#ff4500', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                                Run Java Code
                            </button>
                            <button onClick={() => getAiFeedback(codeInput)} style={{ flex: 1, padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                                AI Assist
                            </button>
                        </div>
                        <div style={{ marginTop: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
                            <strong>Output:</strong>
                            <pre>{output}</pre>
                        </div>
                        <div style={{ marginTop: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
                            <strong>AI Feedback:</strong>
                            <pre>{aiFeedback}</pre>
                        </div>
                    </div>
                );
            default:
                return (
                    <div>
                        <h2>Welcome to Coding!</h2>
                        <p>Select a topic from the sidebar to begin exploring coding concepts.</p>
                        <div style={{ marginTop: '20px' }}>
                            <h3>Code Runner</h3>
                            <textarea
                                value={codeInput}
                                onChange={(e) => setCodeInput(e.target.value)}
                                placeholder="Write your code here..."
                                style={{ width: '100%', height: '150px', marginBottom: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                            ></textarea>
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                <button onClick={() => runCode('javascript')} style={{ flex: 1, padding: '10px', backgroundColor: '#3cb371', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                                    Run Code
                                </button>
                                <button onClick={() => getAiFeedback(codeInput)} style={{ flex: 1, padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                                    AI Assist
                                </button>
                            </div>
                            <div style={{ marginTop: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
                                <strong>Output:</strong>
                                <pre>{output}</pre>
                            </div>
                            <div style={{ marginTop: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
                                <strong>AI Feedback:</strong>
                                <pre>{aiFeedback}</pre>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'row', fontFamily: 'Arial, sans-serif', height: '100vh', backgroundColor: '#f4f4f4' }}>
            {/* Sidebar Navigation */}
            <div style={{ width: '250px', backgroundColor: '#fdfdfd', borderRight: '1px solid #ddd', padding: '15px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', flexShrink: 0 }}>
                <h1 style={{ fontSize: '1.8rem', color: '#333', marginBottom: '10px' }}>Coding Topics</h1>
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

            {/* Main Content Area */}
            <div style={{ flex: '1', padding: '20px', backgroundColor: '#fff', borderRadius: '5px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', marginLeft: '20px', overflowY: 'auto' }}>
                {renderContent()}
            </div>
        </div>
    );
};

export default CodingPage;
