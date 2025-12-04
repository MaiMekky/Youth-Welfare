"use client";
import React from "react";
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

// ========= Dummy Data (Replace with API later) ==========
const postsData: Post[] = [
  {
    id: 1,
    author: "أحمد محمد علي",
    role: "مؤسس الأسرة",
    time: "10:30:00",
    date: "2025-01-10",
    title: "أهلاً بكم في أسرة المهندسين المبدعين!",
    content:
      "مرحباً بجميع الأعضاء الجدد والقدامى في أسرتنا. نحن سعداء بوجودكم معنا ونتطلع إلى تحقيق إنجازات كبيرة معًا.",
    type: "Post",
  },
  {
    id: 2,
    author: "أحمد محمد علي",
    role: "مؤسس الأسرة",
    time: "14:20:00",
    date: "2025-01-12",
    title: "تذكير: ورشة البرمجة المتقدمة",
    content:
      "تذكركم بورشة البرمجة المتقدمة يوم 20 يناير الساعة 2 مساء في معمل الحاسوب.",
    type: "Reminder",
  },
];

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
      <span className="date-time">{post.time} · {post.date}</span>
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

// ========= Posts Main Page Component ==========
const Posts: React.FC = () => {
  return (
    <div className="posts-page" dir="rtl">
      <div className="posts-container">
        <h1 className="page-title">آخر الأخبار والإعلانات</h1>

        {postsData.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default Posts;