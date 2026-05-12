"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Save, Users } from "lucide-react";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";
import { useToast } from "@/app/context/ToastContext";
import styles from "./styles/create.module.css";

const API_URL = `${getBaseUrl()}/api`;

interface Faculty {
  faculty_id: number;
  name: string;
}

interface Department {
  dept_id: number;
  name: string;
  faculty: number;
}

interface Student {
  uid: number;
  nid: number;
  name: string;
  phone_number?: string;
}

interface Committee {
  committee_key: string;
  head: { uid: number; dept_id: number };
  assistant: { uid: number; dept_id: number };
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

function CreateUnionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    faculty_id: searchParams.get("faculty") || "",
    president_nid: "",
    vice_president_nid: "",
  });

  const [committees, setCommittees] = useState<Committee[]>(
    COMMITTEES.map(c => ({
      committee_key: c.key,
      head: { uid: 0, dept_id: 0 },
      assistant: { uid: 0, dept_id: 0 },
    }))
  );

  // Fetch faculties
  const fetchFaculties = useCallback(async () => {
    try {
      const response = await authFetch(`${API_URL}/family/faculties/`);
      if (!response.ok) {
        console.warn("Faculties endpoint not available");
        return;
      }
      const data = await response.json();
      setFaculties(data);
    } catch (error) {
      console.warn("Error fetching faculties:", error);
    }
  }, []);

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
    fetchFaculties();
    fetchDepartments();
  }, [fetchFaculties, fetchDepartments]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCommitteeChange = (
    index: number,
    role: "head" | "assistant",
    field: "uid" | "dept_id",
    value: string
  ) => {
    setCommittees(prev => {
      const updated = [...prev];
      updated[index][role][field] = parseInt(value) || 0;
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      showToast("يرجى إدخال اسم الاتحاد", "error");
      return;
    }
    if (!formData.description.trim()) {
      showToast("يرجى إدخال وصف الاتحاد", "error");
      return;
    }
    if (!formData.president_nid) {
      showToast("يرجى إدخال رقم هوية رئيس الاتحاد", "error");
      return;
    }
    if (!formData.vice_president_nid) {
      showToast("يرجى إدخال رقم هوية نائب رئيس الاتحاد", "error");
      return;
    }

    // Validate all committees are filled
    for (let i = 0; i < committees.length; i++) {
      const committee = committees[i];
      if (!committee.head.uid || !committee.head.dept_id) {
        showToast(`يرجى إكمال بيانات رئيس ${COMMITTEES[i].name}`, "error");
        return;
      }
      if (!committee.assistant.uid || !committee.assistant.dept_id) {
        showToast(`يرجى إكمال بيانات مساعد ${COMMITTEES[i].name}`, "error");
        return;
      }
    }

    try {
      setLoading(true);

      const payload = {
        name: formData.name,
        description: formData.description,
        faculty_id: formData.faculty_id ? parseInt(formData.faculty_id) : null,
        president_nid: parseInt(formData.president_nid),
        vice_president_nid: parseInt(formData.vice_president_nid),
        committees: committees,
      };

      const response = await authFetch(`${API_URL}/family/unions/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMsg = typeof errorData === "string" 
          ? errorData 
          : errorData.detail || errorData.message || "فشل إنشاء الاتحاد";
        throw new Error(errorMsg);
      }

      const data = await response.json();
      showToast("تم إنشاء الاتحاد بنجاح", "success");
      router.push(`/uni-level-family/unions/${data.family_id}`);
    } catch (error) {
      console.error("Error creating union:", error);
      const errorMsg = error instanceof Error ? error.message : "فشل إنشاء الاتحاد";
      showToast(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.back()}>
          <ArrowRight size={20} />
        </button>
        <div>
          <h1 className={styles.title}>إنشاء اتحاد جديد</h1>
          <p className={styles.subtitle}>قم بإدخال بيانات الاتحاد وأعضاء اللجان</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Basic Info */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>المعلومات الأساسية</h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>اسم الاتحاد *</label>
              <input
                type="text"
                className={styles.input}
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="مثال: اتحاد طلاب كلية الهندسة"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>الكلية</label>
              <select
                className={styles.select}
                value={formData.faculty_id}
                onChange={(e) => handleInputChange("faculty_id", e.target.value)}
              >
                <option value="">اتحاد عام (بدون كلية)</option>
                {faculties.map(faculty => (
                  <option key={faculty.faculty_id} value={faculty.faculty_id}>
                    {faculty.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup} style={{ gridColumn: "1 / -1" }}>
              <label className={styles.label}>الوصف *</label>
              <textarea
                className={styles.textarea}
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="وصف مختصر عن الاتحاد وأهدافه"
                rows={4}
                required
              />
            </div>
          </div>
        </div>

        {/* Leadership */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>القيادة</h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>رقم هوية رئيس الاتحاد *</label>
              <input
                type="number"
                className={styles.input}
                value={formData.president_nid}
                onChange={(e) => handleInputChange("president_nid", e.target.value)}
                placeholder="أدخل رقم الهوية"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>رقم هوية نائب رئيس الاتحاد *</label>
              <input
                type="number"
                className={styles.input}
                value={formData.vice_president_nid}
                onChange={(e) => handleInputChange("vice_president_nid", e.target.value)}
                placeholder="أدخل رقم الهوية"
                required
              />
            </div>
          </div>
        </div>

        {/* Committees */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>اللجان (7 لجان)</h2>
          <div className={styles.committeesGrid}>
            {COMMITTEES.map((committee, index) => (
              <div key={committee.key} className={styles.committeeCard}>
                <h3 className={styles.committeeTitle}>{committee.name}</h3>
                
                <div className={styles.committeeSection}>
                  <h4 className={styles.committeeSubtitle}>رئيس اللجنة</h4>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>رقم الجامعة (UID)</label>
                      <input
                        type="number"
                        className={styles.input}
                        value={committees[index].head.uid || ""}
                        onChange={(e) => handleCommitteeChange(index, "head", "uid", e.target.value)}
                        placeholder="UID"
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>القسم</label>
                      <select
                        className={styles.select}
                        value={committees[index].head.dept_id || ""}
                        onChange={(e) => handleCommitteeChange(index, "head", "dept_id", e.target.value)}
                        required
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
                      <label className={styles.label}>رقم الجامعة (UID)</label>
                      <input
                        type="number"
                        className={styles.input}
                        value={committees[index].assistant.uid || ""}
                        onChange={(e) => handleCommitteeChange(index, "assistant", "uid", e.target.value)}
                        placeholder="UID"
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>القسم</label>
                      <select
                        className={styles.select}
                        value={committees[index].assistant.dept_id || ""}
                        onChange={(e) => handleCommitteeChange(index, "assistant", "dept_id", e.target.value)}
                        required
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

        {/* Submit */}
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={() => router.back()}
            disabled={loading}
          >
            إلغاء
          </button>
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className={styles.spinner} />
                <span>جاري الإنشاء...</span>
              </>
            ) : (
              <>
                <Save size={20} />
                <span>إنشاء الاتحاد</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function CreateUnionPage() {
  return (
    <Suspense fallback={
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p>جاري التحميل...</p>
      </div>
    }>
      <CreateUnionContent />
    </Suspense>
  );
}
