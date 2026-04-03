import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, api } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './AdminLayout.css';
import './AdminGalleryExtra.css';

const BASE = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL.replace('/api', '')
  : 'http://localhost:5000';

// Works with both Cloudinary URLs (https://...) and local /uploads/...
const imgSrc = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${BASE}${url}`;
};

const EMPTY = { title: '', description: '', category: 'أخرى', isFeatured: false };
const CATS  = ['فعاليات', 'مشاريع', 'بنية تحتية', 'طبيعة', 'أخرى'];
const SIDEBAR = [
  { to: '/admin',               icon: '🏠', label: 'الرئيسية'  },
  { to: '/admin/news',          icon: '📰', label: 'الأخبار'   },
  { to: '/admin/gallery',       icon: '🖼️', label: 'الصور'     },
  { to: '/admin/announcements', icon: '📢', label: 'الإعلانات' },
];

export default function AdminGallery() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [photos,   setPhotos]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form,     setForm]     = useState(EMPTY);
  const [image,    setImage]    = useState(null);
  const [preview,  setPreview]  = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [sideOpen, setSideOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  const fetchPhotos = async () => {
    setLoading(true);
    try {
      const res = await api.get('/gallery?limit=100');
      setPhotos(res.data.data || []);
    } catch (e) { toast.error('فشل التحميل: ' + (e.response?.data?.message || e.message)); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPhotos(); }, []);

  const imgUrl = (url) => imgSrc(url);

  const openCreate = () => { setEditItem(null); setForm(EMPTY); setImage(null); setPreview(null); setModal(true); };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({ title: item.title, description: item.description || '', category: item.category, isFeatured: item.isFeatured });
    setPreview(imgUrl(item.imageUrl));
    setImage(null); setModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('الصورة يجب أن تكون أقل من 5MB'); return; }
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('image/')) { setImage(file); setPreview(URL.createObjectURL(file)); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('عنوان الصورة مطلوب'); return; }
    if (!editItem && !image) { toast.error('يرجى اختيار صورة'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title',       form.title);
      fd.append('description', form.description);
      fd.append('category',    form.category);
      fd.append('isFeatured',  form.isFeatured);
      if (image) fd.append('image', image);

      if (editItem) {
        await api.put(`/gallery/${editItem._id}`, fd);
        toast.success('✅ تم تحديث الصورة');
      } else {
        await api.post('/gallery', fd);
        toast.success('✅ تم رفع الصورة بنجاح');
      }
      setModal(false);
      fetchPhotos();
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      toast.error('❌ فشلت العملية: ' + msg);
      console.error('Gallery error:', err.response?.data || err);
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/gallery/${deleteId}`);
      toast.success('تم حذف الصورة');
      setDeleteId(null); fetchPhotos();
    } catch (e) { toast.error('فشل الحذف: ' + (e.response?.data?.message || e.message)); }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar ${sideOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🏛️</div>
          <div><span className="sidebar-logo-title">بلدية سيدي علي</span><span className="sidebar-logo-sub">لوحة التحكم</span></div>
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
          <button className="hamburger" onClick={() => setSideOpen(v=>!v)}><span/><span/><span/></button>
          <h2 className="admin-topbar-title">🖼️ إدارة معرض الصور</h2>
          <span className="topbar-badge">{photos.length} صورة</span>
        </header>

        <div className="admin-page">
          <div className="admin-page-header">
            <h2>الصور ({photos.length})</h2>
            <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
              <div style={{ display:'flex', border:'2px solid var(--border)', borderRadius:'8px', overflow:'hidden' }}>
                {['grid','table'].map(m => (
                  <button key={m} onClick={() => setViewMode(m)}
                    style={{ padding:'7px 14px', border:'none', cursor:'pointer', fontFamily:'var(--font)', fontWeight:600, fontSize:'0.82rem',
                      background: viewMode===m ? 'var(--primary)' : '#fff',
                      color:      viewMode===m ? '#fff' : 'var(--text-muted)' }}>
                    {m==='grid' ? '⊞ شبكة' : '☰ قائمة'}
                  </button>
                ))}
              </div>
              <button className="btn btn-primary" onClick={openCreate}>📸 رفع صورة جديدة</button>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign:'center', padding:'60px' }}><div className="spinner"/></div>
          ) : photos.length === 0 ? (
            <div className="card" style={{ padding:'60px', textAlign:'center', color:'var(--text-muted)' }}>
              <div style={{ fontSize:'4rem', marginBottom:'12px' }}>📷</div>
              <p style={{ fontWeight:600, fontSize:'1.1rem' }}>لا توجد صور في المعرض</p>
              <button className="btn btn-primary" style={{ marginTop:'20px' }} onClick={openCreate}>📸 رفع أول صورة</button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="gallery-admin-grid">
              {photos.map(photo => (
                <div key={photo._id} className="gallery-admin-card card">
                  <div className="gallery-admin-img">
                    <img src={imgUrl(photo.imageUrl)} alt={photo.title} loading="lazy" />
                    {photo.isFeatured && <span className="featured-star">⭐</span>}
                    <div className="gallery-admin-actions-overlay">
                      <button className="action-btn edit"   onClick={() => openEdit(photo)}>✏️ تعديل</button>
                      <button className="action-btn delete" onClick={() => setDeleteId(photo._id)}>🗑 حذف</button>
                    </div>
                  </div>
                  <div className="gallery-admin-info">
                    <h4>{photo.title}</h4>
                    {photo.description && <p>{photo.description.slice(0,60)}{photo.description.length>60?'…':''}</p>}
                    <span className="gallery-cat-badge">{photo.category}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card">
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead><tr><th>الصورة</th><th>العنوان</th><th>الفئة</th><th>مميزة</th><th>التاريخ</th><th>الإجراءات</th></tr></thead>
                  <tbody>
                    {photos.map(photo => (
                      <tr key={photo._id}>
                        <td><img src={imgUrl(photo.imageUrl)} alt={photo.title} style={{ width:64, height:48, objectFit:'cover', borderRadius:6 }}/></td>
                        <td><strong style={{ fontSize:'0.88rem' }}>{photo.title}</strong></td>
                        <td><span className="badge badge-green">{photo.category}</span></td>
                        <td>{photo.isFeatured ? '⭐' : '—'}</td>
                        <td style={{ fontSize:'0.82rem', color:'var(--text-muted)' }}>{new Date(photo.createdAt).toLocaleDateString('ar-DZ')}</td>
                        <td>
                          <div className="table-actions">
                            <button className="action-btn edit"   onClick={() => openEdit(photo)}>✏️ تعديل</button>
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

      {/* ── Modal ── */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editItem ? '✏️ تعديل الصورة' : '📸 رفع صورة جديدة'}</h3>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">الصورة {!editItem && '*'}</label>
                <div className={`drop-zone ${preview ? 'has-image' : ''}`}
                  onDrop={handleDrop} onDragOver={e => e.preventDefault()}
                  onClick={() => document.getElementById('gfile').click()}>
                  {preview
                    ? <img src={preview} alt="preview" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                    : <div className="drop-zone-placeholder">
                        <span style={{ fontSize:'2.5rem' }}>📸</span>
                        <p>اسحب وأفلت أو <strong>انقر للاختيار</strong></p>
                        <span style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>PNG, JPG, WebP — بحد أقصى 5MB</span>
                      </div>
                  }
                </div>
                <input id="gfile" type="file" accept="image/*" style={{ display:'none' }} onChange={handleImageChange}/>
                {preview && (
                  <button type="button" className="btn btn-outline btn-sm" style={{ marginTop:'8px' }}
                    onClick={() => { setImage(null); setPreview(editItem ? imgUrl(editItem.imageUrl) : null); }}>
                    🔄 تغيير الصورة
                  </button>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">عنوان الصورة *</label>
                <input className="form-control" value={form.title}
                  onChange={e => setForm({...form, title:e.target.value})}
                  placeholder="أدخل عنواناً وصفياً" required />
              </div>

              <div className="form-group">
                <label className="form-label">الوصف</label>
                <textarea className="form-control" rows="3" value={form.description}
                  onChange={e => setForm({...form, description:e.target.value})}
                  placeholder="وصف مختصر للصورة (اختياري)" />
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
                <div className="form-group">
                  <label className="form-label">الفئة</label>
                  <select className="form-control" value={form.category}
                    onChange={e => setForm({...form, category:e.target.value})}>
                    {CATS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">تمييز الصورة ⭐</label>
                  <div className={`toggle-featured ${form.isFeatured ? 'on' : 'off'}`}
                    onClick={() => setForm({...form, isFeatured:!form.isFeatured})}>
                    <span className="toggle-thumb"/>
                    <span className="toggle-label">{form.isFeatured ? '⭐ مميزة' : 'عادية'}</span>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>إلغاء</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><div className="btn-spinner"/> جارٍ الرفع...</> : editItem ? 'حفظ التغييرات' : 'رفع الصورة'}
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
              <div style={{ fontSize:'3rem', marginBottom:'12px' }}>🗑️</div>
              <h3 style={{ marginBottom:'8px' }}>حذف الصورة</h3>
              <p style={{ color:'var(--text-muted)', marginBottom:'24px' }}>هل أنت متأكد؟ <strong>لا يمكن التراجع.</strong></p>
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
