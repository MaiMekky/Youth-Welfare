"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Users,
  Trophy,
  ChevronDown,
  ChevronUp,
  Shield,
  Star,
  Crown,
  Copy,
  Check,
  RefreshCw,
  Swords,
  User,
  Hash,
} from "lucide-react";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";
import { useToast } from "@/app/context/ToastContext";
import styles from "./EventsTeamView.module.css";

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
      let msg = "";
      if (typeof raw === "object" && raw !== null) {
        msg =
          String((raw as Record<string, unknown>).detail ?? "") ||
          String((raw as Record<string, unknown>).message ?? "") ||
          String((raw as Record<string, unknown>).error ?? "") ||
          Object.values(raw as Record<string, unknown>)
            .flatMap((v) => (Array.isArray(v) ? v : [v]))
            .filter(Boolean)
            .join(" | ");
      } else if (typeof raw === "string") {
        msg = raw;
      }
      return {
        ok: false,
        message: msg || `طلب غير ناجح (${res.status})`,
        status: res.status,
      };
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
   COMPONENT - VIEW ONLY VERSION FOR SUPERADMIN
════════════════════════════════════════════════════════════════ */
export default function EventTeamsView({ eventId }: Props) {
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
  const [copyFeedback, setCopyFeedback] = useState<number | null>(null);

  /* ─────────── loaders ─────────── */
  const loadSettings = useCallback(async () => {
    setLoadingSettings(true);
    const res = await apiFetch<TeamSettings>(`/api/event/manage-teams/events/${eventId}/settings/`);
    setLoadingSettings(false);
    if (res.ok) {
      setSettings(res.data);
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

  /* ─────────── copy join code ─────────── */
  const copyCode = (teamId: number, code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopyFeedback(teamId);
      setTimeout(() => setCopyFeedback(null), 1500);
    });
  };

  /* ─────────── derived ─────────── */
  const pendingCount = teams.filter(t => t.status === "منتظر").length;
  const acceptedCount = teams.filter(t => t.status === "مقبول").length;
  const totalMembers = teams.reduce((s, t) => s + t.members_count, 0);
  const settingsConfigured = !!settings?.setting_id;

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
            <div className={styles.teamsTitleText}>عرض الفرق</div>
            <div className={styles.teamsSubtitleText}>
              {loadingSettings
                ? "جاري التحميل..."
                : `${teams.length} فريق · ${totalMembers} عضو`}
            </div>
          </div>
        </div>

        <div className={styles.teamsHeaderActions}>
          <button
            className={styles.btnGhost}
            onClick={refreshAll}
            title="تحديث"
            style={{ padding: "9px" }}
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* ══ SETTINGS INFO PILLS — show real saved values from DB ══ */}
      {settingsConfigured && settings && (
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

          <div className={`${styles.statPill} ${settings.enabled ? styles.statPillGreen : styles.statPillAccent}`}>
            <div className={styles.statPillLabel}>نظام الفرق</div>
            <div className={styles.statPillValue} style={{ fontSize: "0.85rem" }}>
              {settings.enabled ? "مفعّل" : "معطّل"}
            </div>
            <div className={styles.statPillSub}>الحالة</div>
          </div>

          <div className={`${styles.statPill} ${settings.allow_individual_join ? styles.statPillGreen : styles.statPillIndigo}`}>
            <div className={styles.statPillLabel}>الانضمام الفردي</div>
            <div className={styles.statPillValue} style={{ fontSize: "0.85rem" }}>
              {settings.allow_individual_join ? "مسموح" : "غير مسموح"}
            </div>
            <div className={styles.statPillSub}>الإعداد</div>
          </div>

          <div className={`${styles.statPill} ${settings.require_team_approval ? styles.statPillBlue : styles.statPillAccent}`}>
            <div className={styles.statPillLabel}>موافقة الإدارة</div>
            <div className={styles.statPillValue} style={{ fontSize: "0.85rem" }}>
              {settings.require_team_approval ? "مطلوبة" : "غير مطلوبة"}
            </div>
            <div className={styles.statPillSub}>الإعداد</div>
          </div>
        </div>
      )}

      {/* ══ TABS ══ */}
      <div style={{ marginTop: 14 }}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === "teams" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("teams")}
            type="button"
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
            type="button"
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
                لم يتم إنشاء أي فرق في هذه الفعالية
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
                      <button
                        className={styles.actBtn}
                        onClick={() => copyCode(team.team_id, team.join_code)}
                        title="نسخ كود الانضمام"
                        type="button"
                      >
                        {copyFeedback === team.team_id ? (
                          <><Check size={13} /> تم النسخ</>
                        ) : (
                          <><Copy size={13} /> نسخ الكود</>
                        )}
                      </button>

                      <button className={styles.chevronBtn} type="button">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* ── Rejection banner ── */}
                  {team.rejection_reason && (
                    <div className={styles.rejectionBanner}>
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
                                  <span className={`${styles.memberStatusBadge} ${memberStatusClass(m.status)}`}>
                                    {m.status}
                                  </span>
                                </td>
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
    </div>
  );
}
