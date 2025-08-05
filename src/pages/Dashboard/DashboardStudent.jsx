import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './DashboardStudent.module.css';
import MBTISetupModal from '../../components/student/MBTISetupModal';
import { fetchUserMBTI } from '../../api/User';

function StudyBuddyDashboard() {
    const navigate = useNavigate();
    
    // Memoize the user object so it only changes when localStorage values actually change
    const user = useMemo(() => ({
        email: localStorage.getItem('userEmail'),
        name: localStorage.getItem('userName'),
    }), []); // Empty dependency array since localStorage is external

    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const checkMBTIStatus = async () => {
            if (user && user.email) {
                console.log("Checking MBTI for:", user.email);
                try {
                    const data = await fetchUserMBTI(user.email);
                    console.log("Fetched MBTI data:", data);
                    if (!data.mbti) {
                        console.log("No MBTI found. Showing modal.");
                        setShowModal(true);
                    } else {
                        console.log("MBTI exists:", data.mbti);
                    }
                } catch (error) {
                    console.error("Error fetching MBTI data:", error);
                    console.log("Falling back to force modal open for debug.");
                    setShowModal(true); // force open for debug
                }
            } else {
                console.log("User or email is missing:", user);
            }
        };

        checkMBTIStatus();
    }, [user]); // Now user won't change unless localStorage values actually change

    const categories = [
        {
            header: "Science",
            tiles: [
                { id: 1, name: "LabMate", route: "/page/Dashboard/student/ScienceDash", image: "science.png" },
            ]
        },
        {
            header: "Technology",
            tiles: [
                { id: 3, name: "CodeBuddy", route: "/page/Dashboard/student/TechnologyDash", image: "technology.png" },
            ]
        },
        {
            header: "Engineering",
            tiles: [
                { id: 6, name: "Enginuity", route: "/page/Dashboard/student/EngineeringDash", image: "engineering.png" }
            ]
        },
        {
            header: "Arts",
            tiles: [
                { id: 10, name: "CivicSpark", route: "/page/Dashboard/student/ArtsDash", image: "arts.png" },
            ]
        },
        {
            header: "Math",
            tiles: [
                { id: 12, name: "MathSnap", route: "/page/Dashboard/student/MathDash", image: "math.png" },
            ]
        },
        {
            header: "Lifestyle",
            tiles: [
                { id: 14, name: "MyBestMe", route: "/page/Dashboard/student/LifestyleDash", image: "lifestyle.png" },
            ]
        }
    ];

    return (
        <div className={styles.dashboardContainer}>
            {showModal && <MBTISetupModal user={user} onClose={() => setShowModal(false)} />}
            <h1 className={styles.dashboardHeader}>Study Buddy Dashboard</h1>
            <div className={styles.categoriesGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '20px' }}>
                {categories.map((category) => (
                    <div key={category.header}>
                        <h2 className={styles.categoryHeader} style={{ textAlign: 'center' }}>{category.header}</h2>
                        <div className={styles.tilesContainer} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {category.tiles.map((tile) => (
                                <div key={tile.id} className={styles.tileWrapper}>
                                    <img
                                        src={require(`../../assets/images/${tile.image}`)}
                                        alt={tile.name}
                                        className={styles.tileImageButton}
                                        onClick={() => navigate(tile.route)}
                                    />
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