import React, { useState } from 'react';
import { Play, RotateCcw, Lightbulb, Zap, Eye, Cog, Award, HelpCircle } from 'lucide-react';
import styles from './RoboticsPage.module.css';

const KidsRoboticsLearning = () => {
    const [currentLesson, setCurrentLesson] = useState(0);
    const [workspaceComponents, setWorkspaceComponents] = useState([]);
    const [simulationActive, setSimulationActive] = useState(false);
    const [robotState, setRobotState] = useState({ moving: false, ledOn: false, sensing: false });
    const [completedLessons, setCompletedLessons] = useState(new Set());
    const [draggedComponent, setDraggedComponent] = useState(null);
    const [showHint, setShowHint] = useState(false);

    const lessons = [
        {
            id: 0,
            title: "🤖 Meet Your Robot Brain",
            description: "Every robot needs a brain to think! The microcontroller is like the robot's brain.",
            objective: "Drag the Brain (Microcontroller) to your workspace",
            requiredComponents: ['brain'],
            explanation: "Just like you use your brain to think and make decisions, robots use microcontrollers!",
            funFact: "The first microcontroller was invented in 1971 and was as big as a book!"
        },
        {
            id: 1,
            title: "👀 Give Your Robot Eyes",
            description: "Robots need sensors to see and feel the world around them.",
            objective: "Add the Brain AND Eyes (Sensor) to make your robot aware",
            requiredComponents: ['brain', 'eyes'],
            explanation: "Sensors are like robot senses - they can detect light, sound, distance, and more!",
            funFact: "Some robots can see colors that humans can't even see!"
        },
        {
            id: 2,
            title: "💪 Add Robot Muscles",
            description: "Motors are like robot muscles - they make things move!",
            objective: "Build a complete robot with Brain, Eyes, and Muscles",
            requiredComponents: ['brain', 'eyes', 'muscles'],
            explanation: "Motors can spin wheels, move robot arms, or even make robots dance!",
            funFact: "The strongest robot can lift 500 pounds - that's like lifting a piano!"
        },
        {
            id: 3,
            title: "🚗 Make It Move",
            description: "Wheels let robots explore and move around their world.",
            objective: "Create a mobile robot with all components including Wheels",
            requiredComponents: ['brain', 'eyes', 'muscles', 'wheels'],
            explanation: "Different wheel designs help robots move on different surfaces!",
            funFact: "Mars rovers have 6 wheels each to help them drive on rocky Martian soil!"
        }
    ];

    const components = [
        { 
            id: 'brain', 
            name: 'Brain', 
            icon: '🧠', 
            description: 'The microcontroller - robot\'s thinking center',
            color: '#FF6B6B',
            shape: styles.roundedLg
        },
        { 
            id: 'eyes', 
            name: 'Eyes', 
            icon: '👁️', 
            description: 'Sensors that detect the environment',
            color: '#4ECDC4',
            shape: styles.roundedFull
        },
        { 
            id: 'muscles', 
            name: 'Muscles', 
            icon: '💪', 
            description: 'Motors that make things move',
            color: '#45B7D1',
            shape: styles.roundedMd
        },
        { 
            id: 'wheels', 
            name: 'Wheels', 
            icon: '⚙️', 
            description: 'Let the robot move around',
            color: '#96CEB4',
            shape: styles.roundedFull
        }
    ];

    const addComponentToWorkspace = (component) => {
        const newComponent = {
            ...component,
            uniqueId: Date.now() + Math.random(),
            x: Math.random() * 200 + 50,
            y: Math.random() * 200 + 50
        };
        setWorkspaceComponents(prev => [...prev, newComponent]);
    };

    const checkLessonCompletion = () => {
        const currentLessonData = lessons[currentLesson];
        const componentTypes = workspaceComponents.map(comp => comp.id);
        const hasRequired = currentLessonData.requiredComponents.every(req => 
            componentTypes.includes(req)
        );
        
        if (hasRequired && !completedLessons.has(currentLesson)) {
            setCompletedLessons(prev => new Set([...prev, currentLesson]));
            return true;
        }
        return false;
    };

    const runSimulation = () => {
        if (checkLessonCompletion()) {
            setSimulationActive(true);
            
            // Animate robot based on components
            const hasMotor = workspaceComponents.some(comp => comp.id === 'muscles');
            const hasSensor = workspaceComponents.some(comp => comp.id === 'eyes');
            const hasWheels = workspaceComponents.some(comp => comp.id === 'wheels');
            
            setRobotState({
                moving: hasMotor && hasWheels,
                ledOn: workspaceComponents.length > 0,
                sensing: hasSensor
            });
            
            setTimeout(() => {
                setSimulationActive(false);
                setRobotState({ moving: false, ledOn: false, sensing: false });
            }, 3000);
        }
    };

    const resetWorkspace = () => {
        setWorkspaceComponents([]);
        setSimulationActive(false);
        setRobotState({ moving: false, ledOn: false, sensing: false });
    };

    const handleMouseDown = (e, uniqueId) => {
        setDraggedComponent(uniqueId);
    };

    const handleMouseMove = (e) => {
        if (draggedComponent !== null) {
            const workspaceRect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - workspaceRect.left;
            const y = e.clientY - workspaceRect.top;

            setWorkspaceComponents(prev =>
                prev.map(comp =>
                    comp.uniqueId === draggedComponent 
                        ? { ...comp, x: Math.max(0, Math.min(x - 40, workspaceRect.width - 80)), y: Math.max(0, Math.min(y - 40, workspaceRect.height - 80)) }
                        : comp
                )
            );
        }
    };

    const handleMouseUp = () => {
        setDraggedComponent(null);
    };

    const currentLessonData = lessons[currentLesson];
    const isLessonComplete = completedLessons.has(currentLesson);

    return (
        <div className={styles.container}>
            <div className={styles.maxWidth}>
                {/* Header */}
                <div className={styles.header}>
                    <h1 className={styles.headerTitle}>🤖 Robot Builder Academy</h1>
                    <p className={styles.headerSubtitle}>Learn robotics by building and experimenting!</p>
                </div>

                {/* Progress Bar */}
                <div className={styles.progressCard}>
                    <div className={styles.progressHeader}>
                        <span className={styles.progressLabel}>Progress</span>
                        <span className={styles.progressCount}>{completedLessons.size}/{lessons.length} lessons completed</span>
                    </div>
                    <div className={styles.progressBarContainer}>
                        <div 
                            className={styles.progressBar}
                            style={{ width: `${(completedLessons.size / lessons.length) * 100}%` }}
                        ></div>
                    </div>
                </div>

                <div className={styles.gridContainer}>
                    {/* Lesson Panel */}
                    <div className={styles.lessonPanel}>
                        <div className={styles.lessonHeader}>
                            <h2 className={styles.lessonTitle}>Lessons</h2>
                            <button
                                onClick={() => setShowHint(!showHint)}
                                className={styles.hintButton}
                            >
                                <HelpCircle size={20} />
                            </button>
                        </div>
                        
                        <div className={styles.lessonList}>
                            {lessons.map((lesson, index) => (
                                <button
                                    key={lesson.id}
                                    onClick={() => setCurrentLesson(index)}
                                    className={`${styles.lessonItem} ${
                                        currentLesson === index ? styles.lessonItemActive : ''
                                    }`}
                                >
                                    <div className={styles.lessonItemHeader}>
                                        <span className={styles.lessonItemTitle}>{lesson.title}</span>
                                        {completedLessons.has(index) && (
                                            <Award className={styles.completedIcon} size={16} />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Current Lesson Info */}
                        <div className={styles.currentLessonCard}>
                            <h3 className={styles.currentLessonTitle}>{currentLessonData.title}</h3>
                            <p className={styles.currentLessonDescription}>{currentLessonData.description}</p>
                            <div className={styles.goalCard}>
                                <div className={styles.goalHeader}>
                                    <Lightbulb className={styles.goalIcon} size={16} />
                                    <span className={styles.goalLabel}>Goal:</span>
                                </div>
                                <p className={styles.goalText}>{currentLessonData.objective}</p>
                            </div>
                            {showHint && (
                                <div className={styles.hintCard}>
                                    <p className={styles.hintText}>{currentLessonData.explanation}</p>
                                    <p className={styles.funFact}>{currentLessonData.funFact}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Component Toolbox */}
                    <div className={styles.toolbox}>
                        <h2 className={styles.toolboxTitle}>🧰 Robot Parts</h2>
                        <div className={styles.componentList}>
                            {components.map(component => (
                                <div
                                    key={component.id}
                                    onClick={() => addComponentToWorkspace(component)}
                                    className={styles.componentItem}
                                >
                                    <span className={styles.componentIcon}>{component.icon}</span>
                                    <div className={styles.componentName}>{component.name}</div>
                                    <div className={styles.componentDescription}>{component.description}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Workspace */}
                    <div className={styles.workspace}>
                        <div className={styles.workspaceHeader}>
                            <h2 className={styles.workspaceTitle}>🔧 Build Your Robot</h2>
                            <div className={styles.workspaceControls}>
                                <button
                                    onClick={resetWorkspace}
                                    className={styles.resetButton}
                                >
                                    <RotateCcw size={16} />
                                    Reset
                                </button>
                                <button
                                    onClick={runSimulation}
                                    disabled={simulationActive}
                                    className={styles.simulateButton}
                                >
                                    <Play size={16} />
                                    {simulationActive ? 'Running...' : 'Test Robot'}
                                </button>
                            </div>
                        </div>

                        <div
                            className={styles.buildArea}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                        >
                            {workspaceComponents.length === 0 && (
                                <div className={styles.emptyState}>
                                    <div>
                                        <span className={styles.emptyStateIcon}>🎯</span>
                                        <p>Drag robot parts here to start building!</p>
                                    </div>
                                </div>
                            )}

                            {workspaceComponents.map(comp => (
                                <div
                                    key={comp.uniqueId}
                                    onMouseDown={(e) => handleMouseDown(e, comp.uniqueId)}
                                    className={`${styles.robotComponent} ${
                                        simulationActive ? styles.pulsing : ''
                                    } ${
                                        robotState.moving && comp.id === 'wheels' ? styles.spinning : ''
                                    }`}
                                    style={{
                                        left: `${comp.x}px`,
                                        top: `${comp.y}px`,
                                        backgroundColor: comp.color,
                                        borderRadius: comp.shape === styles.roundedFull ? '50%' : 
                                                     comp.shape === styles.roundedLg ? '0.75rem' : 
                                                     comp.shape === styles.roundedMd ? '0.5rem' : '0.375rem'
                                    }}
                                >
                                    <span className={styles.componentIcon}>{comp.icon}</span>
                                    <span>{comp.name}</span>
                                </div>
                            ))}

                            {/* Completion Celebration */}
                            {isLessonComplete && (
                                <div className={styles.completionBadge}>
                                    <Award size={16} />
                                    Lesson Complete!
                                </div>
                            )}
                        </div>

                        {/* Robot Status */}
                        <div className={styles.statusGrid}>
                            <div className={`${styles.statusCard} ${styles.statusCardPower} ${
                                robotState.ledOn ? styles.statusCardActive : styles.statusCardInactive
                            }`}>
                                <Zap className={styles.statusIcon} size={20} />
                                <span className={styles.statusLabel}>Power</span>
                                <span className={styles.statusValue}>{robotState.ledOn ? 'ON' : 'OFF'}</span>
                            </div>
                            <div className={`${styles.statusCard} ${styles.statusCardSensing} ${
                                robotState.sensing ? styles.statusCardActive : styles.statusCardInactive
                            }`}>
                                <Eye className={styles.statusIcon} size={20} />
                                <span className={styles.statusLabel}>Sensing</span>
                                <span className={styles.statusValue}>{robotState.sensing ? 'Active' : 'Inactive'}</span>
                            </div>
                            <div className={`${styles.statusCard} ${styles.statusCardMovement} ${
                                robotState.moving ? styles.statusCardActive : styles.statusCardInactive
                            }`}>
                                <Cog className={styles.statusIcon} size={20} />
                                <span className={styles.statusLabel}>Movement</span>
                                <span className={styles.statusValue}>{robotState.moving ? 'Moving' : 'Stopped'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KidsRoboticsLearning;