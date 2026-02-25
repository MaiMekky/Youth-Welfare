"use client";
import React, { useState, useEffect, useCallback } from 'react';
import './MyEvents.css';

/* ══════════════════════════════════════════
   TYPES
══════════════════════════════════════════ */
interface ApiJoinedEvent {
  event_id: number;
  title: string;
  description: string;
  st_date: string;
  end_date: string;
  location: string;
  type: string;
  cost: string;
  faculty_name: string;
  dept_name: string;
  participation_status: string;
  participation_rank: number | null;
  participation_reward: string | null;
  imgs: string | null;
  reward: string;
}

interface MyResult {
  rank: number | null;
  reward: string | null;
  message?: string;
}

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  endDate: string;
  location: string;
  type: string;
  faculty: string;
  dept: string;
  cost: string;
  reward: string;
  participationStatus: string;
  rank: number | null;
  resultReward: string | null;
  image: string | null;
}

type FilterType = 'all' | 'مقبول' | 'منتظر' | 'مرفوض';

/* ══════════════════════════════════════════
   MAPPER
══════════════════════════════════════════ */
const mapEvent = (e: ApiJoinedEvent): Event => ({
  id:                  e.event_id,
  title:               e.title,
  description:         e.description,
  date:                new Date(e.st_date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' }),
  endDate:             new Date(e.end_date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' }),
  location:            e.location,
  type:                e.type,
  faculty:             e.faculty_name,
  dept:                e.dept_name,
  cost:                e.cost,
  reward:              e.reward,
  participationStatus: e.participation_status,
  rank:                e.participation_rank,
  resultReward:        e.participation_reward,
  image:               e.imgs,
});

/* ══════════════════════════════════════════
   ICONS
══════════════════════════════════════════ */
const CalIcon = () => (
  <svg className="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const PinIcon = () => (
  <svg className="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);
const BuildingIcon = () => (
  <svg className="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <rect x="2" y="3" width="20" height="18" rx="2"/>
    <path d="M8 21V9M16 21V9M2 9h20"/>
  </svg>
);
const TagIcon = () => (
  <svg className="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
);
const TrophyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
    <path d="M4 22h16"/>
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
  </svg>
);
const GiftIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 12 20 22 4 22 4 12"/>
    <rect x="2" y="7" width="20" height="5"/>
    <line x1="12" y1="22" x2="12" y2="7"/>
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
  </svg>
);
const DownloadIcon = () => (
  <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
  </svg>
);
const ResultIcon = () => (
  <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 8v4l3 3"/>
  </svg>
);
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const EmptyTrophyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
    <path d="M4 22h16"/>
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
  </svg>
);

/* ══════════════════════════════════════════
   STATUS HELPERS
══════════════════════════════════════════ */
const STATUS_META: Record<string, { cls: string; dot: string }> = {
  'مقبول':  { cls: 'status-accepted', dot: '#16a34a' },
  'منتظر':  { cls: 'status-pending',  dot: '#d97706' },
  'مرفوض':  { cls: 'status-rejected', dot: '#dc2626' },
};
const getStatus = (s: string) => STATUS_META[s] ?? { cls: 'status-default', dot: '#6b7a99' };

const FILTERS: { id: FilterType; label: string }[] = [
  { id: 'all',    label: 'الكل'  },
  { id: 'مقبول', label: 'مقبول' },
  { id: 'منتظر', label: 'منتظر' },
  { id: 'مرفوض', label: 'مرفوض'},
];

/* ══════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════ */
export default function MyEvents() {
  const [events,       setEvents]       = useState<Event[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [resultModal,  setResultModal]  = useState<{
    event: Event;
    result: MyResult | null;
    loading: boolean;
  } | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('access') : null;

  /* ── Fetch joined events ── */
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch('http://127.0.0.1:8000/api/event/student-events/joined/', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error('فشل تحميل الفعاليات');
        const raw = await res.json();
        const arr: ApiJoinedEvent[] = raw.data ?? raw.results ?? (Array.isArray(raw) ? raw : []);
        setEvents(arr.map(mapEvent));
      } catch (e: any) { setError(e.message); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  /* ── Fetch result modal ── */
  const fetchResult = useCallback(async (event: Event) => {
    setResultModal({ event, result: null, loading: true });
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/event/student-events/${event.id}/my-result/`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('فشل تحميل النتيجة');
      const raw = await res.json();
      const d   = raw.data ?? raw;
      setResultModal({ event, loading: false, result: { rank: d.rank, reward: d.reward, message: d.message } });
    } catch {
      setResultModal(prev => prev
        ? { ...prev, loading: false, result: { rank: null, reward: null, message: 'تعذّر تحميل النتيجة' } }
        : null
      );
    }
  }, [token]);

  /* ── Counts ── */
  const counts = {
    all:    events.length,
    'مقبول': events.filter(e => e.participationStatus === 'مقبول').length,
    'منتظر': events.filter(e => e.participationStatus === 'منتظر').length,
    'مرفوض': events.filter(e => e.participationStatus === 'مرفوض').length,
  };

  const filtered = activeFilter === 'all'
    ? events
    : events.filter(e => e.participationStatus === activeFilter);

  /* ══════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════ */
  return (
    <div className="my-events-page" dir="rtl">

      {/* ══ HERO ══ */}
      <div className="my-events-hero">
        <div className="hero-inner">
          <div>
            <h1 className="hero-title">أنشطتي</h1>
            <p className="hero-sub">تتبع جميع الأنشطة والفعاليات التي سجّلت بها أو شاركت فيها</p>
          </div>
          <div className="hero-stats">
            {[
              { num: counts.all,      lbl: 'إجمالي' },
              { num: counts['مقبول'], lbl: 'مقبول'  },
              { num: counts['منتظر'], lbl: 'منتظر'  },
              { num: counts['مرفوض'], lbl: 'مرفوض' },
            ].map(s => (
              <div key={s.lbl} className="stat-pill">
                <span className="stat-num">{s.num}</span>
                <span className="stat-lbl">{s.lbl}</span>
              </div>
            ))}
          </div>
        </div>

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

        {loading && (
          <div className="ev-center-state">
            <div className="ev-spinner" />
            <p>جاري تحميل فعالياتك...</p>
          </div>
        )}

        {!loading && error && (
          <div className="ev-center-state ev-error">⚠️ {error}</div>
        )}

        {!loading && !error && (
          <>
            <p className="results-bar">
              عرض <strong>{filtered.length}</strong>
              {activeFilter !== 'all' ? ` فعالية · ${activeFilter}` : ' فعالية'}
            </p>

            <div className="events-grid">
              {filtered.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon"><EmptyTrophyIcon /></div>
                  <h2 className="empty-title">لا توجد فعاليات في هذه الفئة</h2>
                  <p className="empty-subtitle">جرّب اختيار فئة أخرى</p>
                </div>
              ) : filtered.map(event => {
                const st         = getStatus(event.participationStatus);
                const isAccepted = event.participationStatus === 'مقبول';
                const hasRank    = event.rank !== null;

                return (
                  <div key={event.id} className={`event-card${isAccepted ? ' card-accepted' : ''}`}>

                    {/* ── Image ── */}
                    <div className="event-img-wrap">
                      {event.image
                        ? <img src={event.image} alt={event.title} className="event-img" />
                        : <div className="event-img-placeholder">
                            <div className="placeholder-icon"><TrophyIcon /></div>
                            <span>{event.type}</span>
                          </div>
                      }
                      <span className={`status-chip ${st.cls}`}>
                        <span className="status-dot" style={{ background: st.dot }} />
                        {event.participationStatus}
                      </span>
                      {hasRank && <span className="rank-chip">🏆 #{event.rank}</span>}
                    </div>

                    {/* ── Content ── */}
                    <div className="event-content">
                      <span className="type-pill">{event.type}</span>
                      <h3 className="event-title">{event.title}</h3>
                      <p className="event-description">{event.description}</p>

                      <div className="event-meta">
                        <div className="meta-item"><CalIcon />{event.date}</div>
                        <div className="meta-item"><PinIcon />{event.location}</div>
                        <div className="meta-item"><BuildingIcon />{event.faculty}</div>
                        <div className="meta-item"><TagIcon />{event.dept}</div>
                      </div>

                      {/* Reward strip */}
                      {event.reward && (
                        <div className="reward-strip">
                          <GiftIcon />
                          <span>{event.reward}</span>
                        </div>
                      )}

                      {/* Inline result (already known) */}
                      {(event.rank !== null || event.resultReward) && (
                        <div className="result-inline">
                          {event.rank !== null  && <span className="result-tag">🏅 المركز {event.rank}</span>}
                          {event.resultReward   && <span className="result-tag">🎁 {event.resultReward}</span>}
                        </div>
                      )}

                      {/* CTA row */}
                      <div className="card-actions">
                        {isAccepted ? (
                          <>
                            <button className="btn-result" onClick={() => fetchResult(event)}>
                              <ResultIcon /> نتيجتي
                            </button>
                            <button className="btn-download">
                              <DownloadIcon /> الشهادة
                            </button>
                          </>
                        ) : (
                          <div className={`status-info-bar ${st.cls}`}>
                            <span className="status-dot" style={{ background: st.dot }} />
                            {event.participationStatus === 'منتظر' ? 'طلبك قيد المراجعة' : 'تم رفض طلبك'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ══ RESULT MODAL ══ */}
      {resultModal && (
        <>
          <div className="modal-overlay" onClick={() => setResultModal(null)} />
          <div className="result-modal">
            <div className="modal-header">
              <button className="modal-close" onClick={() => setResultModal(null)}>
                <CloseIcon />
              </button>
              <p className="modal-event-name">{resultModal.event.title}</p>
              <p className="modal-event-sub">{resultModal.event.date} · {resultModal.event.location}</p>
            </div>

            <div className="modal-body">
              {resultModal.loading ? (
                <div className="modal-loading">
                  <div className="ev-spinner" />
                  <p>جاري تحميل نتيجتك...</p>
                </div>
              ) : !resultModal.result?.rank && !resultModal.result?.reward ? (
                <div className="modal-pending">
                  <div className="modal-icon-wrap modal-icon-pending">
                    <TrophyIcon />
                  </div>
                  <p className="modal-main-msg">
                    {resultModal.result?.message ?? 'لم تُنشر النتائج بعد'}
                  </p>
                  <p className="modal-sub-msg">ستظهر نتيجتك هنا بعد نشرها من قِبَل الإدارة</p>
                </div>
              ) : (
                <div className="modal-result-content">
                  <div className="modal-icon-wrap modal-icon-trophy">
                    <TrophyIcon />
                  </div>
                  <p className="modal-congrats">مبروك على مشاركتك! 🎉</p>

                  {resultModal.result?.rank && (
                    <div className="result-big-rank">
                      <span className="rank-label">ترتيبك</span>
                      <span className="rank-value">#{resultModal.result.rank}</span>
                    </div>
                  )}

                  {resultModal.result?.reward && (
                    <div className="result-reward-box">
                      <div className="reward-box-icon"><GiftIcon /></div>
                      <div>
                        <p className="reward-box-label">جائزتك</p>
                        <p className="reward-box-value">{resultModal.result.reward}</p>
                      </div>
                    </div>
                  )}

                  {resultModal.event.reward && (
                    <div className="event-reward-note">
                      <span>🏆</span>
                      <span>{resultModal.event.reward}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}