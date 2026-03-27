import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './AuthPages.css';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form,    setForm]    = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [showPass,setShowPass]= useState(false);

  const set = (k) => (e) => { setForm(f => ({ ...f, [k]: e.target.value })); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.confirm) {
      setError('يرجى ملء جميع الحقول'); return;
    }
    if (form.password.length < 6) { setError('كلمة المرور 6 أحرف على الأقل'); return; }
    if (form.password !== form.confirm) { setError('كلمتا المرور غير متطابقتين'); return; }

    setLoading(true); setError('');
    try {
      await register(form.name, form.email, form.password);
      toast.success('تم إنشاء حسابك بنجاح! 🎉');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'فشل إنشاء الحساب. حاول مجدداً.';
      setError(msg); toast.error(msg);
    } finally { setLoading(false); }
  };

  const passStrength = () => {
    const p = form.password;
    if (!p) return null;
    if (p.length < 6) return { label: 'ضعيفة', color: '#c0392b', width: '25%' };
    if (p.length < 8)  return { label: 'متوسطة', color: '#e67e22', width: '55%' };
    return { label: 'قوية', color: '#27ae60', width: '100%' };
  };
  const strength = passStrength();

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
              <h1 className="auth-title">إنشاء حساب</h1>
              <p className="auth-sub">انضم إلى مجتمع بلدية سيدي علي</p>
            </div>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="form-group">
              <label className="form-label">الاسم الكامل</label>
              <input type="text" className="form-control" placeholder="أحمد بن علي"
                value={form.name} onChange={set('name')} autoComplete="name" />
            </div>

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
                  placeholder="6 أحرف على الأقل"
                  value={form.password} onChange={set('password')} autoComplete="new-password" />
                <button type="button" className="toggle-pass" onClick={() => setShowPass(v => !v)}>
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
              {strength && (
                <div style={{ marginTop: '6px' }}>
                  <div style={{ height: '4px', background: '#e0e0e0', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: strength.width, height: '100%', background: strength.color, borderRadius: '2px', transition: 'width 0.3s ease' }} />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: strength.color, fontWeight: '700' }}>قوة كلمة المرور: {strength.label}</span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">تأكيد كلمة المرور</label>
              <input type="password" className="form-control"
                placeholder="أعد كتابة كلمة المرور"
                value={form.confirm} onChange={set('confirm')} autoComplete="new-password" />
              {form.confirm && form.confirm !== form.password && (
                <span style={{ fontSize: '0.75rem', color: '#c0392b', fontWeight: '700' }}>⚠ كلمتا المرور غير متطابقتين</span>
              )}
            </div>

            <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
              {loading ? <><div className="btn-spinner" /> جارٍ الإنشاء...</> : 'إنشاء الحساب'}
            </button>
          </form>

          <p className="auth-switch">
            لديك حساب؟ <Link to="/login">تسجيل الدخول</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
