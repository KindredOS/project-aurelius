// Import necessary libraries
import React, { useState } from 'react';
import WorkoutsModal from './Exercise/WorkoutsModal';
import NutritionModal from './Exercise/NutritionModal';
import StretchingModal from './Exercise/StretchingModal';
import TrackingModal from './Exercise/TrackingModal';
import CommunityModal from './Exercise/CommunityModal';
import AchievementsModal from './Exercise/AchievementsModal';

const ExercisePage = () => {
    const tools = [
        { id: 'workouts', name: 'Workouts', status: 'Active', chartData: 'Workouts Chart Data', action: 'Start Workout', description: 'A detailed view of guided workout routines designed for all fitness levels.',
            exercises: [
                { name: 'Push-Ups', sets: 3, reps: 10 },
                { name: 'Squats', sets: 3, reps: 15 },
                { name: 'Plank', duration: '1 min' }
            ]
        },
        { id: 'stretching', name: 'Stretching', status: 'Pending', chartData: 'Stretching Chart Data', action: 'Start Stretching', description: 'Learn stretching exercises to improve your flexibility and prevent injuries.' },
        { id: 'tracking', name: 'Progress Tracking', status: 'Up to Date', chartData: 'Tracking Chart Data', action: 'Track Progress', description: 'Track your workouts, monitor progress, and set fitness goals.' },
        { id: 'nutrition', name: 'Nutrition Tips', status: 'Reviewed', chartData: 'Nutrition Chart Data', action: 'View Tips', description: 'Learn about nutrition and diet plans to complement your exercise routines.',
            mealPlans: [
                { meal: 'Breakfast', items: ['Oatmeal', 'Banana', 'Coffee'] },
                { meal: 'Lunch', items: ['Grilled Chicken Salad', 'Apple'] },
                { meal: 'Dinner', items: ['Salmon', 'Steamed Vegetables', 'Quinoa'] }
            ]
        },
        { id: 'community', name: 'Community', status: 'Active', chartData: 'Community Chart Data', action: 'Join Community', description: 'Connect with others to share your achievements and progress.' },
        { id: 'achievements', name: 'Achievements', status: 'Completed', chartData: 'Achievements Chart Data', action: 'View Achievements', description: 'Earn badges for completing fitness milestones and challenges.' }
    ];

    const [activeTool, setActiveTool] = useState(null);

    const dashboardStyle = {
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Arial, sans-serif',
        padding: '20px',
        background: 'linear-gradient(to right, #f0f9ff, #cbebff)',
        minHeight: '100vh',
    };

    const headerStyle = {
        textAlign: 'center',
        fontSize: '2.5rem',
        marginBottom: '20px',
        color: '#222',
    };

    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px',
        justifyContent: 'center',
    };

    const cardStyle = {
        backgroundColor: 'white',
        borderRadius: '10px',
        padding: '20px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        transition: 'transform 0.3s ease',
        textAlign: 'center',
    };

    const buttonStyle = {
        padding: '10px 20px',
        fontSize: '1rem',
        backgroundColor: '#32cd32',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
    };

    const chartStyle = {
        height: '150px',
        backgroundColor: '#eef2f7',
        borderRadius: '5px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#999',
        marginBottom: '15px',
    };

    return (
        <div style={dashboardStyle}>
            <h1 style={headerStyle}>Exercise and Fitness Dashboard</h1>
            <div style={gridStyle}>
                {tools.map((tool) => (
                    <div
                        key={tool.id}
                        style={cardStyle}
                    >
                        <h2>{tool.name}</h2>
                        <p>Status: {tool.status}</p>
                        <div style={chartStyle}>{tool.chartData}</div>
                        <button
                            style={buttonStyle}
                            onClick={() => setActiveTool(tool)}
                        >
                            {tool.action}
                        </button>
                    </div>
                ))}
            </div>
            {activeTool && activeTool.id === 'workouts' && (
                <WorkoutsModal tool={activeTool} onClose={() => setActiveTool(null)} />
            )}
            {activeTool && activeTool.id === 'nutrition' && (
                <NutritionModal tool={activeTool} onClose={() => setActiveTool(null)} />
            )}
            {activeTool && activeTool.id === 'stretching' && (
                <StretchingModal tool={activeTool} onClose={() => setActiveTool(null)} />
            )}
            {activeTool && activeTool.id === 'tracking' && (
                <TrackingModal tool={activeTool} onClose={() => setActiveTool(null)} />
            )}
            {activeTool && activeTool.id === 'community' && (
                <CommunityModal tool={activeTool} onClose={() => setActiveTool(null)} />
            )}
            {activeTool && activeTool.id === 'achievements' && (
                <AchievementsModal tool={activeTool} onClose={() => setActiveTool(null)} />
            )}
        </div>
    );
};

export default ExercisePage;
