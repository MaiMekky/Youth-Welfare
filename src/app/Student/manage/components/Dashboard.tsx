"use client";

import React, { useState, useEffect } from "react";
import "../styles/dashboard.css";
import Activities from "./Activities";
import Members from "./Members";
import Posts from "./Posts";
import Overview from "./Overview";
import { X, Upload, AlertCircle } from "lucide-react";

interface Member {
  id: number;
  name: string;
  college: string;
  joinedAt: string;
  lastActive: string;
  role: "عضو" | "مساعد" | "مؤسس";
  isOnline: boolean;
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

export interface Post {
  id: number;
  author: string;
  role: string;
  time: string;
  date: string;
  title: string;
  content: string;
  type: "Post" | "Reminder";
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

interface Department {
  dept_id: number;
  name: string;
}

const Dashboard: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<
    "overview" | "activities" | "members" | "posts"
  >("overview");

  const [showCreateContentForm, setShowCreateContentForm] = useState(false);
  const [showCreateActivityForm, setShowCreateActivityForm] = useState(false);

  // Family data
  const [selectedFamilyId, setSelectedFamilyId] = useState<number | null>(null);
  const [familyName, setFamilyName] = useState<string>("أسرة المهندسين المبدعين");
  const [departments, setDepartments] = useState<Department[]>([]);
  
  const [studentId, setStudentId] = useState<number | null>(null);
  const [deptId, setDeptId] = useState<number | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postRefreshTrigger, setPostRefreshTrigger] = useState(0);
  const [activityRefreshTrigger, setActivityRefreshTrigger] = useState(0);

  // Notification state
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
  }>({ show: false, message: "" });

  // Create Content Form
  const [contentTitle, setContentTitle] = useState("");
  const [contentBody, setContentBody] = useState("");

  // Create Activity Form
  const [activityData, setActivityData] = useState({
    title: "",
    type: "",
    description: "",
    date: "",
    endDate: "",
    time: "",
    location: "",
    maxParticipants: "",
    cost: "",
    restrictions: "",
    reward: "",
    dept_id: "",
  });

  const token = typeof window !== "undefined" ? localStorage.getItem("access") : null;

  // Fetch family ID and name from families API
  useEffect(() => {
    if (!token) {
      console.error("No token found");
      setProfileLoading(false);
      return;
    }

    const fetchFamilyData = async () => {
      try {
        console.log("🔵 Fetching family data...");
        
        const res = await fetch(
          `http://127.0.0.1:8000/api/family/student/families/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("📊 Families Response Status:", res.status);

        if (!res.ok) {
          const errorText = await res.text();
          console.error("❌ API Error:", errorText);
          throw new Error(`فشل تحميل قائمة الأسر (Status: ${res.status})`);
        }

        const response = await res.json();
        console.log("✅ Families API Response:", response);

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

        console.log("📋 Families array:", families);

        if (families.length === 0) {
          showNotification("لا توجد أسر متاحة");
          setProfileLoading(false);
          return;
        }

        // البحث عن أول أسرة بدور "أخ أكبر"
        const elderBrotherFamily = families.find(f => f.role === "أخ أكبر");
        
        if (elderBrotherFamily) {
          console.log("✅ Found family with 'أخ أكبر':", elderBrotherFamily);
          setSelectedFamilyId(elderBrotherFamily.family_id);
          setFamilyName(elderBrotherFamily.name);
        } else {
          showNotification("لا توجد أسرة بدور 'أخ أكبر'");
          setProfileLoading(false);
        }
      } catch (err: any) {
        console.error("❌ Error fetching families:", err);
        showNotification(err.message || "حصل خطأ أثناء تحميل قائمة الأسر");
      } finally {
        setProfileLoading(false);
      }
    };

    fetchFamilyData();
  }, [token]);

  // Fetch departments
  useEffect(() => {
    if (!token) return;

    const fetchDepartments = async () => {
      try {
        console.log("🔵 Fetching departments...");
        
        const res = await fetch(
          `http://127.0.0.1:8000/api/family/departments/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          console.error("❌ Departments API Error:", res.status);
          return;
        }

        const response = await res.json();
        console.log("✅ Departments API Response:", response);

        let depts: Department[] = [];
        
        if (Array.isArray(response)) {
          depts = response;
        } else if (response.departments && Array.isArray(response.departments)) {
          depts = response.departments;
        } else if (response.results && Array.isArray(response.results)) {
          depts = response.results;
        }

        console.log("📋 Departments:", depts);
        setDepartments(depts);
      } catch (err) {
        console.error("❌ Error fetching departments:", err);
      }
    };

    fetchDepartments();
  }, [token]);

  useEffect(() => {
    async function fetchData() {
      try {
        const membersResponse = await fetch("/api/members");
        const activitiesResponse = await fetch("/api/activities");

        if (membersResponse.ok) {
          const membersData: Member[] = await membersResponse.json();
          if (membersData && Array.isArray(membersData)) {
            setMembers(membersData);
          }
        }

        if (activitiesResponse.ok) {
          const activitiesData: Activity[] = await activitiesResponse.json();
          if (activitiesData && Array.isArray(activitiesData)) {
            setActivities(activitiesData);
          }
        }
      } catch (error) {
        console.log("API not ready — Using empty arrays.");
      }
    }
    fetchData();
  }, []);

  // Show notification
  const showNotification = (message: string) => {
    setNotification({ show: true, message });
    setTimeout(() => {
      setNotification({ show: false, message: "" });
    }, 4000);
  };

  // Submit Content
  const handleCreateContent = async () => {
    if (!contentBody.trim()) {
      showNotification("محتوى المنشور مطلوب");
      return;
    }

    if (!selectedFamilyId) {
      showNotification("لم يتم العثور على معرف الأسرة");
      return;
    }

    const token = localStorage.getItem("access");
    if (!token) {
      showNotification("يرجى تسجيل الدخول أولاً");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("📤 Creating post for family ID:", selectedFamilyId);
      
      const response = await fetch(
        `http://127.0.0.1:8000/api/family/student/${selectedFamilyId}/post/`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: contentTitle || "منشور جديد",
            description: contentBody,
          }),
        }
      );

      if (response.ok) {
        showNotification("✅ تم نشر المحتوى بنجاح");
        setContentBody("");
        setContentTitle("");
        setShowCreateContentForm(false);
        setActiveTab("posts");
        setTimeout(() => {
          setPostRefreshTrigger(prev => prev + 1);
        }, 500);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error creating post:", errorData);
        showNotification("❌ حدث خطأ أثناء نشر المحتوى");
      }
    } catch (error) {
      console.error("Network error:", error);
      showNotification("⚠️ فشل الاتصال بالسيرفر");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Activity
  const handleCreateActivity = async () => {
    if (
      !activityData.title ||
      !activityData.type ||
      !activityData.description ||
      !activityData.date ||
      !activityData.endDate ||
      !activityData.location ||
      !activityData.dept_id
    ) {
      showNotification("الرجاء ملء جميع الحقول المطلوبة");
      return;
    }

    // Validate dates
    const startDate = new Date(activityData.date);
    const endDate = new Date(activityData.endDate);
    
    if (endDate < startDate) {
      showNotification("❌ تاريخ النهاية يجب أن يكون بعد تاريخ البداية");
      return;
    }

    if (!selectedFamilyId) {
      showNotification("لم يتم العثور على معرف الأسرة");
      return;
    }

    const token = localStorage.getItem("access");
    if (!token) {
      showNotification("يرجى تسجيل الدخول أولاً");
      return;
    }

    setIsSubmitting(true);

    try {
      const endpoint = `http://127.0.0.1:8000/api/family/student/${selectedFamilyId}/event_request/`;
      const payload = {
        title: activityData.title,
        description: activityData.description,
        type: activityData.type,
        st_date: activityData.date,
        end_date: activityData.endDate,
        location: activityData.location,
        s_limit: activityData.maxParticipants ? parseInt(activityData.maxParticipants) : 0,
        cost: activityData.cost || "0",
        restrictions: activityData.restrictions || "",
        reward: activityData.reward || "",
        dept_id: parseInt(activityData.dept_id),
      };

      console.log('=== CREATING ACTIVITY ===');
      console.log('Endpoint:', endpoint);
      console.log('Payload:', payload);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (response.ok) {
        showNotification("✅ تم إنشاء الفعالية بنجاح");
        
        setShowCreateActivityForm(false);
        setActivityData({
          title: "",
          type: "",
          description: "",
          date: "",
          endDate: "",
          time: "",
          location: "",
          maxParticipants: "",
          cost: "",
          restrictions: "",
          reward: "",
          dept_id: "",
        });

        setActiveTab("activities");
        setTimeout(() => {
          setActivityRefreshTrigger(prev => prev + 1);
        }, 500);
      } else {
        console.error("Error creating activity:", responseData);
        
        // Extract error message
        let errorMsg = "حدث خطأ أثناء إنشاء الفعالية";
        
        if (responseData?.errors?.non_field_errors) {
          errorMsg = responseData.errors.non_field_errors.join(", ");
        } else if (responseData?.errors) {
          const firstError = Object.values(responseData.errors)[0];
          if (Array.isArray(firstError)) {
            errorMsg = firstError.join(", ");
          }
        } else if (responseData?.detail) {
          errorMsg = responseData.detail;
        } else if (responseData?.error) {
          errorMsg = responseData.error;
        }
        
        showNotification("❌ " + errorMsg);
      }
    } catch (error) {
      console.error("Network error:", error);
      showNotification("⚠️ فشل الاتصال بالسيرفر");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActivityChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setActivityData({ ...activityData, [e.target.name]: e.target.value });
  };

  return (
    <div className="dashboard-container">
      {/* NOTIFICATION */}
      {notification.show && (
        <div className="notification-container">
          <div className="notification">
            <AlertCircle size={20} className="notification-icon" />
            <span className="notification-message">{notification.message}</span>
            <button
              className="notification-close"
              onClick={() => setNotification({ show: false, message: "" })}
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="dashboard-header">
        <h1>إدارة الأسرة: {familyName}</h1>
        <p>لوحة تحكم خاصة بمؤسس الأسرة لإدارة الأعضاء والفعاليات</p>

        <div className="dashboard-buttons">
          <button
            onClick={() => setShowCreateActivityForm(true)}
            className="btn create-activity"
            disabled={!selectedFamilyId || profileLoading}
          >
            إنشاء فعالية
          </button>

          <button
            onClick={() => setShowCreateContentForm(true)}
            className="btn publish-content"
            disabled={!selectedFamilyId || profileLoading}
          >
            نشر محتوى
          </button>
        </div>
      </header>

      {/* TABS */}
      <div className="dashboard-tabs">
        <button
          className={activeTab === "overview" ? "tab active" : "tab"}
          onClick={() => setActiveTab("overview")}
        >
          نظرة عامة
        </button>

        <button
          className={activeTab === "activities" ? "tab active" : "tab"}
          onClick={() => setActiveTab("activities")}
        >
          الفعاليات
        </button>

        <button
          className={activeTab === "members" ? "tab active" : "tab"}
          onClick={() => setActiveTab("members")}
        >
          الأعضاء
        </button>

        <button
          className={activeTab === "posts" ? "tab active" : "tab"}
          onClick={() => setActiveTab("posts")}
        >
          منشورات الأسرة
        </button>
      </div>

      {/* CONTENT SWITCHING */}
      <div className="dashboard-tabs-content">
        {activeTab === "overview" && (
          <Overview />
        )}

        {activeTab === "activities" && <Activities refreshTrigger={activityRefreshTrigger} />}

        {activeTab === "members" && <Members />}

        {activeTab === "posts" && <Posts refreshTrigger={postRefreshTrigger} />}
      </div>

      {/* POPUP — CREATE CONTENT */}
      {showCreateContentForm && (
        <div
          className="modal-overlay"
          onClick={() => setShowCreateContentForm(false)}
        >
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>نشر محتوى جديد</h2>
              <button
                className="close-btn"
                onClick={() => setShowCreateContentForm(false)}
              >
                <X size={24} />
              </button>
            </div>

            <div className="form-content">
              <div className="form-group">
                <label>عنوان المنشور (اختياري)</label>
                <input
                  type="text"
                  value={contentTitle}
                  onChange={(e) => setContentTitle(e.target.value)}
                  placeholder="مثلاً: إعلان مهم"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>
                  محتوى المنشور <span className="required">*</span>
                </label>
                <textarea
                  placeholder="اكتب محتوى المنشور..."
                  value={contentBody}
                  onChange={(e) => setContentBody(e.target.value)}
                  className="form-textarea"
                  rows={6}
                />
              </div>

              <div className="form-actions">
                <button
                  className="btn-cancel"
                  onClick={() => setShowCreateContentForm(false)}
                >
                  إلغاء
                </button>

                <button 
                  className="btn-submit" 
                  onClick={handleCreateContent}
                  disabled={isSubmitting || profileLoading}
                  title={profileLoading ? "جاري تحميل بيانات الأسرة..." : ""}
                >
                  <Upload size={18} /> {profileLoading ? "جاري التحميل..." : isSubmitting ? "جاري النشر..." : "نشر"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POPUP — CREATE ACTIVITY */}
      {showCreateActivityForm && (
        <div
          className="modal-overlay"
          onClick={() => setShowCreateActivityForm(false)}
        >
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>إنشاء فعالية جديدة</h2>
              <button
                className="close-btn"
                onClick={() => setShowCreateActivityForm(false)}
              >
                <X size={24} />
              </button>
            </div>

            <div className="form-content">
              {/* TITLE + TYPE */}
              <div className="form-row">
                <div className="form-group">
                  <label>عنوان الفعالية *</label>
                  <input
                    type="text"
                    name="title"
                    value={activityData.title}
                    onChange={handleActivityChange}
                    placeholder="مثلاً: اجتماع شهري"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>نوع الفعالية *</label>
                  <input
                    type="text"
                    name="type"
                    value={activityData.type}
                    onChange={handleActivityChange}
                    placeholder="مثلاً: اجتماع، ورشة عمل، مسابقة"
                    className="form-input"
                  />
                </div>
              </div>

              {/* DEPARTMENT */}
              <div className="form-group">
                <label>اللجنة *</label>
                <select
                  name="dept_id"
                  value={activityData.dept_id}
                  onChange={handleActivityChange}
                  className="form-select"
                >
                  <option value="">اختر اللجنة</option>
                  {departments.map(dept => (
                    <option key={dept.dept_id} value={dept.dept_id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* DESCRIPTION */}
              <div className="form-group">
                <label>وصف الفعالية *</label>
                <textarea
                  name="description"
                  value={activityData.description}
                  onChange={handleActivityChange}
                  placeholder="اكتب وصفاً للفعالية..."
                  className="form-textarea"
                />
              </div>

              {/* DATE + TIME + MAX */}
              <div className="form-row">
                <div className="form-group">
                  <label>تاريخ البداية *</label>
                  <input
                    type="date"
                    name="date"
                    value={activityData.date}
                    onChange={handleActivityChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>تاريخ النهاية *</label>
                  <input
                    type="date"
                    name="endDate"
                    value={activityData.endDate}
                    onChange={handleActivityChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>الحد الأقصى للمشاركين</label>
                  <input
                    type="number"
                    name="maxParticipants"
                    value={activityData.maxParticipants}
                    onChange={handleActivityChange}
                    placeholder="اختياري"
                    className="form-input"
                  />
                </div>
              </div>

              {/* LOCATION */}
              <div className="form-group">
                <label>المكان *</label>
                <input
                  type="text"
                  name="location"
                  value={activityData.location}
                  onChange={handleActivityChange}
                  placeholder="مثلاً: قاعة الاجتماعات - كلية الهندسة"
                  className="form-input"
                />
              </div>

              {/* OPTIONAL FIELDS */}
              <div className="form-row">
                <div className="form-group">
                  <label>التكلفة</label>
                  <input
                    type="number"
                    step="0.01"
                    name="cost"
                    value={activityData.cost}
                    onChange={handleActivityChange}
                    placeholder="اختياري"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>القيود</label>
                  <input
                    type="text"
                    name="restrictions"
                    value={activityData.restrictions}
                    onChange={handleActivityChange}
                    placeholder="اختياري"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>المكافأة</label>
                  <input
                    type="text"
                    name="reward"
                    value={activityData.reward}
                    onChange={handleActivityChange}
                    placeholder="اختياري"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  className="btn-cancel"
                  onClick={() => setShowCreateActivityForm(false)}
                >
                  إلغاء
                </button>

                <button
                  className="btn-submit-activity"
                  onClick={handleCreateActivity}
                  disabled={isSubmitting || profileLoading}
                  title={profileLoading ? "جاري تحميل بيانات الأسرة..." : ""}
                >
                  {profileLoading ? "جاري التحميل..." : isSubmitting ? "جاري الإنشاء..." : "إنشاء الفعالية والنشر الآن"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;