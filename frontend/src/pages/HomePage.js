import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../context/AuthContext';
import './HomePage.css';

const SERVER = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL.replace('/api', '')
  : 'http://localhost:5000';

const PRIORITY_COLOR = {
  'عاجل': { bg: '#fde8e8', color: '#c0392b' },
  'عالي': { bg: '#fff3e0', color: '#e67e22' },
  'متوسط': { bg: '#e8f0ff', color: '#2563eb' },
  'منخفض': { bg: '#f0f4f0', color: '#6b7280' },
};

export default function HomePage() {
  const [news,     setNews]     = useState([]);
  const [gallery,  setGallery]  = useState([]);
  const [fbPhotos, setFbPhotos] = useState([]);
  const [annons,   setAnnons]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [activeAnnon, setActiveAnnon] = useState(0);

  const fetchAll = useCallback(async () => {
    try {
      const [n, g, a, fb] = await Promise.allSettled([
        api.get('/news?limit=4'),
        api.get('/gallery?limit=6'),
        api.get('/announcements'),
        api.get('/facebook/photos?limit=6'),
      ]);
      if (n.status === 'fulfilled')  setNews(n.value.data.data || []);
      if (g.status === 'fulfilled')  setGallery(g.value.data.data || []);
      if (a.status === 'fulfilled')  setAnnons(a.value.data.data || []);
      if (fb.status === 'fulfilled') setFbPhotos(fb.value.data.data || []);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Auto-rotate announcements ticker
  useEffect(() => {
    if (annons.length < 2) return;
    const t = setInterval(() => setActiveAnnon(i => (i + 1) % annons.length), 5000);
    return () => clearInterval(t);
  }, [annons]);

  const imgSrc = (url) => url?.startsWith('http') ? url : `${SERVER}${url}`;

  return (
    <div className="home">

      {/* ═══════════════════ HERO ═══════════════════════════ */}
      <section className="hero">
        <div className="hero-pattern" aria-hidden />
        <div className="hero-glow g1" aria-hidden />
        <div className="hero-glow g2" aria-hidden />

        <div className="container hero-inner">
          <div className="hero-content">
            <div className="hero-badge anim-slide d1">
              <span className="hero-badge-dot" />
              الموقع الرسمي · Commune de Sidi Ali
            </div>

            <h1 className="hero-title anim-slide d2">
              <span className="hero-title-ar">بلـديـة</span>
              <span className="hero-title-name">سيدي علي</span>
            </h1>

            <p className="hero-desc anim-slide d3">
              دائرة سيدي علي — ولاية مستغانم<br />
              نخدمكم بشفافية ومسؤولية من أجل بلدية أفضل
            </p>

            <div className="hero-cta anim-slide d4">
              <Link to="/news"    className="btn btn-gold btn-lg">آخر الأخبار</Link>
              <Link to="/gallery" className="btn btn-white btn-lg">معرض الصور</Link>
            </div>

            {/* stats */}
            <div className="hero-stats anim-slide d5">
              {[
                { num: '+50', label: 'خدمة إدارية' },
                { num: '24/7', label: 'متاح دائماً' },
                { num: '1962', label: 'سنة التأسيس' },
                { num: '+30K', label: 'مواطن' },
              ].map((s, i) => (
                <div key={i} className="hero-stat">
                  <span className="hero-stat-num">{s.num}</span>
                  <span className="hero-stat-label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Official emblem graphic */}
          <div className="hero-emblem anim-fade d3">
            <div className="emblem-ring r1" />
            <div className="emblem-ring r2" />
            <div className="emblem-ring r3" />
            <div className="emblem-center">
              <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="40" cy="40" r="36" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
                <path d="M40 10 L56 26 L56 62 L24 62 L24 26 Z" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinejoin="round"/>
                <rect x="32" y="44" width="16" height="18" rx="2" fill="rgba(255,255,255,0.8)"/>
                <rect x="34" y="22" width="12" height="12" rx="6" fill="rgba(212,160,23,0.9)"/>
                <path d="M20 62 L60 62" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"/>
              </svg>
              <span>ب.س.ع</span>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="hero-scroll">
          <span>↓</span>
        </div>
      </section>

      {/* ═══════════════════ TICKER ══════════════════════════ */}
      {annons.length > 0 && (
        <div className="ticker-bar">
          <div className="ticker-label">
            <span>📢</span> إعلانات
          </div>
          <div className="ticker-content">
            <span className="ticker-text">
              {annons[activeAnnon]?.title}
            </span>
          </div>
          <div className="ticker-dots">
            {annons.slice(0,5).map((_,i) => (
              <button key={i} className={`ticker-dot ${i === activeAnnon ? 'active' : ''}`}
                onClick={() => setActiveAnnon(i)} />
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════ ANNOUNCEMENTS ══════════════════ */}
      {annons.length > 0 && (
        <section className="section-pad announces-section">
          <div className="container">
            <div className="section-header">
              <p className="section-eyebrow">📢 إعلانات رسمية</p>
              <h2 className="section-heading">أحدث <span>الإعلانات</span></h2>
              <p className="section-sub">إعلانات ومناقصات وتنبيهات صادرة عن بلدية سيدي علي</p>
            </div>

            <div className="announces-grid">
              {annons.slice(0, 4).map((a, i) => {
                const pc = PRIORITY_COLOR[a.priority] || PRIORITY_COLOR['منخفض'];
                return (
                  <div key={a._id} className={`announce-card card card-hover anim-slide d${i+1}`}>
                    <div className="announce-top">
                      <span className="badge badge-green">{a.type}</span>
                      <span className="priority-pill" style={{ background: pc.bg, color: pc.color }}>
                        {a.priority}
                      </span>
                    </div>
                    <h3 className="announce-title">{a.title}</h3>
                    <p className="announce-body">{a.content.slice(0, 120)}{a.content.length > 120 ? '…' : ''}</p>
                    <div className="announce-footer">
                      <span className="announce-date">
                        📅 {new Date(a.createdAt).toLocaleDateString('ar-DZ', { year:'numeric', month:'long', day:'numeric' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════ NEWS ════════════════════════════ */}
      <section className="section-pad news-section">
        <div className="container">
          <div className="section-header-row">
            <div>
              <p className="section-eyebrow">📰 أخبار محلية</p>
              <h2 className="section-heading">آخر <span>الأخبار</span></h2>
            </div>
            <Link to="/news" className="btn btn-outline">عرض الكل →</Link>
          </div>

          {loading ? (
            <div className="news-grid">
              {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 320, borderRadius: 'var(--radius)' }} />)}
            </div>
          ) : news.length === 0 ? (
            <div className="empty-state"><span className="empty-icon">📭</span><p>لا توجد أخبار حالياً</p></div>
          ) : (
            <div className="news-grid">
              {news.map((item, idx) => (
                <Link to={`/news/${item._id}`} key={item._id}
                  className={`news-card card card-hover anim-slide d${Math.min(idx+1,5)} ${idx === 0 ? 'news-featured' : ''}`}>
                  <div className="news-img">
                    {item.image
                      ? <img src={imgSrc(item.image)} alt={item.title} loading="lazy" />
                      : <div className="news-img-placeholder">📰</div>
                    }
                    <span className="news-cat badge badge-green">{item.category}</span>
                  </div>
                  <div className="news-body">
                    <h3 className="news-title">{item.title}</h3>
                    {item.summary && <p className="news-summary">{item.summary}</p>}
                    <div className="news-meta">
                      <span>📅 {new Date(item.createdAt).toLocaleDateString('ar-DZ', { month:'short', day:'numeric', year:'numeric' })}</span>
                      <span>👁 {item.views}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════ FACEBOOK GALLERY ═══════════════ */}
      <section className="section-pad fb-section">
        <div className="container">
          <div className="section-header-row">
            <div>
              <p className="section-eyebrow">
                <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" style={{marginLeft:4}}>
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
                صفحة فيسبوك الرسمية
              </p>
              <h2 className="section-heading">معرض <span>الصور</span></h2>
            </div>
            <a href="https://www.facebook.com/profile.php?id=100063508553211"
              target="_blank" rel="noreferrer" className="btn btn-outline">
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
              زيارة الصفحة
            </a>
          </div>

          {(fbPhotos.length > 0 || gallery.length > 0) ? (
            <div className="photo-masonry">
              {[...fbPhotos, ...gallery].slice(0, 9).map((photo, i) => {
                const url   = photo.imageUrl || photo.thumbnail;
                const title = photo.title;
                const desc  = photo.description;
                return (
                  <div key={photo._id || photo.id} className={`photo-item anim-fade d${Math.min(i+1,5)} ${i === 0 || i === 4 ? 'photo-wide' : ''}`}>
                    <img src={imgSrc(url)} alt={title} loading="lazy" />
                    <div className="photo-overlay">
                      <h4>{title}</h4>
                      {desc && <p>{desc}</p>}
                      {photo.source === 'facebook' && (
                        <span className="fb-badge">
                          <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
                            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                          </svg>
                          فيسبوك
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state"><span className="empty-icon">🖼️</span><p>لا توجد صور بعد</p></div>
          )}

          <div style={{ textAlign: 'center', marginTop: '36px' }}>
            <Link to="/gallery" className="btn btn-primary">عرض معرض الصور الكامل</Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════ SERVICES STRIP ═════════════════ */}
      <section className="services-strip">
        <div className="container services-inner">
          {[
            { icon: '📋', title: 'الوثائق الإدارية', desc: 'شهادات الميلاد، عقود الزواج، الإقامة' },
            { icon: '🏗️', title: 'المشاريع التنموية', desc: 'متابعة أشغال البنية التحتية والتهيئة' },
            { icon: '🌿', title: 'البيئة والنظافة', desc: 'جمع النفايات والمساحات الخضراء' },
            { icon: '🤝', title: 'الشؤون الاجتماعية', desc: 'دعم الأسر المحتاجة والمساعدات' },
          ].map((s, i) => (
            <div key={i} className={`service-item anim-slide d${i+1}`}>
              <div className="service-icon">{s.icon}</div>
              <div>
                <h4 className="service-title">{s.title}</h4>
                <p className="service-desc">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════ CTA ═════════════════════════════ */}
      <section className="cta-section">
        <div className="cta-bg-pattern" aria-hidden />
        <div className="container cta-inner">
          <div className="cta-text anim-slide d1">
            <h2>ابقَ على اطلاع دائم</h2>
            <p>سجّل حسابك للحصول على إشعارات فورية بأحدث أخبار وإعلانات البلدية</p>
          </div>
          <div className="cta-actions anim-slide d2">
            <Link to="/register" className="btn btn-gold btn-lg">إنشاء حساب مجاناً</Link>
            <a href="https://www.facebook.com/profile.php?id=100063508553211"
              target="_blank" rel="noreferrer" className="btn btn-white btn-lg">
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
              تابعنا على فيسبوك
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
