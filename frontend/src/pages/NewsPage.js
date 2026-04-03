import React, { useState, useEffect } from 'react';
import { api } from '../context/AuthContext';
import { Link } from 'react-router-dom';

import Loader from '../components/Loader';
import './NewsPage.css';

const BASE = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL.replace('/api', '')
  : 'http://localhost:5000';

// Works with both Cloudinary URLs (https://...) and local /uploads/...
const imgSrc = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${BASE}${url}`;
};

const CATEGORIES = ['الكل', 'عام', 'صحة', 'تعليم', 'بنية تحتية', 'ثقافة', 'رياضة', 'أخرى'];

export default function NewsPage() {
  const [news,     setNews]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [page,     setPage]     = useState(1);
  const [pages,    setPages]    = useState(1);
  const [category, setCategory] = useState('الكل');
  const [search,   setSearch]   = useState('');

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const params = { page, limit: 9 };
        if (category !== 'الكل') params.category = category;
        const res = await api.get('/news', { params });
        setNews(res.data.data || []);
        setPages(res.data.pages || 1);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [page, category]);

  const filtered = search
    ? news.filter(n => n.title.includes(search) || n.content?.includes(search))
    : news;

  return (
    <div className="news-page">
      {/* Page Header */}
      <div className="page-hero">
        <div className="container">
          <h1>📰 الأخبار</h1>
          <p>آخر أخبار ومستجدات بلدية سيدي علي</p>
        </div>
      </div>

      <div className="container news-layout section-padding">
        {/* Filters */}
        <div className="news-filters">
          <div className="search-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="ابحث في الأخبار..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="category-tabs">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`cat-tab ${category === cat ? 'active' : ''}`}
                onClick={() => { setCategory(cat); setPage(1); }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* News Grid */}
        {loading ? (
          <Loader text="جارٍ تحميل الأخبار..." />
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: '3rem' }}>📭</div>
            <p>لا توجد أخبار في هذه الفئة</p>
          </div>
        ) : (
          <div className="full-news-grid">
            {filtered.map((item, idx) => (
              <Link to={`/news/${item._id}`} key={item._id}
                className="full-news-card card fade-in-up"
                style={{ animationDelay: `${idx * 0.07}s` }}>
                {item.image ? (
                  <div className="full-news-img">
                    <img src={`${BASE_URL}${item.image}`} alt={item.title} loading="lazy" />
                  </div>
                ) : (
                  <div className="full-news-img no-image">
                    <span>📰</span>
                  </div>
                )}
                <div className="full-news-body">
                  <div className="full-news-meta">
                    <span className="badge badge-primary">{item.category}</span>
                    <span className="news-date-sm">
                      {new Date(item.createdAt).toLocaleDateString('ar-DZ', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                  <h2 className="full-news-title">{item.title}</h2>
                  <p className="full-news-summary">{item.summary || item.content?.slice(0, 120) + '...'}</p>
                  <div className="full-news-footer">
                    <span className="views-count">👁 {item.views || 0} مشاهدة</span>
                    <span className="read-more-link">اقرأ المزيد ←</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="pagination">
            <button className="btn btn-outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              ← السابق
            </button>
            <span className="page-info">صفحة {page} من {pages}</span>
            <button className="btn btn-outline" disabled={page >= pages} onClick={() => setPage(p => p + 1)}>
              التالي →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
