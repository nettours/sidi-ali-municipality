import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../context/AuthContext';
import Loader from '../components/Loader';
import './NewsDetail.css';

const BASE = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL.replace('/api', '')
  : 'http://localhost:5000';

const imgSrc = (url) => !url ? null : url.startsWith('http') ? url : `${BASE}${url}`;

export default function NewsDetail() {
  const { id }    = useParams();
  const navigate  = useNavigate();

  const [news,      setNews]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [lightbox,  setLightbox]  = useState(null); // index into allImages
  const [copied,    setCopied]    = useState(false);

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/news/${id}`);
      if (res.data?.data) {
        setNews(res.data.data);
      } else {
        setError('الخبر غير موجود');
      }
    } catch (e) {
      console.error('NewsDetail error:', e);
      setError(e.response?.data?.message || 'تعذّر تحميل الخبر');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchNews(); }, [fetchNews]);

  // keyboard lightbox
  useEffect(() => {
    if (lightbox === null) return;
    const allImages = getAllImages(news);
    const handler = (e) => {
      if (e.key === 'Escape') setLightbox(null);
      if (e.key === 'ArrowLeft')  setLightbox(i => Math.min(i + 1, allImages.length - 1));
      if (e.key === 'ArrowRight') setLightbox(i => Math.max(i - 1, 0));
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightbox, news]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <Loader text="جارٍ تحميل الخبر..." />;

  if (error) return (
    <div style={{ paddingTop:'var(--navbar-h)', minHeight:'60vh', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16 }}>
      <div style={{ fontSize:'3rem' }}>❌</div>
      <p style={{ fontWeight:700, color:'var(--text-muted)' }}>{error}</p>
      <Link to="/news" className="btn btn-primary">← العودة إلى الأخبار</Link>
    </div>
  );

  if (!news) return null;

  const allImages = getAllImages(news);

  return (
    <div className="nd-page">

      {/* ── Hero Image ───────────────────────────────────────── */}
      {news.image && (
        <div className="nd-hero" onClick={() => setLightbox(0)} style={{ cursor:'zoom-in' }}>
          <img src={imgSrc(news.image)} alt={news.title} />
          <div className="nd-hero-overlay">
            <span className="badge badge-green nd-cat">{news.category}</span>
          </div>
        </div>
      )}

      {/* ── Breadcrumb ─────────────────────────────────────── */}
      <div className="nd-breadcrumb">
        <div className="container nd-breadcrumb-inner">
          <Link to="/">الرئيسية</Link>
          <span>›</span>
          <Link to="/news">الأخبار</Link>
          <span>›</span>
          <span>{news.title.slice(0, 45)}{news.title.length > 45 ? '…' : ''}</span>
        </div>
      </div>

      <div className="container nd-layout section-pad">

        {/* ── Article ───────────────────────────────────────── */}
        <article className="nd-article card">

          {/* Header */}
          <div className="nd-header">
            {!news.image && <span className="badge badge-green">{news.category}</span>}
            <h1 className="nd-title">{news.title}</h1>
            <div className="nd-meta">
              <span className="nd-meta-item">
                📅 {new Date(news.createdAt).toLocaleDateString('ar-DZ', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
              </span>
              <span className="nd-meta-item">👁 {news.views} مشاهدة</span>
              {news.author?.name && <span className="nd-meta-item">✍️ {news.author.name}</span>}
            </div>
          </div>

          {/* Summary blockquote */}
          {news.summary && (
            <blockquote className="nd-summary">{news.summary}</blockquote>
          )}

          {/* Body */}
          <div className="nd-body">
            {news.content.split('\n').map((para, i) =>
              para.trim()
                ? <p key={i}>{para}</p>
                : <br key={i} />
            )}
          </div>

          {/* Extra images gallery */}
          {news.images?.length > 0 && (
            <div className="nd-gallery">
              <h3 className="nd-gallery-title">📷 الصور المرفقة</h3>
              <div className="nd-gallery-grid">
                {news.images.map((img, idx) => (
                  <div key={idx} className="nd-gallery-item"
                    onClick={() => setLightbox(idx + 1)}
                    style={{ cursor:'zoom-in' }}>
                    <img src={imgSrc(img)} alt={`صورة ${idx + 1}`} loading="lazy" />
                    <div className="nd-gallery-hover">🔍</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Share */}
          <div className="nd-share">
            <span>مشاركة الخبر:</span>
            <button className="nd-share-btn" onClick={copyLink}>
              {copied ? '✅ تم النسخ!' : '📋 نسخ الرابط'}
            </button>
            <a className="nd-share-btn fb"
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
              target="_blank" rel="noreferrer">
              📘 مشاركة على فيسبوك
            </a>
          </div>
        </article>

        {/* ── Back button ──────────────────────────────────── */}
        <div className="nd-back">
          <Link to="/news" className="btn btn-outline">← العودة إلى الأخبار</Link>
          <Link to="/"    className="btn btn-primary" style={{ marginRight:'10px' }}>🏠 الرئيسية</Link>
        </div>
      </div>

      {/* ── Lightbox ─────────────────────────────────────────── */}
      {lightbox !== null && allImages[lightbox] && (
        <div className="nd-lightbox" onClick={() => setLightbox(null)}>
          <button className="nd-lb-close" onClick={() => setLightbox(null)}>✕</button>
          {lightbox > 0 && (
            <button className="nd-lb-nav nd-lb-prev" onClick={e => { e.stopPropagation(); setLightbox(i => i - 1); }}>›</button>
          )}
          {lightbox < allImages.length - 1 && (
            <button className="nd-lb-nav nd-lb-next" onClick={e => { e.stopPropagation(); setLightbox(i => i + 1); }}>‹</button>
          )}
          <div className="nd-lb-content" onClick={e => e.stopPropagation()}>
            <img src={imgSrc(allImages[lightbox])} alt="" />
            {allImages.length > 1 && (
              <div className="nd-lb-counter">{lightbox + 1} / {allImages.length}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// collect main image + extra images into one array
function getAllImages(news) {
  if (!news) return [];
  const arr = [];
  if (news.image)  arr.push(news.image);
  if (news.images?.length) arr.push(...news.images);
  return arr;
}
