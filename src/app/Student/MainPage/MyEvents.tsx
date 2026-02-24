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

const MyEvents: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('registered');

  // Sample events data - modify this array to test empty states
  const events: Event[] = [
    {
      id: 1,
      title: 'ورشة عمل التطوير المهني',
      description: 'ورشة تدريبية شاملة لتطوير المهارات الوظيفية والتقنية للطلاب',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop',
      status: 'registered',
      date: '15 ديسمبر 2024',
      registrationDeadline: '10 ديسمبر 2024',
      organizerName: 'المركز الثقافي',
      rating: 5,
      isActive: true
    },
    {
      id: 2,
      title: 'ورشة الذكاء الاصطناعي',
      description: 'ورشة متقدمة عن تطبيقات الذكاء الاصطناعي وتأثيرها على تطوير الأعمال',
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop',
      status: 'registered',
      date: '18 ديسمبر 2024',
      registrationDeadline: '12 ديسمبر 2024',
      organizerName: 'معهد التقنيات المتقدمة',
      rating: 4,
      isActive: true
    }
  ];

  const filterCounts = {
    all: events.length,
    registered: events.filter(e => e.status === 'registered').length,
    completed: events.filter(e => e.status === 'completed').length,
    cancelled: events.filter(e => e.status === 'cancelled').length
  };

  const filteredEvents = activeFilter === 'all' 
    ? events 
    : events.filter(event => event.status === activeFilter);

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, index) => (
      <span key={index} className={index < rating ? 'star filled' : 'star'}>
        ★
      </span>
    ));
  };

  return (
    <div className="my-events-container">
      {/* Header Section */}
      <div className="events-header">
        <h1 className="events-title">أنشطتي</h1>
        <p className="events-subtitle">
          تتبع جميع الأنشطة والفعاليات التي سجلت بها أو الفعاليات التي شارك بها
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-number">{filterCounts.registered}</div>
          <div className="stat-label">أنشطة التسجيل</div>
        </div>
        <div className="stat-card">
          <div className="stat-number special">{filterCounts.cancelled}</div>
          <div className="stat-label">ملغية</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{filterCounts.completed}</div>
          <div className="stat-label">مكتملة</div>
        </div>
        <div className="stat-card">
          <div className="stat-number special">{filterCounts.all}</div>
          <div className="stat-label">مشاركة</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{filterCounts.registered}</div>
          <div className="stat-label">إجمالي الأنشطة</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          className={`filter-tab ${activeFilter === 'registered' ? 'active' : ''}`}
          onClick={() => setActiveFilter('registered')}
        >
          مُسجل
        </button>
        <button
          className={`filter-tab ${activeFilter === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveFilter('completed')}
        >
          مكتمل
        </button>
        <button
          className={`filter-tab ${activeFilter === 'cancelled' ? 'active' : ''}`}
          onClick={() => setActiveFilter('cancelled')}
        >
          ملغي
        </button>
        <button
          className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          الكل
        </button>
      </div>

      {/* Events Grid or Empty State */}
      {filteredEvents.length > 0 ? (
        <div className="events-grid">
          {filteredEvents.map((event) => (
            <div key={event.id} className="event-card">
              {/* Event Image */}
              <div className="event-image-container">
                <img src={event.image} alt={event.title} className="event-image" />
                {event.isActive && (
                  <span className="active-badge">نشط</span>
                )}
              </div>

              {/* Event Content */}
              <div className="event-content">
                <h3 className="event-title">{event.title}</h3>
                <p className="event-description">{event.description}</p>

                {/* Event Metadata */}
                <div className="event-meta">
                  <div className="meta-item">
                    <svg className="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{event.date}</span>
                  </div>

                  <div className="meta-item">
                    <svg className="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>{event.organizerName}</span>
                  </div>

                  <div className="meta-item">
                    <svg className="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>تاريخ التسجيل: {event.registrationDeadline}</span>
                  </div>
                </div>

                {/* Rating */}
                <div className="event-rating">
                  <div className="stars">
                    {renderStars(event.rating)}
                  </div>
                  <span className="rating-label">التقييم:</span>
                </div>

                <div className="rating-text">تجربة رائعة ومفيدة جداً</div>

                {/* Download Button */}
                <button className="download-btn">
                  <svg className="download-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  تحميل الشهادة
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="empty-title">لا توجد أنشطة في هذه الفئة</h2>
          <p className="empty-subtitle">جرب اختيار فئة أخرى</p>
        </div>
      )}
    </div>
  );
};

export default MyEvents;