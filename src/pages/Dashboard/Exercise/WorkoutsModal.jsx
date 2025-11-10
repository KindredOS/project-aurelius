// Import necessary libraries
import React, { useState, useEffect } from 'react';
import styles from './WorkoutsModal.module.css';

const WorkoutsModal = ({ tool, onClose }) => {
    // State for tracking completed exercises
    const [completed, setCompleted] = useState([]);
    const [selectedRoutine, setSelectedRoutine] = useState(tool.routines ? tool.routines[0] : null);
    const [time, setTime] = useState(null);
    const [activeExercise, setActiveExercise] = useState(null);

    // Effect to handle the timer
    useEffect(() => {
        if (time !== null && time > 0) {
            const timer = setInterval(() => setTime((prev) => prev - 1), 1000);
            return () => clearInterval(timer);
        }
    }, [time]);

    // Toggle completion of an exercise
    const toggleComplete = (index) => {
        setCompleted((prev) =>
            prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
        );
    };

    // Start a timer for an exercise
    const startTimer = (exercise) => {
        if (exercise.duration) {
            const durationInSeconds = parseInt(exercise.duration.split(' ')[0], 10) * 60;
            setTime(durationInSeconds);
            setActiveExercise(exercise.name);
        }
    };

    return (
        <>
            {/* Overlay to capture clicks outside the modal and close it */}
            <div className={styles.overlay} onClick={onClose}></div>

            {/* Modal container */}
            <div className={styles.modal}>
                {/* Close button to dismiss the modal */}
                <button className={styles.closeButton} onClick={onClose}>Close</button>

                {/* Modal title */}
                <h2>{tool.name}</h2>

                {/* Routine selector */}
                {tool.routines && (
                    <div>
                        <h3>Select a Routine</h3>
                        <select
                            className={styles.routineSelector}
                            onChange={(e) =>
                                setSelectedRoutine(
                                    tool.routines.find((routine) => routine.name === e.target.value)
                                )
                            }
                            value={selectedRoutine?.name}
                        >
                            {tool.routines.map((routine, index) => (
                                <option key={index} value={routine.name}>{routine.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Description of the selected routine */}
                {selectedRoutine && (
                    <div>
                        <h3>{selectedRoutine.name}</h3>
                        <p>{selectedRoutine.description}</p>

                        {/* Timer display */}
                        {time !== null && (
                            <div>
                                <h3>Timer</h3>
                                <p>
                                    {activeExercise}: {time > 0 ? `${Math.floor(time / 60)}m ${time % 60}s` : 'Completed!'}
                                </p>
                            </div>
                        )}

                        {/* List of exercises in the routine */}
                        <h3>Exercises</h3>
                        <ul className={styles.exerciseList}>
                            {selectedRoutine.exercises.map((exercise, index) => (
                                <li
                                    key={index}
                                    onClick={() => toggleComplete(index)}
                                    className={`${styles.exerciseItem} ${completed.includes(index) ? styles.completed : ''}`}
                                >
                                    {exercise.name}: {exercise.sets ? `${exercise.sets} sets of ${exercise.reps} reps` : exercise.duration}
                                    {exercise.duration && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                startTimer(exercise);
                                            }}
                                            style={{ marginLeft: '10px' }}
                                        >
                                            Start Timer
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Map placeholder for jogging or running */}
                <div className={styles.map}>Map Feature Coming Soon</div>
            </div>
        </>
    );
};

export default WorkoutsModal;
