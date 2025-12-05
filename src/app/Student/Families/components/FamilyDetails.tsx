"use client";
import React, { useState } from "react";
import { ArrowRight, Users, Calendar, FileText, UserRound, Clock, MapPin, Briefcase } from "lucide-react";
import "../styles/FamilyDetails.css";

interface FamilyDetailsProps {
  family: {
    id: number;
    title: string;
    subtitle: string;
    place: string;
    views: string;
    createdAt: string;
    deadline?: string;
    goals: string;
    description?: string;
    image?: string;
  };
  onBack: () => void;
}

interface Member {
  id: number;
  name: string;
  joinedAt: string;
  role: "عضو" | "مساعد" | "مؤسس";
}

interface Activity {
  id: number;
  title: string;
  type: string;
  date: string;
  time: string;
  location: string;
  description: string;
  participants: string;
  status: "قادمة" | "مكتملة";
  color: string;
}

interface Post {
  id: number;
  author: string;
  role: string;
  time: string;
  date: string;
  title: string;
  content: string;
  type: "Post" | "Reminder";
}

const FamilyDetails: React.FC<FamilyDetailsProps> = ({ family, onBack }) => {
  const [activeTab, setActiveTab] = useState<"details" | "members" | "activities" | "posts">("details");

  // Dummy data - replace with API calls later
  const members: Member[] = [
    { id: 1, name: "أحمد محمد علي", joinedAt: "2024-01-15", role: "مؤسس" },
    { id: 2, name: "فاطمة أحمد حسن", joinedAt: "2024-02-20", role: "مساعد" },
    { id: 3, name: "محمود خالد سعيد", joinedAt: "2024-03-10", role: "عضو" },
    { id: 4, name: "سارة عبدالله إبراهيم", joinedAt: "2024-03-15", role: "مساعد" },
    { id: 5, name: "محمد حسن علي", joinedAt: "2024-04-01", role: "عضو" },
    { id: 6, name: "نور الدين يوسف", joinedAt: "2024-04-10", role: "عضو" },
  ];

  const activities: Activity[] = [
    {
      id: 1,
      title: "اجتماع دوري للأسرة",
      type: "اجتماع",
      date: "2024-12-10",
      time: "14:00",
      location: "قاعة المؤتمرات",
      description: "مناقشة خطة العمل للشهر القادم والمشاريع الجديدة",
      participants: "25 عضو",
      status: "قادمة",
      color: "#4CAF50",
    },
    {
      id: 2,
      title: "مسابقة البرمجة السنوية",
      type: "مسابقة",
      date: "2024-12-15",
      time: "10:00",
      location: "معمل الحاسب الآلي",
      description: "مسابقة حل المشكلات البرمجية باستخدام Python و Java",
      participants: "40 عضو",
      status: "قادمة",
      color: "#2196F3",
    },
    {
      id: 3,
      title: "ورشة عمل React و TypeScript",
      type: "ورشة عمل",
      date: "2024-11-30",
      time: "16:00",
      location: "القاعة الكبرى",
      description: "تعلم أساسيات React و TypeScript وبناء تطبيقات حديثة",
      participants: "30 عضو",
      status: "مكتملة",
      color: "#FF9800",
    },
  ];

  const posts: Post[] = [
    {
      id: 1,
      author: "أحمد محمد علي",
      role: "مؤسس الأسرة",
      time: "10:30",
      date: "2025-01-10",
      title: "أهلاً بكم في " + family.title + "!",
      content: "مرحباً بجميع الأعضاء الجدد والقدامى في أسرتنا. نحن سعداء بوجودكم معنا ونتطلع إلى تحقيق إنجازات كبيرة معًا.",
      type: "Post",
    },
    {
      id: 2,
      author: "أحمد محمد علي",
      role: "مؤسس الأسرة",
      time: "14:20",
      date: "2025-01-12",
      title: "تذكير: اجتماع شهري",
      content: "تذكركم بالاجتماع الشهري يوم 15 يناير الساعة 2 مساء في " + family.place + ".",
      type: "Reminder",
    },
  ];

  return (
    <div className="family-details-page" dir="rtl">
      {/* Header with Back Button */}
      <div className="details-header-wrapper">
        <button onClick={onBack} className="back-button">
          <ArrowRight size={20} />
          العودة
        </button>
        <div className="details-header">
          <h1 className="details-title">تفاصيل {family.title}</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="details-tabs">
        <button
          className={`tab ${activeTab === "details" ? "active" : ""}`}
          onClick={() => setActiveTab("details")}
        >
          <FileText size={18} />
          التفاصيل
        </button>
        <button
          className={`tab ${activeTab === "members" ? "active" : ""}`}
          onClick={() => setActiveTab("members")}
        >
          <Users size={18} />
          الأعضاء ({members.length})
        </button>
        <button
          className={`tab ${activeTab === "activities" ? "active" : ""}`}
          onClick={() => setActiveTab("activities")}
        >
          <Calendar size={18} />
          الفعاليات ({activities.length})
        </button>
        <button
          className={`tab ${activeTab === "posts" ? "active" : ""}`}
          onClick={() => setActiveTab("posts")}
        >
          <FileText size={18} />
          المنشورات ({posts.length})
        </button>
      </div>

      {/* Content */}
      <div className="details-content">
        {activeTab === "details" && (
          <div className="details-section">
            <div className="detail-card">
              <h2 className="section-title">معلومات الأسرة</h2>
              <div className="detail-info">
                <div className="info-row">
                  <span className="info-label">اسم الأسرة:</span>
                  <span className="info-value">{family.title}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">الوصف:</span>
                  <span className="info-value">{family.subtitle}</span>
                </div>
                {family.description && (
                  <div className="info-row">
                    <span className="info-label">التفاصيل:</span>
                    <span className="info-value">{family.description}</span>
                  </div>
                )}
                <div className="info-row">
                  <span className="info-label">المكان:</span>
                  <span className="info-value">{family.place}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">عدد الأعضاء:</span>
                  <span className="info-value">{family.views}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">تاريخ الإنشاء:</span>
                  <span className="info-value">{family.createdAt}</span>
                </div>
                {family.deadline && (
                  <div className="info-row">
                    <span className="info-label">الموعد النهائي:</span>
                    <span className="info-value">{family.deadline}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="detail-card">
              <h2 className="section-title">أهداف الأسرة</h2>
              <p className="goals-text">{family.goals}</p>
            </div>
          </div>
        )}

        {activeTab === "members" && (
          <div className="members-section">
            <div className="members-grid">
              {members.map((member) => (
                <div key={member.id} className="member-card">
                  <div className="member-header">
                    <div className="member-avatar">
                      <UserRound size={24} color="#5a67d8" />
                    </div>
                    <div className="member-info">
                      <h3 className="member-name">{member.name}</h3>
                      <p className="member-joined">انضم في: {member.joinedAt}</p>
                    </div>
                  </div>
                  <div
                    className={`member-role-badge ${
                      member.role === "مؤسس"
                        ? "founder"
                        : member.role === "مساعد"
                        ? "assistant"
                        : "member"
                    }`}
                  >
                    {member.role}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "activities" && (
          <div className="activities-section">
            <div className="activities-grid">
              {activities.map((activity) => (
                <div key={activity.id} className="activity-card">
                  <div className="activity-header">
                    <span
                      className={`activity-status ${
                        activity.status === "قادمة" ? "upcoming" : "completed"
                      }`}
                    >
                      {activity.status}
                    </span>
                    <div
                      className="activity-icon"
                      style={{ backgroundColor: activity.color }}
                    >
                      {activity.type === "اجتماع" ? (
                        <Users size={18} color="#fff" />
                      ) : activity.type === "مسابقة" ? (
                        <Calendar size={18} color="#fff" />
                      ) : (
                        <Briefcase size={18} color="#fff" />
                      )}
                    </div>
                  </div>
                  <h3 className="activity-title">{activity.title}</h3>
                  <p className="activity-description">{activity.description}</p>
                  <div className="activity-details">
                    <div className="activity-detail-item">
                      <Clock size={16} />
                      <span>{activity.date} - {activity.time}</span>
                    </div>
                    <div className="activity-detail-item">
                      <MapPin size={16} />
                      <span>{activity.location}</span>
                    </div>
                    <div className="activity-detail-item">
                      <Users size={16} />
                      <span>{activity.participants}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "posts" && (
          <div className="posts-section">
            <div className="posts-list">
              {posts.map((post) => (
                <div key={post.id} className="post-card">
                  <div className="post-header">
                    <div className="post-author">
                      <div className="author-avatar">
                        <UserRound size={20} color="#5a67d8" />
                      </div>
                      <div className="author-info">
                        <h4 className="author-name">{post.author}</h4>
                        <span className="author-role">{post.role}</span>
                      </div>
                    </div>
                    <span className="post-date">
                      {post.date} · {post.time}
                    </span>
                  </div>
                  <div className="post-body">
                    <h3 className="post-title">{post.title}</h3>
                    <p className="post-content">{post.content}</p>
                  </div>
                  {post.type === "Reminder" && (
                    <div className="post-type-badge reminder">تذكير</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FamilyDetails;

