import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NewsTicker from './NewsTicker';
import toast from 'react-hot-toast';
import './Navbar.css';

const NAV = [
  { to: '/',        label: 'الرئيسية'   },
  { to: '/news',    label: 'الأخبار'    },
  { to: '/gallery', label: 'معرض الصور' },
];

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate  = useNavigate();
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  const handleLogout = () => {
    logout();
    toast.success('تم تسجيل الخروج');
    navigate('/');
  };

  // hide ticker on admin pages
  const showTicker = !location.pathname.startsWith('/admin')
    && !location.pathname.startsWith('/login')
    && !location.pathname.startsWith('/register');

  return (
    <div className="navbar-wrapper">
      <nav className={`navbar ${scrolled ? 'navbar-scrolled' : 'navbar-top'}`}>
        <div className="navbar-inner">

          {/* Logo */}
          <Link to="/" className="nav-logo">
            <div className="nav-logo-emblem">
              <svg viewBox="0 0 44 44" fill="none">
                <circle cx="22" cy="22" r="20" stroke="currentColor" strokeWidth="2"/>
                <path d="M22 6 L34 18 L34 38 L10 38 L10 18 Z"
                  fill="currentColor" opacity="0.15"
                  stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
                <rect x="17" y="26" width="10" height="12" rx="1.5" fill="currentColor"/>
                <circle cx="22" cy="17" r="4" fill="currentColor" opacity="0.75"/>
              </svg>
            </div>
            <div className="nav-logo-text">
              <span className="nav-logo-ar">بلدية سيدي علي</span>
              <span className="nav-logo-fr">Commune de Sidi Ali · مستغانم</span>
            </div>
          </Link>

          {/* Desktop Links */}
          <ul className="nav-links">
            {NAV.map(n => (
              <li key={n.to}>
                <Link to={n.to}
                  className={`nav-link ${location.pathname === n.to ? 'active' : ''}`}>
                  {n.label}
                  {location.pathname === n.to && <span className="nav-active-line"/>}
                </Link>
              </li>
            ))}
          </ul>

          {/* Auth */}
          <div className="nav-auth">
            {user ? (
              <div className="nav-user">
                <div className="nav-avatar">{user.name[0]}</div>
                <span className="nav-username">{user.name.split(' ')[0]}</span>
                {isAdmin() && (
                  <Link to="/admin" className="btn btn-outline btn-sm">لوحة التحكم</Link>
                )}
                <button className="btn btn-primary btn-sm" onClick={handleLogout}>خروج</button>
              </div>
            ) : (
              <Link to="/login" className="btn btn-primary">تسجيل الدخول</Link>
            )}
          </div>

          {/* Hamburger */}
          <button className={`nav-burger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(v => !v)} aria-label="القائمة">
            <span/><span/><span/>
          </button>
        </div>

        {/* Mobile drawer */}
        <div className={`nav-drawer ${menuOpen ? 'open' : ''}`}>
          {NAV.map(n => (
            <Link key={n.to} to={n.to}
              className={`drawer-link ${location.pathname === n.to ? 'active' : ''}`}>
              {n.label}
            </Link>
          ))}
          <hr style={{ borderColor:'var(--border)', margin:'8px 0' }}/>
          {user ? (
            <>
              <div className="drawer-user">
                <div className="nav-avatar">{user.name[0]}</div>
                <span>{user.name}</span>
              </div>
              {isAdmin() && <Link to="/admin" className="drawer-link">⚙️ لوحة التحكم</Link>}
              <button className="btn btn-danger"
                style={{ width:'100%', marginTop:'8px' }}
                onClick={handleLogout}>تسجيل الخروج</button>
            </>
          ) : (
            <div style={{ display:'flex', gap:'8px', flexDirection:'column' }}>
              <Link to="/login"    className="btn btn-primary" style={{ justifyContent:'center' }}>تسجيل الدخول</Link>
              <Link to="/register" className="btn btn-outline" style={{ justifyContent:'center' }}>إنشاء حساب</Link>
            </div>
          )}
        </div>
      </nav>

      {/* ── NEWS TICKER — below navbar ── */}
      {showTicker && <NewsTicker />}
    </div>
  );
}
