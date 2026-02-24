"use client";
import React, { useState } from 'react';
import './MyEvents.css';

interface Event {
  id: number;
  title: string;
  description: string;
  image: string;
  status: 'registered' | 'completed' | 'cancelled';
  date: string;
  registrationDeadline: string;
  organizerName: string;
  rating: number;
  isActive: boolean;
}

type FilterType = 'all' | 'registered' | 'completed' | 'cancelled';

const EVENTS: Event[] = [
  {
    id: 1,
    title: 'ورشة عمل التطوير المهني',
    description: 'ورشة تدريبية شاملة لتطوير المهارات الوظيفية والتقنية للطلاب',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop',
    status: 'registered', date: '15 ديسمبر 2024',
    registrationDeadline: '10 ديسمبر 2024', organizerName: 'المركز الثقافي',
    rating: 5, isActive: true,
  },
  {
    id: 2,
    title: 'ورشة الذكاء الاصطناعي',
    description: 'ورشة متقدمة عن تطبيقات الذكاء الاصطناعي وتأثيرها على تطوير الأعمال',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop',
    status: 'registered', date: '18 ديسمبر 2024',
    registrationDeadline: '12 ديسمبر 2024', organizerName: 'معهد التقنيات المتقدمة',
    rating: 4, isActive: true,
  },
];

// Icons
const CalIcon = () => (
  <svg className="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
  </svg>
);
const UserIcon = () => (
  <svg className="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
  </svg>
);
const ClockIcon = () => (
  <svg className="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
  </svg>
);
const DownloadIcon = () => (
  <svg className="download-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
  </svg>
);
const EmptyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
  </svg>
);

const FILTERS: { id: FilterType; label: string }[] = [
  { id: 'registered', label: 'مُسجل'  },
  { id: 'completed',  label: 'مكتمل'  },
  { id: 'cancelled',  label: 'ملغي'   },
  { id: 'all',        label: 'الكل'   },
];

export default function MyEvents() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('registered');

  const counts = {
    all:        EVENTS.length,
    registered: EVENTS.filter(e => e.status === 'registered').length,
    completed:  EVENTS.filter(e => e.status === 'completed').length,
    cancelled:  EVENTS.filter(e => e.status === 'cancelled').length,
  };

  const filtered = activeFilter === 'all'
    ? EVENTS
    : EVENTS.filter(e => e.status === activeFilter);

  const renderStars = (rating: number) =>
    [...Array(5)].map((_, i) => (
      <span key={i} className={i < rating ? 'star filled' : 'star'}>★</span>
    ));

  return (
    <div className="my-events-page" dir="rtl">

      {/* ══ HERO ══ */}
      <div className="my-events-hero">
        <div className="hero-inner">
          <div>
            <h1 className="hero-title">أنشطتي</h1>
            <p className="hero-sub">تتبع جميع الأنشطة والفعاليات التي سجلت بها أو شاركت فيها</p>
          </div>

          {/* Stats as pills */}
          <div className="hero-stats">
            <div className="stat-pill">
              <span className="stat-num">{counts.all}</span>
              <span className="stat-lbl">إجمالي</span>
            </div>
            <div className="stat-pill">
              <span className="stat-num">{counts.registered}</span>
              <span className="stat-lbl">مسجّل</span>
            </div>
            <div className="stat-pill">
              <span className="stat-num">{counts.completed}</span>
              <span className="stat-lbl">مكتمل</span>
            </div>
            <div className="stat-pill">
              <span className="stat-num">{counts.cancelled}</span>
              <span className="stat-lbl">ملغي</span>
            </div>
          </div>
        </div>

        {/* Filter tabs inside hero */}
        <div className="hero-filter-tabs">
          {FILTERS.map(f => (
            <button
              key={f.id}
              className={`filter-tab${activeFilter === f.id ? ' active' : ''}`}
              onClick={() => setActiveFilter(f.id)}
            >
              {f.label}
              <span className="tab-count">{counts[f.id]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ══ BODY ══ */}
      <div className="my-events-body">
        <p className="results-bar">
          عرض <strong>{filtered.length}</strong> {activeFilter === 'all' ? 'نشاط' : `نشاط (${FILTERS.find(f=>f.id===activeFilter)?.label})`}
        </p>

        <div className="events-grid">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><EmptyIcon /></div>
              <h2 className="empty-title">لا توجد أنشطة في هذه الفئة</h2>
              <p className="empty-subtitle">جرّب اختيار فئة أخرى</p>
            </div>
          ) : filtered.map(event => (
            <div key={event.id} className="event-card">
              {/* Image */}
              <div className="event-image-container">
                <img src={event.image} alt={event.title} className="event-image" />
                {event.isActive && <span className="active-badge">نشط</span>}
              </div>

              {/* Content */}
              <div className="event-content">
                <h3 className="event-title">{event.title}</h3>
                <p className="event-description">{event.description}</p>

                <div className="event-meta">
                  <div className="meta-item"><CalIcon />{event.date}</div>
                  <div className="meta-item"><UserIcon />{event.organizerName}</div>
                  <div className="meta-item"><ClockIcon />تاريخ التسجيل: {event.registrationDeadline}</div>
                </div>

                <div className="event-rating">
                  <span className="rating-label">التقييم:</span>
                  <div className="stars">{renderStars(event.rating)}</div>
                </div>
                <p className="rating-text">تجربة رائعة ومفيدة جداً</p>

                <button className="download-btn">
                  <DownloadIcon />
                  تحميل الشهادة
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}