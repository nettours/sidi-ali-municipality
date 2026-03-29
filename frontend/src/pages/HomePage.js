import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../context/AuthContext';
import './HomePage.css';

const BASE = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL.replace('/api', '')
  : 'http://localhost:5000';

const imgSrc = (url) => !url ? null : url.startsWith('http') ? url : `${BASE}${url}`;

const PRIORITY_COLOR = {
  'عاجل':  { bg:'#fde8e8', color:'#c0392b' },
  'عالي':  { bg:'#fff3e0', color:'#e67e22' },
  'متوسط': { bg:'#e8f0ff', color:'#2563eb' },
  'منخفض': { bg:'#f0f4f0', color:'#6b7280' },
};

/* ── Algerian Flag SVG ──────────────────────────────────── */
const AlgerianFlag = ({ size = 48 }) => (
  <svg width={size} height={size * 0.667} viewBox="0 0 3 2" xmlns="http://www.w3.org/2000/svg">
    <rect width="1.5" height="2" fill="#006233"/>
    <rect x="1.5" width="1.5" height="2" fill="#fff"/>
    <circle cx="1.5" cy="1" r="0.4" fill="#fff"/>
    <circle cx="1.58" cy="1" r="0.4" fill="#006233"/>
    <polygon points="1.5,0.6 1.61,0.93 1.45,0.73 1.55,0.73 1.39,0.93" fill="#d21034"/>
  </svg>
);

export default function HomePage() {
  const [news,     setNews]     = useState([]);
  const [gallery,  setGallery]  = useState([]);
  const [fbPhotos, setFbPhotos] = useState([]);
  const [annons,   setAnnons]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [tickIdx,  setTickIdx]  = useState(0);

  const fetchAll = useCallback(async () => {
    try {
      const [n, g, a, fb] = await Promise.allSettled([
        api.get('/news?limit=4'),
        api.get('/gallery?limit=6'),
        api.get('/announcements'),
        api.get('/facebook/photos?limit=6'),
      ]);
      if (n.status==='fulfilled')  setNews(n.value.data.data||[]);
      if (g.status==='fulfilled')  setGallery(g.value.data.data||[]);
      if (a.status==='fulfilled')  setAnnons(a.value.data.data||[]);
      if (fb.status==='fulfilled') setFbPhotos(fb.value.data.data||[]);
    } catch(e){ console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useEffect(() => {
    if (annons.length < 2) return;
    const t = setInterval(() => setTickIdx(i => (i+1) % annons.length), 5000);
    return () => clearInterval(t);
  }, [annons]);

  const allPhotos = [...fbPhotos, ...gallery].slice(0, 9);

  return (
    <div className="home">

      {/* ══════════════ HERO ══════════════════════════════════ */}
      <section className="hero">
        {/* Background layers */}
        <div className="hero-bg-img" />
        <div className="hero-overlay" />
        <div className="hero-pattern" />

        <div className="container hero-inner">
          {/* Left content */}
          <div className="hero-content anim-slide">

            {/* Official badge with flag */}
            <div className="hero-official-badge">
              <AlgerianFlag size={36} />
              <div className="hero-badge-text">
                <span className="hero-badge-top">الجمهورية الجزائرية الديمقراطية الشعبية</span>
                <span className="hero-badge-bot">ولاية مستغانم — دائرة سيدي علي</span>
              </div>
            </div>

            <h1 className="hero-title">
              <span className="hero-title-small">بـلـديـة</span>
              <span className="hero-title-big">سيـدي عـلي</span>
            </h1>

            <p className="hero-desc">
              الموقع الرسمي للبلدية — نخدمكم بشفافية ومسؤولية<br/>
              <em>Site officiel de la Commune de Sidi Ali</em>
            </p>

            <div className="hero-cta">
              <Link to="/news"    className="btn btn-gold btn-lg">📰 آخر الأخبار</Link>
              <Link to="/gallery" className="btn btn-white btn-lg">🖼️ معرض الصور</Link>
            </div>

            {/* Stats */}
            <div className="hero-stats">
              {[
                { n:'+50',  l:'خدمة إدارية' },
                { n:'24/7', l:'متاح دائماً' },
                { n:'1962', l:'سنة التأسيس' },
                { n:'+30K', l:'مواطن' },
              ].map((s,i) => (
                <div key={i} className="hero-stat">
                  <span className="hs-num">{s.n}</span>
                  <span className="hs-lbl">{s.l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: emblem card */}
          <div className="hero-card anim-fade">
            <div className="hero-emblem-wrap">
              <div className="he-ring he-r1"/>
              <div className="he-ring he-r2"/>
              <div className="he-center">
                {/* Mosque / building icon */}
                <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="60" cy="60" r="55" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
                  {/* Main building */}
                  <rect x="25" y="55" width="70" height="45" rx="2" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
                  {/* Door */}
                  <rect x="51" y="75" width="18" height="25" rx="3" fill="rgba(255,255,255,0.8)"/>
                  {/* Windows */}
                  <rect x="32" y="65" width="12" height="10" rx="2" fill="rgba(255,255,255,0.6)"/>
                  <rect x="76" y="65" width="12" height="10" rx="2" fill="rgba(255,255,255,0.6)"/>
                  {/* Dome */}
                  <path d="M45 55 Q60 30 75 55" fill="rgba(212,160,23,0.5)" stroke="rgba(212,160,23,0.9)" strokeWidth="1.5"/>
                  {/* Minaret */}
                  <rect x="87" y="35" width="8" height="45" rx="1" fill="rgba(255,255,255,0.4)" stroke="rgba(255,255,255,0.6)" strokeWidth="1"/>
                  <rect x="86" y="30" width="10" height="8" rx="1" fill="rgba(212,160,23,0.8)"/>
                  {/* Star & crescent hint */}
                  <text x="55" y="50" fontSize="14" fill="rgba(212,160,23,0.9)" fontFamily="serif">☾</text>
                  {/* Base line */}
                  <line x1="20" y1="100" x2="100" y2="100" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
                </svg>
              </div>
            </div>
            <div className="hero-card-text">
              <div className="hero-card-ar">ب · س · ع</div>
              <div className="hero-card-fr">Commune de Sidi Ali</div>
            </div>
            {/* Algerian flag strip */}
            <div className="hero-flag-strip">
              <div className="flag-green"/>
              <div className="flag-white">
                <span className="flag-crescent">☾★</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll arrow */}
        <a href="#announcements" className="hero-scroll">↓</a>
      </section>

      {/* ══════════════ TICKER ════════════════════════════════ */}
      {annons.length > 0 && (
        <div className="ticker">
          <div className="ticker-tag">📢 إعلان</div>
          <div className="ticker-text">{annons[tickIdx]?.title}</div>
          <div className="ticker-dots">
            {annons.slice(0,5).map((_,i) => (
              <button key={i} className={`td ${i===tickIdx?'active':''}`} onClick={()=>setTickIdx(i)}/>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════ ANNOUNCEMENTS ═════════════════════════ */}
      {annons.length > 0 && (
        <section id="announcements" className="section-pad ann-section">
          <div className="container">
            <div className="sh">
              <p className="section-eyebrow">📢 إعلانات رسمية</p>
              <h2 className="section-heading">أحدث <span>الإعلانات</span></h2>
            </div>
            <div className="ann-grid">
              {annons.slice(0,4).map((a,i) => {
                const pc = PRIORITY_COLOR[a.priority] || PRIORITY_COLOR['منخفض'];
                return (
                  <div key={a._id} className={`ann-card card card-hover anim-slide d${Math.min(i+1,4)}`}>
                    <div className="ann-top">
                      <span className="badge badge-green">{a.type}</span>
                      <span className="ann-priority" style={{background:pc.bg, color:pc.color}}>{a.priority}</span>
                    </div>
                    <h3 className="ann-title">{a.title}</h3>
                    <p className="ann-body">{a.content.slice(0,120)}{a.content.length>120?'…':''}</p>
                    <span className="ann-date">📅 {new Date(a.createdAt).toLocaleDateString('ar-DZ',{year:'numeric',month:'long',day:'numeric'})}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════ NEWS ══════════════════════════════════ */}
      <section className="section-pad news-section">
        <div className="container">
          <div className="sh-row">
            <div>
              <p className="section-eyebrow">📰 أخبار محلية</p>
              <h2 className="section-heading">آخر <span>الأخبار</span></h2>
            </div>
            <Link to="/news" className="btn btn-outline">عرض الكل →</Link>
          </div>

          {loading ? (
            <div className="news-grid">
              {[1,2,3,4].map(i=><div key={i} className="skeleton" style={{height:310,borderRadius:'var(--radius)'}}/>)}
            </div>
          ) : news.length === 0 ? (
            <div className="empty-state"><span className="empty-icon">📭</span><p>لا توجد أخبار حالياً</p></div>
          ) : (
            <div className="news-grid">
              {news.map((item, idx) => (
                <Link to={`/news/${item._id}`} key={item._id}
                  className={`nc card card-hover anim-slide d${Math.min(idx+1,4)} ${idx===0?'nc-feat':''}`}>
                  <div className="nc-img">
                    {item.image
                      ? <img src={imgSrc(item.image)} alt={item.title} loading="lazy"/>
                      : <div className="nc-img-ph">📰</div>
                    }
                    {(item.images?.length>0) && (
                      <span className="nc-multi-badge">🖼 +{item.images.length}</span>
                    )}
                    <span className="badge badge-green nc-cat">{item.category}</span>
                  </div>
                  <div className="nc-body">
                    <h3 className="nc-title">{item.title}</h3>
                    {item.summary && <p className="nc-summary">{item.summary}</p>}
                    <div className="nc-foot">
                      <span>📅 {new Date(item.createdAt).toLocaleDateString('ar-DZ',{month:'short',day:'numeric',year:'numeric'})}</span>
                      <span className="nc-more">اقرأ المزيد ←</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════ PHOTO GALLERY ═════════════════════════ */}
      {allPhotos.length > 0 && (
        <section className="section-pad gallery-section">
          <div className="container">
            <div className="sh-row">
              <div>
                <p className="section-eyebrow">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13" style={{marginLeft:4}}>
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                  معرض الصور
                </p>
                <h2 className="section-heading">صور من <span>البلدية</span></h2>
              </div>
              <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                <a href="https://www.facebook.com/profile.php?id=100063508553211"
                  target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                  📘 صفحة فيسبوك
                </a>
                <Link to="/gallery" className="btn btn-primary btn-sm">المعرض الكامل</Link>
              </div>
            </div>
            <div className="ph-masonry">
              {allPhotos.map((photo, i) => {
                const url   = photo.imageUrl || photo.thumbnail;
                const title = photo.title;
                return (
                  <div key={photo._id||photo.id||i}
                    className={`ph-item anim-fade d${Math.min(i+1,5)} ${i===0||i===4?'ph-wide':''}`}>
                    <img src={imgSrc(url)} alt={title} loading="lazy"/>
                    <div className="ph-overlay">
                      <h4>{title}</h4>
                      {photo.description && <p>{photo.description}</p>}
                      {photo.source==='facebook' && (
                        <span className="ph-fb">📘 فيسبوك</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════ SERVICES ══════════════════════════════ */}
      <section className="services-strip">
        <div className="container srv-grid">
          {[
            { icon:'📋', t:'الوثائق الإدارية',   d:'شهادات الميلاد، عقود الزواج، الإقامة' },
            { icon:'🏗️', t:'المشاريع التنموية',  d:'متابعة أشغال البنية التحتية' },
            { icon:'🌿', t:'البيئة والنظافة',     d:'جمع النفايات والمساحات الخضراء' },
            { icon:'🤝', t:'الشؤون الاجتماعية',  d:'دعم الأسر المحتاجة والمساعدات' },
          ].map((s,i) => (
            <div key={i} className={`srv-item anim-slide d${i+1}`}>
              <div className="srv-icon">{s.icon}</div>
              <div>
                <div className="srv-title">{s.t}</div>
                <div className="srv-desc">{s.d}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════ CTA ═══════════════════════════════════ */}
      <section className="cta-section">
        <div className="cta-deco"/>
        <div className="container cta-inner">
          <div className="cta-flag">
            <AlgerianFlag size={52}/>
          </div>
          <div className="cta-text anim-slide d1">
            <h2>ابقَ على اطلاع دائم بأخبار بلديتك</h2>
            <p>سجّل حساباً مجانياً للحصول على إشعارات فورية بالأخبار والإعلانات</p>
          </div>
          <div className="cta-actions anim-slide d2">
            <Link to="/register" className="btn btn-gold btn-lg">إنشاء حساب مجاناً</Link>
            <a href="https://www.facebook.com/profile.php?id=100063508553211"
              target="_blank" rel="noreferrer" className="btn btn-white btn-lg">
              📘 تابعنا على فيسبوك
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
