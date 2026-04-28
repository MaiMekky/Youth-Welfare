"use client";
import React, { useState, useEffect } from "react";
import "../styles/Members.css";
import { UserRound } from "lucide-react";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";

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

  useEffect(() => {
    const fetchFamilyId = async () => {
      try {
        const baseUrl = getBaseUrl();
        const res = await authFetch(`${baseUrl}/api/family/student/families/`);
        if (!res.ok) throw new Error("فشل تحميل قائمة الأسر");
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
        setError(err instanceof Error ? err.message : "حصل خطأ أثناء تحميل قائمة الأسر");
        setLoading(false);
      }
    };
    fetchFamilyId();
  }, []);

  useEffect(() => {
    if (!selectedFamilyId) return;
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const baseUrl = getBaseUrl();
        const response = await authFetch(
          `${baseUrl}/api/family/student/${selectedFamilyId}/members/`
        );
        if (!response.ok) throw new Error("فشل تحميل الأعضاء");
        const data = await response.json();
        setMembers(data.members && Array.isArray(data.members) ? data.members : []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "حدث خطأ في الاتصال");
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, [selectedFamilyId]);

  const getRoleClass = (role: string): string => {
    if (role === "أخ أكبر" || role === "أخت كبرى") return "leader";
    if (role === "أمين لجنة") return "secretary";
    if (role === "أمين مساعد لجنة") return "assistant-secretary";
    return "member";
  };

  if (loading) {
    return (
      <div className="members-wrapper">
        <div className="members-grid">
          <p>جاري تحميل الأعضاء…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="members-wrapper">
        <div className="members-grid">
          <p className="error-text">⚠️ {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="members-wrapper">
      <div className="members-grid">
        {members.length === 0 ? (
          <p>لا يوجد أعضاء</p>
        ) : (
          members.map((m) => (
            <div key={m.student_id} className="member-card">

              {/* Header — avatar first in DOM = rightmost in RTL */}
              <div className="member-header">
                <div className="member-role-icon">
                  <UserRound size={20} />
                </div>
                <div className="member-name-section">
                  <div className="member-name">{m.student_name}</div>
                  <div className={`member-role-tag ${getRoleClass(m.role)}`}>
                    {m.role}
                  </div>
                </div>
              </div>

              {/* Info rows */}
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