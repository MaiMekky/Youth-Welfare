"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";
import "./scouts.css";

const API_URL = getBaseUrl();

/* ── Icons ─────────────────────────────────────────────────── */
const IconCompass = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="1" fill="currentColor"/>
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
const IconTarget = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
    <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.8"/>
    <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
  </svg>
);
const IconHeart = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconAward = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="12" cy="9" r="6" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconClock = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconStar = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M12 2L8.5 8.5 1 9.27l5.5 5.36L4.82 22 12 18.27 19.18 22l-1.68-7.37L23 9.27l-7.5-.77L12 2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconAlertCircle = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);
const IconCheckCircle = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconLayoutDashboard = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8"/>
    <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8"/>
    <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8"/>
    <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8"/>
  </svg>
);

/* ── Types ── */
type Clan = {
  clan_id: number;
  name: string;
  description: string;
  status: string;
  faculty_name: string;
  members_count?: number;
};

type MemberStatus = {
  status: "pending" | "accepted" | "rejected";
  note?: string;
  ref_number?: string;
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
      position: "relative", ...(fullWidth ? { gridColumn: "1 / -1" } : {}),
      ...(accentTop ? { borderTop: `3px solid ${T.navy}` } : {}),
    }}>
      {!accentTop && (
        <div style={{
          position: "absolute", top: 0, right: 0, width: 4, height: "100%",
          background: `linear-gradient(180deg, ${T.gold}, ${T.goldDark})`,
        }} />
      )}
      <div style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "20px 26px 16px", borderBottom: `1px solid ${T.border}`,
        background: T.navyLight,
      }}>
        <span style={{
          width: 42, height: 42, borderRadius: T.radius, background: T.navy,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, color: T.gold,
        }}>{icon}</span>
        <h2 style={{ fontSize: 17, fontWeight: 800, color: T.navy, margin: 0, fontFamily: T.font }}>
          {title}
        </h2>
      </div>
      <div style={{ padding: "22px 26px", lineHeight: 1.7 }}>{children}</div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════ */
export default function ScoutsPage() {
  const router = useRouter();
  const [clan, setClan] = useState<Clan | null>(null);
  const [memberStatus, setMemberStatus] = useState<MemberStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinMsg, setJoinMsg] = useState("");
  const [clanError, setClanError] = useState<"none" | "inactive" | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [clanRes, statusRes] = await Promise.all([
        authFetch(`${API_URL}/api/student/clan/`),
        authFetch(`${API_URL}/api/student/my_status/`),
      ]);

      if (clanRes.status === 404) {
        setClanError("none");
      } else if (clanRes.ok) {
        const data: Clan = await clanRes.json();
        if (data.status !== "نشط") {
          setClanError("inactive");
        }
        setClan(data);
      }

      if (statusRes.ok) {
        setMemberStatus(await statusRes.json());
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleJoin = async () => {
    setJoinLoading(true);
    setJoinMsg("");
    try {
      const res = await authFetch(`${API_URL}/api/student/join/`, { method: "POST" });
      if (res.ok) {
        router.push("/Student/Scouts/Track");
      } else {
        const data = await res.json().catch(() => ({}));
        setJoinMsg(data?.detail || data?.message || "حدث خطأ في إرسال الطلب");
      }
    } catch {
      setJoinMsg("حدث خطأ في الاتصال، يرجى المحاولة لاحقاً");
    } finally {
      setJoinLoading(false);
    }
  };

  /* ── CTA block based on combined clan + member state ── */
  const renderCTAContent = () => {
    // No clan for this faculty
    if (clanError === "none") {
      return {
        heading: "لا تتوفر عشيرة لكليتك",
        sub: "لم يتم إنشاء عشيرة لكليتك حتى الآن، تواصل مع إدارة الجوالة للاستفسار",
        badge: { color: T.mute, bg: "rgba(107,130,153,.12)", border: "rgba(107,130,153,.25)", label: "غير متوفرة" },
        buttons: null,
      };
    }
    // Clan inactive
    if (clanError === "inactive" || (clan && clan.status !== "نشط")) {
      return {
        heading: "العشيرة غير نشطة حالياً",
        sub: "عشيرة كليتك موجودة لكنها غير متاحة للانضمام في الوقت الحالي",
        badge: { color: "#D97706", bg: "rgba(217,119,6,.08)", border: "rgba(217,119,6,.28)", label: "غير نشطة" },
        buttons: null,
      };
    }
    // Already accepted
    if (memberStatus?.status === "accepted") {
      return {
        heading: "أنت عضو في العشيرة 🎉",
        sub: "تم قبول انضمامك، يمكنك الاطلاع على معلومات مجموعتك من لوحة التحكم",
        badge: { color: "#059669", bg: "#ECFDF5", border: "#6EE7B7", label: "مقبول" },
        buttons: (
          <Link href="/Student/Scouts/dashboard" style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            padding: "14px 32px",
            background: `linear-gradient(135deg, ${T.gold} 0%, ${T.goldDark} 100%)`,
            color: "#fff", borderRadius: T.radius, fontFamily: T.font,
            fontSize: 17, fontWeight: 800, textDecoration: "none",
            boxShadow: "0 4px 16px rgba(196,155,58,.4)", whiteSpace: "nowrap",
          }}>
            <IconLayoutDashboard size={18} />
            لوحة التحكم
          </Link>
        ),
      };
    }
    // Pending request
    if (memberStatus?.status === "pending") {
      return {
        heading: "طلبك قيد المراجعة",
        sub: "تم استلام طلبك وهو قيد المراجعة من قبل مسؤول الكلية",
        badge: { color: "#D97706", bg: "rgba(217,119,6,.08)", border: "rgba(217,119,6,.28)", label: "قيد المراجعة" },
        buttons: (
          <Link href="/Student/Scouts/Track" style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            padding: "14px 32px",
            background: "rgba(255,255,255,.12)", border: "1.5px solid rgba(255,255,255,.28)",
            borderRadius: T.radius, fontFamily: T.font, fontSize: 16, fontWeight: 700,
            color: "#fff", textDecoration: "none", whiteSpace: "nowrap",
          }}>
            <IconClock size={18} />
            متابعة الطلب
          </Link>
        ),
      };
    }
    // New applicant or rejected
    const isRejected = memberStatus?.status === "rejected";
    return {
      heading: isRejected ? "تم رفض طلبك السابق" : "هل أنت مستعد للانضمام؟",
      sub: isRejected
        ? "يمكنك تقديم طلب انضمام جديد الآن"
        : "انضم إلى عشيرة كليتك — سيتم مراجعة طلبك من قبل المسؤول",
      badge: isRejected
        ? { color: "#DC2626", bg: "#FEF2F2", border: "#FECACA", label: "مرفوض سابقاً" }
        : null,
      buttons: (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
          <button
            onClick={handleJoin}
            disabled={joinLoading}
            style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              padding: "14px 32px",
              background: joinLoading
                ? "rgba(196,155,58,.5)"
                : `linear-gradient(135deg, ${T.gold} 0%, ${T.goldDark} 100%)`,
              color: "#fff", borderRadius: T.radius, fontFamily: T.font,
              fontSize: 17, fontWeight: 800, cursor: joinLoading ? "not-allowed" : "pointer",
              border: "none", boxShadow: "0 4px 16px rgba(196,155,58,.4)", whiteSpace: "nowrap",
            }}
          >
            <IconHeart size={18} />
            {joinLoading ? "جاري الإرسال..." : isRejected ? "تقديم طلب جديد" : "تقديم طلب الانضمام"}
          </button>
          {joinMsg && (
            <span style={{ fontSize: 13, color: "#ffd9d9", fontFamily: T.font, fontWeight: 600 }}>
              {joinMsg}
            </span>
          )}
        </div>
      ),
    };
  };

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div dir="rtl" style={{
        minHeight: "100vh", background: T.bg, fontFamily: T.font,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 52, height: 52, border: `3px solid ${T.border}`,
            borderTop: `3px solid ${T.gold}`, borderRadius: "50%",
            margin: "0 auto 16px", animation: "spin 1s linear infinite",
          }} />
          <p style={{ color: T.mute, fontFamily: T.font, fontWeight: 600 }}>جاري التحميل...</p>
        </div>
      </div>
    );
  }

  const ctaData = renderCTAContent();

  return (
    <div dir="rtl" style={{
      direction: "rtl", minHeight: "100vh", width: "100%",
      background: T.bg, fontFamily: T.font, display: "flex",
      flexDirection: "column", color: T.text,
    }}>

      {/* ── HERO HEADER ── */}
      <div style={{
        width: "100%",
        background: `linear-gradient(140deg, ${T.navy} 0%, ${T.navyMid} 100%)`,
        padding: "32px 40px", textAlign: "center", position: "relative",
        overflow: "hidden", borderRadius: "16px 16px 0 0",
        boxShadow: "0 4px 18px rgba(30,58,95,.22)", boxSizing: "border-box",
      }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 3,
          background: `linear-gradient(90deg, transparent, ${T.gold}, #e5b84a, transparent)`,
        }} />
        <div style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(ellipse 500px 300px at 5% 70%, rgba(196,155,58,.08) 0%, transparent 60%)`,
          pointerEvents: "none",
        }} />
        <h1 style={{
          fontSize: 30, fontWeight: 900, color: "#fff", margin: "0 0 6px",
          fontFamily: T.font, position: "relative", zIndex: 1,
        }}>الجوالة</h1>
        <div style={{
          width: 52, height: 3, background: T.gold, borderRadius: 3,
          margin: "14px auto", position: "relative", zIndex: 1,
        }} />
        <p style={{
          fontSize: 16, fontWeight: 500, color: "rgba(255,255,255,.65)",
          margin: 0, fontFamily: T.font, position: "relative", zIndex: 1,
          maxWidth: 560, marginInline: "auto", lineHeight: 1.75,
        }}>
          نظام الأنشطة الكشفية داخل الجامعة — يهدف إلى تنمية المهارات القيادية
          والعمل الجماعي من خلال عشائر الكليات والرهوط المنظمة.
        </p>
      </div>
    );
  }

      {/* ── CONTENT GRID ── */}
      <div style={{
        width: "100%", padding: "32px 40px",
        display: "grid", gridTemplateColumns: "repeat(2, 1fr)",
        gap: 22, flex: 1, boxSizing: "border-box",
      }}>

        {/* 1 — Clan Info */}
        <SectionCard icon={<IconCompass size={18} />} title="معلومات العشيرة" accentTop>
          {clanError === "none" ? (
            <div style={{
              textAlign: "center", padding: "24px 0",
              color: T.mute, fontFamily: T.font, fontSize: 16, fontWeight: 600,
            }}>
              <IconAlertCircle size={36} />
              <p style={{ marginTop: 12 }}>لا تتوفر عشيرة لكليتك حالياً</p>
            </div>
          ) : clan ? (
            <>
              <p style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.85, color: T.mute, margin: "0 0 18px", fontFamily: T.font }}>
                {clan.description || "عشيرة كلية تهدف إلى تنمية روح القيادة والعمل الجماعي بين طلاب الكلية."}
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { label: "الكلية", value: clan.faculty_name },
                  { label: "الحالة", value: clan.status },
                  ...(clan.members_count !== undefined
                    ? [{ label: "عدد الأعضاء", value: `${clan.members_count} عضو` }]
                    : []),
                ].map((item) => (
                  <div key={item.label} style={{
                    background: T.bg, borderRadius: T.radius, padding: "14px 16px",
                    border: `1px solid ${T.border}`, borderRight: `3px solid ${T.gold}`,
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.navyMid, marginBottom: 4, fontFamily: T.font }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: T.navy, fontFamily: T.font }}>
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p style={{ color: T.mute, fontFamily: T.font }}>جاري التحميل...</p>
          )}
        </SectionCard>

        {/* 2 — About */}
        <SectionCard icon={<IconShield size={18} />} title="إدارة الجوالة والخدمة العامة">
          <p style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.85, color: T.mute, margin: "0 0 14px", fontFamily: T.font }}>
            تقوم إدارة الجوالة والخدمة العامة بتنفيذ عدد من المشروعات المتنوعة والمتدرجة من المستوى الداخلي حتى المستوى القُمي، وقد شاركت فيها عشائر كليات الجامعة، حيث تم إقامة ورش عمل ومعسكرات الإعداد الجوالي.
          </p>
          <p style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.85, color: T.mute, margin: 0, fontFamily: T.font }}>
            تهتم الإدارة بحياة الخلاء والأنشطة التي تبث روح التعاون وتكتشف المواهب، ويقوم بإدارة النشاط مجموعة من الأخصائيين المؤهلين كشفياً وإرشادياً.
          </p>
        </SectionCard>

        {/* 3 — Benefits */}
        <SectionCard icon={<IconStar size={18} />} title="ماذا ستكتسب من الانضمام؟" fullWidth>
          <div data-benefits-grid style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {[
              { icon: <IconTarget size={22} />, title: "تطوير المهارات القيادية", desc: "اكتساب مهارات القيادة والإدارة من خلال الأنشطة الكشفية المتنوعة" },
              { icon: <IconUsers size={22} />, title: "العمل الجماعي", desc: "التدرب على العمل ضمن فريق وبناء علاقات قوية مع زملائك في الكلية" },
              { icon: <IconAward size={22} />, title: "الانضباط والمسؤولية", desc: "تعلم قيم الانضباط والمسؤولية والالتزام بالمبادئ الكشفية" },
            ].map((b) => (
              <div key={b.title} style={{
                background: T.bg, borderRadius: T.radius, padding: "20px 18px",
                border: `1px solid ${T.border}`, borderTop: `3px solid ${T.gold}`,
                display: "flex", flexDirection: "column", gap: 12,
              }}>
                <span style={{
                  width: 46, height: 46, background: T.goldPale,
                  border: `1px solid rgba(196,155,58,.25)`, borderRadius: 12,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: T.goldDark,
                }}>{b.icon}</span>
                <div style={{ fontSize: 16, fontWeight: 800, color: T.navy, fontFamily: T.font }}>{b.title}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.mute, lineHeight: 1.7, fontFamily: T.font }}>{b.desc}</div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* 4 — CTA */}
        <div style={{
          gridColumn: "1 / -1",
          background: `linear-gradient(140deg, ${T.navy} 0%, ${T.navyMid} 100%)`,
          borderRadius: 16, padding: "32px 40px",
          boxShadow: "0 4px 18px rgba(30,58,95,.22)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 24, position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 3,
            background: `linear-gradient(90deg, transparent, ${T.gold}, #e5b84a, transparent)`,
          }} />
          <div style={{
            position: "absolute", inset: 0,
            background: `radial-gradient(ellipse 400px 250px at -5% 80%, rgba(196,155,58,.1) 0%, transparent 60%)`,
            pointerEvents: "none",
          }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            {ctaData.badge && (
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "4px 14px", borderRadius: 100, fontSize: 13, fontWeight: 700,
                color: ctaData.badge.color, background: ctaData.badge.bg,
                border: `1px solid ${ctaData.badge.border}`, marginBottom: 12,
                fontFamily: T.font,
              }}>
                {ctaData.badge.label}
              </span>
            )}
            <h3 style={{ fontSize: 22, fontWeight: 900, color: "#fff", margin: "0 0 10px", fontFamily: T.font }}>
              {ctaData.heading}
            </h3>
            <p style={{ fontSize: 15, fontWeight: 500, color: "rgba(255,255,255,.6)", margin: 0, lineHeight: 1.65, fontFamily: T.font }}>
              {ctaData.sub}
            </p>
          </div>

          {ctaData.buttons && (
            <div style={{ display: "flex", gap: 14, alignItems: "center", flexShrink: 0, position: "relative", zIndex: 1 }}>
              {ctaData.buttons}
              {memberStatus?.status !== "accepted" && memberStatus?.status !== "pending" && (
                <Link href="/Student/Scouts/Track" style={{
                  display: "inline-flex", alignItems: "center", gap: 10,
                  padding: "14px 32px", background: "rgba(255,255,255,.12)",
                  border: "1.5px solid rgba(255,255,255,.28)", borderRadius: T.radius,
                  fontFamily: T.font, fontSize: 16, fontWeight: 700,
                  color: "#fff", textDecoration: "none", whiteSpace: "nowrap",
                }}>
                  <IconClock size={18} />
                  متابعة الطلبات
                </Link>
              )}
            </div>
          )}
        </div>

      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}