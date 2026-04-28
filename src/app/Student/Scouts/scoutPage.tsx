"use client";
import React from "react";
import Link from "next/link";
import "./scouts.css";

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

const IconInfo = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const IconStar = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M12 2L8.5 8.5 1 9.27l5.5 5.36L4.82 22 12 18.27 19.18 22l-1.68-7.37L23 9.27l-7.5-.77L12 2z"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/* ── Token palette (mirrors Cards.tsx) ── */
const T = {
  navy:      "#1E3A5F",
  navyMid:   "#2D5F8A",
  navyLight: "#EBF3FB",
  gold:      "#C49B3A",
  goldDark:  "#A67F2C",
  goldPale:  "#FDF6E3",
  border:    "#E2ECF5",
  bg:        "#EDF2F8",
  text:      "#1A2E42",
  mute:      "#6B8299",
  white:     "#ffffff",
  radius:    10,
  shadow:    "0 2px 12px rgba(26,46,66,.08)",
  shadowMd:  "0 4px 18px rgba(30,58,95,.14)",
  font:      "'Cairo', sans-serif",
};

/* ── Reusable Section Card (same pattern as Cards.tsx) ── */
function SectionCard({
  icon,
  title,
  children,
  fullWidth = false,
  accentTop = false,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  fullWidth?: boolean;
  accentTop?: boolean;
}) {
  return (
    <div style={{
      background: T.white,
      border: `1px solid ${T.border}`,
      borderRadius: T.radius,
      boxShadow: T.shadow,
      overflow: "hidden",
      position: "relative",
      ...(fullWidth ? { gridColumn: "1 / -1" } : {}),
      ...(accentTop ? { borderTop: `3px solid ${T.navy}` } : {}),
    }}>
      {/* Gold side stripe */}
      {!accentTop && (
        <div style={{
          position: "absolute",
          top: 0, right: 0,
          width: 4, height: "100%",
          background: `linear-gradient(180deg, ${T.gold}, ${T.goldDark})`,
        }} />
      )}

      {/* Card header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "20px 26px 16px",
        borderBottom: `1px solid ${T.border}`,
        background: T.navyLight,
      }}>
        <span style={{
          width: 42, height: 42,
          borderRadius: T.radius,
          background: T.navy,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          color: T.gold,
        }}>
          {icon}
        </span>
        <h2 style={{
          fontSize: 17,
          fontWeight: 800,
          color: T.navy,
          margin: 0,
          fontFamily: T.font,
        }}>
          {title}
        </h2>
      </div>

      {/* Card body */}
      <div style={{ padding: "22px 26px", lineHeight: 1.7 }}>
        {children}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════ */
export default function ScoutsPage() {
  return (
    <div dir="rtl" style={{
      direction: "rtl",
      minHeight: "100vh",
      width: "100%",
      background: T.bg,
      fontFamily: T.font,
      display: "flex",
      flexDirection: "column",
      color: T.text,
    }}>

      {/* ── HERO HEADER ── */}
      <div style={{
        width: "100%",
        background: `linear-gradient(140deg, ${T.navy} 0%, ${T.navyMid} 100%)`,
        padding: "32px 40px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
        borderRadius: "16px 16px 0 0",
        boxShadow: "0 4px 18px rgba(30,58,95,.22)",
        boxSizing: "border-box",
      }}>
        {/* Top gold line */}
        <div style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: 3,
          background: `linear-gradient(90deg, transparent, ${T.gold}, #e5b84a, transparent)`,
        }} />
        {/* Ambient glow */}
        <div style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(ellipse 500px 300px at 5% 70%, rgba(196,155,58,.08) 0%, transparent 60%)`,
          pointerEvents: "none",
        }} />

       

        <h1 style={{
          fontSize: 30,
          fontWeight: 900,
          color: "#fff",
          margin: "0 0 6px",
          fontFamily: T.font,
          position: "relative",
          zIndex: 1,
        }}>
          الجوالة
        </h1>

        {/* Gold separator */}
        <div style={{
          width: 52,
          height: 3,
          background: T.gold,
          borderRadius: 3,
          margin: "14px auto",
          position: "relative",
          zIndex: 1,
        }} />

        <p style={{
          fontSize: 16,
          fontWeight: 500,
          color: "rgba(255,255,255,.65)",
          margin: 0,
          fontFamily: T.font,
          position: "relative",
          zIndex: 1,
          maxWidth: 560,
          marginInline: "auto",
          lineHeight: 1.75,
        }}>
          نظام الأنشطة الكشفية داخل الجامعة — يهدف إلى تنمية المهارات القيادية
          والعمل الجماعي من خلال عشائر الكليات والرهوط المنظمة.
        </p>
      </div>

      {/* ── CONTENT GRID ── */}
      <div style={{
        width: "100%",
        padding: "32px 40px",
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: 22,
        flex: 1,
        boxSizing: "border-box",
      }}>

        {/* 1 — About */}
        <SectionCard icon={<IconCompass size={18} />} title="نبذة عن نظام الجوالة" accentTop>
          <p style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.85, color: T.mute, margin: "0 0 18px", fontFamily: T.font }}>
            الجوالة هي نظام أنشطة طلابية على مستوى الجامعة، يهدف إلى تنمية المهارات القيادية
            والعمل الجماعي. ينضم الطلاب إلى عشيرة الكلية الخاصة بهم، ويتم تنظيمهم في مجموعات
            (رهوط) تحت إشراف هيكل إداري متكامل.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { label: "التنظيم", items: ["كل كلية لها عشيرة واحدة", "تقسيم الطلاب إلى رهوط (مجموعات)"] },
              { label: "القيادة", items: ["لكل رهط قائد ومساعد", "هيكل إداري يشمل قائد العشيرة"] },
            ].map((group) => (
              <div key={group.label} style={{
                background: T.bg,
                borderRadius: T.radius,
                padding: "14px 16px",
                border: `1px solid ${T.border}`,
                borderRight: `3px solid ${T.gold}`,
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.navyMid, background: T.navyLight, borderRadius: 6, padding: "3px 10px", display: "inline-block", marginBottom: 10, fontFamily: T.font }}>
                  {group.label}
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                  {group.items.map((item) => (
                    <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 14, fontWeight: 600, color: T.text, lineHeight: 1.6, fontFamily: T.font }}>
                      <span style={{ width: 6, height: 6, background: T.gold, borderRadius: "50%", flexShrink: 0, marginTop: 7 }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* 2 — Admin */}
        <SectionCard icon={<IconShield size={18} />} title="إدارة الجوالة والخدمة العامة">
          <p style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.85, color: T.mute, margin: "0 0 14px", fontFamily: T.font }}>
            تقوم إدارة الجوالة والخدمة العامة بتنفيذ عدد من المشروعات المتنوعة والمتدرجة
            من المستوى الداخلي حتى المستوى القُمي، وقد شاركت فيها عشائر كليات الجامعة،
            حيث تم إقامة ورش عمل ومعسكرات الإعداد الجوالي.
          </p>
          <p style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.85, color: T.mute, margin: 0, fontFamily: T.font }}>
            تهتم الإدارة بحياة الخلاء والأنشطة التي تبث روح التعاون وتكتشف المواهب،
            ويقوم بإدارة النشاط مجموعة من الأخصائيين المؤهلين كشفياً وإرشادياً.
          </p>
        </SectionCard>

        {/* 3 — Benefits (full-width 3-col grid) */}
        <SectionCard icon={<IconStar size={18} />} title="ماذا ستكتسب من الانضمام؟" fullWidth>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {[
              { icon: <IconTarget size={22} />, title: "تطوير المهارات القيادية", desc: "اكتساب مهارات القيادة والإدارة من خلال الأنشطة الكشفية المتنوعة" },
              { icon: <IconUsers size={22} />, title: "العمل الجماعي", desc: "التدرب على العمل ضمن فريق وبناء علاقات قوية مع زملائك في الكلية" },
              { icon: <IconAward size={22} />, title: "الانضباط والمسؤولية", desc: "تعلم قيم الانضباط والمسؤولية والالتزام بالمبادئ الكشفية" },
            ].map((b) => (
              <div key={b.title} style={{
                background: T.bg,
                borderRadius: T.radius,
                padding: "20px 18px",
                border: `1px solid ${T.border}`,
                borderTop: `3px solid ${T.gold}`,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}>
                <span style={{
                  width: 46, height: 46,
                  background: T.goldPale,
                  border: `1px solid rgba(196,155,58,.25)`,
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: T.goldDark,
                }}>
                  {b.icon}
                </span>
                <div style={{ fontSize: 16, fontWeight: 800, color: T.navy, fontFamily: T.font }}>{b.title}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.mute, lineHeight: 1.7, fontFamily: T.font }}>{b.desc}</div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* 4 — CTA (full-width) */}
        <div style={{
          gridColumn: "1 / -1",
          background: `linear-gradient(140deg, ${T.navy} 0%, ${T.navyMid} 100%)`,
          borderRadius: 16,
          padding: "32px 40px",
          boxShadow: "0 4px 18px rgba(30,58,95,.22)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Top gold line */}
          <div style={{
            position: "absolute",
            top: 0, left: 0, right: 0,
            height: 3,
            background: `linear-gradient(90deg, transparent, ${T.gold}, #e5b84a, transparent)`,
          }} />
          <div style={{
            position: "absolute", inset: 0,
            background: `radial-gradient(ellipse 400px 250px at -5% 80%, rgba(196,155,58,.1) 0%, transparent 60%)`,
            pointerEvents: "none",
          }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            <h3 style={{ fontSize: 22, fontWeight: 900, color: "#fff", margin: "0 0 10px", fontFamily: T.font }}>
              هل أنت مستعد للانضمام؟
            </h3>
            <p style={{ fontSize: 15, fontWeight: 500, color: "rgba(255,255,255,.6)", margin: 0, lineHeight: 1.65, fontFamily: T.font }}>
              انضم إلى عشيرة كليتك — سيتم مراجعة طلبك من قبل المسؤول
            </p>
          </div>

          <div style={{ display: "flex", gap: 14, alignItems: "center", flexShrink: 0, position: "relative", zIndex: 1 }}>
            {/* Primary button */}
            <Link href="/Student/Scouts/apply" style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "14px 32px",
              background: `linear-gradient(135deg, ${T.gold} 0%, ${T.goldDark} 100%)`,
              color: "#fff",
              borderRadius: T.radius,
              fontFamily: T.font,
              fontSize: 17,
              fontWeight: 800,
              cursor: "pointer",
              textDecoration: "none",
              boxShadow: "0 4px 16px rgba(196,155,58,.4)",
              whiteSpace: "nowrap",
            }}>
              <IconHeart size={18} />
              تقديم طلب الانضمام
            </Link>

            {/* Ghost button */}
            <Link href="/Student/Scouts/Track" style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "14px 32px",
              background: "rgba(255,255,255,.12)",
              border: "1.5px solid rgba(255,255,255,.28)",
              borderRadius: T.radius,
              fontFamily: T.font,
              fontSize: 16,
              fontWeight: 700,
              color: "#fff",
              cursor: "pointer",
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}>
              <IconClock size={18} />
              متابعة الطلبات
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}