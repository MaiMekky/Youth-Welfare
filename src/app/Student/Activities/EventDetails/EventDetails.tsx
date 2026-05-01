"use client";
import React, { useState, useEffect } from 'react';
import './EventDetails.css';
import { authFetch, getBaseUrl } from "@/utils/globalFetch";
import Teams from '../Teams/Teams';

/* ══════════════════════════════════════════
   TYPES
══════════════════════════════════════════ */
interface EventDetailsData {
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
  current_participants: number;
  reward: string;
  is_finished: boolean;
  team_settings?: {
    enabled: boolean;
    min_members: number;
    max_members: number;
  };
}

interface ParticipationData {
  participation_id: number;
  status: string;
  rank: number | null;
  reward: string | null;
  joined_at: string;
}

interface EventDetailsProps {
  eventId: number;
  studentId: number;
  onClose: () => void;
}

type TabType = 'overview' | 'participation' | 'teams';

/* ══════════════════════════════════════════
   ICONS
══════════════════════════════════════════ */
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const PinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const BuildingIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <rect x="2" y="3" width="20" height="18" rx="2"/>
    <path d="M8 21V9M16 21V9M2 9h20"/>
  </svg>
);

const GiftIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <polyline points="20 12 20 22 4 22 4 12"/>
    <rect x="2" y="7" width="20" height="5"/>
    <line x1="12" y1="22" x2="12" y2="7"/>
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
  </svg>
);

/* ══════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════ */
export default function EventDetails({ eventId, studentId, onClose }: EventDetailsProps) {
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<EventDetailsData | null>(null);
  const [participation, setParticipation] = useState<ParticipationData | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  useEffect(() => {
    loadEventDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const loadEventDetails = async () => {
    try {
      setLoading(true);
      
      // Load event details
      const eventRes = await authFetch(`${getBaseUrl()}/api/event/student-events/${eventId}/`);
      if (eventRes.ok) {
        const eventData = await eventRes.json();
        setEvent(eventData);
      }

      // Load participation data
      const participationRes = await authFetch(`${getBaseUrl()}/api/event/student-events/joined/`);
      if (participationRes.ok) {
        const data = await participationRes.json();
        const events = data.data || data.results || [];
        const myParticipation = events.find((e: any) => e.event_id === eventId);
        if (myParticipation) {
          setParticipation({
            participation_id: myParticipation.participation_id || 0,
            status: myParticipation.participation_status,
            rank: myParticipation.participation_rank,
            reward: myParticipation.participation_reward,
            joined_at: myParticipation.joined_at || new Date().toISOString(),
          });
        }
      }
    } catch (error) {
      console.error('Error loading event details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="event-details-overlay">
        <div className="event-details-modal">
          <div className="loading-state">
            <div className="spinner" />
            <p>جاري التحميل...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  const showTeamsTab = event.team_settings?.enabled === true;
  const isEventFinished = event.is_finished || new Date(event.end_date) < new Date();

  return (
    <>
      <div className="event-details-overlay" onClick={onClose} />
      <div className="event-details-modal" dir="rtl">
        {/* Header */}
        <div className="modal-header">
          <div className="header-content">
            <h2>{event.title}</h2>
            <span className="event-type-badge">{event.type}</span>
          </div>
          <button className="close-btn" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        {/* Tabs */}
        <div className="modal-tabs">
          <button
            className={`tab-btn${activeTab === 'overview' ? ' active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            نظرة عامة
          </button>
          <button
            className={`tab-btn${activeTab === 'participation' ? ' active' : ''}`}
            onClick={() => setActiveTab('participation')}
          >
            مشاركتي
          </button>
          {showTeamsTab && (
            <button
              className={`tab-btn${activeTab === 'teams' ? ' active' : ''}`}
              onClick={() => setActiveTab('teams')}
            >
              الفرق
            </button>
          )}
        </div>

        {/* Content */}
        <div className="modal-body">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <div className="event-description">
                <h3>الوصف</h3>
                <p>{event.description}</p>
              </div>

              <div className="event-meta-grid">
                <div className="meta-item">
                  <CalendarIcon />
                  <div>
                    <span className="meta-label">تاريخ البداية</span>
                    <span className="meta-value">
                      {new Date(event.st_date).toLocaleDateString('ar-EG', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                <div className="meta-item">
                  <CalendarIcon />
                  <div>
                    <span className="meta-label">تاريخ النهاية</span>
                    <span className="meta-value">
                      {new Date(event.end_date).toLocaleDateString('ar-EG', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                <div className="meta-item">
                  <PinIcon />
                  <div>
                    <span className="meta-label">الموقع</span>
                    <span className="meta-value">{event.location}</span>
                  </div>
                </div>

                <div className="meta-item">
                  <BuildingIcon />
                  <div>
                    <span className="meta-label">الكلية</span>
                    <span className="meta-value">{event.faculty_name}</span>
                  </div>
                </div>

                <div className="meta-item">
                  <UsersIcon />
                  <div>
                    <span className="meta-label">المشاركون</span>
                    <span className="meta-value">
                      {event.current_participants} / {event.s_limit}
                    </span>
                  </div>
                </div>

                {event.reward && (
                  <div className="meta-item">
                    <GiftIcon />
                    <div>
                      <span className="meta-label">المكافأة</span>
                      <span className="meta-value">{event.reward}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'participation' && (
            <div className="participation-tab">
              {participation ? (
                <>
                  <div className="participation-status">
                    <h3>حالة المشاركة</h3>
                    <span className={`status-badge status-${participation.status}`}>
                      {participation.status}
                    </span>
                  </div>

                  <div className="participation-details">
                    <div className="detail-item">
                      <span className="detail-label">تاريخ الانضمام:</span>
                      <span className="detail-value">
                        {new Date(participation.joined_at).toLocaleDateString('ar-EG', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    {participation.rank !== null && (
                      <div className="detail-item">
                        <span className="detail-label">الترتيب:</span>
                        <span className="detail-value rank">#{participation.rank}</span>
                      </div>
                    )}

                    {participation.reward && (
                      <div className="detail-item">
                        <span className="detail-label">المكافأة:</span>
                        <span className="detail-value">{participation.reward}</span>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="no-participation">
                  <p>لم تنضم لهذا النشاط بعد</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'teams' && showTeamsTab && (
            <Teams
              eventId={eventId}
              studentId={studentId}
              isEventFinished={isEventFinished}
            />
          )}
        </div>
      </div>
    </>
  );
}
