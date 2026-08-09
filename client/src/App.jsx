import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';

// Pages
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import HomeFeedPage from './pages/HomeFeedPage';
import DiscoverPage from './pages/DiscoverPage';
import BookDetailPage from './pages/BookDetailPage';
import ProfilePage from './pages/ProfilePage';
import MyLibraryPage from './pages/MyLibraryPage';
import UploadBookPage from './pages/UploadBookPage';
import WishlistPage from './pages/WishlistPage';
import ExchangeRequestsPage from './pages/ExchangeRequestsPage';
import ChatPage from './pages/ChatPage';
import NearbyMapPage from './pages/NearbyMapPage';
import ReadingClubsPage from './pages/ReadingClubsPage';
import AchievementsPage from './pages/AchievementsPage';
import NotificationsPage from './pages/NotificationsPage';
import ReadingProgressPage from './pages/ReadingProgressPage';
import RecommendationsPage from './pages/RecommendationsPage';
import SettingsPage from './pages/SettingsPage';
import AdminPanelPage from './pages/AdminPanelPage';
import NetworkPeoplePage from './pages/NetworkPeoplePage';

const AppLayout = ({ children }) => {
  const location = useLocation();
  const { isDark } = useTheme();
  const isLanding = location.pathname === '/';
  const isAuth = location.pathname === '/auth';

  if (isLanding || isAuth) {
    return <>{children}</>;
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0B0C10] text-[#EAEAEA]' : 'bg-[#FAF7F2] text-[#1F2430]'} flex flex-col transition-colors duration-200`}>
      <Navbar />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />
        <main className="flex-1 p-4 lg:p-8 pb-24 lg:pb-12 overflow-y-auto">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
};

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-12 text-center text-gray-400">Authenticating...</div>;
  if (!user) return <Navigate to="/auth" replace />;
  return children;
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <AppLayout>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              
              {/* Authenticated Application Routes */}
              <Route path="/home" element={<ProtectedRoute><HomeFeedPage /></ProtectedRoute>} />
              <Route path="/discover" element={<ProtectedRoute><DiscoverPage /></ProtectedRoute>} />
              <Route path="/network" element={<ProtectedRoute><NetworkPeoplePage /></ProtectedRoute>} />
              <Route path="/people" element={<ProtectedRoute><NetworkPeoplePage /></ProtectedRoute>} />
              <Route path="/books/:id" element={<ProtectedRoute><BookDetailPage /></ProtectedRoute>} />
              <Route path="/profile/:id?" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/library" element={<ProtectedRoute><MyLibraryPage /></ProtectedRoute>} />
              <Route path="/upload" element={<ProtectedRoute><UploadBookPage /></ProtectedRoute>} />
              <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
              <Route path="/exchanges" element={<ProtectedRoute><ExchangeRequestsPage /></ProtectedRoute>} />
              <Route path="/exchanges/:id" element={<ProtectedRoute><ExchangeRequestsPage /></ProtectedRoute>} />
              <Route path="/chat/:id" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
              <Route path="/map" element={<ProtectedRoute><NearbyMapPage /></ProtectedRoute>} />
              <Route path="/clubs" element={<ProtectedRoute><ReadingClubsPage /></ProtectedRoute>} />
              <Route path="/achievements" element={<ProtectedRoute><AchievementsPage /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
              <Route path="/progress" element={<ProtectedRoute><ReadingProgressPage /></ProtectedRoute>} />
              <Route path="/recommendations" element={<ProtectedRoute><RecommendationsPage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><AdminPanelPage /></ProtectedRoute>} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppLayout>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
