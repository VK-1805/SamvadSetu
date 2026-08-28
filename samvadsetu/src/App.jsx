import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AppLayout from './components/layout/AppLayout';
import { ProtectedRoute, AdminRoute } from './components/layout/ProtectedRoute';
import { Toaster } from 'react-hot-toast';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import FeedPage from './pages/FeedPage';
import CreateProblemPage from './pages/CreateProblemPage';
import ProblemDetailPage from './pages/ProblemDetailPage';
import ProfilePage from './pages/ProfilePage';
import MapPage from './pages/MapPage';
import ResourceMatchingPage from './pages/ResourceMatchingPage';
import EditProblemPage from './pages/EditProblemPage';
import AdminPage from './pages/AdminPage';
import LeaderboardPage from './pages/LeaderboardPage';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Publicly Accessible Routes inside AppLayout */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/problems/:id" element={<ProblemDetailPage />} />
            <Route path="/profile/:id" element={<ProfilePage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />

            {/* Authenticated Routes */}
            <Route
              path="/problems/new"
              element={
                <ProtectedRoute>
                  <CreateProblemPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/problems/:id/edit"
              element={
                <ProtectedRoute>
                  <EditProblemPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/match"
              element={
                <ProtectedRoute>
                  <ResourceMatchingPage />
                </ProtectedRoute>
              }
            />

            {/* Admin-only Routes */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminPage />
                </AdminRoute>
              }
            />
          </Route>

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'font-sans font-medium text-body-sm text-text',
          success: {
            duration: 4000,
            style: {
              background: '#FFFFFF',
              border: '1px solid #059669',
              color: '#065F46',
            },
          },
          error: {
            duration: 5000,
            style: {
              background: '#FFFFFF',
              border: '1px solid #DC2626',
              color: '#991B1B',
            },
          },
        }}
      />
    </AuthProvider>
  );
}
