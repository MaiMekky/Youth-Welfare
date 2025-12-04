"use client";

import React, { useState, useEffect } from "react";
import "../styles/dashboard.css";
import Activities from "./Activities";
import Members from "./Members";
import Posts from "./Posts";
import { X, Upload } from "lucide-react";

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
  const [activeTab, setActiveTab] = useState<"overview" | "activities" | "members" | "posts">("overview");

  const [showCreateContentForm, setShowCreateContentForm] = useState(false);
  const [showCreateActivityForm, setShowCreateActivityForm] = useState(false);

  // Form states for Create Content
  const [contentTitle, setContentTitle] = useState("");
  const [contentBody, setContentBody] = useState("");

  // Form states for Create Activity
  const [activityData, setActivityData] = useState({
    title: "",
    type: "اجتماع",
    description: "",
    date: "",
    time: "",
    location: "",
    maxParticipants: "",
  });

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      try {
        const membersData: Member[] = await fetch("/api/members").then((res) =>
          res.json()
        );
        const activitiesData: Activity[] = await fetch("/api/activities").then(
          (res) => res.json()
        );

        setMembers(membersData);
        setActivities(activitiesData);
      } catch (error) {
        console.log("Using dummy data:", error);
      }
    }
    fetchData();
  }, []);

  // Handle Create Content Submit
  const handleCreateContent = () => {
    if (!contentBody.trim()) {
      alert("محتوى المنشور مطلوب");
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
        second: "2-digit",
      }),
      date: now.toLocaleDateString("en-CA"),
      title: contentTitle || "منشور جديد",
      content: contentBody,
      type: "Post",
    };

    setPosts([newPost, ...posts]);
    setContentTitle("");
    setContentBody("");
    setShowCreateContentForm(false);
    setActiveTab("posts"); // Switch to posts tab
  };

  // Handle Create Activity Submit
  const handleCreateActivity = () => {
    if (
      !activityData.title ||
      !activityData.description ||
      !activityData.date ||
      !activityData.time ||
      !activityData.location
    ) {
      alert("الرجاء ملء جميع الحقول المطلوبة");
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
    setActivityData({
      title: "",
      type: "اجتماع",
      description: "",
      date: "",
      time: "",
      location: "",
      maxParticipants: "",
    });
    setShowCreateActivityForm(false);
    setActiveTab("activities"); // Switch to activities tab
  };

const handleActivityChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
) => {
  setActivityData({
    ...activityData,
    [e.target.name]: e.target.value,
  });
};

  return (
    <div className="dashboard-container">
      {/* Header */}
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

      {/* Summary */}
      <div className="dashboard-summary">
        <div className="summary-box">
          <span className="summary-count">{activities.length || 6}</span>
          <span>فعالية</span>
        </div>
        <div className="summary-box">
          <span className="summary-count">{members.length || 8}</span>
          <span>عضو</span>
        </div>
      </div>

      {/* Tabs */}
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

      {/* Content switching */}
      <div className="dashboard-tabs-content">
        {activeTab === "overview" && (
          <>
            <Members members={members} />
            <Activities activities={activities} />
          </>
        )}

        {activeTab === "activities" && (
          <Activities activities={activities} />
        )}

        {activeTab === "members" && <Members members={members} />}

        {activeTab === "posts" && <Posts newPosts={posts} />}
      </div>

      {/* Popup: Publish Content */}
      {showCreateContentForm && (
        <div className="modal-overlay" onClick={() => setShowCreateContentForm(false)}>
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
                <label>
                  عنوان المنشور <span className="optional">(اختياري)</span>
                </label>
                <input
                  type="text"
                  placeholder="مثلاً: تحديث مهم"
                  value={contentTitle}
                  onChange={(e) => setContentTitle(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>
                  محتوى المنشور <span className="required">*</span>
                </label>
                <textarea
                  placeholder="اكتب محتوى المنشور هنا..."
                  value={contentBody}
                  onChange={(e) => setContentBody(e.target.value)}
                  className="form-textarea"
                  rows={6}
                />
                <p className="helper-text">
                  سيظهر هذا المنشور لجميع أعضاء الأسرة (18 عضو)
                </p>
              </div>

              <div className="form-actions">
                <button
                  onClick={() => setShowCreateContentForm(false)}
                  className="btn-cancel"
                >
                  إلغاء
                </button>
                <button onClick={handleCreateContent} className="btn-submit">
                  <Upload size={18} />
                  نشر
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Popup: Create Activity */}
      {showCreateActivityForm && (
        <div className="modal-overlay" onClick={() => setShowCreateActivityForm(false)}>
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
              <div className="form-row">
                <div className="form-group">
                  <label>
                    عنوان الفعالية <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    placeholder="مثلاً: اجتماع شهري"
                    value={activityData.title}
                    onChange={handleActivityChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>
                    نوع الفعالية <span className="required">*</span>
                  </label>
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

              <div className="form-group">
                <label>
                  وصف الفعالية <span className="required">*</span>
                </label>
                <textarea
                  name="description"
                  placeholder="اكتب وصفاً مناسباً للفعالية..."
                  value={activityData.description}
                  onChange={handleActivityChange}
                  className="form-textarea"
                  rows={4}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    التاريخ <span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={activityData.date}
                    onChange={handleActivityChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>
                    الوقت <span className="required">*</span>
                  </label>
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
                    placeholder="اختياري"
                    value={activityData.maxParticipants}
                    onChange={handleActivityChange}
                    className="form-input"
                    min="1"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>
                  المكان <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  placeholder="مثلاً: قاعة الاجتماعات - كلية الهندسة"
                  value={activityData.location}
                  onChange={handleActivityChange}
                  className="form-input"
                />
              </div>

              <div className="form-actions">
                <button
                  onClick={() => setShowCreateActivityForm(false)}
                  className="btn-cancel"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleCreateActivity}
                  className="btn-submit-activity"
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