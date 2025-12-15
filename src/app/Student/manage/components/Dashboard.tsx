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


const Dashboard: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<
    "overview" | "activities" | "members" | "posts"
  >("overview");

  const [showCreateContentForm, setShowCreateContentForm] = useState(false);
  const [showCreateActivityForm, setShowCreateActivityForm] = useState(false);

  // Student ID and Family ID for API calls
  const [studentId, setStudentId] = useState<number | null>(null);
  const [familyId, setFamilyId] = useState<number | null>(null);
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
    type: "اجتماع",
    description: "",
    date: "",
    endDate: "",
    time: "",
    location: "",
    maxParticipants: "",
    cost: "",
    restrictions: "",
    reward: "",
  });

  // Fetch student ID on mount
  useEffect(() => {
    const fetchProfileData = async () => {
      const token = localStorage.getItem("access");
      if (!token) {
        console.warn('No access token found');
        setProfileLoading(false);
        return;
      }

      try {
        const response = await fetch("http://127.0.0.1:8000/api/auth/profile/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('=== PROFILE API RESPONSE ===');
          console.log('Full data:', JSON.stringify(data, null, 2));
          console.log('student_id:', data.student_id);
          console.log('family_id:', data.family_id);
          console.log('family:', data.family);
          console.log('familyId:', data.familyId);
          
          setStudentId(data.student_id);
          
          const fid = data.family_id || data.family || data.familyId;
          if (fid) {
            setFamilyId(fid);
            console.log('✅ Family ID set to:', fid);
          } else {
            console.log('Family ID will be extracted from event requests response');
          }
          if (data.dept_id) {
            setDeptId(data.dept_id);
            console.log('Dept ID found:', data.dept_id);
          } else {
            console.warn('No dept_id in profile');
          }
        } else {
          console.error('Profile fetch returned status:', response.status);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfileData();
  }, []);

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
        console.log("API not ready — Using empty arrays. Data will be populated when available.");
        // Keep empty arrays - Overview will handle empty state gracefully
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

    if (!studentId) {
      showNotification("لم يتم العثور على معرف الطالب");
      return;
    }

    const token = localStorage.getItem("access");
    if (!token) {
      showNotification("يرجى تسجيل الدخول أولاً");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/family/student/${studentId}/post/`,
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
      !activityData.description ||
      !activityData.date ||
      !activityData.endDate ||
      !activityData.location
    ) {
      showNotification("الرجاء ملء جميع الحقول المطلوبة");
      return;
    }

    const idToUse = familyId || studentId;
    if (!idToUse) {
      showNotification("لم يتم العثور على معرف الأسرة أو الطالب");
      return;
    }

    const token = localStorage.getItem("access");
    if (!token) {
      showNotification("يرجى تسجيل الدخول أولاً");
      return;
    }

    setIsSubmitting(true);

    try {
      const endpoint = `http://127.0.0.1:8000/api/family/student/${idToUse}/event_request/`;
      const payload = {
        title: activityData.title,
        description: activityData.description,
        type: activityData.type,
        st_date: activityData.date,
        end_date: activityData.endDate,
        location: activityData.location,
        s_limit: activityData.maxParticipants ? parseInt(activityData.maxParticipants) : 0,
        cost: activityData.cost ? activityData.cost.toString() : "0",
        restrictions: activityData.restrictions || "",
        reward: activityData.reward || "",
        dept_id: deptId || 0,
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
          type: "اجتماع",
          description: "",
          date: "",
          endDate: "",
          time: "",
          location: "",
          maxParticipants: "",
          cost: "",
          restrictions: "",
          reward: "",
        });

        setActiveTab("activities");
        setTimeout(() => {
          setActivityRefreshTrigger(prev => prev + 1);
        }, 500);
      } else {
        console.error("Error creating activity:", responseData);
        showNotification("❌ حدث خطأ أثناء إنشاء الفعالية: " + (responseData?.detail || responseData?.error || "Unknown error"));
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
        <h1>إدارة الأسرة: أسرة المهندسين المبدعين</h1>
        <p>لوحة تحكم خاصة بمؤسس الأسرة لإدارة الأعضاء والفعاليات</p>

        <div className="dashboard-buttons">
          <button
            onClick={() => setShowCreateActivityForm(true)}
            className="btn create-activity"
          >
            إنشاء فعالية
          </button>

          <button
            onClick={() => setShowCreateContentForm(true)}
            className="btn publish-content"
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
          <Overview activities={activities} members={members} />
        )}

        {activeTab === "activities" && <Activities studentId={studentId || undefined} refreshTrigger={activityRefreshTrigger} />}

        {activeTab === "members" && <Members studentId={studentId || undefined} />}

        {activeTab === "posts" && <Posts familyId={familyId || studentId || undefined} refreshTrigger={postRefreshTrigger} />}
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
                  title={profileLoading ? "جاري تحميل بيانات الملف الشخصي..." : ""}
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
                  <select
                    name="type"
                    value={activityData.type}
                    onChange={handleActivityChange}
                    className="form-select"
                  >
                    <option value="اجتماع">اجتماع</option>
                    <option value="مسابقة">مسابقة</option>
                    <option value="ورشة عمل">ورشة عمل</option>
                    <option value="رحلة">رحلة</option>
                    <option value="محاضرة">محاضرة</option>
                    <option value="تطوع">تطوع</option>
                  </select>
                </div>
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
                  title={profileLoading ? "جاري تحميل بيانات الملف الشخصي..." : ""}
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