"use client";
import React, { useState, useEffect, useCallback } from 'react';
import './MyEvents.css';
import { authFetch, getBaseUrl } from "@/utils/globalFetch";
import EventDetails from './EventDetails/EventDetails';
import StudentHero from "../components/StudentHero";

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
  hasTeam?: boolean;
  teamSettingsEnabled?: boolean;
}

type FilterType = 'all' | 'مقبول' | 'قيد الانتظار' | 'مرفوض';

/* ══════════════════════════════════════════
   NORMALIZE STATUS
══════════════════════════════════════════ */
const normalizeStatus = (status: string): string => {
  const s = status?.trim().toLowerCase();
  if (s === 'pending'  || s === 'منتظر')                    return 'قيد الانتظار';
  if (s === 'accepted' || s === 'active' || s === 'مقبول')  return 'مقبول';
  if (s === 'rejected' || s === 'مرفوض')                    return 'مرفوض';
  return status;
};

/* ══════════════════════════════════════════
   MAPPER
══════════════════════════════════════════ */
const mapEvent = (e: ApiJoinedEvent & { has_team?: boolean; team_settings_enabled?: boolean }): Event => ({
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
  participationStatus: normalizeStatus(e.participation_status),
  rank:                e.participation_rank,
  resultReward:        e.participation_reward,
  hasTeam:             e.has_team,
  teamSettingsEnabled: e.team_settings_enabled,
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
   META ROW HELPER
   — renders icon + value; shows "—" when value is empty/null/undefined
══════════════════════════════════════════ */
const MetaRow = ({
  icon,
  value,
}: {
  icon: React.ReactNode;
  value: string | null | undefined;
}) => (
  <div className="meta-item" style={{
    display: 'flex',
    alignItems: 'flex-start',
    gap: '9px',
    padding: '9px 14px',
    fontSize: '13px',
    fontWeight: 700,
    color: '#2D4A63',
    lineHeight: 1.45,
    borderBottom: '1px solid #EDF3FA',
    minWidth: 0
  }}>
    {icon}
    {value
      ? <span style={{
          flex: 1,
          minWidth: 0,
          whiteSpace: 'normal',
          overflowWrap: 'break-word',
          wordBreak: 'break-word'
        }}>{value}</span>
      : <span className="meta-value-empty" style={{
          flex: 1,
          minWidth: 0,
          whiteSpace: 'normal',
          overflowWrap: 'break-word',
          wordBreak: 'break-word'
        }} />
    }
  </div>
);

/* ══════════════════════════════════════════
   STATUS HELPERS
══════════════════════════════════════════ */
const STATUS_META: Record<string, { cls: string; dot: string }> = {
  'مقبول':        { cls: 'status-accepted', dot: '#059669' },
  'قيد الانتظار': { cls: 'status-pending',  dot: '#D97706' },
  'مرفوض':        { cls: 'status-rejected', dot: '#DC2626' },
};
const getStatus = (s: string) => STATUS_META[s] ?? { cls: 'status-default', dot: '#6B8299' };

const FILTERS: { id: FilterType; label: string }[] = [
  { id: 'all',           label: 'الكل'         },
  { id: 'مقبول',        label: 'مقبول'        },
  { id: 'قيد الانتظار', label: 'قيد الانتظار' },
  { id: 'مرفوض',        label: 'مرفوض'        },
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
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [studentId,       setStudentId]       = useState<number>(0);

  /* ── Fetch events + team info ── */
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const baseUrl = getBaseUrl();

        
        const res = await authFetch(`${baseUrl}/api/event/student-events/joined/`);
        if (!res.ok) throw new Error('فشل تحميل الفعاليات');
        const raw = await res.json();
        const arr: ApiJoinedEvent[] = raw.data ?? raw.results ?? (Array.isArray(raw) ? raw : []);

        // Check team membership for each event
        const myTeamsRes = await authFetch(`${baseUrl}/api/event/student-teams/my-teams/`);
        let teamEventIds: number[] = [];
        if (myTeamsRes.ok) {
          const teamsData = await myTeamsRes.json();
          const teams = teamsData.data ?? [];
          teamEventIds = teams.map((t: { event: number }) => t.event);
        }

        const eventsWithTeamInfo = arr.map(e => ({
          ...e,
          has_team: teamEventIds.includes(e.event_id),
        }));

        setEvents(eventsWithTeamInfo.map(mapEvent));
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Fetch result for a single event ── */
  const fetchResult = useCallback(async (event: Event) => {
    setResultModal({ event, result: null, loading: true });
    try {
      const res = await authFetch(`${getBaseUrl()}/api/event/student-events/${event.id}/my-result/`);
      if (!res.ok) throw new Error('فشل تحميل النتيجة');
      const raw = await res.json();
      const d   = raw.data ?? raw;
      setResultModal({
        event,
        loading: false,
        result: { rank: d.rank, reward: d.reward, message: d.message },
      });
    } catch {
      setResultModal(prev =>
        prev ? { ...prev, loading: false, result: { rank: null, reward: null, message: 'تعذّر تحميل النتيجة' } } : null
      );
    }
  }, []);

  /* ── Derived counts ── */
  const counts = {
    all:             events.length,
    'مقبول':        events.filter(e => e.participationStatus === 'مقبول').length,
    'قيد الانتظار': events.filter(e => e.participationStatus === 'قيد الانتظار').length,
    'مرفوض':        events.filter(e => e.participationStatus === 'مرفوض').length,
  };

  const filtered = activeFilter === 'all'
    ? events
    : events.filter(e => e.participationStatus === activeFilter);

  /* ══════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════ */
  const filterOptions = FILTERS.map(f => ({
    id: f.id,
    label: f.label,
    count: counts[f.id],
  }));

  const statsData = [
    { num: counts.all,            label: 'إجمالي' },
    { num: counts['مقبول'],       label: 'مقبول'  },
    { num: counts['مرفوض'],       label: 'مرفوض'  },
  ];

  return (
    <div className="my-events-page" dir="rtl" style={{
      width: '100%',
      minHeight: '100vh',
      background: '#EDF2F8',
      fontFamily: "'Cairo', sans-serif"
    }}>

      {/* ══ HERO ══ */}
      <StudentHero
        title="أنشطتي"
        subtitle="تتبع جميع الأنشطة والفعاليات التي سجّلت بها أو شاركت فيها"
        stats={statsData}
        filters={filterOptions}
        activeFilter={activeFilter}
        onFilterChange={(id) => setActiveFilter(id as FilterType)}
      />

      {/* ══ BODY ══ */}
      <div className="my-events-body" style={{
        maxWidth: '1300px',
        margin: '0 auto',
        padding: '30px 32px 60px',
        width: '100%'
      }}>

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
            <p className="results-bar" style={{
              fontSize: '13px',
              fontWeight: 700,
              color: '#6B8299',
              marginBottom: '22px'
            }}>
              عرض <strong style={{ color: '#1A2E42' }}>{filtered.length}</strong>
              {activeFilter !== 'all' ? ` فعالية · ${activeFilter}` : ' فعالية'}
            </p>

            <div className="events-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '22px',
              alignItems: 'start'
            }}>
              {filtered.length === 0 ? (
                <div className="empty-state" style={{
                  gridColumn: '1/-1',
                  textAlign: 'center',
                  padding: '80px 32px',
                  background: '#ffffff',
                  borderRadius: '14px',
                  border: '2px dashed rgba(196,155,58,.30)',
                  boxShadow: '0 2px 14px rgba(26,46,66,.09)'
                }}>
                  <div className="empty-icon" style={{
                    width: '76px',
                    height: '76px',
                    margin: '0 auto 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#FDF6E3',
                    borderRadius: '50%',
                    border: '2px dashed rgba(196,155,58,.30)'
                  }}><EmptyTrophyIcon /></div>
                  <h2 className="empty-title" style={{
                    fontSize: '15px',
                    fontWeight: 800,
                    color: '#1E3A5F',
                    margin: '0 0 6px'
                  }}>لا توجد فعاليات في هذه الفئة</h2>
                  <p className="empty-subtitle" style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#6B8299',
                    margin: 0
                  }}>جرّب اختيار فئة أخرى</p>
                </div>
              ) : filtered.map(event => {
                const st         = getStatus(event.participationStatus);
                const isAccepted = event.participationStatus === 'مقبول';
                const hasRank    = event.rank !== null;

                return (
                  <div key={event.id} className={`event-card${isAccepted ? ' card-accepted' : ''}`} style={{
                    background: '#ffffff',
                    borderRadius: '14px',
                    border: isAccepted ? '1px solid rgba(196,155,58,0.40)' : '1px solid #DDE8F2',
                    borderTop: isAccepted ? '3px solid #1E3A5F' : undefined,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 2px 14px rgba(26,46,66,.09)',
                    position: 'relative'
                  }}>

                    {/* ── CARD HEADER ── */}
                    <div className="card-header" style={{
                      padding: '20px 24px 18px',
                      borderBottom: '1px solid #EDF3FA',
                      background: '#2D5F8A',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      <div className="card-header-top" style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px',
                        flexWrap: 'wrap'
                      }}>
                        <span className="type-pill" style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '5px 14px',
                          background: '#FDF6E3',
                          border: '1px solid rgba(196,155,58,0.30)',
                          borderRadius: '100px',
                          fontSize: '11.5px',
                          fontWeight: 800,
                          color: '#A67F2C',
                          whiteSpace: 'nowrap',
                          letterSpacing: '0.03em',
                          flexShrink: 0,
                          boxShadow: '0 1px 6px rgba(196,155,58,0.12)'
                        }}>{event.type}</span>
                        <div className="card-chips" style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          flexWrap: 'wrap'
                        }}>
                          <span className={`status-chip ${st.cls}`} style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '5px 12px',
                            borderRadius: '100px',
                            fontSize: '11.5px',
                            fontWeight: 800,
                            whiteSpace: 'nowrap',
                            background: st.cls === 'status-accepted' ? '#ECFDF5' : st.cls === 'status-pending' ? '#F57E0B' : st.cls === 'status-rejected' ? '#FEF2F2' : 'rgba(107,130,153,0.09)',
                            color: st.cls === 'status-accepted' ? '#059669' : st.cls === 'status-pending' ? '#ffffff' : st.cls === 'status-rejected' ? '#DC2626' : '#6B8299',
                            border: st.cls === 'status-accepted' ? '1px solid #6EE7B7' : st.cls === 'status-pending' ? '1px solid rgba(217,119,6,0.22)' : st.cls === 'status-rejected' ? '1px solid #FECACA' : '1px solid rgba(107,130,153,0.22)'
                          }}>
                            <span className="status-dot" style={{ 
                              width: '5px', 
                              height: '5px', 
                              borderRadius: '50%', 
                              flexShrink: 0,
                              background: st.dot 
                            }} />
                            {event.participationStatus}
                          </span>
                          {hasRank && (
                            <span className="rank-chip" style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: '#FDF6E3',
                              color: '#A67F2C',
                              border: '1px solid rgba(196,155,58,0.28)',
                              padding: '5px 12px',
                              borderRadius: '100px',
                              fontSize: '11.5px',
                              fontWeight: 800
                            }}>🏆 #{event.rank}</span>
                          )}
                        </div>
                      </div>
                      <h3 className="event-title" style={{
                        fontSize: '16px',
                        fontWeight: 900,
                        color: '#EBF3FB',
                        lineHeight: 1.45,
                        margin: 0,
                        letterSpacing: '-0.01em',
                        wordBreak: 'break-word'
                      }}>{event.title}</h3>
                    </div>

                    {/* ── CARD BODY ── */}
                    <div className="event-content" style={{
                      padding: '20px 24px 22px',
                      display: 'flex',
                      flexDirection: 'column',
                      flex: 1,
                      gap: '14px'
                    }}>
                      <p className="event-description" style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#6B8299',
                        lineHeight: 1.8,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        margin: 0
                      }}>{event.description}</p>

                      {/* Meta rows — each on its own full-width line, wraps if long, shows — if empty */}
                      <div className="event-meta" style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0,
                        padding: '4px 0',
                        background: '#F8FBFE',
                        borderRadius: '8px',
                        border: '1px solid #EDF3FA',
                        overflow: 'hidden'
                      }}>
                        <MetaRow icon={<CalIcon />}      value={event.date}     />
                        <MetaRow icon={<PinIcon />}      value={event.location} />
                        <MetaRow icon={<BuildingIcon />} value={event.faculty}  />
                        <MetaRow icon={<TagIcon />}      value={event.dept}     />
                      </div>

                      {event.reward && (
                        <div className="reward-strip" style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '9px',
                          padding: '11px 14px',
                          background: '#FDF6E3',
                          border: '1px solid rgba(196,155,58,0.28)',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: 700,
                          color: '#A67F2C',
                          lineHeight: 1.5,
                          wordBreak: 'break-word'
                        }}>
                          <GiftIcon />
                          <span>{event.reward}</span>
                        </div>
                      )}

                      {(event.rank !== null || event.resultReward) && (
                        <div className="result-inline" style={{ display: 'flex', gap: '7px', flexWrap: 'wrap' }}>
                          {event.rank !== null && (
                            <span className="result-tag" style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '5px 12px',
                              background: '#ECFDF5',
                              border: '1px solid #6EE7B7',
                              borderRadius: '100px',
                              fontSize: '12px',
                              fontWeight: 700,
                              color: '#059669'
                            }}>🏅 المركز {event.rank}</span>
                          )}
                          {event.resultReward && (
                            <span className="result-tag" style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '5px 12px',
                              background: '#ECFDF5',
                              border: '1px solid #6EE7B7',
                              borderRadius: '100px',
                              fontSize: '12px',
                              fontWeight: 700,
                              color: '#059669'
                            }}>🎁 {event.resultReward}</span>
                          )}
                        </div>
                      )}

                      <div className="card-actions" style={{
                        display: 'flex',
                        gap: '10px',
                        marginTop: 'auto',
                        flexWrap: 'wrap'
                      }}>
                        {/* Details button for all events */}
                        <button
                          className="btn-details"
                          onClick={() => setSelectedEventId(event.id)}
                          style={{
                            flex: 1,
                            minWidth: '120px',
                            padding: '0 22px',
                            height: '48px',
                            background: 'linear-gradient(135deg, #D4AF55 0%, #C49B3A 50%, #A67F2C 100%)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            fontFamily: "'Cairo', sans-serif",
                            fontSize: '15px',
                            fontWeight: 900,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            boxShadow: '0 4px 20px rgba(196,155,58,.32)',
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                        >
                       التفاصيل
                        </button>

                        {isAccepted && (
                          <>
                            <button className="btn-result" onClick={() => fetchResult(event)} style={{
                              flex: 1,
                              minWidth: '120px',
                              padding: '0 22px',
                              height: '48px',
                              background: 'linear-gradient(135deg, #D4AF55 0%, #C49B3A 50%, #A67F2C 100%)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '8px',
                              fontFamily: "'Cairo', sans-serif",
                              fontSize: '15px',
                              fontWeight: 900,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              boxShadow: '0 4px 20px rgba(196,155,58,.32)',
                              position: 'relative',
                              overflow: 'hidden'
                            }}>
                              نتيجتي
                            </button>
                            {event.teamSettingsEnabled && (
                              <button
                                className="btn-view-team"
                                onClick={() => setSelectedEventId(event.id)}
                                style={{
                                  flex: 1,
                                  minWidth: '120px',
                                  padding: '0 18px',
                                  height: '48px',
                                  border: '1.5px solid #3b82f6',
                                  borderRadius: '8px',
                                  background: '#fff',
                                  color: '#3b82f6',
                                  fontFamily: "'Cairo', sans-serif",
                                  fontSize: '14px',
                                  fontWeight: 800,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '6px',
                                  position: 'relative',
                                  overflow: 'hidden'
                                }}
                              >
                                {event.hasTeam ? '👥 عرض الفريق' : '⚠️ انشاء فريق او طلب انضمام بالكود'}
                              </button>
                            )}
                          </>
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

      {/* ══ EVENT DETAILS MODAL ══ */}
      {selectedEventId !== null && (
        <EventDetails
          eventId={selectedEventId}
          studentId={studentId}
          onClose={() => setSelectedEventId(null)}
        />
      )}

      {/* ══ RESULT MODAL ══ */}
      {resultModal && (
        <>
          <div className="modal-overlay" onClick={() => setResultModal(null)} style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15,25,50,0.62)',
            zIndex: 900,
            backdropFilter: 'blur(5px)'
          }} />
          <div className="result-modal" style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '440px',
            maxWidth: 'calc(100vw - 32px)',
            background: '#ffffff',
            borderRadius: '18px',
            overflow: 'hidden',
            zIndex: 901,
            boxShadow: '0 12px 40px rgba(30,58,95,.20)',
            border: '1px solid #DDE8F2'
          }}>
            <div className="modal-header" style={{
              background: '#2D5F8A',
              padding: '26px 32px 22px',
              position: 'relative',
              overflow: 'hidden',
              minHeight: '90px'
            }}>
              <button className="modal-close" onClick={() => setResultModal(null)} style={{
                position: 'absolute',
                top: '16px',
                left: '18px',
                background: 'rgba(255,255,255,0.12)',
                border: '1.5px solid rgba(46, 41, 41, 0.28)',
                color: 'rgba(39, 35, 35, 0.8)',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10
              }}>
                <CloseIcon />
              </button>
              <p className="modal-event-name" style={{
                fontSize: '15px',
                fontWeight: 800,
                color: '#252222',
                margin: '0 0 5px',
                paddingLeft: '44px',
                paddingRight: 0,
                lineHeight: 1.4,
                wordBreak: 'normal',
                position: 'relative',
                zIndex: 2
              }}>{resultModal.event.title}</p>
              <p className="modal-event-sub" style={{
                fontSize: '13px',
                fontWeight: 500,
                color: 'rgba(34, 30, 30, 0.7)',
                paddingLeft: '44px',
                paddingRight: 0,
                margin: 0,
                position: 'relative',
                zIndex: 2
              }}>
                {resultModal.event.date} · {resultModal.event.location}
              </p>
            </div>

            <div className="modal-body" style={{ padding: '30px 28px 36px' }}>
              {resultModal.loading ? (
                <div className="modal-loading">
                  <div className="ev-spinner" />
                  <p>جاري تحميل نتيجتك...</p>
                </div>
              ) : !resultModal.result?.rank && !resultModal.result?.reward ? (
                <div className="modal-pending">
                  <div className="modal-icon-wrap modal-icon-pending"><TrophyIcon /></div>
                  <p className="modal-main-msg">
                    {resultModal.result?.message ?? 'لم تُنشر النتائج بعد'}
                  </p>
                  <p className="modal-sub-msg">
                    ستظهر نتيجتك هنا بعد نشرها من قِبَل الإدارة
                  </p>
                </div>
              ) : (
                <div className="modal-result-content">
                  <div className="modal-icon-wrap modal-icon-trophy"><TrophyIcon /></div>
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