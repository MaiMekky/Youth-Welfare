"use client";
import React, { useState } from "react";
import Link from "next/link";
import "./track.css";

/* ── Icons ─────────────────────────────────────────────────── */
const IconArrowRight = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M19 12H5M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconClock = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconCheckCircle = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconXCircle = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconInfo = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const IconCompass = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="1" fill="currentColor"/>
  </svg>
);

const IconSearch = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

const IconRefresh = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M23 4v6h-6M1 20v-6h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconShield = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/* ── Types ── */
type RequestStatus = "pending" | "preliminary_approved" | "accepted" | "rejected";

interface ScoutRequest {
  id: string;
  refNumber: string;
  collegeName: string;
  applicantName: string;
  submittedAt: string;
  updatedAt: string;
  status: RequestStatus;
  note?: string;
}

/* ── Mock data ── */
const mockRequests: ScoutRequest[] = [
  {
    id: "1",
    refNumber: "SCT-2024-0042",
    collegeName: "كلية الهندسة",
    applicantName: "أحمد محمد علي",
    submittedAt: "١٢ أبريل ٢٠٢٤",
    updatedAt: "١٥ أبريل ٢٠٢٤",
    status: "pending",
    note: "جاري مراجعة الطلب من قِبل مسؤول الكلية",
  },
];

/* ── Status config ── */
const statusConfig: Record<RequestStatus, {
  label: string;
  color: string;
  bg: string;
  border: string;
  icon: React.ReactNode;
  step: number;
}> = {
  pending: {
    label: "منتظر — قيد المراجعة",
    color: "#D97706",
    bg: "rgba(217,119,6,.08)",
    border: "rgba(217,119,6,.28)",
    icon: <IconClock size={18} />,
    step: 1,
  },
  preliminary_approved: {
    label: "موافقة مبدئية",
    color: "#2D5F8A",
    bg: "#EBF3FB",
    border: "#B3D4EE",
    icon: <IconInfo size={18} />,
    step: 2,
  },
  accepted: {
    label: "مقبول",
    color: "#059669",
    bg: "#ECFDF5",
    border: "#6EE7B7",
    icon: <IconCheckCircle size={18} />,
    step: 3,
  },
  rejected: {
    label: "مرفوض",
    color: "#DC2626",
    bg: "#FEF2F2",
    border: "#FECACA",
    icon: <IconXCircle size={18} />,
    step: -1,
  },
};

/* ── Timeline steps ── */
const timelineSteps = [
  { key: "submitted",  label: "تقديم الطلب",           desc: "تم استلام الطلب بنجاح" },
  { key: "pending",    label: "مراجعة مسؤول الكلية",   desc: "جاري الفحص والمراجعة" },
  { key: "prelim",     label: "الموافقة المبدئية",      desc: "يتطلب تسليم الأوراق للكلية" },
  { key: "final",      label: "القرار النهائي",         desc: "قبول أو رفض الطلب" },
];

/* ── Token palette ── */
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

/* ════════════════════════════════════════════════════════════
   COMPONENT
════════════════════════════════════════════════════════════ */
export default function TrackRequestPage() {
  const [searchValue, setSearchValue] = useState("");
  const [requests] = useState<ScoutRequest[]>(mockRequests);

  const filtered = searchValue.trim()
    ? requests.filter(
        (r) =>
          r.refNumber.includes(searchValue.trim()) ||
          r.applicantName.includes(searchValue.trim())
      )
    : requests;

  return (
    <div dir="rtl" style={{
      direction: "rtl",
      minHeight: "100vh",
      width: "100%",
      background: T.bg,
      fontFamily: T.font,
      color: T.text,
    }}>

      {/* ── HERO ── */}
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
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 3,
          background: `linear-gradient(90deg, transparent, ${T.gold}, #e5b84a, transparent)`,
        }} />
        <div style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(ellipse 500px 300px at 5% 70%, rgba(196,155,58,.08) 0%, transparent 60%)`,
          pointerEvents: "none",
        }} />

        {/* Back link */}
        <div style={{ position: "absolute", top: 22, right: 32, zIndex: 2 }}>
          <Link href="/Student/Scouts" style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: 14,
            fontWeight: 700,
            color: "rgba(255,255,255,.75)",
            textDecoration: "none",
            fontFamily: T.font,
          }}>
            <IconArrowRight size={16} />
            العودة للجوالة
          </Link>
        </div>

        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: "rgba(196,155,58,.18)",
          border: "1px solid rgba(196,155,58,.35)",
          borderRadius: 100,
          padding: "6px 18px",
          fontSize: 13,
          fontWeight: 700,
          color: T.gold,
          marginBottom: 16,
          position: "relative",
          zIndex: 1,
          fontFamily: T.font,
        }}>
          <IconCompass size={14} />
          الأنشطة الكشفية الجامعية
        </div>

        <h1 style={{
          fontSize: 28,
          fontWeight: 900,
          color: "#fff",
          margin: "0 0 6px",
          fontFamily: T.font,
          position: "relative",
          zIndex: 1,
        }}>
          متابعة طلبات الجوالة
        </h1>
        <div style={{
          width: 52, height: 3, background: T.gold, borderRadius: 3,
          margin: "14px auto",
          position: "relative", zIndex: 1,
        }} />
        <p style={{
          fontSize: 15,
          fontWeight: 500,
          color: "rgba(255,255,255,.65)",
          margin: 0,
          fontFamily: T.font,
          position: "relative",
          zIndex: 1,
        }}>
          تابع حالة طلب الانضمام إلى عشيرة كليتك
        </p>
      </div>

      {/* ── BODY ── */}
      <div style={{ width: "100%", padding: "32px 40px", boxSizing: "border-box" }}>

        {/* Search bar */}
        <div style={{
          background: T.white,
          border: `1px solid ${T.border}`,
          borderRadius: T.radius,
          boxShadow: T.shadow,
          padding: "22px 26px",
          marginBottom: 24,
          display: "flex",
          gap: 14,
          alignItems: "center",
        }}>
          <div style={{ flex: 1, position: "relative" }}>
            <span style={{
              position: "absolute",
              right: 14,
              top: "50%",
              transform: "translateY(-50%)",
              color: T.mute,
              pointerEvents: "none",
            }}>
              <IconSearch size={18} />
            </span>
            <input
              type="text"
              placeholder="ابحث برقم المرجع أو الاسم..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 44px 12px 16px",
                border: `1.5px solid ${T.border}`,
                borderRadius: T.radius,
                fontFamily: T.font,
                fontSize: 15,
                fontWeight: 600,
                color: T.text,
                background: T.bg,
                outline: "none",
                direction: "rtl",
              }}
            />
          </div>
          <button
            onClick={() => setSearchValue("")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 22px",
              background: T.navyLight,
              border: `1px solid ${T.border}`,
              borderRadius: T.radius,
              fontFamily: T.font,
              fontSize: 15,
              fontWeight: 700,
              color: T.navyMid,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            <IconRefresh size={16} />
            تحديث
          </button>
        </div>

        {/* Notice box */}
        <div style={{
          background: T.goldPale,
          border: `1.5px dashed rgba(196,155,58,.35)`,
          borderRadius: T.radius,
          padding: "14px 18px",
          fontSize: 15,
          fontWeight: 600,
          color: "#7A5A00",
          lineHeight: 1.75,
          marginBottom: 28,
          fontFamily: T.font,
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
        }}>
          <span style={{ color: T.gold, flexShrink: 0, marginTop: 1 }}><IconInfo size={18} /></span>
          <span>
            <strong>ملاحظة مهمة: </strong>
            عند ظهور الموافقة المبدئية، يجب التوجه فوراً إلى الكلية لتسليم الأوراق المطلوبة
            لاستكمال إجراءات القبول.
          </span>
        </div>

        {/* Requests list */}
        {filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            {filtered.map((req) => (
              <RequestCard key={req.id} request={req} />
            ))}
          </div>
        )}

        {/* Stages legend */}
        <div style={{
          background: T.white,
          border: `1px solid ${T.border}`,
          borderRadius: T.radius,
          boxShadow: T.shadow,
          overflow: "hidden",
          marginTop: 28,
          position: "relative",
        }}>
          {/* Gold stripe */}
          <div style={{
            position: "absolute", top: 0, right: 0,
            width: 4, height: "100%",
            background: `linear-gradient(180deg, ${T.gold}, ${T.goldDark})`,
          }} />

          {/* Header */}
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
              <IconInfo size={18} />
            </span>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: T.navy, margin: 0, fontFamily: T.font }}>
              شرح مراحل معالجة الطلب
            </h2>
          </div>

          <div style={{ padding: "22px 26px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              {[
                { icon: <IconClock size={20} />, label: "منتظر", desc: "تم استلام الطلب وجار مراجعته من قِبل مسؤول الكلية.", color: "#D97706", bg: "rgba(217,119,6,.08)", border: "rgba(217,119,6,.28)" },
                { icon: <IconInfo size={20} />, label: "موافقة مبدئية", desc: "يرجى التوجه إلى الكلية لتسليم الأوراق المطلوبة للمراجعة.", color: T.navyMid, bg: T.navyLight, border: "#B3D4EE" },
                { icon: <IconCheckCircle size={20} />, label: "النتيجة النهائية", desc: "يكون القرار إما مقبول أو مرفوض بعد مراجعة جميع الأوراق.", color: "#059669", bg: "#ECFDF5", border: "#6EE7B7" },
              ].map((stage) => (
                <div key={stage.label} style={{
                  background: stage.bg,
                  border: `1px solid ${stage.border}`,
                  borderRadius: T.radius,
                  padding: "18px 16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}>
                  <span style={{
                    width: 42, height: 42,
                    background: T.white,
                    border: `1px solid ${stage.border}`,
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: stage.color,
                  }}>
                    {stage.icon}
                  </span>
                  <div style={{ fontSize: 16, fontWeight: 800, color: stage.color, fontFamily: T.font }}>{stage.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: T.mute, lineHeight: 1.7, fontFamily: T.font }}>{stage.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ height: 48 }} />
      </div>
    </div>
  );
}

/* ── Request Card ── */
function RequestCard({ request }: { request: ScoutRequest }) {
  const cfg = statusConfig[request.status];
  const isRejected = request.status === "rejected";

  return (
    <div style={{
      background: T.white,
      border: `1px solid ${T.border}`,
      borderRadius: T.radius,
      boxShadow: T.shadow,
      overflow: "hidden",
      position: "relative",
    }}>
      {/* Left accent stripe */}
      <div style={{
        position: "absolute",
        top: 0, right: 0,
        width: 4, height: "100%",
        background: isRejected
          ? "linear-gradient(180deg, #DC2626, #B91C1C)"
          : `linear-gradient(180deg, ${T.gold}, ${T.goldDark})`,
      }} />

      {/* Top row: ref + badge */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "18px 26px 14px",
        borderBottom: `1px solid ${T.border}`,
        background: T.navyLight,
        gap: 14,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{
            width: 42, height: 42,
            borderRadius: T.radius,
            background: cfg.bg,
            border: `1px solid ${cfg.border}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: cfg.color,
            flexShrink: 0,
          }}>
            {cfg.icon}
          </span>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: T.navy, fontFamily: T.font }}>
              طلب الانضمام
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.mute, fontFamily: T.font }}>
              رقم المرجع: <span style={{ color: T.navy, fontWeight: 700 }}>{request.refNumber}</span>
            </div>
          </div>
        </div>

        {/* Status badge */}
        <span style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "7px 18px",
          borderRadius: 100,
          fontSize: 14,
          fontWeight: 700,
          color: cfg.color,
          background: cfg.bg,
          border: `1px solid ${cfg.border}`,
          whiteSpace: "nowrap",
          fontFamily: T.font,
        }}>
          {cfg.icon}
          {cfg.label}
        </span>
      </div>

      {/* Info grid */}
      <div style={{ padding: "22px 26px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 22 }}>
          {[
            { label: "الكلية", value: request.collegeName },
            { label: "تاريخ التقديم", value: request.submittedAt },
            { label: "آخر تحديث", value: request.updatedAt },
          ].map((item) => (
            <div key={item.label} style={{
              background: T.bg,
              borderRadius: T.radius,
              padding: "14px 16px",
              border: `1px solid ${T.border}`,
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.mute, marginBottom: 4, fontFamily: T.font }}>{item.label}</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: T.navy, fontFamily: T.font }}>{item.value}</div>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <ProgressTimeline status={request.status} />

        {/* Note */}
        {request.note && (
          <div style={{
            marginTop: 18,
            background: T.goldPale,
            border: `1.5px dashed rgba(196,155,58,.35)`,
            borderRadius: T.radius,
            padding: "12px 16px",
            fontSize: 14,
            fontWeight: 600,
            color: "#7A5A00",
            lineHeight: 1.7,
            fontFamily: T.font,
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
          }}>
            <span style={{ color: T.gold, flexShrink: 0 }}><IconInfo size={16} /></span>
            {request.note}
          </div>
        )}

        {/* Preliminary approved action */}
        {request.status === "preliminary_approved" && (
          <div style={{
            marginTop: 16,
            background: "#EBF3FB",
            border: `1.5px solid #B3D4EE`,
            borderRadius: T.radius,
            padding: "14px 18px",
            fontSize: 15,
            fontWeight: 700,
            color: T.navyMid,
            fontFamily: T.font,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <IconShield size={18} />
              يجب التوجه إلى الكلية لتسليم الأوراق المطلوبة
            </div>
            <span style={{
              padding: "8px 18px",
              background: T.navy,
              color: "#fff",
              borderRadius: T.radius,
              fontSize: 14,
              fontWeight: 800,
              fontFamily: T.font,
              cursor: "default",
            }}>
              مطلوب منك
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Progress Timeline ── */
function ProgressTimeline({ status }: { status: RequestStatus }) {
  const cfg = statusConfig[status];
  const currentStep = cfg.step;
  const isRejected = status === "rejected";

  const steps = [
    { label: "تقديم الطلب", done: true },
    { label: "قيد المراجعة", done: currentStep >= 1 },
    { label: "موافقة مبدئية", done: currentStep >= 2 },
    { label: "القرار النهائي", done: currentStep >= 3 },
  ];

  return (
    <div style={{ position: "relative" }}>
      {/* Track line */}
      <div style={{
        position: "absolute",
        top: 20,
        right: 20,
        left: 20,
        height: 2,
        background: T.border,
        zIndex: 0,
      }} />
      {/* Filled line */}
      <div style={{
        position: "absolute",
        top: 20,
        right: 20,
        height: 2,
        background: isRejected
          ? "#DC2626"
          : `linear-gradient(to left, ${T.gold}, ${T.goldDark})`,
        zIndex: 0,
        width: isRejected
          ? `${(1 / 3) * 100}%`
          : `${(Math.max(0, currentStep) / 3) * 100}%`,
        transition: "width 0.5s ease",
      }} />

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 4,
        position: "relative",
        zIndex: 1,
      }}>
        {steps.map((step, i) => {
          const isActive = !isRejected && currentStep === i;
          const isDone = !isRejected && step.done && currentStep > i || (!isRejected && i === 0);
          const isRejectedStep = isRejected && i === 1;

          return (
            <div key={i} style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}>
              <div style={{
                width: 40, height: 40,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: T.font,
                fontSize: 15,
                fontWeight: 800,
                transition: "all 0.3s ease",
                ...(isRejectedStep ? {
                  background: "#FEF2F2",
                  border: "2px solid #FECACA",
                  color: "#DC2626",
                } : isDone || i === 0 ? {
                  background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
                  border: "2px solid transparent",
                  color: "#fff",
                  boxShadow: "0 2px 8px rgba(196,155,58,.35)",
                } : isActive ? {
                  background: T.white,
                  border: `2px solid ${T.gold}`,
                  color: T.gold,
                  boxShadow: `0 0 0 4px rgba(196,155,58,.15)`,
                } : {
                  background: T.bg,
                  border: `2px solid ${T.border}`,
                  color: T.mute,
                }),
              }}>
                {isRejectedStep ? <IconXCircle size={18} /> : isDone || i === 0 ? <IconCheckCircle size={18} /> : i + 1}
              </div>
              <span style={{
                fontSize: 13,
                fontWeight: 700,
                color: isDone || i === 0 || isActive ? T.navy : T.mute,
                fontFamily: T.font,
                textAlign: "center",
                lineHeight: 1.4,
              }}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Empty State ── */
function EmptyState() {
  return (
    <div style={{
      textAlign: "center",
      padding: "60px 24px",
      background: T.white,
      borderRadius: T.radius,
      border: `2px dashed rgba(196,155,58,.3)`,
      boxShadow: T.shadow,
    }}>
      <div style={{
        width: 70, height: 70,
        margin: "0 auto 20px",
        background: T.goldPale,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: T.gold,
        opacity: 0.5,
      }}>
        <IconCompass size={36} />
      </div>
      <p style={{ fontSize: 18, fontWeight: 800, color: T.text, margin: "0 0 8px", fontFamily: T.font }}>
        لا توجد طلبات
      </p>
      <p style={{ fontSize: 15, fontWeight: 600, color: T.mute, margin: "0 0 24px", fontFamily: T.font }}>
        لم تقدم أي طلبات للانضمام بعد
      </p>
      <Link href="/Student/Scouts/apply" style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "13px 28px",
        background: `linear-gradient(135deg, ${T.gold} 0%, ${T.goldDark} 100%)`,
        color: "#fff",
        borderRadius: T.radius,
        fontFamily: T.font,
        fontSize: 16,
        fontWeight: 800,
        textDecoration: "none",
        boxShadow: "0 4px 16px rgba(196,155,58,.4)",
      }}>
        تقديم طلب الانضمام
      </Link>
    </div>
  );
}