// Path: src/components/pages/DashboardStudent.jsx
// Focus: Main student dashboard with MBTI setup and subscription management
// Version Update: Cleaned up debug logging, keeping simple trial/subscription status logs
// Patch: Locked all sections except Math

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './DashboardStudent.module.css';
import MBTISetupModal from '../../components/student/MBTISetupModal';
import { fetchUserMBTI, getUserProfile } from '../../api/User';

function StudyBuddyDashboard() {
    const navigate = useNavigate();
    
    // Memoize the user object so it only changes when localStorage values actually change
    const user = useMemo(() => ({
        email: localStorage.getItem('userEmail'),
        name: localStorage.getItem('userName'),
        isPremium: localStorage.getItem('isPremium') === 'true',
    }), []); // Empty dependency array since localStorage is external

    const [showModal, setShowModal] = useState(false);
    const [subscriptionStatus, setSubscriptionStatus] = useState(null);
    const [trialDaysLeft, setTrialDaysLeft] = useState(null);

    useEffect(() => {
        const checkMBTIStatus = async () => {
            if (user && user.email) {
                try {
                    const data = await fetchUserMBTI(user.email);
                    if (!data.mbti) {
                        setShowModal(true);
                    }
                } catch (error) {
                    console.error("Error fetching MBTI data:", error);
                    setShowModal(true);
                }
            }
        };

        checkMBTIStatus();
    }, [user]);

    useEffect(() => {
        const checkSubscription = async () => {
            if (user && user.email) {
                try {
                    const profile = await getUserProfile(user.email);
                    const sub = profile.subscription || {};
                    
                    setSubscriptionStatus(sub.status || 'none');
                    
                    // Update localStorage with premium status
                    const isPremium = sub.status === 'active' || (sub.is_trial && sub.trial_end_date);
                    localStorage.setItem('isPremium', isPremium ? 'true' : 'false');
                    
                    if (sub.is_trial && sub.trial_end_date) {
                        const now = new Date();
                        const end = new Date(sub.trial_end_date);
                        const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
                        const daysLeft = Math.max(0, diff);
                        setTrialDaysLeft(daysLeft);
                    }
                    
                    // Simple status logging
                    console.log(`Trial: ${sub.is_trial || false}, Subscription: ${sub.status === 'active'}`);
                    
                } catch (error) {
                    console.error("Failed to fetch subscription:", error);
                }
            }
        };
        checkSubscription();
    }, [user]);

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

    const isLocked = (categoryHeader) => {
        return categoryHeader !== "Math";
    };

    return (
        <div className={styles.dashboardContainer}>
            {showModal && <MBTISetupModal user={user} onClose={() => setShowModal(false)} />}
            <h1 className={styles.dashboardHeader}>Study Buddy Dashboard</h1>
            {subscriptionStatus === 'trialing' && (
                <div className={styles.trialBanner}>
                    {trialDaysLeft > 0 
                        ? `🕒 You're on a free trial. ${trialDaysLeft} days remaining.` 
                        : '⛔️ Your trial has ended. Upgrade to unlock full access.'}
                </div>
            )}
            {subscriptionStatus !== 'active' && trialDaysLeft === 0 && (
                <button 
                    className={styles.upgradeButton}
                    onClick={() => navigate('/subscribe')}
                >
                    Upgrade Now
                </button>
            )}
            <div className={styles.categoriesGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '20px' }}>
                {categories.map((category) => {
                    const locked = isLocked(category.header);
                    return (
                        <div key={category.header}>
                            <h2 className={styles.categoryHeader} style={{ textAlign: 'center' }}>{category.header}</h2>
                            <div className={styles.tilesContainer} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {category.tiles.map((tile) => (
                                    <div key={tile.id} className={styles.tileWrapper}>
                                        <div className={locked ? styles.lockedOverlay : ''}>
                                            <img
                                                src={require(`../../assets/images/${tile.image}`)}
                                                alt={tile.name}
                                                className={`${styles.tileImageButton} ${locked ? styles.lockedTile : ''}`}
                                                onClick={() => !locked && navigate(tile.route)}
                                                style={{ cursor: locked ? 'not-allowed' : 'pointer' }}
                                            />
                                            {locked && (
                                                <div className={styles.lockIcon}>🔒</div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default StudyBuddyDashboard;