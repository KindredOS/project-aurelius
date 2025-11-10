// Import necessary libraries
import React from 'react';

const NutritionModal = ({ tool, onClose }) => {
    const modalStyle = {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '80%',
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        zIndex: 1000,
    };

    const overlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 999,
    };

    const closeButtonStyle = {
        padding: '10px',
        backgroundColor: '#ff4d4d',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        float: 'right',
    };

    const mealPlanStyle = {
        marginTop: '20px',
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '5px',
        backgroundColor: '#f9f9f9',
    };

    return (
        <>
            <div style={overlayStyle} onClick={onClose}></div>
            <div style={modalStyle}>
                <button style={closeButtonStyle} onClick={onClose}>Close</button>
                <h2>{tool.name}</h2>
                <p>{tool.description}</p>
                <h3>Meal Plans</h3>
                <ul style={mealPlanStyle}>
                    {tool.mealPlans.map((meal, index) => (
                        <li key={index}>
                            <strong>{meal.meal}</strong>: {meal.items.join(', ')}
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
};

export default NutritionModal;
