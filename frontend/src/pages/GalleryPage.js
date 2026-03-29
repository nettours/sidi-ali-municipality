import React, { useState, useEffect } from 'react';
import { api } from '../context/AuthContext';
import Loader from '../components/Loader';
import './GalleryPage.css';

const BASE_URL = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL.replace('/api', '')
  : 'http://localhost:5000';

const imgSrc = (url) => !url ? null : url.startsWith('http') ? url : `${BASE_URL}${url}`;
const CATS = ['الكل', 'فعاليات', 'مشاريع', 'بنية تحتية', 'طبيعة', 'أخرى'];

export default function GalleryPage() {
  const [photos,   setPhotos]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [page,     setPage]     = useState(1);
  const [pages,    setPages]    = useState(1);
  const [category, setCategory] = useState('الكل');
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    const fetchPhotos = async () => {
      setLoading(true);
      try {
        const params = { page, limit: 12 };
        if (category !== 'الكل') params.category = category;
        const res = await api.get('/gallery', { params });
        setPhotos(res.data.data || []);
        setPages(res.data.pages || 1);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchPhotos();
  }, [page, category]);

  useEffect(() => {
    if (lightbox === null) return;
    const handler = (e) => {
      if (e.key === 'Escape') setLightbox(null);
      if (e.key === 'ArrowLeft')  setLightbox(i => Math.min(i + 1, photos.length - 1));
      if (e.key === 'ArrowRight') setLightbox(i => Math.max(i - 1, 0));
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightbox, photos.length]);

  return (
    <div className="gallery-page" style={{ paddingTop: 'var(--navbar-h)' }}>
      <div className="page-hero">
        <div className="container">
          <h1>🖼️ معرض الصور</h1>
          <p>صور من مشاريع وفعاليات بلدية سيدي علي</p>
        </div>
      </div>

      <div className="container section-pad">
        <div className="gallery-filter">
          {CATS.map(cat => (
            <button key={cat}
              className={`cat-tab ${category === cat ? 'active' : ''}`}
              onClick={() => { setCategory(cat); setPage(1); }}>
              {cat}
            </button>
          ))}
        </div>

        {loading ? <Loader text="جارٍ تحميل الصور..." /> : photos.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📷</span>
            <p>لا توجد صور في هذه الفئة</p>
          </div>
        ) : (
          <>
            <div className="gallery-grid">
              {photos.map((photo, idx) => (
                <div key={photo._id} className="gallery-card anim-slide"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                  onClick={() => setLightbox(idx)}>
                  <div className="gallery-card-img">
                    <img src={imgSrc(photo.imageUrl)} alt={photo.title} loading="lazy" />
                    <div className="gallery-card-hover">
                      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" width="28" height="28">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="m21 21-4.35-4.35"/>
                        <line x1="11" y1="8" x2="11" y2="14"/>
                        <line x1="8" y1="11" x2="14" y2="11"/>
                      </svg>
                    </div>
                    {photo.isFeatured && <span className="featured-badge">⭐ مميزة</span>}
                  </div>
                  <div className="gallery-card-info">
                    <h3>{photo.title}</h3>
                    {photo.description && <p>{photo.description}</p>}
                    <span className="gallery-cat-badge">{photo.category}</span>
                  </div>
                </div>
              ))}
            </div>

            {pages > 1 && (
              <div className="pagination">
                <button className="btn btn-outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← السابق</button>
                <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>صفحة {page} من {pages}</span>
                <button className="btn btn-outline" disabled={page >= pages} onClick={() => setPage(p => p + 1)}>التالي →</button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Lightbox */}
      {lightbox !== null && photos[lightbox] && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <button className="lb-close" onClick={() => setLightbox(null)}>✕</button>
          <button className="lb-prev" onClick={e => { e.stopPropagation(); setLightbox(i => Math.max(i - 1, 0)); }} disabled={lightbox === 0}>›</button>
          <button className="lb-next" onClick={e => { e.stopPropagation(); setLightbox(i => Math.min(i + 1, photos.length - 1)); }} disabled={lightbox === photos.length - 1}>‹</button>
          <div className="lb-content" onClick={e => e.stopPropagation()}>
            <img src={imgSrc(photos[lightbox].imageUrl)} alt={photos[lightbox].title} />
            <div className="lb-caption">
              <h3>{photos[lightbox].title}</h3>
              {photos[lightbox].description && <p>{photos[lightbox].description}</p>}
            </div>
          </div>
          <div className="lb-counter">{lightbox + 1} / {photos.length}</div>
        </div>
      )}
    </div>
  );
}
