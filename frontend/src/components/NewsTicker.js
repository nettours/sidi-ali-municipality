import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../context/AuthContext';
import './NewsTicker.css';

export default function NewsTicker() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get('/news?limit=10')
      .then(res => setItems(res.data.data || []))
      .catch(() => {});
  }, []);

  if (items.length === 0) return null;

  // duplicate to make seamless loop
  const doubled = [...items, ...items];

  return (
    <div className="news-ticker-bar">
      {/* Label */}
      <div className="ntb-label">
        <span className="ntb-dot" />
        <span>أخبار</span>
      </div>

      {/* Scrolling track */}
      <div className="ntb-track-wrap">
        <div className="ntb-track" style={{ '--count': items.length }}>
          {doubled.map((item, i) => (
            <Link
              key={`${item._id}-${i}`}
              to={`/news/${item._id}`}
              className="ntb-item"
            >
              <span className="ntb-bullet">◆</span>
              <span className="ntb-text">{item.title}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Pause on hover hint */}
      <div className="ntb-right">
        <Link to="/news" className="ntb-all">كل الأخبار ←</Link>
      </div>
    </div>
  );
}
