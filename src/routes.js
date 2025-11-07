// Path: src/routes.js
// Focus: Central Routing for Learning OS App
// Version Update: Removed the unused use effect removed

// Import necessary modules for routing
import React, { useState } from 'react'; 
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';

// Import Core pages
import Login from './pages/Login/Login';
import Onboarding from './pages/Login/Onboarding';
import UserProfile from './pages/UserProfile/UserProfile';

// Role Dependant Dashboards
import DashboardTeacher from './pages/Dashboard/DashboardTeacher';
import DashboardStudent from './pages/Dashboard/DashboardStudent';
import DashboardAdmin from './pages/Dashboard/DashboardAdmin';

// Import Feature Subpages
import ScienceDash from './pages/Dashboard/student/ScienceDash';
import TechnologyDash from './pages/Dashboard/student/TechnologyDash';
import EngineeringDash from './pages/Dashboard/student/EngineeringDash';
import ArtsDash from './pages/Dashboard/student/ArtsDash';
import MathDash from './pages/Dashboard/student/MathDash';
import LifestyleDash from './pages/Dashboard/student/LifestyleDash';

// Optional layout wrapper
import Layout from './components/layout/Layout';

// Function for AppRoutes
function AppRoutes() {
  const location = useLocation();
  const noLayoutRoutes = ['/', '/onboarding'];
  const hideLayout = noLayoutRoutes.includes(location.pathname);

  // Default user state
  const [user, setUser] = useState({ 
    name: 'Guest', 
    email: 'guest@example.com',  
    avatar: '',
    role: 'guest'
  }); 

  return (
    hideLayout ? (
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/onboarding" element={<Onboarding />} />
      </Routes>
    ) : (
      <Layout showNavigation={true}>
        {/* Active Routes */}
        <Routes>
          
          {/* Redirect to Login if not authenticated */}
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

        </Routes>
      </Layout>
    )
  );
}

export default AppRoutes;