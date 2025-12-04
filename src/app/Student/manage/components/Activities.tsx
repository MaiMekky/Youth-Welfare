"use client";
import React from "react";
import "../styles/Activities.css";
import { Calendar, Users, Briefcase } from "lucide-react";

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

interface ActivitiesProps {
  activities?: Activity[];
}

// Dummy data
const dummyActivities: Activity[] = [
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
  {
    id: 4,
    title: "رحلة ترفيهية",
    type: "رحلة",
    date: "2024-11-25",
    time: "08:00",
    location: "الإسكندرية",
    description: "رحلة ترفيهية لأعضاء الأسرة لتعزيز الروابط الاجتماعية",
    participants: "50 عضو",
    status: "مكتملة",
    color: "#9C27B0",
  },
  {
    id: 5,
    title: "محاضرة الذكاء الاصطناعي",
    type: "محاضرة",
    date: "2024-12-20",
    time: "18:00",
    location: "المدرج الرئيسي",
    description: "محاضرة عن تطبيقات الذكاء الاصطناعي في الصناعة",
    participants: "60 عضو",
    status: "قادمة",
    color: "#F44336",
  },
  {
    id: 6,
    title: "مشروع تطوعي",
    type: "تطوع",
    date: "2024-12-18",
    time: "09:00",
    location: "دار الأيتام",
    description: "مبادرة تطوعية لمساعدة الأطفال وتقديم الدعم",
    participants: "20 عضو",
    status: "قادمة",
    color: "#00BCD4",
  },
];

const Activities: React.FC<ActivitiesProps> = ({ activities }) => {
  // Use passed activities or fall back to dummy data
  const displayActivities = activities && activities.length > 0 ? activities : dummyActivities;

  return (
    <div className="activities-wrapper">
      <div className="activities-grid">
        {displayActivities.map((act) => (
          <div key={act.id} className="activity-card">
            <div className="activity-header">
              <span
                className={`activity-status ${
                  act.status === "قادمة" ? "status-upcoming" : "status-done"
                }`}
              >
                {act.status}
              </span>
              <div
                className="activity-type-icon"
                style={{ backgroundColor: act.color }}
              >
                {act.type.includes("اجتماع") ? (
                  <Users size={18} color="#fff" />
                ) : act.type.includes("مسابقة") ? (
                  <Calendar size={18} color="#fff" />
                ) : (
                  <Briefcase size={18} color="#fff" />
                )}
              </div>
            </div>
            <h3 className="activity-title">{act.title}</h3>
            <p className="activity-desc">{act.description}</p>
            <div className="activity-info">
              <div className="info-item">
                <Calendar size={16} />
                {act.date} - {act.time}
              </div>
              <div className="info-item">
                <Users size={16} />
                {act.location}
              </div>
              <div className="info-item">
                <Briefcase size={16} />
                {act.participants}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Activities;