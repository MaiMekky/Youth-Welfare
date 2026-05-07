"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";
import styles from "./Dashboard.module.css";
import StudentHero from "../../components/StudentHero";

const API_URL = getBaseUrl();

/* ══════════════════════════════════════════════════════════════
   ICONS
══════════════════════════════════════════════════════════════ */
const IconArrowRight = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconCompass = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="1" fill="currentColor"/>
  </svg>
);
const IconUser = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/>
  </svg>
);
const IconUsers = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="10" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconShield = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconStar = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M12 2L8.5 8.5 1 9.27l5.5 5.36L4.82 22 12 18.27 19.18 22l-1.68-7.37L23 9.27l-7.5-.77L12 2z"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconGroup = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconInfo = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);
const IconCheckCircle = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconMail = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);
const IconPhone = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.47 19.79 19.79 0 01.04 4.78 2 2 0 012 2.61h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 10.09a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconCalendar = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

/* ══════════════════════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════════════════════ */
type MembershipInfo  = { role: string; status: string; joined_at: string | null; };
type ClanInfo        = { clan_id: number; name: string; description?: string; };
type GroupInfo       = { group_id: number; name: string; };
type GroupLeader     = { name: string; email: string; phone: string; };
type GroupMember     = { name: string; role: string; gender?: string; };
type DashboardData   = {
  membership: MembershipInfo;
  clan: ClanInfo;
  group: GroupInfo | null;
  group_leaders: Record<string, GroupLeader> | null;
  group_members: GroupMember[];
};

/* ══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
══════════════════════════════════════════════════════════════ */

function SectionCard({
  icon, title, subtitle, children, fullWidth = false, accentVariant = "gold",
}: {
  icon: React.ReactNode; title: string; subtitle?: string;
  children: React.ReactNode; fullWidth?: boolean; accentVariant?: "gold" | "navy";
}) {
  return (
    <div className={`${styles.card} ${fullWidth ? styles.cardFullWidth : ""} ${accentVariant === "navy" ? styles.accentNavy : ""}`}>
      <div className={styles.cardAccentBar} />
      <div className={styles.cardHeader}>
        <div className={styles.cardIconBox}>{icon}</div>
        <div className={styles.cardTitleBlock}>
          <div className={styles.cardTitle}>{title}</div>
          {subtitle && <div className={styles.cardSubtitle}>{subtitle}</div>}
        </div>
      </div>
      <div className={styles.cardBody}>{children}</div>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const isLeader    = role.includes("قائد") || role.toLowerCase().includes("leader");
  const isAssistant = role.includes("مساعد") || role.toLowerCase().includes("assistant");
  const cls = isLeader ? styles.roleLeader : isAssistant ? styles.roleAssistant : styles.roleMember;
  return (
    <span className={`${styles.roleBadge} ${cls}`}>
      {isLeader && <IconStar size={11} />}
      {role}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isAccepted = status === "مقبول" || status === "accepted";
  const isPending  = status === "منتظر" || status === "pending";
  const cls = isAccepted ? styles.statusAccepted : isPending ? styles.statusPending : styles.statusRejected;
  return <span className={`${styles.statusBadge} ${cls}`}>{status}</span>;
}

/* ══════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const [data, setData]       = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await authFetch(`${API_URL}/api/student/dashboard/`);
      if (res.status === 403) { setError("غير مصرح — يجب أن تكون عضواً مقبولاً للوصول إلى هذه الصفحة"); return; }
      if (!res.ok)            { setError("حدث خطأ أثناء تحميل البيانات، يرجى المحاولة لاحقاً"); return; }
      const response = await res.json();
      setData(response.data || response);
    } catch { setError("حدث خطأ في الاتصال"); }
    finally  { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* ── Loading ── */
  if (loading) return (
    <div dir="rtl" className={styles.loadingContainer}>
      <div className={styles.loadingContent}>
        <div className={styles.spinner} />
        <p className={styles.loadingText}>جاري تحميل لوحة التحكم…</p>
      </div>
    </div>
  );

  /* ── Error ── */
  if (error || !data) return (
    <div dir="rtl" className={styles.errorContainer}>
      <div className={styles.errorContent}>
        <div className={styles.errorIcon}><IconInfo size={32} /></div>
        <p className={styles.errorTitle}>تعذر تحميل البيانات</p>
        <p className={styles.errorMessage}>{error || "لا توجد بيانات متاحة"}</p>
        <Link href="/Student/Scouts" className={styles.errorButton}>العودة للجوالة</Link>
      </div>
    </div>
  );

  if (!data.clan) return (
    <div dir="rtl" className={styles.errorContainer}>
      <div className={styles.errorContent}>
        <div className={styles.errorIcon}><IconInfo size={32} /></div>
        <p className={styles.errorTitle}>بيانات العشيرة غير متوفرة</p>
        <p className={styles.errorMessage}>لا توجد معلومات عن العشيرة حالياً</p>
        <Link href="/Student/Scouts" className={styles.errorButton}>العودة للجوالة</Link>
      </div>
    </div>
  );

  const { membership, clan, group, group_leaders, group_members } = data;

  const leadersArray = group_leaders
    ? Object.entries(group_leaders).map(([role, leader]) => ({ role, ...leader }))
    : [];

  return (
    <div dir="rtl" className={styles.container}>

      {/* ══ HERO ══ */}
      <div style={{ position: 'relative' }}>
        <StudentHero
          title={clan.name}
          subtitle="نظام إدارة الجوالة — جامعة العاصمة"
        />
        {/* Back navigation overlay */}
        <div style={{
          position: 'absolute',
          top: '28px',
          left: '48px',
          zIndex: 10
        }}>
          <Link href="/Student/Scouts" className={styles.backLink}>
            العودة للجوالة <IconArrowRight size={14} />
          </Link>
        </div>
        {/* Meta pills below hero */}
        <div className={styles.heroMeta} style={{
          padding: '0 48px 20px',
          marginTop: '-10px',
          position: 'relative',
          zIndex: 2
        }}>
          {membership.role && (
            <span className={styles.heroPill}>
              <IconCheckCircle size={13} />
              {membership.role}
            </span>
          )}
          <div className={styles.heroDivider} />
          <StatusBadge status={membership.status} />
          {membership.joined_at && (
            <>
              <div className={styles.heroDivider} />
              <span className={styles.heroSubPill}>
                <IconCalendar size={12} />
                {new Date(membership.joined_at).toLocaleDateString("ar-EG")}
              </span>
            </>
          )}
        </div>
      </div>

      {/* ══ CONTENT GRID ══ */}
      <div className={styles.content}>

        {/* ── Membership ── */}
        <SectionCard
          icon={<IconUser size={18} />}
          title="معلومات العضوية"
          subtitle="بيانات العضو الحالية"
          accentVariant="navy"
        >
          <div className={styles.membershipRow}>
            <div className={styles.membershipCell}>
              <span className={styles.membershipCellLabel}>الدور</span>
              <span className={styles.membershipCellValue}>{membership.role}</span>
            </div>
            <div className={styles.membershipCell}>
              <span className={styles.membershipCellLabel}>الحالة</span>
              <StatusBadge status={membership.status} />
            </div>
            {membership.joined_at && (
              <div className={styles.membershipCell}>
                <span className={styles.membershipCellLabel}>تاريخ الانضمام</span>
                <span className={styles.membershipCellValue}>
                  {new Date(membership.joined_at).toLocaleDateString("ar-EG")}
                </span>
              </div>
            )}
          </div>
        </SectionCard>

        {/* ── Clan ── */}
        <SectionCard
          icon={<IconShield size={18} />}
          title="معلومات العشيرة"
          subtitle="بيانات العشيرة المسجلة"
        >
          <div className={styles.infoGrid}>
            <div className={styles.infoTile}>
              <div className={styles.infoTileLabel}>اسم العشيرة</div>
              <div className={styles.infoTileValue}>{clan.name}</div>
            </div>
            <div className={styles.infoTile}>
              <div className={styles.infoTileLabel}>رقم العشيرة</div>
              <div className={styles.infoTileValue}>{clan.clan_id}</div>
            </div>
            {clan.description && (
              <div className={styles.infoTile} style={{ gridColumn: "1 / -1" }}>
                <div className={styles.infoTileLabel}>الوصف</div>
                <div className={styles.infoTileDesc}>{clan.description}</div>
              </div>
            )}
          </div>
        </SectionCard>

        {/* ── Group ── */}
        <SectionCard
          icon={<IconGroup size={18} />}
          title="معلومات الرهط"
          subtitle={group ? group.name : "لم يتم التعيين بعد"}
          fullWidth
        >
          {!group ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIconWrap}><IconGroup size={24} /></div>
              <p className={styles.emptyTitle}>لم يتم تعيينك في رهط بعد</p>
              <p className={styles.emptyMessage}>سيتم تعيينك من قِبل الإدارة قريباً</p>
            </div>
          ) : (
            <>
              <div className={styles.groupBanner}>
                <div className={styles.groupBannerIcon}><IconGroup size={22} /></div>
                <div>
                  <div className={styles.groupBannerLabel}>الرهط الحالي</div>
                  <div className={styles.groupBannerName}>{group.name}</div>
                </div>
              </div>
              <div className={styles.statsRow}>
                <div className={styles.statTile}>
                  <div className={styles.statNum}>{group_members.length}</div>
                  <div className={styles.statUnit}>إجمالي الأعضاء</div>
                </div>
                <div className={styles.statTile}>
                  <div className={styles.statNum}>{leadersArray.length}</div>
                  <div className={styles.statUnit}>القادة والمساعدون</div>
                </div>
              </div>
            </>
          )}
        </SectionCard>

        {/* ── Leaders ── */}
        {group && leadersArray.length > 0 && (
          <SectionCard
            icon={<IconStar size={18} />}
            title="قادة الرهط"
            subtitle={`${leadersArray.length} قائد / مساعد`}
            fullWidth
          >
            <div className={styles.leaderList}>
              {leadersArray.map((leader, idx) => (
                <div key={idx} className={styles.leaderRow}>
                  <div className={styles.leaderAvatar}><IconUser size={20} /></div>
                  <div className={styles.leaderMeta}>
                    <div className={styles.leaderName}>{leader.name}</div>
                    <div className={styles.leaderContacts}>
                      {leader.email && (
                        <span className={styles.leaderContact}>
                          <IconMail size={12} /> {leader.email}
                        </span>
                      )}
                      {leader.phone && (
                        <span className={styles.leaderContact}>
                          <IconPhone size={12} /> {leader.phone}
                        </span>
                      )}
                    </div>
                  </div>
                  <RoleBadge role={leader.role} />
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* ── Members ── */}
        {group && group_members.length > 0 && (
          <SectionCard
            icon={<IconUsers size={18} />}
            title="أعضاء الرهط"
            subtitle={`${group_members.length} عضو مسجل`}
            fullWidth
          >
            <div className={styles.membersGrid}>
              {group_members.map((member, idx) => (
                <div key={idx} className={styles.memberTile}>
                  <div className={styles.memberTileLeft}>
                    <div className={styles.memberAvatar}><IconUser size={16} /></div>
                    <div>
                      <div className={styles.memberName}>{member.name}</div>
                      {member.gender && (
                        <div className={styles.memberSub}>
                          {member.gender === "female" ? "أنثى" : "ذكر"}
                        </div>
                      )}
                    </div>
                  </div>
                  <RoleBadge role={member.role} />
                </div>
              ))}
            </div>
          </SectionCard>
        )}

      </div>
    </div>
  );
}