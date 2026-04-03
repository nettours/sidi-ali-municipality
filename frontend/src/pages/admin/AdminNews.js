import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, api } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './AdminLayout.css';

const BASE = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL.replace('/api', '')
  : 'http://localhost:5000';

// Works with both Cloudinary URLs (https://...) and local /uploads/...
const imgSrc = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${BASE}${url}`;
};


const EMPTY = { title:'', content:'', summary:'', category:'عام', isPublished:true };
const CATS  = ['عام','صحة','تعليم','بنية تحتية','ثقافة','رياضة','أخرى'];
const SIDEBAR = [
  { to:'/admin',               icon:'🏠', label:'الرئيسية'  },
  { to:'/admin/news',          icon:'📰', label:'الأخبار'   },
  { to:'/admin/gallery',       icon:'🖼️', label:'الصور'     },
  { to:'/admin/announcements', icon:'📢', label:'الإعلانات' },
];

export default function AdminNews() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [news,      setNews]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [modal,     setModal]     = useState(false);
  const [editItem,  setEditItem]  = useState(null);
  const [form,      setForm]      = useState(EMPTY);
  const [mainImg,   setMainImg]   = useState(null);      // File
  const [mainPrev,  setMainPrev]  = useState(null);      // URL
  const [extraImgs, setExtraImgs] = useState([]);        // File[]
  const [extraPrev, setExtraPrev] = useState([]);        // URL[]
  const [videoUrl,  setVideoUrl]  = useState('');         // YouTube link
  const [videoFile, setVideoFile] = useState(null);       // File
  const [saving,    setSaving]    = useState(false);
  const [deleteId,  setDeleteId]  = useState(null);
  const [sideOpen,  setSideOpen]  = useState(false);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await api.get('/news/all');
      setNews(res.data.data || []);
    } catch (e) { toast.error('فشل التحميل'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNews(); }, []);

  const openCreate = () => {
    setEditItem(null); setForm(EMPTY);
    setMainImg(null); setMainPrev(null);
    setExtraImgs([]); setExtraPrev([]);
    setVideoUrl(''); setVideoFile(null);
    setModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({ title:item.title, content:item.content, summary:item.summary||'', category:item.category, isPublished:item.isPublished });
    setMainPrev(item.image ? imgSrc(item.image) : null);
    setExtraPrev((item.images||[]).map(imgSrc));
    setVideoUrl(item.videoUrl||'');
    setMainImg(null); setExtraImgs([]); setVideoFile(null);
    setModal(true);
  };

  const handleMainImg = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setMainImg(f); setMainPrev(URL.createObjectURL(f));
  };

  const handleExtraImgs = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    setExtraImgs(files);
    setExtraPrev(files.map(f => URL.createObjectURL(f)));
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
      if (mainImg)  fd.append('image', mainImg);
      extraImgs.forEach(f => fd.append('images', f));
      if (videoUrl.trim()) fd.append('videoUrl', videoUrl.trim());
      if (videoFile) fd.append('videoFile', videoFile);

      if (editItem) {
        await api.put(`/news/${editItem._id}`, fd);
        toast.success('✅ تم تحديث الخبر');
      } else {
        await api.post('/news', fd);
        toast.success('✅ تم نشر الخبر');
      }
      setModal(false); fetchNews();
    } catch (err) {
      toast.error('❌ ' + (err.response?.data?.message || err.message));
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/news/${deleteId}`);
      toast.success('تم الحذف'); setDeleteId(null); fetchNews();
    } catch (e) { toast.error('فشل الحذف'); }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sideOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🏛️</div>
          <div><span className="sidebar-logo-title">بلدية سيدي علي</span><span className="sidebar-logo-sub">لوحة التحكم</span></div>
        </div>
        <nav className="sidebar-nav">
          {SIDEBAR.map(s => (
            <Link key={s.to} to={s.to} className={`sidebar-link ${window.location.pathname===s.to?'active':''}`} onClick={()=>setSideOpen(false)}>
              <span className="sidebar-icon">{s.icon}</span><span>{s.label}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{user?.name?.[0]}</div>
            <div><div className="sidebar-uname">{user?.name}</div><div className="sidebar-urole">مدير النظام</div></div>
          </div>
          <div style={{display:'flex',gap:8,marginTop:10}}>
            <Link to="/" className="btn btn-outline" style={{flex:1,justifyContent:'center',padding:'8px',fontSize:'0.82rem'}}>الموقع</Link>
            <button className="btn btn-danger" style={{flex:1,padding:'8px',fontSize:'0.82rem'}} onClick={()=>{logout();navigate('/');}}>خروج</button>
          </div>
        </div>
      </aside>
      {sideOpen && <div className="sidebar-overlay" onClick={()=>setSideOpen(false)}/>}

      <div className="admin-main">
        <header className="admin-topbar">
          <button className="hamburger" onClick={()=>setSideOpen(v=>!v)}><span/><span/><span/></button>
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
              <div style={{padding:50,textAlign:'center'}}><div className="spinner"/></div>
            ) : news.length === 0 ? (
              <div style={{padding:50,textAlign:'center',color:'var(--text-muted)'}}>
                <p style={{fontSize:'2.5rem'}}>📭</p>
                <p style={{fontWeight:600,marginTop:8}}>لا توجد أخبار بعد</p>
                <button className="btn btn-primary" style={{marginTop:16}} onClick={openCreate}>➕ نشر أول خبر</button>
              </div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead><tr><th>العنوان</th><th>الفئة</th><th>الحالة</th><th>الصور</th><th>المشاهدات</th><th>التاريخ</th><th>الإجراءات</th></tr></thead>
                  <tbody>
                    {news.map(item => (
                      <tr key={item._id}>
                        <td style={{maxWidth:200}}>
                          {item.image && <img src={imgSrc(item.image)} alt="" style={{width:40,height:30,objectFit:'cover',borderRadius:4,marginLeft:8,verticalAlign:'middle'}}/>}
                          <strong style={{fontSize:'0.88rem'}}>{item.title.slice(0,45)}{item.title.length>45?'…':''}</strong>
                        </td>
                        <td><span className="badge badge-green">{item.category}</span></td>
                        <td><span className={`badge ${item.isPublished?'badge-green':'badge-gold'}`}>{item.isPublished?'✅ منشور':'⏸ مسودة'}</span></td>
                        <td style={{color:'var(--text-muted)',fontSize:'0.85rem'}}>🖼 {1 + (item.images?.length||0)}</td>
                        <td style={{color:'var(--text-muted)',fontSize:'0.85rem'}}>👁 {item.views}</td>
                        <td style={{color:'var(--text-muted)',fontSize:'0.82rem'}}>{new Date(item.createdAt).toLocaleDateString('ar-DZ')}</td>
                        <td>
                          <div className="table-actions">
                            <button className="action-btn edit"   onClick={()=>openEdit(item)}>✏️ تعديل</button>
                            <button className="action-btn delete" onClick={()=>setDeleteId(item._id)}>🗑 حذف</button>
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

      {/* ── Modal ─────────────────────────────────────────── */}
      {modal && (
        <div className="modal-overlay" onClick={()=>setModal(false)}>
          <div className="modal" style={{maxWidth:620}} onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editItem?'✏️ تعديل الخبر':'➕ نشر خبر جديد'}</h3>
              <button className="modal-close" onClick={()=>setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">العنوان *</label>
                <input className="form-control" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="عنوان الخبر" required/>
              </div>
              <div className="form-group">
                <label className="form-label">الملخص <span style={{color:'var(--text-muted)',fontWeight:400}}>(يظهر في القائمة)</span></label>
                <input className="form-control" value={form.summary} onChange={e=>setForm({...form,summary:e.target.value})} placeholder="ملخص قصير للخبر"/>
              </div>
              <div className="form-group">
                <label className="form-label">المحتوى الكامل *</label>
                <textarea className="form-control" rows="7" value={form.content} onChange={e=>setForm({...form,content:e.target.value})} placeholder="اكتب تفاصيل الخبر هنا..." required/>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                <div className="form-group">
                  <label className="form-label">الفئة</label>
                  <select className="form-control" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
                    {CATS.map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">الحالة</label>
                  <select className="form-control" value={String(form.isPublished)} onChange={e=>setForm({...form,isPublished:e.target.value==='true'})}>
                    <option value="true">✅ منشور</option>
                    <option value="false">⏸ مسودة</option>
                  </select>
                </div>
              </div>

              {/* Main image */}
              <div className="form-group">
                <label className="form-label">📸 الصورة الرئيسية</label>
                {mainPrev && (
                  <div style={{height:160,borderRadius:'var(--radius-sm)',overflow:'hidden',marginBottom:8}}>
                    <img src={mainPrev} alt="main" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                  </div>
                )}
                <input type="file" accept="image/*" className="form-control" onChange={handleMainImg}/>
              </div>

              {/* Extra images */}
              <div className="form-group">
                <label className="form-label">🖼️ صور إضافية <span style={{color:'var(--text-muted)',fontWeight:400}}>(حتى 5 صور)</span></label>
                {extraPrev.length > 0 && (
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(90px,1fr))',gap:8,marginBottom:8}}>
                    {extraPrev.map((p,i)=>(
                      <div key={i} style={{aspectRatio:'1',borderRadius:8,overflow:'hidden'}}>
                        <img src={p} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                      </div>
                    ))}
                  </div>
                )}
                <input type="file" accept="image/*" multiple className="form-control" onChange={handleExtraImgs}/>
                <small style={{color:'var(--text-muted)',fontSize:'0.75rem'}}>يمكنك اختيار عدة صور دفعة واحدة (Ctrl+Click)</small>
              </div>


              {/* Video section */}
              <div style={{ background:'#f8faf8', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', padding:'16px', marginBottom:'16px' }}>
                <label className="form-label">🎬 فيديو مرفق (اختياري)</label>
                <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:'10px' }}>
                  <div>
                    <label style={{ fontSize:'0.82rem', color:'var(--text-muted)', marginBottom:'5px', display:'block' }}>رابط يوتيوب أو فيديو خارجي</label>
                    <input className="form-control" dir="ltr" value={videoUrl}
                      onChange={e=>setVideoUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..." />
                  </div>
                  <div>
                    <label style={{ fontSize:'0.82rem', color:'var(--text-muted)', marginBottom:'5px', display:'block' }}>أو ارفع ملف فيديو (MP4 حتى 100MB)</label>
                    <input type="file" accept="video/mp4,video/webm,video/ogg" className="form-control"
                      onChange={e=>setVideoFile(e.target.files[0]||null)}/>
                    {videoFile && <small style={{color:'var(--primary)',fontWeight:700}}>✅ {videoFile.name}</small>}
                  </div>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={()=>setModal(false)}>إلغاء</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving?<><div className="btn-spinner"/> جارٍ الحفظ...</>:editItem?'حفظ التغييرات':'نشر الخبر'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete ── */}
      {deleteId && (
        <div className="modal-overlay" onClick={()=>setDeleteId(null)}>
          <div className="modal" style={{maxWidth:360}} onClick={e=>e.stopPropagation()}>
            <div style={{textAlign:'center',padding:'16px 0'}}>
              <div style={{fontSize:'3rem',marginBottom:12}}>⚠️</div>
              <h3 style={{marginBottom:8}}>تأكيد الحذف</h3>
              <p style={{color:'var(--text-muted)',marginBottom:24}}>هل أنت متأكد؟ <strong>لا يمكن التراجع.</strong></p>
              <div style={{display:'flex',gap:10,justifyContent:'center'}}>
                <button className="btn btn-outline" onClick={()=>setDeleteId(null)}>إلغاء</button>
                <button className="btn btn-danger"  onClick={handleDelete}>نعم، احذف</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
