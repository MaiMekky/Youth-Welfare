"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowRight, Users, Calendar, FileText, UserRound,
  Clock, MapPin, CheckCircle, Hourglass, XCircle,
  BookOpen, DollarSign, Award, AlertCircle, Info,
} from "lucide-react";
import "./FamilyDetails.css";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";
import { useToast } from "@/app/context/ToastContext";

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

// Matches the exact API response shape from GET /api/family/student/{id}/event_requests/
interface StudentParticipation {
  is_registered: boolean;
  status: string | null; // "منتظر" | "مقبول" | "مرفوض" | null
  rank: number | null;
  reward: string | null;
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
  status: string;                              // event status (open/closed/etc.)
  family: number;
  family_name: string;
  faculty: number;
  faculty_name: string;
  dept_id: number;
  created_by: number;
  created_by_admin_info: string;
  created_by_student_info: string;
  current_student_participation: StudentParticipation | null; // student's registration status
  created_at: string;
  updated_at: string;
}

type ActiveTab = "details" | "activities" | "posts";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const BASE = getBaseUrl();

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

function isPastEvent(activity: Activity): boolean {
  try {
    return new Date(activity.end_date) < new Date();
  } catch {
    return false;
  }
}

function parseErrorDetails(raw: string): string[] {
  const matches = raw.match(/string='([^']+)'/g) ?? [];
  return matches.map(m => m.replace("string='", "").replace(/'\s*$/, ""));
}

function isFacultyMismatchError(messages: string[]): boolean {
  return messages.some(m =>
    /this event is only for .+ faculty/i.test(m) ||
    /هذه الفعالية فقط لكلية/i.test(m)
  );
}

function isPastEventError(messages: string[]): boolean {
  return messages.some(m =>
    /cannot register for past events/i.test(m) ||
    /الفعالية انتهت/i.test(m)
  );
}

// ─── Registration Status Config ───────────────────────────────────────────────

type StatusConfig = {
  label: string;
  className: string;
  icon: React.ReactNode;
  disabled: boolean;
};

/**
 * Maps current_student_participation object from the API to button config.
 * status values: null → not registered | "منتظر" → pending | "مقبول" → accepted | "مرفوض" → rejected
 */
function getStatusConfig(participation: StudentParticipation | null | undefined): StatusConfig {
  const status = participation?.status ?? null;

  switch (status) {
    case "مقبول":
      return {
        label: "تم القبول",
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
        label: "قيد الانتظار",
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

// ─── Sub-components ───────────────────────────────────────────────────────────

function RegisterButton({
  activity,
  registering,
  onRegister,
}: {
  activity: Activity;
  registering: boolean;
  onRegister: () => void;
}) {
  const config = getStatusConfig(activity.current_student_participation);

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
      {/* Title row: title on right, badge on left */}
      <div className="act-card-header">
        <h3 className="act-title">{activity.title}</h3>
        <span className="act-type-badge">{activity.type || "فعالية"}</span>
      </div>

      {/* Description */}
      {activity.description && (
        <p className="act-desc">{activity.description}</p>
      )}

      {/* Divider */}
      <div className="act-divider" />

      {/* Meta info */}
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
          <div className="act-meta-item act-meta-reward">
            <Award size={14} />
            <span>المكافأة: {activity.reward}</span>
          </div>
        )}
        {activity.restrictions && (
          <div className="act-meta-item act-meta-restriction">
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
  const { showToast } = useToast();

  // ── Fetch posts ────────────────────────────────────────────────────────────

  const fetchPosts = useCallback(async () => {
    try {
      setLoadingPosts(true);
      const res = await authFetch(`${BASE}/api/family/student/${family.id}/posts/`);
      if (!res.ok) throw new Error("فشل تحميل المنشورات");
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : data.results ?? data.posts ?? []);
    } catch (err: unknown) {
      showToast((err as Error).message, "error");
    } finally {
      setLoadingPosts(false);
    }
  }, [family.id, showToast]);

  // ── Fetch activities ───────────────────────────────────────────────────────

  const fetchActivities = useCallback(async () => {
    try {
      setLoadingActivities(true);
      const res = await authFetch(`${BASE}/api/family/student/${family.id}/event_requests/`);
      if (!res.ok) throw new Error("فشل تحميل الفعاليات");
      const data = await res.json();
      const raw: Activity[] = Array.isArray(data) ? data : data.results ?? data.events ?? [];
      // Filter out already-ended events
      setActivities(raw.filter(act => !isPastEvent(act)));
    } catch (err: unknown) {
      showToast((err as Error).message, "error");
    } finally {
      setLoadingActivities(false);
    }
  }, [family.id, showToast]);

  // ── Register for event ─────────────────────────────────────────────────────

  const registerForEvent = useCallback(async (eventId: number) => {
    try {
      setRegisteringId(eventId);

      const res = await authFetch(
        `${BASE}/api/family/student/${family.id}/events/${eventId}/register/`,
        { method: "POST", headers: { "Content-Type": "application/json" } }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const rawErrString: string =
          typeof errData === "string"
            ? errData
            : JSON.stringify(errData.error ?? errData.message ?? errData.detail ?? errData ?? "");

        const errMessages = parseErrorDetails(rawErrString);
        const flatMsg = errMessages.join(" ").toLowerCase() || rawErrString.toLowerCase();

        // Silently remove events this student isn't eligible for
        if (res.status === 400 && isFacultyMismatchError(errMessages)) {
          setActivities(prev => prev.filter(act => act.event_id !== eventId));
          return;
        }

        if (res.status === 400 && isPastEventError(errMessages)) {
          setActivities(prev => prev.filter(act => act.event_id !== eventId));
          return;
        }

        // Already registered → reflect pending state optimistically
        if (res.status === 400 && flatMsg.includes("already registered")) {
          setActivities(prev =>
            prev.map(act =>
              act.event_id === eventId
                ? {
                    ...act,
                    current_student_participation: {
                      is_registered: true,
                      status: "منتظر",
                      rank: null,
                      reward: null,
                    },
                  }
                : act
            )
          );
          showToast("أنت مسجل بالفعل — قيد المراجعة", "info");
          return;
        }

        const displayMsg =
          errMessages[0] ||
          (errData.error ?? errData.message ?? errData.detail ?? "فشل التسجيل في الفعالية");
        throw new Error(displayMsg);
      }

      // Success: re-fetch to get the real status from the server
      await res.json().catch(() => ({}));
      await fetchActivities();
      showToast("تم ارسال طلبك بنجاح", "success");

    } catch (err: unknown) {
      showToast((err as Error).message ?? "فشل التسجيل، حاول مرة أخرى", "error");
    } finally {
      setRegisteringId(null);
    }
  }, [family.id, showToast, fetchActivities]);

  // ── Tab-driven data loading ────────────────────────────────────────────────

  useEffect(() => {
    if (activeTab === "posts" && posts.length === 0) fetchPosts();
    if (activeTab === "activities" && activities.length === 0) fetchActivities();
  }, [activeTab, fetchPosts, fetchActivities, posts.length, activities.length]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="fd-page" dir="rtl">

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
                  { label: "اسم الأسرة",    value: family.title },
                  { label: "الوصف",         value: family.subtitle },
                  family.description ? { label: "التفاصيل", value: family.description } : null,
                  { label: "المكان",        value: family.place },
                  { label: "عدد الأعضاء",  value: family.views },
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
              <EmptyState message="لا توجد فعاليات متاحة حالياً" />
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
                {posts.map((post, index) => (
                  <PostCard key={post.id ?? `post-${index}`} post={post} familyTitle={family.title} />
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