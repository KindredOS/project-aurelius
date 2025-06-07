// Import necessary libraries
import React, { useState } from 'react';

const EngineeringPage = () => {
    const [workspaceComponents, setWorkspaceComponents] = useState([]);
    const [simulationData, setSimulationData] = useState({ voltage: 0, current: 0 });
    const [draggedComponent, setDraggedComponent] = useState(null);

    const components = [
        { id: 'battery', name: 'Battery', description: 'Provides power for the circuit.', shape: 'circle' },
        { id: 'motor', name: 'Motor', description: 'Converts electrical energy into mechanical energy.', shape: 'square' },
        { id: 'led', name: 'LED', description: 'Lights up when powered.', shape: 'triangle' },
        { id: 'resistor', name: 'Resistor', description: 'Controls current flow.', shape: 'rectangle' },
        { id: 'switch', name: 'Switch', description: 'Connects and disconnects circuits.', shape: 'hexagon' }
    ];

    const addComponentToWorkspace = (component) => {
        setWorkspaceComponents((prev) => [...prev, { ...component, id: Date.now(), x: 100, y: 100 }]);
    };

    const handleMouseDown = (e, id) => {
        setDraggedComponent(id);
    };

    const handleMouseMove = (e) => {
        if (draggedComponent !== null) {
            const workspaceRect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - workspaceRect.left;
            const y = e.clientY - workspaceRect.top;

            setWorkspaceComponents((prev) =>
                prev.map((comp) =>
                    comp.id === draggedComponent ? { ...comp, x: Math.max(0, Math.min(x - 25, workspaceRect.width - 50)), y: Math.max(0, Math.min(y - 25, workspaceRect.height - 50)) } : comp
                )
            );
        }
    };

    const handleMouseUp = () => {
        setDraggedComponent(null);
    };

    const simulate = () => {
        const hasBattery = workspaceComponents.some((comp) => comp.name === 'Battery');
        const hasMotor = workspaceComponents.some((comp) => comp.name === 'Motor');

        if (hasBattery && hasMotor) {
            setSimulationData({ voltage: 12, current: 1.5 });
        } else {
            setSimulationData({ voltage: 0, current: 0 });
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ width: '250px', padding: '20px', borderRight: '1px solid #ddd', backgroundColor: '#fff' }}>
                <h1 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>Components</h1>
                <div>
                    {components.map((component) => (
                        <div
                            key={component.id}
                            style={{
                                border: '1px solid #ddd',
                                padding: '10px',
                                marginBottom: '10px',
                                cursor: 'pointer',
                                backgroundColor: '#f4f4f4',
                                textAlign: 'center',
                                borderRadius: '5px'
                            }}
                            onClick={() => addComponentToWorkspace(component)}
                        >
                            {component.name}
                        </div>
                    ))}
                </div>
            </div>

            <div
                style={{ flex: 1, padding: '20px', position: 'relative', backgroundColor: '#f9f9f9' }}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
            >
                <h2>Workspace</h2>
                <div
                    style={{
                        width: '100%',
                        height: '80%',
                        border: '1px solid #ccc',
                        backgroundColor: '#fff',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {workspaceComponents.map((comp) => (
                        <div
                            key={comp.id}
                            onMouseDown={(e) => handleMouseDown(e, comp.id)}
                            style={{
                                position: 'absolute',
                                left: `${comp.x}px`,
                                top: `${comp.y}px`,
                                width: '50px',
                                height: '50px',
                                backgroundColor: comp.shape === 'circle' ? '#007bff' : '#ccc',
                                borderRadius: comp.shape === 'circle' ? '50%' : '0',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                cursor: 'grab'
                            }}
                        >
                            {comp.name}
                        </div>
                    ))}
                </div>
                <button
                    onClick={simulate}
                    style={{ marginTop: '20px', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px' }}
                >
                    Run Simulation
                </button>
                <div style={{ marginTop: '10px' }}>
                    <p>Voltage: {simulationData.voltage} V</p>
                    <p>Current: {simulationData.current} A</p>
                </div>
            </div>
        </div>
    );
};

export default EngineeringPage;
