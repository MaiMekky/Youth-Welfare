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

interface ActivitiesProps {
  studentId?: number;
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
];

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

const Activities: React.FC<ActivitiesProps> = ({ studentId, refreshTrigger = 0 }) => {
  const [activities, setActivities] = useState<Activity[]>(dummyActivities);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [deptMap, setDeptMap] = useState<Record<number, string>>({});

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('access');
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
        console.log('✅ Departments loaded:', depts.length);
      }
    } catch (err) {
      console.error('❌ Error fetching departments:', err);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // Fetch activities
  const fetchActivities = async () => {
    if (!studentId) {
      console.warn('⚠️ No studentId provided');
      setActivities(dummyActivities);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('access');
      if (!token) {
        console.error('❌ No access token found');
        setError('لا يوجد توكن وصول');
        setActivities(dummyActivities);
        setLoading(false);
        return;
      }

      const endpoint = `http://127.0.0.1:8000/api/family/student/4/event_requests/`;
      console.log('📡 Fetching from:', endpoint);

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📊 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Raw API Response:', data);
      console.log('🔍 Response type:', typeof data);
      console.log('🔍 Is Array?:', Array.isArray(data));
      
      // If it's an object, log all keys
      if (typeof data === 'object' && !Array.isArray(data)) {
        console.log('🔍 Response keys:', Object.keys(data));
        Object.keys(data).forEach(key => {
          const value = data[key];
          if (Array.isArray(value)) {
            console.log(`🔑 "${key}": Array with ${value.length} items`);
            if (value.length > 0) {
              console.log(`   First item:`, value[0]);
            }
          } else {
            console.log(`🔑 "${key}":`, typeof value);
          }
        });
      }

      // Handle different response structures
      let eventsArray: ApiEventRequest[] = [];
      
      if (Array.isArray(data)) {
        eventsArray = data;
        console.log('✅ Using direct array');
      } else if (data?.event_requests && Array.isArray(data.event_requests)) {
        eventsArray = data.event_requests;
        console.log('✅ Using data.event_requests');
      } else if (data?.events && Array.isArray(data.events)) {
        eventsArray = data.events;
        console.log('✅ Using data.events');
      } else if (data?.results && Array.isArray(data.results)) {
        eventsArray = data.results;
        console.log('✅ Using data.results');
      } else if (data?.data && Array.isArray(data.data)) {
        eventsArray = data.data;
        console.log('✅ Using data.data');
      } else {
        // Try to find ANY array in the response
        console.log('🔍 Searching for arrays in response...');
        for (const key of Object.keys(data)) {
          if (Array.isArray(data[key])) {
            console.log(`🎯 Found array in key "${key}" with ${data[key].length} items`);
            eventsArray = data[key];
            break;
          }
        }
      }

      console.log('📋 Total events found:', eventsArray.length);

      if (eventsArray.length === 0) {
        console.log('ℹ️ No events found, showing dummy data');
        setActivities(dummyActivities);
        setLoading(false);
        return;
      }

      console.log('📝 First event sample:', eventsArray[0]);

      // Map API events to Activity format
      const mappedActivities = eventsArray.map(event => 
        mapApiActivityToActivity(event, deptMap)
      );
      
      console.log('✅ Successfully mapped activities:', mappedActivities.length);
      console.log('📝 First mapped activity:', mappedActivities[0]);
      
      setActivities(mappedActivities);
      setError(null);
    } catch (err) {
      console.error('❌ Error fetching activities:', err);
      setError(err instanceof Error ? err.message : 'فشل في تحميل الفعاليات');
      setActivities(dummyActivities);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) {
      fetchActivities();
    }
  }, [studentId, refreshTrigger, deptMap]);

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