"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./RequestDetails.module.css";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";
import { useToast } from "@/app/context/ToastContext";

/*
  What I implemented:
  - GET /api/solidarity/faculty/{id}/applications/  -> fetchApplication()
  - GET /api/solidarity/faculty/{id}/documents/     -> fetchDocuments()
  - POST /api/solidarity/faculty/{id}/pre_approve/  -> handleInitialApproval()
  - POST /api/solidarity/faculty/{id}/approve/      -> handleApprove()
  - POST /api/solidarity/faculty/{id}/reject/       -> handleReject()
*/

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
  rejection_reason?: string | null;
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

type Discounts = {
  aff_discount: number[];
  reg_discount: number[];
  bk_discount: number[];
  full_discount: number[];
};

type SelectedDiscounts = {
  bk_discount: string;
  reg_discount: string;
  aff_discount: string;
  full_discount: string;
};

const EMPTY_DISCOUNTS: SelectedDiscounts = {
  bk_discount: "none",
  reg_discount: "none",
  aff_discount: "none",
  full_discount: "none",
};

// ====== Colored status badge ======
function StatusBadge({ status }: { status?: string | null }) {
  if (!status) return <span>—</span>;

  const styleMap: Record<string, React.CSSProperties> = {
    "مقبول":           { background: "#d1fae5", color: "#065f46", border: "1px solid #6ee7b7" },
    "مرفوض":           { background: "#fee2e2", color: "#991b1b", border: "1px solid #fca5a5" },
    "منتظر":           { background: "#fef3c7", color: "#92400e", border: "1px solid #fcd34d" },
    "موافقة مبدئية":   { background: "#e0e7ff", color: "#3730a3", border: "1px solid #a5b4fc" },
  };

  const base: React.CSSProperties = {
    display: "inline-block",
    padding: "3px 14px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: 700,
    letterSpacing: "0.3px",
    verticalAlign: "middle",
    ...(styleMap[status] ?? { background: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db" }),
  };

  return <span style={base}>{status}</span>;
}

// ====== Rejection reason highlight box ======
function RejectionBox({ reason }: { reason?: string | null }) {
  const displayReason = reason
    ? (rejectionReasonMap[Number(reason)] ?? reason)
    : "لم يُحدد سبب الرفض";

  return (
    <div style={{
      background: "linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)",
      border: "1.5px solid #fca5a5",
      borderRight: "5px solid #ef4444",
      borderRadius: "10px",
      padding: "14px 18px",
      marginTop: "12px",
      display: "flex",
      alignItems: "flex-start",
      gap: "10px",
    }}>
      <span style={{ fontSize: "18px", flexShrink: 0, marginTop: "1px" }}>⚠️</span>
      <div>
        <div style={{ fontWeight: 700, color: "#991b1b", fontSize: "14px", marginBottom: "4px" }}>
          سبب الرفض
        </div>
        <div style={{ color: "#7f1d1d", fontSize: "15px", lineHeight: 1.6 }}>
          {displayReason}
        </div>
      </div>
    </div>
  );
}

export default function RequestDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { showToast } = useToast();

  const [application, setApplication] = useState<Application | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const [availableDiscounts, setAvailableDiscounts] = useState<Discounts>({
    bk_discount: [],
    reg_discount: [],
    aff_discount: [],
    full_discount: [],
  });
  const [selectedDiscounts, setSelectedDiscounts] = useState<SelectedDiscounts>(EMPTY_DISCOUNTS);
  const [discountsSaved, setDiscountsSaved] = useState(false);

  // ====== Reject modal state ======
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState<number | null>(null);

  const baseAmount = 1500;

  useEffect(() => {
    if (!id) return;
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadAll = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchApplication(), fetchDocuments(), fetchDiscountValues()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplication = async () => {
    try {
      const baseUrl = getBaseUrl();
      const res = await authFetch(`${baseUrl}/api/solidarity/faculty/${id}/applications/`);
      if (!res.ok) throw new Error("API_ERROR");
      const data = await res.json();
      let item: Application | null = null;
      if (Array.isArray(data)) {
        const bySolidarity = data.find(
          (it: Record<string, unknown>) => String(it.solidarity_id) === String(id)
        );
        item = bySolidarity ?? (data.length > 0 ? data[0] : null);
      } else if (data && typeof data === "object") {
        item = data;
      }
      setApplication(item);
    } catch (err: unknown) {
      console.error("fetchApplication error:", err);
      if (((err as Record<string, unknown>)?.response as Record<string, unknown>)?.status === 401)
        showToast("Unauthorized — please log in.", "error");
      else showToast("فشل في تحميل بيانات الطلب", "error");
      setApplication(null);
    }
  };

  const fetchDocuments = async () => {
    try {
      const baseUrl = getBaseUrl();
      const res = await authFetch(`${baseUrl}/api/solidarity/faculty/${id}/documents/`);
      if (!res.ok) throw new Error("DOCS_ERROR");
      const data = await res.json();
      setDocuments(Array.isArray(data) ? data : data ? [data] : []);
    } catch (err: unknown) {
      console.error("fetchDocuments error:", err);
      showToast("فشل في تحميل المستندات", "error");
      setDocuments([]);
    }
  };

const fetchDiscountValues = async () => {
  try {
    const baseUrl = getBaseUrl();
    const res = await authFetch(`${baseUrl}/api/solidarity/faculty/faculty/discounts/`);
    if (!res.ok) throw new Error("DISCOUNT_ERROR");

    const data = await res.json();

    const discounts = data.discounts || {};

    setAvailableDiscounts({
      bk_discount:   Array.isArray(discounts.bk_discount)   ? discounts.bk_discount   : [],
      reg_discount:  Array.isArray(discounts.reg_discount)  ? discounts.reg_discount  : [],
      aff_discount:  Array.isArray(discounts.aff_discount)  ? discounts.aff_discount  : [],
      full_discount: Array.isArray(discounts.full_discount) ? discounts.full_discount : [],
    });

  } catch (err: unknown) {
    console.error("fetchDiscountValues error:", err);
    showToast("فشل في تحميل discounts", "error");

    setAvailableDiscounts({
      bk_discount: [],
      reg_discount: [],
      aff_discount: [],
      full_discount: [],
    });
  }
};

  const formatDate = (iso?: string | null) => {
    if (!iso) return "-";
    try { return new Date(iso).toLocaleString(); } catch { return iso; }
  };

  const canPreApprove = (status?: string | null) => status === "منتظر";
  const canApprove   = (status?: string | null) => status === "موافقة مبدئية";
  const canReject    = (status?: string | null) =>
    status === "منتظر" || status === "موافقة مبدئية";

  const postAction = async (
    suffix: "pre_approve" | "approve" | "reject",
    optimisticStatus: string,
    successMsg: string
  ) => {
    if (!id || actionLoading) return;
    setActionLoading(true);
    const prevApp = application;
    const baseUrl = getBaseUrl();
    setApplication((prev) => ({ ...(prev ?? {}), req_status: optimisticStatus }));
    try {
      const res = await authFetch(
        `${baseUrl}/api/solidarity/faculty/${id}/${suffix}/`,
        { method: "POST" }
      );
      if (!res.ok) throw new Error("ACTION_ERROR");
      const data = await res.json();
      setApplication((prev) => ({ ...(prev ?? {}), ...(data ?? {}) }));
      await fetchDocuments();
      showToast(successMsg, "success");
      return data;
    } catch (err: unknown) {
      console.error(`${suffix} error:`, err);
      setApplication(prevApp);
      const serverMsg =
        ((err as Record<string, unknown>)?.response as Record<string, unknown>)?.data
          ? typeof ((err as Record<string, unknown>).response as Record<string, unknown>).data === "string"
            ? ((err as Record<string, unknown>).response as Record<string, unknown>).data
            : JSON.stringify(((err as Record<string, unknown>).response as Record<string, unknown>).data)
          : "فشل في تنفيذ الإجراء";
      showToast(serverMsg as string, "error");
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async () => {
    const hasDiscount =
      selectedDiscounts.full_discount !== "none" ||
      selectedDiscounts.bk_discount   !== "none" ||
      selectedDiscounts.aff_discount  !== "none" ||
      selectedDiscounts.reg_discount  !== "none" ||
      (application?.total_discount && Number(application.total_discount) > 0);

    if (!hasDiscount) {
      showToast("يجب اختيار نوع خصم أو تطبيق خصم قبل الموافقة النهائية", "warning");
      return;
    }
    await postAction("approve", "مقبول", "تمت الموافقة النهائية بنجاح");
    window.location.reload();
  };

  const handleInitialApproval = async () => {
    if (!application?.solidarity_id || actionLoading) return;
    setActionLoading(true);
    const baseUrl = getBaseUrl();
    try {
      const response = await authFetch(
        `${baseUrl}/api/solidarity/faculty/${application.solidarity_id}/pre_approve/`,
        { method: "POST" }
      );
      if (!response.ok) throw new Error("PRE_APPROVE_ERROR");
      const data = await response.json();
      setApplication((prev) => ({ ...(prev ?? {}), ...data }));
      showToast("تمت الموافقة مبدئية بنجاح", "success");
      await fetchDocuments();
    } catch (err: unknown) {
      console.error("Initial approval error:", err);
      const serverMsg =
        ((err as Record<string, unknown>)?.response as Record<string, unknown>)?.data
          ? typeof ((err as Record<string, unknown>).response as Record<string, unknown>).data === "string"
            ? ((err as Record<string, unknown>).response as Record<string, unknown>).data
            : JSON.stringify(((err as Record<string, unknown>).response as Record<string, unknown>).data)
          : "فشل في تنفيذ الموافقة مبدئية";
      showToast(serverMsg as string, "error");
    } finally {
      setActionLoading(false);
      window.location.reload();
    }
  };

  // ====== Open reject modal ======
  const openRejectModal = () => {
    setSelectedReason(null);
    setShowRejectModal(true);
  };

  // ====== Handle reject — sends reason as number, displays as string ======
  const handleReject = async () => {
    if (!selectedReason) {
      showToast("يرجى اختيار سبب الرفض", "error");
      return;
    }
    try {
      const response = await authFetch(
        `${getBaseUrl()}/api/solidarity/faculty/${id}/reject/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rejection_reason: selectedReason }),
        }
      );
      if (!response.ok) throw new Error("حدث خطأ أثناء رفض الطلب");
      await response.json();
      setApplication((prev) => ({
        ...(prev ?? {}),
        req_status: "مرفوض",
        rejection_reason: String(selectedReason),
      }));
      setShowRejectModal(false);
      setSelectedReason(null);
      showToast("تم رفض الطلب بنجاح", "error");
      window.location.reload();
    } catch (error) {
      console.error(error);
      showToast("فشل رفض الطلب", "error");
    }
  };

  const calculateDiscount = () => {
    if (application?.total_discount) {
      const v = Number(application.total_discount);
      return isNaN(v) ? baseAmount : v;
    }
    if (selectedDiscounts.full_discount !== "none")
      return Number(selectedDiscounts.full_discount) || baseAmount;
    let total = 0;
    total += selectedDiscounts.bk_discount  !== "none" ? Number(selectedDiscounts.bk_discount)  || 0 : 0;
    total += selectedDiscounts.reg_discount !== "none" ? Number(selectedDiscounts.reg_discount) || 0 : 0;
    total += selectedDiscounts.aff_discount !== "none" ? Number(selectedDiscounts.aff_discount) || 0 : 0;
    return total;
  };

  const handleDiscountChange = (field: keyof SelectedDiscounts, value: string) => {
    setDiscountsSaved(false);
    setSelectedDiscounts((prev) => {
      if (field === "full_discount" && value !== "none") {
        return { bk_discount: "none", reg_discount: "none", aff_discount: "none", full_discount: value };
      }
      if (field !== "full_discount" && prev.full_discount !== "none" && value !== "none") {
        return { ...prev, [field]: value, full_discount: "none" };
      }
      return { ...prev, [field]: value };
    });
  };

  const DISCOUNT_TYPE_MAP: Record<string, string> = {
    bk_discount:   "bk_discount",
    reg_discount:  "reg_discount",
    aff_discount:  "aff_discount",
    full_discount: "full_discount",
  };

  const assignDiscounts = async () => {
    if (!id || actionLoading) return;

    const payloadDiscounts: Record<string, unknown>[] = [];
    (Object.keys(selectedDiscounts) as Array<keyof SelectedDiscounts>).forEach((key) => {
      const val = selectedDiscounts[key];
      if (val && val !== "none") {
        payloadDiscounts.push({ discount_type: DISCOUNT_TYPE_MAP[key], discount_value: String(val) });
      }
    });

    if (payloadDiscounts.length === 0) {
      showToast("لم يتم اختيار أي خصم لإرساله", "warning");
      return;
    }

    setActionLoading(true);
    const prevApp = application;
    const baseUrl = getBaseUrl();
    const optimisticTotal = payloadDiscounts.reduce(
      (sum: number, d: Record<string, unknown>) =>
        sum + Number((d.discount_value as string | number) || 0),
      0
    );
    setApplication((prev) => ({
      ...(prev ?? ({} as Record<string, unknown>)),
      total_discount: String(optimisticTotal),
    }));

    try {
      const res = await authFetch(
        `${baseUrl}/api/solidarity/faculty/${application?.solidarity_id}/assign_discount/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ discounts: payloadDiscounts }),
        }
      );
      if (!res.ok) throw new Error("DISCOUNT_ASSIGN_ERROR");
      const data = await res.json();
      setApplication((prev) => ({ ...(prev ?? {}), ...(data ?? {}) }));
      showToast("تم حفظ الخصومات بنجاح", "success");
      setDiscountsSaved(true);
      await fetchDocuments();
    } catch (err: unknown) {
      console.error("assignDiscounts error:", err);
      setApplication(prevApp);
      const serverMsg =
        ((err as Record<string, unknown>)?.response as Record<string, unknown>)?.data
          ? typeof ((err as Record<string, unknown>).response as Record<string, unknown>).data === "string"
            ? ((err as Record<string, unknown>).response as Record<string, unknown>).data
            : JSON.stringify(((err as Record<string, unknown>).response as Record<string, unknown>).data)
          : "فشل حفظ الخصومات";
      showToast(serverMsg as string, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetDiscounts = () => {
    setSelectedDiscounts(EMPTY_DISCOUNTS);
    setDiscountsSaved(false);
    fetchApplication();
    showToast("تم إعادة تعيين الاختيارات", "warning");
  };

  const openDocument = async (docId: number) => {
    try {
      const baseUrl = getBaseUrl();
      const res = await authFetch(`${baseUrl}/api/files/solidarity/${docId}/download/`);
      if (!res.ok) throw new Error("FILE_ERROR");
      const blob = await res.blob();
      window.open(window.URL.createObjectURL(blob), "_blank");
    } catch (error) {
      console.error("Error opening document:", error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.contentCard}>

        <button onClick={() => router.push("/FacLevel")} className={styles.backBtn}>
          العودة ←
        </button>

        <h2 className={styles.pageTitle}>
          تفاصيل الطالب - {application?.student_name ?? "جارٍ التحميل..."}
        </h2>

        {loading && <p>جارٍ التحميل...</p>}

        {/* ====== المعلومات الشخصية ====== */}
        <section className={styles.section}>
          <h3>المعلومات الشخصية</h3>
          <div className={styles.infoGrid}>
            <p><strong>الاسم الكامل:</strong> {application?.student_name ?? "-"}</p>
            <p><strong>الرقم القومي / رقم الطالب:</strong> {application?.student_uid ?? "-"}</p>
            <p><strong>الكلية:</strong> {application?.faculty_name ?? "-"}</p>
            <p>
              <strong>حالة الطلب:</strong>{" "}
              <StatusBadge status={application?.req_status} />
            </p>
            <p><strong>تاريخ التقديم:</strong> {formatDate(application?.created_at)}</p>
            <p><strong>المعدل / الدرجة:</strong> {application?.grade ?? "-"}</p>
            <p><strong>هاتف الأب:</strong> {application?.f_phone_num ?? "-"}</p>
            <p><strong>هاتف الأم:</strong> {application?.m_phone_num ?? "-"}</p>
          </div>
        </section>

        {/* ====== الأسرة والدخل ====== */}
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

        {/* ====== معلومات طلب الدعم ====== */}
        <section className={styles.section}>
          <h3>معلومات طلب الدعم</h3>
          <div className={styles.infoGrid}>
            <p><strong>إجمالي الخصم:</strong> {application?.total_discount ? `${application.total_discount} جنيه` : "-"}</p>
            <p>
              <strong>نوع الخصم:</strong>{" "}
              {Array.isArray((application as Record<string, unknown>)?.discount_type) && ((application as Record<string, unknown>).discount_type as string[]).length > 0
                ? ((application as Record<string, unknown>).discount_type as string[]).join("، ")
                : "-"}
            </p>
            <p><strong>سبب التقديم:</strong> {application?.reason ?? "-"}</p>
            <p><strong>إعاقات:</strong> {application?.disabilities ?? "-"}</p>
            <p><strong>الحالة الأكاديمية:</strong> {application?.acd_status ?? "-"}</p>
          </div>
        </section>

        {/* ====== المستندات ====== */}
        <section className={styles.section}>
          <h3>المستندات</h3>
          {documents.length === 0 ? (
            <p>لا توجد مستندات.</p>
          ) : (
            <div className={styles.docsContainer}>
              {documents.map((doc) => (
                <div key={doc.doc_id} className={styles.docCard}>
                  <p><strong>{doc.doc_type ?? `مستند ${doc.doc_id}`}</strong></p>
                  {doc.file_url ? (
                    <button onClick={() => openDocument(doc.doc_id)} className={styles.docLinkButton}>
                      افتح الملف
                    </button>
                  ) : (
                    <p className={styles.noLink}>لا يوجد رابط</p>
                  )}
                  <p className={styles.uploadDate}>
                    تم الرفع: {doc.uploaded_at ? doc.uploaded_at.slice(0, 10) : "-"}
                  </p>
                </div>
              ))}
            </div>
          )}
          <div className={styles.docsNote}>
            تُعرض المستندات المرفوعة من الطالب هنا. يمكن فتح كل مستند في نافذة جديدة للمعاينة أو التحميل.
          </div>
        </section>

        {/* ====== سبب الرفض — highlighted ====== */}
        {application?.req_status === "مرفوض" && (
          <section className={styles.section}>
            <RejectionBox reason={application?.rejection_reason} />
          </section>
        )}

        {/* ====== الخصومات ====== */}
        {application?.req_status === "موافقة مبدئية" && (
          <section className={styles.section}>
            <h3>الخصومات المتاحة</h3>
            <div className={styles.discountsBox}>
              <div className={styles.discountSelect}>
                <label>خصم مصاريف الكتب:</label>
                <select
                  value={selectedDiscounts.bk_discount}
                  onChange={(e) => handleDiscountChange("bk_discount", e.target.value)}
                >
                  <option value="none">لا يوجد</option>
                  {availableDiscounts.bk_discount.map((item, i) => (
                    <option key={i} value={item}>{item}</option>
                  ))}
                </select>
              </div>
              <div className={styles.discountSelect}>
                <label>خصم مصاريف الانتساب:</label>
                <select
                  value={selectedDiscounts.aff_discount}
                  onChange={(e) => handleDiscountChange("aff_discount", e.target.value)}
                >
                  <option value="none">لا يوجد</option>
                  {availableDiscounts.aff_discount.map((item, i) => (
                    <option key={i} value={item}>{item}</option>
                  ))}
                </select>
              </div>
              <div className={styles.discountSelect}>
                <label>خصم مصاريف الانتظام:</label>
                <select
                  value={selectedDiscounts.reg_discount}
                  onChange={(e) => handleDiscountChange("reg_discount", e.target.value)}
                >
                  <option value="none">لا يوجد</option>
                  {availableDiscounts.reg_discount.map((item, i) => (
                    <option key={i} value={item}>{item}</option>
                  ))}
                </select>
              </div>
              <div className={styles.discountSelect}>
                <label>خصم المصاريف كاملة:</label>
                <select
                  value={selectedDiscounts.full_discount}
                  onChange={(e) => handleDiscountChange("full_discount", e.target.value)}
                >
                  <option value="none">لا يوجد</option>
                  {availableDiscounts.full_discount.map((item, i) => (
                    <option key={i} value={item}>{item}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 12 }}>
              {!discountsSaved && (
                <button onClick={assignDiscounts} disabled={actionLoading} className={styles.btnApprove}>
                  {actionLoading ? "جاري الحفظ..." : "حفظ الخصومات"}
                </button>
              )}
              <button onClick={handleResetDiscounts} className={styles.btnReject} disabled={actionLoading}>
                إعادة تعيين
              </button>
            </div>
          </section>
        )}

        {/* ====== الأزرار ====== */}
        <div className={styles.actions}>
          {canPreApprove(application?.req_status) && (
            <button onClick={handleInitialApproval} disabled={actionLoading} className={styles.btnApprove}>
              {actionLoading ? "جاري..." : "موافقة مبدئية"}
            </button>
          )}
          {canApprove(application?.req_status) && (
            <button onClick={handleApprove} disabled={actionLoading} className={styles.btnApprove}>
              {actionLoading ? "جاري..." : "مقبول"}
            </button>
          )}
          {canReject(application?.req_status) && (
            <button onClick={openRejectModal} disabled={actionLoading} className={styles.btnReject}>
              رفض
            </button>
          )}
          {application?.req_status === "مقبول" && (
            <div className={styles.btnReceived}>✅ تم اعتماد الطلب نهائيًا</div>
          )}
          {application?.req_status === "مرفوض" && (
            <div className={styles.btnReceived}>❌ تم رفض الطلب</div>
          )}
        </div>

      </div>{/* end contentCard */}

      {/* ====== Reject Modal ====== */}
      {showRejectModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <h3 className={styles.modalTitle}>اختر سبب رفض الطلب</h3>
            <div className={styles.reasonList}>
              {rejectionReasons.map((reason) => (
                <label key={reason.id} className={styles.reasonItem}>
                  <input
                    type="radio"
                    name="rejectReason"
                    value={reason.id}
                    checked={selectedReason === reason.id}
                    onChange={() => setSelectedReason(reason.id)}
                  />
                  {reason.text}
                </label>
              ))}
            </div>
            <div className={styles.modalActions}>
              <button className={styles.btnReject} onClick={handleReject}>
                تأكيد الرفض
              </button>
              <button
                className={styles.btnApprove}
                onClick={() => { setShowRejectModal(false); setSelectedReason(null); }}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}