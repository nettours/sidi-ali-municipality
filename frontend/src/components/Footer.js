import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="footer-wave">
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none">
          <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="var(--primary-dark)" />
        </svg>
      </div>

      <div className="footer-body">
        <div className="container footer-grid">

          {/* Brand */}
          <div className="footer-brand">
            <h3>بلدية سيدي علي</h3>
            <p>الموقع الرسمي لبلدية سيدي علي، دائرة سيدي علي، ولاية مستغانم، الجمهورية الجزائرية الديمقراطية الشعبية.</p>
            <div className="footer-social">
              <a href="https://www.facebook.com/profile.php?id=100063508553211" target="_blank" rel="noreferrer" className="social-link">
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4>روابط سريعة</h4>
            <ul>
              <li><Link to="/">الصفحة الرئيسية</Link></li>
              <li><Link to="/news">الأخبار</Link></li>
              <li><Link to="/gallery">معرض الصور</Link></li>
              <li><Link to="/login">تسجيل الدخول</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-col">
            <h4>معلومات الاتصال</h4>
            <ul>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                بلدية سيدي علي، ولاية مستغانم
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.63 4.4 2 2 0 0 1 3.6 2.24h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 17z"/>
                </svg>
                +(213) 045 XX XX XX
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                contact@sidialimairie.dz
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <p>© {year} بلدية سيدي علي. جميع الحقوق محفوظة.</p>
          <p>Réalisé par <a href="https://snetpeodz.com" target="_blank" rel="noopener noreferrer">SnetProDz.com</a></p>
        </div>
      </div>
    </footer>
  );
}
