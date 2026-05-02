"use client";
import React, { useState, useEffect } from "react";
import "../styles/Posts.css";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";

// ========= Types ==========
export type PostType = "Post" | "Reminder";

export interface Post {
  id: number;
  author: string;
  role: string;
  time: string;
  date: string;
  title: string;
  content: string;
  type: PostType;
}

interface ApiPost {
  post_id: number;
  title: string;
  description: string;
  family: number;
  family_name: string;
  faculty: number;
  faculty_name: string;
  created_at: string;
  updated_at: string;
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

// ========= Props Interface ==========
interface PostsProps {
  refreshTrigger?: number;
}

// ========= Avatar Icon ==========
const UserIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    className="user-icon"
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

// ========= Empty state icon ==========
const EmptyIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    className="empty-icon"
  >
    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9.414V19a2 2 0 01-2 2z" />
  </svg>
);

// ========= Single Post Card ==========
const PostCard: React.FC<{ post: Post }> = ({ post }) => {
  return (
    <div className="post-card">
      <div className="post-content">
        <div className="text-section">
          <div className="meta">
            <div className="author-row">
              <h3 className="author-name">{post.author}</h3>
              <span className="author-role">{post.role}</span>
            </div>
            <span className="date-time">
              {post.time} · {post.date}
            </span>
          </div>
          <div className="body">
            <h2 className="post-title">{post.title}</h2>
            <p className="post-text">{post.content}</p>
          </div>
        </div>
        <div className="avatar">
          <UserIcon />
        </div>
      </div>
    </div>
  );
};

const mapApiPostToPost = (apiPost: ApiPost): Post => {
  const createdDate = new Date(apiPost.created_at);
  const time = createdDate.toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const date = createdDate.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return {
    id: apiPost.post_id,
    title: apiPost.title,
    content: apiPost.description,
    author: apiPost.family_name || 'مستخدم',
    role: 'عضو الأسرة',
    time,
    date,
    type: 'Post',
  };
};

// ========= Posts Main Page Component ==========
const Posts: React.FC<PostsProps> = ({ refreshTrigger = 0 }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFamilyId, setSelectedFamilyId] = useState<number | null>(null);

  // First useEffect: Fetch family ID from families API
  useEffect(() => {
    const fetchFamilyId = async () => {
      try {
        const baseUrl = getBaseUrl();
        const res = await authFetch(
          `${baseUrl}/api/family/student/families/`
        );

        if (!res.ok) throw new Error("فشل تحميل قائمة الأسر");

        const response = await res.json();

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
          setError("لا توجد أسر متاحة");
          setLoading(false);
          return;
        }

        const elderBrotherFamily = families.find(f => f.role === "أخ أكبر");

        if (elderBrotherFamily) {
          setSelectedFamilyId(elderBrotherFamily.family_id);
        } else {
          setError("لا توجد أسرة بدور 'أخ أكبر'");
          setLoading(false);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "حصل خطأ أثناء تحميل قائمة الأسر");
        setLoading(false);
      }
    };

    fetchFamilyId();
  }, []);

  // Second useEffect: Fetch posts using the selected family ID
  useEffect(() => {
    if (!selectedFamilyId) return;

    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        const baseUrl = getBaseUrl();
        const endpoint = `${baseUrl}/api/family/student/${selectedFamilyId}/posts/`;

        const response = await authFetch(endpoint);

        if (!response.ok) {
          throw new Error(`Failed to fetch posts: ${response.statusText}`);
        }

        const data = await response.json();

        let postsArray: ApiPost[] = [];
        if (Array.isArray(data)) {
          postsArray = data;
        } else if (data.posts && Array.isArray(data.posts)) {
          postsArray = data.posts;
        }

        const mappedPosts = postsArray.map(mapApiPostToPost);
        setPosts(mappedPosts);
      } catch {
        setError('فشل في تحميل المنشورات');
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [selectedFamilyId, refreshTrigger]);

  if (loading) {
    return (
      <div className="posts-page" dir="rtl">
        <div className="posts-container">
          <div className="page-header-block">
            <h1 className="page-title">آخر الأخبار والإعلانات</h1>
            <p className="page-subtitle">تابع أحدث الأخبار والمستجدات</p>
          </div>
          <div className="section-body">
            <div className="loading-state">
              <div className="spinner" />
              <span className="loading-text">جاري تحميل المنشورات...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="posts-page" dir="rtl">
      <div className="posts-container">
        <div className="page-header-block">
          <h1 className="page-title">آخر الأخبار والإعلانات</h1>
          <p className="page-subtitle">تابع أحدث الأخبار والمستجدات</p>
        </div>
        <div className="section-body">
          {error && <p className="error-msg">{error}</p>}
          {posts.length === 0 && !error ? (
            <div className="empty-state">
              <EmptyIcon />
              <p className="empty-text">لا توجد منشورات حالياً</p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Posts;