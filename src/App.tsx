import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import WorkoutLogger from './pages/WorkoutLogger';
import Library from './pages/Library';
import Progress from './pages/Progress';
import Layout from './components/Layout';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen gradient-bg">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/library" element={<Library />} />
                    <Route path="/workout" element={<WorkoutLogger />} />
                    <Route path="/progress" element={<Progress />} />
                    
                    {/* Legacy route redirects */}
                    <Route path="/training" element={<Navigate to="/library" replace />} />
                    <Route path="/exercises" element={<Navigate to="/library?tab=exercises" replace />} />
                    <Route path="/templates" element={<Navigate to="/library?tab=workouts" replace />} />
                    <Route path="/analytics" element={<Navigate to="/progress?tab=analytics" replace />} />
                    <Route path="/body-tracking" element={<Navigate to="/progress?tab=body" replace />} />
                    <Route path="/history" element={<Navigate to="/progress?tab=history" replace />} />
                    
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