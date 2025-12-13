"use client";
import React, { useState, useEffect } from "react";
import "../styles/Posts.css";

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

// ========= Props Interface ==========
interface PostsProps {
  familyId?: number;
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
const Posts: React.FC<PostsProps> = ({ familyId, refreshTrigger = 0 }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('access');
      if (!token) {
        console.warn('No access token found');
        setPosts([]);
        setLoading(false);
        return;
      }

      if (!familyId) {
        console.warn('No familyId provided to Posts component');
        setPosts([]);
        setLoading(false);
        return;
      }

      const endpoint = `http://127.0.0.1:8000/api/family/student/${familyId}/posts/`;
      console.log('Fetching posts from:', endpoint);

      const response = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        console.error('Failed to fetch posts, status:', response.status);
        throw new Error(`Failed to fetch posts: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Posts data received:', data);
      
      let postsArray: ApiPost[] = [];
      if (Array.isArray(data)) {
        postsArray = data;
      } else if (data.posts && Array.isArray(data.posts)) {
        postsArray = data.posts;
      }
      
      const mappedPosts = postsArray.map(mapApiPostToPost);
      console.log('Mapped posts:', mappedPosts);
      setPosts(mappedPosts);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('فشل في تحميل المنشورات');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [familyId]);

  useEffect(() => {
    fetchPosts();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="posts-page" dir="rtl">
        <div className="posts-container">
          <h1 className="page-title">آخر الأخبار والإعلانات</h1>
          <p style={{ textAlign: 'center', padding: '40px' }}>جاري تحميل المنشورات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="posts-page" dir="rtl">
      <div className="posts-container">
        <h1 className="page-title">آخر الأخبار والإعلانات</h1>
        {error && <p style={{ color: 'red', textAlign: 'center', padding: '20px' }}>{error}</p>}
        {posts.length === 0 && !error && (
          <p style={{ textAlign: 'center', padding: '40px' }}>لا توجد منشورات حالياً</p>
        )}
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default Posts;