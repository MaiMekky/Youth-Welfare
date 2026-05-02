"use client";
import React, { useState, useEffect } from 'react';
import './Teams.css';
import { authFetch, getBaseUrl } from "@/utils/globalFetch";
import { useToast } from "@/app/context/ToastContext";

/* ══════════════════════════════════════════
   TYPES
══════════════════════════════════════════ */
interface TeamMember {
  member_id: number;
  student_id: number;
  student_name: string;
  student_email: string;
  role: string;
  status: string;
  joined_at: string;
}

interface Team {
  team_id: number;
  event: number;
  event_title: string;
  name: string;
  captain: number;
  captain_name: string;
  join_code: string;
  status: string;
  approved_by: number | null;
  approved_by_name: string | null;
  approved_at: string | null;
  rejected_by: number | null;
  rejected_by_name: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  rank: number | null;
  is_winner: boolean;
  members_count: number;
  members: TeamMember[];
  created_at: string;
  updated_at: string;
}

interface TeamsProps {
  eventId: number;
  studentId: number;
  isEventFinished: boolean;
}

/* ══════════════════════════════════════════
   ICONS
══════════════════════════════════════════ */
const UsersIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const CopyIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);

const CheckIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const TrophyIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
    <path d="M4 22h16"/>
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
  </svg>
);

const CrownIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M2 20h20v2H2z"/>
    <path d="M12 4l3 6 5-4-2 10H6L4 6l5 4z"/>
  </svg>
);

const XIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const AlertIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

/* ══════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════ */
export default function Teams({ eventId, studentId, isEventFinished }: TeamsProps) {
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [myTeam, setMyTeam] = useState<Team | null>(null);
  
  // Form states
  const [createTeamName, setCreateTeamName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState<number | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Load team data
  useEffect(() => {
    loadTeamData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const loadTeamData = async () => {
    try {
      setLoading(true);
      
      // FIX: Load my teams to see if student is in a team for this event.
      // Backend returns { count, data: Team[] }
      const myTeamsRes = await authFetch(`${getBaseUrl()}/api/event/student-teams/my-teams/`);
      if (myTeamsRes.ok) {
        const raw = await myTeamsRes.json();
        // FIX: backend wraps in { count, data: [...] }
        const teams: Team[] = raw.data ?? raw.results ?? (Array.isArray(raw) ? raw : []);
        const eventTeam = teams.find(t => t.event === eventId);
        setMyTeam(eventTeam ?? null);
      }
    } catch (error) {
      console.error('Error loading team data:', error);
    } finally {
      setLoading(false);
    }
  };

  // FIX: Removed loadRanking() — the ranking endpoint is ADMIN-ONLY.
  // Students cannot access /api/event/manage-teams/events/{id}/ranking/ (returns 403).
  // When the event is finished, we show the student's own team result (rank/is_winner)
  // which is already available in the myTeam object fetched from my-teams endpoint.

  const handleCreateTeam = async () => {
    if (!createTeamName.trim()) {
      showToast('الرجاء إدخال اسم الفريق', 'error');
      return;
    }

    try {
      setIsCreating(true);
      const res = await authFetch(
        `${getBaseUrl()}/api/event/student-teams/events/${eventId}/create-team/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: createTeamName.trim() }),
        }
      );

      const data = await res.json();
      
      if (!res.ok) {
        // FIX: backend error can come as { message } or { detail } or DRF validation { field: [...] }
        const errMsg = data.message || data.detail
          || (typeof data === 'object' ? Object.values(data).flat().join(' ') : 'فشل إنشاء الفريق');
        throw new Error(errMsg);
      }

      showToast(data.message || 'تم إنشاء الفريق بنجاح', 'success');
      // FIX: backend returns { message, team: {...} }
      setMyTeam(data.team);
      setCreateTeamName('');
    } catch (error: any) {
      showToast(error.message || 'حدث خطأ أثناء إنشاء الفريق', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinTeam = async () => {
    if (!joinCode.trim()) {
      showToast('الرجاء إدخال كود الانضمام', 'error');
      return;
    }

    try {
      setIsJoining(true);
      const res = await authFetch(
        `${getBaseUrl()}/api/event/student-teams/join-by-code/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ join_code: joinCode.trim().toUpperCase() }),
        }
      );

      const data = await res.json();
      
      if (!res.ok) {
        const errMsg = data.message || data.detail
          || (typeof data === 'object' ? Object.values(data).flat().join(' ') : 'فشل الانضمام للفريق');
        throw new Error(errMsg);
      }

      showToast(data.message || 'تم الانضمام للفريق بنجاح', 'success');
      // FIX: backend returns { message, team: {...} }
      setMyTeam(data.team);
      setJoinCode('');
    } catch (error: any) {
      showToast(error.message || 'حدث خطأ أثناء الانضمام للفريق', 'error');
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveTeam = async () => {
    if (!myTeam) return;
    
    if (!confirm('هل أنت متأكد من رغبتك في مغادرة الفريق؟')) {
      return;
    }

    try {
      setIsLeaving(true);
      const res = await authFetch(
        `${getBaseUrl()}/api/event/student-teams/${myTeam.team_id}/leave/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const data = await res.json();
      
      if (!res.ok) {
        const errMsg = data.message || data.detail || 'فشل مغادرة الفريق';
        throw new Error(errMsg);
      }

      showToast(data.message || 'تم مغادرة الفريق بنجاح', 'success');
      setMyTeam(null);
    } catch (error: any) {
      showToast(error.message || 'حدث خطأ أثناء مغادرة الفريق', 'error');
    } finally {
      setIsLeaving(false);
    }
  };

  const handleRemoveMember = async (memberId: number, studentIdToRemove: number) => {
    if (!myTeam) return;
    
    if (!confirm('هل أنت متأكد من رغبتك في إزالة هذا العضو؟')) {
      return;
    }

    try {
      setRemovingMemberId(memberId);
      const res = await authFetch(
        `${getBaseUrl()}/api/event/student-teams/${myTeam.team_id}/members/${studentIdToRemove}/`,
        {
          method: 'DELETE',
        }
      );

      const data = await res.json();
      
      if (!res.ok) {
        const errMsg = data.message || data.detail || 'فشل إزالة العضو';
        throw new Error(errMsg);
      }

      showToast(data.message || 'تم إزالة العضو بنجاح', 'success');
      
      // FIX: refresh team data after removing member
      await loadTeamData();
    } catch (error: any) {
      showToast(error.message || 'حدث خطأ أثناء إزالة العضو', 'error');
    } finally {
      setRemovingMemberId(null);
    }
  };

  const copyJoinCode = () => {
    if (!myTeam) return;
    
    navigator.clipboard.writeText(myTeam.join_code);
    setCopiedCode(true);
    showToast('تم نسخ الكود', 'success');
    
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // FIX: status comparisons use the Arabic values that Django stores in the DB
  // (inferred from TeamService constants: PARTICIPANT_APPROVED='مقبول', etc.)
  // and confirmed by the Arabic strings in the original Teams.tsx.
  const isCaptain = myTeam && myTeam.captain === studentId;
  const isApproved = myTeam?.status === 'مقبول';
  const isPending  = myTeam?.status === 'منتظر';
  const isRejected = myTeam?.status === 'مرفوض';

  /* ══════════════════════════════════════════
     RENDER: LOADING
  ══════════════════════════════════════════ */
  if (loading) {
    return (
      <div className="teams-container" dir="rtl">
        <div className="teams-loading">
          <div className="spinner" />
          <p>جاري تحميل بيانات الفرق...</p>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════
     RENDER: EVENT FINISHED - SHOW OWN TEAM RESULT
     FIX: removed admin-only ranking API call.
          We show the student's own team result from myTeam,
          which contains rank and is_winner from the serializer.
  ══════════════════════════════════════════ */
  if (isEventFinished) {
    return (
      <div className="teams-container" dir="rtl">
        <div className="teams-header">
          <TrophyIcon />
          <h2>نتائج الفرق</h2>
        </div>

        {myTeam ? (
          <div className="my-result-card">
            <h3>{myTeam.name}</h3>

            <div className="result-info">
              {myTeam.is_winner && (
                <div className="winner-banner">
                  🏆 فائز
                </div>
              )}

              {myTeam.rank !== null ? (
                <div className="rank-display">
                  <span className="rank-label">ترتيبك:</span>
                  <span className="rank-value">
                    {myTeam.rank === 1 && '🥇'}
                    {myTeam.rank === 2 && '🥈'}
                    {myTeam.rank === 3 && '🥉'}
                    {myTeam.rank > 3 && `#${myTeam.rank}`}
                  </span>
                </div>
              ) : (
                <p className="no-rank-msg">لم يتم تحديد الترتيب بعد</p>
              )}

              <div className="result-team-meta">
                <span>القائد: {myTeam.captain_name}</span>
                <span>الأعضاء: {myTeam.members_count}</span>
              </div>
            </div>

            {/* Members list in result view */}
            <div className="members-section">
              <h4>أعضاء الفريق</h4>
              <div className="members-list">
                {myTeam.members
                  .filter(m => m.status === 'نشط')
                  .map(member => (
                    <div key={member.member_id} className="member-item">
                      <div className="member-info">
                        <div className="member-avatar">
                          {member.student_name.charAt(0)}
                        </div>
                        <div className="member-details">
                          <h4>
                            {member.student_name}
                            {member.student_id === studentId && (
                              <span className="me-badge">(أنت)</span>
                            )}
                          </h4>
                          <p>{member.student_email}</p>
                        </div>
                      </div>
                      {member.role === 'قائد' && (
                        <span className="role-badge captain">
                          <CrownIcon />
                          قائد
                        </span>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="no-team-result">
            <p>لم تكن في فريق لهذه الفعالية</p>
          </div>
        )}
      </div>
    );
  }

  /* ══════════════════════════════════════════
     RENDER: NO TEAM - CREATE OR JOIN
  ══════════════════════════════════════════ */
  if (!myTeam) {
    return (
      <div className="teams-container" dir="rtl">
        <div className="teams-header">
          <UsersIcon />
          <h2>الفرق</h2>
        </div>

        <div className="no-team-section">
          <div className="team-option-card">
            <h3>إنشاء فريق جديد</h3>
            <p>قم بإنشاء فريق خاص بك وادعُ أصدقاءك للانضمام</p>
            
            <div className="form-group">
              <label>اسم الفريق</label>
              <input
                type="text"
                className="form-input"
                placeholder="أدخل اسم الفريق"
                value={createTeamName}
                onChange={(e) => setCreateTeamName(e.target.value)}
                disabled={isCreating}
                maxLength={150}
              />
            </div>

            <button
              className="btn btn-primary"
              onClick={handleCreateTeam}
              disabled={isCreating || !createTeamName.trim()}
            >
              {isCreating ? (
                <>
                  <span className="btn-spinner" />
                  جاري الإنشاء...
                </>
              ) : (
                'إنشاء الفريق'
              )}
            </button>
          </div>

          <div className="divider">
            <span>أو</span>
          </div>

          <div className="team-option-card">
            <h3>الانضمام لفريق موجود</h3>
            <p>استخدم كود الانضمام للانضمام إلى فريق موجود</p>
            
            <div className="form-group">
              <label>كود الانضمام</label>
              <input
                type="text"
                className="form-input"
                placeholder="أدخل كود الانضمام"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                disabled={isJoining}
                maxLength={12}
              />
            </div>

            <button
              className="btn btn-secondary"
              onClick={handleJoinTeam}
              disabled={isJoining || !joinCode.trim()}
            >
              {isJoining ? (
                <>
                  <span className="btn-spinner" />
                  جاري الانضمام...
                </>
              ) : (
                'الانضمام للفريق'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════
     RENDER: MY TEAM VIEW
  ══════════════════════════════════════════ */
  // FIX: filter uses the Arabic enum value 'نشط' which maps to MemberStatus.ACTIVE in the model
  const activeMembers = myTeam.members.filter(m => m.status === 'نشط');
  
  return (
    <div className="teams-container" dir="rtl">
      <div className="teams-header">
        <UsersIcon />
        <h2>فريقي</h2>
      </div>

      {/* Team Info Card */}
      <div className="team-info-card">
        <div className="team-info-header">
          <h3>{myTeam.name}</h3>
          <span className={`team-status-badge status-${myTeam.status}`}>
            {myTeam.status}
          </span>
        </div>

        <div className="team-info-body">
          <div className="info-row">
            <span className="info-label">كود الانضمام:</span>
            <div className="join-code-display">
              <code>{myTeam.join_code}</code>
              <button
                className="btn-icon"
                onClick={copyJoinCode}
                title="نسخ الكود"
              >
                {copiedCode ? <CheckIcon /> : <CopyIcon />}
              </button>
            </div>
          </div>

          <div className="info-row">
            <span className="info-label">القائد:</span>
            <span className="info-value">
              <CrownIcon />
              {myTeam.captain_name}
            </span>
          </div>

          <div className="info-row">
            <span className="info-label">عدد الأعضاء:</span>
            <span className="info-value">{activeMembers.length}</span>
          </div>

          {/* Status Messages */}
          {isPending && (
            <div className="status-message status-pending">
              <AlertIcon />
              <span>في انتظار موافقة الإدارة</span>
            </div>
          )}

          {isApproved && (
            <div className="status-message status-approved">
              <CheckIcon />
              <span>تم اعتماد الفريق · تم استيفاء الحد الأدنى من الأعضاء</span>
            </div>
          )}

          {isRejected && (
            <div className="status-message status-rejected">
              <XIcon />
              <div>
                <p>تم رفض الفريق</p>
                {myTeam.rejection_reason && (
                  <p className="rejection-reason">{myTeam.rejection_reason}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Members List */}
      <div className="members-section">
        <h3>الأعضاء ({activeMembers.length})</h3>
        
        <div className="members-list">
          {activeMembers.map((member) => {
            // FIX: role comparison uses Arabic value 'قائد' (MemberRole.CAPTAIN DB value)
            const isMemberCaptain = member.role === 'قائد';
            const isMe = member.student_id === studentId;
            
            return (
              <div key={member.member_id} className="member-item">
                <div className="member-info">
                  <div className="member-avatar">
                    {member.student_name.charAt(0)}
                  </div>
                  <div className="member-details">
                    <h4>
                      {member.student_name}
                      {isMe && <span className="me-badge">(أنت)</span>}
                    </h4>
                    <p>{member.student_email}</p>
                  </div>
                </div>

                <div className="member-actions">
                  {isMemberCaptain && (
                    <span className="role-badge captain">
                      <CrownIcon />
                      قائد
                    </span>
                  )}
                  
                  {/* FIX: captain can remove non-captain members only while team is pending */}
                  {isCaptain && !isMemberCaptain && !isMe && !isApproved && (
                    <button
                      className="btn-remove"
                      onClick={() => handleRemoveMember(member.member_id, member.student_id)}
                      disabled={removingMemberId === member.member_id}
                    >
                      {removingMemberId === member.member_id ? (
                        <span className="btn-spinner" />
                      ) : (
                        <>
                          <XIcon />
                          إزالة
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions — only show leave button when team is not approved */}
      {!isApproved && (
        <div className="team-actions">
          <button
            className="btn btn-danger"
            onClick={handleLeaveTeam}
            disabled={isLeaving}
          >
            {isLeaving ? (
              <>
                <span className="btn-spinner" />
                جاري المغادرة...
              </>
            ) : (
              <>
                <XIcon />
                مغادرة الفريق
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}