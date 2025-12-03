"use client";

import React, { useState, useEffect } from "react";
import "../styles/dashboard.css";
import Activities from "./Activities";
import Members from "./Members";
import Posts from "./Posts";

interface Member {
  id: number;
  name: string;
  role: string;
  department: string;
}

interface Activity {
  id: number;
  title: string;
  status: "coming" | "completed";
  date: string;
  time: string;
}

const Dashboard: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activeTab, setActiveTab] = useState<
    "overview" | "activities" | "members" | "posts"
  >("overview");

  const [showCreateContentForm, setShowCreateContentForm] = useState(false);
  const [showCreateActivityForm, setShowCreateActivityForm] = useState(false);

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
        console.error("Error loading API:", error);
      }
    }
    fetchData();
  }, []);

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
          <span className="summary-count">{activities.length}</span>
          <span>فعالية</span>
        </div>
        <div className="summary-box">
          <span className="summary-count">{members.length}</span>
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

        {activeTab === "posts" && <Posts />}
      </div>

      {/* Popup: Publish Content */}
      {showCreateContentForm && (
        <div className="modal">
          <div className="modal-content">
            <h2>نموذج نشر محتوى</h2>
            <button
              className="close"
              onClick={() => setShowCreateContentForm(false)}
            >
              X
            </button>
            {/* سيتم إضافة الفورم هنا لاحقاً */}
          </div>
        </div>
      )}

      {/* Popup: Create Activity */}
      {showCreateActivityForm && (
        <div className="modal">
          <div className="modal-content">
            <h2>نموذج إنشاء فعالية</h2>
            <button
              className="close"
              onClick={() => setShowCreateActivityForm(false)}
            >
              X
            </button>
            {/* سيتم إضافة الفورم هنا لاحقاً */}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
