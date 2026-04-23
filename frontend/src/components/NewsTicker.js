import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../context/AuthContext';
import './NewsTicker.css';

export default function NewsTicker() {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    api.get('/news?limit=10')
      .then(res => {
        const data = res.data.data || [];
        if (data.length > 0) {
          setItems(data);
          // small delay so CSS animation starts after render
          setTimeout(() => setReady(true), 100);
        }
      })
      .catch(() => {});
  }, []);

  if (items.length === 0) return null;

  // duplicate 3x to guarantee seamless loop on all screen sizes
  const tripled = [...items, ...items, ...items];

  return (
    <div className="ntb-bar" aria-label="شريط الأخبار">

      {/* ── Label ── */}
      <div className="ntb-label" aria-hidden>
        <span className="ntb-dot" />
        <span>أخبار</span>
      </div>

      {/* ── Scrolling strip ── */}
      <div className="ntb-viewport">
        <div
          className={`ntb-strip ${ready ? 'ntb-running' : ''}`}
          style={{ '--item-count': items.length }}
        >
          {tripled.map((item, i) => (
            <span key={`${item._id}-${i}`} className="ntb-entry">
              <span className="ntb-diamond" aria-hidden>◆</span>
              <Link
                to={`/news/${item._id}`}
                className="ntb-link"
                tabIndex={i < items.length ? 0 : -1}
              >
                {item.title}
              </Link>
            </span>
          ))}
        </div>
      </div>

      {/* ── Right pill ── */}
      <div className="ntb-right" aria-hidden>
        <Link to="/news" className="ntb-see-all">الكل ←</Link>
      </div>

    </div>
  );
}
