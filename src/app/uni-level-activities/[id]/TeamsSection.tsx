"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Users,
  Settings,
  Plus,
  Check,
  X,
  Trophy,
  Crown,
  Shield,
  ChevronDown,
  ChevronUp,
  UserMinus,
  Star,
  Hash,
  Copy,
  RefreshCw,
  Medal,
  Swords,
  AlertCircle,
} from "lucide-react";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";
import { useToast } from "@/app/context/ToastContext";
import styles from "./TeamsSection.module.css";

const API_URL = getBaseUrl();

/* ─────────────────────────── helpers ─────────────────────────── */
async function apiFetch<T>(
  path: string,
  opts: RequestInit = {}
): Promise<{ ok: true; data: T } | { ok: false; message: string; status?: number }> {
  const headers: Record<string, string> = { ...(opts.headers as Record<string, string>) };
  if (!headers["Content-Type"] && opts.body) headers["Content-Type"] = "application/json";
  try {
    const res = await authFetch(`${API_URL}${path}`, { ...opts, headers });
    const text = await res.text();
    const json = text ? (() => { try { return JSON.parse(text); } catch { return text; } })() : null;
    if (!res.ok) {
      // Extract the best error message from backend
      const msg =
        (typeof json === "object" && json &&
          ((json as Record<string, unknown>).detail ||
            (json as Record<string, unknown>).message ||
            (json as Record<string, unknown>).error ||
            // Handle nested field errors like { "name": ["This field is required."] }
            Object.values(json as Record<string, unknown>)
              .map(v => Array.isArray(v) ? v.join(", ") : String(v))
              .join(" | ")
          )) ||
        (typeof json === "string" ? json : "") ||
        `خطأ (${res.status})`;
      return { ok: false, message: String(msg), status: res.status };
    }
    return { ok: true, data: json as T };
  } catch (e: unknown) {
    return { ok: false, message: (e as Error)?.message || "مشكلة في الاتصال" };
  }
}

/* ─────────────────────────── types ─────────────────────────── */
export type TeamSettings = {
  setting_id?: number;
  event?: number;
  enabled: boolean;
  min_members: number;
  max_members: number;
  max_teams: number;
  allow_individual_join: boolean;
  require_team_approval: boolean;
  created_at?: string;
  updated_at?: string;
};

export type TeamMember = {
  member_id: number;
  student_id: number;
  student_name: string;
  student_email: string;
  participation_id: number;
  participation_status: string;
  role: string;
  status: string;
  joined_at: string;
};

export type Team = {
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
  created_by_admin: number;
  created_by_admin_name: string;
  rank: number | null;
  is_winner: boolean;
  result_assigned_by: number | null;
  result_assigned_by_name: string | null;
  result_assigned_at: string | null;
  created_at: string;
  updated_at: string;
  members_count: number;
  members: TeamMember[];
};

export type RankingEntry = {
  team_id: number;
  name: string;
  rank: number;
  is_winner: boolean;
};

type TeamsApiResponse = { count: number; data: Team[] };
type RankingApiResponse = { event_id: number; event_title: string; count: number; ranking: RankingEntry[] };

/* Participant row shape passed from parent */
type ParticipantRow = {
  id: number;
  name: string;
  studentId: string;
  status: string;
};

/* ─────────────────────────── props ─────────────────────────── */
interface TeamsSectionProps {
  eventId: string;
  isFacultyEvent?: boolean;
  participants?: ParticipantRow[];
  onTeamsEnabledChange?: (enabled: boolean) => void;
  eventStatus?: string;
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function TeamsSection({
  eventId,
  isFacultyEvent = false,
  participants = [],
  onTeamsEnabledChange,
  eventStatus,
}: TeamsSectionProps) {
  const { showToast } = useToast();

  /* ── state ── */
  const [settings, setSettings] = useState<TeamSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [rankingLoading, setRankingLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<"teams" | "ranking">("teams");
  const [expandedTeam, setExpandedTeam] = useState<number | null>(null);

  /* ── track which teams have had results assigned ── */
  const [resultAssignedTeams, setResultAssignedTeams] = useState<Set<number>>(new Set());

  /* ── modals ── */
  const [settingsModal, setSettingsModal] = useState(false);
  const [createTeamModal, setCreateTeamModal] = useState(false);
  const [rejectModal, setRejectModal] = useState<{ teamId: number; teamName: string } | null>(null);
  const [resultModal, setResultModal] = useState<{ teamId: number; teamName: string; currentRank: number | null; currentWinner: boolean } | null>(null);

  /* ── settings form — starts with defaults, NOT prefilled ── */
  const defaultSettingsForm = {
    enabled: true, min_members: "" as unknown as number, max_members: "" as unknown as number, 
    max_teams: "" as unknown as number, allow_individual_join: false, require_team_approval: false,
  };

  const [settingsForm, setSettingsForm] = useState<Omit<TeamSettings, "setting_id" | "event" | "created_at" | "updated_at">>(defaultSettingsForm);

  /* ── track original settings for dirty check ── */
  const [originalSettings, setOriginalSettings] = useState<typeof settingsForm | null>(null);
  const isEditing = useRef(false);

  /* ── create form ── */
  const [createForm, setCreateForm] = useState({ name: "", captainStudentId: "" });
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set());

  const [rejectReason, setRejectReason] = useState("");
  const [resultForm, setResultForm] = useState({ rank: "", is_winner: false });
  const [busy, setBusy] = useState(false);

  /* ── validation errors ── */
  const [settingsErrors, setSettingsErrors] = useState<Record<string, string>>({});
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});

  /* ─────────── notify parent of teams enabled state ─────────── */
  useEffect(() => {
    onTeamsEnabledChange?.(settings?.enabled ?? false);
  }, [settings?.enabled, onTeamsEnabledChange]);

  /* ─────────── loaders ─────────── */
  const loadSettings = useCallback(async () => {
    setSettingsLoading(true);
    const res = await apiFetch<TeamSettings>(`/api/event/manage-teams/events/${eventId}/settings/`);
    setSettingsLoading(false);
    if (res.ok) {
      setSettings(res.data);
    } else if (res.status !== 404) {
      showToast("تعذر تحميل إعدادات الفرق", "warning");
    }
  }, [eventId, showToast]);

  const loadTeams = useCallback(async () => {
    setTeamsLoading(true);
    const res = await apiFetch<TeamsApiResponse>(`/api/event/manage-teams/events/${eventId}/teams/`);
    setTeamsLoading(false);
    if (res.ok) {
      setTeams(res.data.data ?? []);
      // Sync resultAssignedTeams from loaded data
      const assignedSet = new Set<number>();
      (res.data.data ?? []).forEach(t => {
        if (t.rank !== null) assignedSet.add(t.team_id);
      });
      setResultAssignedTeams(assignedSet);
    } else {
      showToast(res.message, "error");
    }
  }, [eventId, showToast]);

  const loadRanking = useCallback(async () => {
    setRankingLoading(true);
    const res = await apiFetch<RankingApiResponse>(`/api/event/manage-teams/events/${eventId}/ranking/`);
    setRankingLoading(false);
    if (res.ok) setRanking(res.data.ranking ?? []);
    else showToast(res.message, "error");
  }, [eventId, showToast]);

  useEffect(() => {
    loadSettings();
    loadTeams();
    loadRanking();
  }, [loadSettings, loadTeams, loadRanking]);

  /* ─────────── validate settings ─────────── */
  const validateSettings = () => {
    const errs: Record<string, string> = {};
    if (settingsForm.min_members < 1) errs.min_members = "الحد الأدنى يجب أن يكون 1 على الأقل";
    if (settingsForm.max_members < settingsForm.min_members) errs.max_members = "الحد الأقصى يجب أن يكون أكبر من الحد الأدنى";
    if (settingsForm.max_teams < 1) errs.max_teams = "الحد الأقصى للفرق يجب أن يكون 1 على الأقل";
    return errs;
  };

  /* ─────────── settings submit ─────────── */
  const submitSettings = async () => {
    const errs = validateSettings();
    setSettingsErrors(errs);
    if (Object.keys(errs).length) return;

    // If editing: check if anything actually changed
    if (isEditing.current && originalSettings) {
      const changed = (Object.keys(settingsForm) as (keyof typeof settingsForm)[]).some(
        key => settingsForm[key] !== originalSettings[key]
      );
      if (!changed) {
        showToast("⚠️ لم تقم بأي تعديلات", "warning");
        return;
      }
    }

    setBusy(true);
    const method = settings?.setting_id ? "PATCH" : "POST";
    const res = await apiFetch<TeamSettings>(`/api/event/manage-teams/events/${eventId}/settings/`, {
      method, body: JSON.stringify(settingsForm),
    });
    setBusy(false);

    if (!res.ok) {
      showToast(res.message, "error");
      return;
    }

    const freshSettings: TeamSettings = {
      ...res.data,
      setting_id: res.data.setting_id ?? -1, // sentinel so settingsConfigured flips true immediately
    };
    setSettings(freshSettings);
    onTeamsEnabledChange?.(freshSettings.enabled);
    setSettingsModal(false);
    showToast(method === "POST" ? "✅ تم حفظ إعدادات الفرق" : "✅ تم تحديث الإعدادات", "success");
    // Re-fetch in background to get the real setting_id from server
    loadSettings();
  };

  const openSettingsModal = () => {
    if (settings?.setting_id) {
      // Editing existing: prefill and track original
      isEditing.current = true;
      const current = {
        enabled: settings.enabled,
        min_members: settings.min_members,
        max_members: settings.max_members,
        max_teams: settings.max_teams,
        allow_individual_join: settings.allow_individual_join,
        require_team_approval: settings.require_team_approval,
      };
      setSettingsForm(current);
      setOriginalSettings(current);
    } else {
      // Creating: use defaults, no prefill
      isEditing.current = false;
      setSettingsForm(defaultSettingsForm);
      setOriginalSettings(null);
    }
    setSettingsErrors({});
    setSettingsModal(true);
  };

  /* ─────────── validate create team ─────────── */
  const validateCreateTeam = () => {
    const errs: Record<string, string> = {};
    if (!createForm.name.trim()) errs.name = "اسم الفريق مطلوب";
    if (!createForm.captainStudentId) errs.captain = "يجب اختيار قائد الفريق";
    if (selectedMemberIds.size === 0) errs.members = "يجب اختيار الأعضاء";
    // Captain must be among members
    if (createForm.captainStudentId && !selectedMemberIds.has(createForm.captainStudentId)) {
      errs.members = "يجب تضمين القائد ضمن الأعضاء المختارين";
    }
    return errs;
  };

  /* ─────────── create team ─────────── */
  const submitCreateTeam = async () => {
    const errs = validateCreateTeam();
    setCreateErrors(errs);
    if (Object.keys(errs).length) return;

    const captainNum = Number(createForm.captainStudentId);
    const memberNums = Array.from(selectedMemberIds).map(Number).filter(n => !isNaN(n) && n > 0);

    setBusy(true);
    const res = await apiFetch<Team>(`/api/event/manage-teams/events/${eventId}/create-team/`, {
      method: "POST",
      body: JSON.stringify({
        name: createForm.name.trim(),
        captain_id: captainNum,
        student_ids: memberNums,
      }),
    });
    setBusy(false);

    if (!res.ok) {
      showToast(res.message, "error");
      return;
    }

    setCreateTeamModal(false);
    setCreateForm({ name: "", captainStudentId: "" });
    setSelectedMemberIds(new Set());
    setCreateErrors({});
    await loadTeams();
    showToast("✅ تم إنشاء الفريق بنجاح", "success");
  };

  /* ─────────── approve / reject ─────────── */
  const approveTeam = async (teamId: number) => {
    setBusy(true);
    const res = await apiFetch(`/api/event/manage-teams/events/${eventId}/teams/${teamId}/approve/`, { method: "PATCH" });
    setBusy(false);
    if (!res.ok) { showToast(res.message, "error"); return; }
    await loadTeams();
    showToast("✅ تم قبول الفريق", "success");
  };

  const submitReject = async () => {
    if (!rejectModal) return;
    if (!rejectReason.trim()) { showToast("⚠️ سبب الرفض مطلوب", "warning"); return; }
    setBusy(true);
    const res = await apiFetch(`/api/event/manage-teams/events/${eventId}/teams/${rejectModal.teamId}/reject/`, {
      method: "PATCH", body: JSON.stringify({ reason: rejectReason.trim() }),
    });
    setBusy(false);
    if (!res.ok) { showToast(res.message, "error"); return; }
    setRejectModal(null);
    setRejectReason("");
    await loadTeams();
    showToast("❌ تم رفض الفريق", "warning");
  };

  /* ─────────── result ─────────── */
  const submitResult = async () => {
    if (!resultModal) return;
    const rankNum = Number(resultForm.rank);
    if (!resultForm.rank || isNaN(rankNum) || rankNum < 1) {
      showToast("⚠️ الترتيب يجب أن يكون رقم صحيح موجب", "warning");
      return;
    }
    setBusy(true);
    const res = await apiFetch(`/api/event/manage-teams/events/${eventId}/teams/${resultModal.teamId}/result/`, {
      method: "PATCH", body: JSON.stringify({ rank: rankNum, is_winner: resultForm.is_winner }),
    });
    setBusy(false);
    if (!res.ok) { showToast(res.message, "error"); return; }

    // Mark this team as having a result assigned → hide the button
    setResultAssignedTeams(prev => new Set(prev).add(resultModal.teamId));

    setResultModal(null);
    setResultForm({ rank: "", is_winner: false });
    await loadTeams();
    await loadRanking();
    showToast("✅ تم حفظ النتيجة", "success");
  };

  /* ─────────── remove member ─────────── */
  const removeMember = async (teamId: number, studentId: number) => {
    setBusy(true);
    const res = await apiFetch(`/api/event/manage-teams/teams/${teamId}/members/${studentId}/`, { method: "DELETE" });
    setBusy(false);
    if (!res.ok) { showToast(res.message, "error"); return; }
    await loadTeams();
    showToast("✅ تم إزالة العضو", "success");
  };

  /* ─────────── member selection helpers ─────────── */
  const toggleMember = (studentId: string) => {
    setSelectedMemberIds(prev => {
      const next = new Set(prev);
      if (next.has(studentId)) next.delete(studentId);
      else next.add(studentId);
      return next;
    });
    // Clear members error on change
    setCreateErrors(prev => ({ ...prev, members: "" }));
  };

  const toggleAllMembers = () => {
    if (selectedMemberIds.size === participants.length) {
      setSelectedMemberIds(new Set());
    } else {
      setSelectedMemberIds(new Set(participants.map(p => p.studentId)));
    }
  };

  /* ─────────── derived ─────────── */
  const pendingTeams = useMemo(() => teams.filter(t => t.status === "منتظر").length, [teams]);
  const acceptedTeams = useMemo(() => teams.filter(t => t.status === "مقبول").length, [teams]);
  const settingsConfigured = !!settings?.setting_id && !!settings?.enabled;
  const statusColor = (s: string) => {
    if (s === "مقبول") return styles.statusAccepted;
    if (s === "مرفوض") return styles.statusRejected;
    return styles.statusPending;
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => showToast("✅ تم نسخ كود الانضمام", "success"));
  };

  /* ─────────── settings toggle handler (fixes false-value bug) ─────────── */
  const toggleSetting = (key: keyof typeof settingsForm) => {
    setSettingsForm(prev => ({ ...prev, [key]: !prev[key] }));
  };

  /* ═══════════════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════════════ */
  return (
    <section className={styles.root}>

      {/* ══ Header ══ */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <Swords size={22} />
          </div>
          <div>
            <h2 className={styles.headerTitle}>إدارة الفرق</h2>
            <p className={styles.headerSub}>
              {settingsLoading
                ? "جاري التحميل..."
                : settings
                ? `${teams.length} فريق · ${pendingTeams} منتظر · ${acceptedTeams} مقبول`
                : "لم يتم تفعيل نظام الفرق بعد"}
            </p>
          </div>
        </div>

        <div className={styles.headerActions}>
         {!isFacultyEvent && eventStatus === "مقبول" && (
            <>
            <button className={styles.btnSecondary} onClick={openSettingsModal} title="إعدادات الفرق">
              <Settings size={16} />
              {settings?.setting_id && settings?.enabled ? "تعديل الإعدادات" : "تفعيل الفرق"}
            </button>
             {settingsConfigured && (
                <button className={styles.btnPrimary} onClick={() => { setCreateErrors({}); setCreateTeamModal(true); }}>
                  <Plus size={16} />
                  إنشاء فريق
                </button>
              )}
            </>
          )}
          <button className={styles.btnIcon} onClick={() => { loadTeams(); loadRanking(); }} title="تحديث">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* ══ Settings Banner ══ */}
      {settings && (
        <div className={styles.settingsBanner}>
          <div className={styles.settingsPill}>
            <Shield size={13} />
            {settings.enabled ? "الفرق مفعّلة" : "الفرق معطّلة"}
          </div>
          <div className={styles.settingsPill}>
            <Users size={13} />
            {settings.min_members}–{settings.max_members} عضو/فريق
          </div>
          <div className={styles.settingsPill}>
            <Hash size={13} />
            حد أقصى {settings.max_teams === 2147483647 ? "∞" : settings.max_teams} فرق
          </div>
          <div className={styles.settingsPill}>
            {settings.require_team_approval ? <Shield size={13} /> : <Check size={13} />}
            {settings.require_team_approval ? "يتطلب موافقة" : "قبول تلقائي"}
          </div>
          <div className={styles.settingsPill}>
            {settings.allow_individual_join ? <Users size={13} /> : <X size={13} />}
            {settings.allow_individual_join ? "انضمام فردي مسموح" : "فرق فقط"}
          </div>
        </div>
      )}

      {/* ══ Tabs ══ */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "teams" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("teams")}
        >
          <Users size={15} />
          الفرق
          {pendingTeams > 0 && <span className={styles.tabBadge}>{pendingTeams}</span>}
        </button>
        <button
          className={`${styles.tab} ${activeTab === "ranking" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("ranking")}
        >
          <Trophy size={15} />
          الترتيب
          {ranking.length > 0 && <span className={styles.tabBadgeGold}>{ranking.length}</span>}
        </button>
      </div>

      {/* ══ Teams Tab ══ */}
      {activeTab === "teams" && (
        <div className={styles.teamsContainer}>
          {teamsLoading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner} />
              <span>جاري تحميل الفرق...</span>
            </div>
          ) : teams.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🏆</div>
              <p className={styles.emptyText}>لا توجد فرق حتى الآن</p>
              {!isFacultyEvent && settingsConfigured && (
                <button className={styles.btnPrimary} onClick={() => { setCreateErrors({}); setCreateTeamModal(true); }}>
                  <Plus size={16} /> إنشاء أول فريق
                </button>
              )}
            </div>
          ) : (
            <div className={styles.teamsList}>
              {teams.map((team, idx) => (
                <div
                  key={team.team_id}
                  className={`${styles.teamCard} ${team.is_winner ? styles.teamCardWinner : ""}`}
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  {/* ─ Card Header ─ */}
                  <div className={styles.teamCardHeader}>
                    <div className={styles.teamCardLeft}>
                      <div className={`${styles.teamAvatar} ${team.is_winner ? styles.teamAvatarWinner : ""}`}>
                        {team.is_winner ? "🏆" : "⚔️"}
                      </div>
                      <div>
                        <div className={styles.teamName}>
                          {team.name}
                          {team.is_winner && (
                            <span className={styles.winnerBadge}><Star size={11} /> فائز</span>
                          )}
                        </div>
                        <div className={styles.teamMeta}>
                          <Crown size={12} /> {team.captain_name} · {team.members_count} أعضاء
                        </div>
                      </div>
                    </div>

                    <div className={styles.teamCardRight}>
                      <span className={statusColor(team.status)}>{team.status}</span>
                      <button
                        className={styles.copyCodeBtn}
                        onClick={() => copyCode(team.join_code)}
                        title={`كود الانضمام: ${team.join_code}`}
                      >
                        <Copy size={13} />
                        {team.join_code}
                      </button>
                      {/* FIX: The expand button now works correctly */}
                      <button
                        className={styles.expandBtn}
                        onClick={() => setExpandedTeam(prev => prev === team.team_id ? null : team.team_id)}
                      >
                        {expandedTeam === team.team_id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* ─ Actions Row ─ */}
                  {!isFacultyEvent && (
                    <div className={styles.teamActions}>
                      {team.status === "منتظر" && (
                        <>
                          <button className={styles.btnApprove} disabled={busy} onClick={() => approveTeam(team.team_id)}>
                            <Check size={14} /> قبول
                          </button>
                          <button
                            className={styles.btnReject}
                            disabled={busy}
                            onClick={() => setRejectModal({ teamId: team.team_id, teamName: team.name })}
                          >
                            <X size={14} /> رفض
                          </button>
                        </>
                      )}
                      {/* Hide result button after it has been assigned */}
                      {!resultAssignedTeams.has(team.team_id) && (
                        <button
                          className={styles.btnResult}
                          disabled={busy}
                          onClick={() => setResultModal({
                            teamId: team.team_id,
                            teamName: team.name,
                            currentRank: team.rank,
                            currentWinner: team.is_winner,
                          })}
                        >
                          <Medal size={14} /> النتيجة
                        </button>
                      )}
                    </div>
                  )}

                  {/* ─ Rejection reason ─ */}
                  {team.rejection_reason && (
                    <div className={styles.rejectionNote}>
                      <AlertCircle size={14} />
                      <span>سبب الرفض: {team.rejection_reason}</span>
                    </div>
                  )}

                  {/* ─ Members expand ─ */}
                  {expandedTeam === team.team_id && (
                    <div className={styles.membersPanel}>
                      <div className={styles.membersPanelTitle}>
                        <Users size={14} /> أعضاء الفريق ({team.members.length})
                      </div>
                      <div className={styles.membersGrid}>
                        {team.members.map((m) => (
                          <div
                            key={m.member_id}
                            className={`${styles.memberCard} ${m.role === "قائد" ? styles.memberCardCaptain : ""}`}
                          >
                            <div className={styles.memberAvatar}>
                              {m.role === "قائد" ? <Crown size={14} /> : m.student_name.charAt(0)}
                            </div>
                            <div className={styles.memberInfo}>
                              <div className={styles.memberName}>{m.student_name}</div>
                              <div className={styles.memberRole}>{m.role}</div>
                            </div>
                            {!isFacultyEvent && (
                              <button
                                className={styles.removeMemberBtn}
                                disabled={busy}
                                onClick={() => removeMember(team.team_id, m.student_id)}
                                title="إزالة العضو"
                              >
                                <UserMinus size={14} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══ Ranking Tab ══ */}
      {activeTab === "ranking" && (
        <div className={styles.rankingContainer}>
          {rankingLoading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner} />
              <span>جاري تحميل الترتيب...</span>
            </div>
          ) : ranking.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🏆</div>
              <p className={styles.emptyText}>لم يتم تسجيل أي نتائج بعد</p>
            </div>
          ) : (
            <div className={styles.rankingList}>
              {ranking.map((entry, i) => (
                <div
                  key={entry.team_id}
                  className={`${styles.rankingCard} ${i === 0 ? styles.rankingFirst : i === 1 ? styles.rankingSecond : i === 2 ? styles.rankingThird : ""}`}
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className={styles.rankingPosition}>
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${entry.rank}`}
                  </div>
                  <div className={styles.rankingTeamName}>{entry.name}</div>
                  {entry.is_winner && (
                    <div className={styles.rankingWinnerBadge}><Crown size={13} /> فائز</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════ MODALS ══════════════════ */}

      {/* Settings Modal */}
      {settingsModal && (
        <div className={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) setSettingsModal(false); }}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <div className={styles.modalHeaderLeft}>
                <div className={styles.modalIcon}><Settings size={18} /></div>
                <div>
                  <div className={styles.modalTitle}>{settings?.setting_id ? "تعديل إعدادات الفرق" : "تفعيل نظام الفرق"}</div>
                  <div className={styles.modalSub}>اضبط قواعد تكوين الفرق لهذه الفعالية</div>
                </div>
              </div>
              <button className={styles.modalCloseBtn} onClick={() => setSettingsModal(false)}><X size={16} /></button>
            </div>

            <div className={styles.modalBody}>
              {/* Toggle: enabled */}
              <div className={styles.toggleRow}>
                <span className={styles.toggleLabel}>تفعيل نظام الفرق</span>
                <button
                  type="button"
                  className={`${styles.toggle} ${settingsForm.enabled ? styles.toggleOn : ""}`}
                  onClick={() => toggleSetting("enabled")}
                >
                  <span className={styles.toggleThumb} />
                </button>
              </div>
              {!settingsForm.enabled && settings?.setting_id && (
                <div style={{
                  display: "flex", alignItems: "flex-start", gap: 8,
                  background: "#FFF7ED", border: "1px solid #FED7AA",
                  borderRadius: 10, padding: "10px 14px", marginTop: 4,
                  fontSize: "0.82rem", color: "#92400E", fontWeight: 600,
                  direction: "rtl",
                }}>
                  <span style={{ fontSize: "1rem", flexShrink: 0 }}>⚠️</span>
                  <span>
                    تعطيل نظام الفرق سيجعل زر «إنشاء فريق» غير ظاهر وكأن الإعداد لم يتم بعد.
                    يمكنك إعادة تفعيله في أي وقت.
                  </span>
                </div>
              )}
              <div className={styles.modalGrid}>
                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>الحد الأدنى للأعضاء</label>
                  <input
                    className={`${styles.modalInput} ${settingsErrors.min_members ? styles.inputError : ""}`}
                    type="number"
                    min={1}
                    value={settingsForm.min_members}
                    onChange={e => {
                      setSettingsForm(p => ({ ...p, min_members: Number(e.target.value) }));
                      setSettingsErrors(p => ({ ...p, min_members: "" }));
                    }}
                  />
                  {settingsErrors.min_members && <div className={styles.fieldError}>{settingsErrors.min_members}</div>}
                </div>

                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>الحد الأقصى للأعضاء</label>
                  <input
                    className={`${styles.modalInput} ${settingsErrors.max_members ? styles.inputError : ""}`}
                    type="number"
                    min={1}
                    value={settingsForm.max_members}
                    onChange={e => {
                      setSettingsForm(p => ({ ...p, max_members: Number(e.target.value) }));
                      setSettingsErrors(p => ({ ...p, max_members: "" }));
                    }}
                  />
                  {settingsErrors.max_members && <div className={styles.fieldError}>{settingsErrors.max_members}</div>}
                </div>

                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>الحد الأقصى للفرق</label>
                  <input
                    className={`${styles.modalInput} ${settingsErrors.max_teams ? styles.inputError : ""}`}
                    type="number"
                    min={1}
                    value={settingsForm.max_teams === 2147483647 ? "" : settingsForm.max_teams}
                    placeholder="∞ بلا حد"
                    onChange={e => {
                      setSettingsForm(p => ({ ...p, max_teams: e.target.value === "" ? 2147483647 : Number(e.target.value) }));
                      setSettingsErrors(p => ({ ...p, max_teams: "" }));
                    }}
                  />
                  {settingsErrors.max_teams && <div className={styles.fieldError}>{settingsErrors.max_teams}</div>}
                </div>
              </div>

              {/* Toggle: allow_individual_join */}
              <div className={styles.toggleRow}>
                <span className={styles.toggleLabel}>السماح بالانضمام الفردي</span>
                <button
                  type="button"
                  className={`${styles.toggle} ${settingsForm.allow_individual_join ? styles.toggleOn : ""}`}
                  onClick={() => toggleSetting("allow_individual_join")}
                >
                  <span className={styles.toggleThumb} />
                </button>
              </div>

              {/* Toggle: require_team_approval */}
              <div className={styles.toggleRow}>
                <span className={styles.toggleLabel}>يتطلب موافقة الإدارة</span>
                <button
                  type="button"
                  className={`${styles.toggle} ${settingsForm.require_team_approval ? styles.toggleOn : ""}`}
                  onClick={() => toggleSetting("require_team_approval")}
                >
                  <span className={styles.toggleThumb} />
                </button>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.btnCancel} onClick={() => setSettingsModal(false)} disabled={busy}>إلغاء</button>
              <button className={styles.btnPrimary} onClick={submitSettings} disabled={busy}>
                <Check size={15} /> {busy ? "جاري الحفظ..." : "حفظ الإعدادات"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Team Modal */}
      {createTeamModal && (
        <div className={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) { setCreateTeamModal(false); setCreateErrors({}); } }}>
          <div className={`${styles.modal} ${styles.modalLarge}`}>
            <div className={styles.modalHeader}>
              <div className={styles.modalHeaderLeft}>
                <div className={styles.modalIcon}><Plus size={18} /></div>
                <div>
                  <div className={styles.modalTitle}>إنشاء فريق جديد</div>
                  <div className={styles.modalSub}>اختر القائد والأعضاء من قائمة المشاركين</div>
                </div>
              </div>
              <button className={styles.modalCloseBtn} onClick={() => { setCreateTeamModal(false); setCreateErrors({}); }}><X size={16} /></button>
            </div>

            <div className={styles.modalBody}>
              {/* Team Name */}
              <div className={styles.modalField}>
                <label className={styles.modalLabel}>اسم الفريق</label>
                <input
                  className={`${styles.modalInput} ${createErrors.name ? styles.inputError : ""}`}
                  value={createForm.name}
                  onChange={e => { setCreateForm(p => ({ ...p, name: e.target.value })); setCreateErrors(p => ({ ...p, name: "" })); }}
                  placeholder="مثال: الفرسان"
                />
                {createErrors.name && <div className={styles.fieldError}>{createErrors.name}</div>}
              </div>

              {/* Captain Select */}
              <div className={styles.modalField}>
                <label className={styles.modalLabel}>قائد الفريق</label>
                <select
                  className={`${styles.modalInput} ${createErrors.captain ? styles.inputError : ""}`}
                  value={createForm.captainStudentId}
                  onChange={e => { setCreateForm(p => ({ ...p, captainStudentId: e.target.value })); setCreateErrors(p => ({ ...p, captain: "" })); }}
                >
                  <option value="">— اختر القائد —</option>
                  {participants.map(p => (
                    <option key={p.studentId} value={p.studentId}>
                      {p.name} ({p.studentId})
                    </option>
                  ))}
                </select>
                {createErrors.captain && <div className={styles.fieldError}>{createErrors.captain}</div>}
              </div>

              {/* Members Checkboxes */}
              <div className={styles.modalField}>
                <div className={styles.membersHeader}>
                  <label className={styles.modalLabel}>الأعضاء</label>
                  <button
                    type="button"
                    className={styles.selectAllBtn}
                    onClick={toggleAllMembers}
                  >
                    {selectedMemberIds.size === participants.length ? "إلغاء الكل" : "تحديد الكل"}
                  </button>
                </div>

                {createErrors.members && <div className={styles.fieldError} style={{ marginBottom: 8 }}>{createErrors.members}</div>}

                {participants.length === 0 ? (
                  <div className={styles.noParticipants}>لا يوجد مشاركون متاحون</div>
                ) : (
                  <div className={styles.membersCheckList}>
                    {participants.map(p => {
                      const isSelected = selectedMemberIds.has(p.studentId);
                      const isCaptain = createForm.captainStudentId === p.studentId;
                      return (
                        <label
                          key={p.studentId}
                          className={`${styles.memberCheckItem} ${isSelected ? styles.memberCheckItemSelected : ""} ${isCaptain ? styles.memberCheckItemCaptain : ""}`}
                        >
                          <input
                            type="checkbox"
                            className={styles.memberCheckbox}
                            checked={isSelected}
                            onChange={() => toggleMember(p.studentId)}
                          />
                          <div className={styles.memberCheckInfo}>
                            <span className={styles.memberCheckName}>{p.name}</span>
                            <span className={styles.memberCheckId}>{p.studentId}</span>
                          </div>
                          {isCaptain && (
                            <span className={styles.captainTag}><Crown size={12} /> قائد</span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                )}

                {createForm.captainStudentId && !selectedMemberIds.has(createForm.captainStudentId) && (
                  <div className={styles.captainWarning}>
                    <AlertCircle size={14} />
                    قم باختيار القائد معهم ضمن الأعضاء المختارين
                  </div>
                )}

                <div className={styles.membersCountHint}>
                  {selectedMemberIds.size} عضو محدد
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.btnCancel} onClick={() => { setCreateTeamModal(false); setCreateErrors({}); }} disabled={busy}>إلغاء</button>
              <button className={styles.btnPrimary} onClick={submitCreateTeam} disabled={busy}>
                <Plus size={15} /> {busy ? "جاري الإنشاء..." : "إنشاء الفريق"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) { setRejectModal(null); setRejectReason(""); } }}>
          <div className={`${styles.modal} ${styles.modalSmall}`}>
            <div className={styles.modalHeader}>
              <div className={styles.modalHeaderLeft}>
                <div className={`${styles.modalIcon} ${styles.modalIconDanger}`}><X size={18} /></div>
                <div>
                  <div className={styles.modalTitle}>رفض الفريق</div>
                  <div className={styles.modalSub}>{rejectModal.teamName}</div>
                </div>
              </div>
              <button className={styles.modalCloseBtn} onClick={() => { setRejectModal(null); setRejectReason(""); }}><X size={16} /></button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.modalField}>
                <label className={styles.modalLabel}>سبب الرفض</label>
                <textarea
                  className={styles.modalTextarea}
                  rows={3}
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  placeholder="اكتب سبب رفض الفريق..."
                />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnCancel} onClick={() => { setRejectModal(null); setRejectReason(""); }} disabled={busy}>إلغاء</button>
              <button className={styles.btnDanger} onClick={submitReject} disabled={busy}>
                <X size={15} /> {busy ? "جاري الرفض..." : "تأكيد الرفض"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result Modal */}
      {resultModal && (
        <div className={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) { setResultModal(null); setResultForm({ rank: "", is_winner: false }); } }}>
          <div className={`${styles.modal} ${styles.modalSmall}`}>
            <div className={styles.modalHeader}>
              <div className={styles.modalHeaderLeft}>
                <div className={`${styles.modalIcon} ${styles.modalIconGold}`}><Trophy size={18} /></div>
                <div>
                  <div className={styles.modalTitle}>تسجيل النتيجة</div>
                  <div className={styles.modalSub}>{resultModal.teamName}</div>
                </div>
              </div>
              <button className={styles.modalCloseBtn} onClick={() => { setResultModal(null); setResultForm({ rank: "", is_winner: false }); }}><X size={16} /></button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.modalField}>
                <label className={styles.modalLabel}>الترتيب (مركز)</label>
                <input
                  className={styles.modalInput}
                  type="number"
                  min={1}
                  value={resultForm.rank}
                  onChange={e => setResultForm(p => ({ ...p, rank: e.target.value }))}
                  placeholder="مثال: 1"
                />
              </div>
              <div className={styles.toggleRow}>
                <span className={styles.toggleLabel}>🏆 تحديد كفائز</span>
                <button
                  type="button"
                  className={`${styles.toggle} ${resultForm.is_winner ? styles.toggleOnGold : ""}`}
                  onClick={() => setResultForm(p => ({ ...p, is_winner: !p.is_winner }))}
                >
                  <span className={styles.toggleThumb} />
                </button>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnCancel} onClick={() => { setResultModal(null); setResultForm({ rank: "", is_winner: false }); }} disabled={busy}>إلغاء</button>
              <button className={styles.btnGold} onClick={submitResult} disabled={busy}>
                <Trophy size={15} /> {busy ? "جاري الحفظ..." : "حفظ النتيجة"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}