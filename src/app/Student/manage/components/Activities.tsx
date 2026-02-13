"use client";
import React, { useState, useEffect } from "react";
import "../styles/Activities.css";
import { Calendar, Users, Briefcase, MapPin } from "lucide-react";

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
  deptName?: string;
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

const mapApiActivityToActivity = (apiEvent: ApiEventRequest, deptMap: Record<number, string> = {}): Activity => {
  const colors = ["#4CAF50", "#2196F3", "#FF9800", "#9C27B0", "#F44336", "#00BCD4"];
  const colorIndex = Math.abs(apiEvent.event_id) % colors.length;
  
  // Map status
  let status: "قادمة" | "مكتملة" | "منتظر" = "قادمة";
  if (apiEvent.status === "منتظر" || apiEvent.status === "pending") {
    status = "منتظر";
  } else if (apiEvent.status === "approved" || apiEvent.status === "مكتملة") {
    status = "مكتملة";
  }
  
  // Get department name
  const deptName = apiEvent.dept_id ? deptMap[apiEvent.dept_id] : undefined;
  
  // Extract creator name
  let createdBy = "";
  if (apiEvent.created_by_admin_info) {
    if (typeof apiEvent.created_by_admin_info === 'string') {
      createdBy = apiEvent.created_by_admin_info;
    } else {
      createdBy = apiEvent.created_by_admin_info.name;
    }
  } else if (apiEvent.created_by_student_info) {
    if (typeof apiEvent.created_by_student_info === 'string') {
      createdBy = apiEvent.created_by_student_info;
    } else {
      createdBy = apiEvent.created_by_student_info.name;
    }
  }
  
  // Extract time from st_date if it contains time
  let time = "00:00";
  let date = apiEvent.st_date;
  if (apiEvent.st_date.includes('T')) {
    const [datePart, timePart] = apiEvent.st_date.split('T');
    date = datePart;
    time = timePart.substring(0, 5); // Extract HH:MM
  }
  
  return {
    id: apiEvent.event_id,
    title: apiEvent.title,
    type: apiEvent.type,
    date: date,
    time: time,
    location: apiEvent.location,
    description: apiEvent.description,
    participants: apiEvent.s_limit ? `${apiEvent.s_limit} عضو` : "غير محدد",
    status,
    color: colors[colorIndex],
    familyName: apiEvent.family_name,
    facultyName: apiEvent.faculty_name,
    deptName,
    createdBy,
  };
};

const Activities: React.FC<ActivitiesProps> = ({ refreshTrigger = 0 }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [deptMap, setDeptMap] = useState<Record<number, string>>({});
  const [selectedFamilyId, setSelectedFamilyId] = useState<number | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("access") : null;

  // First useEffect: Fetch family ID from families API
  useEffect(() => {
    if (!token) {
      setError("غير مصرح");
      setLoading(false);
      return;
    }

    const fetchFamilyId = async () => {
      try {
        const res = await fetch(
          `http://127.0.0.1:8000/api/family/student/families/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("فشل تحميل قائمة الأسر");

        const response = await res.json();
        
        // Check different possible response structures
        let families: Family[] = [];
        
        if (Array.isArray(response)) {
          families = response;
        } else if (response.data && Array.isArray(response.data)) {
          families = response.data;
        } else if (response.results && Array.isArray(response.results)) {
          families = response.results;
        } else if (response.families && Array.isArray(response.families)) {
          families = response.families;
        }
        
        if (families.length === 0) {
          setError("لا توجد أسر متاحة");
          setLoading(false);
          return;
        }
        
        // البحث عن أول أسرة بدور "أخ أكبر"
        const elderBrotherFamily = families.find(f => f.role === "أخ أكبر");
        
        if (elderBrotherFamily) {
          setSelectedFamilyId(elderBrotherFamily.family_id);
        } else {
          setError("لا توجد أسرة بدور 'أخ أكبر'");
          setLoading(false);
        }
      } catch (err: any) {
        setError(err.message || "حصل خطأ أثناء تحميل قائمة الأسر");
        setLoading(false);
      }
    };

    fetchFamilyId();
  }, [token]);

  // Fetch departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        if (!token) return;

        const response = await fetch('http://127.0.0.1:8000/api/family/departments/', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          let depts: Department[] = [];
          
          if (Array.isArray(data)) {
            depts = data;
          } else if (data?.departments && Array.isArray(data.departments)) {
            depts = data.departments;
          } else if (data?.results && Array.isArray(data.results)) {
            depts = data.results;
          }

          setDepartments(depts);
          
          const map: Record<number, string> = {};
          depts.forEach(dept => {
            map[dept.dept_id] = dept.name;
          });
          setDeptMap(map);
        }
      } catch (err) {
        // Silently handle errors
      }
    };

    fetchDepartments();
  }, [token]);

  // Fetch activities using the selected family ID
  useEffect(() => {
    if (!selectedFamilyId || !token) return;

    const fetchActivities = async () => {
      try {
        setLoading(true);
        setError(null);

        const endpoint = `http://127.0.0.1:8000/api/family/student/${selectedFamilyId}/event_requests/`;

        const response = await fetch(endpoint, {
          method: 'GET',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        // Handle different response structures
        let eventsArray: ApiEventRequest[] = [];
        
        if (Array.isArray(data)) {
          eventsArray = data;
        } else if (data?.event_requests && Array.isArray(data.event_requests)) {
          eventsArray = data.event_requests;
        } else if (data?.events && Array.isArray(data.events)) {
          eventsArray = data.events;
        } else if (data?.results && Array.isArray(data.results)) {
          eventsArray = data.results;
        } else if (data?.data && Array.isArray(data.data)) {
          eventsArray = data.data;
        } else {
          // Try to find ANY array in the response
          for (const key of Object.keys(data)) {
            if (Array.isArray(data[key])) {
              eventsArray = data[key];
              break;
            }
          }
        }

        if (eventsArray.length === 0) {
          setActivities([]);
          setLoading(false);
          return;
        }

        // Map API events to Activity format
        const mappedActivities = eventsArray.map(event => 
          mapApiActivityToActivity(event, deptMap)
        );
        
        setActivities(mappedActivities);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'فشل في تحميل الفعاليات');
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [selectedFamilyId, token, refreshTrigger, deptMap]);

  return (
    <div className="activities-wrapper">
      {loading && (
        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
          جاري التحميل...
        </div>
      )}
      
      {error && (
        <div style={{ 
          color: '#c00', 
          padding: '15px', 
          textAlign: 'center',
          backgroundColor: '#fee',
          borderRadius: '8px',
          margin: '10px 0'
        }}>
          ⚠️ {error}
        </div>
      )}
      
      {!loading && !error && activities.length === 0 && (
        <div style={{ 
          padding: '40px', 
          textAlign: 'center', 
          color: '#666',
          fontSize: '16px'
        }}>
          لا توجد فعاليات متاحة حالياً
        </div>
      )}
      
      <div className="activities-grid">
        {activities.map((act) => (
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
              {act.deptName && (
                <div className="info-item">
                  <Briefcase size={16} />
                  اللجنة: {act.deptName}
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