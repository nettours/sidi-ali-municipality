import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './AuthPages.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form,    setForm]    = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass,setShowPass]= useState(false);
  const [error,   setError]   = useState('');

  const set = (k) => (e) => { setForm(f => ({ ...f, [k]: e.target.value })); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('يرجى ملء جميع الحقول'); return; }
    setLoading(true); setError('');
    try {
      const res = await login(form.email, form.password);
      toast.success(`أهلاً ${res.user.name} 👋`);
      navigate(res.user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      const msg = err.response?.data?.message || 'فشل تسجيل الدخول. تحقق من البيانات.';
      setError(msg);
      toast.error(msg);
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-left" />
      <div className="auth-form-side">
        <div className="auth-box anim-slide">

          <Link to="/" className="auth-back">← العودة للرئيسية</Link>

          <div className="auth-logo">
            <div className="auth-logo-icon">
              <svg viewBox="0 0 44 44" fill="none" width="40" height="40">
                <circle cx="22" cy="22" r="20" stroke="currentColor" strokeWidth="2"/>
                <path d="M22 6 L34 18 L34 38 L10 38 L10 18 Z" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
                <rect x="17" y="26" width="10" height="12" rx="1.5" fill="currentColor"/>
                <circle cx="22" cy="17" r="4" fill="currentColor" opacity="0.8"/>
              </svg>
            </div>
            <div>
              <h1 className="auth-title">تسجيل الدخول</h1>
              <p className="auth-sub">بلدية سيدي علي — الموقع الرسمي</p>
            </div>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="form-group">
              <label className="form-label">البريد الإلكتروني</label>
              <div className="input-wrap">
                <svg className="input-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <input type="email" className="form-control has-icon" dir="ltr"
                  placeholder="example@mail.com"
                  value={form.email} onChange={set('email')} autoComplete="email" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">كلمة المرور</label>
              <div className="input-wrap">
                <svg className="input-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input type={showPass ? 'text' : 'password'} className="form-control has-icon"
                  placeholder="••••••••"
                  value={form.password} onChange={set('password')} autoComplete="current-password" />
                <button type="button" className="toggle-pass" onClick={() => setShowPass(v => !v)}
                  aria-label="إظهار/إخفاء كلمة المرور">
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {/* Quick-fill for demo */}
            <div className="demo-hint">
              <span>للتجربة السريعة:</span>
              <button type="button" onClick={() => setForm({ email: 'admin@sidialimairie.dz', password: 'Admin@123456' })}>
                دخول كـ Admin
              </button>
            </div>

            <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
              {loading ? <><div className="btn-spinner" /> جارٍ التحقق...</> : 'تسجيل الدخول'}
            </button>
          </form>

          <p className="auth-switch">
            ليس لديك حساب؟ <Link to="/register">إنشاء حساب جديد</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
