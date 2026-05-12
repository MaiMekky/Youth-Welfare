"use client";
import React, { useState, useEffect, useCallback } from 'react';
import './Events.css';
import { authFetch, getBaseUrl } from "@/utils/globalFetch";
import { useToast } from "@/app/context/ToastContext";
import StudentHero from "../components/StudentHero";


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
  reward: string | null;
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
  startDate: string;
  canRegister: boolean;
}

/* ══════════════════════════════════════════
   MAPPER
══════════════════════════════════════════ */
const mapEvent = (e: ApiEvent): Event => {
  const startDate = new Date(e.st_date);
  const now = new Date();
  const daysUntilStart = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const canRegister = daysUntilStart >= 3 && !e.is_full;

  return {
    id:          e.event_id,
    title:       e.title || '---',
    description: e.description || '---',
    date:        new Date(e.st_date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' }),
    location:    e.location || '---',
    seats:       e.s_limit || 0,
    takenSeats:  e.current_participants || 0,
    type:        e.type || '---',
    faculty:     e.faculty_name || '---',
    dept:        e.dept_name || '---',
    cost:        e.cost || '---',
    reward:      e.reward || '---',
    isFull:      e.is_full,
    daysLeft:    e.days_remaining,
    startDate:   e.st_date,
    canRegister: canRegister,
  };
};

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
const WarningIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="modal-warn-icon">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const BanIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <circle cx="12" cy="12" r="10"/>
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
  </svg>
);
const UndoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M3 7v6h6"/>
    <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>
  </svg>
);
const UserCheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="8.5" cy="7" r="4"/>
    <polyline points="17 11 19 13 23 9"/>
  </svg>
);

/* ══════════════════════════════════════════
   CONFIRMATION MODAL
══════════════════════════════════════════ */
interface ConfirmModalProps {
  event: Event | null;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ event, onConfirm, onCancel, isLoading }) => {
  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', handleKey);
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onCancel]);

  if (!event) return null;

  return (
    <div className="modal-overlay" onClick={onCancel} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-container" onClick={e => e.stopPropagation()}>

        {/* ── MODAL HEADER ── */}
        <div className="modal-header">
          <div className="modal-header-icon">
            <WarningIcon />
          </div>
          <div className="modal-header-text">
            <h2 id="modal-title" className="modal-title">تأكيد التسجيل في الفعالية</h2>
            <p className="modal-event-name">{event.title}</p>
          </div>
          <button className="modal-close-btn" onClick={onCancel} aria-label="إغلاق">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* ── MODAL BODY ── */}
        <div className="modal-body">

          {/* Confirmation question */}
          <div className="modal-confirm-banner">
            <span className="modal-confirm-q">هل أنت متأكد من رغبتك في التسجيل؟</span>
            <span className="modal-confirm-sub">يرجى قراءة الشروط والقيود أدناه قبل تأكيد طلبك</span>
          </div>

          {/* ── RESTRICTIONS GRID ── */}
          <div className="modal-restrictions">

            {/* Card 1 — No undo */}
            <div className="restriction-card restriction-red">
              <div className="restriction-icon-wrap restriction-icon-red">
                <UndoIcon />
              </div>
              <div className="restriction-content">
                <h4 className="restriction-title">لا يمكن التراجع عن التسجيل</h4>
                <p className="restriction-desc">
                  بمجرد تأكيد تسجيلك، <strong>لن تتمكن من إلغاء طلبك بنفسك</strong> عبر المنصة.
                  في حال رغبتك في الانسحاب لاحقًا، يتعين عليك التواصل المباشر مع{' '}
                  <strong>مسؤولي النشاط</strong> وإبلاغهم قبل انعقاد الفعالية.
                </p>
              </div>
            </div>

            {/* Card 2 — Absence penalty */}
            <div className="restriction-card restriction-orange">
              <div className="restriction-icon-wrap restriction-icon-orange">
                <BanIcon />
              </div>
              <div className="restriction-content">
                <h4 className="restriction-title">قاعدة الغياب المتكرر</h4>
                <p className="restriction-desc">
                  إذا قمت بالتسجيل في فعالية و<strong>لم تحضر 3 مرات متتالية</strong> دون إخطار مسبق،
                  سيتم <strong>تعليق حقك في التسجيل</strong> في الفعاليات القادمة تلقائيًا.
                  احرص على الحضور أو الإلغاء المسبق مع المسؤولين.
                </p>
              </div>
            </div>

            {/* Card 3 — Commitment */}
            <div className="restriction-card restriction-navy">
              <div className="restriction-icon-wrap restriction-icon-navy">
                <ShieldIcon />
              </div>
              <div className="restriction-content">
                <h4 className="restriction-title">الالتزام بشروط الفعالية</h4>
                <p className="restriction-desc">
                  بالتسجيل، أنت تُقرّ بالتزامك بكافة قواعد وأنظمة الفعالية، بما تشمل{' '}
                  <strong>المواعيد، والسلوك، ومتطلبات الحضور</strong>.
                  أي مخالفة قد تؤثر على سجلّك الأكاديمي والأنشطة المستقبلية.
                </p>
              </div>
            </div>

            {/* Card 4 — Contact officials */}
            <div className="restriction-card restriction-green">
              <div className="restriction-icon-wrap restriction-icon-green">
                <UserCheckIcon />
              </div>
              <div className="restriction-content">
                <h4 className="restriction-title">للاستفسار والتواصل</h4>
                <p className="restriction-desc">
                  لأي استفسار أو طلب استثنائي يخص التسجيل أو الانسحاب، يرجى التواصل مع{' '}
                  <strong>مسؤولي النشاط المختصين</strong> في القسم أو الكلية المنظِّمة للفعالية
                  خلال ساعات العمل الرسمية.
                </p>
              </div>
            </div>

          </div>{/* end modal-restrictions */}

          {/* Disclaimer bar */}
          <div className="modal-disclaimer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="disclaimer-icon">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            <span>
              بالنقر على «تأكيد التسجيل» أدناه، فإنك تُقرّ بأنك قرأت وفهمت جميع الشروط المذكورة وتوافق عليها.
            </span>
          </div>

        </div>{/* end modal-body */}

        {/* ── MODAL FOOTER ── */}
        <div className="modal-footer">
          <button className="modal-btn modal-btn-cancel" onClick={onCancel} disabled={isLoading}>
            إلغاء
          </button>
          <button className="modal-btn modal-btn-confirm" onClick={onConfirm} disabled={isLoading}>
            {isLoading
              ? <><span className="btn-spinner" /> جاري إرسال الطلب...</>
              : <><CheckIcon /> تأكيد التسجيل</>
            }
          </button>
        </div>

      </div>
    </div>
  );
};

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
  const { showToast } = useToast();
  const [events,      setEvents]      = useState<Event[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [joiningId,   setJoiningId]   = useState<number | null>(null);
  const [registered,  setRegistered]  = useState<Set<number>>(new Set());
  const [activeType,  setActiveType]  = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state
  const [modalEvent,  setModalEvent]  = useState<Event | null>(null);

  /* ── Fetch events ── */
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await authFetch(`${getBaseUrl()}/api/event/student-events/available/`);
        if (!res.ok) throw new Error('فشل تحميل الفعاليات');
        const raw = await res.json();
        const arr: ApiEvent[] = Array.isArray(raw)
          ? raw
          : (raw.data ?? raw.results ?? []);
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

  /* ── Open modal ── */
  const openModal = useCallback((e: React.MouseEvent, event: Event) => {
    e.stopPropagation();
    setModalEvent(event);
  }, []);

  /* ── Cancel modal ── */
  const closeModal = useCallback(() => {
    if (joiningId !== null) return; // don't close while submitting
    setModalEvent(null);
  }, [joiningId]);

  /* ── Confirm join (called from modal) ── */
  const confirmJoin = useCallback(async () => {
    if (!modalEvent) return;
    const id = modalEvent.id;
    try {
      setJoiningId(id);
      const res = await authFetch(`${getBaseUrl()}/api/event/student-events/${id}/join/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.message || body.detail || 'فشل إرسال الطلب');
      }
      setRegistered(prev => new Set([...prev, id]));
      setEvents(prev => prev.map(ev => ev.id === id ? { ...ev, takenSeats: ev.takenSeats + 1 } : ev));
      showToast('تم إرسال الطلب بنجاح', 'success');
      setModalEvent(null);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'حدث خطأ', 'error');
    } finally {
      setJoiningId(null);
    }
  }, [modalEvent, showToast]);

  /* ── Filters ── */
  const types    = ['all', ...Array.from(new Set(events.map(e => e.type)))];
  const filtered = events.filter(e =>
    (activeType === 'all' || e.type === activeType) &&
    (!searchQuery || e.title.includes(searchQuery) || (e.description ?? '').includes(searchQuery))
  );

  const filterOptions = types.map(t => ({
    id: t,
    label: t === 'all' ? 'جميع الفعاليات' : t,
  }));

  /* ══════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════ */
  return (
    <>
      {/* Confirmation Modal */}
      {modalEvent && (
        <ConfirmModal
          event={modalEvent}
          onConfirm={confirmJoin}
          onCancel={closeModal}
          isLoading={joiningId !== null}
        />
      )}

      <div className="events-page" dir="rtl">

        {/* ══ HERO ══ */}
        <StudentHero
          title="جميع الأنشطة والفعاليات"
          subtitle="استكشف الفعاليات المتاحة وسجّل في ما يناسبك مباشرةً"
          count={filtered.length}
          countLabel="فعالية"
          filters={filterOptions}
          activeFilter={activeType}
          onFilterChange={setActiveType}
        />

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
                const canApply  = event.canRegister && !isReg && !event.isFull;

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
                          {!event.canRegister && !event.isFull && !isReg && (
                            <span className="full-badge">التسجيل غير متاح</span>
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
                        {event.reward && event.reward !== '---' && (
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

                      {/* CTA buttons */}
                      <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                        {isReg ? (
                          <button className="register-btn registered-btn" disabled>
                            <CheckIcon /> تم التسجيل
                          </button>
                        ) : event.isFull ? (
                          <button className="register-btn full-btn" disabled>
                            المقاعد مكتملة
                          </button>
                        ) : !event.canRegister ? (
                          <button className="register-btn full-btn" disabled>
                            التسجيل مغلق
                          </button>
                        ) : (
                          <button
                            className="register-btn"
                            onClick={(e) => openModal(e, event)}
                            disabled={isJoining || !canApply}
                          >
                            {isJoining
                              ? <><span className="btn-spinner" /> جاري إرسال الطلب...</>
                              : 'التسجيل في الفعالية'
                            }
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}