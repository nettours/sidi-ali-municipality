import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, api } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './AdminLayout.css';

const BASE_URL = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL.replace('/api', '')
  : 'http://localhost:5000';

const EMPTY = { title: '', content: '', summary: '', category: 'عام', isPublished: true };
const CATS  = ['عام', 'صحة', 'تعليم', 'بنية تحتية', 'ثقافة', 'رياضة', 'أخرى'];
const SIDEBAR = [
  { to: '/admin',               icon: '🏠', label: 'الرئيسية'  },
  { to: '/admin/news',          icon: '📰', label: 'الأخبار'   },
  { to: '/admin/gallery',       icon: '🖼️', label: 'الصور'     },
  { to: '/admin/announcements', icon: '📢', label: 'الإعلانات' },
];

export default function AdminNews() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [news,     setNews]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form,     setForm]     = useState(EMPTY);
  const [image,    setImage]    = useState(null);
  const [preview,  setPreview]  = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [sideOpen, setSideOpen] = useState(false);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await api.get('/news/all');
      setNews(res.data.data || []);
    } catch (e) {
      toast.error('فشل تحميل الأخبار: ' + (e.response?.data?.message || e.message));
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchNews(); }, []);

  const openCreate = () => {
    setEditItem(null); setForm(EMPTY);
    setImage(null); setPreview(null); setModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({ title: item.title, content: item.content, summary: item.summary || '', category: item.category, isPublished: item.isPublished });
    setPreview(item.image ? (item.image.startsWith('http') ? item.image : `${BASE_URL}${item.image}`) : null);
    setImage(null); setModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) { toast.error('العنوان والمحتوى مطلوبان'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title',       form.title);
      fd.append('content',     form.content);
      fd.append('summary',     form.summary);
      fd.append('category',    form.category);
      fd.append('isPublished', form.isPublished);
      if (image) fd.append('image', image);

      if (editItem) {
        await api.put(`/news/${editItem._id}`, fd);
        toast.success('✅ تم تحديث الخبر');
      } else {
        await api.post('/news', fd);
        toast.success('✅ تم نشر الخبر بنجاح');
      }
      setModal(false);
      fetchNews();
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      toast.error('❌ فشلت العملية: ' + msg);
      console.error('Submit error:', err.response?.data || err);
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/news/${deleteId}`);
      toast.success('تم حذف الخبر');
      setDeleteId(null);
      fetchNews();
    } catch (e) { toast.error('فشل الحذف: ' + (e.response?.data?.message || e.message)); }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="admin-layout">
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
          <div className="sidebar-user">
            <div className="sidebar-avatar">{user?.name?.[0]}</div>
            <div><div className="sidebar-uname">{user?.name}</div><div className="sidebar-urole">مدير النظام</div></div>
          </div>
          <div style={{ display:'flex', gap:'8px', marginTop:'10px' }}>
            <Link to="/" className="btn btn-outline" style={{ flex:1, justifyContent:'center', padding:'8px', fontSize:'0.82rem' }}>الموقع</Link>
            <button className="btn btn-danger" style={{ flex:1, padding:'8px', fontSize:'0.82rem' }} onClick={handleLogout}>خروج</button>
          </div>
        </div>
      </aside>
      {sideOpen && <div className="sidebar-overlay" onClick={() => setSideOpen(false)} />}

      <div className="admin-main">
        <header className="admin-topbar">
          <button className="hamburger" onClick={() => setSideOpen(v => !v)}><span/><span/><span/></button>
          <h2 className="admin-topbar-title">📰 إدارة الأخبار</h2>
          <span className="topbar-badge">مرحباً، {user?.name?.split(' ')[0]}</span>
        </header>

        <div className="admin-page">
          <div className="admin-page-header">
            <h2>الأخبار ({news.length})</h2>
            <button className="btn btn-primary" onClick={openCreate}>➕ نشر خبر جديد</button>
          </div>

          <div className="card">
            {loading ? (
              <div style={{ padding:'50px', textAlign:'center' }}><div className="spinner"/></div>
            ) : news.length === 0 ? (
              <div style={{ padding:'50px', textAlign:'center', color:'var(--text-muted)' }}>
                <p style={{ fontSize:'2.5rem', marginBottom:'10px' }}>📭</p>
                <p style={{ fontWeight:600 }}>لا توجد أخبار بعد</p>
                <button className="btn btn-primary" style={{ marginTop:'16px' }} onClick={openCreate}>➕ نشر أول خبر</button>
              </div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead><tr><th>العنوان</th><th>الفئة</th><th>الحالة</th><th>المشاهدات</th><th>التاريخ</th><th>الإجراءات</th></tr></thead>
                  <tbody>
                    {news.map(item => (
                      <tr key={item._id}>
                        <td style={{ maxWidth:240 }}>
                          <strong style={{ fontSize:'0.88rem' }}>{item.title.slice(0,55)}{item.title.length>55?'…':''}</strong>
                        </td>
                        <td><span className="badge badge-green">{item.category}</span></td>
                        <td>
                          <span className={`badge ${item.isPublished ? 'badge-green' : 'badge-gold'}`}>
                            {item.isPublished ? '✅ منشور' : '⏸ مسودة'}
                          </span>
                        </td>
                        <td style={{ color:'var(--text-muted)', fontSize:'0.85rem' }}>👁 {item.views}</td>
                        <td style={{ color:'var(--text-muted)', fontSize:'0.82rem' }}>
                          {new Date(item.createdAt).toLocaleDateString('ar-DZ')}
                        </td>
                        <td>
                          <div className="table-actions">
                            <button className="action-btn edit"   onClick={() => openEdit(item)}>✏️ تعديل</button>
                            <button className="action-btn delete" onClick={() => setDeleteId(item._id)}>🗑 حذف</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Modal ── */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editItem ? '✏️ تعديل الخبر' : '➕ نشر خبر جديد'}</h3>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">العنوان *</label>
                <input className="form-control" value={form.title} onChange={e => setForm({...form, title:e.target.value})} placeholder="عنوان الخبر" required />
              </div>
              <div className="form-group">
                <label className="form-label">الملخص</label>
                <input className="form-control" value={form.summary} onChange={e => setForm({...form, summary:e.target.value})} placeholder="ملخص قصير يظهر في القائمة" />
              </div>
              <div className="form-group">
                <label className="form-label">المحتوى *</label>
                <textarea className="form-control" rows="6" value={form.content} onChange={e => setForm({...form, content:e.target.value})} placeholder="محتوى الخبر كاملاً..." required />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
                <div className="form-group">
                  <label className="form-label">الفئة</label>
                  <select className="form-control" value={form.category} onChange={e => setForm({...form, category:e.target.value})}>
                    {CATS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">الحالة</label>
                  <select className="form-control" value={String(form.isPublished)} onChange={e => setForm({...form, isPublished: e.target.value === 'true'})}>
                    <option value="true">منشور</option>
                    <option value="false">مسودة</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">صورة الخبر</label>
                <div className="img-preview">
                  {preview ? <img src={preview} alt="preview" /> : <span className="img-placeholder">📸</span>}
                </div>
                <input type="file" accept="image/*" onChange={handleImageChange} className="form-control" />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>إلغاء</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><div className="btn-spinner"/> جارٍ الحفظ...</> : editItem ? 'حفظ التغييرات' : 'نشر الخبر'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal" style={{ maxWidth:380 }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign:'center', padding:'12px 0' }}>
              <div style={{ fontSize:'3rem', marginBottom:'12px' }}>⚠️</div>
              <h3 style={{ marginBottom:'8px' }}>تأكيد الحذف</h3>
              <p style={{ color:'var(--text-muted)', marginBottom:'24px' }}>هل أنت متأكد من حذف هذا الخبر؟<br/><strong>لا يمكن التراجع.</strong></p>
              <div style={{ display:'flex', gap:'10px', justifyContent:'center' }}>
                <button className="btn btn-outline" onClick={() => setDeleteId(null)}>إلغاء</button>
                <button className="btn btn-danger"  onClick={handleDelete}>نعم، احذف</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
