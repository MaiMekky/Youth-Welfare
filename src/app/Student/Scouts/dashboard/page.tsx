"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";
import styles from "./Dashboard.module.css";

const API_URL = getBaseUrl();

/* ══════════════════════════════════════════════════════════════
   ICONS
══════════════════════════════════════════════════════════════ */
const IconArrowRight = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M19 12H5M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconCompass = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="1" fill="currentColor"/>
  </svg>
);

const IconUsers = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="10" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconShield = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconUser = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/>
  </svg>
);

const IconStar = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M12 2L8.5 8.5 1 9.27l5.5 5.36L4.82 22 12 18.27 19.18 22l-1.68-7.37L23 9.27l-7.5-.77L12 2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconInfo = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const IconGroup = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconCheckCircle = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconCalendar = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

/* ══════════════════════════════════════════════════════════════
   TYPES (matching backend response)
══════════════════════════════════════════════════════════════ */
type MembershipInfo = {
  role: string;
  status: string;
  joined_at: string | null;
};

type ClanInfo = {
  clan_id: number;
  name: string;
  description?: string;
};

type GroupInfo = {
  group_id: number;
  name: string;
};

type GroupLeader = {
  name: string;
  email: string;
  phone: string;
};

type GroupMember = {
  name: string;
  role: string;
  gender?: string;
};

type DashboardData = {
  membership: MembershipInfo;
  clan: ClanInfo;
  group: GroupInfo | null;
  group_leaders: Record<string, GroupLeader> | null;
  group_members: GroupMember[];
};

/* ══════════════════════════════════════════════════════════════
   COMPONENTS
══════════════════════════════════════════════════════════════ */

/* ── Section Card ── */
function SectionCard({ 
  icon, 
  title, 
  children, 
  fullWidth = false, 
  accentTop = false 
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  fullWidth?: boolean;
  accentTop?: boolean;
}) {
  return (
    <div className={`${styles.card} ${fullWidth ? styles.cardFullWidth : ""} ${accentTop ? styles.cardAccentTop : ""}`}>
      {!accentTop && <div className={styles.cardAccentRight} />}
      <div className={styles.cardHeader}>
        <span className={styles.cardIcon}>{icon}</span>
        <h2 className={styles.cardTitle}>{title}</h2>
      </div>
      <div className={styles.cardBody}>{children}</div>
    </div>
  );
}

/* ── Role Badge ── */
function RoleBadge({ role }: { role: string }) {
  const isLeader = role.includes("قائد") || role.toLowerCase().includes("leader");
  const isAssistant = role.includes("مساعد") || role.toLowerCase().includes("assistant");
  
  const badgeClass = isLeader 
    ? styles.roleLeader 
    : isAssistant 
    ? styles.roleAssistant 
    : styles.roleMember;

  return (
    <span className={`${styles.memberRoleBadge} ${badgeClass}`}>
      {isLeader && <IconStar size={11} />}
      {role}
    </span>
  );
}

/* ── Status Badge ── */
function StatusBadge({ status }: { status: string }) {
  const statusClass = 
    status === "مقبول" || status === "accepted" 
      ? styles.statusAccepted 
      : status === "منتظر" || status === "pending"
      ? styles.statusPending
      : styles.statusRejected;

  return (
    <span className={`${styles.statusBadge} ${statusClass}`}>
      {status}
    </span>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await authFetch(`${API_URL}/api/student/dashboard/`);
      
      if (res.status === 403) {
        setError("غير مصرح — يجب أن تكون عضواً مقبولاً للوصول إلى هذه الصفحة");
        return;
      }
      
      if (!res.ok) {
        setError("حدث خطأ أثناء تحميل البيانات، يرجى المحاولة لاحقاً");
        return;
      }
      
      const response = await res.json();
      // Extract data from the success_response wrapper
      const dashboardData = response.data || response;
      setData(dashboardData);
    } catch (err) {
      console.error("Dashboard load error:", err);
      setError("حدث خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /* ── Loading State ── */
  if (loading) {
    return (
      <div dir="rtl" className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <div className={styles.spinner} />
          <p className={styles.loadingText}>جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  /* ── Error State ── */
  if (error || !data) {
    return (
      <div dir="rtl" className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <div className={styles.errorIcon}>
            <IconInfo size={32} />
          </div>
          <p className={styles.errorTitle}>تعذر تحميل البيانات</p>
          <p className={styles.errorMessage}>{error || "لا توجد بيانات متاحة"}</p>
          <Link href="/Student/Scouts" className={styles.errorButton}>
            العودة للجوالة
          </Link>
        </div>
      </div>
    );
  }

  const { membership, clan, group, group_leaders, group_members } = data;

  /* ── Safety Check ── */
  if (!clan) {
    return (
      <div dir="rtl" className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <div className={styles.errorIcon}>
            <IconInfo size={32} />
          </div>
          <p className={styles.errorTitle}>بيانات العشيرة غير متوفرة</p>
          <p className={styles.errorMessage}>لا توجد معلومات عن العشيرة حالياً</p>
          <Link href="/Student/Scouts" className={styles.errorButton}>
            العودة للجوالة
          </Link>
        </div>
      </div>
    );
  }

  // Convert group_leaders object to array
  const leadersArray = group_leaders 
    ? Object.entries(group_leaders).map(([role, leader]) => ({
        role,
        ...leader
      }))
    : [];

  return (
    <div dir="rtl" className={styles.container}>
      {/* ── HERO SECTION ── */}
      <div className={styles.hero}>
        <div className={styles.heroTopAccent} />
        <div className={styles.heroGlow} />
        
        <div className={styles.heroBackButton}>
          <Link href="/Student/Scouts" className={styles.backLink}>
            <IconArrowRight size={16} />
            العودة للجوالة
          </Link>
        </div>

        <div className={styles.heroContent}>
          <div className={styles.heroIcon}>
            <IconCompass size={30} />
          </div>
          <div className={styles.heroText}>
            <h1>لوحة التحكم</h1>
            <p>{clan.name}</p>
          </div>
          <div className={styles.heroRoleBadge}>
            {membership.role && (
              <span className={styles.roleBadge}>
                <IconCheckCircle size={14} />
                {membership.role}
              </span>
            )}
          </div>
        </div>
        <div className={styles.heroAccent} />
      </div>

      {/* ── CONTENT GRID ── */}
      <div className={styles.content}>
        
        {/* ── Membership Info ── */}
        <SectionCard icon={<IconUser size={18} />} title="معلومات العضوية" accentTop>
          <div className={styles.membershipInfo}>
            <div className={styles.membershipGrid}>
              <div className={styles.membershipItem}>
                <span className={styles.membershipItemLabel}>الدور</span>
                <span className={styles.membershipItemValue}>{membership.role}</span>
              </div>
              <div className={styles.membershipItem}>
                <span className={styles.membershipItemLabel}>الحالة</span>
                <StatusBadge status={membership.status} />
              </div>
              {membership.joined_at && (
                <div className={styles.membershipItem}>
                  <span className={styles.membershipItemLabel}>تاريخ الانضمام</span>
                  <span className={styles.membershipItemValue}>
                    {new Date(membership.joined_at).toLocaleDateString("ar-EG")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </SectionCard>

        {/* ── Clan Info ── */}
        <SectionCard icon={<IconShield size={18} />} title="معلومات العشيرة">
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>اسم العشيرة</div>
              <div className={styles.infoValue}>{clan.name}</div>
            </div>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>رقم العشيرة</div>
              <div className={styles.infoValue}>{clan.clan_id}</div>
            </div>
            {clan.description && (
              <div className={styles.infoItem} style={{ gridColumn: "1 / -1" }}>
                <div className={styles.infoLabel}>الوصف</div>
                <div className={styles.infoValue}>{clan.description}</div>
              </div>
            )}
          </div>
        </SectionCard>

        {/* ── Group Info ── */}
        <SectionCard icon={<IconGroup size={18} />} title="معلومات الرهط" fullWidth>
          {!group ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <IconGroup size={28} />
              </div>
              <p className={styles.emptyTitle}>لم يتم تعيينك في رهط بعد</p>
              <p className={styles.emptyMessage}>سيتم تعيينك من قبل الإدارة قريباً</p>
            </div>
          ) : (
            <>
              <div className={styles.groupHeader}>
                <span className={styles.groupHeaderIcon}>
                  <IconGroup size={20} />
                </span>
                <div>
                  <div className={styles.groupHeaderLabel}>اسم الرهط</div>
                  <div className={styles.groupHeaderName}>{group.name}</div>
                </div>
              </div>
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>{group_members.length}</div>
                  <div className={styles.statLabel}>عضو</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>{leadersArray.length}</div>
                  <div className={styles.statLabel}>قائد / مساعد</div>
                </div>
              </div>
            </>
          )}
        </SectionCard>

        {/* ── Group Leaders ── */}
        {group && leadersArray.length > 0 && (
          <SectionCard icon={<IconStar size={18} />} title="قادة الرهط" fullWidth>
            <div className={styles.memberList}>
              {leadersArray.map((leader, idx) => (
                <div key={idx} className={styles.memberCard}>
                  <div className={styles.memberInfo}>
                    <div className={`${styles.memberAvatar} ${styles.leaderAvatar}`}>
                      <IconUser size={18} />
                    </div>
                    <div>
                      <div className={styles.memberName}>{leader.name}</div>
                      <div className={styles.contactInfo}>
                        {leader.email && (
                          <div className={styles.memberEmail}>{leader.email}</div>
                        )}
                        {leader.phone && (
                          <div className={styles.memberPhone}>{leader.phone}</div>
                        )}
                      </div>
                    </div>
                  </div>
                  <RoleBadge role={leader.role} />
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* ── Group Members ── */}
        {group && group_members.length > 0 && (
          <SectionCard icon={<IconUsers size={18} />} title="أعضاء الرهط" fullWidth>
            <div className={styles.membersGrid}>
              {group_members.map((member, idx) => (
                <div key={idx} className={styles.memberGridCard}>
                  <div className={styles.memberInfo}>
                    <div className={styles.memberGridAvatar}>
                      <IconUser size={16} />
                    </div>
                    <div>
                      <div className={styles.memberGridName}>{member.name}</div>
                      {member.gender && (
                        <div className={styles.memberGender}>
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
