// Import necessary libraries
import React, { useState, useEffect } from 'react';

const LibraryPage = () => {
    const [library, setLibrary] = useState([]);
    const [selectedStory, setSelectedStory] = useState(null);

    // Load saved stories from localStorage on component mount
    useEffect(() => {
        const storedLibrary = JSON.parse(localStorage.getItem('library')) || [];
        setLibrary(storedLibrary);
    }, []);

    // Handle deleting a specific story
    const deleteStory = (title) => {
        const updatedLibrary = library.filter((story) => story.title !== title);
        setLibrary(updatedLibrary);
        localStorage.setItem('library', JSON.stringify(updatedLibrary));
    };

    // Handle selecting a story to view
    const openStory = (story) => {
        setSelectedStory(story);
    };

    // Handle closing the story view
    const closeStory = () => {
        setSelectedStory(null);
    };

    return (
        <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', backgroundColor: '#f4f4f4', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h1 style={{ fontSize: '2.5rem', color: '#333', marginBottom: '30px', fontWeight: 'bold' }}>Your Library</h1>

            {selectedStory ? (
                <div style={{ width: '100%', maxWidth: '800px', padding: '20px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
                    <h2 style={{ fontSize: '2rem', color: '#003366', marginBottom: '20px', textAlign: 'center' }}>{selectedStory.title}</h2>
                    <p style={{ fontSize: '1.2rem', color: '#555', whiteSpace: 'pre-wrap', textAlign: 'justify' }}>{selectedStory.content}</p>
                    <button
                        onClick={closeStory}
                        style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}
                    >
                        Close
                    </button>
                </div>
            ) : library.length > 0 ? (
                <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', width: '100%', maxWidth: '1200px' }}>
                    {library.map((story, index) => (
                        <div
                            key={index}
                            style={{
                                border: '1px solid #ddd',
                                padding: '20px',
                                borderRadius: '10px',
                                backgroundColor: '#fff',
                                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                textAlign: 'center',
                            }}
                        >
                            <h2 style={{ fontSize: '1.5rem', color: '#003366', marginBottom: '10px', wordBreak: 'break-word' }}>{story.title}</h2>
                            <p style={{ fontSize: '1rem', color: '#555', maxHeight: '150px', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '20px' }}>{story.content}</p>
                            <button
                                onClick={() => openStory(story)}
                                style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '10px' }}
                            >
                                Read More
                            </button>
                            <button
                                onClick={() => deleteStory(story.title)}
                                style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <p style={{ fontSize: '1.5rem', color: '#555', textAlign: 'center' }}>Your library is empty. Save a story to get started!</p>
            )}
        </div>
    );
};

export default LibraryPage;