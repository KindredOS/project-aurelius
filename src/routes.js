//Edu_routes.js
// File Name: routes.js
// Version: 0.04
// NOTE: Update the version number each time changes are made to this file.

// Import necessary modules for routing
import React, { useState, useEffect } from 'react'; 
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';

// Import pages
import Login from './pages/Login/Login';
import ArtStudioPage from './pages/Dashboard/ArtStudioPage';
import EngineeringPage from './pages/Dashboard/EngineeringPage';
import MusicTheoryPage from './pages/Dashboard/MusicTheoryPage';
import RoboticsPage from './pages/Dashboard/RoboticsPage';
import Design3DPage from './pages/Dashboard/Design3DPage';
import AstronomyPage from './pages/Dashboard/AstronomyPage';
import HistoryPage from './pages/Dashboard/HistoryPage';
import StoryBookPage from './pages/Dashboard/StoryBookPage';
import CreateStoryPage from './pages/Dashboard/Storybook/CreateStoryPage';
import ExpandStoryPage from './pages/Dashboard/Storybook/ExpandStoryPage';
import LibraryPage from './pages/Dashboard/Storybook/LibraryPage';
import LanguageTeacherPage from './pages/Dashboard/LanguageTeacherPage';
import ExercisePage from './pages/Dashboard/ExercisePage';
import FoodPrepPage from './pages/Dashboard/FoodPrepPage';
import FinancialCalculatorPage from './pages/Dashboard/FinancialCalculatorPage';
import UserProfile from './pages/UserProfile/UserProfile';
import Layout from './components/layout/Layout';
import CalculatorMath from './pages/Dashboard/CalculatorMath';
import SciencePage from './pages/Dashboard/SciencePage';
import CodingPage from './pages/Dashboard/CodingPage';
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
  const isLoginPage = location.pathname === '/';
  const [user, setUser] = useState({ 
    name: 'Guest', 
    email: 'guest@example.com', 
    savedStories: 0, 
    avatar: '',
    role: 'guest'
  }); // Default user state

  return (
    <Layout showNavigation={!isLoginPage}>
      {/* Active Routes */}
      <Routes>
         {/* Redirect to Login if not authenticated */}
        <Route 
          path="/" 
          element={ user && user.email !== 'guest@example.com' ? 
            <Navigate to={`/dashboard/${user.role}`} /> : 
            <Login />
          } 
        />

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

        <Route path="/page/Dashboard/SciencePage" element={<SciencePage />} />
        <Route path="/page/Dashboard/ArtStudioPage" element={<ArtStudioPage />} />
        <Route path="/page/Dashboard/EngineeringPage" element={<EngineeringPage />} />
        <Route path="/page/Dashboard/MusicTheoryPage" element={<MusicTheoryPage />} />
        <Route path="/page/Dashboard/RoboticsPage" element={<RoboticsPage />} />
        <Route path="/page/Dashboard/Design3DPage" element={<Design3DPage />} />
        <Route path="/page/Dashboard/AstronomyPage" element={<AstronomyPage />} />
        <Route path="/page/Dashboard/HistoryPage" element={<HistoryPage />} />
        <Route path="/page/Dashboard/StoryBookPage" element={<StoryBookPage />} />
        <Route path="/page/Dashboard/StoryBook/CreateStoryPage" element={<CreateStoryPage />} />
        <Route path="/page/Dashboard/StoryBook/ExpandStoryPage" element={<ExpandStoryPage />} />
        <Route path="/page/Dashboard/StoryBook/LibraryPage" element={<LibraryPage />} />
        <Route path="/page/Dashboard/LanguageTeacherPage" element={<LanguageTeacherPage />} />
        <Route path="/page/Dashboard/CodingPage" element={<CodingPage />} />
        <Route path="/page/Dashboard/ExercisePage" element={<ExercisePage />} />
        <Route path="/page/Dashboard/FoodPrepPage" element={<FoodPrepPage />} />
        <Route path="/page/Dashboard/FinancialCalculatorPage" element={<FinancialCalculatorPage />} />
        <Route path="/page/Dashboard/CalculatorMath" element={<CalculatorMath />} />
        <Route path="/page/Dashboard/MathDashboard" element={<MathDashboard />} />
        <Route path="/page/Dashboard/mathmodule/LearningSession" element={<LearningSession />} />
      </Routes>
    </Layout>
  );
}

export default AppRoutes;
