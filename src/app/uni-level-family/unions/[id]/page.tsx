"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowRight, Edit2, Save, X, Users } from "lucide-react";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";
import { useToast } from "@/app/context/ToastContext";
import styles from "./styles/detail.module.css";

const API_URL = `${getBaseUrl()}/api`;

interface UnionDetail {
  family_id: number;
  name: string;
  description: string;
  faculty: number | null;
  faculty_name: string | null;
  type: string;
  status: string;
  created_at: string;
  updated_at: string;
  president: {
    name: string;
    nid: number;
    phone: string;
    role: string;
  } | null;
  vice_president: {
    name: string;
    nid: number;
    phone: string;
    role: string;
  } | null;
  committee_heads: Array<{
    name: string;
    nid: number;
    phone: string;
    dept_id: number;
    dept_name: string;
    role: string;
  }>;
  committee_assistants: Array<{
    name: string;
    nid: number;
    phone: string;
    dept_id: number;
    dept_name: string;
    role: string;
  }>;
}

interface Department {
  dept_id: number;
  name: string;
}

const COMMITTEES = [
  { key: "cultural", name: "اللجنة الثقافية" },
  { key: "social", name: "اللجنة الاجتماعية" },
  { key: "sports", name: "اللجنة الرياضية" },
  { key: "artistic", name: "اللجنة الفنية" },
  { key: "scientific", name: "اللجنة العلمية" },
  { key: "technical", name: "اللجنة التقنية" },
  { key: "media", name: "اللجنة الإعلامية" },
];

export default function UnionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { showToast } = useToast();
  const unionId = params.id as string;

  const [union, setUnion] = useState<UnionDetail | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit form state
  const [editData, setEditData] = useState({
    name: "",
    description: "",
    president_nid: "",
    vice_president_nid: "",
  });

  const [editCommittees, setEditCommittees] = useState<Array<{
    committee_key: string;
    head: { uid: number; dept_id: number };
    assistant: { uid: number; dept_id: number };
  }>>([]);

  // Fetch union details
  const fetchUnion = useCallback(async () => {
    try {
      setLoading(true);
      const response = await authFetch(`${API_URL}/family/unions/${unionId}/`);
      if (!response.ok) throw new Error("Failed to fetch union");
      const data = await response.json();
      setUnion(data);

      // Initialize edit data
      setEditData({
        name: data.name,
        description: data.description,
        president_nid: data.president?.nid?.toString() || "",
        vice_president_nid: data.vice_president?.nid?.toString() || "",
      });
    } catch (error) {
      console.error("Error fetching union:", error);
      showToast("فشل تحميل بيانات الاتحاد", "error");
    } finally {
      setLoading(false);
    }
  }, [unionId, showToast]);

  // Fetch departments
  const fetchDepartments = useCallback(async () => {
    try {
      const response = await authFetch(`${API_URL}/family/departments/`);
      if (!response.ok) {
        console.warn("Departments endpoint not available");
        return;
      }
      const data = await response.json();
      setDepartments(data);
    } catch (error) {
      console.warn("Error fetching departments:", error);
    }
  }, []);

  useEffect(() => {
    fetchUnion();
    fetchDepartments();
  }, [fetchUnion, fetchDepartments]);

  const handleEdit = () => {
    setIsEditing(true);
    // Initialize committees for editing
    if (union) {
      const initialCommittees = COMMITTEES.map((c, index) => ({
        committee_key: c.key,
        head: {
          uid: 0, // Will need to be filled by user
          dept_id: union.committee_heads[index]?.dept_id || 0,
        },
        assistant: {
          uid: 0, // Will need to be filled by user
          dept_id: union.committee_assistants[index]?.dept_id || 0,
        },
      }));
      setEditCommittees(initialCommittees);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (union) {
      setEditData({
        name: union.name,
        description: union.description,
        president_nid: union.president?.nid?.toString() || "",
        vice_president_nid: union.vice_president?.nid?.toString() || "",
      });
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const payload: any = {
        name: editData.name,
        description: editData.description,
      };

      // Only include president/vice president if changed
      if (editData.president_nid && editData.president_nid !== union?.president?.nid?.toString()) {
        payload.president_nid = parseInt(editData.president_nid);
      }
      if (editData.vice_president_nid && editData.vice_president_nid !== union?.vice_president?.nid?.toString()) {
        payload.vice_president_nid = parseInt(editData.vice_president_nid);
      }

      // Include committees if any are filled
      const filledCommittees = editCommittees.filter(
        c => c.head.uid && c.head.dept_id && c.assistant.uid && c.assistant.dept_id
      );
      if (filledCommittees.length > 0) {
        payload.committees = filledCommittees;
      }

      const response = await authFetch(`${API_URL}/family/unions/${unionId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMsg = typeof errorData === "string" 
          ? errorData 
          : errorData.detail || errorData.message || "فشل تحديث الاتحاد";
        throw new Error(errorMsg);
      }

      showToast("تم تحديث الاتحاد بنجاح", "success");
      setIsEditing(false);
      fetchUnion();
    } catch (error) {
      console.error("Error updating union:", error);
      const errorMsg = error instanceof Error ? error.message : "فشل تحديث الاتحاد";
      showToast(errorMsg, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCommitteeChange = (
    index: number,
    role: "head" | "assistant",
    field: "uid" | "dept_id",
    value: string
  ) => {
    setEditCommittees(prev => {
      const updated = [...prev];
      updated[index][role][field] = parseInt(value) || 0;
      return updated;
    });
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingWrap}>
          <div className={styles.spinner} />
          <p className={styles.loadingText}>جاري تحميل بيانات الاتحاد...</p>
        </div>
      </div>
    );
  }

  if (!union) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <Users size={52} strokeWidth={1.4} />
          <h3>الاتحاد غير موجود</h3>
          <p>لم يتم العثور على الاتحاد المطلوب</p>
          <button className={styles.backButton} onClick={() => router.back()}>
            العودة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.back()}>
          <ArrowRight size={20} />
        </button>
        <div className={styles.headerContent}>
          <div>
            <h1 className={styles.title}>{union.name}</h1>
            <p className={styles.subtitle}>{union.faculty_name || "اتحاد عام"}</p>
          </div>
          <span className={`${styles.statusBadge} ${styles[union.status]}`}>
            {union.status}
          </span>
        </div>
        {!isEditing && (
          <button className={styles.editBtn} onClick={handleEdit}>
            <Edit2 size={18} />
            <span>تعديل</span>
          </button>
        )}
      </header>

      {isEditing ? (
        <div className={styles.editForm}>
          {/* Basic Info */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>المعلومات الأساسية</h2>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>اسم الاتحاد</label>
                <input
                  type="text"
                  className={styles.input}
                  value={editData.name}
                  onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className={styles.formGroup} style={{ gridColumn: "1 / -1" }}>
                <label className={styles.label}>الوصف</label>
                <textarea
                  className={styles.textarea}
                  value={editData.description}
                  onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                />
              </div>
            </div>
          </div>

          {/* Leadership */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>القيادة</h2>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>رقم هوية رئيس الاتحاد</label>
                <input
                  type="number"
                  className={styles.input}
                  value={editData.president_nid}
                  onChange={(e) => setEditData(prev => ({ ...prev, president_nid: e.target.value }))}
                  placeholder="اترك فارغاً للإبقاء على الحالي"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>رقم هوية نائب رئيس الاتحاد</label>
                <input
                  type="number"
                  className={styles.input}
                  value={editData.vice_president_nid}
                  onChange={(e) => setEditData(prev => ({ ...prev, vice_president_nid: e.target.value }))}
                  placeholder="اترك فارغاً للإبقاء على الحالي"
                />
              </div>
            </div>
          </div>

          {/* Committees */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>تحديث اللجان (اختياري)</h2>
            <p className={styles.sectionNote}>املأ البيانات فقط للجان التي تريد تحديثها</p>
            <div className={styles.committeesGrid}>
              {COMMITTEES.map((committee, index) => (
                <div key={committee.key} className={styles.committeeCard}>
                  <h3 className={styles.committeeTitle}>{committee.name}</h3>
                  
                  <div className={styles.committeeSection}>
                    <h4 className={styles.committeeSubtitle}>رئيس اللجنة</h4>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>UID</label>
                        <input
                          type="number"
                          className={styles.input}
                          value={editCommittees[index]?.head.uid || ""}
                          onChange={(e) => handleCommitteeChange(index, "head", "uid", e.target.value)}
                          placeholder="UID"
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>القسم</label>
                        <select
                          className={styles.select}
                          value={editCommittees[index]?.head.dept_id || ""}
                          onChange={(e) => handleCommitteeChange(index, "head", "dept_id", e.target.value)}
                        >
                          <option value="">اختر القسم</option>
                          {departments.map(dept => (
                            <option key={dept.dept_id} value={dept.dept_id}>
                              {dept.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className={styles.committeeSection}>
                    <h4 className={styles.committeeSubtitle}>مساعد رئيس اللجنة</h4>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>UID</label>
                        <input
                          type="number"
                          className={styles.input}
                          value={editCommittees[index]?.assistant.uid || ""}
                          onChange={(e) => handleCommitteeChange(index, "assistant", "uid", e.target.value)}
                          placeholder="UID"
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>القسم</label>
                        <select
                          className={styles.select}
                          value={editCommittees[index]?.assistant.dept_id || ""}
                          onChange={(e) => handleCommitteeChange(index, "assistant", "dept_id", e.target.value)}
                        >
                          <option value="">اختر القسم</option>
                          {departments.map(dept => (
                            <option key={dept.dept_id} value={dept.dept_id}>
                              {dept.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            <button className={styles.cancelBtn} onClick={handleCancelEdit} disabled={saving}>
              <X size={18} />
              <span>إلغاء</span>
            </button>
            <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <div className={styles.spinner} />
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>حفظ التغييرات</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* View Mode */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>المعلومات الأساسية</h2>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>الوصف:</span>
                <span className={styles.infoValue}>{union.description}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>تاريخ الإنشاء:</span>
                <span className={styles.infoValue}>
                  {new Date(union.created_at).toLocaleDateString("ar-EG")}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>آخر تحديث:</span>
                <span className={styles.infoValue}>
                  {new Date(union.updated_at).toLocaleDateString("ar-EG")}
                </span>
              </div>
            </div>
          </div>

          {/* Leadership */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>القيادة</h2>
            <div className={styles.leadershipGrid}>
              {union.president && (
                <div className={styles.leaderCard}>
                  <h3 className={styles.leaderRole}>رئيس الاتحاد</h3>
                  <p className={styles.leaderName}>{union.president.name}</p>
                  <div className={styles.leaderInfo}>
                    <span>رقم الهوية: {union.president.nid}</span>
                    {union.president.phone && <span>الهاتف: {union.president.phone}</span>}
                  </div>
                </div>
              )}
              {union.vice_president && (
                <div className={styles.leaderCard}>
                  <h3 className={styles.leaderRole}>نائب رئيس الاتحاد</h3>
                  <p className={styles.leaderName}>{union.vice_president.name}</p>
                  <div className={styles.leaderInfo}>
                    <span>رقم الهوية: {union.vice_president.nid}</span>
                    {union.vice_president.phone && <span>الهاتف: {union.vice_president.phone}</span>}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Committees */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>اللجان</h2>
            <div className={styles.committeesViewGrid}>
              {COMMITTEES.map((committee, index) => {
                const head = union.committee_heads[index];
                const assistant = union.committee_assistants[index];
                
                return (
                  <div key={committee.key} className={styles.committeeViewCard}>
                    <h3 className={styles.committeeViewTitle}>{committee.name}</h3>
                    {head && (
                      <div className={styles.memberInfo}>
                        <h4 className={styles.memberRole}>رئيس اللجنة</h4>
                        <p className={styles.memberName}>{head.name}</p>
                        <p className={styles.memberDept}>{head.dept_name}</p>
                        <p className={styles.memberDetail}>رقم الهوية: {head.nid}</p>
                      </div>
                    )}
                    {assistant && (
                      <div className={styles.memberInfo}>
                        <h4 className={styles.memberRole}>مساعد رئيس اللجنة</h4>
                        <p className={styles.memberName}>{assistant.name}</p>
                        <p className={styles.memberDept}>{assistant.dept_name}</p>
                        <p className={styles.memberDetail}>رقم الهوية: {assistant.nid}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
