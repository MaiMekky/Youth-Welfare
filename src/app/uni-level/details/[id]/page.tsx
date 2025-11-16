"use client";

import { useEffect, useState } from "react";
import api from "../../../services/api";
import "./ApplicationDetails.css";

//const FIXED_TEST_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzYzMjU5MDc3LCJpYXQiOjE3NjMyNTAwNzcsImp0aSI6ImQyOWQwNWVkZjJjYjQwY2E5OTRlMWRmZjI0NzM3YTdiIiwiYWRtaW5faWQiOjUsInVzZXJfdHlwZSI6ImFkbWluIiwicm9sZSI6Ilx1MDY0NVx1MDYyZlx1MDY0YVx1MDYzMSBcdTA2MjdcdTA2MmZcdTA2MjdcdTA2MzFcdTA2MjkiLCJuYW1lIjoiXHUwNjJlXHUwNjI3XHUwNjQ0XHUwNjJmIFx1MDYyNVx1MDYyOFx1MDYzMVx1MDYyN1x1MDY0N1x1MDY0YVx1MDY0NSJ9.8pPQh8xC-VczhI6qwNGBnZb3q4jXgAnZ4LO7h_QLZDk";

export default function ApplicationDetailsPage({ params }: any) {
  const { id } = params;

  const [data, setData] = useState<any>(null);
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function fetchAll() {
      try {
        setErrorMsg("");

        console.log("PARAM ID:", id);

        const headers = {
          Authorization: `Bearer ${FIXED_TEST_TOKEN}`,
        };

        // ==========================
        // 1) Application Data
        // ==========================
        const appRes = await api.get(
          `/solidarity/super_dept/${id}/applications/`,
          { headers }
        );
        console.log("Application Response:", appRes.data);
        setData(appRes.data);

        // ==========================
        // 2) Documents
        // ==========================
        const docsRes = await api.get(
          `/solidarity/super_dept/${id}/documents/`,
          { headers }
        );
        console.log("Documents Response:", docsRes.data);
        setDocs(docsRes.data);

      } catch (err: any) {
        console.error("Full Error:", err);

        if (err.response) {
          console.log("ERR STATUS:", err.response.status);
          console.log("ERR DATA:", err.response.data);
          if (err.response.status === 403) {
            setErrorMsg("غير مسموح لك بعرض هذه البيانات (403 Forbidden)");
          } else if (err.response.status === 404) {
            setErrorMsg("الطلب غير موجود (404 Not Found)");
          } else {
            setErrorMsg(`حدث خطأ أثناء تحميل البيانات: ${err.response.status}`);
          }
        } else {
          setErrorMsg("حدث خطأ أثناء تحميل البيانات");
        }

      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, [id]);

  if (loading) return <p>جاري التحميل...</p>;
  if (errorMsg) return <p style={{ color: "red" }}>{errorMsg}</p>;
  if (!data) return <p>لا يوجد بيانات</p>;

  return (
    <div className="details-container">
      <h2 className="page-title">تفصيل طلب دعم مالي</h2>
      <p className="subtitle">
        Financial Support Application Details - All required documents
      </p>

      {/* Documents Section */}
      <section className="section documents">
        <h3>رفع المستندات / Documents Upload</h3>
        <div className="document-list">
          {docs.length === 0 && <p>لا توجد مستندات</p>}
          {docs.map((doc) => (
            <div key={doc.doc_id} className="doc-card">
              <div className="doc-info">
                <h4>{doc.doc_type}</h4>
                <p>File Type: {doc.mime_type}</p>
                <span className="status required">موجود</span>
              </div>
              <a href={doc.file_url} target="_blank" className="view-btn">
                View
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Personal Info */}
      <section className="section info">
        <h3>البيانات الشخصية / Personal Information</h3>
        <ul>
          <li><strong>الاسم:</strong> {data.student_name}</li>
          <li><strong>رقم الطالب:</strong> {data.student_uid}</li>
          <li><strong>الكلية:</strong> {data.faculty_name}</li>
          <li><strong>عدد أفراد الأسرة:</strong> {data.family_numbers}</li>
          <li><strong>الدخل الشهري:</strong> {data.total_income}</li>
          <li><strong>الهاتف:</strong> {data.m_phone_num || "غير متوفر"}</li>
          <li><strong>العنوان:</strong> {data.address}</li>
        </ul>
      </section>
    </div>
  );
}
