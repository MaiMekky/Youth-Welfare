"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowRight, Users, Calendar, FileText, UserRound,
  Clock, MapPin, CheckCircle, Hourglass, XCircle,
  BookOpen, DollarSign, Award, AlertCircle, Info,
} from "lucide-react";
import "../styles/FamilyDetails.css";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";

// ─── Types ───────────────────────────────────────────────────────────────────

interface FamilyDetailsProps {
  family: {
    id: number;
    title: string;
    subtitle: string;
    place: string;
    views: string;
    createdAt?: string;
    deadline?: string;
    goals?: string;
    description?: string;
    image?: string;
  };
  onBack: () => void;
}

interface Post {
  id: number;
  title: string;
  description: string;
  created_at: string;
}

interface Activity {
  event_id: number;
  title: string;
  description: string;
  type: string;
  st_date: string;
  end_date: string;
  location: string;
  s_limit: number;
  cost: string;
  restrictions: string;
  reward: string;
  registration_status?: string | null; // "منتظر" | "مقبول" | "مرفوض" | null
}

interface RegistrationRecord {
  status: string;
  event_id: number;
  event_title: string;
  updatedAt: number;   // epoch ms — used to pick the fresher value
}

type NotificationType = { show: boolean; message: string; type: "success" | "error" };
type ActiveTab = "details" | "activities" | "posts";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const BASE = getBaseUrl();

const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("access") : null;

/** Unique storage key per family so records never bleed across families */
const storageKey = (familyId: number) => `family_registrations_${familyId}`;

function loadRegistrations(familyId: number): Record<number, RegistrationRecord> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(storageKey(familyId));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveRegistration(familyId: number, record: Omit<RegistrationRecord, "updatedAt">) {
  if (typeof window === "undefined") return;
  const existing = loadRegistrations(familyId);
  existing[record.event_id] = { ...record, updatedAt: Date.now() };
  localStorage.setItem(storageKey(familyId), JSON.stringify(existing));
}

function formatDate(dateString: string) {
  try {
    return new Date(dateString).toLocaleDateString("ar-EG", {
      year: "numeric", month: "long", day: "numeric",
    });
  } catch { return dateString; }
}

function formatTime(dateString: string) {
  try {
    return new Date(dateString).toLocaleTimeString("ar-EG", {
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return ""; }
}

// ─── Registration Status Config ──────────────────────────────────────────────

type StatusConfig = {
  label: string;
  className: string;
  icon: React.ReactNode;
  disabled: boolean;
};

function getStatusConfig(status: string | null | undefined): StatusConfig {
  switch (status) {
    case "مقبول":
      return {
        label: "تم القبول ✓",
        className: "btn-status-accepted",
        icon: <CheckCircle size={16} />,
        disabled: true,
      };
    case "مرفوض":
      return {
        label: "مرفوض",
        className: "btn-status-rejected",
        icon: <XCircle size={16} />,
        disabled: true,
      };
    case "منتظر":
      return {
        label: "قيد المراجعة",
        className: "btn-status-pending",
        icon: <Hourglass size={16} />,
        disabled: true,
      };
    default:
      return {
        label: "تسجيل في الفعالية",
        className: "btn-status-default",
        icon: <Calendar size={16} />,
        disabled: false,
      };
  }
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function Notification({ notification, onClose }: {
  notification: NotificationType;
  onClose: () => void;
}) {
  if (!notification.show) return null;
  return (
    <div className={`notif notif-${notification.type}`}>
      <div className="notif-inner">
        <span className="notif-icon">
          {notification.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
        </span>
        <span className="notif-msg">{notification.message}</span>
      </div>
      <button className="notif-close" onClick={onClose}>×</button>
    </div>
  );
}

function RegisterButton({
  activity,
  registering,
  onRegister,
}: {
  activity: Activity;
  registering: boolean;
  onRegister: () => void;
}) {
  const config = getStatusConfig(activity.registration_status);

  if (registering) {
    return (
      <button className="reg-btn btn-loading" disabled>
        <span className="btn-spinner" />
        جاري التسجيل…
      </button>
    );
  }

  return (
    <button
      className={`reg-btn ${config.className}`}
      disabled={config.disabled}
      onClick={config.disabled ? undefined : onRegister}
    >
      {config.icon}
      {config.label}
    </button>
  );
}

function ActivityCard({
  activity,
  registering,
  onRegister,
}: {
  activity: Activity;
  registering: boolean;
  onRegister: (id: number) => void;
}) {
  return (
    <div className="act-card">
      <div className="act-card-top">
        <span className="act-type-badge">{activity.type || "فعالية"}</span>
        <div className="act-icon-box">
          <Calendar size={18} />
        </div>
      </div>

      <h3 className="act-title">{activity.title}</h3>

      {activity.description && (
        <p className="act-desc">{activity.description}</p>
      )}

      <div className="act-meta">
        <div className="act-meta-item">
          <Clock size={14} />
          <span>{formatDate(activity.st_date)} — {formatDate(activity.end_date)}</span>
        </div>
        {activity.location && (
          <div className="act-meta-item">
            <MapPin size={14} />
            <span>{activity.location}</span>
          </div>
        )}
        {activity.s_limit > 0 && (
          <div className="act-meta-item">
            <Users size={14} />
            <span>الحد الأقصى: {activity.s_limit} عضو</span>
          </div>
        )}
        {activity.cost && parseFloat(activity.cost) > 0 && (
          <div className="act-meta-item">
            <DollarSign size={14} />
            <span>التكلفة: {activity.cost} جنيه</span>
          </div>
        )}
        {activity.reward && (
          <div className="act-meta-item">
            <Award size={14} />
            <span>المكافأة: {activity.reward}</span>
          </div>
        )}
        {activity.restrictions && (
          <div className="act-meta-item">
            <Info size={14} />
            <span>{activity.restrictions}</span>
          </div>
        )}
      </div>

      <RegisterButton
        activity={activity}
        registering={registering}
        onRegister={() => onRegister(activity.event_id)}
      />
    </div>
  );
}

function PostCard({ post, familyTitle }: { post: Post; familyTitle: string }) {
  return (
    <div className="post-card">
      <div className="post-head">
        <div className="post-avatar">
          <UserRound size={22} />
        </div>
        <div className="post-author-info">
          <span className="post-author-name">{familyTitle}</span>
          <div className="post-meta-row">
            <span className="post-role">إدارة الأسرة</span>
            <span className="post-dot">•</span>
            <span className="post-time">{formatDate(post.created_at)} · {formatTime(post.created_at)}</span>
          </div>
        </div>
      </div>
      <div className="post-body">
        <h3 className="post-title">{post.title}</h3>
        <p className="post-content">{post.description}</p>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="empty-state">
      <div className="empty-icon"><BookOpen size={40} /></div>
      <p>{message}</p>
    </div>
  );
}

function LoadingState({ message }: { message: string }) {
  return (
    <div className="loading-state">
      <span className="loading-spinner" />
      <p>{message}</p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const FamilyDetails: React.FC<FamilyDetailsProps> = ({ family, onBack }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("details");
  const [posts, setPosts] = useState<Post[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [registeringId, setRegisteringId] = useState<number | null>(null);
  const [notification, setNotification] = useState<NotificationType>({
    show: false, message: "", type: "success",
  });

  // ── Notification helper ──
  const showNotification = useCallback((message: string, type: "success" | "error" = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "success" }), 4000);
  }, []);

  // ── Merge: API always wins when it has a value; localStorage is offline-only fallback ──
  const mergeWithPersisted = useCallback((raw: Activity[]): Activity[] => {
    const persisted = loadRegistrations(family.id);
    return raw.map(act => {
      const local = persisted[act.event_id] ?? null;

      // API has a real status → it is always fresher than anything we cached
      if (act.registration_status) {
        // Keep localStorage in sync so next offline load shows the right value
        saveRegistration(family.id, {
          status: act.registration_status,
          event_id: act.event_id,
          event_title: act.title,
        });
        return act;
      }

      // API returned null/undefined → use localStorage fallback
      return { ...act, registration_status: local?.status ?? null };
    });
  }, [family.id]);

  // ── Fetch Posts ──
  const fetchPosts = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      setLoadingPosts(true);
      const res = await authFetch(
        `${BASE}/api/family/student/${family.id}/posts/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("فشل تحميل المنشورات");
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : data.results ?? data.posts ?? []);
    } catch (err: unknown) {
      showNotification((err as Error).message, "error");
    } finally {
      setLoadingPosts(false);
    }
  }, [family.id, showNotification]);

  // ── Fetch Activities ──
  const fetchActivities = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      setLoadingActivities(true);
      const res = await authFetch(
        `${BASE}/api/family/student/${family.id}/event_requests/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("فشل تحميل الفعاليات");
      const data = await res.json();
      const raw: Activity[] = Array.isArray(data) ? data : data.results ?? data.events ?? [];
      setActivities(mergeWithPersisted(raw));
    } catch (err: unknown) {
      showNotification((err as Error).message, "error");
    } finally {
      setLoadingActivities(false);
    }
  }, [family.id, mergeWithPersisted, showNotification]);

  // ── Register for Event ──
  const registerForEvent = useCallback(async (eventId: number) => {
    const token = getToken();
    if (!token) { showNotification("انتهت الجلسة، يرجى تسجيل الدخول مجدداً", "error"); return; }

    try {
      setRegisteringId(eventId);
      const res = await authFetch(
        `${BASE}/api/family/student/${family.id}/events/${eventId}/register/`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const errMsg: string = errData.error ?? errData.message ?? errData.detail ?? "";

        // 400 "already registered" → treat as success, persist "منتظر" as fallback status
        if (res.status === 400 && errMsg.toLowerCase().includes("already registered")) {
          const fallbackStatus = "منتظر";
          saveRegistration(family.id, { status: fallbackStatus, event_id: eventId, event_title: "" });
          setActivities(prev =>
            prev.map(act =>
              act.event_id === eventId ? { ...act, registration_status: fallbackStatus } : act
            )
          );
          showNotification("أنت مسجل بالفعل في هذه الفعالية · الحالة: قيد المراجعة", "success");
          return;
        }

        throw new Error(errMsg || "فشل التسجيل في الفعالية");
      }

      const data = await res.json();
      // data shape: { message, event_id, event_title, event_location, event_start_date, event_end_date, registration_status }
      const status: string = data.registration_status ?? "منتظر";

      // Persist so status survives logout / token expiry
      saveRegistration(family.id, {
        status,
        event_id: data.event_id ?? eventId,
        event_title: data.event_title ?? "",
      });

      // Update UI immediately
      setActivities(prev =>
        prev.map(act =>
          act.event_id === eventId ? { ...act, registration_status: status } : act
        )
      );

      showNotification(`${data.message ?? "تم التسجيل بنجاح"} · الحالة: ${status}`, "success");

      // Re-fetch so any future status changes from the server are immediately reflected
      fetchActivities();
    } catch (err: unknown) {
      showNotification((err as Error).message ?? "حصل خطأ أثناء التسجيل", "error");
    } finally {
      setRegisteringId(null);
    }
  }, [family.id, showNotification, fetchActivities]);

  // ── Load data on tab switch ──
  useEffect(() => {
    if (activeTab === "posts" && posts.length === 0) fetchPosts();
    if (activeTab === "activities" && activities.length === 0) fetchActivities();
  }, [activeTab, fetchPosts, fetchActivities, posts.length, activities.length]);

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="fd-page" dir="rtl">

      <Notification
        notification={notification}
        onClose={() => setNotification({ ...notification, show: false })}
      />

      {/* Header */}
      <div className="fd-header-row">
        <button className="fd-back-btn" onClick={onBack}>
          <ArrowRight size={18} />
          العودة
        </button>
        <div className="fd-title-box">
          <h1 className="fd-title">تفاصيل {family.title}</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="fd-tabs">
        {(["details", "activities", "posts"] as ActiveTab[]).map((tab) => {
          const labels: Record<ActiveTab, { label: string; icon: React.ReactNode }> = {
            details:    { label: "التفاصيل",   icon: <Info size={17} /> },
            activities: { label: "الفعاليات",  icon: <Calendar size={17} /> },
            posts:      { label: "المنشورات",  icon: <FileText size={17} /> },
          };
          return (
            <button
              key={tab}
              className={`fd-tab ${activeTab === tab ? "fd-tab-active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {labels[tab].icon}
              {labels[tab].label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="fd-content">

        {/* ── Details ── */}
        {activeTab === "details" && (
          <div className="det-section">
            <div className="det-card">
              <h2 className="det-card-title">
                <Info size={17} />
                معلومات الأسرة
              </h2>
              <div className="det-rows">
                {[
                  { label: "اسم الأسرة",   value: family.title },
                  { label: "الوصف",        value: family.subtitle },
                  family.description ? { label: "التفاصيل", value: family.description } : null,
                  { label: "المكان",       value: family.place },
                  { label: "عدد الأعضاء", value: family.views },
                  { label: "تاريخ الإنشاء", value: family.createdAt },
                  family.deadline ? { label: "الموعد النهائي", value: family.deadline } : null,
                ].filter(Boolean).map((row, i) => (
                  <div key={i} className="det-row">
                    <span className="det-label">{(row as Record<string, unknown>).label as string}</span>
                    <span className="det-value">{(row as Record<string, unknown>).value as string}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="det-card">
              <h2 className="det-card-title">
                <Award size={17} />
                أهداف الأسرة
              </h2>
              <p className="det-goals">{family.goals || family.subtitle}</p>
            </div>
          </div>
        )}

        {/* ── Activities ── */}
        {activeTab === "activities" && (
          <div className="act-section">
            {loadingActivities ? (
              <LoadingState message="جاري تحميل الفعاليات…" />
            ) : activities.length === 0 ? (
              <EmptyState message="لا توجد فعاليات حالياً" />
            ) : (
              <div className="act-grid">
                {activities.map(activity => (
                  <ActivityCard
                    key={activity.event_id}
                    activity={activity}
                    registering={registeringId === activity.event_id}
                    onRegister={registerForEvent}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Posts ── */}
        {activeTab === "posts" && (
          <div className="posts-section">
            {loadingPosts ? (
              <LoadingState message="جاري تحميل المنشورات…" />
            ) : posts.length === 0 ? (
              <EmptyState message="لا توجد منشورات حالياً" />
            ) : (
              <div className="posts-list">
                {posts.map(post => (
                  <PostCard key={post.id} post={post} familyTitle={family.title} />
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default FamilyDetails;

