// Import necessary libraries
import React, { useRef, useState } from 'react';
import './ArtStudioPage.module.css'; // Import corresponding styles

const ArtStudioPage = () => {
    const [selectedTool, setSelectedTool] = useState('overview');
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#000000');
    const [lineWidth, setLineWidth] = useState(5);
    const [aiSuggestion, setAiSuggestion] = useState('');
    const [generatedImage, setGeneratedImage] = useState(null);

    const ROYGBIV = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'];

    // Tools and Features for the Art Studio
    const tools = [
        { id: 'overview', name: 'Overview', description: 'Welcome to the Art Studio! Select a tool to begin creating.' },
        { id: 'paint', name: 'Paint', description: 'Use the paint tool to create stunning artwork.' },
        { id: 'sketch', name: 'Sketch', description: 'Create sketches and outlines with ease.' },
        { id: 'shapes', name: 'Shapes', description: 'Draw geometric shapes and patterns.' },
        { id: 'collage', name: 'Collage', description: 'Combine images and objects to make creative collages.' }
    ];

    // Handle mouse events for drawing
    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        setIsDrawing(true);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = color;
        ctx.lineCap = 'round';
        ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        ctx.stroke();
    };

    const stopDrawing = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.closePath();
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const getAiSuggestion = async () => {
        try {
            const response = await fetch("https://api.openai.com/v1/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer YOUR_API_KEY` // Replace with a real API key
                },
                body: JSON.stringify({
                    model: "text-davinci-003",
                    prompt: "Provide a creative drawing suggestion for a child using colors and simple shapes.",
                    max_tokens: 50
                })
            });

            const data = await response.json();
            setAiSuggestion(data.choices[0]?.text.trim() || "No suggestion available.");
        } catch (error) {
            setAiSuggestion(`Error: ${error.message}`);
        }
    };

    const generateAiImage = async (prompt) => {
        try {
            const response = await fetch(
                "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-3.5-large",
                {
                    headers: {
                        Authorization: "Bearer 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", // Replace with a real API key
                        "Content-Type": "application/json",
                    },
                    method: "POST",
                    body: JSON.stringify({ inputs: prompt }),
                }
            );
            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);
            setGeneratedImage(imageUrl);
        } catch (error) {
            setGeneratedImage(null);
            console.error("Error generating image:", error);
        }
    };

    // Render specific content for tools
    const renderPaintTool = () => (
        <div>
            <h2>Paint</h2>
            <p>Use brushes, colors, and layers to create your masterpiece.</p>
            <div style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    {ROYGBIV.map((c) => (
                        <button
                            key={c}
                            onClick={() => setColor(c)}
                            style={{
                                backgroundColor: c,
                                width: '30px',
                                height: '30px',
                                border: 'none',
                                borderRadius: '50%',
                                cursor: 'pointer'
                            }}
                        ></button>
                    ))}
                    <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        style={{ width: '50px', height: '30px', border: 'none', cursor: 'pointer' }}
                    />
                </div>
                <label>
                    Line Width:
                    <input
                        type="number"
                        value={lineWidth}
                        onChange={(e) => setLineWidth(Number(e.target.value))}
                        style={{ width: '50px', marginLeft: '10px' }}
                    />
                </label>
                <button onClick={clearCanvas} style={{ marginLeft: '20px', padding: '5px 10px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                    Clear Canvas
                </button>
                <button onClick={getAiSuggestion} style={{ marginLeft: '10px', padding: '5px 10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                    Get AI Suggestion
                </button>
                <button
                    onClick={() => generateAiImage(aiSuggestion || "A colorful drawing")}
                    style={{ marginLeft: '10px', padding: '5px 10px', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                >
                    Generate AI Image
                </button>
            </div>
            <canvas
                ref={canvasRef}
                width={800}
                height={500}
                style={{ border: '1px solid #ddd', cursor: 'crosshair' }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
            ></canvas>
            <div style={{ marginTop: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
                <strong>AI Suggestion:</strong>
                <p>{aiSuggestion}</p>
            </div>
            {generatedImage && (
                <div style={{ marginTop: '20px' }}>
                    <strong>Generated AI Image:</strong>
                    <img src={generatedImage} alt="Generated AI" style={{ maxWidth: '100%', borderRadius: '5px', marginTop: '10px' }} />
                </div>
            )}
        </div>
    );

    const renderContent = () => {
        switch (selectedTool) {
            case 'paint':
                return renderPaintTool();
            case 'sketch':
                return (
                    <div>
                        <h2>Sketch</h2>
                        <p>Sketch your ideas with pencils and erasers.</p>
                        <button onClick={() => alert('Launching Sketch Tool')}>Start Sketching</button>
                    </div>
                );
            case 'shapes':
                return (
                    <div>
                        <h2>Shapes</h2>
                        <p>Draw geometric shapes and arrange them into patterns.</p>
                        <button onClick={() => alert('Launching Shapes Tool')}>Start Drawing Shapes</button>
                    </div>
                );
            case 'collage':
                return (
                    <div>
                        <h2>Collage</h2>
                        <p>Combine images, text, and objects into a creative collage.</p>
                        <button onClick={() => alert('Launching Collage Tool')}>Start Collaging</button>
                    </div>
                );
            default:
                return (
                    <div>
                        <h2>Welcome to the Art Studio!</h2>
                        <p>Select a tool from the sidebar to start creating.</p>
                    </div>
                );
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'row', fontFamily: 'Arial, sans-serif', height: '100vh', backgroundColor: '#f4f4f4' }}>
            {/* Sidebar Navigation */}
            <div style={{ width: '250px', backgroundColor: '#fdfdfd', borderRight: '1px solid #ddd', padding: '15px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', flexShrink: 0 }}>
                <h1 style={{ fontSize: '1.8rem', color: '#333', marginBottom: '10px' }}>Art Studio Tools</h1>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {tools.map((tool) => (
                        <li
                            key={tool.id}
                            style={{
                                padding: '10px',
                                margin: '5px 0',
                                cursor: 'pointer',
                                backgroundColor: selectedTool === tool.id ? '#3cb371' : '#e8e8e8',
                                color: selectedTool === tool.id ? 'white' : '#000',
                                fontWeight: selectedTool === tool.id ? 'bold' : 'normal',
                                borderRadius: '5px',
                                textAlign: 'center',
                                transition: 'background-color 0.3s ease, transform 0.2s ease',
                                transform: selectedTool === tool.id ? 'scale(1.05)' : 'scale(1)'
                            }}
                            onClick={() => setSelectedTool(tool.id)}
                        >
                            {tool.name}
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

export default ArtStudioPage;
