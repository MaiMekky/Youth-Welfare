"use client";
import React, { useState, useEffect } from "react";
import { ArrowRight, Users, Calendar, FileText, UserRound, Clock, MapPin, Briefcase } from "lucide-react";
import "../styles/FamilyDetails.css";
import { authFetch } from "@/utils/globalFetch";
interface FamilyDetailsProps {
  family: {
    id: number;
    title: string;
    subtitle: string;
    place: string;
    views: string;
    createdAt: string;
    deadline?: string;
    goals: string;
    description?: string;
    image?: string;
  };
  onBack: () => void;
}

interface Post {
  id: number;
  title: string;
  description: string;
  created_at: string;
}

interface Activity {
  event_id: number;
  title: string;
  description: string;
  type: string;
  st_date: string;
  end_date: string;
  location: string;
  s_limit: number;
  cost: string;
  restrictions: string;
  reward: string;
  is_registered?: boolean;
}

const FamilyDetails: React.FC<FamilyDetailsProps> = ({ family, onBack }) => {
  const [activeTab, setActiveTab] = useState<"details" | "activities" | "posts">("details");
  const [posts, setPosts] = useState<Post[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [registeringEventId, setRegisteringEventId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({ show: false, message: '', type: 'success' });

  const token = typeof window !== 'undefined' ? localStorage.getItem('access') : null;

  // Show notification helper
  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 4000);
  };

  // Helper functions for localStorage persistence
  const getRegisteredEvents = (): number[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(`registered_events_family_${family.id}`);
    return stored ? JSON.parse(stored) : [];
  };

  const saveRegisteredEvent = (eventId: number) => {
    if (typeof window === 'undefined') return;
    const registered = getRegisteredEvents();
    if (!registered.includes(eventId)) {
      registered.push(eventId);
      localStorage.setItem(`registered_events_family_${family.id}`, JSON.stringify(registered));
    }
  };

  const isEventRegistered = (eventId: number): boolean => {
    return getRegisteredEvents().includes(eventId);
  };

  // Fetch Posts
  const fetchPosts = async () => {
    if (!token) return;
    
    try {
      setLoadingPosts(true);
      setError(null);
      
      const res = await authFetch(
        `http://127.0.0.1:8000/api/family/student/${family.id}/posts/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error('فشل تحميل المنشورات');

      const data = await res.json();
      const postsArray = Array.isArray(data) ? data : data.results || data.posts || [];
      setPosts(postsArray);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching posts:', err);
    } finally {
      setLoadingPosts(false);
    }
  };

  // Fetch Activities/Events
  const fetchActivities = async () => {
    if (!token) return;
    
    try {
      setLoadingActivities(true);
      setError(null);
      
      const res = await authFetch(
        `http://127.0.0.1:8000/api/family/student/${family.id}/event_requests/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error('فشل تحميل الفعاليات');

      const data = await res.json();
      const activitiesArray = Array.isArray(data) ? data : data.results || data.events || [];
      
      // Mark activities as registered based on localStorage
      const activitiesWithRegistrationStatus = activitiesArray.map((activity: Activity) => ({
        ...activity,
        is_registered: activity.is_registered || isEventRegistered(activity.event_id)
      }));
      
      setActivities(activitiesWithRegistrationStatus);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching activities:', err);
    } finally {
      setLoadingActivities(false);
    }
  };

  // Register for Event
  const registerForEvent = async (eventId: number) => {
    if (!token) {
      showNotification('غير مصرح', 'error');
      return;
    }

    try {
      setRegisteringEventId(eventId);
      
      const res = await authFetch(
        `http://127.0.0.1:8000/api/family/student/${family.id}/events/${eventId}/register/`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!res.ok) {
        let msg = 'فشل التسجيل في الفعالية';
        try {
          const err = await res.json();
          msg = err.message || err.detail || msg;
        } catch {}
        throw new Error(msg);
      }

      // Save to localStorage for persistence
      saveRegisteredEvent(eventId);

      // Update the activity's registration status immediately
      setActivities(prevActivities =>
        prevActivities.map(activity =>
          activity.event_id === eventId
            ? { ...activity, is_registered: true }
            : activity
        )
      );

      // Show success notification
      showNotification('تم التسجيل في الفعالية بنجاح ✅', 'success');
      
    } catch (err: any) {
      showNotification(err.message || 'حصل خطأ أثناء التسجيل', 'error');
    } finally {
      setRegisteringEventId(null);
    }
  };

  // Load data when tab changes
  useEffect(() => {
    if (activeTab === 'posts' && posts.length === 0) {
      fetchPosts();
    } else if (activeTab === 'activities' && activities.length === 0) {
      fetchActivities();
    }
  }, [activeTab]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleTimeString('ar-EG', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="family-details-page" dir="rtl">
      {/* Custom Notification */}
      {notification.show && (
        <div className={`custom-notification ${notification.type}`}>
          <div className="notification-content">
            <span className="notification-icon">
              {notification.type === 'success' ? '✓' : '✕'}
            </span>
            <span className="notification-message">{notification.message}</span>
          </div>
          <button 
            className="notification-close"
            onClick={() => setNotification({ ...notification, show: false })}
          >
            ×
          </button>
        </div>
      )}

      {/* Header with Back Button */}
      <div className="details-header-wrapper">
        <button onClick={onBack} className="back-button">
          <ArrowRight size={20} />
          العودة
        </button>
        <div className="details-header">
          <h1 className="details-title">تفاصيل {family.title}</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="details-tabs">
        <button
          className={`tab ${activeTab === "details" ? "active" : ""}`}
          onClick={() => setActiveTab("details")}
        >
          <FileText size={18} />
          التفاصيل
        </button>
        <button
          className={`tab ${activeTab === "activities" ? "active" : ""}`}
          onClick={() => setActiveTab("activities")}
        >
          <Calendar size={18} />
          الفعاليات ({activities.length})
        </button>
        <button
          className={`tab ${activeTab === "posts" ? "active" : ""}`}
          onClick={() => setActiveTab("posts")}
        >
          <FileText size={18} />
          المنشورات ({posts.length})
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-box" style={{ 
          padding: '12px', 
          margin: '16px 0', 
          backgroundColor: '#fee', 
          color: '#c33', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      {/* Content */}
      <div className="details-content">
        {activeTab === "details" && (
          <div className="details-section">
            <div className="detail-card">
              <h2 className="section-title">معلومات الأسرة</h2>
              <div className="detail-info">
                <div className="info-row">
                  <span className="info-label">اسم الأسرة:</span>
                  <span className="info-value">{family.title}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">الوصف:</span>
                  <span className="info-value">{family.subtitle}</span>
                </div>
                {family.description && (
                  <div className="info-row">
                    <span className="info-label">التفاصيل:</span>
                    <span className="info-value">{family.description}</span>
                  </div>
                )}
                <div className="info-row">
                  <span className="info-label">المكان:</span>
                  <span className="info-value">{family.place}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">عدد الأعضاء:</span>
                  <span className="info-value">{family.views}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">تاريخ الإنشاء:</span>
                  <span className="info-value">{family.createdAt}</span>
                </div>
                {family.deadline && (
                  <div className="info-row">
                    <span className="info-label">الموعد النهائي:</span>
                    <span className="info-value">{family.deadline}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="detail-card">
              <h2 className="section-title">أهداف الأسرة</h2>
              <p className="goals-text">{family.goals || family.subtitle}</p>
            </div>
          </div>
        )}

        {activeTab === "activities" && (
          <div className="activities-section">
            {loadingActivities ? (
              <p style={{ textAlign: 'center', padding: '20px' }}>جاري تحميل الفعاليات...</p>
            ) : activities.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>لا توجد فعاليات حالياً</p>
            ) : (
              <div className="activities-grid">
                {activities.map((activity) => (
                  <div key={activity.event_id} className="activity-card">
                    <div className="activity-header">
                      <span className="activity-status upcoming">
                        {activity.type || 'فعالية'}
                      </span>
                      <div className="activity-icon" style={{ backgroundColor: '#4CAF50' }}>
                        <Calendar size={18} color="#fff" />
                      </div>
                    </div>
                    <h3 className="activity-title">{activity.title}</h3>
                    <p className="activity-description">{activity.description}</p>
                    <div className="activity-details">
                      <div className="activity-detail-item">
                        <Clock size={16} />
                        <span>{formatDate(activity.st_date)} - {formatDate(activity.end_date)}</span>
                      </div>
                      <div className="activity-detail-item">
                        <MapPin size={16} />
                        <span>{activity.location}</span>
                      </div>
                      <div className="activity-detail-item">
                        <Users size={16} />
                        <span>الحد الأقصى: {activity.s_limit} عضو</span>
                      </div>
                      {activity.cost && parseFloat(activity.cost) > 0 && (
                        <div className="activity-detail-item">
                          <span>💰 التكلفة: {activity.cost} جنيه</span>
                        </div>
                      )}
                      {activity.reward && (
                        <div className="activity-detail-item">
                          <span>🏆 المكافأة: {activity.reward}</span>
                        </div>
                      )}
                    </div>
                    <button
                      className={`register-event-btn ${activity.is_registered ? 'registered' : ''}`}
                      onClick={() => registerForEvent(activity.event_id)}
                      disabled={registeringEventId === activity.event_id || activity.is_registered}
                    >
                      {activity.is_registered 
                        ? 'تم التسجيل ✓' 
                        : registeringEventId === activity.event_id 
                        ? 'جاري التسجيل...' 
                        : 'تسجيل في الفعالية'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "posts" && (
          <div className="posts-section">
            {loadingPosts ? (
              <p style={{ textAlign: 'center', padding: '20px' }}>جاري تحميل المنشورات...</p>
            ) : posts.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>لا توجد منشورات حالياً</p>
            ) : (
              <div className="posts-list">
                {posts.map((post) => (
                  <div key={post.id} className="post-card-modern">
                    <div className="post-header-modern">
                      <div className="post-author-section">
                        <div className="author-avatar-modern">
                          <UserRound size={24} color="#fff" />
                        </div>
                        <div className="author-info-modern">
                          <h4 className="author-name-modern">{family.title}</h4>
                          <div className="post-meta">
                            <span className="author-role-modern">إدارة الأسرة</span>
                            <span className="dot-separator">•</span>
                            <span className="post-time">
                              {formatDate(post.created_at)} • {formatTime(post.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="post-body-modern">
                      <h3 className="post-title-modern">{post.title}</h3>
                      <p className="post-content-modern">{post.description}</p>
                    </div>
                   
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FamilyDetails;