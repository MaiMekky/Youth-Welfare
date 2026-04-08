"use client";
import React, { useState, useEffect } from 'react';
import './Events.css';
import { authFetch } from "@/utils/globalFetch";

/* ══════════════════════════════════════════
   TYPES
══════════════════════════════════════════ */
interface ApiEvent {
  event_id: number;
  title: string;
  description: string;
  st_date: string;
  end_date: string;
  location: string;
  type: string;
  cost: string;
  s_limit: number;
  faculty_name: string;
  dept_name: string;
  days_remaining: number;
  is_full: boolean;
  current_participants: number;
  imgs: string | null;
  reward: string;
}

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  seats: number;
  takenSeats: number;
  type: string;
  faculty: string;
  dept: string;
  cost: string;
  reward: string;
  isFull: boolean;
  daysLeft: number;
}

/* ══════════════════════════════════════════
   MAPPER
══════════════════════════════════════════ */
const mapEvent = (e: ApiEvent): Event => ({
  id:          e.event_id,
  title:       e.title,
  description: e.description,
  date:        new Date(e.st_date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' }),
  location:    e.location,
  seats:       e.s_limit,
  takenSeats:  e.current_participants,
  type:        e.type,
  faculty:     e.faculty_name,
  dept:        e.dept_name,
  cost:        e.cost,
  reward:      e.reward,
  isFull:      e.is_full,
  daysLeft:    e.days_remaining,
});

/* ══════════════════════════════════════════
   ICONS
══════════════════════════════════════════ */
const CalendarIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const PinIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);
const UsersIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const BuildingIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <rect x="2" y="3" width="20" height="18" rx="2"/>
    <path d="M8 21V9M16 21V9M2 9h20"/>
  </svg>
);
const CoinIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <circle cx="12" cy="12" r="9"/>
    <path d="M12 7v2M12 15v2M9.5 9.5C9.5 8.7 10.6 8 12 8s2.5.7 2.5 1.5S13.4 11 12 11s-2.5.7-2.5 1.5S10.6 14 12 14s2.5-.7 2.5-1.5"/>
  </svg>
);
const GiftIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <polyline points="20 12 20 22 4 22 4 12"/>
    <rect x="2" y="7" width="20" height="5"/>
    <line x1="12" y1="22" x2="12" y2="7"/>
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
  </svg>
);
const CheckIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

/* ══════════════════════════════════════════
   HELPERS
══════════════════════════════════════════ */
const TYPE_BADGE: Record<string, string> = {
  'نشاط رياضي': 'badge-social',
  'نشاط علمي':  'badge-scientific',
  'نشاط ثقافي': 'badge-cultural',
  'نشاط فني':   'badge-artistic',
  'تطوعي':      'badge-volunteer',
  'اتحاد':      'badge-unions',
};
const getBadgeClass = (type: string) => TYPE_BADGE[type] ?? 'badge-default';
const seatsPercent  = (taken: number, total: number) =>
  total > 0 ? Math.min(100, Math.round((taken / total) * 100)) : 0;

/* ══════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════ */
export default function Events() {
  const [events,      setEvents]      = useState<Event[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [joiningId,   setJoiningId]   = useState<number | null>(null);
  const [registered,  setRegistered]  = useState<Set<number>>(new Set());
  const [toast,       setToast]       = useState<{ msg: string; ok: boolean } | null>(null);
  const [activeType,  setActiveType]  = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('access') : null;

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  };

  /* ── Fetch ── */
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await authFetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/event/student-events/available/`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error('فشل تحميل الفعاليات');
        const raw = await res.json();
        const arr: ApiEvent[] = Array.isArray(raw) ? raw : (raw.results ?? raw.data ?? []);
        setEvents(arr.map(mapEvent));
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'فشل تحميل الفعاليات');
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Join ── */
  const joinEvent = async (id: number) => {
    if (!token) { showToast('يرجى تسجيل الدخول أولاً', false); return; }
    try {
      setJoiningId(id);
      const res = await authFetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/event/student-events/${id}/join/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || err.detail || 'فشل إرسال الطلب');
      }
      setRegistered(prev => new Set([...prev, id]));
      setEvents(prev => prev.map(e => e.id === id ? { ...e, takenSeats: e.takenSeats + 1 } : e));
      showToast('تم إرسال الطلب بنجاح', true);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'حدث خطأ', false);
    } finally {
      setJoiningId(null);
    }
  };

  /* ── Filters ── */
  const types    = ['all', ...Array.from(new Set(events.map(e => e.type)))];
  const filtered = events.filter(e =>
    (activeType === 'all' || e.type === activeType) &&
    (!searchQuery || e.title.includes(searchQuery) || (e.description ?? '').includes(searchQuery))
  );

  /* ══════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════ */
  return (
    <div className="events-page" dir="rtl">

      {/* ── Toast ── */}
      {toast && (
        <div className={`ev-toast ${toast.ok ? 'ev-toast-success' : 'ev-toast-error'}`}>
          {toast.ok ? '✅' : '❌'} {toast.msg}
        </div>
      )}

      {/* ══ HERO ══ */}
      <div className="events-hero">
        <div className="hero-inner">
          <div className="hero-text">
            <h1 className="hero-title">جميع الأنشطة والفعاليات</h1>
            <p className="hero-sub">استكشف الفعاليات المتاحة وسجّل في ما يناسبك مباشرةً</p>
          </div>
          <span className="hero-count">{filtered.length} فعالية</span>
        </div>

        <div className="hero-filters">
          {types.map(t => (
            <button
              key={t}
              className={`filter-pill${activeType === t ? ' active' : ''}`}
              onClick={() => setActiveType(t)}
            >
              {t === 'all' ? 'جميع الفعاليات' : t}
            </button>
          ))}
        </div>
      </div>

      {/* ══ BODY ══ */}
      <div className="events-body">

        {/* Search + count */}
        <div className="search-bar-row">
          <div className="search-wrap">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className="search-input"
              type="text"
              placeholder="ابحث عن فعالية..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <span className="results-label">عرض <strong>{filtered.length}</strong> فعالية</span>
        </div>

        {loading && (
          <div className="ev-center-state">
            <div className="ev-spinner" />
            <p>جاري تحميل الفعاليات...</p>
          </div>
        )}

        {!loading && error && (
          <div className="ev-center-state ev-error">
            <p>⚠️ {error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="events-grid">
            {filtered.length === 0 && (
              <div className="empty-state"><p>لا توجد فعاليات تطابق البحث</p></div>
            )}

            {filtered.map(event => {
              const isReg     = registered.has(event.id);
              const isJoining = joiningId === event.id;
              const pct       = seatsPercent(event.takenSeats, event.seats);

              return (
                <div key={event.id} className="event-card">

                  {/* ── CARD HEADER ── */}
                  <div className="card-header">
                    <div className="card-header-top">
                      <span className={`event-badge ${getBadgeClass(event.type)}`}>{event.type}</span>
                      <div className="card-chips">
                        {isReg && (
                          <span className="status-badge">✓ مسجّل</span>
                        )}
                        {event.isFull && !isReg && (
                          <span className="full-badge">مكتمل</span>
                        )}
                        {event.daysLeft > 0 && (
                          <span className="days-chip">{event.daysLeft} يوم</span>
                        )}
                      </div>
                    </div>
                    <h3 className="event-title">{event.title}</h3>
                  </div>

                  {/* ── CARD BODY ── */}
                  <div className="event-content">
                    <p className="event-description">{event.description}</p>

                    <div className="event-meta">
                      <div className="meta-item"><CalendarIcon /><span>{event.date}</span></div>
                      <div className="meta-item"><PinIcon /><span>{event.location}</span></div>
                      <div className="meta-item"><BuildingIcon /><span>{event.faculty}</span></div>
                      <div className="meta-item">
                        <UsersIcon /><span>{event.takenSeats} / {event.seats} مقعد</span>
                      </div>
                      {Number(event.cost) > 0 && (
                        <div className="meta-item"><CoinIcon /><span>{event.cost} ج.م</span></div>
                      )}
                      {event.reward && (
                        <div className="meta-item meta-wide"><GiftIcon /><span>{event.reward}</span></div>
                      )}
                    </div>

                    {/* Seats bar */}
                    <div className="seats-row">
                      <div className="seats-bar">
                        <div
                          className={`seats-fill ${pct >= 90 ? 'seats-fill-danger' : pct >= 60 ? 'seats-fill-warn' : ''}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="seats-pct">{pct}%</span>
                    </div>

                    {/* CTA button */}
                    {isReg ? (
                      <button className="register-btn registered-btn" disabled>
                        <CheckIcon /> تم التسجيل
                      </button>
                    ) : event.isFull ? (
                      <button className="register-btn full-btn" disabled>
                        المقاعد مكتملة
                      </button>
                    ) : (
                      <button
                        className="register-btn"
                        onClick={() => joinEvent(event.id)}
                        disabled={isJoining}
                      >
                        {isJoining
                          ? <><span className="btn-spinner" /> جاري إرسال الطلب...</>
                          : 'التسجيل في الفعالية'
                        }
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}