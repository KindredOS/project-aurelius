import React, { useState, useRef, useEffect } from 'react';
import { Box, Palette, Eye, Play, RotateCcw, Lightbulb, Star, Award } from 'lucide-react';
import styles from './Design3DPage.module.css';

const Design3DPage = () => {
    const [currentLesson, setCurrentLesson] = useState('shapes');
    const [completedLessons, setCompletedLessons] = useState(new Set());
    const [currentShape, setCurrentShape] = useState('cube');
    const [shapeColor, setShapeColor] = useState('#4299e1');
    const [rotationX, setRotationX] = useState(0);
    const [rotationY, setRotationY] = useState(0);
    const [animationSpeed, setAnimationSpeed] = useState(1);
    const [isAnimating, setIsAnimating] = useState(false);
    const animationRef = useRef();

    const lessons = [
        { 
            id: 'shapes', 
            name: '3D Shapes', 
            icon: Box, 
            description: 'Build and explore basic 3D shapes',
            difficulty: 'Beginner'
        },
        { 
            id: 'colors', 
            name: 'Colors & Materials', 
            icon: Palette, 
            description: 'Paint and texture your creations',
            difficulty: 'Beginner'
        },
        { 
            id: 'movement', 
            name: 'Animation Basics', 
            icon: Play, 
            description: 'Make your shapes move and spin',
            difficulty: 'Intermediate'
        },
        { 
            id: 'lighting', 
            name: 'Lights & Shadows', 
            icon: Lightbulb, 
            description: 'Add dramatic lighting effects',
            difficulty: 'Intermediate'
        },
        { 
            id: 'scenes', 
            name: 'Build Scenes', 
            icon: Eye, 
            description: 'Create complete 3D worlds',
            difficulty: 'Advanced'
        }
    ];

    const shapes3D = [
        { id: 'cube', name: 'Cube', faces: '6 faces' },
        { id: 'sphere', name: 'Sphere', faces: 'Smooth surface' },
        { id: 'cylinder', name: 'Cylinder', faces: '3 surfaces' },
        { id: 'pyramid', name: 'Pyramid', faces: '5 faces' },
        { id: 'cone', name: 'Cone', faces: '2 surfaces' }
    ];

    const colorPalette = [
        '#4299e1', '#48bb78', '#ed8936', '#9f7aea', 
        '#f56565', '#38b2ac', '#ed64a6', '#ecc94b'
    ];

    // Animation loop
    useEffect(() => {
        if (isAnimating) {
            const animate = () => {
                setRotationY(prev => (prev + animationSpeed) % 360);
                animationRef.current = requestAnimationFrame(animate);
            };
            animationRef.current = requestAnimationFrame(animate);
        } else {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        }
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isAnimating, animationSpeed]);

    const completeLesson = () => {
        setCompletedLessons(prev => new Set([...prev, currentLesson]));
    };

    const resetShape = () => {
        setRotationX(0);
        setRotationY(0);
        setIsAnimating(false);
        setShapeColor('#4299e1');
        setCurrentShape('cube');
    };

    const getShapeStyle = () => ({
        width: '200px',
        height: '200px',
        backgroundColor: shapeColor,
        transform: `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`,
        borderRadius: currentShape === 'sphere' ? '50%' : 
                    currentShape === 'cylinder' ? '50px' : '8px',
        clipPath: currentShape === 'pyramid' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' :
                 currentShape === 'cone' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'none',
    });

    const renderLessonContent = () => {
        switch (currentLesson) {
            case 'shapes':
                return (
                    <div className={styles['lesson-content']}>
                        <div className="lesson-header">
                            <h2>🎲 3D Shapes Explorer</h2>
                            <p>Click on different shapes to see how they look in 3D!</p>
                        </div>
                        
                        <div className={styles['interactive-area']}>
                            <div className="shape-selector">
                                <h3>Choose a Shape:</h3>
                                <div className={styles['shape-selector-grid']}>
                                    {shapes3D.map(shape => (
                                        <button
                                            key={shape.id}
                                            onClick={() => setCurrentShape(shape.id)}
                                            className={`${styles['shape-button']} ${
                                                currentShape === shape.id ? styles.active : ''
                                            }`}
                                        >
                                            <div className="font-semibold">{shape.name}</div>
                                            <div className="text-sm text-gray-500">{shape.faces}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="shape-viewer">
                                <div className={styles['shape-viewer-container']}>
                                    <div 
                                        className={styles['shape-3d']}
                                        style={getShapeStyle()}
                                    />
                                </div>
                                
                                <div className={styles['controls-grid']}>
                                    <div className={styles['control-group']}>
                                        <label className={styles['control-label']}>Rotate X: {rotationX}°</label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="360"
                                            value={rotationX}
                                            onChange={(e) => setRotationX(e.target.value)}
                                            className={styles['range-slider']}
                                        />
                                    </div>
                                    <div className={styles['control-group']}>
                                        <label className={styles['control-label']}>Rotate Y: {rotationY}°</label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="360"
                                            value={rotationY}
                                            onChange={(e) => setRotationY(e.target.value)}
                                            className={styles['range-slider']}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lesson-actions">
                            <button
                                onClick={completeLesson}
                                className={`${styles['action-button']} ${styles.primary}`}
                            >
                                ✅ I understand 3D shapes!
                            </button>
                            <button
                                onClick={resetShape}
                                className={`${styles['action-button']} ${styles.secondary}`}
                            >
                                🔄 Reset
                            </button>
                        </div>
                    </div>
                );

            case 'colors':
                return (
                    <div className={styles['lesson-content']}>
                        <div className="lesson-header">
                            <h2>🎨 Color & Design Studio</h2>
                            <p>Pick colors and see how they change your 3D shape!</p>
                        </div>

                        <div className={styles['interactive-area']}>
                            <div className="color-picker">
                                <h3>Choose Your Color:</h3>
                                <div className={styles['color-palette-grid']}>
                                    {colorPalette.map(color => (
                                        <button
                                            key={color}
                                            onClick={() => setShapeColor(color)}
                                            className={`${styles['color-button']} ${
                                                shapeColor === color ? styles.active : ''
                                            }`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="shape-viewer">
                                <div className={styles['shape-viewer-container']}>
                                    <div 
                                        className={styles['shape-3d']}
                                        style={getShapeStyle()}
                                    />
                                </div>
                            </div>

                            <div className={styles['info-box']}>
                                <h4>Color Code: {shapeColor}</h4>
                                <p>Colors in 3D design use special codes called hex colors. Try different combinations!</p>
                            </div>
                        </div>

                        <div className="lesson-actions">
                            <button
                                onClick={completeLesson}
                                className={`${styles['action-button']} ${styles.primary}`}
                            >
                                🎯 I'm a color expert!
                            </button>
                        </div>
                    </div>
                );

            case 'movement':
                return (
                    <div className={styles['lesson-content']}>
                        <div className="lesson-header">
                            <h2>⚡ Animation Lab</h2>
                            <p>Make your shapes come alive with movement!</p>
                        </div>

                        <div className={styles['interactive-area']}>
                            <div className={styles['animation-controls']}>
                                <button
                                    onClick={() => setIsAnimating(!isAnimating)}
                                    className={`${styles['animation-button']} ${
                                        isAnimating ? styles.stop : styles.play
                                    }`}
                                >
                                    {isAnimating ? '⏸️ Stop Animation' : '▶️ Start Animation'}
                                </button>
                                <div className={styles['control-group']}>
                                    <label className={styles['control-label']}>Speed: {animationSpeed}x</label>
                                    <input
                                        type="range"
                                        min="0.5"
                                        max="5"
                                        step="0.5"
                                        value={animationSpeed}
                                        onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
                                        className={styles['range-slider']}
                                    />
                                </div>
                            </div>

                            <div className="shape-viewer">
                                <div className={styles['shape-viewer-container']}>
                                    <div 
                                        className={styles['shape-3d']}
                                        style={getShapeStyle()}
                                    />
                                </div>
                            </div>

                            <div className={styles['info-box']}>
                                <h4>🎬 Animation Basics</h4>
                                <p>Animation makes objects move by changing their position many times per second. Try different speeds!</p>
                            </div>
                        </div>

                        <div className="lesson-actions">
                            <button
                                onClick={completeLesson}
                                className={`${styles['action-button']} ${styles.primary}`}
                            >
                                🎬 I can animate!
                            </button>
                        </div>
                    </div>
                );

            default:
                return (
                    <div className={styles['lesson-content']}>
                        <div className="welcome-section">
                            <h1 className={styles['design3d-title']}>🚀 Welcome to 3D Design!</h1>
                            <p>Ready to become a 3D artist? Let's start with the basics!</p>
                            
                            <div className={styles['welcome-grid']}>
                                <div className={`${styles['welcome-card']} bg-blue-50 border-blue-200`}>
                                    <div className="text-4xl mb-3">🎲</div>
                                    <h3 className="text-lg font-semibold text-blue-800 mb-2">Learn 3D Shapes</h3>
                                    <p className="text-blue-600">Discover cubes, spheres, and more!</p>
                                </div>
                                <div className={`${styles['welcome-card']} bg-purple-50 border-purple-200`}>
                                    <div className="text-4xl mb-3">🎨</div>
                                    <h3 className="text-lg font-semibold text-purple-800 mb-2">Add Colors</h3>
                                    <p className="text-purple-600">Paint your creations with amazing colors!</p>
                                </div>
                                <div className={`${styles['welcome-card']} bg-green-50 border-green-200`}>
                                    <div className="text-4xl mb-3">⚡</div>
                                    <h3 className="text-lg font-semibold text-green-800 mb-2">Make it Move</h3>
                                    <p className="text-green-600">Bring your designs to life with animation!</p>
                                </div>
                                <div className={`${styles['welcome-card']} bg-yellow-50 border-yellow-200`}>
                                    <div className="text-4xl mb-3">🌟</div>
                                    <h3 className="text-lg font-semibold text-yellow-800 mb-2">Build Worlds</h3>
                                    <p className="text-yellow-600">Create complete 3D scenes and environments!</p>
                                </div>
                            </div>

                            <div className="mt-8">
                                <button
                                    onClick={() => setCurrentLesson('shapes')}
                                    className={`${styles['action-button']} ${styles.primary} ${styles.large}`}
                                >
                                    🚀 Start Learning!
                                </button>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className={styles['design3d-container']}>
            {/* Header */}
            <div className={styles['design3d-header']}>
                <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
                    <h1 className={styles['design3d-title']}>🎨 Kids 3D Design Studio</h1>
                    <div className="flex items-center space-x-4">
                        <div className={`${styles['progress-indicator']} flex items-center text-sm text-gray-600`}>
                            <Award className="w-4 h-4 mr-1" />
                            Lessons Complete: {completedLessons.size}/{lessons.length}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className={styles['learning-sidebar']}>
                            <h2 className="text-xl font-bold text-gray-800 mb-4 p-6 pb-0">🎯 Learning Path</h2>
                            <div className="space-y-3 p-6 pt-0">
                                {lessons.map((lesson) => {
                                    const IconComponent = lesson.icon;
                                    const isCompleted = completedLessons.has(lesson.id);
                                    const isActive = currentLesson === lesson.id;
                                    
                                    return (
                                        <button
                                            key={lesson.id}
                                            onClick={() => setCurrentLesson(lesson.id)}
                                            className={`${styles['lesson-button']} ${
                                                isActive ? styles.active : 
                                                isCompleted ? styles.completed : ''
                                            }`}
                                        >
                                            <div className="flex items-center mb-2">
                                                <IconComponent className="w-5 h-5 mr-2" />
                                                <span className="font-semibold">
                                                    {lesson.name}
                                                    {isCompleted && <span className="ml-2">✅</span>}
                                                </span>
                                            </div>
                                            <p className="text-sm mb-1">{lesson.description}</p>
                                            <span className={`text-xs px-2 py-1 rounded-full ${
                                                lesson.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                                                lesson.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {lesson.difficulty}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <div className={styles['main-content']}>
                            <div className="p-8">
                                {renderLessonContent()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Design3DPage;