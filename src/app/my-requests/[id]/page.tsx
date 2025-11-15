"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./requestDetails.module.css";
import { title } from "process";

export default function RequestDetailsPage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access");

      const response = await fetch(
        `http://127.0.0.1:8000/api/solidarity/student/${id}/detail/`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const res = await response.json();
      setData(res);
    } catch (err) {
      console.error("Error loading details:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) return <p className={styles.pageTitle}>جاري التحميل...</p>;

  return (
    <div className={styles.container}>
    <div className={styles.contentCard}>
    <h2 className={styles.pageTitle}>تفاصيل الطلب</h2>
    <div className={styles.section}>
      <h3>بيانات الطالب</h3>
      <div className={styles.infoGrid}>
        <p><strong>الاسم:</strong> {data.student_name}</p>
        {/* <p><strong>الرقم القومي:</strong> {data.student_uid}</p> */}
        {/* <p><strong>الكلية:</strong> {data.college_name}</p> */}
        {/* <p><strong>الفرقة:</strong> {data.AcademicYear}</p> */}
        {/* <p><strong>الهاتف:</strong> {data.phone}</p> */}
        {/* <p><strong>البريد الإلكتروني:</strong> {data.email}</p> */}
        <p><strong>التقدير:</strong> {data.grade}</p>
        <p><strong>النظام الأكاديمي:</strong> {data.acd_status}</p>
          <p><strong>رقم الطلب:</strong> {data.solidarity_id}</p>
      </div>
    </div>

    <div className={styles.section}>
      <h3>بيانات الأسرة والدخل</h3>
      <div className={styles.infoGrid}>
        <p><strong>حالة الأب:</strong> {data.father_status}</p>
        <p><strong>دخل الأب:</strong> {data.father_income}</p>
        <p><strong>حالة الأم:</strong> {data.mother_status}</p>
        <p><strong>دخل الأم:</strong> {data.mother_income}</p>
        <p><strong>عدد أفراد الأسرة:</strong> {data.family_numbers}</p>
        <p><strong>الترتيب بين الإخوة:</strong> {data.arrange_of_brothers}</p>
      </div>
    </div>

    <div className={styles.section}>
      <h3>التواصل والعنوان</h3>
      <div className={styles.infoGrid}>
        <p><strong>رقم الأب:</strong> {data.f_phone_num}</p>
        <p><strong>رقم الأم:</strong> {data.m_phone_num}</p>
        <p><strong>العنوان:</strong> {data.address}</p>
        <p><strong>الحالة السكنية:</strong> {data.housing_status}</p>
        <p><strong>الإعاقة:</strong> {data.disabilities}</p>
        <p><strong>تكافل وكرامة:</strong> {data.sd}</p>
      </div>
    </div>

    <div className={styles.section}>
      <h3>سبب طلب الدعم</h3>
      <p>{data.reason}</p>
    </div>

  <div className={styles.section}>
  <h3>الملفات المرفوعة</h3>
  {data.documents && data.documents.length > 0 ? (
    data.documents.map((doc: any) => (
      <p key={doc.doc_id}>
        <strong>{doc.doc_type}:</strong>{" "}
        <a href={doc.file_url}rel="noreferrer" className={styles.docLink}>
          عرض الملف
        </a>
      </p>
    ))
  ) : (
    <p>لا توجد ملفات مرفوعة</p>
  )}
</div>

    </div>
  </div>
  );
}
