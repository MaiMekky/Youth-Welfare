"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./requestDetails.module.css";

export default function RequestDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [faculties, setFaculties] = useState<
    { faculty_id: number; name: string }[]
  >([]);

  const [originalDocuments, setOriginalDocuments] = useState<any[]>([]);

  useEffect(() => {
    const fetchFaculties = async () => {
      const token = localStorage.getItem("access");
      if (!token) return;

      const res = await fetch(
        "http://127.0.0.1:8000/api/solidarity/super_dept/faculties/",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const d = await res.json();
      setFaculties(d);
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

      const response = await fetch(
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

  if (loading || !data) return <p className={styles.loading}>جاري التحميل...</p>;

  return (
    <div className={styles.container}>
      <div className={styles.contentCard}>
        <button className={styles.backBtn} onClick={() => router.back()}>
          ← العودة
        </button>

        <h2 className={styles.pageTitle}>تفاصيل الطلب</h2>

        {/* ====== بيانات الطالب ====== */}
        <section className={styles.section}>
          <h3>بيانات الطالب</h3>
          <div className={styles.infoGrid}>
            <p>
              <strong>الاسم:</strong> {data.student_name}
            </p>
            <p>
              <strong>الكلية:</strong> {getCollegeName(data.faculty)}
            </p>
            <p>
              <strong>التقدير:</strong> {data.grade}
            </p>
            <p>
              <strong>النظام الأكاديمي:</strong> {data.acd_status}
            </p>
            <p>
              <strong>رقم الطلب:</strong> {data.solidarity_id}
            </p>
          </div>
        </section>

        {/* ====== بيانات الأسرة والدخل ====== */}
        <section className={styles.section}>
          <h3>بيانات الأسرة والدخل</h3>
          <div className={styles.infoGrid}>
            <p>
              <strong>حالة الأب:</strong> {data.father_status}
            </p>
            <p>
              <strong>دخل الأب:</strong> {data.father_income}
            </p>
            <p>
              <strong>حالة الأم:</strong> {data.mother_status}
            </p>
            <p>
              <strong>دخل الأم:</strong> {data.mother_income}
            </p>
            <p>
              <strong>عدد أفراد الأسرة:</strong> {data.family_numbers}
            </p>
            <p>
              <strong>الترتيب بين الإخوة:</strong> {data.arrange_of_brothers}
            </p>
          </div>
        </section>

        {/* ====== التواصل والعنوان ====== */}
        <section className={styles.section}>
          <h3>التواصل والعنوان</h3>
          <div className={styles.infoGrid}>
            <p>
              <strong>رقم الأب:</strong> {data.f_phone_num}
            </p>
            <p>
              <strong>رقم الأم:</strong> {data.m_phone_num}
            </p>
            <p>
              <strong>العنوان:</strong> {data.address}
            </p>
            <p>
              <strong>الحالة السكنية:</strong> {data.housing_status}
            </p>
            <p>
              <strong>الإعاقة:</strong> {data.disabilities}
            </p>
            <p>
              <strong>تكافل وكرامة:</strong> {data.sd}
            </p>
          </div>
        </section>

        {/* ====== سبب طلب الدعم ====== */}
        <section className={styles.section}>
          <h3>سبب طلب الدعم</h3>
          <div className={styles.longText}>{data.reason || "—"}</div>
        </section>

        {/* ====== المستندات ====== */}
        <section className={styles.section}>
          <h3>المستندات المرفوعة</h3>

          {originalDocuments && originalDocuments.length > 0 ? (
            <div className={styles.docsContainer}>
              {originalDocuments.map((doc: any) => (
                <div key={doc.doc_id} className={styles.docCard}>
                  <p>
                    <strong>{doc.doc_type}</strong>
                  </p>

                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    افتح الملف
                  </a>
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
