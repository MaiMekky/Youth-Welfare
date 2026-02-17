"use client";

import React, { useState, useEffect } from "react";
import "../styles/dashboard.css";
import Activities from "./Activities";
import Members from "./Members";
import Posts from "./Posts";
import Overview from "./Overview";
import Toast from "./Toast";
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

interface ToastNotification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
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

  // Toast notifications state
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

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

  // Form validation errors
  const [activityErrors, setActivityErrors] = useState<Record<string, string>>({});

  const token = typeof window !== "undefined" ? localStorage.getItem("access") : null;

  /* ======================
     TOAST FUNCTIONS
  ====================== */
  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Fetch family ID and name from families API
  useEffect(() => {
    if (!token) {
      setProfileLoading(false);
      return;
    }

    const fetchFamilyData = async () => {
      try {
        const res = await fetch(
          `http://127.0.0.1:8000/api/family/student/families/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error(`فشل تحميل قائمة الأسر (Status: ${res.status})`);
        }

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
          showToast("لا توجد أسر متاحة", "warning");
          setProfileLoading(false);
          return;
        }

        // البحث عن أول أسرة بدور "أخ أكبر"
        const elderBrotherFamily = families.find(f => f.role === "أخ أكبر");
        
        if (elderBrotherFamily) {
          setSelectedFamilyId(elderBrotherFamily.family_id);
          setFamilyName(elderBrotherFamily.name);
        } else {
          showToast("لا توجد أسرة بدور 'أخ أكبر'", "warning");
          setProfileLoading(false);
        }
      } catch (err: any) {
        showToast(err.message || "حصل خطأ أثناء تحميل قائمة الأسر", "error");
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
        const res = await fetch(
          `http://127.0.0.1:8000/api/family/departments/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          return;
        }

        const response = await res.json();

        let depts: Department[] = [];
        
        if (Array.isArray(response)) {
          depts = response;
        } else if (response.departments && Array.isArray(response.departments)) {
          depts = response.departments;
        } else if (response.results && Array.isArray(response.results)) {
          depts = response.results;
        }

        setDepartments(depts);
      } catch (err) {
        // Silently handle error
      }
    };

    fetchDepartments();
  }, [token]);

  // Validate activity form
  const validateActivityForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Required fields
    if (!activityData.title.trim()) {
      errors.title = "عنوان الفعالية مطلوب";
    }

    if (!activityData.type) {
      errors.type = "نوع الفعالية مطلوب";
    }

    if (!activityData.description.trim()) {
      errors.description = "وصف الفعالية مطلوب";
    }

    if (!activityData.date) {
      errors.date = "تاريخ البداية مطلوب";
    }

    if (!activityData.endDate) {
      errors.endDate = "تاريخ النهاية مطلوب";
    }

    if (!activityData.location.trim()) {
      errors.location = "المكان مطلوب";
    }

    if (!activityData.dept_id) {
      errors.dept_id = "اللجنة مطلوبة";
    }

    // Date validation
    if (activityData.date && activityData.endDate) {
      const startDate = new Date(activityData.date);
      const endDate = new Date(activityData.endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (startDate < today) {
        errors.date = "تاريخ البداية يجب أن يكون في المستقبل";
      }

      if (endDate < startDate) {
        errors.endDate = "تاريخ النهاية يجب أن يكون بعد تاريخ البداية";
      }
    }

    // Numeric validations
    if (activityData.maxParticipants && parseInt(activityData.maxParticipants) < 1) {
      errors.maxParticipants = "الحد الأقصى للمشاركين يجب أن يكون أكبر من صفر";
    }

    if (activityData.cost && parseFloat(activityData.cost) < 0) {
      errors.cost = "التكلفة لا يمكن أن تكون سالبة";
    }

    setActivityErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Content
  const handleCreateContent = async () => {
    if (!contentBody.trim()) {
      showToast("محتوى المنشور مطلوب", "error");
      return;
    }

    if (!selectedFamilyId) {
      showToast("لم يتم العثور على معرف الأسرة", "error");
      return;
    }

    const token = localStorage.getItem("access");
    if (!token) {
      showToast("يرجى تسجيل الدخول أولاً", "error");
      return;
    }

    setIsSubmitting(true);

    try {
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
        showToast("تم نشر المحتوى بنجاح 🎉", "success");
        setContentBody("");
        setContentTitle("");
        setShowCreateContentForm(false);
        setActiveTab("posts");
        setTimeout(() => {
          setPostRefreshTrigger(prev => prev + 1);
        }, 500);
      } else {
        const errorData = await response.json();
        const errorMsg = errorData?.detail || errorData?.error || "حدث خطأ أثناء نشر المحتوى";
        showToast(errorMsg, "error");
      }
    } catch (error) {
      showToast("فشل الاتصال بالسيرفر", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Activity
  const handleCreateActivity = async () => {
    // Validate form
    if (!validateActivityForm()) {
      showToast("الرجاء ملء جميع الحقول المطلوبة بشكل صحيح", "error");
      return;
    }

    if (!selectedFamilyId) {
      showToast("لم يتم العثور على معرف الأسرة", "error");
      return;
    }

    const token = localStorage.getItem("access");
    if (!token) {
      showToast("يرجى تسجيل الدخول أولاً", "error");
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

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (response.ok) {
        showToast("تم إنشاء الفعالية بنجاح 🎉", "success");
        
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
        setActivityErrors({});

        setActiveTab("activities");
        setTimeout(() => {
          setActivityRefreshTrigger(prev => prev + 1);
        }, 500);
      } else {
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
        
        showToast(errorMsg, "error");
      }
    } catch (error) {
      showToast("فشل الاتصال بالسيرفر", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActivityChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setActivityData({ ...activityData, [name]: value });
    
    // Clear error for this field when user starts typing
    if (activityErrors[name]) {
      setActivityErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <div className="dashboard-container">
      {/* TOAST CONTAINER */}
      <div className="toast-container">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>

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
                    className={`form-input ${activityErrors.title ? 'form-input-error' : ''}`}
                  />
                  {activityErrors.title && (
                    <span className="error-message">{activityErrors.title}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>نوع الفعالية *</label>
                  <select
                    name="type"
                    value={activityData.type}
                    onChange={handleActivityChange}
                    className={`form-input ${activityErrors.type ? 'form-input-error' : ''}`}
                    required
                  >
                    <option value="">-- اختار نوع الفعالية --</option>
                    <option value="داخلي">داخلي</option>
                    <option value="خارجي">خارجي</option>
                    <option value="نشاط رياضي">نشاط رياضي</option>
                    <option value="نشاط ثقافي">نشاط ثقافي</option>
                    <option value="نشاط بيئي">نشاط بيئي</option>
                    <option value="نشاط اجتماعي">نشاط اجتماعي</option>
                    <option value="نشاط علمي">نشاط علمي</option>
                    <option value="نشاط خدمة عامة">نشاط خدمة عامة</option>
                    <option value="نشاط فني">نشاط فني</option>
                    <option value="نشاط معسكرات">نشاط معسكرات</option>
                    <option value="اسر">اسر</option>
                    <option value="اخر">اخر</option>
                  </select>
                  {activityErrors.type && (
                    <span className="error-message">{activityErrors.type}</span>
                  )}
                </div>
              </div>

              {/* DEPARTMENT */}
              <div className="form-group">
                <label>اللجنة *</label>
                <select
                  name="dept_id"
                  value={activityData.dept_id}
                  onChange={handleActivityChange}
                  className={`form-select ${activityErrors.dept_id ? 'form-input-error' : ''}`}
                >
                  <option value="">اختر اللجنة</option>
                  {departments.map(dept => (
                    <option key={dept.dept_id} value={dept.dept_id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                {activityErrors.dept_id && (
                  <span className="error-message">{activityErrors.dept_id}</span>
                )}
              </div>

              {/* DESCRIPTION */}
              <div className="form-group">
                <label>وصف الفعالية *</label>
                <textarea
                  name="description"
                  value={activityData.description}
                  onChange={handleActivityChange}
                  placeholder="اكتب وصفاً للفعالية..."
                  className={`form-textarea ${activityErrors.description ? 'form-input-error' : ''}`}
                />
                {activityErrors.description && (
                  <span className="error-message">{activityErrors.description}</span>
                )}
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
                    className={`form-input ${activityErrors.date ? 'form-input-error' : ''}`}
                  />
                  {activityErrors.date && (
                    <span className="error-message">{activityErrors.date}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>تاريخ النهاية *</label>
                  <input
                    type="date"
                    name="endDate"
                    value={activityData.endDate}
                    onChange={handleActivityChange}
                    className={`form-input ${activityErrors.endDate ? 'form-input-error' : ''}`}
                  />
                  {activityErrors.endDate && (
                    <span className="error-message">{activityErrors.endDate}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>الحد الأقصى للمشاركين</label>
                  <input
                    type="number"
                    name="maxParticipants"
                    value={activityData.maxParticipants}
                    onChange={handleActivityChange}
                    placeholder="اختياري"
                    className={`form-input ${activityErrors.maxParticipants ? 'form-input-error' : ''}`}
                  />
                  {activityErrors.maxParticipants && (
                    <span className="error-message">{activityErrors.maxParticipants}</span>
                  )}
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
                  className={`form-input ${activityErrors.location ? 'form-input-error' : ''}`}
                />
                {activityErrors.location && (
                  <span className="error-message">{activityErrors.location}</span>
                )}
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
                    className={`form-input ${activityErrors.cost ? 'form-input-error' : ''}`}
                  />
                  {activityErrors.cost && (
                    <span className="error-message">{activityErrors.cost}</span>
                  )}
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
                  onClick={() => {
                    setShowCreateActivityForm(false);
                    setActivityErrors({});
                  }}
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