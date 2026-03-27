import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import './AdminLayout.css';

const SIDEBAR = [
  { to: '/admin',               icon: '🏠', label: 'الرئيسية'  },
  { to: '/admin/news',          icon: '📰', label: 'الأخبار'   },
  { to: '/admin/gallery',       icon: '🖼️', label: 'الصور'     },
  { to: '/admin/announcements', icon: '📢', label: 'الإعلانات' },
];

const TYPES      = ['إعلان', 'تنبيه', 'مناقصة', 'توظيف', 'عاجل'];
const PRIORITIES = ['منخفض', 'متوسط', 'عالي', 'عاجل'];

const PRIORITY_STYLE = {
  'منخفض': { bg: '#e9ecef', color: '#6c757d' },
  'متوسط': { bg: '#e7f0ff', color: '#0d6efd' },
  'عالي':  { bg: '#fff3e0', color: '#fd7e14' },
  'عاجل':  { bg: '#ffe0e3', color: '#dc3545' },
};

const TYPE_STYLE = {
  'إعلان':  { bg: '#e6f4ec', color: '#1a6b3c' },
  'تنبيه':  { bg: '#fff3e0', color: '#fd7e14' },
  'مناقصة': { bg: '#e7f0ff', color: '#0d6efd' },
  'توظيف':  { bg: '#f3e8ff', color: '#7c3aed' },
  'عاجل':   { bg: '#ffe0e3', color: '#dc3545' },
};

const EMPTY_FORM = {
  title: '', content: '', type: 'إعلان',
  priority: 'متوسط', isActive: true, expiresAt: ''
};

export default function AdminAnnouncements() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [items,    setItems]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [saving,   setSaving]   = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [sideOpen, setSideOpen] = useState(false);
  const [filter,   setFilter]   = useState('الكل');

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/announcements/all');
      setItems(res.data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchItems(); }, []);

  const openCreate = () => {
    setEditItem(null);
    setForm(EMPTY_FORM);
    setModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      title: item.title,
      content: item.content,
      type: item.type,
      priority: item.priority,
      isActive: item.isActive,
      expiresAt: item.expiresAt ? item.expiresAt.split('T')[0] : ''
    });
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.content) { toast.error('العنوان والمحتوى مطلوبان'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null
      };
      if (editItem) {
        await axios.put(`/announcements/${editItem._id}`, payload);
        toast.success('تم تحديث الإعلان بنجاح ✅');
      } else {
        await axios.post('/announcements', payload);
        toast.success('تم إضافة الإعلان بنجاح ✅');
      }
      setModal(false);
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشلت العملية');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`/announcements/${deleteId}`);
      toast.success('تم حذف الإعلان');
      setDeleteId(null);
      fetchItems();
    } catch { toast.error('فشل الحذف'); }
  };

  const toggleActive = async (item) => {
    try {
      await axios.put(`/announcements/${item._id}`, { ...item, isActive: !item.isActive });
      toast.success(item.isActive ? 'تم إيقاف الإعلان' : 'تم تفعيل الإعلان');
      fetchItems();
    } catch { toast.error('فشل التحديث'); }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const filteredItems = filter === 'الكل' ? items : items.filter(i => i.type === filter);

  return (
    <div className="admin-layout">
      {/* ── Sidebar ───────────────────────────────── */}
      <aside className={`admin-sidebar ${sideOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🏛️</div>
          <div>
            <span className="sidebar-logo-title">بلدية سيدي علي</span>
            <span className="sidebar-logo-sub">لوحة التحكم</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          {SIDEBAR.map(item => (
            <Link key={item.to} to={item.to}
              className={`sidebar-link ${window.location.pathname === item.to ? 'active' : ''}`}
              onClick={() => setSideOpen(false)}>
              <span className="sidebar-icon">{item.icon}</span><span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link to="/" className="btn btn-outline" style={{ flex: 1, justifyContent: 'center', padding: '8px', fontSize: '0.82rem' }}>الموقع</Link>
            <button className="btn btn-danger" style={{ flex: 1, padding: '8px', fontSize: '0.82rem' }} onClick={handleLogout}>خروج</button>
          </div>
        </div>
      </aside>
      {sideOpen && <div className="sidebar-overlay" onClick={() => setSideOpen(false)} />}

      {/* ── Main ──────────────────────────────────── */}
      <div className="admin-main">
        <header className="admin-topbar">
          <button className="hamburger" onClick={() => setSideOpen(v => !v)}>
            <span /><span /><span />
          </button>
          <h2 className="admin-topbar-title">📢 إدارة الإعلانات</h2>
        </header>

        <div className="admin-page">
          <div className="admin-page-header">
            <h2>الإعلانات ({filteredItems.length})</h2>
            <button className="btn btn-primary" onClick={openCreate}>➕ إضافة إعلان جديد</button>
          </div>

          {/* Stats strip */}
          <div className="announce-stats">
            {['الكل', ...TYPES].map(type => {
              const count = type === 'الكل' ? items.length : items.filter(i => i.type === type).length;
              const style = type !== 'الكل' && TYPE_STYLE[type] ? TYPE_STYLE[type] : { bg: '#f0f4f0', color: 'var(--text)' };
              return (
                <button key={type}
                  className={`announce-stat-btn ${filter === type ? 'active' : ''}`}
                  style={filter === type ? { background: style.bg, color: style.color, borderColor: style.color } : {}}
                  onClick={() => setFilter(type)}>
                  {type} <span className="stat-count">{count}</span>
                </button>
              );
            })}
          </div>

          {/* Table */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px' }}><div className="spinner" /></div>
          ) : filteredItems.length === 0 ? (
            <div className="card" style={{ padding: '50px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📭</div>
              <p style={{ fontWeight: '600' }}>لا توجد إعلانات</p>
              <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={openCreate}>➕ أضف إعلاناً</button>
            </div>
          ) : (
            <div className="card">
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>العنوان</th><th>النوع</th><th>الأولوية</th>
                      <th>الحالة</th><th>ينتهي في</th><th>التاريخ</th><th>الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map(item => {
                      const ps = PRIORITY_STYLE[item.priority] || {};
                      const ts = TYPE_STYLE[item.type] || {};
                      const isExpired = item.expiresAt && new Date(item.expiresAt) < new Date();
                      return (
                        <tr key={item._id}>
                          <td style={{ maxWidth: '240px' }}>
                            <strong style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>
                              {item.title.slice(0, 55)}{item.title.length > 55 ? '...' : ''}
                            </strong>
                          </td>
                          <td>
                            <span style={{
                              display: 'inline-block', padding: '3px 10px',
                              borderRadius: '20px', fontSize: '0.78rem', fontWeight: '700',
                              background: ts.bg, color: ts.color
                            }}>{item.type}</span>
                          </td>
                          <td>
                            <span style={{
                              display: 'inline-block', padding: '3px 10px',
                              borderRadius: '20px', fontSize: '0.78rem', fontWeight: '700',
                              background: ps.bg, color: ps.color
                            }}>{item.priority}</span>
                          </td>
                          <td>
                            <button
                              className={`status-toggle ${item.isActive && !isExpired ? 'active' : 'inactive'}`}
                              onClick={() => toggleActive(item)}
                              title="انقر للتبديل"
                            >
                              {item.isActive && !isExpired ? '✅ نشط' : isExpired ? '⏰ منتهي' : '⏸ موقوف'}
                            </button>
                          </td>
                          <td style={{ fontSize: '0.82rem', color: isExpired ? '#dc3545' : 'var(--text-muted)' }}>
                            {item.expiresAt
                              ? new Date(item.expiresAt).toLocaleDateString('ar-DZ')
                              : '—'}
                          </td>
                          <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            {new Date(item.createdAt).toLocaleDateString('ar-DZ')}
                          </td>
                          <td>
                            <div className="table-actions">
                              <button className="action-btn edit" onClick={() => openEdit(item)}>✏️ تعديل</button>
                              <button className="action-btn delete" onClick={() => setDeleteId(item._id)}>🗑 حذف</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Create/Edit Modal ─────────────────────── */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editItem ? '✏️ تعديل الإعلان' : '📢 إعلان جديد'}</h3>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">عنوان الإعلان *</label>
                <input className="form-control" value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="أدخل عنوان الإعلان" required />
              </div>

              <div className="form-group">
                <label className="form-label">محتوى الإعلان *</label>
                <textarea className="form-control" rows="5" value={form.content}
                  onChange={e => setForm({ ...form, content: e.target.value })}
                  placeholder="اكتب تفاصيل الإعلان هنا..." required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">نوع الإعلان</label>
                  <select className="form-control" value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value })}>
                    {TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">درجة الأولوية</label>
                  <select className="form-control" value={form.priority}
                    onChange={e => setForm({ ...form, priority: e.target.value })}>
                    {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">تاريخ انتهاء الإعلان</label>
                  <input className="form-control" type="date" value={form.expiresAt}
                    onChange={e => setForm({ ...form, expiresAt: e.target.value })}
                    min={new Date().toISOString().split('T')[0]} />
                  <small style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>اتركه فارغاً للإعلان الدائم</small>
                </div>
                <div className="form-group">
                  <label className="form-label">حالة الإعلان</label>
                  <select className="form-control" value={form.isActive}
                    onChange={e => setForm({ ...form, isActive: e.target.value === 'true' })}>
                    <option value="true">نشط</option>
                    <option value="false">موقوف</option>
                  </select>
                </div>
              </div>

              {/* Preview Card */}
              {form.title && (
                <div style={{ marginBottom: '16px' }}>
                  <label className="form-label">معاينة</label>
                  <div className="announcement-preview-card">
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <span style={{
                        padding: '2px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700',
                        background: TYPE_STYLE[form.type]?.bg, color: TYPE_STYLE[form.type]?.color
                      }}>{form.type}</span>
                      <span style={{
                        padding: '2px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700',
                        background: PRIORITY_STYLE[form.priority]?.bg, color: PRIORITY_STYLE[form.priority]?.color
                      }}>{form.priority}</span>
                    </div>
                    <h4 style={{ fontSize: '0.95rem', color: 'var(--text)', marginBottom: '6px' }}>{form.title}</h4>
                    <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                      {form.content.slice(0, 100)}{form.content.length > 100 ? '...' : ''}
                    </p>
                  </div>
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>إلغاء</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving
                    ? <><div className="btn-spinner" /> جارٍ الحفظ...</>
                    : editItem ? 'حفظ التغييرات' : 'نشر الإعلان'
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ────────────────────────── */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal" style={{ maxWidth: '380px' }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
              <h3 style={{ marginBottom: '10px' }}>حذف الإعلان</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
                هل أنت متأكد من حذف هذا الإعلان؟<br />
                <strong>لا يمكن التراجع عن هذا الإجراء.</strong>
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button className="btn btn-outline" onClick={() => setDeleteId(null)}>إلغاء</button>
                <button className="btn btn-danger" onClick={handleDelete}>نعم، احذف</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
