'use client';
import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  Calendar,
  UserCircle,
  Trophy,
  BookOpen,
  Handshake,
  Clock,
  CheckCircle,
} from "lucide-react";
import "../styles/overview.css";

interface Member {
  id: number;
  name: string;
  college?: string;
  role: string;
}

interface Activity {
  id: number;
  title: string;
  type: string;
  date: string;
  time: string;
  status: "قادمة" | "مكتملة";
  color: string;
}

interface OverviewProps {
  familyId: number;
}

const Overview: React.FC<OverviewProps> = ({ familyId }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("access") : null;

  useEffect(() => {
    if (!token) {
      setError("غير مصرح");
      setLoading(false);
      return;
    }

    const fetchDashboard = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `http://127.0.0.1:8000/api/family/student/14/dashboard/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("فشل تحميل بيانات الأسرة");

        const data = await res.json();

        // أعضاء الأسرة من leadership
        const allMembers: Member[] = [
          ...(data.leadership.president ? [{
            id: data.leadership.president.student_id,
            name: data.leadership.president.name,
            role: data.leadership.president.role
          }] : []),
          ...(data.leadership.vice_president ? [{
            id: data.leadership.vice_president.student_id,
            name: data.leadership.vice_president.name,
            role: data.leadership.vice_president.role
          }] : []),
          ...(data.leadership.committee_heads?.map((m: any) => ({
            id: m.student_id,
            name: m.name,
            role: m.role,
          })) || []),
          ...(data.leadership.committee_assistants?.map((m: any) => ({
            id: m.student_id,
            name: m.name,
            role: m.role,
          })) || []),
        ];

        setMembers(allMembers);

        // Recent activities
        const recentActivities: Activity[] = (data.recent_activities || []).map((act: any) => ({
          id: act.id,
          title: act.title,
          type: act.type || "اجتماع",
          date: act.date || "",
          time: act.time || "",
          status: act.status || "قادمة",
          color: act.color || "#4CAF50",
        }));

        setActivities(recentActivities);

      } catch (err: any) {
        setError(err.message || "حصل خطأ أثناء تحميل البيانات");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [familyId, token]);

  // إحصائيات
  const statistics = useMemo(() => {
    const totalMembers = members.length;
    const totalActivities = activities.length;
    const upcomingActivities = activities.filter(a => a.status === "قادمة").length;
    const completedActivities = activities.filter(a => a.status === "مكتملة").length;
    return { totalMembers, totalActivities, upcomingActivities, completedActivities };
  }, [members, activities]);

  const recentMembers = useMemo(() => members.slice(0, 5), [members]);
  const recentActivities = useMemo(() => activities.slice(0, 5), [activities]);

  if (loading) return <p>جاري التحميل...</p>;
  if (error) return <p className="error-box">{error}</p>;

  return (
    <div className="overview-wrapper">
      {/* إحصائيات */}
      <div className="statistics-section">
        <h2 className="statistics-title">الإحصائيات</h2>
        <div className="statistics-grid">
          <div className="stat-card">
            <div className="stat-icon members-icon"><Users size={28} /></div>
            <div className="stat-content">
              <div className="stat-value">{statistics.totalMembers}</div>
              <div className="stat-label">إجمالي الأعضاء</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon activities-icon"><Calendar size={28} /></div>
            <div className="stat-content">
              <div className="stat-value">{statistics.totalActivities}</div>
              <div className="stat-label">إجمالي الفعاليات</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon upcoming-icon"><Clock size={28} /></div>
            <div className="stat-content">
              <div className="stat-value">{statistics.upcomingActivities}</div>
              <div className="stat-label">فعاليات قادمة</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon completed-icon"><CheckCircle size={28} /></div>
            <div className="stat-content">
              <div className="stat-value">{statistics.completedActivities}</div>
              <div className="stat-label">فعاليات مكتملة</div>
            </div>
          </div>
        </div>
      </div>

      {/* أعضاء وفعاليات */}
      <div className="overview-container">
        <div className="overview-card members-card">
          <div className="section-header"><Users size={24} /><h3>أعضاء نشطين</h3></div>
          <div className="members-list">
            {recentMembers.map(member => (
              <div key={member.id} className="member-item">
                <div className="member-info">
                  <UserCircle size={36} className="member-avatar" />
                  <div>
                    <p className="member-name">{member.name}</p>
                    <p className="member-role">{member.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="overview-card activities-card">
          <div className="section-header"><Calendar size={24} /><h3>الفعاليات الأخيرة</h3></div>
          <div className="activities-list">
            {recentActivities.map(activity => (
              <div key={activity.id} className="activity-item">
                <span className={activity.status === "قادمة" ? "status-badge upcoming" : "status-badge done"}>
                  {activity.status}
                </span>
                <div className="activity-info">
                  <p className="activity-title">{activity.title}</p>
                  <p className="activity-time">{activity.time} - {activity.date}</p>
                </div>
                <div className="activity-icon" style={{ backgroundColor: activity.color }}>
                  {activity.type === "ورشة عمل" && <BookOpen size={22} />}
                  {activity.type === "اجتماع" && <Users size={22} />}
                  {activity.type === "مسابقة" && <Trophy size={22} />}
                  {activity.type === "تطوع" && <Handshake size={22} />}
                  {activity.type === "محاضرة" && <BookOpen size={22} />}
                  {!["ورشة عمل","اجتماع","مسابقة","تطوع","محاضرة"].includes(activity.type) && <Calendar size={22} />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
