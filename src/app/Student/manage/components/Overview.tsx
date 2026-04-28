'use client';
import React, { useState, useEffect, useMemo } from "react";
import {
  Users, UserCircle, BookOpen, Clock, CheckCircle,
} from "lucide-react";
import "../styles/overview.css";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";

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
    president?: { student_id: number; name: string; email: string; role: string; };
    vice_president?: { student_id: number; name: string; email: string; role: string; };
    committee_heads?: Array<{ student_id: number; name: string; email: string; dept_name: string; role: string; }>;
    committee_assistants?: Array<{ student_id: number; name: string; email: string; dept_name: string; role: string; }>;
  };
  recent_activities: Record<string, unknown>[];
  recent_posts: Array<{ post_id: number; title: string; description: string; created_at: string; }>;
}

const Overview: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [statistics, setStatistics] = useState({ totalMembers: 0, postsCount: 0, activeMembers: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFamilyId, setSelectedFamilyId] = useState<number | null>(null);

  useEffect(() => {
    const fetchFamilyId = async () => {
      try {
        const baseUrl = getBaseUrl();
        const res = await authFetch(`${baseUrl}/api/family/student/families/`);
        if (!res.ok) throw new Error(`فشل تحميل قائمة الأسر (Status: ${res.status})`);
        const response = await res.json();
        let families: Family[] = [];
        if (Array.isArray(response)) families = response;
        else if (response.data && Array.isArray(response.data)) families = response.data;
        else if (response.results && Array.isArray(response.results)) families = response.results;
        else if (response.families && Array.isArray(response.families)) families = response.families;
        if (families.length === 0) { setError("لا توجد أسر متاحة"); setLoading(false); return; }
        const elderBrotherFamily = families.find((f) => f.role === "أخ أكبر");
        if (elderBrotherFamily) {
          setSelectedFamilyId(elderBrotherFamily.family_id);
        } else {
          setError("لا توجد أسرة بدور 'أخ أكبر'");
          setLoading(false);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : String(err));
        setLoading(false);
      }
    };
    fetchFamilyId();
  }, []);

  useEffect(() => {
    if (!selectedFamilyId) return;
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const baseUrl = getBaseUrl();
        const res = await authFetch(
          `${baseUrl}/api/family/student/${selectedFamilyId}/dashboard/`
        );
        if (!res.ok) throw new Error("فشل تحميل بيانات الأسرة");
        const data: DashboardResponse = await res.json();

        setStatistics({
          totalMembers: data.statistics.total_members || 0,
          postsCount: data.statistics.posts_count || 0,
          activeMembers: data.members.active || 0,
        });

        const allMembers: Member[] = [
          ...(data.leadership.president ? [{ id: data.leadership.president.student_id, name: data.leadership.president.name, email: data.leadership.president.email, role: data.leadership.president.role }] : []),
          ...(data.leadership.vice_president ? [{ id: data.leadership.vice_president.student_id, name: data.leadership.vice_president.name, email: data.leadership.vice_president.email, role: data.leadership.vice_president.role }] : []),
          ...(data.leadership.committee_heads?.map((m) => ({ id: m.student_id, name: m.name, email: m.email, role: m.role, dept_name: m.dept_name })) || []),
          ...(data.leadership.committee_assistants?.map((m) => ({ id: m.student_id, name: m.name, email: m.email, role: m.role, dept_name: m.dept_name })) || []),
        ];
        setMembers(allMembers);

        setPosts((data.recent_posts || []).map((p) => ({
          id: p.post_id, title: p.title, description: p.description, created_at: p.created_at,
        })));
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "حصل خطأ أثناء تحميل البيانات");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [selectedFamilyId]);

  const recentMembers = useMemo(() => members.slice(0, 5), [members]);
  const recentPosts   = useMemo(() => posts.slice(0, 5), [posts]);

  if (loading) return <div className="overview-wrapper"><p>جاري التحميل…</p></div>;
  if (error)   return <div className="overview-wrapper"><p className="error-box">⚠️ {error}</p></div>;

  return (
    <div className="overview-wrapper">

      {/* ── Statistics ── */}
      <div className="statistics-section">
        <h2 className="statistics-title">الإحصائيات</h2>
        <div className="statistics-grid">
          <div className="stat-card">
            <div className="stat-icon members-icon"><Users size={24} /></div>
            <div className="stat-content">
              <div className="stat-value">{statistics.totalMembers}</div>
              <div className="stat-label">إجمالي الأعضاء</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon upcoming-icon"><Clock size={24} /></div>
            <div className="stat-content">
              <div className="stat-value">{statistics.postsCount}</div>
              <div className="stat-label">المنشورات</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon completed-icon"><CheckCircle size={24} /></div>
            <div className="stat-content">
              <div className="stat-value">{statistics.activeMembers}</div>
              <div className="stat-label">أعضاء نشطين</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Overview grid ── */}
      <div className="overview-container">

        {/* Leadership members */}
        <div className="overview-card members-card">
          <div className="section-header">
            <Users size={18} />
            <h3>أعضاء القيادة</h3>
          </div>
          <div className="members-list">
            {recentMembers.length > 0 ? (
              recentMembers.map((member) => (
                <div key={member.id} className="member-item">
                  <div className="member-info">
                    <UserCircle size={32} className="member-avatar" />
                    <div className="member-text">
                      <p className="member-name">{member.name}</p>
                      <p className="member-role">{member.role}</p>
                      {member.dept_name && (
                        <p className="member-dept">{member.dept_name}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>لا يوجد أعضاء</p>
            )}
          </div>
        </div>

        {/* Recent posts */}
        <div className="overview-card activities-card">
          <div className="section-header">
            <BookOpen size={18} />
            <h3>أحدث المنشورات</h3>
          </div>
          <div className="activities-list">
            {recentPosts.length > 0 ? (
              recentPosts.map((post) => {
                const createdDate   = new Date(post.created_at);
                const formattedDate = createdDate.toLocaleDateString("ar-EG");
                const formattedTime = createdDate.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
                return (
                  <div key={post.id} className="activity-item">
                    <div className="activity-title-row">
                      <p className="activity-title">{post.title}</p>
                      <span className="status-badge upcoming">منشور</span>
                    </div>
                    <p className="activity-desc">
                      {post.description.substring(0, 80)}{post.description.length > 80 ? "…" : ""}
                    </p>
                    <p className="activity-time">{formattedTime} — {formattedDate}</p>
                  </div>
                );
              })
            ) : (
              <p>لا توجد منشورات</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Overview;