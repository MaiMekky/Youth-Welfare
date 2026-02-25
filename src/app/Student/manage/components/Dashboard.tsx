"use client";

import React, { useState, useEffect } from "react";
import "../styles/dashboard.css";
import Activities from "./Activities";
import Members from "./Members";
import Posts from "./Posts";
import Overview from "./Overview";
import Toast from "./Toast";
import { X, Upload, CalendarPlus } from "lucide-react";

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
  const [activities, setActivities] = useState<Activity[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "activities" | "members" | "posts">("overview");

  const [showCreateContentForm, setShowCreateContentForm] = useState(false);
  const [showCreateActivityForm, setShowCreateActivityForm] = useState(false);

  const [selectedFamilyId, setSelectedFamilyId] = useState<number | null>(null);
  const [familyName, setFamilyName] = useState<string>("أسرة المهندسين المبدعين");
  const [departments, setDepartments] = useState<Department[]>([]);

  const [profileLoading, setProfileLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postRefreshTrigger, setPostRefreshTrigger] = useState(0);
  const [activityRefreshTrigger, setActivityRefreshTrigger] = useState(0);

  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const [contentTitle, setContentTitle] = useState("");
  const [contentBody, setContentBody] = useState("");

  const [activityData, setActivityData] = useState({
    title: "", type: "", description: "", date: "", endDate: "",
    time: "", location: "", maxParticipants: "", cost: "",
    restrictions: "", reward: "", dept_id: "",
  });

  const [activityErrors, setActivityErrors] = useState<Record<string, string>>({});

  const token = typeof window !== "undefined" ? localStorage.getItem("access") : null;

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  useEffect(() => {
    if (!token) { setProfileLoading(false); return; }
    const fetchFamilyData = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/family/student/families/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`فشل تحميل قائمة الأسر (Status: ${res.status})`);
        const response = await res.json();
        let families: Family[] = Array.isArray(response) ? response
          : response.data ?? response.results ?? response.families ?? [];
        if (!families.length) { showToast("لا توجد أسر متاحة", "warning"); return; }
        const elderFamily = families.find(f => f.role === "أخ أكبر");
        if (elderFamily) { setSelectedFamilyId(elderFamily.family_id); setFamilyName(elderFamily.name); }
        else showToast("لا توجد أسرة بدور 'أخ أكبر'", "warning");
      } catch (err: any) {
        showToast(err.message || "حصل خطأ أثناء تحميل قائمة الأسر", "error");
      } finally { setProfileLoading(false); }
    };
    fetchFamilyData();
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const fetchDepts = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/family/departments/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const response = await res.json();
        const depts: Department[] = Array.isArray(response) ? response
          : response.departments ?? response.results ?? [];
        setDepartments(depts);
      } catch {}
    };
    fetchDepts();
  }, [token]);

  const validateActivityForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!activityData.title.trim())       errors.title       = "عنوان الفعالية مطلوب";
    if (!activityData.type)               errors.type        = "نوع الفعالية مطلوب";
    if (!activityData.description.trim()) errors.description = "وصف الفعالية مطلوب";
    if (!activityData.date)               errors.date        = "تاريخ البداية مطلوب";
    if (!activityData.endDate)            errors.endDate     = "تاريخ النهاية مطلوب";
    if (!activityData.location.trim())    errors.location    = "المكان مطلوب";
    if (!activityData.dept_id)            errors.dept_id     = "اللجنة مطلوبة";
    if (activityData.date && activityData.endDate) {
      const start = new Date(activityData.date), end = new Date(activityData.endDate);
      const today = new Date(); today.setHours(0,0,0,0);
      if (start < today) errors.date = "تاريخ البداية يجب أن يكون في المستقبل";
      if (end < start)   errors.endDate = "تاريخ النهاية يجب أن يكون بعد تاريخ البداية";
    }
    if (activityData.maxParticipants && parseInt(activityData.maxParticipants) < 1)
      errors.maxParticipants = "الحد الأقصى يجب أن يكون أكبر من صفر";
    if (activityData.cost && parseFloat(activityData.cost) < 0)
      errors.cost = "التكلفة لا يمكن أن تكون سالبة";
    setActivityErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateContent = async () => {
    if (!contentBody.trim())   { showToast("محتوى المنشور مطلوب", "error"); return; }
    if (!selectedFamilyId)     { showToast("لم يتم العثور على معرف الأسرة", "error"); return; }
    const tk = localStorage.getItem("access");
    if (!tk)                   { showToast("يرجى تسجيل الدخول أولاً", "error"); return; }
    setIsSubmitting(true);
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/family/student/${selectedFamilyId}/post/`,
        { method: "POST", headers: { Authorization: `Bearer ${tk}`, "Content-Type": "application/json" },
          body: JSON.stringify({ title: contentTitle || "منشور جديد", description: contentBody }) }
      );
      if (response.ok) {
        showToast("تم نشر المحتوى بنجاح 🎉", "success");
        setContentBody(""); setContentTitle(""); setShowCreateContentForm(false);
        setActiveTab("posts");
        setTimeout(() => setPostRefreshTrigger(p => p + 1), 500);
      } else {
        const err = await response.json();
        showToast(err?.detail || err?.error || "حدث خطأ أثناء نشر المحتوى", "error");
      }
    } catch { showToast("فشل الاتصال بالسيرفر", "error"); }
    finally { setIsSubmitting(false); }
  };

  const handleCreateActivity = async () => {
    if (!validateActivityForm()) { showToast("الرجاء ملء جميع الحقول المطلوبة بشكل صحيح", "error"); return; }
    if (!selectedFamilyId)       { showToast("لم يتم العثور على معرف الأسرة", "error"); return; }
    const tk = localStorage.getItem("access");
    if (!tk)                     { showToast("يرجى تسجيل الدخول أولاً", "error"); return; }
    setIsSubmitting(true);
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/family/student/${selectedFamilyId}/event_request/`,
        { method: "POST", headers: { Authorization: `Bearer ${tk}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            title: activityData.title, description: activityData.description,
            type: activityData.type, st_date: activityData.date, end_date: activityData.endDate,
            location: activityData.location,
            s_limit: activityData.maxParticipants ? parseInt(activityData.maxParticipants) : 0,
            cost: activityData.cost || "0", restrictions: activityData.restrictions || "",
            reward: activityData.reward || "", dept_id: parseInt(activityData.dept_id),
          }) }
      );
      const resData = await response.json();
      if (response.ok) {
        showToast("تم إنشاء الفعالية بنجاح 🎉", "success");
        setShowCreateActivityForm(false);
        setActivityData({ title:"",type:"",description:"",date:"",endDate:"",time:"",location:"",maxParticipants:"",cost:"",restrictions:"",reward:"",dept_id:"" });
        setActivityErrors({});
        setActiveTab("activities");
        setTimeout(() => setActivityRefreshTrigger(p => p + 1), 500);
      } else {
        const msg = resData?.errors?.non_field_errors?.join(", ")
          || (resData?.errors && String(Object.values(resData.errors)[0]))
          || resData?.detail || resData?.error || "حدث خطأ أثناء إنشاء الفعالية";
        showToast(msg, "error");
      }
    } catch { showToast("فشل الاتصال بالسيرفر", "error"); }
    finally { setIsSubmitting(false); }
  };

  const handleActivityChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setActivityData(prev => ({ ...prev, [name]: value }));
    if (activityErrors[name]) setActivityErrors(prev => { const n = {...prev}; delete n[name]; return n; });
  };

  const tabs: { key: "overview"|"activities"|"members"|"posts"; label: string }[] = [
    { key: "overview",   label: "نظرة عامة" },
    { key: "activities", label: "الفعاليات" },
    { key: "members",    label: "الأعضاء" },
    { key: "posts",      label: "منشورات الأسرة" },
  ];

  return (
    <div className="dashboard-container">

      {/* TOASTS */}
      <div className="toast-container">
        {toasts.map(t => (
          <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
        ))}
      </div>

      {/* ── HEADER CARD ── */}
      <header className="dashboard-header">
        <h1>إدارة الأسرة: {familyName}</h1>
        <p>لوحة تحكم خاصة بمؤسس الأسرة لإدارة الأعضاء والفعاليات</p>
        <div className="dashboard-buttons">
          <button
            className="btn create-activity"
            onClick={() => setShowCreateActivityForm(true)}
            disabled={!selectedFamilyId || profileLoading}
          >
            <CalendarPlus size={16} style={{ display:'inline', marginLeft:6, verticalAlign:'middle' }} />
            إنشاء فعالية
          </button>
          <button
            className="btn publish-content"
            onClick={() => setShowCreateContentForm(true)}
            disabled={!selectedFamilyId || profileLoading}
          >
            <Upload size={16} style={{ display:'inline', marginLeft:6, verticalAlign:'middle' }} />
            نشر محتوى
          </button>
        </div>
      </header>

      {/* ── TABS ── */}
      <div className="dashboard-tabs">
        {tabs.map(t => (
          <button
            key={t.key}
            className={`tab${activeTab === t.key ? " active" : ""}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB CONTENT ── */}
      <div className="dashboard-tabs-content">
        {activeTab === "overview"    && <Overview />}
        {activeTab === "activities"  && <Activities refreshTrigger={activityRefreshTrigger} />}
        {activeTab === "members"     && <Members />}
        {activeTab === "posts"       && <Posts refreshTrigger={postRefreshTrigger} />}
      </div>

      {/* ── MODAL: CREATE CONTENT ── */}
      {showCreateContentForm && (
        <div className="modal-overlay" onClick={() => setShowCreateContentForm(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>نشر محتوى جديد</h2>
              <button className="close-btn" onClick={() => setShowCreateContentForm(false)}><X size={18} /></button>
            </div>
            <div className="form-content">
              <div className="form-group">
                <label>عنوان المنشور <span className="optional">(اختياري)</span></label>
                <input type="text" value={contentTitle} onChange={e => setContentTitle(e.target.value)}
                  placeholder="مثلاً: إعلان مهم" className="form-input" />
              </div>
              <div className="form-group">
                <label>محتوى المنشور <span className="required">*</span></label>
                <textarea placeholder="اكتب محتوى المنشور..." value={contentBody}
                  onChange={e => setContentBody(e.target.value)} className="form-textarea" rows={6} />
              </div>
              <div className="form-actions">
                <button className="btn-cancel" onClick={() => setShowCreateContentForm(false)}>إلغاء</button>
                <button className="btn-submit" onClick={handleCreateContent}
                  disabled={isSubmitting || profileLoading}>
                  <Upload size={16} />
                  {profileLoading ? "جاري التحميل..." : isSubmitting ? "جاري النشر..." : "نشر"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: CREATE ACTIVITY ── */}
      {showCreateActivityForm && (
        <div className="modal-overlay" onClick={() => setShowCreateActivityForm(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>إنشاء فعالية جديدة</h2>
              <button className="close-btn" onClick={() => setShowCreateActivityForm(false)}><X size={18} /></button>
            </div>
            <div className="form-content">

              <div className="form-row">
                <div className="form-group">
                  <label>عنوان الفعالية <span className="required">*</span></label>
                  <input type="text" name="title" value={activityData.title} onChange={handleActivityChange}
                    placeholder="مثلاً: اجتماع شهري"
                    className={`form-input${activityErrors.title ? ' form-input-error' : ''}`} />
                  {activityErrors.title && <span className="error-message">{activityErrors.title}</span>}
                </div>
                <div className="form-group">
                  <label>نوع الفعالية <span className="required">*</span></label>
                  <select name="type" value={activityData.type} onChange={handleActivityChange}
                    className={`form-input${activityErrors.type ? ' form-input-error' : ''}`}>
                    <option value="">-- اختر النوع --</option>
                    {["داخلي","خارجي","نشاط رياضي","نشاط ثقافي","نشاط بيئي","نشاط اجتماعي",
                      "نشاط علمي","نشاط خدمة عامة","نشاط فني","نشاط معسكرات","اسر","اخر"]
                      .map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                  {activityErrors.type && <span className="error-message">{activityErrors.type}</span>}
                </div>
              </div>

              <div className="form-group">
                <label>اللجنة <span className="required">*</span></label>
                <select name="dept_id" value={activityData.dept_id} onChange={handleActivityChange}
                  className={`form-input${activityErrors.dept_id ? ' form-input-error' : ''}`}>
                  <option value="">اختر اللجنة</option>
                  {departments.map(d => <option key={d.dept_id} value={d.dept_id}>{d.name}</option>)}
                </select>
                {activityErrors.dept_id && <span className="error-message">{activityErrors.dept_id}</span>}
              </div>

              <div className="form-group">
                <label>وصف الفعالية <span className="required">*</span></label>
                <textarea name="description" value={activityData.description} onChange={handleActivityChange}
                  placeholder="اكتب وصفاً للفعالية..."
                  className={`form-textarea${activityErrors.description ? ' form-input-error' : ''}`} />
                {activityErrors.description && <span className="error-message">{activityErrors.description}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>تاريخ البداية <span className="required">*</span></label>
                  <input type="date" name="date" value={activityData.date} onChange={handleActivityChange}
                    className={`form-input${activityErrors.date ? ' form-input-error' : ''}`} />
                  {activityErrors.date && <span className="error-message">{activityErrors.date}</span>}
                </div>
                <div className="form-group">
                  <label>تاريخ النهاية <span className="required">*</span></label>
                  <input type="date" name="endDate" value={activityData.endDate} onChange={handleActivityChange}
                    className={`form-input${activityErrors.endDate ? ' form-input-error' : ''}`} />
                  {activityErrors.endDate && <span className="error-message">{activityErrors.endDate}</span>}
                </div>
                <div className="form-group">
                  <label>الحد الأقصى للمشاركين <span className="optional">(اختياري)</span></label>
                  <input type="number" name="maxParticipants" value={activityData.maxParticipants}
                    onChange={handleActivityChange} placeholder="∞"
                    className={`form-input${activityErrors.maxParticipants ? ' form-input-error' : ''}`} />
                  {activityErrors.maxParticipants && <span className="error-message">{activityErrors.maxParticipants}</span>}
                </div>
              </div>

              <div className="form-group">
                <label>المكان <span className="required">*</span></label>
                <input type="text" name="location" value={activityData.location} onChange={handleActivityChange}
                  placeholder="مثلاً: قاعة الاجتماعات – كلية الهندسة"
                  className={`form-input${activityErrors.location ? ' form-input-error' : ''}`} />
                {activityErrors.location && <span className="error-message">{activityErrors.location}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>التكلفة <span className="optional">(اختياري)</span></label>
                  <input type="number" step="0.01" name="cost" value={activityData.cost}
                    onChange={handleActivityChange} placeholder="0"
                    className={`form-input${activityErrors.cost ? ' form-input-error' : ''}`} />
                  {activityErrors.cost && <span className="error-message">{activityErrors.cost}</span>}
                </div>
                <div className="form-group">
                  <label>القيود <span className="optional">(اختياري)</span></label>
                  <input type="text" name="restrictions" value={activityData.restrictions}
                    onChange={handleActivityChange} placeholder="—" className="form-input" />
                </div>
                <div className="form-group">
                  <label>المكافأة <span className="optional">(اختياري)</span></label>
                  <input type="text" name="reward" value={activityData.reward}
                    onChange={handleActivityChange} placeholder="—" className="form-input" />
                </div>
              </div>

              <div className="form-actions">
                <button className="btn-cancel" onClick={() => { setShowCreateActivityForm(false); setActivityErrors({}); }}>
                  إلغاء
                </button>
                <button className="btn-submit-activity" onClick={handleCreateActivity}
                  disabled={isSubmitting || profileLoading}>
                  {profileLoading ? "جاري التحميل..." : isSubmitting ? "جاري الإنشاء..." : "إنشاء الفعالية"}
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