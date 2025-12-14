"use client";
import React, { useState, useEffect } from "react";
import "../styles/Activities.css";
import { Calendar, Users, Briefcase, MapPin } from "lucide-react";
import { decodeToken } from "@/utils/tokenUtils";

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
  familyName?: string;
  facultyName?: string;
  createdBy?: string;
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
  cost?: number | null;
  restrictions?: string;
  reward?: string;
  status?: string;
  family?: number;
  family_name?: string;
  faculty?: number;
  faculty_name?: string;
  created_by?: number;
  created_by_admin_info?: {
    admin_id: number;
    name: string;
    email: string;
    role: string;
  };
  created_by_student_info?: {
    student_id: number;
    name: string;
    email: string;
  };
  created_at?: string;
  updated_at?: string;
}

interface ActivitiesProps {
  familyId?: number;
  refreshTrigger?: number;
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

const mapApiActivityToActivity = (apiEvent: ApiEventRequest): Activity => {
  const colors = ["#4CAF50", "#2196F3", "#FF9800", "#9C27B0", "#F44336", "#00BCD4"];
  const colorIndex = Math.abs(apiEvent.event_id) % colors.length;
  
  const createdByName = apiEvent.created_by_admin_info?.name || 
                        apiEvent.created_by_student_info?.name || 
                        "غير معروف";
  
  let status: "قادمة" | "مكتملة" | "منتظر" = "قادمة";
  if (apiEvent.status === "منتظر") {
    status = "منتظر";
  } else if (apiEvent.status === "approved") {
    status = "مكتملة";
  }
  
  return {
    id: apiEvent.event_id,
    title: apiEvent.title,
    type: apiEvent.type,
    date: apiEvent.st_date,
    time: "00:00",
    location: apiEvent.location,
    description: apiEvent.description,
    participants: apiEvent.s_limit ? `${apiEvent.s_limit} عضو` : "غير محدد",
    status,
    color: colors[colorIndex],
    familyName: apiEvent.family_name,
    facultyName: apiEvent.faculty_name,
    createdBy: createdByName,
  };
};

const Activities: React.FC<ActivitiesProps> = ({ familyId, refreshTrigger = 0 }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facultyId, setFacultyId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access');
    if (token) {
      const decoded = decodeToken(token);
      if (decoded?.faculty_id) {
        setFacultyId(decoded.faculty_id);
        console.log('Faculty ID from token:', decoded.faculty_id);
      }
    }
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('access');
      if (!token) {
        console.warn('No access token found');
        setActivities(dummyActivities);
        setLoading(false);
        return;
      }

      if (!familyId) {
        console.warn('No familyId provided to Activities component');
        setActivities(dummyActivities);
        setLoading(false);
        return;
      }

      const endpoint = `http://127.0.0.1:8000/api/family/student/${familyId}/event_requests/`;
      console.log('Fetching event requests from:', endpoint);
      console.log('Faculty ID:', facultyId);

      const response = await fetch(endpoint, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error('Failed to fetch event requests, status:', response.status);
        const errorData = await response.text();
        console.error('Error response:', errorData);
        setActivities(dummyActivities);
        setLoading(false);
        return;
      }

      const data = await response.json();
      console.log('Event requests data received:', data);

      let eventsArray: ApiEventRequest[] = [];
      if (Array.isArray(data)) {
        eventsArray = data;
      } else if (data?.events && Array.isArray(data.events)) {
        eventsArray = data.events;
      } else if (data?.results && Array.isArray(data.results)) {
        eventsArray = data.results;
      }

      const mappedActivities = eventsArray.map(mapApiActivityToActivity);
      console.log('Mapped activities:', mappedActivities);
      setActivities(mappedActivities.length > 0 ? mappedActivities : dummyActivities);
    } catch (err) {
      console.error('Error fetching event requests:', err);
      setError('فشل في تحميل الفعاليات');
      setActivities(dummyActivities);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [familyId]);

  useEffect(() => {
    fetchActivities();
  }, [refreshTrigger]);

  // Use fetched activities or fall back to dummy data
  const displayActivities = activities.length > 0 ? activities : dummyActivities;

  return (
    <div className="activities-wrapper">
      {error && (
        <div style={{ color: '#c00', padding: '15px', textAlign: 'center' }}>
          {error}
        </div>
      )}
      <div className="activities-grid">
        {displayActivities.map((act) => (
          <div key={act.id} className="activity-card">
            <div className="activity-header">
              <span
                className={`activity-status ${
                  act.status === "قادمة" ? "status-upcoming" : 
                  act.status === "منتظر" ? "status-pending" : 
                  "status-done"
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
                <MapPin size={16} />
                {act.location}
              </div>
              <div className="info-item">
                <Users size={16} />
                {act.participants}
              </div>
              {act.familyName && (
                <div className="info-item">
                  <Briefcase size={16} />
                  الأسرة: {act.familyName}
                </div>
              )}
              {act.facultyName && (
                <div className="info-item">
                  <Briefcase size={16} />
                  الكلية: {act.facultyName}
                </div>
              )}
              {act.createdBy && (
                <div className="info-item">
                  <Users size={16} />
                  منشئ الفعالية: {act.createdBy}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Activities;