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

/* ─── Algerian Flag — SVG correct & large ─────────────── */
function AlgerianFlag({ className = '', size = 80 }) {
  const w = size, h = Math.round(size * 0.667);
  return (
    <svg className={className} width={w} height={h}
      viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
      {/* Green half */}
      <rect x="0"   y="0" width="150" height="200" fill="#006233"/>
      {/* White half */}
      <rect x="150" y="0" width="150" height="200" fill="#ffffff"/>
      {/* White circle (overlapping center) */}
      <circle cx="155" cy="100" r="55" fill="#ffffff"/>
      {/* Green circle (crescent cut) */}
      <circle cx="172" cy="100" r="55" fill="#006233"/>
      {/* White crescent visible part override */}
      <circle cx="155" cy="100" r="55" fill="none" stroke="#ffffff" strokeWidth="0"/>
      {/* Star — 5-pointed, red */}
      <g transform="translate(147,92) scale(0.9)">
        <polygon
          points="10,0 12.35,7.27 19.51,7.27 13.58,11.75 15.93,19.02 10,14.54 4.07,19.02 6.42,11.75 0.49,7.27 7.65,7.27"
          fill="#d21034"/>
      </g>
    </svg>
  );
}

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
      if (n.status  === 'fulfilled') setNews(n.value.data.data || []);
      if (g.status  === 'fulfilled') setGallery(g.value.data.data || []);
      if (a.status  === 'fulfilled') setAnnons(a.value.data.data || []);
      if (fb.status === 'fulfilled') setFbPhotos(fb.value.data.data || []);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    if (annons.length < 2) return;
    const t = setInterval(() => setTickIdx(i => (i + 1) % annons.length), 5000);
    return () => clearInterval(t);
  }, [annons]);

  const allPhotos = [...fbPhotos, ...gallery].slice(0, 9);

  return (
    <div className="home">

      {/* ═══════════ HERO ════════════════════════════════════ */}
      <section className="hero">
        {/* Real APC Sidi Ali photo */}
        <div className="hero-photo" style={{ backgroundImage:"url('/apc-sidi-ali.jpg')" }} />
        <div className="hero-overlay" />

        <div className="container hero-inner">

          {/* ── Left side: text ── */}
          <div className="hero-left anim-slide d1">

            {/* Official header */}
            <div className="hero-official">
              <AlgerianFlag size={70} className="hero-flag" />
              <div className="hero-official-text">
                <span className="hero-republic">الجمهورية الجزائرية الديمقراطية الشعبية</span>
                <span className="hero-wilaya">ولاية مستغانم — دائرة سيدي علي</span>
              </div>
            </div>

            <h1 className="hero-title">
              <span className="ht-pre">بـلـديـة</span>
              <span className="ht-main">سيـدي عـلي</span>
              <span className="ht-sub">Commune de Sidi Ali</span>
            </h1>

            <p className="hero-desc">
              الموقع الرسمي للمجلس الشعبي البلدي<br/>
              <em>Site officiel de l'A.P.C Sidi Ali</em>
            </p>

            <div className="hero-cta anim-slide d2">
              <Link to="/news"    className="btn btn-gold btn-lg">📰 آخر الأخبار</Link>
              <Link to="/gallery" className="btn btn-outline-white btn-lg">🖼️ معرض الصور</Link>
            </div>

            {/* Stats bar */}
            <div className="hero-stats anim-slide d3">
              {[
                { n:'+50',  l:'خدمة إدارية' },
                { n:'24/7', l:'متاح دائماً' },
                { n:'1962', l:'سنة التأسيس' },
                { n:'+30K', l:'مواطن' },
              ].map((s, i) => (
                <div key={i} className="hs">
                  <span className="hs-n">{s.n}</span>
                  <span className="hs-l">{s.l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right side: APC badge ── */}
          <div className="hero-right anim-fade d2">
            <div className="apc-badge">
              <div className="apc-flag-row">
                <div className="apc-flag-green">
                  <span className="apc-flag-star">☾★</span>
                </div>
                <div className="apc-flag-white"/>
              </div>
              <div className="apc-body">
                <div className="apc-icon">🏛️</div>
                <div className="apc-name-ar">المجلس الشعبي البلدي</div>
                <div className="apc-name-fr">A.P.C Sidi Ali</div>
                <div className="apc-divider"/>
                <div className="apc-location">ولاية مستغانم — الجزائر</div>
              </div>
            </div>
          </div>

        </div>

        {/* Scroll hint */}
        <a href="#content" className="hero-scroll-hint">↓</a>
      </section>

      {/* ═══════════ TICKER ══════════════════════════════════ */}
      {annons.length > 0 && (
        <div className="ticker" id="content">
          <div className="ticker-tag">📢 إعلان رسمي</div>
          <div className="ticker-body">
            <span className="ticker-text" key={tickIdx}>{annons[tickIdx]?.title}</span>
          </div>
          <div className="ticker-dots">
            {annons.slice(0, 5).map((_, i) => (
              <button key={i} className={`td ${i === tickIdx ? 'active' : ''}`} onClick={() => setTickIdx(i)} />
            ))}
          </div>
        </div>
      )}

      {/* ═══════════ ANNOUNCEMENTS ═══════════════════════════ */}
      {annons.length > 0 && (
        <section className="section-pad ann-section">
          <div className="container">
            <div className="sh">
              <p className="section-eyebrow">📢 إعلانات رسمية</p>
              <h2 className="section-heading">أحدث <span>الإعلانات</span></h2>
            </div>
            <div className="ann-grid">
              {annons.slice(0, 4).map((a, i) => {
                const pc = PRIORITY_COLOR[a.priority] || PRIORITY_COLOR['منخفض'];
                return (
                  <div key={a._id} className={`ann-card card card-hover anim-slide d${Math.min(i+1,4)}`}>
                    <div className="ann-top">
                      <span className="badge badge-green">{a.type}</span>
                      <span className="ann-pri" style={{ background:pc.bg, color:pc.color }}>{a.priority}</span>
                    </div>
                    <h3 className="ann-title">{a.title}</h3>
                    <p className="ann-body">{a.content.slice(0, 120)}{a.content.length > 120 ? '…' : ''}</p>
                    <span className="ann-date">📅 {new Date(a.createdAt).toLocaleDateString('ar-DZ', { year:'numeric', month:'long', day:'numeric' })}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════ NEWS ═════════════════════════════════════ */}
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
              {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height:310, borderRadius:'var(--radius)' }}/>)}
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
                    {item.videoUrl && <span className="nc-video-badge">▶ فيديو</span>}
                    {(item.images?.length > 0) && (
                      <span className="nc-multi-badge">🖼 +{item.images.length}</span>
                    )}
                    <span className="badge badge-green nc-cat">{item.category}</span>
                  </div>
                  <div className="nc-body">
                    <h3 className="nc-title">{item.title}</h3>
                    {item.summary && <p className="nc-summary">{item.summary}</p>}
                    <div className="nc-foot">
                      <span>📅 {new Date(item.createdAt).toLocaleDateString('ar-DZ', { month:'short', day:'numeric', year:'numeric' })}</span>
                      <span className="nc-more">اقرأ المزيد ←</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════ GALLERY ══════════════════════════════════ */}
      {allPhotos.length > 0 && (
        <section className="section-pad gallery-section">
          <div className="container">
            <div className="sh-row">
              <div>
                <p className="section-eyebrow">📸 صور البلدية</p>
                <h2 className="section-heading">معرض <span>الصور</span></h2>
              </div>
              <div style={{ display:'flex', gap:10 }}>
                <a href="https://www.facebook.com/profile.php?id=100063508553211"
                  target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">📘 فيسبوك</a>
                <Link to="/gallery" className="btn btn-primary btn-sm">المعرض الكامل</Link>
              </div>
            </div>
            <div className="ph-masonry">
              {allPhotos.map((photo, i) => {
                const url = photo.imageUrl || photo.thumbnail;
                return (
                  <div key={photo._id||photo.id||i}
                    className={`ph-item anim-fade d${Math.min(i+1,5)} ${i===0||i===4?'ph-wide':''}`}>
                    <img src={imgSrc(url)} alt={photo.title} loading="lazy"/>
                    <div className="ph-overlay">
                      <h4>{photo.title}</h4>
                      {photo.description && <p>{photo.description}</p>}
                      {photo.source==='facebook' && <span className="ph-fb">📘 فيسبوك</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════ SERVICES ═════════════════════════════════ */}
      <section className="services-strip">
        <div className="container srv-grid">
          {[
            { icon:'📋', t:'الوثائق الإدارية',   d:'شهادات الميلاد، عقود الزواج، الإقامة' },
            { icon:'🏗️', t:'المشاريع التنموية',  d:'متابعة أشغال البنية التحتية' },
            { icon:'🌿', t:'البيئة والنظافة',     d:'جمع النفايات والمساحات الخضراء' },
            { icon:'🤝', t:'الشؤون الاجتماعية',  d:'دعم الأسر المحتاجة والمساعدات' },
          ].map((s, i) => (
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

      {/* ═══════════ CTA ══════════════════════════════════════ */}
      <section className="cta-section">
        <div className="cta-pattern"/>
        <div className="container cta-inner">
          <AlgerianFlag size={90} className="cta-flag"/>
          <div className="cta-text anim-slide d1">
            <h2>ابقَ على اطلاع دائم بأخبار بلديتك</h2>
            <p>سجّل حساباً مجانياً للحصول على إشعارات بالأخبار والإعلانات</p>
          </div>
          <div className="cta-actions anim-slide d2">
            <Link to="/register" className="btn btn-gold btn-lg">إنشاء حساب مجاناً</Link>
            <a href="https://www.facebook.com/profile.php?id=100063508553211"
              target="_blank" rel="noreferrer" className="btn btn-white btn-lg">📘 فيسبوك</a>
          </div>
        </div>
      </section>

    </div>
  );
}
