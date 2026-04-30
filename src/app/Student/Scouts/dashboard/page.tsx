"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";

const API_URL = getBaseUrl();

/* ── Icons ─────────────────────────────────────────────────── */
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

/* ── Types ── */
type Member = {
  id: number;
  name: string;
  role: string;
  gender?: "male" | "female" | string;
};
type Leader = {
  id: number;
  name: string;
  role: string;
  gender?: "male" | "female" | string;
};
type Group = {
  id: number;
  name: string;
  leaders: Leader[];
  members: Member[];
};
type ClanInfo = {
  clan_id: number;
  name: string;
  description?: string;
  faculty_name: string;
  status: string;
};
type DashboardData = {
  clan: ClanInfo;
  group: Group | null;
  my_role: string;
};

/* ── Token palette ── */
const T = {
  navy: "#1E3A5F", navyMid: "#2D5F8A", navyLight: "#EBF3FB",
  gold: "#C49B3A", goldDark: "#A67F2C", goldPale: "#FDF6E3",
  border: "#E2ECF5", bg: "#EDF2F8", text: "#1A2E42", mute: "#6B8299",
  white: "#ffffff", radius: 10,
  shadow: "0 2px 12px rgba(26,46,66,.08)",
  font: "'Cairo', sans-serif",
};

/* ── Section Card ── */
function SectionCard({ icon, title, children, fullWidth = false, accentTop = false }: {
  icon: React.ReactNode; title: string; children: React.ReactNode;
  fullWidth?: boolean; accentTop?: boolean;
}) {
  return (
    <div style={{
      background: T.white, border: `1px solid ${T.border}`,
      borderRadius: T.radius, boxShadow: T.shadow, overflow: "hidden",
      position: "relative",
      ...(fullWidth ? { gridColumn: "1 / -1" } : {}),
      ...(accentTop ? { borderTop: `3px solid ${T.navy}` } : {}),
    }}>
      {!accentTop && (
        <div style={{ position: "absolute", top: 0, right: 0, width: 4, height: "100%", background: `linear-gradient(180deg, ${T.gold}, ${T.goldDark})` }} />
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "20px 26px 16px", borderBottom: `1px solid ${T.border}`, background: T.navyLight }}>
        <span style={{ width: 42, height: 42, borderRadius: T.radius, background: T.navy, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: T.gold }}>{icon}</span>
        <h2 style={{ fontSize: 17, fontWeight: 800, color: T.navy, margin: 0, fontFamily: T.font }}>{title}</h2>
      </div>
      <div style={{ padding: "22px 26px", lineHeight: 1.7 }}>{children}</div>
    </div>
  );
}

/* ── Role Badge ── */
function RoleBadge({ role }: { role: string }) {
  const isLeader = role.includes("قائد") || role.toLowerCase().includes("leader");
  const isAssistant = role.includes("مساعد") || role.toLowerCase().includes("assistant");
  const color = isLeader ? T.gold : isAssistant ? T.navyMid : T.mute;
  const bg = isLeader ? T.goldPale : isAssistant ? T.navyLight : T.bg;
  const border = isLeader ? "rgba(196,155,58,.3)" : isAssistant ? T.border : T.border;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 100, fontSize: 12, fontWeight: 700, color, background: bg, border: `1px solid ${border}`, fontFamily: T.font, whiteSpace: "nowrap" }}>
      {isLeader && <IconStar size={11} />}
      {role}
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
      setData(await res.json());
    } catch {
      setError("حدث خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* Loading */
  if (loading) {
    return (
      <div dir="rtl" style={{ minHeight: "100vh", background: T.bg, fontFamily: T.font, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 52, height: 52, border: `3px solid ${T.border}`, borderTop: `3px solid ${T.gold}`, borderRadius: "50%", margin: "0 auto 16px", animation: "spin 1s linear infinite" }} />
          <p style={{ color: T.mute, fontFamily: T.font, fontWeight: 600 }}>جاري تحميل لوحة التحكم...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  /* Error */
  if (error || !data) {
    return (
      <div dir="rtl" style={{ minHeight: "100vh", background: T.bg, fontFamily: T.font, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", maxWidth: 420, padding: "0 24px" }}>
          <div style={{ width: 70, height: 70, margin: "0 auto 20px", background: "#FEF2F2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#DC2626" }}>
            <IconInfo size={32} />
          </div>
          <p style={{ fontSize: 18, fontWeight: 800, color: T.text, margin: "0 0 8px", fontFamily: T.font }}>تعذر تحميل البيانات</p>
          <p style={{ fontSize: 15, fontWeight: 600, color: T.mute, margin: "0 0 24px", fontFamily: T.font }}>{error || "لا توجد بيانات متاحة"}</p>
          <Link href="/Student/Scouts" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", background: `linear-gradient(135deg, ${T.gold} 0%, ${T.goldDark} 100%)`, color: "#fff", borderRadius: T.radius, fontFamily: T.font, fontSize: 15, fontWeight: 800, textDecoration: "none" }}>
            العودة للجوالة
          </Link>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const { clan, group, my_role } = data;
  const maleLeaders = group?.leaders.filter(l => l.gender === "male" || !l.gender) ?? [];
  const femaleLeaders = group?.leaders.filter(l => l.gender === "female") ?? [];
  const assistants = group?.leaders.filter(l => l.role?.includes("مساعد") || l.role?.toLowerCase().includes("assistant")) ?? [];

  return (
    <div dir="rtl" style={{ direction: "rtl", minHeight: "100vh", width: "100%", background: T.bg, fontFamily: T.font, color: T.text }}>

      {/* HERO */}
      <div style={{ width: "100%", background: `linear-gradient(140deg, ${T.navy} 0%, ${T.navyMid} 100%)`, padding: "32px 40px", position: "relative", overflow: "hidden", borderRadius: "16px 16px 0 0", boxShadow: "0 4px 18px rgba(30,58,95,.22)", boxSizing: "border-box" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, transparent, ${T.gold}, #e5b84a, transparent)` }} />
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 500px 300px at 5% 70%, rgba(196,155,58,.08) 0%, transparent 60%)`, pointerEvents: "none" }} />

        <div style={{ position: "absolute", top: 22, right: 32, zIndex: 2 }}>
          <Link href="/Student/Scouts" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,.75)", textDecoration: "none", fontFamily: T.font }}>
            <IconArrowRight size={16} />
            العودة للجوالة
          </Link>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 18, position: "relative", zIndex: 1 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: "rgba(196,155,58,.18)", border: "2px solid rgba(196,155,58,.35)", display: "flex", alignItems: "center", justifyContent: "center", color: T.gold, flexShrink: 0 }}>
            <IconCompass size={30} />
          </div>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: "#fff", margin: "0 0 4px", fontFamily: T.font }}>لوحة التحكم</h1>
            <p style={{ fontSize: 15, fontWeight: 500, color: "rgba(255,255,255,.65)", margin: 0, fontFamily: T.font }}>
              {clan.name} — {clan.faculty_name}
            </p>
          </div>
          <div style={{ marginRight: "auto", display: "flex", alignItems: "center", gap: 10 }}>
            {/* My role badge */}
            {my_role && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 16px", background: "rgba(196,155,58,.18)", border: "1px solid rgba(196,155,58,.35)", borderRadius: 100, fontSize: 14, fontWeight: 700, color: T.gold, fontFamily: T.font }}>
                <IconCheckCircle size={14} />
                {my_role}
              </span>
            )}
          </div>
        </div>
        <div style={{ width: 52, height: 3, background: T.gold, borderRadius: 3, margin: "18px 0 0", position: "relative", zIndex: 1 }} />
      </div>

      {/* CONTENT */}
      <div style={{ width: "100%", padding: "32px 40px", display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 22, boxSizing: "border-box" }}>

        {/* Clan Info */}
        <SectionCard icon={<IconShield size={18} />} title="معلومات العشيرة" accentTop>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { label: "اسم العشيرة", value: clan.name },
              { label: "الكلية", value: clan.faculty_name },
              { label: "الحالة", value: clan.status },
              ...(clan.description ? [{ label: "الوصف", value: clan.description }] : []),
            ].map((item) => (
              <div key={item.label} style={{ background: T.bg, borderRadius: T.radius, padding: "14px 16px", border: `1px solid ${T.border}`, borderRight: `3px solid ${T.gold}` }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.navyMid, background: T.navyLight, borderRadius: 6, padding: "3px 10px", display: "inline-block", marginBottom: 8, fontFamily: T.font }}>{item.label}</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: T.navy, fontFamily: T.font }}>{item.value}</div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Group Info */}
        <SectionCard icon={<IconGroup size={18} />} title="معلومات الرهط">
          {!group ? (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <div style={{ width: 56, height: 56, margin: "0 auto 14px", background: T.goldPale, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: T.gold, opacity: 0.6 }}>
                <IconGroup size={28} />
              </div>
              <p style={{ fontSize: 16, fontWeight: 700, color: T.navy, margin: "0 0 6px", fontFamily: T.font }}>لم يتم تعيينك في رهط بعد</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: T.mute, margin: 0, fontFamily: T.font }}>سيتم تعيينك من قبل الإدارة قريباً</p>
            </div>
          ) : (
            <>
              <div style={{ background: T.navyLight, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: "14px 18px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 40, height: 40, background: T.navy, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: T.gold, flexShrink: 0 }}>
                  <IconGroup size={20} />
                </span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.mute, fontFamily: T.font }}>اسم الرهط</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: T.navy, fontFamily: T.font }}>{group.name}</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div style={{ background: T.bg, borderRadius: T.radius, padding: "12px 14px", border: `1px solid ${T.border}`, textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: T.navy, fontFamily: T.font }}>{group.members.length}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.mute, fontFamily: T.font }}>عضو</div>
                </div>
                <div style={{ background: T.bg, borderRadius: T.radius, padding: "12px 14px", border: `1px solid ${T.border}`, textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: T.navy, fontFamily: T.font }}>{group.leaders.length}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.mute, fontFamily: T.font }}>قائد / مساعد</div>
                </div>
              </div>
            </>
          )}
        </SectionCard>

        {/* Leaders — only show if group exists */}
        {group && (
          <SectionCard icon={<IconStar size={18} />} title="قادة الرهط">
            {group.leaders.length === 0 ? (
              <p style={{ color: T.mute, fontFamily: T.font, fontWeight: 600, textAlign: "center", padding: "16px 0" }}>لا يوجد قادة محددون حالياً</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {group.leaders.map((leader) => (
                  <div key={leader.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: T.bg, borderRadius: T.radius, padding: "14px 16px", border: `1px solid ${T.border}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: "50%", background: T.goldPale, border: `1px solid rgba(196,155,58,.25)`, display: "flex", alignItems: "center", justifyContent: "center", color: T.goldDark, flexShrink: 0 }}>
                        <IconUser size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: T.navy, fontFamily: T.font }}>{leader.name}</div>
                        {leader.gender && <div style={{ fontSize: 12, fontWeight: 600, color: T.mute, fontFamily: T.font }}>{leader.gender === "female" ? "أنثى" : "ذكر"}</div>}
                      </div>
                    </div>
                    <RoleBadge role={leader.role} />
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        )}

        {/* Members — full width, only if group exists */}
        {group && (
          <SectionCard icon={<IconUsers size={18} />} title="أعضاء الرهط" fullWidth>
            {group.members.length === 0 ? (
              <p style={{ color: T.mute, fontFamily: T.font, fontWeight: 600, textAlign: "center", padding: "16px 0" }}>لا يوجد أعضاء في الرهط حالياً</p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
                {group.members.map((member) => (
                  <div key={member.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: T.bg, borderRadius: T.radius, padding: "14px 16px", border: `1px solid ${T.border}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 38, height: 38, borderRadius: "50%", background: T.navyLight, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: T.navyMid, flexShrink: 0 }}>
                        <IconUser size={16} />
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: T.navy, fontFamily: T.font }}>{member.name}</div>
                        {member.gender && <div style={{ fontSize: 12, fontWeight: 600, color: T.mute, fontFamily: T.font }}>{member.gender === "female" ? "أنثى" : "ذكر"}</div>}
                      </div>
                    </div>
                    <RoleBadge role={member.role} />
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        )}

      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}