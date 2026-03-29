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

/* ── City stats data ─────────────────────────────────────── */
const CITY_STATS = [
  { icon:'👥', num:'~35,000', label:'نسمة' },
  { icon:'📐', num:'212 كم²', label:'المساحة' },
  { icon:'🏔️', num:'85 م', label:'الارتفاع عن البحر' },
  { icon:'🕌', num:'1873', label:'سنة الإنشاء الرسمي' },
];

const CITY_INFO = [
  {
    icon: '🏛️',
    title: 'نبذة عامة',
    text: 'سيدي علي مدينة جزائرية تقع في ولاية مستغانم، تُعدّ مركز دائرة سيدي علي. تمتد على مساحة تقدّر بـ 212 كيلومتر مربع، وتضم سكاناً يتجاوز عددهم 35 ألف نسمة. تقع المدينة في السهل الأوسط لولاية مستغانم، وتتميز بطبيعتها الزراعية الخصبة التي تجعلها من أهم مناطق إنتاج القمح والخضروات في المنطقة.'
  },
  {
    icon: '📜',
    title: 'التاريخ',
    text: 'تعود جذور المنطقة إلى العهد العثماني، وتأسست البلدية رسمياً إبان الحقبة الاستعمارية الفرنسية عام 1873 تحت اسم "Bosquet". استعادت اسمها الأصلي "سيدي علي" بعد الاستقلال عام 1962، نسبةً إلى الولي الصالح سيدي علي بن يوب الذي يعود إليه تاريخ المنطقة. شهدت المدينة نمواً ملحوظاً خلال العقود الأخيرة على الصعيدين العمراني والخدماتي.'
  },
  {
    icon: '🌾',
    title: 'الاقتصاد والموارد',
    text: 'تعتمد مدينة سيدي علي اعتماداً رئيسياً على الزراعة، إذ تمتد سهولها الخصبة لمئات الهكتارات المخصصة لزراعة الحبوب والخضروات وأشجار الزيتون والكروم. يُعدّ القطاع الفلاحي المحرّك الأساسي للاقتصاد المحلي، إلى جانب التجارة والخدمات الإدارية التي تُوفّرها المصالح البلدية وما يتبعها من مرافق.'
  },
  {
    icon: '📍',
    title: 'الموقع الجغرافي',
    text: 'تقع سيدي علي في الشمال الغربي للجزائر، ضمن إقليم ولاية مستغانم، على بعد نحو 30 كيلومتراً جنوب شرق مدينة مستغانم. تحدّها شمالاً دائرة حاسي ماماش، وجنوباً دائرة سيدي لخضر، وشرقاً دائرة المشرع. يمر عبر المدينة الطريق الوطني رقم 23، ما يجعلها محطة تربط عدة دوائر ببعضها.'
  },
];

export default function HomePage() {
  const [news,     setNews]     = useState([]);
  const [gallery,  setGallery]  = useState([]);
  const [fbPhotos, setFbPhotos] = useState([]);
  const [annons,   setAnnons]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [tickIdx,  setTickIdx]  = useState(0);
  const [activeTab, setActiveTab] = useState(0);

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

      {/* ═══════════════════ HERO ═══════════════════════════ */}
      <section className="hero">
        <div className="hero-photo" style={{ backgroundImage:"url('/apc-sidi-ali.jpg')" }} />
        <div className="hero-overlay" />

        <div className="container hero-inner">

          {/* Left: content */}
          <div className="hero-left anim-slide d1">

            {/* Official badge with REAL flag image */}
            <div className="hero-official">
              <img
                src="/drapeau-algerie.jpg"
                alt="علم الجزائر"
                className="hero-flag-img"
              />
              <div className="hero-official-text">
                <span className="hero-republic">الجمهورية الجزائرية الديمقراطية الشعبية</span>
                <span className="hero-wilaya">ولاية مستغانم — دائرة سيدي علي</span>
              </div>
            </div>

            <h1 className="hero-title">
              <span className="ht-pre">بـلـديـة</span>
              <span className="ht-main">سيـدي عـلي</span>
              <span className="ht-sub">Commune de Sidi Ali — APC</span>
            </h1>

            <p className="hero-desc">
              الموقع الرسمي للمجلس الشعبي البلدي — نخدمكم بشفافية ومسؤولية<br/>
              <em>Site officiel de l'Assemblée Populaire Communale</em>
            </p>

            <div className="hero-cta anim-slide d2">
              <Link to="/news"    className="btn btn-gold btn-lg">📰 آخر الأخبار</Link>
              <Link to="/gallery" className="btn btn-outline-white btn-lg">🖼️ معرض الصور</Link>
            </div>

            <div className="hero-stats anim-slide d3">
              {[
                { n:'~35,000', l:'نسمة' },
                { n:'212 كم²', l:'المساحة' },
                { n:'24/7',    l:'خدمة إدارية' },
                { n:'1962',    l:'الاستقلال' },
              ].map((s, i) => (
                <div key={i} className="hs">
                  <span className="hs-n">{s.n}</span>
                  <span className="hs-l">{s.l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: APC Badge */}
          <div className="hero-right anim-fade d2">
            <div className="apc-badge">
              <div className="apc-flag-banner">
                <img src="/drapeau-algerie.jpg" alt="علم الجزائر" className="apc-flag-banner-img"/>
              </div>
              <div className="apc-body">
                <div className="apc-icon">🏛️</div>
                <div className="apc-name-ar">المجلس الشعبي البلدي</div>
                <div className="apc-name-fr">A.P.C Sidi Ali</div>
                <div className="apc-divider"/>
                <div className="apc-info-row">
                  <span>👥 ~35,000 نسمة</span>
                  <span>📐 212 كم²</span>
                </div>
                <div className="apc-location">ولاية مستغانم — شمال غرب الجزائر</div>
              </div>
            </div>
          </div>
        </div>

        <a href="#content" className="hero-scroll-hint">↓</a>
      </section>

      {/* ═══════════════════ TICKER ═════════════════════════ */}
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

      {/* ═══════════════════ ANNOUNCEMENTS ══════════════════ */}
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

      {/* ═══════════════════ NEWS ════════════════════════════ */}
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
                    {(item.images?.length > 0) && <span className="nc-multi-badge">🖼 +{item.images.length}</span>}
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

      {/* ═══════════════════ GALLERY ════════════════════════ */}
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

      {/* ═══════════════════ ABOUT SIDI ALI ═════════════════ */}
      <section className="section-pad about-section">
        <div className="container">
          <div className="sh" style={{ textAlign:'center' }}>
            <p className="section-eyebrow">🏙️ نبذة عن المدينة</p>
            <h2 className="section-heading" style={{ display:'inline-block' }}>
              مدينة <span>سيدي علي</span>
            </h2>
            <p className="section-sub" style={{ margin:'10px auto 0', textAlign:'center' }}>
              تعرّف أكثر على تاريخ وجغرافيا وإمكانيات بلديتنا العريقة
            </p>
          </div>

          {/* Stats cards */}
          <div className="about-stats">
            {CITY_STATS.map((s, i) => (
              <div key={i} className={`about-stat-card anim-slide d${i+1}`}>
                <span className="asc-icon">{s.icon}</span>
                <span className="asc-num">{s.num}</span>
                <span className="asc-label">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="about-tabs">
            {CITY_INFO.map((tab, i) => (
              <button key={i}
                className={`about-tab-btn ${activeTab === i ? 'active' : ''}`}
                onClick={() => setActiveTab(i)}>
                {tab.icon} {tab.title}
              </button>
            ))}
          </div>

          <div className="about-content card">
            <div className="about-content-inner">
              <div className="about-tab-icon">{CITY_INFO[activeTab].icon}</div>
              <div>
                <h3 className="about-tab-title">{CITY_INFO[activeTab].title}</h3>
                <p className="about-tab-text">{CITY_INFO[activeTab].text}</p>
              </div>
            </div>
          </div>

          {/* Quick facts ribbon */}
          <div className="about-facts">
            {[
              { label:'الإدارة',   val:'دائرة سيدي علي، ولاية مستغانم' },
              { label:'الإحداثيات', val:'36°05′ ش — 0°21′ غ' },
              { label:'المناخ',    val:'متوسطي معتدل' },
              { label:'اللغة',     val:'العربية / الأمازيغية' },
              { label:'الرمز البريدي', val:'27150' },
              { label:'رقم الدائرة',   val:'2703' },
            ].map((f, i) => (
              <div key={i} className="about-fact">
                <span className="af-label">{f.label}</span>
                <span className="af-val">{f.val}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ SERVICES ════════════════════════ */}
      <section className="services-strip">
        <div className="container srv-grid">
          {[
            { icon:'📋', t:'الوثائق الإدارية',  d:'شهادات الميلاد، عقود الزواج، الإقامة' },
            { icon:'🏗️', t:'المشاريع التنموية', d:'متابعة أشغال البنية التحتية' },
            { icon:'🌿', t:'البيئة والنظافة',    d:'جمع النفايات والمساحات الخضراء' },
            { icon:'🤝', t:'الشؤون الاجتماعية', d:'دعم الأسر المحتاجة والمساعدات' },
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

      {/* ═══════════════════ CTA ═════════════════════════════ */}
      <section className="cta-section">
        <div className="cta-pattern"/>
        <div className="container cta-inner">
          <img src="/drapeau-algerie.jpg" alt="علم الجزائر" className="cta-flag-img"/>
          <div className="cta-text anim-slide d1">
            <h2>ابقَ على اطلاع دائم بأخبار بلديتك</h2>
            <p>سجّل حساباً مجانياً للحصول على إشعارات بالأخبار والإعلانات</p>
          </div>
          <div className="cta-actions anim-slide d2">
            <Link to="/register" className="btn btn-gold btn-lg">إنشاء حساب مجاناً</Link>
            <a href="https://www.facebook.com/profile.php?id=100063508553211"
              target="_blank" rel="noreferrer" className="btn btn-white btn-lg">📘 تابعنا على فيسبوك</a>
          </div>
        </div>
      </section>

      {/* ═══════════════════ GOOGLE MAP ══════════════════════ */}
      <section className="map-section">
        <div className="map-header">
          <div className="container">
            <p className="section-eyebrow">📍 الموقع الجغرافي</p>
            <h2 className="section-heading">
              موقع مدينة <span>سيدي علي</span> على الخريطة
            </h2>
            <p className="section-sub">
              دائرة سيدي علي — ولاية مستغانم، الجمهورية الجزائرية الديمقراطية الشعبية
            </p>
          </div>
        </div>

        <div className="map-wrapper">
          <iframe
            title="موقع بلدية سيدي علي على خرائط جوجل"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d51804.23853821!2d0.1500!3d36.1000!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x128b7e8e5b5b5b5b%3A0x1234567890abcdef!2sSidi%20Ali%2C%20Mostaganem%2C%20Algeria!5e0!3m2!1sar!2sdz!4v1700000000000!5m2!1sar!2sdz"
            width="100%"
            height="480"
            style={{ border:0, display:'block' }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          {/* Map info overlay */}
          <div className="map-info-card">
            <div className="mic-flag">
              <img src="/drapeau-algerie.jpg" alt="علم الجزائر" style={{ width:48, borderRadius:4 }}/>
            </div>
            <div className="mic-body">
              <h3>بلدية سيدي علي</h3>
              <p>📍 ولاية مستغانم، الجزائر</p>
              <p>🏔️ ارتفاع ~85 متر عن سطح البحر</p>
              <p>📐 مساحة 212 كيلومتر مربع</p>
              <a
                href="https://www.google.com/maps/place/Sidi+Ali,+Mostaganem,+Algeria/@36.1,0.15,13z"
                target="_blank" rel="noreferrer"
                className="btn btn-primary btn-sm"
                style={{ marginTop:12, width:'100%', justifyContent:'center' }}>
                🗺️ فتح في خرائط جوجل
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
