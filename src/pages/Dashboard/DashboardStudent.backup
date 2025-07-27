import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './DashboardStudent.module.css'; // Import corresponding styles

function StudyBuddyDashboard() {
    const navigate = useNavigate();

    // Grouped tiles by STEAM-L categories
    const categories = [
        {
            header: "Science",
            tiles: [
                { id: 1, name: "LabMate", route: "/page/Dashboard/student/ScienceDash", image: "science.jpeg" },
            ]
        },
        {
            header: "Technology",
            tiles: [
                { id: 3, name: "CodeBuddy", route: "/page/Dashboard/student/TechnologyDash", image: "coding.jpeg" },
            ]
        },
        {
            header: "Engineering",
            tiles: [
                { id: 6, name: "Enginuity", route: "/page/Dashboard/student/EngineeringDash", image: "engineering.jpeg" }
            ]
        },
        {
            header: "Arts",
            tiles: [
                { id: 10, name: "CivicSpark", route: "/page/Dashboard/student/ArtsDash", image: "history.jpeg" },
            ]
        },
        {
            header: "Math",
            tiles: [
                { id: 12, name: "MathSnap", route: "/page/Dashboard/student/MathDash", image: "calculator.jpeg" },
            ]
        },
        {
            header: "Lifestyle",
            tiles: [
                { id: 14, name: "MyBestMe", route: "/page/Dashboard/student/LifestyleDash", image: "exercise.jpeg" },
            ]
        }
    ];

    return (
        <div className={styles.dashboardContainer}>
            <h1 className={styles.dashboardHeader}>Study Buddy Dashboard</h1>
            <div className={styles.categoriesGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '20px' }}>
                {categories.map((category) => (
                    <div key={category.header}>
                        <h2 className={styles.categoryHeader} style={{ textAlign: 'center' }}>{category.header}</h2>
                        <div className={styles.tilesContainer} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {category.tiles.map((tile) => (
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
                ))}
            </div>
        </div>
    );
}

export default StudyBuddyDashboard;
