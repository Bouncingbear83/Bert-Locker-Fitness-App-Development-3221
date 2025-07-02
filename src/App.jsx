import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import WorkoutLogger from './pages/WorkoutLogger';
import Training from './pages/Training';
import Progress from './pages/Progress';
import Profile from './pages/Profile';
import Layout from './components/Layout';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" />;
}

// Redirect old routes to new structure
function LegacyRedirects() {
  const location = window.location.hash;
  
  // Redirect old routes to new tab-based routes
  if (location === '#/exercises') {
    return <Navigate to="/training?tab=exercises" replace />;
  }
  if (location === '#/templates') {
    return <Navigate to="/training?tab=templates" replace />;
  }
  if (location === '#/history') {
    return <Navigate to="/progress?tab=history" replace />;
  }
  if (location === '#/body-tracking') {
    return <Navigate to="/progress?tab=body" replace />;
  }
  
  return null;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen gradient-bg">
          <LegacyRedirects />
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Legacy route redirects */}
            <Route path="/exercises" element={<Navigate to="/training?tab=exercises" replace />} />
            <Route path="/templates" element={<Navigate to="/training?tab=templates" replace />} />
            <Route path="/history" element={<Navigate to="/progress?tab=history" replace />} />
            <Route path="/body-tracking" element={<Navigate to="/progress?tab=body" replace />} />
            
            <Route path="/*" element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/workout" element={<WorkoutLogger />} />
                    <Route path="/training" element={<Training />} />
                    <Route path="/progress" element={<Progress />} />
                    <Route path="/profile" element={<Profile />} />
                    
                    {/* Catch-all redirect to dashboard */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;