// Import necessary libraries
import React, { useState } from 'react';
import './AstronomyPage.module.css'; // Import corresponding styles

const AstronomyPage = () => {
    const [selectedTool, setSelectedTool] = useState('overview');

    // Tools and Features for the Astronomy Page
    const tools = [
        { id: 'overview', name: 'Overview', description: 'Explore the wonders of the universe.' },
        { id: 'starmap', name: 'Star Map', description: 'View and navigate constellations and stars.' },
        { id: 'solarsystem', name: 'Solar System', description: 'Learn about planets and their orbits.' },
        { id: 'telescopes', name: 'Telescopes', description: 'Discover how telescopes work and explore imagery.' },
        { id: 'spacetimeline', name: 'Space Timeline', description: 'Trace the history of space exploration.' }
    ];

    // Function to render content based on selected tool
    const renderContent = () => {
        switch (selectedTool) {
            case 'starmap':
                return (
                    <div>
                        <h2>Star Map</h2>
                        <p>Explore constellations and navigate the night sky.</p>
                        <button onClick={() => alert('Launching Star Map Tool')}>View Star Map</button>
                    </div>
                );
            case 'solarsystem':
                return (
                    <div>
                        <h2>Solar System</h2>
                        <p>Learn about the planets, their orbits, and unique characteristics.</p>
                        <button onClick={() => alert('Launching Solar System Explorer')}>Explore Solar System</button>
                    </div>
                );
            case 'telescopes':
                return (
                    <div>
                        <h2>Telescopes</h2>
                        <p>Understand how telescopes work and view astronomical images.</p>
                        <button onClick={() => alert('Launching Telescope Viewer')}>Explore Telescopes</button>
                    </div>
                );
            case 'spacetimeline':
                return (
                    <div>
                        <h2>Space Timeline</h2>
                        <p>Trace humanity’s journey into space and major milestones.</p>
                        <button onClick={() => alert('Launching Space Timeline Tool')}>View Timeline</button>
                    </div>
                );
            default:
                return (
                    <div>
                        <h2>Welcome to Astronomy!</h2>
                        <p>Select a tool from the sidebar to explore the universe.</p>
                    </div>
                );
        }
    };

    return (
        <div className="astronomy-page-container">
            <h1 className="astronomy-header">Astronomy Learning Center</h1>

            {/* Sidebar Navigation */}
            <div className="sidebar">
                <h2>Tools</h2>
                <ul className="tool-list">
                    {tools.map((tool) => (
                        <li
                            key={tool.id}
                            className={selectedTool === tool.id ? 'active' : ''}
                            onClick={() => setSelectedTool(tool.id)}
                        >
                            {tool.name}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Main Content Area */}
            <div className="content">
                {renderContent()}
            </div>
        </div>
    );
};

export default AstronomyPage;
