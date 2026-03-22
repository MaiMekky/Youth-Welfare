"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./requestDetails.module.css";
import { authFetch } from "@/utils/globalFetch";

export default function RequestDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [faculties, setFaculties] = useState<{ faculty_id: number; name: string }[]>([]);
  const [originalDocuments, setOriginalDocuments] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    const fetchFaculties = async () => {
      const token = localStorage.getItem("access");
      if (!token) return;

      const res = await authFetch(
        "http://127.0.0.1:8000/api/family/faculties/",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const d = await res.json();
      setFaculties(Array.isArray(d) ? d : d.results ?? d.data ?? []);
    };

    fetchFaculties();
  }, []);

  const getCollegeName = (facultyId: number) => {
    const faculty = faculties.find((f) => f.faculty_id === facultyId);
    return faculty ? faculty.name : "غير محدد";
  };

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access");

      const response = await authFetch(
        `http://127.0.0.1:8000/api/solidarity/student/${id}/detail/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const res = await response.json();
      setData(res);

      if (originalDocuments.length === 0 && res?.documents) {
        setOriginalDocuments(res.documents);
      }
    } catch (err) {
      console.error("Error loading details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleOpenDocument = async (docId: number) => {
    try {
      const token = localStorage.getItem("access");
      if (!token) return;

      const response = await authFetch(
        `http://127.0.0.1:8000/api/files/solidarity/${docId}/download/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        console.error("Failed to download document");
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      window.open(url, "_blank");
    } catch (error) {
      console.error("Error opening document:", error);
    }
  };

  if (loading || !data) return <p className={styles.loading}>جاري التحميل...</p>;

  return (
    <div className={styles.container}>
      <div className={styles.contentCard}>
        <button className={styles.backBtn} onClick={() => router.push('/Student/takafol')}>
          ← العودة
        </button>

        <h2 className={styles.pageTitle}>تفاصيل الطلب</h2>

        <section className={styles.section}>
          <h3>بيانات الطالب</h3>
          <div className={styles.infoGrid}>
            <p><strong>الاسم:</strong> {data.student_name as string}</p>
            <p><strong>الكلية:</strong> {getCollegeName(data.faculty as number)}</p>
            <p><strong>التقدير:</strong> {data.grade as string}</p>
            <p><strong>النظام الأكاديمي:</strong> {data.acd_status as string}</p>
            <p><strong>رقم الطلب:</strong> {data.solidarity_id as string}</p>
          </div>
        </section>

        <section className={styles.section}>
          <h3>بيانات الأسرة والدخل</h3>
          <div className={styles.infoGrid}>
            <p><strong>حالة الأب:</strong> {data.father_status as string}</p>
            <p><strong>دخل الأب:</strong> {data.father_income as string}</p>
            <p><strong>حالة الأم:</strong> {data.mother_status as string}</p>
            <p><strong>دخل الأم:</strong> {data.mother_income as string}</p>
            <p><strong>عدد أفراد الأسرة:</strong> {data.family_numbers as string}</p>
            <p><strong>الترتيب بين الإخوة:</strong> {data.arrange_of_brothers as string}</p>
          </div>
        </section>

        <section className={styles.section}>
          <h3>التواصل والعنوان</h3>
          <div className={styles.infoGrid}>
            <p><strong>رقم الأب:</strong> {data.f_phone_num as string}</p>
            <p><strong>رقم الأم:</strong> {data.m_phone_num as string}</p>
            <p><strong>العنوان:</strong> {data.address as string}</p>
            <p><strong>الحالة السكنية:</strong> {data.housing_status as string}</p>
            <p><strong>الإعاقة:</strong> {data.disabilities as string}</p>
            <p><strong>تكافل وكرامة:</strong> {data.sd as string}</p>
          </div>
        </section>

        <section className={styles.section}>
          <h3>سبب طلب الدعم</h3>
          <div className={styles.longText}>{(data.reason as string) || "—"}</div>
        </section>

        <section className={styles.section}>
          <h3>المستندات المرفوعة</h3>
          {originalDocuments && originalDocuments.length > 0 ? (
            <div className={styles.docsContainer}>
              {originalDocuments.map((doc: Record<string, unknown>) => (
                <div key={doc.doc_id as number} className={styles.docCard}>
                  <p><strong>{doc.doc_type as string}</strong></p>
                  <button
                    className={styles.openBtn}
                    onClick={() => handleOpenDocument(doc.doc_id as number)}
                  >
                    فتح الملف
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p>لا توجد ملفات مرفوعة</p>
          )}
        </section>
      </div>
    </div>
  );
}