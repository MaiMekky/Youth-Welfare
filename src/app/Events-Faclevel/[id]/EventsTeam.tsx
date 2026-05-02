"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Users,
  Settings,
  Plus,
  Check,
  X,
  Trophy,
  Crown,
  Medal,
  ChevronDown,
  ChevronUp,
  Shield,
  Star,
  UserMinus,
  AlertCircle,
  Zap,
  Hash,
  User,
  Copy,
  RefreshCw,
  Swords,
} from "lucide-react";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";
import { useToast } from "@/app/context/ToastContext";
import styles from "./EventsTeam.module.css";

const API_URL = getBaseUrl();

/* ─────────────────────────── apiFetch ─────────────────────────── */
async function apiFetch<T>(
  path: string,
  opts: RequestInit = {}
): Promise<{ ok: true; data: T } | { ok: false; message: string; status?: number }> {
  const headers: Record<string, string> = { ...(opts.headers as Record<string, string>) };
  if (!headers["Content-Type"] && opts.body) headers["Content-Type"] = "application/json";
  try {
    const res = await authFetch(`${API_URL}${path}`, { ...opts, headers });
    const text = await res.text();
    const maybeJson = text
      ? (() => { try { return JSON.parse(text); } catch { return text; } })()
      : null;

    if (!res.ok) {
      const raw = maybeJson as Record<string, unknown> | string | null;
      const msg =
        (typeof raw === "object" && raw !== null &&
          (String((raw as Record<string, unknown>).detail ?? "") ||
            String((raw as Record<string, unknown>).message ?? "") ||
            String((raw as Record<string, unknown>).error ?? ""))) ||
        (typeof raw === "string" ? raw : "") ||
        `طلب غير ناجح (${res.status})`;
      return { ok: false, message: msg || `خطأ (${res.status})`, status: res.status };
    }
    return { ok: true, data: maybeJson as T };
  } catch (e: unknown) {
    return { ok: false, message: (e as Error)?.message || "مشكلة في الاتصال" };
  }
}

/* ─────────────────────────── Types ─────────────────────────── */
type TeamSettings = {
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

type TeamMember = {
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

type Team = {
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

type RankingItem = {
  team_id: number;
  name: string;
  rank: number;
  is_winner: boolean;
};

type Props = {
  eventId: string;
  isFacultyEvent?: boolean;
  participants?: { id: number; studentId: string; name: string }[];
};

/* ─────────────────────────── Settings form type ─────────────────────────── */
type SettingFormState = {
  enabled: boolean;
  min_members: number | "";
  max_members: number | "";
  max_teams: number | "";
  allow_individual_join: boolean;
  require_team_approval: boolean;
};

const defaultSettingForm: SettingFormState = {
  enabled: true,
  min_members: 2,
  max_members: 10,
  max_teams: "",
  allow_individual_join: false,
  require_team_approval: true,
};

/* ─────────────────────────── Helpers ─────────────────────────── */
function medal(rank: number | null): string {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return rank ? `#${rank}` : "—";
}

function statusClass(status: string): string {
  if (status === "مقبول" || status === "نشط") return styles.teamStatusAccepted;
  if (status === "مرفوض") return styles.teamStatusRejected;
  return styles.teamStatusPending;
}

function memberStatusClass(status: string): string {
  if (status === "نشط" || status === "مقبول") return styles.teamStatusAccepted;
  if (status === "مرفوض") return styles.teamStatusRejected;
  return styles.teamStatusPending;
}

/* ════════════════════════════════════════════════════════════════
   COMPONENT
════════════════════════════════════════════════════════════════ */
export default function EventTeams({ eventId, isFacultyEvent = false, participants = [] }: Props) {
  const { showToast } = useToast();

  /* ── data ── */
  const [settings, setSettings] = useState<TeamSettings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [ranking, setRanking] = useState<RankingItem[]>([]);

  /* ── UI ── */
  const [activeTab, setActiveTab] = useState<"teams" | "ranking">("teams");
  const [expandedTeam, setExpandedTeam] = useState<number | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  /* ── settings form ── */
  const [settingForm, setSettingForm] = useState<SettingFormState>(defaultSettingForm);
  const [savingSettings, setSavingSettings] = useState(false);
  // snapshot to detect changes
  const settingsSnapshot = useRef<string>("");

  /* ── create form ── */
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", captain_id: "", student_ids: "" });
  const [creating, setCreating] = useState(false);

  /* ── modals ── */
  const [rejectModal, setRejectModal] = useState<{ teamId: number; name: string } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [resultModal, setResultModal] = useState<{
    teamId: number; name: string; rank: number | ""; is_winner: boolean;
  } | null>(null);

  /* ── busy ── */
  const [busy, setBusy] = useState(false);
  const [deletingMember, setDeletingMember] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<number | null>(null);

  /* ─────────── loaders ─────────── */
  const loadSettings = useCallback(async () => {
    setLoadingSettings(true);
    const res = await apiFetch<TeamSettings>(`/api/event/manage-teams/events/${eventId}/settings/`);
    setLoadingSettings(false);
    if (res.ok) {
      setSettings(res.data);
      const form: SettingFormState = {
        enabled: res.data.enabled,
        min_members: res.data.min_members,
        max_members: res.data.max_members,
        max_teams: res.data.max_teams >= 2147483647 ? "" : res.data.max_teams,
        allow_individual_join: res.data.allow_individual_join,
        require_team_approval: res.data.require_team_approval,
      };
      setSettingForm(form);
      settingsSnapshot.current = JSON.stringify(form);
    }
  }, [eventId]);

  const loadTeams = useCallback(async () => {
    setLoadingTeams(true);
    const res = await apiFetch<{ count: number; data: Team[] }>(
      `/api/event/manage-teams/events/${eventId}/teams/`
    );
    setLoadingTeams(false);
    if (res.ok) setTeams(res.data.data ?? []);
    else showToast(res.message, "error");
  }, [eventId, showToast]);

  const loadRanking = useCallback(async () => {
    const res = await apiFetch<{ ranking: RankingItem[] }>(
      `/api/event/manage-teams/events/${eventId}/ranking/`
    );
    if (res.ok) setRanking(res.data.ranking ?? []);
  }, [eventId]);

  const refreshAll = () => { loadTeams(); loadRanking(); };

  useEffect(() => {
    loadSettings();
    loadTeams();
    loadRanking();
  }, [loadSettings, loadTeams, loadRanking]);

  /* ─────────── open settings panel ─────────── */
  const openSettings = () => {
    // If editing, pre-fill from current settings
    if (settings?.setting_id) {
      const form: SettingFormState = {
        enabled: settings.enabled,
        min_members: settings.min_members,
        max_members: settings.max_members,
        max_teams: settings.max_teams >= 2147483647 ? "" : settings.max_teams,
        allow_individual_join: settings.allow_individual_join,
        require_team_approval: settings.require_team_approval,
      };
      setSettingForm(form);
      settingsSnapshot.current = JSON.stringify(form);
    } else {
      setSettingForm(defaultSettingForm);
      settingsSnapshot.current = "";
    }
    setSettingsOpen(v => !v);
  };

  /* ─────────── save settings ─────────── */
  const saveSettings = async () => {
    // Validate
    const minM = Number(settingForm.min_members);
    const maxM = Number(settingForm.max_members);
    if (!settingForm.min_members || minM < 1) {
      showToast("⚠️ الحد الأدنى للأعضاء يجب أن يكون 1 على الأقل", "warning"); return;
    }
    if (!settingForm.max_members || maxM < 1) {
      showToast("⚠️ الحد الأقصى للأعضاء مطلوب", "warning"); return;
    }
    if (minM > maxM) {
      showToast("⚠️ الحد الأدنى لا يمكن أن يتجاوز الحد الأقصى", "warning"); return;
    }

    // Detect no changes on edit
    const currentJson = JSON.stringify(settingForm);
    if (settings?.setting_id && currentJson === settingsSnapshot.current) {
      showToast("⚠️ لم تقم بأي تعديل على الإعدادات", "warning"); return;
    }

    const isEdit = !!settings?.setting_id;
    const body: Partial<TeamSettings> = {
      enabled: settingForm.enabled,
      min_members: minM,
      max_members: maxM,
      max_teams: settingForm.max_teams === "" ? 2147483647 : Number(settingForm.max_teams),
      allow_individual_join: settingForm.allow_individual_join,
      require_team_approval: settingForm.require_team_approval,
    };

    setSavingSettings(true);
    const res = await apiFetch<TeamSettings>(
      `/api/event/manage-teams/events/${eventId}/settings/`,
      { method: isEdit ? "PATCH" : "POST", body: JSON.stringify(body) }
    );
    setSavingSettings(false);

    if (!res.ok) { showToast(res.message, "error"); return; }

    setSettings(res.data);
    settingsSnapshot.current = JSON.stringify(settingForm);
    setSettingsOpen(false);
    showToast(isEdit ? "✅ تم تحديث إعدادات الفرق" : "✅ تم حفظ إعدادات الفرق", "success");
  };

  /* ─────────── create team ─────────── */
  const createTeam = async () => {
    if (!createForm.name.trim()) { showToast("⚠️ اسم الفريق مطلوب", "warning"); return; }
    if (!createForm.captain_id.trim()) { showToast("⚠️ رقم القائد مطلوب", "warning"); return; }
    const studentIds = createForm.student_ids
      .split(",").map(s => Number(s.trim())).filter(n => n > 0);
    if (studentIds.length === 0) { showToast("⚠️ أدخل أرقام الطلاب", "warning"); return; }

    setCreating(true);
    const res = await apiFetch<Team>(
      `/api/event/manage-teams/events/${eventId}/create-team/`,
      { method: "POST", body: JSON.stringify({ name: createForm.name.trim(), captain_id: Number(createForm.captain_id), student_ids: studentIds }) }
    );
    setCreating(false);
    if (!res.ok) { showToast(res.message, "error"); return; }
    showToast("✅ تم إنشاء الفريق بنجاح", "success");
    setCreateOpen(false);
    setCreateForm({ name: "", captain_id: "", student_ids: "" });
    await loadTeams();
  };

  /* ─────────── approve team ─────────── */
  const approveTeam = async (teamId: number) => {
    setBusy(true);
    const res = await apiFetch(`/api/event/manage-teams/events/${eventId}/teams/${teamId}/approve/`, { method: "PATCH" });
    setBusy(false);
    if (!res.ok) { showToast(res.message, "error"); return; }
    showToast("✅ تم قبول الفريق", "success");
    await loadTeams();
  };

  /* ─────────── reject team ─────────── */
  const rejectTeam = async () => {
    if (!rejectModal) return;
    if (!rejectReason.trim()) { showToast("⚠️ سبب الرفض مطلوب", "warning"); return; }
    setBusy(true);
    const res = await apiFetch(
      `/api/event/manage-teams/events/${eventId}/teams/${rejectModal.teamId}/reject/`,
      { method: "PATCH", body: JSON.stringify({ reason: rejectReason.trim() }) }
    );
    setBusy(false);
    if (!res.ok) { showToast(res.message, "error"); return; }
    showToast("❌ تم رفض الفريق", "warning");
    setRejectModal(null);
    setRejectReason("");
    await loadTeams();
  };

  /* ─────────── assign result ─────────── */
  const assignResult = async () => {
    if (!resultModal) return;
    if (resultModal.rank === "" || Number(resultModal.rank) < 1) {
      showToast("⚠️ الترتيب يجب أن يكون رقم صحيح موجب", "warning"); return;
    }
    setBusy(true);
    const res = await apiFetch(
      `/api/event/manage-teams/events/${eventId}/teams/${resultModal.teamId}/result/`,
      { method: "PATCH", body: JSON.stringify({ rank: Number(resultModal.rank), is_winner: resultModal.is_winner }) }
    );
    setBusy(false);
    if (!res.ok) { showToast(res.message, "error"); return; }
    showToast("✅ تم تسجيل النتيجة", "success");
    setResultModal(null);
    await loadTeams();
    await loadRanking();
  };

  /* ─────────── delete member ─────────── */
  const deleteMember = async (teamId: number, studentId: number) => {
    const key = `${teamId}-${studentId}`;
    setDeletingMember(key);
    const res = await apiFetch(
      `/api/event/manage-teams/teams/${teamId}/members/${studentId}/`,
      { method: "DELETE" }
    );
    setDeletingMember(null);
    if (!res.ok) { showToast(res.message, "error"); return; }
    showToast("✅ تم حذف العضو", "success");
    await loadTeams();
  };

  /* ─────────── copy join code ─────────── */
  const copyCode = (teamId: number, code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopyFeedback(teamId);
      setTimeout(() => setCopyFeedback(null), 1500);
    });
  };

  /* ─────────── add participant chip ─────────── */
  const addParticipantChip = (studentId: string) => {
    const current = createForm.student_ids
      .split(",").map(s => s.trim()).filter(Boolean);
    if (!current.includes(studentId)) {
      setCreateForm(p => ({
        ...p,
        student_ids: [...current, studentId].join(", "),
      }));
    }
  };

  /* ─────────── derived ─────────── */
  const pendingCount = teams.filter(t => t.status === "منتظر").length;
  const acceptedCount = teams.filter(t => t.status === "مقبول").length;
  const totalMembers = teams.reduce((s, t) => s + t.members_count, 0);

  /* ════════════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════════════ */
  return (
    <div className={styles.teamsSection}>

      {/* ══ HEADER ══ */}
      <div className={styles.teamsHeader}>
        <div className={styles.teamsHeaderLeft}>
          <div className={styles.teamsIconWrap}>
            <Swords size={22} color="#fff" />
          </div>
          <div>
            <div className={styles.teamsTitleText}>إدارة الفرق</div>
            <div className={styles.teamsSubtitleText}>
              {loadingSettings
                ? "جاري التحميل..."
                : `${teams.length} فريق · ${totalMembers} عضو`}
            </div>
          </div>
        </div>

        {!isFacultyEvent && (
          <div className={styles.teamsHeaderActions}>
            <button
              className={styles.btnGhost}
              onClick={openSettings}
              disabled={loadingSettings}
            >
              {settings?.setting_id ? <Settings size={15} /> : <Zap size={15} />}
              {settingsOpen
                ? "إغلاق"
                : settings?.setting_id
                ? "تعديل الإعدادات"
                : "إعداد الفرق"}
              {settingsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            <button
              className={styles.btnEmerald}
              onClick={() => setCreateOpen(true)}
            >
              <Plus size={15} />
              إنشاء فريق
            </button>

            <button
              className={styles.btnGhost}
              onClick={refreshAll}
              title="تحديث"
              style={{ padding: "9px" }}
            >
              <RefreshCw size={15} />
            </button>
          </div>
        )}
      </div>

      {/* ══ SETTINGS PANEL ══ */}
      {settingsOpen && !isFacultyEvent && (
        <div className={styles.settingsPanel}>
          <div className={styles.settingsPanelTitle}>
            <Settings size={15} color="#6366f1" />
            {settings?.setting_id ? "تعديل إعدادات الفرق" : "إعداد الفرق لهذه الفعالية"}
          </div>

          {!settings?.setting_id && (
            <div className={styles.infoNotice}>
              <AlertCircle size={15} color="#1d4ed8" style={{ flexShrink: 0, marginTop: 2 }} />
              <div className={styles.infoNoticeText}>
                بعد حفظ الإعدادات لأول مرة يمكنك تعديلها في أي وقت من نفس الزر.
              </div>
            </div>
          )}

          {/* Number inputs */}
          <div className={styles.settingsGrid}>
            <div className={styles.settingsField}>
              <label className={styles.settingsLabel}>
                <Hash size={12} /> الحد الأدنى للأعضاء
              </label>
              <input
                className={styles.settingsInput}
                type="number"
                min={1}
                value={settingForm.min_members === 0 ? "" : settingForm.min_members}
                placeholder="مثال: 2"
                onChange={e =>
                  setSettingForm(p => ({
                    ...p,
                    min_members: e.target.value === "" ? "" : Number(e.target.value),
                  }))
                }
              />
            </div>

            <div className={styles.settingsField}>
              <label className={styles.settingsLabel}>
                <Hash size={12} /> الحد الأقصى للأعضاء
              </label>
              <input
                className={styles.settingsInput}
                type="number"
                min={1}
                value={settingForm.max_members === 0 ? "" : settingForm.max_members}
                placeholder="مثال: 10"
                onChange={e =>
                  setSettingForm(p => ({
                    ...p,
                    max_members: e.target.value === "" ? "" : Number(e.target.value),
                  }))
                }
              />
            </div>

            <div className={styles.settingsField}>
              <label className={styles.settingsLabel}>
                <Hash size={12} /> الحد الأقصى للفرق
              </label>
              <input
                className={styles.settingsInput}
                type="number"
                min={1}
                value={settingForm.max_teams}
                placeholder="اتركه فارغاً = بلا حد"
                onChange={e =>
                  setSettingForm(p => ({
                    ...p,
                    max_teams: e.target.value === "" ? "" : Number(e.target.value),
                  }))
                }
              />
            </div>
          </div>

          {/* Toggles */}
          <div className={styles.settingsGrid}>
            <div
              className={styles.toggleWrap}
              onClick={() => setSettingForm(p => ({ ...p, enabled: !p.enabled }))}
            >
              <span className={styles.toggleLabel}>تفعيل نظام الفرق</span>
              <div className={`${styles.toggleTrack} ${settingForm.enabled ? styles.toggleTrackOn : ""}`}>
                <div className={`${styles.toggleThumb} ${settingForm.enabled ? styles.toggleThumbOn : ""}`} />
              </div>
            </div>

            <div
              className={styles.toggleWrap}
              onClick={() => setSettingForm(p => ({ ...p, allow_individual_join: !p.allow_individual_join }))}
            >
              <span className={styles.toggleLabel}>السماح بالانضمام الفردي</span>
              <div className={`${styles.toggleTrack} ${settingForm.allow_individual_join ? styles.toggleTrackOn : ""}`}>
                <div className={`${styles.toggleThumb} ${settingForm.allow_individual_join ? styles.toggleThumbOn : ""}`} />
              </div>
            </div>

            <div
              className={styles.toggleWrap}
              onClick={() => setSettingForm(p => ({ ...p, require_team_approval: !p.require_team_approval }))}
            >
              <span className={styles.toggleLabel}>اشتراط موافقة الإدارة</span>
              <div className={`${styles.toggleTrack} ${settingForm.require_team_approval ? styles.toggleTrackOn : ""}`}>
                <div className={`${styles.toggleThumb} ${settingForm.require_team_approval ? styles.toggleThumbOn : ""}`} />
              </div>
            </div>
          </div>

          <div className={styles.settingsFooter}>
            <button
              className={styles.btnPrimary}
              onClick={saveSettings}
              disabled={savingSettings}
            >
              <Check size={15} />
              {savingSettings
                ? "جاري الحفظ..."
                : settings?.setting_id
                ? "حفظ التعديلات"
                : "حفظ الإعدادات"}
            </button>
            <button className={styles.btnCancel} onClick={() => setSettingsOpen(false)}>
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* ══ SETTINGS INFO PILLS ══ */}
      {settings?.setting_id && (
        <div className={styles.teamsStats}>
          <div className={`${styles.statPill} ${styles.statPillAccent}`}>
            <div className={styles.statPillLabel}>أعضاء الفريق</div>
            <div className={styles.statPillValue}>
              {settings.min_members}–{settings.max_members}
            </div>
            <div className={styles.statPillSub}>الحد الأدنى والأقصى</div>
          </div>

          <div className={`${styles.statPill} ${styles.statPillBlue}`}>
            <div className={styles.statPillLabel}>الفرق المسجلة</div>
            <div className={styles.statPillValue}>{teams.length}</div>
            <div className={styles.statPillSub}>
              من أصل {settings.max_teams >= 2147483647 ? "∞" : settings.max_teams}
            </div>
          </div>

          <div className={`${styles.statPill} ${styles.statPillIndigo}`}>
            <div className={styles.statPillLabel}>منتظرة</div>
            <div className={styles.statPillValue}>{pendingCount}</div>
            <div className={styles.statPillSub}>تنتظر المراجعة</div>
          </div>

          <div className={`${styles.statPill} ${styles.statPillGreen}`}>
            <div className={styles.statPillLabel}>مقبولة</div>
            <div className={styles.statPillValue}>{acceptedCount}</div>
            <div className={styles.statPillSub}>تم قبولها</div>
          </div>
        </div>
      )}

      {/* ══ TABS ══ */}
      <div style={{ marginTop: 14 }}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === "teams" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("teams")}
          >
            <Users size={14} />
            الفرق
            {pendingCount > 0 && (
              <span className={styles.tabBadge}>{pendingCount}</span>
            )}
          </button>
          <button
            className={`${styles.tab} ${activeTab === "ranking" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("ranking")}
          >
            <Trophy size={14} />
            الترتيب
            {ranking.length > 0 && (
              <span className={styles.tabBadgeGold}>{ranking.length}</span>
            )}
          </button>
        </div>
      </div>

      {/* ══ TEAMS TAB ══ */}
      {activeTab === "teams" && (
        <div className={styles.teamsGrid}>
          {loadingTeams ? (
            <div className={styles.loadingDots}>
              <div className={styles.dot} />
              <div className={styles.dot} />
              <div className={styles.dot} />
            </div>
          ) : teams.length === 0 ? (
            <div className={styles.emptyTeams}>
              <div className={styles.emptyTeamsIcon}>🏆</div>
              <div className={styles.emptyTeamsText}>لا توجد فرق حتى الآن</div>
              <div className={styles.emptyTeamsSub}>
                اضغط «إنشاء فريق» لإضافة أول فريق في هذه الفعالية
              </div>
            </div>
          ) : (
            teams.map((team, idx) => {
              const isExpanded = expandedTeam === team.team_id;
              return (
                <div
                  key={team.team_id}
                  className={styles.teamCard}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {/* ── Card Header ── */}
                  <div
                    className={`${styles.teamCardHeader} ${isExpanded ? styles.teamCardHeaderExpanded : ""}`}
                    onClick={() => setExpandedTeam(isExpanded ? null : team.team_id)}
                  >
                    <div className={styles.teamCardInfo}>
                      <div className={`${styles.teamAvatar} ${team.is_winner ? styles.teamAvatarWinner : ""}`}>
                        {team.is_winner ? "🏆" : "⚔️"}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div className={styles.teamName}>{team.name}</div>
                        <div className={styles.teamMeta}>
                          <span className={`${styles.teamStatusBadge} ${statusClass(team.status)}`}>
                            <Shield size={10} />
                            {team.status}
                          </span>
                          <span className={styles.codePill}>{team.join_code}</span>
                          {team.rank && (
                            <span className={styles.rankBadge}>{medal(team.rank)}</span>
                          )}
                          <span className={styles.teamMetaText}>
                            <Crown size={11} />
                            {team.captain_name}
                          </span>
                          <span className={styles.teamMetaText}>
                            {team.members_count} أعضاء
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* ── Right side ── */}
                    <div
                      className={styles.teamCardRight}
                      onClick={e => e.stopPropagation()}
                    >
                      {/* Copy code */}
                      <button
                        className={styles.actBtn}
                        onClick={() => copyCode(team.team_id, team.join_code)}
                        title="نسخ كود الانضمام"
                      >
                        {copyFeedback === team.team_id ? (
                          <><Check size={13} /> تم النسخ</>
                        ) : (
                          <><Copy size={13} /> نسخ الكود</>
                        )}
                      </button>

                      {/* Actions */}
                      {!isFacultyEvent && (
                        <div className={styles.teamCardActions}>
                          {team.status === "منتظر" && (
                            <>
                              <button
                                className={`${styles.actBtn} ${styles.actAccept}`}
                                disabled={busy}
                                onClick={() => approveTeam(team.team_id)}
                              >
                                <Check size={14} /> قبول
                              </button>
                              <button
                                className={`${styles.actBtn} ${styles.actReject}`}
                                disabled={busy}
                                onClick={() => {
                                  setRejectModal({ teamId: team.team_id, name: team.name });
                                  setRejectReason("");
                                }}
                              >
                                <X size={14} /> رفض
                              </button>
                            </>
                          )}
                          <button
                            className={`${styles.actBtn} ${styles.actResult}`}
                            disabled={busy}
                            onClick={() =>
                              setResultModal({
                                teamId: team.team_id,
                                name: team.name,
                                rank: team.rank ?? "",
                                is_winner: team.is_winner,
                              })
                            }
                          >
                            <Medal size={14} /> النتيجة
                          </button>
                        </div>
                      )}

                      <button className={styles.chevronBtn}>
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* ── Rejection banner ── */}
                  {team.rejection_reason && (
                    <div className={styles.rejectionBanner}>
                      <AlertCircle size={15} color="#EF4444" style={{ flexShrink: 0, marginTop: 1 }} />
                      <div className={styles.rejectionBannerText}>{team.rejection_reason}</div>
                    </div>
                  )}

                  {/* ── Members panel ── */}
                  {isExpanded && (
                    <div className={styles.membersPanel}>
                      <div className={styles.membersTitle}>
                        <Users size={14} />
                        أعضاء الفريق ({team.members_count})
                      </div>
                      <div className={styles.membersTableWrap}>
                        <table className={styles.membersTable}>
                          <thead>
                            <tr>
                              <th>الاسم</th>
                              <th>رقم الطالب</th>
                              <th>البريد</th>
                              <th>الدور</th>
                              <th>الحالة</th>
                              {!isFacultyEvent && <th>إجراء</th>}
                            </tr>
                          </thead>
                          <tbody>
                            {team.members.map(m => (
                              <tr key={m.member_id}>
                                <td style={{ fontWeight: 900 }}>{m.student_name}</td>
                                <td dir="ltr">{m.student_id}</td>
                                <td style={{ fontSize: 12, color: "#64748b" }}>{m.student_email}</td>
                                <td>
                                  {m.role === "قائد" ? (
                                    <span className={styles.roleCaptain}>
                                      <Crown size={10} /> {m.role}
                                    </span>
                                  ) : (
                                    <span className={styles.roleMember}>
                                      <User size={10} /> {m.role}
                                    </span>
                                  )}
                                </td>
                                <td>
                                  <span
                                    className={`${styles.memberStatusBadge} ${memberStatusClass(m.status)}`}
                                  >
                                    {m.status}
                                  </span>
                                </td>
                                {!isFacultyEvent && (
                                  <td>
                                    {m.role !== "قائد" ? (
                                      <button
                                        className={styles.delMemberBtn}
                                        disabled={deletingMember === `${team.team_id}-${m.student_id}`}
                                        onClick={() => deleteMember(team.team_id, m.student_id)}
                                      >
                                        <UserMinus size={12} />
                                        {deletingMember === `${team.team_id}-${m.student_id}`
                                          ? "..."
                                          : "إزالة"}
                                      </button>
                                    ) : (
                                      <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700 }}>
                                        القائد محمي
                                      </span>
                                    )}
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ══ RANKING TAB ══ */}
      {activeTab === "ranking" && (
        <div className={styles.rankingSection} style={{ marginTop: 14 }}>
          <div className={styles.rankingTitle}>
            <Trophy size={18} color="#f59e0b" />
            ترتيب الفرق
          </div>
          {ranking.length === 0 ? (
            <div className={styles.rankingEmpty}>لم يتم تسجيل أي نتائج بعد</div>
          ) : (
            <div className={styles.rankingList}>
              {ranking.map(r => (
                <div
                  key={r.team_id}
                  className={`${styles.rankingRow} ${
                    r.rank === 1
                      ? styles.rankingRowFirst
                      : r.rank === 2
                      ? styles.rankingRowSecond
                      : r.rank === 3
                      ? styles.rankingRowThird
                      : ""
                  }`}
                >
                  <div className={styles.rankingMedal}>{medal(r.rank)}</div>
                  <div className={styles.rankingTeamName}>{r.name}</div>
                  {r.is_winner && (
                    <span className={styles.winnerCrown}>
                      <Star size={11} /> فائز
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════ MODALS ════════════════════ */}

      {/* ── Create Team Modal ── */}
      {createOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => setCreateOpen(false)}
        >
          <div className={styles.modalCard} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <div>
                <div className={styles.modalTitle}>إنشاء فريق جديد</div>
                <div className={styles.modalSub}>أدخل بيانات الفريق والأعضاء</div>
              </div>
              <button className={styles.modalClose} onClick={() => setCreateOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.modalField}>
                <label className={styles.modalLabel}>
                  <Users size={13} /> اسم الفريق
                </label>
                <input
                  className={styles.modalInput}
                  placeholder="اسم الفريق..."
                  value={createForm.name}
                  onChange={e => setCreateForm(p => ({ ...p, name: e.target.value }))}
                />
              </div>

              <div className={styles.modalField}>
                <label className={styles.modalLabel}>
                  <Crown size={13} /> رقم الطالب القائد (Student ID)
                </label>
                <input
                  className={styles.modalInput}
                  type="number"
                  placeholder="أدخل الرقم الجامعي للقائد..."
                  value={createForm.captain_id}
                  onChange={e => setCreateForm(p => ({ ...p, captain_id: e.target.value }))}
                />
              </div>

              <div className={styles.modalField}>
                <label className={styles.modalLabel}>
                  <User size={13} /> أرقام الأعضاء (مفصولة بفواصل)
                </label>
                <input
                  className={styles.modalInput}
                  placeholder="مثال: 11, 34, 13"
                  value={createForm.student_ids}
                  onChange={e => setCreateForm(p => ({ ...p, student_ids: e.target.value }))}
                />
                <div className={styles.modalHint}>يشمل القائد وجميع الأعضاء</div>
              </div>

              {/* Quick-select chips */}
              {participants.length > 0 && (
                <div className={styles.participantChips}>
                  <div className={styles.participantChipsLabel}>
                    المشاركون المتاحون — اضغط لإضافة
                  </div>
                  <div className={styles.participantChipsWrap}>
                    {participants.slice(0, 24).map(p => {
                      const selected = createForm.student_ids
                        .split(",").map(s => s.trim()).includes(p.studentId);
                      return (
                        <span
                          key={p.id}
                          className={`${styles.participantChip} ${selected ? styles.participantChipSelected : ""}`}
                          onClick={() => addParticipantChip(p.studentId)}
                          title={`إضافة ${p.name}`}
                        >
                          {p.name} ({p.studentId})
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.btnSave}
                onClick={createTeam}
                disabled={creating}
              >
                <Plus size={15} />
                {creating ? "جاري الإنشاء..." : "إنشاء الفريق"}
              </button>
              <button
                className={styles.btnCancel}
                onClick={() => setCreateOpen(false)}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reject Modal ── */}
      {rejectModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setRejectModal(null)}
        >
          <div className={styles.modalCard} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <div>
                <div className={styles.modalTitle}>رفض الفريق</div>
                <div className={styles.modalSub}>{rejectModal.name}</div>
              </div>
              <button className={styles.modalClose} onClick={() => setRejectModal(null)}>
                <X size={16} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.modalField}>
                <label className={styles.modalLabel}>
                  <AlertCircle size={13} /> سبب الرفض
                </label>
                <textarea
                  className={styles.modalTextarea}
                  placeholder="أدخل سبب رفض الفريق..."
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.btnRejectFinal}
                onClick={rejectTeam}
                disabled={busy}
              >
                <X size={15} />
                {busy ? "جاري الرفض..." : "تأكيد الرفض"}
              </button>
              <button className={styles.btnCancel} onClick={() => setRejectModal(null)}>
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Result Modal ── */}
      {resultModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setResultModal(null)}
        >
          <div className={styles.modalCard} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <div>
                <div className={styles.modalTitle}>تسجيل النتيجة</div>
                <div className={styles.modalSub}>{resultModal.name}</div>
              </div>
              <button className={styles.modalClose} onClick={() => setResultModal(null)}>
                <X size={16} />
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* Winner toggle */}
              <div
                className={styles.winnerToggle}
                onClick={() =>
                  setResultModal(p => p ? { ...p, is_winner: !p.is_winner } : p)
                }
              >
                <span className={styles.winnerToggleLabel}>
                  <Trophy size={16} color="#d97706" />
                  تعيين كفائز
                </span>
                <div
                  className={`${styles.toggleTrack} ${resultModal.is_winner ? styles.toggleTrackOn : ""}`}
                  style={
                    resultModal.is_winner
                      ? { background: "linear-gradient(135deg,#f59e0b,#d97706)" }
                      : undefined
                  }
                >
                  <div
                    className={`${styles.toggleThumb} ${resultModal.is_winner ? styles.toggleThumbOn : ""}`}
                  />
                </div>
              </div>

              <div className={styles.modalField}>
                <label className={styles.modalLabel}>
                  <Medal size={13} /> الترتيب / المركز
                </label>
                <input
                  className={styles.modalInput}
                  type="number"
                  min={1}
                  placeholder="1 = أول، 2 = ثاني..."
                  value={resultModal.rank}
                  onChange={e =>
                    setResultModal(p =>
                      p
                        ? { ...p, rank: e.target.value === "" ? "" : Number(e.target.value) }
                        : p
                    )
                  }
                />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.btnSave}
                onClick={assignResult}
                disabled={busy}
              >
                <Check size={15} />
                {busy ? "جاري الحفظ..." : "حفظ النتيجة"}
              </button>
              <button className={styles.btnCancel} onClick={() => setResultModal(null)}>
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}