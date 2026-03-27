// Route setup + role-based access control
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

import Login            from './pages/Login';
import DashboardLayout  from './components/layout/DashboardLayout';
import AdminDashboard   from './pages/admin/AdminDashboard';
import CreateAssignment from './pages/admin/CreateAssignment';
import StudentDashboard from './pages/student/StudentDashboard';
import AssignmentDetails from './pages/student/AssignmentDetails';

// Guards a route: redirects if not logged in or wrong role
const PrivateRoute = ({ children, role }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (role && user.role !== role) return <Navigate to={`/${user.role}`} replace />;
  return children;
};

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{
          duration: 4000,
          style: { background: '#1e293b', color: '#fff', borderRadius: '12px', padding: '14px 18px', fontWeight: '600' },
          success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
        }} />

        <Routes>
          <Route path="/" element={<Login />} />

          <Route element={<DashboardLayout />}>
            <Route path="/admin"        element={<PrivateRoute role="admin"><AdminDashboard /></PrivateRoute>} />
            <Route path="/admin/create" element={<PrivateRoute role="admin"><CreateAssignment /></PrivateRoute>} />
            <Route path="/student"      element={<PrivateRoute role="student"><StudentDashboard /></PrivateRoute>} />
            <Route path="/student/assignment/:id" element={<PrivateRoute role="student"><AssignmentDetails /></PrivateRoute>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
