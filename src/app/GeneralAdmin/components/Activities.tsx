"use client";
import React, { useState } from "react";
import "../Styles/Activities.css";
import { Eye, Check, X, Clock, Calendar, Users, Building2 } from "lucide-react";

interface Activity {
  id: number;
  title: string;
  department: string;
  departmentColor: string;
  submitter: string;
  date: string;
  college: string;
  participants: number;
}

const mockActivities: Activity[] = [
  {
    id: 1,
    title: "مؤتمر التطوير المهني للشباب",
    department: "إدارة الأنشطة الاجتماعية",
    departmentColor: "dept-social",
    submitter: "د. أحمد محمد",
    date: "15-03-2024",
    college: "جميع الكليات",
    participants: 200,
  },
  {
    id: 2,
    title: "ورشة الابتكار التقني",
    department: "إدارة الأنشطة العلمية",
    departmentColor: "dept-science",
    submitter: "د. سارة أحمد",
    date: "14-03-2024",
    college: "الهندسة",
    participants: 150,
  },
  {
    id: 3,
    title: "بطولة الشطرنج الجامعية",
    department: "إدارة الأنشطة الرياضية",
    departmentColor: "dept-sports",
    submitter: "أ. محمد علي",
    date: "13-03-2024",
    college: "جميع الكليات",
    participants: 80,
  },
];

export default function Activities() {
  const [activities, setActivities] = useState<Activity[]>(mockActivities);

  const handleApprove = (id: number) => {
    console.log("Approve:", id);
  };

  const handleReject = (id: number) => {
    console.log("Reject:", id);
  };

  const handleView = (id: number) => {
    console.log("View:", id);
  };

  return (
    <div className="activities-page">
      {/* Section Header */}
      <div className="section-header">
        <div className="section-header-right">
          <h2 className="section-title">طلبات الفعاليات العامة</h2>
          <p className="section-subtitle">الفعاليات المقترحة من مدراء الأقسام في انتظار الموافقة</p>
        </div>
        <div className="pending-badge">
          <Clock size={14} />
          <span>{activities.length} طلب في الانتظار</span>
        </div>
      </div>

      {/* Cards */}
      <div className="activities-list">
        {activities.map((activity) => (
          <div key={activity.id} className="activity-card">
            {/* Card Top Row */}
            <div className="card-top">
              <div className="card-title-row">
                <h3 className="card-title">{activity.title}</h3>
                <span className={`dept-badge ${activity.departmentColor}`}>
                  {activity.department}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="card-actions">
                <button
                  className="btn-reject"
                  onClick={() => handleReject(activity.id)}
                >
                  <X size={15} />
                  <span>رفض</span>
                </button>
                <button
                  className="btn-approve"
                  onClick={() => handleApprove(activity.id)}
                >
                  <Check size={15} />
                  <span>موافقة</span>
                </button>
                <button
                  className="btn-view"
                  onClick={() => handleView(activity.id)}
                >
                  <Eye size={15} />
                  <span>عرض التفاصيل</span>
                </button>
              </div>
            </div>

            {/* Card Meta Grid */}
            <div className="card-meta">
              <div className="meta-item">
                <Users size={14} className="meta-icon" />
                <span className="meta-label">مقدم بواسطة:</span>
                <span className="meta-value">{activity.submitter}</span>
              </div>
              <div className="meta-item">
                <Calendar size={14} className="meta-icon" />
                <span className="meta-label">تاريخ التقديم:</span>
                <span className="meta-value">{activity.date}</span>
              </div>
              <div className="meta-item">
                <Users size={14} className="meta-icon" />
                <span className="meta-label">المشاركون المتوقعون:</span>
                <span className="meta-value participants">{activity.participants}</span>
              </div>
              <div className="meta-item">
                <Building2 size={14} className="meta-icon" />
                <span className="meta-label">الكلية:</span>
                <span className="meta-value">{activity.college}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}