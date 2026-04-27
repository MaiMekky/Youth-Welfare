"use client";
import React, { useState } from "react";
import Link from "next/link";
import "./scouts.css";

/* ── Icons ─────────────────────────────────────────────────── */
const IconStar = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M12 2L8.5 8.5 1 9.27l5.5 5.36L4.82 22 12 18.27 19.18 22l-1.68-7.37L23 9.27l-7.5-.77L12 2z"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconCompass = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="1" fill="currentColor"/>
  </svg>
);

const IconUsers = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="10" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconShield = ({ size = 16 }: { size?: number }) => (
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

const IconHeart = ({ size = 20 }: { size?: number }) => (
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

const IconClock = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconCheckCircle = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconInfo = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const IconEmpty = ({ size = 60 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M12 2L8.5 8.5 1 9.27l5.5 5.36L4.82 22 12 18.27 19.18 22l-1.68-7.37L23 9.27l-7.5-.77L12 2z"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/* ── Mock request data — replace with real API ─────────────── */
const mockRequests = [
  {
    id: 1,
    title: "طلب الانضمام",
    desc: "تم استلام طلبك للانضمام إلى عشيرة كليتك، وجاري مراجعته من قبل المسؤول.",
    note: "سيتم إشعارك عند اتخاذ القرار",
    status: "pending" as const,
  },
];

type RequestStatus = "pending" | "accepted" | "rejected";

const statusLabel: Record<RequestStatus, string> = {
  pending:  "قيد المراجعة",
  accepted: "مقبول",
  rejected: "مرفوض",
};

const statusClass: Record<RequestStatus, string> = {
  pending:  "badge badge-pending",
  accepted: "badge badge-accepted",
  rejected: "badge badge-rejected",
};

const requestIconClass: Record<RequestStatus, string> = {
  pending:  "request-icon",
  accepted: "request-icon icon-green",
  rejected: "request-icon icon-red",
};

const RequestIcon = ({ status }: { status: RequestStatus }) => {
  if (status === "accepted") return <IconCheckCircle size={22} />;
  if (status === "rejected") return <IconShield size={22} />;
  return <IconClock size={22} />;
};

/* ══════════════════════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════════════════════ */
const ScoutsPage: React.FC = () => {
  const [requests] = useState(mockRequests);

  return (
    <div className="scouts-page">

      {/* ── HERO HEADER ─────────────────────────────────────── */}
      <div className="scouts-hero">
        <div className="hero-inner">
          <div className="hero-text">
            <div className="hero-badge">
              <IconCompass size={13} />
              الأنشطة الكشفية الجامعية
            </div>
            <h1 className="hero-title">الجوالة</h1>
            <p className="hero-sub">
              نظام الأنشطة الكشفية داخل الجامعة — يهدف إلى تنمية المهارات القيادية
              والعمل الجماعي من خلال عشائر الكليات والرهوط المنظمة.
            </p>
          </div>
          <div className="hero-icon-wrap">
            <IconCompass size={36} />
          </div>
        </div>
      </div>

      <div className="scouts-body">

        {/* ── INFO GRID ────────────────────────────────────── */}
        <div className="section-header" style={{ marginTop: 28 }}>
          <div className="section-icon"><IconInfo size={16} /></div>
          <h2 className="section-title">نبذة عن نظام الجوالة</h2>
          <div className="section-line" />
        </div>

        <div className="info-grid">
          {/* About card */}
          <div className="content-card card-navy-top">
            <div className="card-head">
              <div className="card-head-icon"><IconCompass size={16} /></div>
              <h3 className="card-head-title">نبذة عن نظام الجوالة</h3>
            </div>
            <div className="card-body">
              <p className="card-desc">
                الجوالة هي نظام أنشطة طلابية على مستوى الجامعة، يهدف إلى تنمية المهارات القيادية
                والعمل الجماعي. ينضم الطلاب إلى عشيرة الكلية الخاصة بهم، ويتم تنظيمهم في مجموعات
                (رهوط) تحت إشراف هيكل إداري متكامل.
              </p>

              <span className="info-sub-label">التنظيم</span>
              <ul className="info-list">
                <li>كل كلية لها عشيرة واحدة</li>
                <li>يتم تقسيم الطلاب إلى رهوط (مجموعات)</li>
              </ul>

              <span className="info-sub-label" style={{ marginTop: 16 }}>القيادة</span>
              <ul className="info-list">
                <li>لكل رهط قائد ومساعد</li>
                <li>هيكل إداري يشمل قائد العشيرة ومساعديه</li>
              </ul>
            </div>
          </div>

          {/* Admin card */}
          <div className="content-card card-gold-stripe">
            <div className="card-head">
              <div className="card-head-icon"><IconShield size={16} /></div>
              <h3 className="card-head-title">إدارة الجوالة والخدمة العامة</h3>
            </div>
            <div className="card-body">
              <p className="card-desc">
                تقوم إدارة الجوالة والخدمة العامة بتنفيذ عدد من المشروعات المتنوعة والمتدرجة
                من المستوى الداخلي حتى المستوى القُمي، وقد شاركت فيها عشائر كليات الجامعة،
                حيث تم إقامة ورش عمل ومعسكرات الإعداد الجوالي تمهيداً للمشاركة في اللقاءات
                القُمية التي حصل فيها جوالو الجامعة على مراكز متقدمة.
              </p>
              <p className="card-desc" style={{ marginBottom: 0 }}>
                تهتم الإدارة بحياة الخلاء والأنشطة التي تبث روح التعاون وتكتشف المواهب،
                ويقوم بإدارة النشاط مجموعة من الأخصائيين المؤهلين كشفياً وإرشادياً.
              </p>
            </div>
          </div>
        </div>

        {/* ── BENEFITS ─────────────────────────────────────── */}
        <div className="section-header">
          <div className="section-icon"><IconStar size={16} /></div>
          <h2 className="section-title">ماذا ستكتسب من الانضمام؟</h2>
          <div className="section-line" />
        </div>

        <div className="benefits-grid">
          <div className="benefit-card">
            <div className="benefit-icon"><IconTarget size={20} /></div>
            <h4 className="benefit-title">تطوير المهارات القيادية</h4>
            <p className="benefit-desc">
              اكتساب مهارات القيادة والإدارة من خلال الأنشطة الكشفية المتنوعة
            </p>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon"><IconUsers size={20} /></div>
            <h4 className="benefit-title">العمل الجماعي</h4>
            <p className="benefit-desc">
              التدرب على العمل ضمن فريق وبناء علاقات قوية مع زملائك في الكلية
            </p>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon"><IconAward size={20} /></div>
            <h4 className="benefit-title">الانضباط والمسؤولية</h4>
            <p className="benefit-desc">
              تعلم قيم الانضباط والمسؤولية والالتزام بالمبادئ الكشفية
            </p>
          </div>
        </div>

        {/* ── CTA CARD ──────────────────────────────────────── */}
        <div style={{ marginTop: 28 }}>
          <div className="cta-card">
            <div className="cta-text">
              <h3 className="cta-title">هل أنت مستعد للانضمام؟</h3>
              <p className="cta-sub">
                انضم إلى عشيرة كليتك — سيتم مراجعة طلبك من قبل المسؤول
              </p>
            </div>
            <div className="cta-actions">
              <Link href="/Student/Scouts/apply" className="btn-primary">
                <IconHeart size={16} />
                تقديم طلب الانضمام
              </Link>
              <Link href="/Student/Scouts/track" className="btn-ghost">
                <IconClock size={16} />
                متابعة الطلبات
              </Link>
            </div>
          </div>
        </div>

        {/* ── REQUESTS ──────────────────────────────────────── */}
        <div className="section-header">
          <div className="section-icon"><IconClock size={16} /></div>
          <h2 className="section-title">طلباتك</h2>
          <div className="section-line" />
        </div>

        {requests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><IconEmpty size={60} /></div>
            <p className="empty-title">لا توجد طلبات</p>
            <p className="empty-sub">لم تقدم أي طلبات للانضمام بعد</p>
          </div>
        ) : (
          <div className="requests-grid">
            {requests.map((req) => (
              <div key={req.id} className="request-card">
                <div className={requestIconClass[req.status]}>
                  <RequestIcon status={req.status} />
                </div>
                <div className="request-content">
                  <h4 className="request-title">{req.title}</h4>
                  <p className="request-desc">{req.desc}</p>
                  <p className="request-note">
                    <IconInfo size={12} />
                    {req.note}
                  </p>
                </div>
                <span className={statusClass[req.status]}>
                  {statusLabel[req.status]}
                </span>
              </div>
            ))}
          </div>
        )}

        <div style={{ height: 40 }} />
      </div>
    </div>
  );
};

export default ScoutsPage;