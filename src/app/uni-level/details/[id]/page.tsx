"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import "./ApplicationDetails.css";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";

const rejectionReasons = [
  { id: 1, text: "إزعاج أو تكرار التقديم بشكل غير مبرر" },
  { id: 2, text: "المستندات المرفوعة غير واضحة أو غير صحيحة" },
  { id: 3, text: "وجود بيانات غير صحيحة في الطلب" },
  { id: 4, text: "الدخل المسجل غير مطابق للمستندات" },
  { id: 5, text: "الطلب لا يستوفي شروط الدعم" },
  { id: 6, text: "المستندات لا تخص الطالب" },
  { id: 7, text: "اشتباه في تزوير المستندات" },
  { id: 8, text: "سبب آخر" },
];

const rejectionReasonMap: Record<number, string> = Object.fromEntries(
  rejectionReasons.map((r) => [r.id, r.text])
);

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
  total_discount?: string | number;
  discount_type?: string[];
  m_phone_num?: string;
  f_phone_num?: string;
  housing_status?: string;
  address?: string;
  reason?: string;
  disabilities?: string;
  arrange_of_brothers?: string | number;
  approved_by?: string;
  updated_at?: string;
  req_status?: string;
  rejection_reason?: string | null;
  [key: string]: unknown;
}

// ====== Colored status badge helper ======
function StatusBadge({ status }: { status?: string }) {
  if (!status) return <span>—</span>;

  let cls = "status-badge ";
  if (status === "مقبول") cls += "status-approved";
  else if (status === "مرفوض") cls += "status-rejected";
  else if (status === "منتظر") cls += "status-pending";
  else if (status === "موافقة مبدئية") cls += "status-initial";
  else cls += "status-default";

  return <span className={cls}>{status}</span>;
}

export default function ApplicationDetailsPage() {
  const { id } = useParams();
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
        const baseUrl = getBaseUrl();
        const appRes = await authFetch(
          `${baseUrl}/api/solidarity/super_dept/${id}/applications/`
        );
        if (!appRes.ok) throw new Error("APPLICATION_ERROR");
        const appData = await appRes.json();
        setData(appData as StudentDetail);

        const docsRes = await authFetch(
          `${baseUrl}/api/solidarity/super_dept/${id}/documents/`
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
  }, [id]);

  const openDocument = async (docId: number) => {
    try {
      const baseUrl = getBaseUrl();
      const res = await authFetch(
        `${baseUrl}/api/files/solidarity/${docId}/download/`
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

  const discountTypes: string[] = Array.isArray(data?.discount_type) ? data.discount_type : [];

  return (
    <div className="details-container">
      <button className="btnBack" onClick={() => router.push("/uni-level")}>
        ← العودة
      </button>

      <h2 className="page-title">تفصيل طلب دعم مالي</h2>

      {/* البيانات الأساسية */}
      <section className="section info">
        <h3>البيانات الأساسية</h3>
        <ul>
          <li><strong>رقم التضامن:</strong> {String(data?.solidarity_id ?? "")}</li>
          <li><strong>الاسم:</strong> {data?.student_name}</li>
          <li><strong>الرقم الجامعي:</strong> {String(data?.student_uid ?? "")}</li>
          <li><strong>الكلية:</strong> {data?.faculty_name}</li>
          <li><strong>الحالة الدراسية:</strong> {data?.acd_status}</li>
          <li><strong>عدد أفراد الأسرة:</strong> {String(data?.family_numbers ?? "")}</li>
          <li>
            <strong>حالة الطلب:</strong>{" "}
            <StatusBadge status={data?.req_status} />
          </li>
        </ul>
      </section>

      {/* المعلومات المالية */}
      <section className="section info">
        <h3>المعلومات المالية</h3>
        <ul>
          <li><strong>دخل الأب:</strong> {String(data?.father_income ?? "")}</li>
          <li><strong>دخل الأم:</strong> {String(data?.mother_income ?? "")}</li>
          <li><strong>إجمالي الدخل:</strong> {String(data?.total_income ?? "")}</li>
        </ul>
      </section>

      {/* الخصومات */}
      <section className="section info">
        <h3>الخصم</h3>
        <ul>
          <li>
            <strong>إجمالي الخصم:</strong>{" "}
            {data?.total_discount != null ? String(data.total_discount) : "—"}
          </li>
          <li>
            <strong>أنواع الخصم:</strong>{" "}
         {discountTypes.length > 0 ? (
            <span className="discount-tags">
              {discountTypes.join(", ")}
            </span>
          ) : (
            "—"
          )}
          </li>
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
          <li><strong>الترتيب بين الإخوة:</strong> {String(data?.arrange_of_brothers ?? "")}</li>
          <li><strong>الموافقة من:</strong> {data?.approved_by}</li>
          <li>
            <strong>آخر تحديث:</strong>{" "}
            {data?.updated_at ? new Date(data.updated_at).toLocaleString() : "-"}
          </li>
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
              <div key={String(doc.doc_id ?? "")} className="docCard">
                <p><strong>{String(doc.doc_type ?? "")}</strong></p>
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

      {/* سبب الرفض */}
      {data?.req_status === "مرفوض" && (
        <section className="section info">
          <div className="rejection-highlight">
            <div>
              <div className="rejection-label">سبب الرفض</div>
              <div className="rejection-text">
                {rejectionReasonMap[Number(data?.rejection_reason)] ??
                  data?.rejection_reason ??
                  "لم يُحدد"}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}