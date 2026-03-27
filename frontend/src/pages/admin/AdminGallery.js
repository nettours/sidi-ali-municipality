import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import './AdminLayout.css';
import './AdminGalleryExtra.css';

const BASE_URL = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL.replace('/api', '')
  : 'http://localhost:5000';

const EMPTY_FORM = { title: '', description: '', category: 'أخرى', isFeatured: false };
const CATS = ['فعاليات', 'مشاريع', 'بنية تحتية', 'طبيعة', 'أخرى'];

const SIDEBAR = [
  { to: '/admin',               icon: '🏠', label: 'الرئيسية'  },
  { to: '/admin/news',          icon: '📰', label: 'الأخبار'   },
  { to: '/admin/gallery',       icon: '🖼️', label: 'الصور'     },
  { to: '/admin/announcements', icon: '📢', label: 'الإعلانات' },
];

export default function AdminGallery() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [photos,   setPhotos]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [image,    setImage]    = useState(null);
  const [preview,  setPreview]  = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [sideOpen, setSideOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  const fetchPhotos = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/gallery?limit=100');
      setPhotos(res.data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPhotos(); }, []);

  const openCreate = () => {
    setEditItem(null);
    setForm(EMPTY_FORM);
    setImage(null);
    setPreview(null);
    setModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      title: item.title,
      description: item.description || '',
      category: item.category,
      isFeatured: item.isFeatured
    });
    setPreview(`${BASE_URL}${item.imageUrl}`);
    setImage(null);
    setModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('حجم الصورة يجب أن يكون أقل من 5MB'); return; }
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title) { toast.error('عنوان الصورة مطلوب'); return; }
    if (!editItem && !image) { toast.error('يرجى اختيار صورة'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('category', form.category);
      fd.append('isFeatured', form.isFeatured);
      if (image) fd.append('image', image);

      if (editItem) {
        await axios.put(`/gallery/${editItem._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('تم تحديث الصورة بنجاح ✅');
      } else {
        await axios.post('/gallery', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('تم رفع الصورة بنجاح ✅');
      }
      setModal(false);
      fetchPhotos();
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشلت العملية');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`/gallery/${deleteId}`);
      toast.success('تم حذف الصورة');
      setDeleteId(null);
      fetchPhotos();
    } catch { toast.error('فشل الحذف'); }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="admin-layout">
      {/* ── Sidebar ──────────────────────────────────── */}
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

      {/* ── Main ─────────────────────────────────────── */}
      <div className="admin-main">
        <header className="admin-topbar">
          <button className="hamburger" onClick={() => setSideOpen(v => !v)}>
            <span /><span /><span />
          </button>
          <h2 className="admin-topbar-title">🖼️ إدارة معرض الصور</h2>
        </header>

        <div className="admin-page">
          <div className="admin-page-header">
            <h2>الصور ({photos.length})</h2>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {/* View Toggle */}
              <div style={{ display: 'flex', border: '2px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                <button
                  onClick={() => setViewMode('grid')}
                  style={{
                    padding: '7px 14px', border: 'none', cursor: 'pointer',
                    background: viewMode === 'grid' ? 'var(--primary)' : '#fff',
                    color: viewMode === 'grid' ? '#fff' : 'var(--text-muted)',
                    fontFamily: 'var(--font-main)', fontWeight: '600', fontSize: '0.82rem'
                  }}>
                  ⊞ شبكة
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  style={{
                    padding: '7px 14px', border: 'none', cursor: 'pointer',
                    background: viewMode === 'table' ? 'var(--primary)' : '#fff',
                    color: viewMode === 'table' ? '#fff' : 'var(--text-muted)',
                    fontFamily: 'var(--font-main)', fontWeight: '600', fontSize: '0.82rem'
                  }}>
                  ☰ قائمة
                </button>
              </div>
              <button className="btn btn-primary" onClick={openCreate}>📸 رفع صورة جديدة</button>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px' }}><div className="spinner" /></div>
          ) : photos.length === 0 ? (
            <div className="card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '4rem', marginBottom: '12px' }}>📷</div>
              <p style={{ fontSize: '1.1rem', fontWeight: '600' }}>لا توجد صور في المعرض</p>
              <p style={{ marginTop: '6px' }}>ابدأ برفع أول صورة للمعرض</p>
              <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={openCreate}>📸 رفع صورة</button>
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid View */
            <div className="gallery-admin-grid">
              {photos.map(photo => (
                <div key={photo._id} className="gallery-admin-card card">
                  <div className="gallery-admin-img">
                    <img src={`${BASE_URL}${photo.imageUrl}`} alt={photo.title} loading="lazy" />
                    {photo.isFeatured && <span className="featured-star">⭐</span>}
                    <div className="gallery-admin-actions-overlay">
                      <button className="action-btn edit" onClick={() => openEdit(photo)}>✏️ تعديل</button>
                      <button className="action-btn delete" onClick={() => setDeleteId(photo._id)}>🗑 حذف</button>
                    </div>
                  </div>
                  <div className="gallery-admin-info">
                    <h4>{photo.title}</h4>
                    {photo.description && <p>{photo.description.slice(0, 60)}{photo.description.length > 60 ? '...' : ''}</p>}
                    <span className="gallery-cat-badge">{photo.category}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Table View */
            <div className="card">
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>الصورة</th><th>العنوان</th><th>الفئة</th>
                      <th>مميزة</th><th>التاريخ</th><th>الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {photos.map(photo => (
                      <tr key={photo._id}>
                        <td>
                          <img src={`${BASE_URL}${photo.imageUrl}`} alt={photo.title}
                            style={{ width: '64px', height: '48px', objectFit: 'cover', borderRadius: '6px' }} />
                        </td>
                        <td style={{ maxWidth: '200px' }}>
                          <strong style={{ fontSize: '0.9rem' }}>{photo.title}</strong>
                          {photo.description && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '3px' }}>{photo.description.slice(0, 50)}...</div>}
                        </td>
                        <td><span className="badge badge-primary">{photo.category}</span></td>
                        <td>{photo.isFeatured ? '⭐ نعم' : '—'}</td>
                        <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          {new Date(photo.createdAt).toLocaleDateString('ar-DZ')}
                        </td>
                        <td>
                          <div className="table-actions">
                            <button className="action-btn edit" onClick={() => openEdit(photo)}>✏️ تعديل</button>
                            <button className="action-btn delete" onClick={() => setDeleteId(photo._id)}>🗑 حذف</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Create/Edit Modal ─────────────────────────── */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editItem ? '✏️ تعديل الصورة' : '📸 رفع صورة جديدة'}</h3>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              {/* Drop Zone */}
              <div className="form-group">
                <label className="form-label">الصورة {!editItem && '*'}</label>
                <div
                  className={`drop-zone ${preview ? 'has-image' : ''}`}
                  onDrop={handleDrop}
                  onDragOver={e => e.preventDefault()}
                  onClick={() => document.getElementById('gallery-file-input').click()}
                >
                  {preview ? (
                    <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div className="drop-zone-placeholder">
                      <span style={{ fontSize: '2.5rem' }}>📸</span>
                      <p>اسحب وأفلت الصورة هنا، أو <strong>انقر للاختيار</strong></p>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>PNG, JPG, WebP — بحد أقصى 5MB</span>
                    </div>
                  )}
                </div>
                <input
                  id="gallery-file-input"
                  type="file" accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageChange}
                />
                {preview && (
                  <button type="button" className="btn btn-outline"
                    style={{ marginTop: '8px', padding: '6px 14px', fontSize: '0.82rem' }}
                    onClick={() => { setImage(null); setPreview(editItem ? `${BASE_URL}${editItem.imageUrl}` : null); }}>
                    🔄 تغيير الصورة
                  </button>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">عنوان الصورة *</label>
                <input className="form-control" value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="أدخل عنواناً وصفياً للصورة" required />
              </div>

              <div className="form-group">
                <label className="form-label">وصف الصورة</label>
                <textarea className="form-control" rows="3" value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="وصف مختصر للصورة (اختياري)" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">الفئة</label>
                  <select className="form-control" value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}>
                    {CATS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">تمييز الصورة</label>
                  <div
                    className={`toggle-featured ${form.isFeatured ? 'on' : 'off'}`}
                    onClick={() => setForm({ ...form, isFeatured: !form.isFeatured })}
                  >
                    <span className="toggle-thumb" />
                    <span className="toggle-label">{form.isFeatured ? '⭐ مميزة' : 'عادية'}</span>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>إلغاء</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving
                    ? <><div className="btn-spinner" /> جارٍ الرفع...</>
                    : editItem ? 'حفظ التغييرات' : 'رفع الصورة'
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ────────────────────────────── */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal" style={{ maxWidth: '380px' }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🗑️</div>
              <h3 style={{ marginBottom: '10px' }}>حذف الصورة</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
                هل أنت متأكد من حذف هذه الصورة؟<br />
                <strong>لا يمكن التراجع عن هذا الإجراء.</strong>
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button className="btn btn-outline" onClick={() => setDeleteId(null)}>إلغاء</button>
                <button className="btn btn-danger" onClick={handleDelete}>نعم، احذف الصورة</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
