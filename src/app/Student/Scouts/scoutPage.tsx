"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";
import "./scouts.css";

const API_URL = getBaseUrl();

/* ══════════════════════════════════════════
   ICONS
══════════════════════════════════════════ */
const IconCompass = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="1" fill="currentColor"/>
  </svg>
);

const IconUsers = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="10" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconShield = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
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
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconAward = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="12" cy="9" r="6" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
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
    <path d="M12 2L8.5 8.5 1 9.27l5.5 5.36L4.82 22 12 18.27 19.18 22l-1.68-7.37L23 9.27l-7.5-.77L12 2z"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
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

const IconSend = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M22 2L11 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 2L15 22l-4-9-9-4 20-7z"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconRefresh = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M23 4v6h-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M1 20v-6h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconFileText = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconAlertTriangle = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 9v4M12 17h.01"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

/* ══════════════════════════════════════════
   TYPES
══════════════════════════════════════════ */
type Clan = {
  clan_id: number;
  name: string;
  description: string;
  status: string;
  faculty_name: string;
  members_count?: number;
};

type MemberStatus = {
  scout_member_id: number;
  clan: number;
  clan_name: string;
  group: number | null;
  group_name: string | null;
  role: string;
  status: string;
  rejection_reason: string | null;
  joined_at: string | null;
};

/**
 * "not_applied"       → no application at all (API returned message only)
 * "pending"           → منتظر
 * "accepted"          → مقبول
 * "rejected"          → مرفوض
 * "preliminary"       → موافقة مبدئية
 */
type AppState =
  | "not_applied"
  | "pending"
  | "accepted"
  | "rejected"
  | "preliminary";

function parseAppState(statusRaw: string): AppState {
  const s = statusRaw.trim();
  if (s === "مقبول"          || s === "accepted")             return "accepted";
  if (s === "مرفوض"          || s === "rejected")             return "rejected";
  if (s === "موافقة مبدئية" || s === "preliminary_approved") return "preliminary";
  return "pending"; // منتظر / pending / anything else
}

/* ══════════════════════════════════════════
   SUB-COMPONENTS
══════════════════════════════════════════ */

/** Generic info card with icon header */
function SectionCard({
  icon, title, children, fullWidth = false, accentTop = false,
}: {
  icon: React.ReactNode; title: string; children: React.ReactNode;
  fullWidth?: boolean; accentTop?: boolean;
}) {
  const cls = [
    "section-card",
    fullWidth  ? "section-card--full"       : "",
    accentTop  ? "section-card--accent-top" : "",
  ].filter(Boolean).join(" ");

  return (
    <div className={cls}>
      {!accentTop && <div className="section-card__side-bar" />}
      <div className="section-card__header">
        <span className="section-card__icon">{icon}</span>
        <h2 className="section-card__title">{title}</h2>
      </div>
      <div className="section-card__body">{children}</div>
    </div>
  );
}

/** Bullet list with configurable dot colour */
function BulletList({ items, dotClass }: { items: string[]; dotClass: string }) {
  return (
    <div className="bullet-list">
      {items.map(item => (
        <div key={item} className="bullet-list__item">
          <span className={`bullet-list__dot ${dotClass}`} />
          <span className="bullet-list__text">{item}</span>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
export default function ScoutsPage() {
  const [clan, setClan]               = useState<Clan | null>(null);
  const [memberData, setMemberData]   = useState<MemberStatus | null>(null);
  const [appState, setAppState]       = useState<AppState>("not_applied");
  const [clanAvail, setClanAvail]     = useState<"none" | "inactive" | "active" | null>(null);
  const [loading, setLoading]         = useState(true);
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinMsg, setJoinMsg]         = useState("");

  /* ── Fetch both endpoints in parallel ── */
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [clanRes, statusRes] = await Promise.all([
        authFetch(`${API_URL}/api/student/clan/`),
        authFetch(`${API_URL}/api/student/my_status/`),
      ]);

      /* Clan */
      if (!clanRes.ok) {
        setClanAvail("none");
      } else {
        const j = await clanRes.json();
        const d: Clan | null = j.data ?? null;
        if (!d) { setClanAvail("none"); }
        else {
          setClan(d);
          setClanAvail(d.status === "نشط" ? "active" : "inactive");
        }
      }

      /* Member status */
      if (statusRes.ok) {
        const j = await statusRes.json();
        if (j.data) {
          /* API returned actual member record */
          setMemberData(j.data);
          setAppState(parseAppState(j.data.status));
        } else {
          /* No data field → student has not applied yet */
          setMemberData(null);
          setAppState("not_applied");
        }
      } else {
        setMemberData(null);
        setAppState("not_applied");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* ── Submit join request ── */
  const handleJoin = async () => {
    setJoinLoading(true);
    setJoinMsg("");
    try {
      const res = await authFetch(`${API_URL}/api/student/join/`, { method: "POST" });
      if (res.ok) {
        /* Re-fetch status to update UI */
        await load();
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

  /* ── CTA configuration ── */
  type CtaConfig = {
    badgeClass: string | null;
    badgeLabel: string | null;
    heading: string;
    sub: string;
    showJoinBtn: boolean;
    dashboardBtn: boolean;
    trackBtn: boolean;
  };

  const buildCta = (): CtaConfig => {
    /* 1 ── No clan exists for this faculty */
    if (clanAvail === "none") return {
      badgeClass: null, badgeLabel: null,
      heading: "لا تتوفر عشيرة لكليتك",
      sub: "لم يتم إنشاء عشيرة لكليتك حتى الآن، تواصل مع إدارة الجوالة للاستفسار",
      showJoinBtn: false, dashboardBtn: false, trackBtn: false,
    };

    /* 2 ── Clan exists but is inactive */
    if (clanAvail === "inactive") return {
      badgeClass: "status-badge--inactive", badgeLabel: "غير نشطة",
      heading: "العشيرة غير نشطة حالياً",
      sub: "عشيرة كليتك موجودة لكنها غير متاحة للانضمام في الوقت الحالي",
      showJoinBtn: false, dashboardBtn: false, trackBtn: false,
    };

    /* 3 ── Clan is active → branch on appState */
    switch (appState) {
      case "not_applied": return {
        badgeClass: null, badgeLabel: null,
        heading: "هل أنت مستعد للانضمام؟",
        sub: "انضم إلى عشيرة كليتك — سيتم مراجعة طلبك من قبل المسؤول",
        showJoinBtn: true, dashboardBtn: false, trackBtn: false,
      };

      case "pending": return {
        badgeClass: "status-badge--pending", badgeLabel: "قيد الانتظار",
        heading: "طلبك قيد المراجعة",
        sub: "تم استلام طلبك وهو قيد المراجعة من قبل مسؤول الكلية",
        showJoinBtn: false, dashboardBtn: false, trackBtn: false,
      };

      case "preliminary": return {
        badgeClass: "status-badge--prelim", badgeLabel: "موافقة مبدئية",
        heading: "موافقة مبدئية على طلبك",
        sub: "يرجى التوجه إلى الكلية لتسليم الأوراق المطلوبة لاستكمال القبول",
        showJoinBtn: false, dashboardBtn: false, trackBtn: true,
      };

      case "accepted": return {
        badgeClass: "status-badge--accepted", badgeLabel: "مقبول",
        heading: "أنت عضو في العشيرة",
        sub: "تم قبول انضمامك، يمكنك الاطلاع على معلومات مجموعتك من لوحة التحكم",
        showJoinBtn: false, dashboardBtn: true, trackBtn: false,
      };

      case "rejected": return {
        badgeClass: "status-badge--rejected", badgeLabel: "مرفوض",
        heading: "تم رفض طلبك",
        sub: memberData?.rejection_reason
          ? `سبب الرفض: ${memberData.rejection_reason} — يمكنك تقديم طلب جديد`
          : "يمكنك تقديم طلب انضمام جديد الآن",
        showJoinBtn: true, dashboardBtn: false, trackBtn: false,
      };
    }
  };

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="loading-wrap">
        <div>
          <div className="spinner" />
          <p className="loading-label">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  const cta = buildCta();

  return (
    <div className="scouts-page" dir="rtl">

      {/* ── HERO ── */}
      <header className="scouts-hero">
        <div className="scouts-hero__topline" />
        <div className="scouts-hero__glow" />
        <h1 className="scouts-hero__title">الجوالة</h1>
        <div className="scouts-hero__divider" />
        <p className="scouts-hero__sub">
          نظام الأنشطة الكشفية داخل الجامعة — يهدف إلى تنمية المهارات القيادية
          والعمل الجماعي من خلال عشائر الكليات والرهوط المنظمة.
        </p>
      </header>

      {/* ── CONTENT ── */}
      <main className="scouts-grid">

        {/* Card 1 — What is Scouts */}
        <SectionCard icon={<IconCompass size={18} />} title="ما هي الجوالة؟" accentTop>
          <p className="card-prose">
            الجوالة ليست مجرد نشاط طلابي، بل تجربة متكاملة تهدف إلى بناء الشخصية
            وتنمية المهارات الحياتية. تقدم إدارة الجوالة والخدمة العامة بيئة تفاعلية
            تجمع بين:
          </p>
          <BulletList dotClass="bullet-list__dot--gold" items={[
            "العمل الجماعي وروح الفريق",
            "القيادة وتحمل المسؤولية",
            "خدمة المجتمع والمشاركة الفعالة",
            "اكتشاف المواهب وتنميتها",
          ]} />
          <p className="card-prose card-prose--sm">من خلال المشاركة في الجوالة، يخوض الطالب تجارب متنوعة مثل:</p>
          <BulletList dotClass="bullet-list__dot--navy" items={[
            "المعسكرات والأنشطة الخارجية",
            "ورش العمل والتدريبات القيادية",
            "الفعاليات المجتمعية والخدمية",
            "تنظيم الأحداث والعمل ضمن فرق",
          ]} />
        </SectionCard>

        {/* Card 2 — Why join + How to start */}
        <SectionCard icon={<IconShield size={18} />} title="لماذا تنضم للجوالة؟">
          <BulletList dotClass="bullet-list__dot--gold" items={[
            "تطور مهاراتك الشخصية والقيادية",
            "توسّع دائرة علاقاتك داخل وخارج كليتك",
            "تعيش تجربة مختلفة مليئة بالتحديات والتجارب الواقعية",
            "تساهم في خدمة مجتمعك بشكل فعّال",
          ]} />
          <hr className="card-divider" />
          <div className="how-start-block">
            <span className="how-start-block__icon"><IconHeart size={15} /></span>
            <span className="how-start-block__label">كيف تبدأ؟</span>
          </div>
          <p className="card-prose">
            كل ما عليك هو التقديم والانضمام إلى عشيرة كليتك، وسيتم مراجعة طلبك
            من قبل المسؤولين، ثم تبدأ رحلتك داخل الجوالة!
          </p>
          <p className="quote-bar">الجوالة ليست مجرد نشاط... إنها أسلوب حياة.</p>
        </SectionCard>

        {/* Card 3 — Benefits (full width) */}
        <SectionCard icon={<IconStar size={18} />} title="ماذا ستكتسب من الانضمام؟" fullWidth>
          <div className="benefits-grid">
            {[
              {
                icon: <IconTarget size={22} />,
                title: "تطوير المهارات القيادية",
                desc: "اكتساب مهارات القيادة والإدارة من خلال الأنشطة الكشفية المتنوعة",
              },
              {
                icon: <IconUsers size={22} />,
                title: "العمل الجماعي",
                desc: "التدرب على العمل ضمن فريق وبناء علاقات قوية مع زملائك في الكلية",
              },
              {
                icon: <IconAward size={22} />,
                title: "الانضباط والمسؤولية",
                desc: "تعلم قيم الانضباط والمسؤولية والالتزام بالمبادئ الكشفية",
              },
            ].map(b => (
              <div key={b.title} className="benefit-card">
                <span className="benefit-card__icon">{b.icon}</span>
                <div className="benefit-card__title">{b.title}</div>
                <div className="benefit-card__desc">{b.desc}</div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Card 4 — Clan Info (only when clan exists) */}
        {clan && clanAvail !== "none" && (
          <SectionCard icon={<IconCompass size={18} />} title="معلومات العشيرة" fullWidth>
            <div className="clan-info-grid">
              {[
                { label: "اسم العشيرة",  value: clan.name },
                { label: "وصف العشيرة",  value: clan.description },
                { label: "الحالة",        value: clan.status },
                ...(clan.members_count !== undefined
                  ? [{ label: "عدد الأعضاء", value: `${clan.members_count} عضو` }]
                  : []),
              ].map(item => (
                <div key={item.label} className="clan-info-item">
                  <div className="clan-info-item__label">{item.label}</div>
                  <div className="clan-info-item__value">{item.value}</div>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* CTA Card */}
        <div className="cta-card">
          <div className="cta-card__topline" />
          <div className="cta-card__glow" />

          <div className="cta-card__content">
            {cta.badgeClass && cta.badgeLabel && (
              <span className={`status-badge ${cta.badgeClass}`}>
                {/* Badge icon by state */}
                {appState === "pending"     && <IconClock size={14} />}
                {appState === "accepted"    && <IconAward size={14} />}
                {appState === "rejected"    && <IconAlertTriangle size={14} />}
                {appState === "preliminary" && <IconFileText size={14} />}
                {clanAvail === "inactive"   && <IconAlertTriangle size={14} />}
                {cta.badgeLabel}
              </span>
            )}
            <h3 className="cta-heading">{cta.heading}</h3>
            <p className="cta-sub">{cta.sub}</p>
            {joinMsg && <p className="cta-error">{joinMsg}</p>}
          </div>

          <div className="cta-card__actions">
            {/* Join / Re-apply button */}
            {cta.showJoinBtn && (
              <button
                className="btn btn--primary"
                onClick={handleJoin}
                disabled={joinLoading}
              >
                {joinLoading
                  ? "جاري الإرسال..."
                  : appState === "rejected"
                    ? <><IconRefresh size={18} /> إعادة التقديم</>
                    : <><IconSend size={18} /> انضم الآن</>
                }
              </button>
            )}

            {/* Dashboard button for accepted members */}
            {cta.dashboardBtn && (
              <Link href="/Student/Scouts/dashboard" className="btn btn--primary">
                <IconLayoutDashboard size={18} />
                لوحة التحكم
              </Link>
            )}

          </div>
        </div>

      </main>
    </div>
  );
}