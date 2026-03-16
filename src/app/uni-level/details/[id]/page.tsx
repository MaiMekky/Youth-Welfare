"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import "./ApplicationDetails.css";
import { authFetch } from "@/utils/globalFetch";

export default function ApplicationDetailsPage() {
  const { id } = useParams(); // solidarity_id من URL
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [docs, setDocs] = useState<any[]>([]);
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
      `http://127.0.0.1:8000/api/solidarity/super_dept/${id}/applications/`
    );

    if (!appRes.ok) throw new Error("APPLICATION_ERROR");

    const appData = await appRes.json();
    setData(appData);

    // ====== جلب المستندات ======
    const docsRes = await authFetch(
      `http://127.0.0.1:8000/api/solidarity/super_dept/${id}/documents/`
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
      `http://localhost:8000/api/files/solidarity/${docId}/download/`
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
          <li><strong>رقم التضامن:</strong> {data.solidarity_id}</li>
          <li><strong>الاسم:</strong> {data.student_name}</li>
          <li><strong>الرقم الجامعي:</strong> {data.student_uid}</li>
          <li><strong>الكلية:</strong> {data.faculty_name}</li>
          <li><strong>الحالة الدراسية:</strong> {data.acd_status}</li>
          <li><strong>عدد أفراد الأسرة:</strong> {data.family_numbers}</li>
        </ul>
      </section>

      {/* المعلومات المالية */}
      <section className="section info">
        <h3>المعلومات المالية</h3>
        <ul>
          <li><strong>دخل الأب:</strong> {data.father_income}</li>
          <li><strong>دخل الأم:</strong> {data.mother_income}</li>
          <li><strong>إجمالي الدخل:</strong> {data.total_income}</li>
        </ul>
      </section>

      {/* السكن والاتصال */}
      <section className="section info">
        <h3>معلومات الاتصال والسكن</h3>
        <ul>
          <li><strong>هاتف الأم:</strong> {data.m_phone_num}</li>
          <li><strong>هاتف الأب:</strong> {data.f_phone_num}</li>
          <li><strong>السكن:</strong> {data.housing_status}</li>
          <li><strong>العنوان:</strong> {data.address}</li>
        </ul>
      </section>

      {/* إضافي */}
      <section className="section info">
        <h3>معلومات إضافية</h3>
        <ul>
          <li><strong>سبب الطلب:</strong> {data.reason}</li>
          <li><strong>الإعاقة:</strong> {data.disabilities}</li>
          <li><strong>الترتيب بين الإخوة:</strong> {data.arrange_of_brothers}</li>
          <li><strong>الموافقة من:</strong> {data.approved_by}</li>
          <li><strong>آخر تحديث:</strong> {new Date(data.updated_at).toLocaleString()}</li>
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
              <div key={doc.doc_id} className="docCard">
                <p><strong>{doc.doc_type}</strong></p>
                
                <button
                onClick={() => openDocument(doc.doc_id)}
                  className="docLinkButton"
                >
                  افتح الملف
                </button>
                
                <p className="uploadDate">
                  تم الرفع: {doc.uploaded_at ? doc.uploaded_at.slice(0, 10) : "-"}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}