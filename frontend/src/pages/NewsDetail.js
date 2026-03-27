import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Loader from '../components/Loader';
import './NewsDetail.css';

const BASE_URL = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL.replace('/api', '')
  : 'http://localhost:5000';

export default function NewsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/news/${id}`)
      .then(res => setNews(res.data.data))
      .catch(() => navigate('/news'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <Loader />;
  if (!news) return null;

  return (
    <div className="news-detail-page" style={{ paddingTop: 'var(--navbar-h)' }}>
      {/* Breadcrumb */}
      <div className="breadcrumb-bar">
        <div className="container breadcrumb-inner">
          <Link to="/">الرئيسية</Link>
          <span>›</span>
          <Link to="/news">الأخبار</Link>
          <span>›</span>
          <span className="breadcrumb-current">{news.title.slice(0, 40)}...</span>
        </div>
      </div>

      <div className="container news-detail-layout section-padding">
        <article className="news-article card">
          {/* Header */}
          <div className="article-header">
            <span className="badge badge-primary">{news.category}</span>
            <h1 className="article-title">{news.title}</h1>
            <div className="article-meta">
              <span className="meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                {new Date(news.createdAt).toLocaleDateString('ar-DZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
              <span className="meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                {news.views} مشاهدة
              </span>
              {news.author && (
                <span className="meta-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  {news.author.name}
                </span>
              )}
            </div>
          </div>

          {/* Image */}
          {news.image && (
            <div className="article-image">
              <img src={`${BASE_URL}${news.image}`} alt={news.title} />
            </div>
          )}

          {/* Summary */}
          {news.summary && (
            <blockquote className="article-summary">{news.summary}</blockquote>
          )}

          {/* Content */}
          <div className="article-content">
            {news.content.split('\n').map((para, i) =>
              para.trim() ? <p key={i}>{para}</p> : <br key={i} />
            )}
          </div>

          {/* Share */}
          <div className="article-share">
            <span>مشاركة:</span>
            <button className="share-btn" onClick={() => navigator.clipboard.writeText(window.location.href)}>
              📋 نسخ الرابط
            </button>
          </div>
        </article>

        {/* Back */}
        <div style={{ marginTop: '24px' }}>
          <Link to="/news" className="btn btn-outline">← العودة إلى الأخبار</Link>
        </div>
      </div>
    </div>
  );
}
