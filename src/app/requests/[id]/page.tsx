"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "../../../services/api";
import styles from "./RequestDetails.module.css";

/*
  What I implemented:
  - GET /api/solidarity/faculty/{id}/applications/  -> fetchApplication()
  - GET /api/solidarity/faculty/{id}/documents/     -> fetchDocuments()
  - POST /api/solidarity/faculty/{id}/pre_approve/  -> handlePreApprove()
  - POST /api/solidarity/faculty/{id}/approve/      -> handleApprove()
  - POST /api/solidarity/faculty/{id}/reject/       -> handleReject()

*/

type Application = {
  solidarity_id?: number;
  student_name?: string;
  student_uid?: string | null;
  faculty_name?: string;
  req_status?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  family_numbers?: number | null;
  father_status?: string | null;
  mother_status?: string | null;
  father_income?: string | null;
  mother_income?: string | null;
  total_income?: string | null;
  arrange_of_brothers?: number | null;
  m_phone_num?: string | null;
  f_phone_num?: string | null;
  reason?: string | null;
  disabilities?: string | null;
  grade?: string | null;
  acd_status?: string | null;
  address?: string | null;
  req_type?: string | null;
  housing_status?: string | null;
  total_discount?: string | null;
  student?: number | null;
  faculty?: number | null;
  approved_by?: number | null;
};

type DocumentItem = {
  doc_id: number;
  solidarity: number;
  doc_type: string;
  file_url: string | null;
  mime_type?: string | null;
  file_size?: number | null;
  uploaded_at?: string | null;
};

export default function RequestDetailsPage() {
  const { id } = useParams(); // faculty id (route param)
  const router = useRouter();

  const [application, setApplication] = useState<Application | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Discounts as select values ("none" or numeric string)
  const [discounts, setDiscounts] = useState({
    books: "none",
    enrollment: "none",
    regular: "none",
    full: "none",
  });

  const baseAmount = 1500;

  useEffect(() => {
    if (!id) return;
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const showNotification = (message: string, type: "success" | "warning" | "error") => {
    setNotification(`${type}:${message}`);
    setTimeout(() => setNotification(null), 3500);
  };

  // Load application & documents
  const loadAll = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchApplication(), fetchDocuments()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplication = async () => {
    try {
      const res = await api.get(`/solidarity/faculty/${id}/applications/`);
      const data = res.data;
      let item: Application | null = null;
      if (Array.isArray(data)) {
        const bySolidarity = data.find((it: any) => String(it.solidarity_id) === String(id));
        item = bySolidarity ?? (data.length > 0 ? data[0] : null);
      } else if (data && typeof data === "object") {
        item = data;
      } else {
        item = null;
      }
      setApplication(item);

      // If server returned a total_discount we could attempt to split it into selects,
      // but since there is no breakdown in the response, we leave selects unchanged.
      // If you want to populate select values from server, return breakdown fields.
    } catch (err: any) {
      console.error("fetchApplication error:", err);
      if (err?.response?.status === 401) showNotification("Unauthorized — please log in.", "error");
      else showNotification("فشل في تحميل بيانات الطلب", "error");
      setApplication(null);
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await api.get(`/solidarity/faculty/${id}/documents/`);
      const data = res.data;
      setDocuments(Array.isArray(data) ? data : data ? [data] : []);
    } catch (err: any) {
      console.error("fetchDocuments error:", err);
      showNotification("فشل في تحميل المستندات", "error");
      setDocuments([]);
    }
  };

  // FILE / DOC helpers
  const formatBytes = (bytes?: number | null) => {
    if (!bytes || bytes <= 0) return "-";
    const units = ["B", "KB", "MB", "GB"];
    let i = 0;
    let val = bytes;
    while (val >= 1024 && i < units.length - 1) {
      val /= 1024;
      i++;
    }
    return `${Math.round(val * 10) / 10} ${units[i]}`;
  };
  const formatDate = (iso?: string | null) => {
    if (!iso) return "-";
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  // Status visibility helpers (adjust if backend uses different status strings)
  const canPreApprove = (status?: string | null) => {
    if (!status) return false;
    return ["pending", "new"].includes(status.toLowerCase());
  };
  const canApprove = (status?: string | null) => {
    if (!status) return false;
    return ["received", "pre_approved", "pre-approved", "preapprove"].includes(status.toLowerCase());
  };
  const canReject = (status?: string | null) => {
    if (!status) return true;
    return status.toLowerCase() !== "final" && status.toLowerCase() !== "rejected";
  };

  // Generic POST action (pre_approve / approve / reject) with optimistic update
  const postAction = async (
    suffix: "pre_approve" | "approve" | "reject",
    optimisticStatus: string,
    successMsg: string
  ) => {
    if (!id) return;
    if (actionLoading) return;
    setActionLoading(true);
    const prevApp = application;
    setApplication((prev) => ({ ...(prev ?? {}), req_status: optimisticStatus }));

    try {
      const res = await api.post(`/solidarity/faculty/${id}/${suffix}/`);
      const data = res.data;
      setApplication((prev) => ({ ...(prev ?? {}), ...(data ?? {}) }));
      await fetchDocuments(); // documents may change after verification actions
      showNotification(successMsg, "success");
      return data;
    } catch (err: any) {
      console.error(`${suffix} error:`, err);
      setApplication(prevApp);
      if (err?.response?.data) {
        const serverMsg =
          typeof err.response.data === "string" ? err.response.data : JSON.stringify(err.response.data);
        showNotification(serverMsg, "error");
      } else {
        showNotification("فشل في تنفيذ الإجراء على الخادم", "error");
      }
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handlePreApprove = async () => {
    await postAction("pre_approve", "received", "تمت الموافقة المبدئية بنجاح");
  };
  const handleApprove = async () => {
    await postAction("approve", "final", "تمت الموافقة النهائية بنجاح");
  };
  const handleReject = async () => {
    await postAction("reject", "rejected", "تم رفض الطلب بنجاح");
  };

  // Discounts UI handling
  const calculateDiscount = () => {
    if (application && application.total_discount) {
      const v = Number(application.total_discount);
      return isNaN(v) ? baseAmount : v;
    }
    if (discounts.full !== "none") return Number(discounts.full) || baseAmount;
    let total = 0;
    total += discounts.books !== "none" ? Number(discounts.books) || 0 : 0;
    total += discounts.enrollment !== "none" ? Number(discounts.enrollment) || 0 : 0;
    total += discounts.regular !== "none" ? Number(discounts.regular) || 0 : 0;
    return total;
  };

  const handleDiscountChange = (field: "books" | "enrollment" | "regular" | "full", value: string) => {
    setDiscounts((prev) => {
      if (field === "full" && value !== "none") {
        return { books: "none", enrollment: "none", regular: "none", full: value };
      }
      if (field !== "full" && prev.full !== "none" && value !== "none") {
        return { ...prev, [field]: value, full: "none" };
      }
      return { ...prev, [field]: value };
    });
  };

  /*
    Assign discounts API (PATCH /api/solidarity/faculty/{id}/assign_discount/)
    Expected payload (per your example):
    {
      "discounts": [
        { "discount_type": "aff_discount", "discount_value": "" }
      ]
    }

    Assumptions & mapping:
    - The backend expects discount_type strings. I provide a mapping object below where you can adjust the exact strings
      to match your backend's expected discount_type values.
    - We will send only the selected discounts (those not "none").
    - Use PATCH as you stated.
  */
  const DISCOUNT_TYPE_MAP: Record<string, string> = {
    // adjust these values if backend uses different names
    books: "books_discount",
    enrollment: "enrollment_discount",
    regular: "regular_discount",
    full: "full_discount",
  };

  const assignDiscounts = async () => {
    if (!id) return;
    if (actionLoading) return;

    // Build discounts payload from UI selections
    const payloadDiscounts: { discount_type: string; discount_value: string }[] = [];

    (Object.keys(discounts) as Array<keyof typeof discounts>).forEach((key) => {
      const val = discounts[key];
      if (val && val !== "none") {
        payloadDiscounts.push({
          discount_type: DISCOUNT_TYPE_MAP[key],
          discount_value: String(val),
        });
      }
    });

    if (payloadDiscounts.length === 0) {
      showNotification("لم يتم اختيار أي خصم لإرساله", "warning");
      return;
    }

    setActionLoading(true);
    const prevApp = application;
    // optimistic: update total_discount and keep breakdown in UI (we don't have server breakdown)
    const optimisticTotal = payloadDiscounts.reduce((sum, d) => sum + Number(d.discount_value || 0), 0);
    setApplication((prev) => ({ ...(prev ?? {}), total_discount: String(optimisticTotal) }));

    try {
      const res = await api.patch(`/solidarity/faculty/${id}/assign_discount/`, { discounts: payloadDiscounts });
      const data = res.data;
      // merge returned fields into application (server may return updated totals)
      setApplication((prev) => ({ ...(prev ?? {}), ...(data ?? {}) }));
      showNotification("تم حفظ الخصومات بنجاح", "success");
      // refresh documents in case assigning discounts triggers doc/state changes
      await fetchDocuments();
    } catch (err: any) {
      console.error("assignDiscounts error:", err);
      // rollback optimistic update
      setApplication(prevApp);
      if (err?.response?.data) {
        const serverMsg =
          typeof err.response.data === "string" ? err.response.data : JSON.stringify(err.response.data);
        showNotification(serverMsg, "error");
      } else {
        showNotification("فشل حفظ الخصومات على الخادم", "error");
      }
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {notification && (
        <div
          className={`${styles.notification} ${
            notification.startsWith("success")
              ? styles.success
              : notification.startsWith("warning")
              ? styles.warning
              : styles.error
          }`}
        >
          {notification.split(":")[1]}
        </div>
      )}

      <h2 className={styles.pageTitle}>تفاصيل الطالب - {application?.student_name ?? "جارٍ التحميل..."}</h2>

      {loading && <p>جارٍ التحميل...</p>}

      <section className={styles.section}>
        <h3>المعلومات الشخصية</h3>
        <div className={styles.infoGrid}>
          <p><strong>الاسم الكامل:</strong> {application?.student_name ?? "-"}</p>
          <p><strong>الرقم القومي / رقم الطالب:</strong> {application?.student_uid ?? "-"}</p>
          <p><strong>الكلية:</strong> {application?.faculty_name ?? "-"}</p>
          <p><strong>حالة الطلب:</strong> {application?.req_status ?? "-"}</p>
          <p><strong>تاريخ التقديم:</strong> {formatDate(application?.created_at)}</p>
          <p><strong>المعدل / الدرجة:</strong> {application?.grade ?? "-"}</p>
          <p><strong>هاتف الأب:</strong> {application?.f_phone_num ?? "-"}</p>
          <p><strong>هاتف الأم:</strong> {application?.m_phone_num ?? "-"}</p>
        </div>
      </section>

      <section className={styles.section}>
        <h3>معلومات الأسرة و الدخل</h3>
        <div className={styles.infoGrid}>
          <p><strong>عدد أفراد الأسرة:</strong> {application?.family_numbers ?? "-"}</p>
          <p><strong>ترتيب الأبناء:</strong> {application?.arrange_of_brothers ?? "-"}</p>
          <p><strong>حالة الأب:</strong> {application?.father_status ?? "-"}</p>
          <p><strong>حالة الأم:</strong> {application?.mother_status ?? "-"}</p>
          <p><strong>دخل الأب:</strong> {application?.father_income ?? "-"}</p>
          <p><strong>دخل الأم:</strong> {application?.mother_income ?? "-"}</p>
          <p><strong>إجمالي الدخل:</strong> {application?.total_income ?? "-"}</p>
          <p><strong>حالة السكن:</strong> {application?.housing_status ?? "-"}</p>
          <p><strong>العنوان:</strong> {application?.address ?? "-"}</p>
        </div>
      </section>

      <section className={styles.section}>
        <h3>معلومات طلب الدعم</h3>
        <div className={styles.infoGrid}>
          <p><strong>الخصم المحسوب:</strong> {calculateDiscount()} جنيه</p>
          <p><strong>إجمالي الخصم من الخادم:</strong> {application?.total_discount ?? "-"}</p>
          <p><strong>سبب التقديم:</strong> {application?.reason ?? "-"}</p>
          <p><strong>إعاقات:</strong> {application?.disabilities ?? "-"}</p>
          <p><strong>الحالة الأكاديمية:</strong> {application?.acd_status ?? "-"}</p>
        </div>
      </section>

      <section className={styles.section}>
        <h3>المستندات</h3>
        {documents.length === 0 ? (
          <p>لا توجد مستندات.</p>
        ) : (
          <table className={styles.docsTable}>
            <thead>
              <tr>
                <th>اسم المستند</th>
                <th>الحجم</th>
                <th>تاريخ الرفع</th>
                <th>رابط / معاينة</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.doc_id}>
                  <td>{doc.doc_type ?? `مستند ${doc.doc_id}`}</td>
                  <td>{formatBytes(doc.file_size)}</td>
                  <td>{formatDate(doc.uploaded_at)}</td>
                  <td>
                    {doc.file_url ? (
                      <>
                        <a className={styles.docLinkButton} href={doc.file_url} target="_blank" rel="noreferrer">
                          عرض / تحميل
                        </a>
                        {doc.mime_type && doc.mime_type.startsWith("image/") && (
                          <img className={styles.docImagePreview} src={doc.file_url ?? ""} alt={doc.doc_type} />
                        )}
                      </>
                    ) : (
                      <span className={styles.noLink}>لا يوجد رابط</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className={styles.docsNote}>
          تُعرض المستندات المرفوعة من الطالب هنا. يمكن فتح كل مستند في نافذة جديدة للمعاينة أو التحميل.
        </div>
      </section>

      <section className={styles.section}>
        <h3>الخصومات المتاحة</h3>
        <div className={styles.discountsBox}>
          <div className={styles.discountSelect}>
            <label>خصم مصاريف الكتب:</label>
            <select value={discounts.books} onChange={(e) => handleDiscountChange("books", e.target.value)}>
              <option value="none">لا يوجد</option>
              <option value="100">100</option>
              <option value="200">200</option>
              <option value="300">300</option>
              <option value="400">400</option>
              <option value="700">700</option>
            </select>
          </div>

          <div className={styles.discountSelect}>
            <label>خصم مصاريف الانتساب:</label>
            <select value={discounts.enrollment} onChange={(e) => handleDiscountChange("enrollment", e.target.value)}>
              <option value="none">لا يوجد</option>
              <option value="100">100</option>
              <option value="200">200</option>
              <option value="300">300</option>
              <option value="400">400</option>
              <option value="700">700</option>
            </select>
          </div>

          <div className={styles.discountSelect}>
            <label>خصم مصاريف الانتظام:</label>
            <select value={discounts.regular} onChange={(e) => handleDiscountChange("regular", e.target.value)}>
              <option value="none">لا يوجد</option>
              <option value="100">100</option>
              <option value="200">200</option>
              <option value="300">300</option>
              <option value="400">400</option>
              <option value="700">700</option>
            </select>
          </div>

          <div className={styles.discountSelect}>
            <label>خصم المصاريف كاملة:</label>
            <select value={discounts.full} onChange={(e) => handleDiscountChange("full", e.target.value)}>
              <option value="none">لا يوجد</option>
              <option value={baseAmount.toString()}>كامل ({baseAmount})</option>
              <option value="1200">1200</option>
              <option value="1400">1400</option>
            </select>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 12 }}>
          <button
            onClick={assignDiscounts}
            disabled={actionLoading}
            className={styles.btnApprove}
          >
            {actionLoading ? "جاري الحفظ..." : "حفظ الخصومات"}
          </button>

          <button
            onClick={() => {
              // reset UI selections to none and reload from server if needed
              setDiscounts({ books: "none", enrollment: "none", regular: "none", full: "none" });
              fetchApplication();
              showNotification("تم إعادة تعيين الاختيارات", "warning");
            }}
            className={styles.btnReject}
            disabled={actionLoading}
          >
            إعادة تعيين
          </button>
        </div>
      </section>

      <div className={styles.actions}>
        {canPreApprove(application?.req_status) && (
          <button onClick={handlePreApprove} disabled={actionLoading} className={styles.btnApprove}>
            {actionLoading ? "جاري..." : "موافقة مبدئية"}
          </button>
        )}

        {canApprove(application?.req_status) && (
          <button onClick={handleApprove} disabled={actionLoading} className={styles.btnApprove}>
            {actionLoading ? "جاري..." : "قبول"}
          </button>
        )}

        {canReject(application?.req_status) && (
          <button onClick={handleReject} disabled={actionLoading} className={styles.btnReject}>
            {actionLoading ? "جاري..." : "رفض"}
          </button>
        )}
      </div>

      {application?.req_status === "final" && <div className={styles.btnReceived}>✅ تم اعتماد الطلب نهائيًا</div>}

      <div className={styles.backContainer}>
        <button onClick={() => router.back()} className={styles.btnBack}>
          رجوع
        </button>
      </div>
    </div>
  );
}