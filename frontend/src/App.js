import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from './components/ui/sonner';
import './App.css';

import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import RoadmapsPage from './pages/RoadmapsPage';
import RoomDetail from './pages/RoomDetail';
import LabPage from './pages/LabPage';
import WebLabPage from './pages/WebLabPage';
import ChallengesPage from './pages/ChallengesPage';
import CodeEditor from './pages/CodeEditor';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRooms from './pages/admin/AdminRooms';
import AdminUsers from './pages/admin/AdminUsers';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary text-xl font-mono">Loading...</div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary text-xl font-mono">Loading...</div>
      </div>
    );
  }
  
  return user && user.role === 'admin' ? children : <Navigate to="/dashboard" />;
};

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  
  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/roadmaps" element={<PrivateRoute><RoadmapsPage /></PrivateRoute>} />
      <Route path="/rooms/:roomId" element={<PrivateRoute><RoomDetail /></PrivateRoute>} />
      <Route path="/lab/:sessionId" element={<PrivateRoute><LabPage /></PrivateRoute>} />
      <Route path="/web-lab/:sessionId" element={<PrivateRoute><WebLabPage /></PrivateRoute>} />
      <Route path="/challenges" element={<PrivateRoute><ChallengesPage /></PrivateRoute>} />
      <Route path="/challenges/:challengeId" element={<PrivateRoute><CodeEditor /></PrivateRoute>} />
      <Route path="/profile/:userId" element={<PrivateRoute><Profile /></PrivateRoute>} />
      <Route path="/leaderboard" element={<PrivateRoute><Leaderboard /></PrivateRoute>} />
      
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/rooms" element={<AdminRoute><AdminRooms /></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="App">
          <AppRoutes />
          <Toaster position="top-right" />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
