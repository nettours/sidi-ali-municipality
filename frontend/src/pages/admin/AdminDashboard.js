import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import './AdminLayout.css';

const NAV_ITEMS = [
  { to: '/admin',               icon: '🏠', label: 'الرئيسية'  },
  { to: '/admin/news',          icon: '📰', label: 'الأخبار'   },
  { to: '/admin/gallery',       icon: '🖼️', label: 'الصور'     },
  { to: '/admin/announcements', icon: '📢', label: 'الإعلانات' },
];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [stats,    setStats]    = useState(null);
  const [sideOpen, setSideOpen] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [n, g, a] = await Promise.all([
          axios.get('/news/all'),
          axios.get('/gallery'),
          axios.get('/announcements/all'),
        ]);
        setStats({
          news:    n.data.data?.length || 0,
          photos:  g.data.data?.length || 0,
          announces: a.data.data?.length || 0,
        });
      } catch (e) { console.error(e); }
    };
    fetchStats();
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('تم تسجيل الخروج');
    navigate('/');
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sideOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🏛️</div>
          <div>
            <span className="sidebar-logo-title">بلدية سيدي علي</span>
            <span className="sidebar-logo-sub">لوحة التحكم</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className={`sidebar-link ${location.pathname === item.to ? 'active' : ''}`}
              onClick={() => setSideOpen(false)}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{user?.name?.[0]}</div>
            <div>
              <div className="sidebar-uname">{user?.name}</div>
              <div className="sidebar-urole">مدير النظام</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <Link to="/" className="btn btn-outline" style={{ flex: 1, justifyContent: 'center', padding: '8px', fontSize: '0.82rem' }}>
              الموقع
            </Link>
            <button className="btn btn-danger" style={{ flex: 1, padding: '8px', fontSize: '0.82rem' }} onClick={handleLogout}>
              خروج
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sideOpen && <div className="sidebar-overlay" onClick={() => setSideOpen(false)} />}

      {/* Main */}
      <div className="admin-main">
        {/* Top Bar */}
        <header className="admin-topbar">
          <button className="hamburger" onClick={() => setSideOpen(v => !v)}>
            <span /><span /><span />
          </button>
          <h2 className="admin-topbar-title">لوحة التحكم</h2>
          <span className="topbar-badge">مرحباً، {user?.name?.split(' ')[0]}</span>
        </header>

        {/* Stats Cards */}
        <div className="admin-content">
          <div className="stats-grid">
            <div className="stat-card" style={{ '--c': 'var(--primary)' }}>
              <div className="stat-card-icon">📰</div>
              <div className="stat-card-info">
                <span className="stat-card-num">{stats?.news ?? '—'}</span>
                <span className="stat-card-label">إجمالي الأخبار</span>
              </div>
              <Link to="/admin/news" className="stat-card-link">إدارة ←</Link>
            </div>
            <div className="stat-card" style={{ '--c': '#0d6efd' }}>
              <div className="stat-card-icon">🖼️</div>
              <div className="stat-card-info">
                <span className="stat-card-num">{stats?.photos ?? '—'}</span>
                <span className="stat-card-label">الصور في المعرض</span>
              </div>
              <Link to="/admin/gallery" className="stat-card-link">إدارة ←</Link>
            </div>
            <div className="stat-card" style={{ '--c': '#fd7e14' }}>
              <div className="stat-card-icon">📢</div>
              <div className="stat-card-info">
                <span className="stat-card-num">{stats?.announces ?? '—'}</span>
                <span className="stat-card-label">الإعلانات</span>
              </div>
              <Link to="/admin/announcements" className="stat-card-link">إدارة ←</Link>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions card">
            <h3 className="qa-title">⚡ إجراءات سريعة</h3>
            <div className="qa-grid">
              <Link to="/admin/news"          className="qa-item green">
                <span className="qa-icon">➕</span><span>نشر خبر جديد</span>
              </Link>
              <Link to="/admin/gallery"       className="qa-item blue">
                <span className="qa-icon">📸</span><span>رفع صورة</span>
              </Link>
              <Link to="/admin/announcements" className="qa-item orange">
                <span className="qa-icon">📣</span><span>إضافة إعلان</span>
              </Link>
              <Link to="/" target="_blank"    className="qa-item gray">
                <span className="qa-icon">👁</span><span>معاينة الموقع</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
