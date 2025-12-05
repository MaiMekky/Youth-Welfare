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
    time: "",
    location: "",
    maxParticipants: "",
  });

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
  const handleCreateContent = () => {
    if (!contentBody.trim()) {
      showNotification("محتوى المنشور مطلوب");
      return;
    }

    const now = new Date();
    const newPost: Post = {
      id: Date.now(),
      author: "أحمد محمد علي",
      role: "مؤسس الأسرة",
      time: now.toLocaleTimeString("ar-EG", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      date: now.toLocaleDateString("en-CA"),
      title: contentTitle || "منشور جديد",
      content: contentBody,
      type: "Post",
    };

    setPosts([newPost, ...posts]);
    setContentBody("");
    setContentTitle("");
    setShowCreateContentForm(false);
    setActiveTab("posts");
  };

  // Submit Activity
  const handleCreateActivity = () => {
    if (
      !activityData.title ||
      !activityData.description ||
      !activityData.date ||
      !activityData.time ||
      !activityData.location
    ) {
      showNotification("الرجاء ملء جميع الحقول المطلوبة");
      return;
    }

    const colors = ["#4CAF50", "#2196F3", "#FF9800", "#9C27B0", "#F44336"];

    const newActivity: Activity = {
      id: Date.now(),
      title: activityData.title,
      type: activityData.type,
      date: activityData.date,
      time: activityData.time,
      location: activityData.location,
      description: activityData.description,
      participants: activityData.maxParticipants
        ? `${activityData.maxParticipants} عضو`
        : "غير محدد",
      status: "قادمة",
      color: colors[Math.floor(Math.random() * colors.length)],
    };

    setActivities([newActivity, ...activities]);

    setShowCreateActivityForm(false);
    setActivityData({
      title: "",
      type: "اجتماع",
      description: "",
      date: "",
      time: "",
      location: "",
      maxParticipants: "",
    });

    setActiveTab("activities");
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
          <Overview activities={activities} members={members}  />
        )}

        {activeTab === "activities" && <Activities activities={activities} />}

        {activeTab === "members" && <Members members={members} />}

        {activeTab === "posts" && <Posts newPosts={posts} />}
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

                <button className="btn-submit" onClick={handleCreateContent}>
                  <Upload size={18} /> نشر
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
                  <label>التاريخ *</label>
                  <input
                    type="date"
                    name="date"
                    value={activityData.date}
                    onChange={handleActivityChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>الوقت *</label>
                  <input
                    type="time"
                    name="time"
                    value={activityData.time}
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
                >
                  إنشاء الفعالية والنشر الآن
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
