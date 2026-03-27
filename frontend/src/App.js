import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import HomePage       from './pages/HomePage';
import NewsPage       from './pages/NewsPage';
import NewsDetail     from './pages/NewsDetail';
import GalleryPage    from './pages/GalleryPage';
import LoginPage      from './pages/LoginPage';
import RegisterPage   from './pages/RegisterPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminNews      from './pages/admin/AdminNews';
import AdminGallery   from './pages/admin/AdminGallery';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';

// Components
import Navbar  from './components/Navbar';
import Footer  from './components/Footer';
import Loader  from './components/Loader';

// ── Protected route for admin ─────────────────────────────
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user || user.role !== 'admin') return <Navigate to="/login" replace />;
  return children;
};

// ── Layout wrapper (Navbar + Footer) ─────────────────────
const PublicLayout = ({ children }) => (
  <>
    <Navbar />
    <main style={{ minHeight: 'calc(100vh - 72px)' }}>{children}</main>
    <Footer />
  </>
);

function AppRoutes() {
  const { loading } = useAuth();
  if (loading) return <Loader />;

  return (
    <Routes>
      {/* Public */}
      <Route path="/"           element={<PublicLayout><HomePage /></PublicLayout>} />
      <Route path="/news"       element={<PublicLayout><NewsPage /></PublicLayout>} />
      <Route path="/news/:id"   element={<PublicLayout><NewsDetail /></PublicLayout>} />
      <Route path="/gallery"    element={<PublicLayout><GalleryPage /></PublicLayout>} />
      <Route path="/login"      element={<LoginPage />} />
      <Route path="/register"   element={<RegisterPage />} />

      {/* Admin */}
      <Route path="/admin"              element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/news"         element={<AdminRoute><AdminNews /></AdminRoute>} />
      <Route path="/admin/gallery"      element={<AdminRoute><AdminGallery /></AdminRoute>} />
      <Route path="/admin/announcements" element={<AdminRoute><AdminAnnouncements /></AdminRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3500,
            style: {
              fontFamily: "'Cairo', sans-serif",
              direction: 'rtl',
              borderRadius: '10px',
              fontWeight: '600',
              fontSize: '0.92rem'
            },
            success: { style: { background: '#e6f4ec', color: '#1a6b3c', border: '1px solid #b7dfc6' } },
            error:   { style: { background: '#ffe0e3', color: '#b02a37', border: '1px solid #f5c2c7' } }
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
