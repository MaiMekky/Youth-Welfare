"use client";
import React, { useState, useEffect } from "react";
import "../styles/Members.css";
import { UserRound } from "lucide-react";

interface Member {
  student_id: number;
  student_name: string;
  national_id: number;
  u_id: number;
  email: string;
  phone: string;
  role: string;
  status: string;
  joined_at: string;
  dept: number | null;
  dept_name: string | null;
}

interface MembersProps {
  studentId?: number;
}

const Members: React.FC<MembersProps> = ({ studentId }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMembers = async () => {
      if (!studentId) {
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("access");
        const response = await fetch(
          `http://127.0.0.1:8000/api/family/student/${studentId}/members/`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.members && Array.isArray(data.members)) {
            setMembers(data.members);
          }
        } else {
          setError("فشل تحميل الأعضاء");
        }
      } catch (err) {
        console.error("Error fetching members:", err);
        setError("حدث خطأ في الاتصال");
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [studentId]);

  if (loading) {
    return (
      <div className="members-wrapper">
        <div className="members-grid">
          <p>جاري تحميل الأعضاء...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="members-wrapper">
        <div className="members-grid">
          <p style={{ color: "red" }}>{error}</p>
        </div>
      </div>
    );
  }

  const getRoleClass = (role: string): string => {
    if (role === "أخ أكبر" || role === "أخت كبرى") {
      return "leader";
    } else if (role === "أمين لجنة") {
      return "secretary";
    } else if (role === "أمين مساعد لجنة") {
      return "assistant-secretary";
    }
    return "member";
  };

  const displayMembers = members.length > 0 ? members : [];

  return (
    <div className="members-wrapper">
      <div className="members-grid">
        {displayMembers.map((m) => (
          <div key={m.student_id} className="member-card">
            {/* Name + Role Badge + Icon */}
            <div className="member-header">
              <div className="member-name-section">
                <div className="member-name">{m.student_name}</div>
                <div className={`member-role-tag ${getRoleClass(m.role)}`}>
                  {m.role}
                </div>
              </div>
              <div className="member-role-icon">
                <UserRound size={20} color="#5a67d8" />
              </div>
            </div>

            {/* Member Info */}
            <div className="member-info">
              <div className="info-row">
                <span className="info-label">البريد:</span>
                <span className="info-value">{m.email}</span>
              </div>
              <div className="info-row">
                <span className="info-label">الهاتف:</span>
                <span className="info-value">{m.phone}</span>
              </div>
              {m.dept_name && (
                <div className="info-row">
                  <span className="info-label">القسم:</span>
                  <span className="info-value">{m.dept_name}</span>
                </div>
              )}
              <div className="info-row">
                <span className="info-label">انضم في:</span>
                <span className="info-value">{new Date(m.joined_at).toLocaleDateString("ar-EG")}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Members;