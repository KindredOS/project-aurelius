// Import necessary libraries
import React from 'react';

const StretchingModal = ({ tool, onClose }) => {
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

    const contentStyle = {
        marginTop: '20px',
        lineHeight: '1.6',
    };

    return (
        <>
            <div style={overlayStyle} onClick={onClose}></div>
            <div style={modalStyle}>
                <button style={closeButtonStyle} onClick={onClose}>Close</button>
                <h2>{tool.name}</h2>
                <p>{tool.description}</p>
                <div style={contentStyle}>
                    <h3>Stretching Guide</h3>
                    <p>Engage in dynamic and static stretches to enhance flexibility and reduce the risk of injuries.</p>
                    <ul>
                        <li>Hamstring Stretch: Hold for 30 seconds</li>
                        <li>Shoulder Roll: 10 rotations forward, 10 backward</li>
                        <li>Quadriceps Stretch: Hold each leg for 30 seconds</li>
                    </ul>
                </div>
            </div>
        </>
    );
};

export default StretchingModal;
