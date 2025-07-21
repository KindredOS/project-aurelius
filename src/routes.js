//Edu_routes.js
// File Name: routes.js
// Version: 0.09
// NOTE: Update the version number each time changes are made to this file.

// Import necessary modules for routing
import React, { useState, useEffect } from 'react'; 
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';

// Import pages
import Login from './pages/Login/Login';
import Onboarding from './pages/Login/Onboarding';
import UserProfile from './pages/UserProfile/UserProfile';
import Layout from './components/layout/Layout';
import MathDashboard from './pages/Dashboard/MathDashboard';
import LearningSession from './pages/Dashboard/mathmodule/LearningSession';
import DashboardTeacher from './pages/Dashboard/DashboardTeacher';
import DashboardStudent from './pages/Dashboard/DashboardStudent';
import DashboardAdmin from './pages/Dashboard/DashboardAdmin';

// Import student subpages
import ScienceDash from './pages/Dashboard/student/ScienceDash';
import TechnologyDash from './pages/Dashboard/student/TechnologyDash';
import EngineeringDash from './pages/Dashboard/student/EngineeringDash';
import ArtsDash from './pages/Dashboard/student/ArtsDash';
import MathDash from './pages/Dashboard/student/MathDash';
import LifestyleDash from './pages/Dashboard/student/LifestyleDash';

// Function for AppRoutes
function AppRoutes() {
  const location = useLocation();
  const noLayoutRoutes = ['/', '/onboarding'];
  const hideLayout = noLayoutRoutes.includes(location.pathname);

  const [user, setUser] = useState({ 
    name: 'Guest', 
    email: 'guest@example.com', 
    savedStories: 0, 
    avatar: '',
    role: 'guest'
  }); // Default user state

  return (
    hideLayout ? (
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/onboarding" element={<Onboarding />} />
      </Routes>
    ) : (
      <Layout showNavigation={true}>
        <Routes>
          <Route 
            path="/" 
            element={user && user.email !== 'guest@example.com' ? 
              <Navigate to={`/dashboard/${user.role}`} /> : 
              <Login />
            } 
          />

          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/profile" element={<UserProfile user={user} setUser={setUser} />} />
          <Route path="/dashboard/teacher" element={<DashboardTeacher />} />
          <Route path="/dashboard/student" element={<DashboardStudent />} />
          <Route path="/dashboard/admin" element={<DashboardAdmin />} />

          {/* Student subpages */}
          <Route path="/page/Dashboard/student/ScienceDash" element={<ScienceDash />} />
          <Route path="/page/Dashboard/student/TechnologyDash" element={<TechnologyDash />} />
          <Route path="/page/Dashboard/student/EngineeringDash" element={<EngineeringDash />} />
          <Route path="/page/Dashboard/student/ArtsDash" element={<ArtsDash />} />
          <Route path="/page/Dashboard/student/MathDash" element={<MathDash />} />
          <Route path="/page/Dashboard/student/LifestyleDash" element={<LifestyleDash />} />

          <Route path="/page/Dashboard/MathDashboard" element={<MathDashboard />} />
          <Route path="/page/Dashboard/mathmodule/LearningSession" element={<LearningSession />} />
        </Routes>
      </Layout>
    )
  );
}

export default AppRoutes;
