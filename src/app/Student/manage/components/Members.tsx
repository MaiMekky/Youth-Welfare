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

const Members: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
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
        const res = await fetch(
          `http://127.0.0.1:8000/api/family/student/families/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("فشل تحميل قائمة الأسر");

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
          setError("لا توجد أسر متاحة");
          setLoading(false);
          return;
        }
        
        // البحث عن أول أسرة بدور "أخ أكبر"
        const elderBrotherFamily = families.find(f => f.role === "أخ أكبر");
        
        if (elderBrotherFamily) {
          setSelectedFamilyId(elderBrotherFamily.family_id);
        } else {
          setError("لا توجد أسرة بدور 'أخ أكبر'");
          setLoading(false);
        }
      } catch (err: any) {
        setError(err.message || "حصل خطأ أثناء تحميل قائمة الأسر");
        setLoading(false);
      }
    };

    fetchFamilyId();
  }, [token]);

  // Second useEffect: Fetch members using the selected family ID
  useEffect(() => {
    if (!selectedFamilyId || !token) return;

    const fetchMembers = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `http://127.0.0.1:8000/api/family/student/${selectedFamilyId}/members/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) throw new Error("فشل تحميل الأعضاء");

        const data = await response.json();
        
        if (data.members && Array.isArray(data.members)) {
          setMembers(data.members);
        } else {
          setMembers([]);
        }
      } catch (err: any) {
        setError(err.message || "حدث خطأ في الاتصال");
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [selectedFamilyId, token]);

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
        {displayMembers.length === 0 ? (
          <p>لا يوجد أعضاء</p>
        ) : (
          displayMembers.map((m) => (
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
                  <span className="info-value">
                    {new Date(m.joined_at).toLocaleDateString("ar-EG")}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Members;