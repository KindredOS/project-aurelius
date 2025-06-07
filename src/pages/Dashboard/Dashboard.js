import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css'; // Import corresponding styles

function StudyBuddyDashboard() {
    const navigate = useNavigate();

    // Define tiles and their navigation targets
    const tiles = [
        { id: 1, name: "Math Dashboard", route: "/page/Dashboard/MathDashboard", image: "calculator.jpeg" },
        { id: 2, name: "Science", route: "/page/Dashboard/sciencePage", image: "science.jpeg" },
        { id: 3, name: "Coding", route: "/page/Dashboard/codingPage", image: "coding.jpeg" },
        { id: 4, name: "Art Studio", route: "/page/Dashboard/artStudioPage", image: "artstudio.jpeg" },
        { id: 5, name: "Engineering", route: "/page/Dashboard/engineeringPage", image: "engineering.jpeg" },
        { id: 6, name: "Music Theory", route: "/page/Dashboard/musicTheoryPage", image: "music.jpeg" },
        { id: 7, name: "Robotics", route: "/page/Dashboard/roboticsPage", image: "robotics.jpeg" },
        { id: 8, name: "3D Design", route: "/page/Dashboard/design3DPage", image: "design3d.jpeg" },
        { id: 9, name: "Astronomy", route: "/page/Dashboard/astronomyPage", image: "astronomy.jpeg" },
        { id: 10, name: "History", route: "/page/Dashboard/historyPage", image: "history.jpeg" },
        { id: 11, name: "Story Book", route: "/page/Dashboard/storyBookPage", image: "storybook.jpeg" },
        { id: 12, name: "Language Teacher", route: "/page/Dashboard/languageTeacherPage", image: "language.jpeg" },
        { id: 13, name: "Exercise", route: "/page/Dashboard/exercisePage", image: "exercise.jpeg" },
        { id: 14, name: "Food Prep", route: "/page/Dashboard/foodPrepPage", image: "foodprep.jpeg" },
        { id: 15, name: "Financial Calculator", route: "/page/Dashboard/financialCalculatorPage", image: "financial.jpeg" }
    ];

    return (
        <div className={styles.dashboardContainer}>
            <h1 className={styles.dashboardHeader}>Study Buddy Dashboard</h1>

            {/* Tiles Section */}
            <div className={styles.tilesContainer} style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px' }}>
                {tiles.map((tile) => (
                    <div
                        key={tile.id}
                        className={styles.tile}
                        onClick={() => navigate(tile.route)}
                    >
                        <img
                            src={require(`../../assets/images/${tile.image}`)}
                            alt={tile.name}
                            className={styles.tileImage}
                        />
                        <h3 className={styles.tileName}>{tile.name}</h3>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default StudyBuddyDashboard;
