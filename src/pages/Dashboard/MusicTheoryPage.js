// Import necessary libraries
import React, { useState } from 'react';
import './MusicTheoryPage.module.css'; // Import corresponding styles

const MusicTheoryPage = () => {
    const [selectedInstrument, setSelectedInstrument] = useState('overview');
    const [aiMusic, setAiMusic] = useState('');

    // Instruments for the Music Page
    const instruments = [
        { id: 'overview', name: 'Overview', description: 'Select an instrument to begin composing music.' },
        { id: 'piano', name: 'Piano', description: 'Compose and play piano melodies.' },
        { id: 'guitar', name: 'Guitar', description: 'Create chord progressions and riffs.' },
        { id: 'drums', name: 'Drums', description: 'Design rhythm patterns and beats.' },
        { id: 'violin', name: 'Violin', description: 'Craft elegant violin pieces and phrases.' },
        { id: 'flute', name: 'Flute', description: 'Compose airy flute melodies.' }
    ];

    // Generate AI-composed music for the selected instrument
    const getAiMusic = async (instrument) => {
        try {
            const response = await fetch("https://api.openai.com/v1/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer YOUR_API_KEY` // Replace with a real API key
                },
                body: JSON.stringify({
                    model: "text-davinci-003",
                    prompt: `Compose a short piece of music for the ${instrument}. Use notes and musical elements suitable for beginners.`,
                    max_tokens: 150
                })
            });

            const data = await response.json();
            setAiMusic(data.choices[0]?.text.trim() || "No music generated.");
        } catch (error) {
            setAiMusic(`Error: ${error.message}`);
        }
    };

    // Function to play a note using the Web Audio API
    const playNote = (note) => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        // Frequency map for basic notes
        const frequencies = {
            C: 261.63,
            D: 293.66,
            E: 329.63,
            F: 349.23,
            G: 392.00,
            A: 440.00,
            B: 493.88,
        };

        oscillator.frequency.value = frequencies[note];
        oscillator.type = "sine";

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.start();
        setTimeout(() => oscillator.stop(), 500); // Play for 500ms
    };

    // Render buttons for musical notes
    const renderNoteButtons = () => {
        const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        return (
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                {notes.map((note) => (
                    <button
                        key={note}
                        style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                        onClick={() => playNote(note)}
                    >
                        {note}
                    </button>
                ))}
            </div>
        );
    };

    const renderContent = () => {
        if (selectedInstrument === 'overview') {
            return (
                <div>
                    <h2>Welcome to Music Composition!</h2>
                    <p>Select an instrument to start creating music.</p>
                </div>
            );
        }

        const instrument = instruments.find((i) => i.id === selectedInstrument);
        return (
            <div>
                <div>
                    <h2>{instrument.name}</h2>
                    <p>{instrument.description}</p>
                    <button
                        onClick={() => getAiMusic(instrument.name.toLowerCase())}
                        style={{ padding: '10px 20px', backgroundColor: '#3cb371', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                    >
                        Generate AI Music
                    </button>
                    <div style={{ marginTop: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
                        <strong>AI-Generated Music:</strong>
                        <pre>{aiMusic}</pre>
                    </div>
                </div>
                {renderNoteButtons()}
            </div>
        );
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'row', fontFamily: 'Arial, sans-serif', height: '100vh', backgroundColor: '#f4f4f4' }}>
            {/* Sidebar Navigation */}
            <div style={{ width: '250px', backgroundColor: '#fdfdfd', borderRight: '1px solid #ddd', padding: '15px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', flexShrink: 0 }}>
                <h1 style={{ fontSize: '1.8rem', color: '#333', marginBottom: '10px' }}>Music Instruments</h1>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {instruments.map((instrument) => (
                        <li
                            key={instrument.id}
                            style={{
                                padding: '10px',
                                margin: '5px 0',
                                cursor: 'pointer',
                                backgroundColor: selectedInstrument === instrument.id ? '#3cb371' : '#e8e8e8',
                                color: selectedInstrument === instrument.id ? 'white' : '#000',
                                fontWeight: selectedInstrument === instrument.id ? 'bold' : 'normal',
                                borderRadius: '5px',
                                textAlign: 'center',
                                transition: 'background-color 0.3s ease, transform 0.2s ease',
                                transform: selectedInstrument === instrument.id ? 'scale(1.05)' : 'scale(1)'
                            }}
                            onClick={() => setSelectedInstrument(instrument.id)}
                        >
                            {instrument.name}
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

export default MusicTheoryPage;
