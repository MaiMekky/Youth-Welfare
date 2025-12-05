"use client";

import React, { useMemo } from "react";
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
  role: "عضو" | "مساعد" | "مؤسس";
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
  members: Member[];
  activities: Activity[];
}

// Dummy data for fallback
const dummyMembers: Member[] = [
  {
    id: 1,
    name: "أحمد محمد علي",
    college: "كلية الهندسة",
    role: "مؤسس",
  },
  {
    id: 2,
    name: "فاطمة أحمد حسن",
    college: "كلية العلوم",
    role: "مساعد",
  },
  {
    id: 3,
    name: "محمود خالد سعيد",
    college: "كلية التجارة",
    role: "عضو",
  },
  {
    id: 4,
    name: "سارة عبدالله إبراهيم",
    college: "كلية الآداب",
    role: "مساعد",
  },
  {
    id: 5,
    name: "محمد حسن علي",
    college: "كلية الهندسة",
    role: "عضو",
  },
];

const dummyActivities: Activity[] = [
  {
    id: 1,
    title: "اجتماع دوري للأسرة",
    type: "اجتماع",
    date: "2024-12-10",
    time: "14:00",
    status: "قادمة",
    color: "#4CAF50",
  },
  {
    id: 2,
    title: "مسابقة البرمجة السنوية",
    type: "مسابقة",
    date: "2024-12-15",
    time: "10:00",
    status: "قادمة",
    color: "#2196F3",
  },
  {
    id: 3,
    title: "ورشة عمل React و TypeScript",
    type: "ورشة عمل",
    date: "2024-11-30",
    time: "16:00",
    status: "مكتملة",
    color: "#FF9800",
  },
  {
    id: 4,
    title: "رحلة ترفيهية",
    type: "رحلة",
    date: "2024-11-25",
    time: "08:00",
    status: "مكتملة",
    color: "#9C27B0",
  },
  {
    id: 5,
    title: "محاضرة الذكاء الاصطناعي",
    type: "محاضرة",
    date: "2024-12-20",
    time: "18:00",
    status: "قادمة",
    color: "#F44336",
  },
];

const Overview: React.FC<OverviewProps> = ({ members, activities }) => {
  // Use passed data or fall back to dummy data
  const displayMembers = members && members.length > 0 ? members : dummyMembers;
  const displayActivities = activities && activities.length > 0 ? activities : dummyActivities;

  // Calculate statistics
  const statistics = useMemo(() => {
    const totalMembers = displayMembers.length;
    const totalActivities = displayActivities.length;
    const upcomingActivities = displayActivities.filter((a) => a.status === "قادمة").length;
    const completedActivities = displayActivities.filter((a) => a.status === "مكتملة").length;

    return {
      totalMembers,
      totalActivities,
      upcomingActivities,
      completedActivities,
    };
  }, [displayMembers, displayActivities]);

  // Get recent members (limit to 5)
  const recentMembers = useMemo(() => {
    return displayMembers.slice(0, 5);
  }, [displayMembers]);

  // Get recent activities (limit to 5)
  const recentActivities = useMemo(() => {
    return displayActivities.slice(0, 5);
  }, [displayActivities]);

  return (
    <div className="overview-wrapper">
      {/* STATISTICS SECTION */}
      <div className="statistics-section">
        <h2 className="statistics-title">الإحصائيات</h2>
        <div className="statistics-grid">
          <div className="stat-card">
            <div className="stat-icon members-icon">
              <Users size={28} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{statistics.totalMembers}</div>
              <div className="stat-label">إجمالي الأعضاء</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon activities-icon">
              <Calendar size={28} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{statistics.totalActivities}</div>
              <div className="stat-label">إجمالي الفعاليات</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon upcoming-icon">
              <Clock size={28} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{statistics.upcomingActivities}</div>
              <div className="stat-label">فعاليات قادمة</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon completed-icon">
              <CheckCircle size={28} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{statistics.completedActivities}</div>
              <div className="stat-label">فعاليات مكتملة</div>
            </div>
          </div>
        </div>
      </div>

      {/* MEMBERS AND ACTIVITIES GRID */}
      <div className="overview-container">
        {/* LEFT — Active Members */}
        <div className="overview-card members-card">
          <div className="section-header">
            <Users size={24} />
            <h3>أعضاء نشطين</h3>
          </div>

          <div className="members-list">
            {recentMembers.map((member) => (
              <div key={member.id} className="member-item">
                <div className="member-info">
                  <UserCircle size={36} className="member-avatar" />
                  <div>
                    <p className="member-name">{member.name}</p>
                    {member.college && (
                      <p className="member-college">{member.college}</p>
                    )}
                  </div>
                </div>

                <span
                  className={
                    member.role === "مؤسس"
                      ? "role-badge founder"
                      : member.role === "مساعد"
                      ? "role-badge assistant"
                      : "role-badge member"
                  }
                >
                  {member.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Recent Activities */}
        <div className="overview-card activities-card">
          <div className="section-header">
            <Calendar size={24} />
            <h3>الفعاليات الأخيرة</h3>
          </div>

          <div className="activities-list">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="activity-item">
                {/* Status Badge */}
                <span
                  className={
                    activity.status === "قادمة"
                      ? "status-badge upcoming"
                      : "status-badge done"
                  }
                >
                  {activity.status}
                </span>

                {/* Title */}
                <div className="activity-info">
                  <p className="activity-title">{activity.title}</p>
                  <p className="activity-time">
                    {activity.time} - {activity.date}
                  </p>
                </div>

                {/* Icon */}
                <div
                  className="activity-icon"
                  style={{ backgroundColor: activity.color || "#4CAF50" }}
                >
                  {activity.type === "ورشة عمل" && <BookOpen size={22} />}
                  {activity.type === "اجتماع" && <Users size={22} />}
                  {activity.type === "مسابقة" && <Trophy size={22} />}
                  {activity.type === "تطوع" && <Handshake size={22} />}
                  {activity.type === "محاضرة" && <BookOpen size={22} />}
                  {!["ورشة عمل", "اجتماع", "مسابقة", "تطوع", "محاضرة"].includes(
                    activity.type
                  ) && <Calendar size={22} />}
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
