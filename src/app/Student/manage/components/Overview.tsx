'use client';
import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  Calendar,
  UserCircle,
  Trophy,
  BookOpen,
  Handshake,
  Clock,
  CheckCircle,
} from "lucide-react";
import "../styles/overview.css";
import { authFetch } from "@/utils/globalFetch";
interface Member {
  id: number;
  name: string;
  email?: string;
  role: string;
  dept_name?: string;
}

interface Post {
  id: number;
  title: string;
  description: string;
  created_at: string;
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

interface DashboardResponse {
  family: {
    family_id: number;
    name: string;
    description: string;
    type: string;
    status: string;
  };
  statistics: {
    total_members: number;
    events_count: number;
    posts_count: number;
  };
  members: {
    total: number;
    active: number;
    pending: number;
  };
  leadership: {
    president?: {
      student_id: number;
      name: string;
      email: string;
      role: string;
    };
    vice_president?: {
      student_id: number;
      name: string;
      email: string;
      role: string;
    };
    committee_heads?: Array<{
      student_id: number;
      name: string;
      email: string;
      dept_name: string;
      role: string;
    }>;
    committee_assistants?: Array<{
      student_id: number;
      name: string;
      email: string;
      dept_name: string;
      role: string;
    }>;
  };
  recent_activities: any[];
  recent_posts: Array<{
    post_id: number;
    title: string;
    description: string;
    created_at: string;
  }>;
}

const Overview: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [statistics, setStatistics] = useState({
    totalMembers: 0,
    postsCount: 0,
    activeMembers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
        console.log("🔵 Starting to fetch families...");
        console.log("🔑 Token exists:", !!token);
        
        const res = await authFetch(
          `http://127.0.0.1:8000/api/family/student/families/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("📊 Response Status:", res.status);
        console.log("📊 Response OK:", res.ok);

        if (!res.ok) {
          const errorText = await res.text();
          console.error("❌ API Error Response:", errorText);
          throw new Error(`فشل تحميل قائمة الأسر (Status: ${res.status})`);
        }

        const response = await res.json();
        
        console.log("✅ Families API Response:", response);
        console.log("🔍 Response Type:", typeof response);
        console.log("🔍 Is Array:", Array.isArray(response));
        
        // If it's an object, log all keys
        if (typeof response === 'object' && !Array.isArray(response)) {
          console.log("🔍 Response Keys:", Object.keys(response));
        }
        
        // Check different possible response structures
        let families: Family[] = [];
        
        if (Array.isArray(response)) {
          families = response;
          console.log("✅ Using direct array");
        } else if (response.data && Array.isArray(response.data)) {
          families = response.data;
          console.log("✅ Using response.data");
        } else if (response.results && Array.isArray(response.results)) {
          families = response.results;
          console.log("✅ Using response.results");
        } else if (response.families && Array.isArray(response.families)) {
          families = response.families;
          console.log("✅ Using response.families");
        } else {
          console.log("⚠️ Could not find families array in response");
        }
        
        console.log("📋 Families array length:", families.length);
        console.log("📋 Families array:", families);
        
        if (families.length === 0) {
          setError("لا توجد أسر متاحة");
          setLoading(false);
          return;
        }
        
        // Log all roles
        console.log("🔍 All roles in families:", families.map(f => ({ id: f.family_id, name: f.name, role: f.role })));
        
        // البحث عن أول أسرة بدور "أخ أكبر"
        const elderBrotherFamily = families.find(f => f.role === "أخ أكبر");
        
        if (elderBrotherFamily) {
          console.log("✅ Found family with 'أخ أكبر':", elderBrotherFamily);
          setSelectedFamilyId(elderBrotherFamily.family_id);
        } else {
          console.log("❌ No family found with role 'أخ أكبر'");
          setError("لا توجد أسرة بدور 'أخ أكبر'");
          setLoading(false);
        }
      } catch (err: any) {
        console.error("❌ Error fetching families:", err);
        setError(err.message || "حصل خطأ أثناء تحميل قائمة الأسر");
        setLoading(false);
      }
    };

    fetchFamilyId();
  }, [token]);

  // Second useEffect: Fetch dashboard data using the selected family ID
  useEffect(() => {
    if (!selectedFamilyId || !token) return;

    const fetchDashboard = async () => {
      try {
        setLoading(true);

        const res = await authFetch(
          `http://127.0.0.1:8000/api/family/student/${selectedFamilyId}/dashboard/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("فشل تحميل بيانات الأسرة");

        const data: DashboardResponse = await res.json();
        console.log("Dashboard data:", data);

        // Extract statistics
        setStatistics({
          totalMembers: data.statistics.total_members || 0,
          postsCount: data.statistics.posts_count || 0,
          activeMembers: data.members.active || 0,
        });

        // Extract members from leadership
        const allMembers: Member[] = [
          ...(data.leadership.president ? [{
            id: data.leadership.president.student_id,
            name: data.leadership.president.name,
            email: data.leadership.president.email,
            role: data.leadership.president.role
          }] : []),
          ...(data.leadership.vice_president ? [{
            id: data.leadership.vice_president.student_id,
            name: data.leadership.vice_president.name,
            email: data.leadership.vice_president.email,
            role: data.leadership.vice_president.role
          }] : []),
          ...(data.leadership.committee_heads?.map((m) => ({
            id: m.student_id,
            name: m.name,
            email: m.email,
            role: m.role,
            dept_name: m.dept_name,
          })) || []),
          ...(data.leadership.committee_assistants?.map((m) => ({
            id: m.student_id,
            name: m.name,
            email: m.email,
            role: m.role,
            dept_name: m.dept_name,
          })) || []),
        ];

        setMembers(allMembers);

        // Extract recent posts
        const recentPosts: Post[] = (data.recent_posts || []).map((post) => ({
          id: post.post_id,
          title: post.title,
          description: post.description,
          created_at: post.created_at,
        }));

        setPosts(recentPosts);

      } catch (err: any) {
        console.error("Error fetching dashboard:", err);
        setError(err.message || "حصل خطأ أثناء تحميل البيانات");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [selectedFamilyId, token]);

  const recentMembers = useMemo(() => members.slice(0, 5), [members]);
  const recentPosts = useMemo(() => posts.slice(0, 5), [posts]);

  if (loading) return <p>جاري التحميل...</p>;
  if (error) return <p className="error-box">{error}</p>;

  return (
    <div className="overview-wrapper">
      {/* إحصائيات */}
      <div className="statistics-section">
        <h2 className="statistics-title">الإحصائيات</h2>
        <div className="statistics-grid">
          <div className="stat-card">
            <div className="stat-icon members-icon"><Users size={28} /></div>
            <div className="stat-content">
              <div className="stat-value">{statistics.totalMembers}</div>
              <div className="stat-label">إجمالي الأعضاء</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon upcoming-icon"><Clock size={28} /></div>
            <div className="stat-content">
              <div className="stat-value">{statistics.postsCount}</div>
              <div className="stat-label">المنشورات</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon completed-icon"><CheckCircle size={28} /></div>
            <div className="stat-content">
              <div className="stat-value">{statistics.activeMembers}</div>
              <div className="stat-label">أعضاء نشطين</div>
            </div>
          </div>
        </div>
      </div>

      {/* أعضاء وأحدث المنشورات */}
      <div className="overview-container">
        <div className="overview-card members-card">
          <div className="section-header"><Users size={24} /><h3>أعضاء القيادة</h3></div>
          <div className="members-list">
            {recentMembers.length > 0 ? (
              recentMembers.map(member => (
                <div key={member.id} className="member-item">
                  <div className="member-info">
                    <UserCircle size={36} className="member-avatar" />
                    <div>
                      <p className="member-name">{member.name}</p>
                      <p className="member-role">{member.role}</p>
                      {member.dept_name && (
                        <p className="member-role" style={{ fontSize: '12px', color: '#888' }}>
                          {member.dept_name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ textAlign: 'center', color: '#666' }}>لا يوجد أعضاء</p>
            )}
          </div>
        </div>

        <div className="overview-card activities-card">
          <div className="section-header"><BookOpen size={24} /><h3>أحدث المنشورات</h3></div>
          <div className="activities-list">
            {recentPosts.length > 0 ? (
              recentPosts.map(post => {
                const createdDate = new Date(post.created_at);
                const formattedDate = createdDate.toLocaleDateString('ar-EG');
                const formattedTime = createdDate.toLocaleTimeString('ar-EG', {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div key={post.id} className="activity-item">
                    <span className="status-badge upcoming">منشور</span>
                    <div className="activity-info">
                      <p className="activity-title">{post.title}</p>
                      <p className="activity-time" style={{ fontSize: '13px', color: '#666' }}>
                        {post.description.substring(0, 60)}
                        {post.description.length > 60 ? '...' : ''}
                      </p>
                      <p className="activity-time">{formattedTime} - {formattedDate}</p>
                    </div>
                    <div className="activity-icon" style={{ backgroundColor: '#2196F3' }}>
                      <BookOpen size={22} />
                    </div>
                  </div>
                );
              })
            ) : (
              <p style={{ textAlign: 'center', color: '#666' }}>لا توجد منشورات</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;