"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import "./ApplicationDetails.css";
import { authFetch } from "@/utils/globalFetch";

interface StudentDetail {
  solidarity_id?: string | number;
  student_name?: string;
  student_uid?: string | number;
  faculty_name?: string;
  acd_status?: string;
  family_numbers?: string | number;
  father_income?: string | number;
  mother_income?: string | number;
  total_income?: string | number;
  m_phone_num?: string;
  f_phone_num?: string;
  housing_status?: string;
  address?: string;
  reason?: string;
  disabilities?: string;
  arrange_of_brothers?: string | number;
  approved_by?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export default function ApplicationDetailsPage() {
  const { id } = useParams(); // solidarity_id من URL
  const router = useRouter();

  const [data, setData] = useState<StudentDetail | null>(null);
  const [docs, setDocs] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
const fetchData = async () => {
  if (!id) {
    setErrorMsg("لا يوجد معرف للطلب في الرابط");
    setLoading(false);
    return;
  }

  try {
    // ====== جلب بيانات الطلب ======
    const appRes = await authFetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/solidarity/super_dept/${id}/applications/`
    );

    if (!appRes.ok) throw new Error("APPLICATION_ERROR");

    const appData = await appRes.json();
    setData(appData as StudentDetail);

    // ====== جلب المستندات ======
    const docsRes = await authFetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/solidarity/super_dept/${id}/documents/`
    );

    if (!docsRes.ok) throw new Error("DOCS_ERROR");

    const docsData = await docsRes.json();
    setDocs(docsData);

  } catch (err) {
    console.error(err);
    setErrorMsg("حدث خطأ أثناء تحميل البيانات");
  } finally {
    setLoading(false);
  }
};
    fetchData();
  }, [id]);const openDocument = async (docId: number) => {
  try {
    const res = await authFetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/files/solidarity/${docId}/download/`
    );

    if (!res.ok) throw new Error("FILE_ERROR");

    const blob = await res.blob();

    const url = window.URL.createObjectURL(blob);
    window.open(url, "_blank");

  } catch (error) {
    console.error("Error opening document:", error);
  }
};
  if (loading) return <p className="loading">جاري التحميل...</p>;
  if (errorMsg) return <p style={{ color: "red", textAlign: "center", padding: "2rem" }}>{errorMsg}</p>;
  if (!data) return <p style={{ textAlign: "center", padding: "2rem" }}>لا توجد بيانات للطلب</p>;

  return (
    <div className="details-container">
      <button className="btnBack" onClick={() => router.push('/uni-level')}>
        ← العودة
      </button>

      <h2 className="page-title">تفصيل طلب دعم مالي</h2>

      {/* البيانات الأساسية */}
      <section className="section info">
        <h3>البيانات الأساسية</h3>
        <ul>
          <li><strong>رقم التضامن:</strong> {String(data?.solidarity_id ?? '')}</li>
          <li><strong>الاسم:</strong> {data?.student_name}</li>
          <li><strong>الرقم الجامعي:</strong> {String(data?.student_uid ?? '')}</li>
          <li><strong>الكلية:</strong> {data?.faculty_name}</li>
          <li><strong>الحالة الدراسية:</strong> {data?.acd_status}</li>
          <li><strong>عدد أفراد الأسرة:</strong> {String(data?.family_numbers ?? '')}</li>
        </ul>
      </section>

      {/* المعلومات المالية */}
      <section className="section info">
        <h3>المعلومات المالية</h3>
        <ul>
          <li><strong>دخل الأب:</strong> {String(data?.father_income ?? '')}</li>
          <li><strong>دخل الأم:</strong> {String(data?.mother_income ?? '')}</li>
          <li><strong>إجمالي الدخل:</strong> {String(data?.total_income ?? '')}</li>
        </ul>
      </section>

      {/* السكن والاتصال */}
      <section className="section info">
        <h3>معلومات الاتصال والسكن</h3>
        <ul>
          <li><strong>هاتف الأم:</strong> {data?.m_phone_num}</li>
          <li><strong>هاتف الأب:</strong> {data?.f_phone_num}</li>
          <li><strong>السكن:</strong> {data?.housing_status}</li>
          <li><strong>العنوان:</strong> {data?.address}</li>
        </ul>
      </section>

      {/* إضافي */}
      <section className="section info">
        <h3>معلومات إضافية</h3>
        <ul>
          <li><strong>سبب الطلب:</strong> {data?.reason}</li>
          <li><strong>الإعاقة:</strong> {data?.disabilities}</li>
          <li><strong>الترتيب بين الإخوة:</strong> {String(data?.arrange_of_brothers ?? '')}</li>
          <li><strong>الموافقة من:</strong> {data?.approved_by}</li>
          <li><strong>آخر تحديث:</strong> {data?.updated_at ? new Date(data.updated_at).toLocaleString() : '-'}</li>
        </ul>
      </section>

      {/* المستندات المرفوعة */}
      <section className="section documents">
        <h3>المستندات المرفوعة</h3>
        {docs.length === 0 ? (
          <p>لا توجد مستندات.</p>
        ) : (
          <div className="docsContainer">
            {docs.map((doc) => (
              <div key={String(doc.doc_id ?? '')} className="docCard">
                <p><strong>{String(doc.doc_type ?? '')}</strong></p>
                
                <button
                onClick={() => openDocument(Number(doc.doc_id))}
                  className="docLinkButton"
                >
                  افتح الملف
                </button>
                
                <p className="uploadDate">
                  تم الرفع: {doc.uploaded_at ? String(doc.uploaded_at).slice(0, 10) : "-"}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}