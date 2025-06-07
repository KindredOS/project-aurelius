// Import necessary libraries
import React, { useState, useEffect } from 'react';
import styles from './WorkoutsModal.module.css';

const WorkoutsPage = () => {
    const tool = {
        name: 'Workouts',
        description: 'Plan and track your workouts effectively.',
        routines: [
            {
                name: 'Cardio Routine',
                description: 'A series of cardio exercises to boost your endurance.',
                exercises: [
                    { name: 'Jogging', duration: '15 min' },
                    { name: 'High Knees', duration: '2 min' },
                    { name: 'Jumping Jacks', duration: '3 min' },
                ],
            },
            {
                name: 'Strength Training',
                description: 'Build muscle strength with these exercises.',
                exercises: [
                    { name: 'Push-Ups', sets: 3, reps: 10 },
                    { name: 'Squats', sets: 3, reps: 15 },
                    { name: 'Plank', duration: '1 min' },
                ],
            },
        ],
    };

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
        <div className={styles.page}>
            {/* Page container */}
            <div className={styles.container}>
                <h1>{tool.name}</h1>
                <p>{tool.description}</p>

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
        </div>
    );
};

export default WorkoutsPage;
