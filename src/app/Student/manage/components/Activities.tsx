"use client";
import React, { useState, useEffect } from "react";
import "../styles/Activities.css";
import { Calendar, Users, Briefcase, MapPin, Clock } from "lucide-react";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";

interface Activity {
  id: number;
  title: string;
  type: string;
  date: string;
  time: string;
  location: string;
  description: string;
  participants: string;
  status: "قادمة" | "مكتملة" | "منتظر";
  color: string;
  createdBy?: string;
}

interface Department {
  dept_id: number;
  name: string;
}

interface ApiEventRequest {
  event_id: number;
  title: string;
  description: string;
  type: string;
  st_date: string;
  end_date: string;
  location: string;
  s_limit?: number;
  cost?: number | string | null;
  restrictions?: string;
  reward?: string;
  status?: string;
  family?: number;
  family_name?: string;
  faculty?: number;
  faculty_name?: string;
  dept_id?: number;
  created_by?: number;
  created_by_admin_info?: string | {
    admin_id: number;
    name: string;
    email: string;
    role: string;
  };
  created_by_student_info?: string | {
    student_id: number;
    name: string;
    email: string;
  };
  created_at?: string;
  updated_at?: string;
}

interface Family {
  family_id: number;
  name: string;
  description: string;
  faculty_name: string | null;
  type: string;
  status: string;
  role: string;
  member_status: string;
  joined_at: string;
  member_count: number;
}

interface ActivitiesProps {
  refreshTrigger?: number;
}

const mapApiActivityToActivity = (apiEvent: ApiEventRequest): Activity => {
  const colors = ["#4CAF50", "#2196F3", "#FF9800", "#9C27B0", "#F44336", "#00BCD4"];
  const colorIndex = Math.abs(apiEvent.event_id) % colors.length;

  let status: "قادمة" | "مكتملة" | "منتظر" = "قادمة";
  if (apiEvent.status === "منتظر" || apiEvent.status === "pending") {
    status = "منتظر";
  } else if (apiEvent.status === "approved" || apiEvent.status === "مكتملة") {
    status = "مكتملة";
  }

  let createdBy = "";
  if (apiEvent.created_by_admin_info) {
    createdBy = typeof apiEvent.created_by_admin_info === "string"
      ? apiEvent.created_by_admin_info
      : apiEvent.created_by_admin_info.name;
  } else if (apiEvent.created_by_student_info) {
    createdBy = typeof apiEvent.created_by_student_info === "string"
      ? apiEvent.created_by_student_info
      : apiEvent.created_by_student_info.name;
  }

  let time = "00:00";
  let date = apiEvent.st_date;
  if (apiEvent.st_date.includes("T")) {
    const [datePart, timePart] = apiEvent.st_date.split("T");
    date = datePart;
    time = timePart.substring(0, 5);
  }

  return {
    id: apiEvent.event_id,
    title: apiEvent.title,
    type: apiEvent.type,
    date,
    time,
    location: apiEvent.location,
    description: apiEvent.description,
    participants: apiEvent.s_limit ? `${apiEvent.s_limit} عضو` : "غير محدد",
    status,
    color: colors[colorIndex],
    createdBy,
  };
};

const Activities: React.FC<ActivitiesProps> = ({ refreshTrigger = 0 }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deptMap, setDeptMap] = useState<Record<number, string>>({});
  const [selectedFamilyId, setSelectedFamilyId] = useState<number | null>(null);

  useEffect(() => {
    const fetchFamilyId = async () => {
      try {
        const baseUrl = getBaseUrl();
        const res = await authFetch(`${baseUrl}/api/family/student/families/`);
        if (!res.ok) throw new Error("فشل تحميل قائمة الأسر");
        const response = await res.json();

        let families: Family[] = [];
        if (Array.isArray(response)) families = response;
        else if (response.data && Array.isArray(response.data)) families = response.data;
        else if (response.results && Array.isArray(response.results)) families = response.results;
        else if (response.families && Array.isArray(response.families)) families = response.families;

        if (families.length === 0) { setError("لا توجد أسر متاحة"); setLoading(false); return; }

        const elderBrotherFamily = families.find(f => f.role === "أخ أكبر");
        if (elderBrotherFamily) {
          setSelectedFamilyId(elderBrotherFamily.family_id);
        } else {
          setError("لا توجد أسرة بدور 'أخ أكبر'");
          setLoading(false);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "حصل خطأ أثناء تحميل قائمة الأسر");
        setLoading(false);
      }
    };
    fetchFamilyId();
  }, []);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const baseUrl = getBaseUrl();
        const response = await authFetch(`${baseUrl}/api/family/departments/`);
        if (response.ok) {
          const data = await response.json();
          let depts: Department[] = [];
          if (Array.isArray(data)) depts = data;
          else if (data?.departments && Array.isArray(data.departments)) depts = data.departments;
          else if (data?.results && Array.isArray(data.results)) depts = data.results;
          const map: Record<number, string> = {};
          depts.forEach(dept => { map[dept.dept_id] = dept.name; });
          setDeptMap(map);
        }
      } catch { /* silent */ }
    };
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (!selectedFamilyId) return;
    const fetchActivities = async () => {
      try {
        setLoading(true);
        setError(null);
        const baseUrl = getBaseUrl();
        const endpoint = `${baseUrl}/api/family/student/${selectedFamilyId}/event_requests/`;
        const response = await authFetch(endpoint, { method: "GET", headers: { "Content-Type": "application/json" } });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();

        let eventsArray: ApiEventRequest[] = [];
        if (Array.isArray(data)) eventsArray = data;
        else if (data?.event_requests && Array.isArray(data.event_requests)) eventsArray = data.event_requests;
        else if (data?.events && Array.isArray(data.events)) eventsArray = data.events;
        else if (data?.results && Array.isArray(data.results)) eventsArray = data.results;
        else if (data?.data && Array.isArray(data.data)) eventsArray = data.data;
        else { for (const key of Object.keys(data)) { if (Array.isArray(data[key])) { eventsArray = data[key]; break; } } }

        setActivities(eventsArray.map(e => mapApiActivityToActivity(e)));
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "فشل في تحميل الفعاليات");
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, [selectedFamilyId, refreshTrigger, deptMap]);

  return (
    <div className="activities-page" dir="rtl">
      <div className="activities-container">

        {/* ── Page Header (exact same style as Posts) ── */}
        <div className="page-header-block">
          <h1 className="page-title">الفعاليات والأنشطة</h1>
        
        </div>

        <div className="section-body">
          {loading && (
            <div className="loading-state">
              <div className="spinner" />
              <span className="loading-text">جاري تحميل الفعاليات...</span>
            </div>
          )}

          {error && !loading && (
            <div className="error-msg">⚠️ {error}</div>
          )}

          {!loading && !error && activities.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">🗓️</div>
              <p className="empty-text">لا توجد فعاليات متاحة حالياً</p>
            </div>
          )}

          {!loading && !error && activities.length > 0 && (
            <div className="activities-grid">
              {activities.map((act) => (
                <div key={act.id} className="activity-card">
                  {/* Colored top accent bar */}
                  <div className="card-accent" style={{ backgroundColor: act.color }} />

                  <div className="card-inner">
                    {/* Header row: status badge + type icon */}
                    <div className="activity-header">
                      <span className={`activity-status ${
                        act.status === "قادمة" ? "status-upcoming" :
                        act.status === "منتظر" ? "status-pending" :
                        "status-done"
                      }`}>
                        {act.status}
                      </span>
                      <div className="activity-type-icon" style={{ backgroundColor: act.color }}>
                        {act.type.includes("اجتماع") ? (
                          <Users size={18} color="#fff" />
                        ) : act.type.includes("مسابقة") ? (
                          <Calendar size={18} color="#fff" />
                        ) : (
                          <Briefcase size={18} color="#fff" />
                        )}
                      </div>
                    </div>

                    {/* Type label */}
                    <span className="activity-type-label">{act.type}</span>

                    {/* Title */}
                    <h3 className="activity-title">{act.title}</h3>

                    {/* Description */}
                    <p className="activity-desc">{act.description}</p>

                    {/* Divider */}
                    <div className="card-divider" />

                    {/* Info rows */}
                    <div className="activity-info">
                      <div className="info-item">
                        <Calendar size={14} />
                        <span>{act.date}</span>
                      </div>
                      <div className="info-item">
                        <Clock size={14} />
                        <span>{act.time}</span>
                      </div>
                      <div className="info-item">
                        <MapPin size={14} />
                        <span>{act.location}</span>
                      </div>
                      <div className="info-item">
                        <Users size={14} />
                        <span>{act.participants}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Activities;