"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./EventDetails.module.css";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  MapPin,
  Users,
  DollarSign,
  ShieldAlert,
  CheckCircle2,
  Timer,
  Award,
  Medal,
  X,
  Check,
  Eye,
  Image as ImageIcon,
  UploadCloud,
  Trash2,
  FileText,
} from "lucide-react";
import { authFetch } from "@/utils/globalFetch";
const API_URL = "http://localhost:8000";

function getAccessToken(): string | null {
  return (
    localStorage.getItem("access") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    null
  );
}

async function apiFetch<T>(
  path: string,
  opts: RequestInit = {}
): Promise<{ ok: true; data: T } | { ok: false; message: string; status?: number; raw?: any }> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    ...(opts.headers as any),
  };

  // add content-type only if body exists AND not FormData
  const isFormData = typeof FormData !== "undefined" && opts.body instanceof FormData;
  if (!headers["Content-Type"] && opts.body && !isFormData) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await authFetch(`${API_URL}${path}`, { ...opts, headers });
    const text = await res.text();
    const maybeJson = text
      ? (() => {
          try {
            return JSON.parse(text);
          } catch {
            return text;
          }
        })()
      : null;

    if (!res.ok) {
      const msg =
        (typeof maybeJson === "object" &&
          maybeJson &&
          ((maybeJson as any).detail || (maybeJson as any).message || (maybeJson as any).error)) ||
        (typeof maybeJson === "string" ? maybeJson : "") ||
        `طلب غير ناجح (${res.status})`;

      return { ok: false, message: String(msg), status: res.status, raw: maybeJson };
    }

    return { ok: true, data: maybeJson as T };
  } catch (e: any) {
    return { ok: false, message: e?.message || "مشكلة في الاتصال" };
  }
}

/* ===================== Types ===================== */
type ApiParticipant = {
  id: number;
  student_id: string;
  student_name: string;
  rank: number | string | null;
  reward: string | null;
  status: string;
};

type ApiEventImage = {
  doc_id: number;
  event: number;
  doc_type: string;
  file_name: string;
  file_url: string;
  mime_type: string;
  file_size: number;
  uploaded_at: string;
  uploaded_by: number;
  uploaded_by_name: string;
};

type ReportFormState = {
  event_title: string;
  event_code: string;

  male_count: number | "";
  female_count: number | "";
  total_participants: number | "";

  start_date: string;
  duration_days: number | "";

  project_stages: string;
  preparation_stage: string;
  execution_stage: string;
  evaluation_stage: string;
  achieved_goals: string;

  committee_preparation: string;
  committee_organizing: string;
  committee_execution: string;
  committee_purchases: string;
  committee_supervision: string;
  committee_other: string;

  evaluation: "excellent" | "very_good" | "good" | "acceptable";

  suggestions: string;
};

const emptyReportForm: ReportFormState = {
  event_title: "",
  event_code: "",

  male_count: "",
  female_count: "",
  total_participants: "",

  start_date: "",
  duration_days: "",

  project_stages: "",
  preparation_stage: "",
  execution_stage: "",
  evaluation_stage: "",
  achieved_goals: "",

  committee_preparation: "",
  committee_organizing: "",
  committee_execution: "",
  committee_purchases: "",
  committee_supervision: "",
  committee_other: "",

  evaluation: "excellent",

  suggestions: "",
};
type ApiEventDetails = {
  event_id: number;
  created_by_name: string;
  faculty_name: string | null;
  dept_name: string | null;
  family_name: string | null;

  participants?: ApiParticipant[];
  images?: any[];

  title: string;
  description: string;

  cost: string;
  location: string;

  restrictions: string;
  reward: string;
  status: string;

  st_date: string;
  end_date: string;
  s_limit: number;

  type: string;
  resource: string | null;

  selected_facs: number[] | null;
  active: boolean;

  dept: number;
  faculty: number | null;
  created_by: number;
  family: number | null;
};

type StudentRow = {
  id: number;
  name: string;
  studentId: string;
  status: "مقبول" | "منتظر" | "مرفوض";
  reward?: string;
  rank?: string;
};

function mapParticipantStatus(s: string): StudentRow["status"] {
  const x = (s || "").trim();
  if (x === "مؤكد" || x === "تم القبول" || x === "مقبول" || x === "Accepted") return "مقبول";
  if (x === "مرفوض" || x === "Rejected") return "مرفوض";
  return "منتظر";
}

function toRankNumber(v: string | undefined): number | null {
  const s = String(v ?? "").trim();
  if (!s) return null;
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return Math.trunc(n);
}

function formatFileSize(bytes: number) {
  const n = Number(bytes);
  if (!Number.isFinite(n) || n <= 0) return "—";
  const kb = n / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(2)} GB`;
}

function formatDateAr(iso: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("ar-EG");
  } catch {
    return iso;
  }
}

function diffDays(start: string, end: string): number {
  const a = new Date(start);
  const b = new Date(end);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return 0;
  const ms = b.getTime() - a.getTime();
  const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
  return Math.max(days, 0);
}

function pickFilenameFromDisposition(disposition: string | null, fallback: string) {
  if (!disposition) return fallback;
  const m = disposition.match(/filename\*?=(?:UTF-8''|")?([^\";]+)\"?/i);
  if (!m?.[1]) return fallback;
  try {
    return decodeURIComponent(m[1]);
  } catch {
    return m[1];
  }
}

async function downloadPdf(path: string, opts: RequestInit = {}, fallbackName = "file.pdf") {
  const token = getAccessToken();
  const headers: Record<string, string> = { ...(opts.headers as any) };
  if (!headers["Content-Type"] && opts.body) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await authFetch(`${API_URL}${path}`, { ...opts, headers });

  if (!res.ok) {
    const text = await res.text();
    let msg = `طلب غير ناجح (${res.status})`;
    try {
      const j = JSON.parse(text);
      msg = (j?.detail || j?.message || j?.error || msg) as string;
    } catch {
      if (text) msg = text;
    }
    throw new Error(String(msg));
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);

  const filename = pickFilenameFromDisposition(res.headers.get("content-disposition"), fallbackName);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}

/* ===================== Page ===================== */
export default function EventDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = String(params?.id ?? ""); // eventId

  const [event, setEvent] = useState<ApiEventDetails | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(false);

  const [rows, setRows] = useState<StudentRow[]>([]);
  const [busy, setBusy] = useState(false);

  /* ===================== Toast Notification (same style) ===================== */
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "warning";
  }>({ show: false, message: "", type: "success" });

  const toastTimerRef = useRef<number | null>(null);

  const showToast = (message: string, type: "success" | "error" | "warning" = "success") => {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    setNotification({ show: true, message, type });
    toastTimerRef.current = window.setTimeout(() => {
      setNotification({ show: false, message: "", type: "success" });
      toastTimerRef.current = null;
    }, 2500);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  /* ===================== Images ===================== */
  const [images, setImages] = useState<ApiEventImage[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingDocId, setDeletingDocId] = useState<number | null>(null);
  const [docType, setDocType] = useState<string>("event_image");
  const fileRef = useRef<HTMLInputElement | null>(null);

  type ReportErrors = Partial<Record<keyof ReportFormState, string>>;
  const [reportErrors, setReportErrors] = useState<ReportErrors>({});

  const MAX_250_FIELDS: (keyof ReportFormState)[] = [
    "project_stages",
    "preparation_stage",
    "execution_stage",
    "evaluation_stage",
    "achieved_goals",
  ];
      const committeeFields: (keyof ReportFormState)[] = [
      "committee_preparation",
      "committee_organizing",
      "committee_execution",
      "committee_purchases",
      "committee_supervision",
      "committee_other",
    ];

  const validateReportForm = (form: ReportFormState): ReportErrors => {
    const next: ReportErrors = {};

    // required text/date
    if (!form.event_title.trim()) next.event_title = "عنوان الفعالية مطلوب";
    if (!form.event_code.trim()) next.event_code = "كود الفعالية مطلوب";
    if (!form.start_date) next.start_date = "تاريخ البداية مطلوب";

    // required numbers: non-negative integer
    const requireNonNegInt = (key: keyof ReportFormState, v: number | "") => {
      if (v === "") {
        next[key] = "الحقل مطلوب";
        return;
      }
      if (!Number.isFinite(v)) {
        next[key] = "لازم يكون رقم صحيح";
        return;
      }
      if (!Number.isInteger(v)) {
        next[key] = "لازم يكون رقم صحيح بدون كسور";
        return;
      }
      if (v < 0) {
        next[key] = "مينفعش أقل من صفر";
        return;
      }
    };

    requireNonNegInt("male_count", form.male_count);
    requireNonNegInt("female_count", form.female_count);
    requireNonNegInt("total_participants", form.total_participants);
    requireNonNegInt("duration_days", form.duration_days);

    // required + max 250
    for (const k of MAX_250_FIELDS) {
      const v = String(form[k] ?? "").trim();
      if (!v) next[k] = "الحقل مطلوب";
      else if (v.length > 250) next[k] = `الحد الأقصى 250 حرف (حاليًا ${v.length})`;
    }
      for (const k of committeeFields) {
      const v = String(form[k] ?? "").trim();
      if (!v) next[k] = "الحقل مطلوب";
      else if (v.length > 250) next[k] = `الحد الأقصى 250 حرف`;
    }

    if (!form.evaluation) next.evaluation = "التقييم مطلوب";

    if (!form.suggestions.trim()) next.suggestions = "الاقتراحات مطلوبة";


  
    return next;
  };

  const loadEvent = async () => {
    if (!id) return;

    setLoadingEvent(true);
    const res = await apiFetch<ApiEventDetails>(`/api/event/get-events/${id}/`, { method: "GET" });
    setLoadingEvent(false);

    if (!res.ok) {
      showToast(res.message, "error");
      return;
    }

    setEvent(res.data);

    const parts = Array.isArray(res.data.participants) ? res.data.participants : [];
    const mapped: StudentRow[] = parts.map((p) => ({
      id: p.id,
      name: p.student_name ?? "",
      studentId: String(p.student_id ?? ""),
      status: mapParticipantStatus(p.status),
      reward: p.reward ?? "",
      rank: p.rank === null || p.rank === undefined ? "" : String(p.rank),
    }));
    setRows(mapped);
  };

  const loadImages = async () => {
    if (!id) return;
    setLoadingImages(true);
    const res = await apiFetch<ApiEventImage[]>(`/api/event/manage-events/${id}/images/`, { method: "GET" });
    setLoadingImages(false);

    if (!res.ok) {
      console.error(res.message);
      // مش هنوقف الصفحة على فشل الصور
      showToast("تعذر تحميل الصور", "warning");
      return;
    }

    setImages(Array.isArray(res.data) ? res.data : []);
  };

const uploadImages = async (files: FileList | null) => {
  if (!id || !files || files.length === 0) return;

  const token = getAccessToken();
  if (!token) {
    showToast("❌ لا يوجد توكن (access).", "error");
    return;
  }

  setUploading(true);

  try {
    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append("images", f));
    fd.append("doc_type", docType);

    const res = await authFetch(
      `${API_URL}/api/event/manage-events/${id}/upload-images/`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: fd,
      }
    );

    let errorMessage = "";
    let successMessage = "";

    if (!res.ok) {
      try {
        const data = await res.json();
        if (data.detail) {
          switch (data.detail) {
            case "Only the event creator can upload images for this event":
              errorMessage = "❌ لا يمكنك رفع الصور إلا إذا كنت منشئ النشاط";
              break;
            default:
              errorMessage = `❌ ${data.detail}`;
          }
        }

        else if (data.images && Array.isArray(data.images)) {
          const messages: string[] = [];
          data.images.forEach((msg: string) => {
            if (msg.includes("exceeds")) {
              messages.push("❌ حجم الصورة أكبر من 20 ميجابايت");
            } else if (msg.includes("invalid extension")) {
              messages.push("❌ الصورة يجب أن تكون بصيغة jpg أو jpeg أو png أو pdf");
            } else {
              messages.push(`❌ ${msg}`);
            }
          });
          errorMessage = messages.join(", ");
        }
        else if (data.doc_type && Array.isArray(data.doc_type)) {
          errorMessage = "❌ نوع المستند غير مدعوم";
        }
      } catch (err) {
        console.error("Error parsing server response:", err);
        errorMessage = "❌ حدث خطأ أثناء رفع الصور";
      }
    } else {
      successMessage = "✅ تم رفع الصور بنجاح";
    }
    if (errorMessage) showToast(errorMessage, "error");
    if (successMessage) showToast(successMessage, "success");

    if (fileRef.current) fileRef.current.value = "";

    if (!errorMessage) {
      await loadImages(); 
    }
  } finally {
    setUploading(false);
  }
};
  const deleteImage = async (docId: number) => {
    if (!id || !docId) return;

    setDeletingDocId(docId);
    const res = await apiFetch<any>(`/api/event/manage-events/${id}/images/${docId}/`, { method: "DELETE" });
    setDeletingDocId(null);

    if (!res.ok) {
      showToast(res.message, "error");
      return;
    }

    setImages((prev) => prev.filter((x) => x.doc_id !== docId));
    showToast("✅ تم مسح الصورة", "success");
  };

  useEffect(() => {
    loadEvent();
    loadImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const [reportOpen, setReportOpen] = useState(false);
  const [reportForm, setReportForm] = useState<ReportFormState>(emptyReportForm);

  const openReportModal = () => {
    const start = event?.st_date ?? "";
    const end = event?.end_date ?? "";

    setReportForm({
      event_title: event?.title ?? "",
      event_code: String(event?.event_id ?? id ?? ""),
      male_count: "",
      female_count: "",
      total_participants: rows.length || "",
      start_date: start,
      duration_days: start && end ? diffDays(start, end) : "",
      project_stages: "",
      preparation_stage: "",
      execution_stage: "",
      evaluation_stage: "",
      achieved_goals: "",
      committee_preparation: "",
      committee_organizing: "",
      committee_execution: "",
      committee_purchases: "",
      committee_supervision: "",
      committee_other: "",
      evaluation: "excellent",
      suggestions: "",
    });

    setReportErrors({});
    setReportOpen(true);
  };

  const closeReportModal = () => setReportOpen(false);

  const setReportField = <K extends keyof ReportFormState>(key: K, value: ReportFormState[K]) => {
    setReportForm((p) => ({ ...p, [key]: value }));
    setReportErrors((p) => ({ ...p, [key]: undefined }));
  };

  /* ===================== Derived UI ===================== */
  const ui = useMemo(() => {
    if (!event) {
      return {
        title: "",
        subtitle: "معلومات شاملة عن تفاصيل الفعالية والمشاركين",
        status: "",
        type: "",
        scope: "",
        cost: "",
        startDate: "",
        endDate: "",
        location: "",
        reward: "",
        constraints: "",
        description: "",
        max: 0,
      };
    }

    const scope = event.dept_name ? `على مستوى ${event.dept_name}` : event.dept ? `القسم رقم ${event.dept}` : "—";

    const costNum = Number(String(event.cost ?? "").trim());
    const costText = !Number.isFinite(costNum) || costNum === 0 ? "مجاني" : `${costNum} جنيه`;

    return {
      title: event.title ?? "",
      subtitle: "معلومات شاملة عن تفاصيل الفعالية والمشاركين",
      status: event.status ?? "",
      type: event.type ?? "",
      scope,
      cost: costText,
      startDate: event.st_date ?? "",
      endDate: event.end_date ?? "",
      location: event.location ?? "",
      reward: (event.reward ?? "").trim() || "—",
      constraints: (event.restrictions ?? "").trim() || "—",
      description: (event.description ?? "").trim() || "—",
      max: Number(event.s_limit ?? 0),
    };
  }, [event]);

  const registered = rows.length;
  const remaining = Math.max(ui.max - registered, 0);

  const rewardsCount = rows.filter((r) => (r.reward ?? "").trim().length > 0).length;
  const ranksCount = rows.filter((r) => (r.rank ?? "").trim().length > 0).length;

  /* ===================== Inline edit ===================== */
  const [editingRewardId, setEditingRewardId] = useState<number | null>(null);
  const [editingRankId, setEditingRankId] = useState<number | null>(null);
  const [draftReward, setDraftReward] = useState("");
  const [draftRank, setDraftRank] = useState("");

  const startEditReward = (row: StudentRow) => {
    setEditingRankId(null);
    setEditingRewardId(row.id);
    setDraftReward(row.reward ?? "");
  };
  const cancelReward = () => {
    setEditingRewardId(null);
    setDraftReward("");
  };

  const startEditRank = (row: StudentRow) => {
    setEditingRewardId(null);
    setEditingRankId(row.id);
    setDraftRank(row.rank ?? "");
  };
  const cancelRank = () => {
    setEditingRankId(null);
    setDraftRank("");
  };

  /* ===================== Participants APIs ===================== */
  const approveAll = async () => {
    if (!id) return;
    try {
      setBusy(true);
      const res = await apiFetch<any>(`/api/event/manage-participants/${id}/approve-all-participants/`, {
        method: "PATCH",
      });
      setBusy(false);

      if (!res.ok) {
        showToast(res.message, "error");
        return;
      }

      await loadEvent();
      showToast("✅ تم قبول الجميع بنجاح", "success");
    } catch {
      setBusy(false);
      showToast("حدث خطأ ما.", "error");
    }
  };

  const approveParticipant = async (studentId: string) => {
    if (!id || !studentId) return;
    try {
      setBusy(true);
      const res = await apiFetch<any>(`/api/event/manage-participants/${id}/participants/${studentId}/approve/`, {
        method: "PATCH",
      });
      setBusy(false);

      if (!res.ok) {
        showToast(res.message, "error");
        return;
      }

      await loadEvent();
      showToast("✅ تم قبول الطالب", "success");
    } catch {
      setBusy(false);
      showToast("حدث خطأ ما.", "error");
    }
  };

  const rejectParticipant = async (studentId: string) => {
    if (!id || !studentId) return;
    try {
      setBusy(true);
      const res = await apiFetch<any>(`/api/event/manage-participants/${id}/participants/${studentId}/reject/`, {
        method: "PATCH",
      });
      setBusy(false);

      if (!res.ok) {
        showToast(res.message, "error");
        return;
      }

      await loadEvent();
      showToast("❌ تم رفض الطالب", "warning");
    } catch {
      setBusy(false);
      showToast("حدث خطأ ما.", "error");
    }
  };

  const assignResult = async (studentId: string, rank: number | null, reward: string) => {
    if (!id || !studentId) return;

    try {
      setBusy(true);
      const res = await apiFetch<any>(`/api/event/manage-participants/${id}/participants/${studentId}/assign-result/`, {
        method: "PATCH",
        body: JSON.stringify({ rank, reward }),
      });
      setBusy(false);

      if (!res.ok) {
        showToast(res.message, "error");
        return;
      }

      setEditingRankId(null);
      setEditingRewardId(null);
      setDraftRank("");
      setDraftReward("");

      await loadEvent();
      showToast("✅ تم حفظ النتيجة بنجاح", "success");
    } catch {
      setBusy(false);
      showToast("حدث خطأ ما.", "error");
    }
  };

  const saveReward = async (rowId: number) => {
    const row = rows.find((r) => r.id === rowId);
    if (!row) return;

    const rankNum = toRankNumber(row.rank);
    await assignResult(row.studentId, rankNum, draftReward);
  };

   const saveRank = async (rowId: number) => {
      const row = rows.find((r) => r.id === rowId);
      if (!row) return;

      const value = draftRank.trim();
      if (!value) {
        showToast("⚠️ من فضلك أدخل رقم الترتيب", "warning");
        return;
      }

      if (!/^\d+$/.test(value)) {
        showToast("❌ الترتيب يجب أن يكون رقم صحيح فقط", "error");
        return;
      }

      const rankNum = Number(value);

      await assignResult(row.studentId, rankNum, row.reward ?? "");
    };

  const pendingCount = rows.filter((r) => r.status === "منتظر").length;
  const isFacultyEvent = (event?.faculty ?? null) !== null;
  const statusBadgeClass = useMemo(() => {
    const s = (ui.status || "").trim();
    if (s === "نشط") return styles.badgeSuccess;
    if (s === "منتظر") return styles.badgeBlue;
    if (s === "غير نشط" || s === "ملغي" || s === "مرفوض") return (styles as any).badgeDanger || styles.badgeBlue;
    return styles.badgeBlue;
  }, [ui.status]);

  const [exportBusy, setExportBusy] = useState<null | "report" | "summary">(null);

  const submitReportPdf = async () => {
    if (!id) return;

    const errs = validateReportForm(reportForm);
    setReportErrors(errs);
    if (Object.keys(errs).length) {
      showToast("⚠️ برجاء استكمال البيانات المطلوبة", "warning");
      return;
    }
    const body = {
      event_title: reportForm.event_title.trim(),
      event_code: reportForm.event_code.trim(),

      male_count: Number(reportForm.male_count),
      female_count: Number(reportForm.female_count),
      total_participants: Number(reportForm.total_participants),

      start_date: reportForm.start_date,
      duration_days: Number(reportForm.duration_days),

      project_stages: reportForm.project_stages.trim(),
      preparation_stage: reportForm.preparation_stage.trim(),
      execution_stage: reportForm.execution_stage.trim(),
      evaluation_stage: reportForm.evaluation_stage.trim(),
      achieved_goals: reportForm.achieved_goals.trim(),

      committee_preparation: reportForm.committee_preparation.trim(),
      committee_organizing: reportForm.committee_organizing.trim(),
      committee_execution: reportForm.committee_execution.trim(),
      committee_purchases: reportForm.committee_purchases.trim(),
      committee_supervision: reportForm.committee_supervision.trim(),
      committee_other: reportForm.committee_other.trim(),

      evaluation: reportForm.evaluation,

      suggestions: [reportForm.suggestions.trim()],
    };

    try {
      setExportBusy("report");
      await downloadPdf(
        `/api/event/reports/${id}/pdf/`,
        { method: "POST", body: JSON.stringify(body) },
        `event_${id}_report.pdf`
      );
      setReportOpen(false);
      showToast("✅ تم تنزيل تقرير الفعالية", "success");
    } catch (e: any) {
      showToast(e?.message || "حصل خطأ أثناء تصدير تقرير الفعالية", "error");
    } finally {
      setExportBusy(null);
    }
  };

  const exportEventSummary = async () => {
    if (!id) return;

    try {
      setExportBusy("summary");
      await downloadPdf(
        `/api/event/summary-reports/${id}/summary-pdf/`,
        { method: "GET" },
        `event_${id}_summary.pdf`
      );
      showToast("✅ تم تنزيل ملخص الفعالية", "success");
    } catch (e: any) {
      showToast(e?.message || "حصل خطأ أثناء تصدير ملخص الفعالية", "error");
    } finally {
      setExportBusy(null);
    }
  };

  const participantBadgeClass = (s: StudentRow["status"]) => {
    if (s === "مقبول") return styles.participantAccepted;
    if (s === "منتظر") return styles.participantPending;
    return styles.participantRejected;
  };

  return (
    <div className={styles.page}>
      {/* ✅ Toast notification (same style you gave me) */}
      {notification.show && (
        <div
          className={`${styles.notification} ${
            notification.type === "success"
              ? styles.success
              : notification.type === "error"
              ? styles.error
              : styles.warning
          }`}
        >
          {notification.message}
        </div>
      )}

      <div className={styles.container}>
        <div className={styles.topBar}>
          <div className={styles.headText}>
            <h1 className={styles.pageTitle}>تفاصيل الفعالية</h1>
            <p className={styles.pageSubtitle}>{ui.subtitle}</p>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <button
              className={styles.actionBtn}
              type="button"
              onClick={exportEventSummary}
              disabled={exportBusy !== null}
              style={{ opacity: exportBusy !== null ? 0.7 : 1 }}
              title="تصدير ملخص الفعالية PDF"
            >
              <FileText size={18} />
              {exportBusy === "summary" ? "جاري التصدير..." : "ملخص الفعالية"}
            </button>

            <button
              className={styles.actionBtn}
              type="button"
              onClick={openReportModal}
              disabled={exportBusy !== null || !event}
              style={{ opacity: exportBusy !== null || !event ? 0.7 : 1 }}
              title="تصدير تقرير الفعالية PDF"
            >
              <FileText size={18} />
              {exportBusy === "report" ? "جاري التصدير..." : "تقرير الفعالية"}
            </button>

            <button
              className={styles.backBtn}
              onClick={() => router.push("/uni-level-activities")}
              type="button"
              disabled={exportBusy !== null}
              style={{ opacity: exportBusy !== null ? 0.7 : 1 }}
            >
              <ArrowRight size={18} />
              العودة للفعاليات
            </button>
          </div>
        </div>

        {loadingEvent && (
          <div style={{ fontWeight: 800, opacity: 0.8, margin: "10px 0" }}>جاري تحميل بيانات الفعالية...</div>
        )}

        <div className={styles.hero}>
          <div className={styles.heroTitle}>{ui.title || "—"}</div>
        </div>

        <div className={styles.statsRow}>
          <div className={`${styles.statCard} ${styles.statAmber}`}>
            <div className={styles.statIcon}>
              <Users size={20} />
            </div>
            <div className={styles.statText}>
              <div className={styles.statLabel}>المقاعد المتبقية</div>
              <div className={styles.statValue}>{remaining}</div>
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.statGreen}`}>
            <div className={styles.statIcon}>
              <CheckCircle2 size={20} />
            </div>
            <div className={styles.statText}>
              <div className={styles.statLabel}>الحد الأقصى</div>
              <div className={styles.statValue}>{ui.max}</div>
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.statIndigo}`}>
            <div className={styles.statIcon}>
              <Users size={20} />
            </div>
            <div className={styles.statText}>
              <div className={styles.statLabel}>العدد الحالي</div>
              <div className={styles.statValue}>{registered}</div>
            </div>
          </div>
        </div>

        <section className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <div className={styles.infoLabel}>
              <DollarSign size={16} /> التكلفة
            </div>
            <div className={styles.infoValue}>{ui.cost}</div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoLabel}>
              <ShieldAlert size={16} /> حالة الفعالية
            </div>
            <div className={statusBadgeClass}>{ui.status || "—"}</div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoLabel}>
              <Users size={16} /> نطاق الفعالية
            </div>
            <div className={styles.infoValue}>{ui.scope || "—"}</div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoLabel}>
              <Timer size={16} /> نوع الفعالية
            </div>
            <div className={styles.badgeBlue}>{ui.type || "—"}</div>
          </div>

          <div className={`${styles.infoCard} ${styles.infoWide}`}>
            <div className={styles.infoLabel}>
              <MapPin size={16} /> المكان
            </div>
            <div className={styles.infoValue}>{ui.location || "—"}</div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoLabel}>
              <CalendarDays size={16} /> تاريخ البداية
            </div>
            <div className={styles.infoValue} dir="ltr">
              {ui.startDate || "—"}
            </div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoLabel}>
              <CalendarDays size={16} /> تاريخ النهاية
            </div>
            <div className={styles.infoValue} dir="ltr">
              {ui.endDate || "—"}
            </div>
          </div>
        </section>

        <section className={styles.twoCols}>
          <div className={styles.block}>
            <div className={styles.blockTitle}>المكافأة</div>
            <div className={styles.blockBody}>{ui.reward}</div>
          </div>

          <div className={styles.block}>
            <div className={styles.blockTitle}>القيود والشروط</div>
            <div className={styles.blockBody}>{ui.constraints}</div>
          </div>
        </section>

        <section className={styles.block}>
          <div className={styles.blockTitle}>وصف الفعالية</div>
          <div className={styles.blockBody}>{ui.description}</div>
        </section>

        {/* ===================== Images Component ===================== */}
        <section className={styles.imagesBlock}>
          <div className={styles.imagesHead}>
            <div className={styles.imagesTitle}>
              <ImageIcon size={18} />
              صور الفعالية
            </div>
          {(  !isFacultyEvent &&
            <div className={styles.imagesActions}>
              <input
                ref={fileRef}
                className={styles.fileInput}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => uploadImages(e.target.files)}
                disabled={uploading}
              />

              <button
                type="button"
                className={styles.uploadBtn}
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                title="إضافة صورة"
              >
                <UploadCloud size={18} />
                {uploading ? "جاري الرفع..." : "إضافة صورة"}
              </button>
            </div>
          )}
          </div>

          {loadingImages ? (
            <div style={{ fontWeight: 800, opacity: 0.8 }}>جاري تحميل الصور...</div>
          ) : images.length === 0 ? (
            <div className={styles.emptyImages}>لا توجد صور مضافة حتى الآن</div>
          ) : (
            <div className={styles.imagesGrid}>
              {images.map((img) => (
                <div key={img.doc_id} className={styles.imageCard}>
                  <div className={styles.imagePreview}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.file_url} alt={img.file_name} />
                  </div>

                  <div className={styles.imageMeta}>
                    <div className={styles.imageName} title={img.file_name}>
                      {img.file_name}
                    </div>
                  </div>

                  <div className={styles.imageBtns}>
                    <a className={styles.viewLink} href={img.file_url} target="_blank" rel="noreferrer">
                      <Eye size={16} />
                      عرض الصورة
                    </a>
                {!isFacultyEvent && (
                    <button
                      type="button"
                      className={styles.deleteImgBtn}
                      onClick={() => deleteImage(img.doc_id)}
                      disabled={deletingDocId === img.doc_id}
                      title="مسح"
                    >
                      <Trash2 size={16} />
                      {deletingDocId === img.doc_id ? "..." : "مسح الصورة"}
                    </button>
                     )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {reportOpen && !isFacultyEvent && (
          <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-label="تقرير الفعالية">
            <div className={styles.modalCard}>
              <div className={styles.modalHead}>
                <div>
                  <div className={styles.modalTitle}>تقرير الفعالية</div>
                  <div className={styles.modalSub}>املئي البيانات المطلوبة ثم اضغطي تنزيل</div>
                </div>

                <button className={styles.modalClose} type="button" onClick={closeReportModal} disabled={exportBusy !== null}>
                  <X size={18} />
                </button>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.modalGrid2}>
                  <div className={styles.modalField}>
                    <label className={styles.modalLabel}>عنوان الفعالية</label>
                    <input
                      className={styles.modalInput}
                      value={reportForm.event_title}
                      onChange={(e) => setReportField("event_title", e.target.value)}
                      placeholder="عنوان الفعالية"
                    />
                    {reportErrors.event_title && <div className={styles.modalError}>{reportErrors.event_title}</div>}
                  </div>

                  <div className={styles.modalField}>
                    <label className={styles.modalLabel}>كود الفعالية</label>
                    <input
                      className={styles.modalInput}
                      value={reportForm.event_code}
                      onChange={(e) => setReportField("event_code", e.target.value)}
                      placeholder="مثال: EVT-001"
                    />
                    {reportErrors.event_code && <div className={styles.modalError}>{reportErrors.event_code}</div>}
                  </div>

                  <div className={styles.modalField}>
                    <label className={styles.modalLabel}>عدد الذكور</label>
                    <input
                      className={styles.modalInput}
                      type="number"
                      min={0}
                      value={reportForm.male_count}
                      onChange={(e) => setReportField("male_count", e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="0"
                    />
                    {reportErrors.male_count && <div className={styles.modalError}>{reportErrors.male_count}</div>}
                  </div>

                  <div className={styles.modalField}>
                    <label className={styles.modalLabel}>عدد الإناث</label>
                    <input
                      className={styles.modalInput}
                      type="number"
                      min={0}
                      value={reportForm.female_count}
                      onChange={(e) => setReportField("female_count", e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="0"
                    />
                    {reportErrors.female_count && <div className={styles.modalError}>{reportErrors.female_count}</div>}
                  </div>

                  <div className={styles.modalField}>
                    <label className={styles.modalLabel}>إجمالي المشاركين</label>
                    <input
                      className={styles.modalInput}
                      type="number"
                      min={0}
                      value={reportForm.total_participants}
                      onChange={(e) =>
                        setReportField("total_participants", e.target.value === "" ? "" : Number(e.target.value))
                      }
                      placeholder="0"
                    />
                    {reportErrors.total_participants && (
                      <div className={styles.modalError}>{reportErrors.total_participants}</div>
                    )}
                  </div>

                  <div className={styles.modalField}>
                    <label className={styles.modalLabel}>تاريخ البداية</label>
                    <input
                      className={styles.modalInput}
                      type="date"
                      value={reportForm.start_date}
                      onChange={(e) => setReportField("start_date", e.target.value)}
                    />
                    {reportErrors.start_date && <div className={styles.modalError}>{reportErrors.start_date}</div>}
                  </div>

                  <div className={styles.modalField}>
                    <label className={styles.modalLabel}>مدة التنفيذ (بالأيام)</label>
                    <input
                      className={styles.modalInput}
                      type="number"
                      min={0}
                      value={reportForm.duration_days}
                      onChange={(e) => setReportField("duration_days", e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="0"
                    />
                    {reportErrors.duration_days && <div className={styles.modalError}>{reportErrors.duration_days}</div>}
                  </div>

                    <div className={styles.modalField}>
                  <label className={styles.modalLabel}>التقييم العام</label>

                  <select
                  className={styles.modalInput}
                  value={reportForm.evaluation}
                  onChange={(e)=>setReportField("evaluation",e.target.value as any)}
                  >

                  <option value="excellent">ممتاز</option>
                  <option value="very_good">جيد جداً</option>
                  <option value="good">جيد</option>
                  <option value="acceptable">مقبول</option>

                  </select>
                  
                  <div className={styles.modalHintRow}>
                      {reportErrors.evaluation && (
                        <span className={styles.modalErrorInline}>{reportErrors.evaluation}</span>
                      )}
                    </div>
                  </div>

                </div>

                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>مراحل المشروع</label>
                  <textarea
                    className={styles.modalTextarea}
                    rows={3}
                    maxLength={250}
                    value={reportForm.project_stages}
                    onChange={(e) => setReportField("project_stages", e.target.value)}
                    placeholder="اكتب مراحل المشروع..."
                  />
                  <div className={styles.modalHintRow}>
                    <span className={styles.modalHint}>{(reportForm.project_stages ?? "").length}/250</span>
                    {reportErrors.project_stages && (
                      <span className={styles.modalErrorInline}>{reportErrors.project_stages}</span>
                    )}
                  </div>
                </div>

                <div className={styles.modalGrid2}>
                  <div className={styles.modalField}>
                    <label className={styles.modalLabel}>مرحلة الإعداد</label>
                    <textarea
                      className={styles.modalTextarea}
                      rows={3}
                      maxLength={250}
                      value={reportForm.preparation_stage}
                      onChange={(e) => setReportField("preparation_stage", e.target.value)}
                      placeholder="اكتب تفاصيل الإعداد..."
                    />
                    <div className={styles.modalHintRow}>
                      <span className={styles.modalHint}>{(reportForm.preparation_stage ?? "").length}/250</span>
                      {reportErrors.preparation_stage && (
                        <span className={styles.modalErrorInline}>{reportErrors.preparation_stage}</span>
                      )}
                    </div>
                  </div>

                  <div className={styles.modalField}>
                    <label className={styles.modalLabel}>مرحلة التنفيذ</label>
                    <textarea
                      className={styles.modalTextarea}
                      rows={3}
                      maxLength={250}
                      value={reportForm.execution_stage}
                      onChange={(e) => setReportField("execution_stage", e.target.value)}
                      placeholder="اكتب تفاصيل التنفيذ..."
                    />
                    <div className={styles.modalHintRow}>
                      <span className={styles.modalHint}>{(reportForm.execution_stage ?? "").length}/250</span>
                      {reportErrors.execution_stage && (
                        <span className={styles.modalErrorInline}>{reportErrors.execution_stage}</span>
                      )}
                    </div>
                  </div>

                  <div className={styles.modalField}>
                    <label className={styles.modalLabel}>مرحلة التقييم والمتابعة والنتائج</label>
                    <textarea
                      className={styles.modalTextarea}
                      rows={3}
                      maxLength={250}
                      value={reportForm.evaluation_stage}
                      onChange={(e) => setReportField("evaluation_stage", e.target.value)}
                      placeholder="اكتب تفاصيل التقييم والمتابعة والنتائج..."
                    />
                    <div className={styles.modalHintRow}>
                      <span className={styles.modalHint}>{(reportForm.evaluation_stage ?? "").length}/250</span>
                      {reportErrors.evaluation_stage && (
                        <span className={styles.modalErrorInline}>{reportErrors.evaluation_stage}</span>
                      )}
                    </div>
                  </div>

                  <div className={styles.modalField}>
                    <label className={styles.modalLabel}>ما تحقق من أهداف</label>
                    <textarea
                      className={styles.modalTextarea}
                      rows={3}
                      maxLength={250}
                      value={reportForm.achieved_goals}
                      onChange={(e) => setReportField("achieved_goals", e.target.value)}
                      placeholder="اكتب ما تحقق من أهداف المشروع..."
                    />
                    <div className={styles.modalHintRow}>
                      <span className={styles.modalHint}>{(reportForm.achieved_goals ?? "").length}/250</span>
                      {reportErrors.achieved_goals && (
                        <span className={styles.modalErrorInline}>{reportErrors.achieved_goals}</span>
                      )}
                    </div>
                  </div>

                  <div className={styles.modalField}>
                  <label className={styles.modalLabel}>لجنة الإعداد</label>
                  <input
                  className={styles.modalInput}
                  value={reportForm.committee_preparation}
                  onChange={(e)=>setReportField("committee_preparation",e.target.value)}
                  placeholder="لجنة الاعداد..."
                  />
                        <div className={styles.modalHintRow}>
                      {reportErrors.committee_preparation && (
                        <span className={styles.modalErrorInline}>{reportErrors.committee_preparation}</span>
                      )}
                    </div>
                  </div>

            

                  <div className={styles.modalField}>
                  <label className={styles.modalLabel}>لجنة التنظيم</label>
                  <input
                  className={styles.modalInput}
                  value={reportForm.committee_organizing}
                  onChange={(e)=>setReportField("committee_organizing",e.target.value)}
                  placeholder="لجنة التنظيم..."
                  />
                       <div className={styles.modalHintRow}>
                      {reportErrors.committee_organizing && (
                        <span className={styles.modalErrorInline}>{reportErrors.committee_organizing}</span>
                      )}
                    </div>
                  </div>
             
                  <div className={styles.modalField}>
                  <label className={styles.modalLabel}>لجنة التنفيذ</label>
                  <input
                  className={styles.modalInput}
                  value={reportForm.committee_execution}
                  onChange={(e)=>setReportField("committee_execution",e.target.value)}
                  placeholder="لجنة التنفيذ..."
                  />
                      <div className={styles.modalHintRow}>
                      {reportErrors.committee_execution && (
                        <span className={styles.modalErrorInline}>{reportErrors.committee_execution}</span>
                      )}
                    </div>
                  </div>
              

                  <div className={styles.modalField}>
                  <label className={styles.modalLabel}>لجنة المشتريات</label>
                  <input
                  className={styles.modalInput}
                  value={reportForm.committee_purchases}
                  onChange={(e)=>setReportField("committee_purchases",e.target.value)}
                  placeholder="لجنة المشتريات..."
                  />
                  
                  <div className={styles.modalHintRow}>
                      {reportErrors.committee_purchases && (
                        <span className={styles.modalErrorInline}>{reportErrors.committee_purchases}</span>
                      )}
                    </div>
                  </div>


                  <div className={styles.modalField}>
                  <label className={styles.modalLabel}>لجنة الإشراف</label>
                  <input
                  className={styles.modalInput}
                  value={reportForm.committee_supervision}
                  onChange={(e)=>setReportField("committee_supervision",e.target.value)}
                  placeholder="لجنة الإشراف..."
                  />
                    <div className={styles.modalHintRow}>
                      {reportErrors.committee_supervision && (
                        <span className={styles.modalErrorInline}>{reportErrors.committee_supervision}</span>
                      )}
                    </div>
                  </div>
                

                  <div className={styles.modalField}>
                  <label className={styles.modalLabel}>لجان أخرى</label>
                  <input
                  className={styles.modalInput}
                  value={reportForm.committee_other}
                  onChange={(e)=>setReportField("committee_other",e.target.value)}
                  placeholder="لجان أخرى..."
                  />
                      <div className={styles.modalHintRow}>
                      {reportErrors.committee_other && (
                        <span className={styles.modalErrorInline}>{reportErrors.committee_other}</span>
                      )}
                    </div>
                  </div>

                  <div className={styles.modalField}>
                  <label className={styles.modalLabel}>مقترحات للتحسين</label>
                  <textarea
                    className={styles.modalTextarea}
                    rows={3}
                    maxLength={250}
                    value={reportForm.suggestions}
                    onChange={(e) => setReportField("suggestions", e.target.value)}
                    placeholder="اكتب مقترحات للتحسين..."
                  />
                  <div className={styles.modalHintRow}>
                    <span className={styles.modalHint}>{(reportForm.suggestions ?? "").length}/250</span>
                    {reportErrors.suggestions && (
                      <span className={styles.modalErrorInline}>{reportErrors.suggestions}</span>
                    )}
                  </div>
                </div>
              
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button className={styles.modalCancel} type="button" onClick={closeReportModal} disabled={exportBusy !== null}>
                  إلغاء
                </button>

                <button
                  className={styles.modalPrimary}
                  type="button"
                  onClick={submitReportPdf}
                  disabled={exportBusy !== null}
                  style={{ opacity: exportBusy !== null ? 0.7 : 1 }}
                >
                  <FileText size={18} />
                  {exportBusy === "report" ? "جاري التنزيل..." : "تنزيل PDF"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================== Participants Table ===================== */}
        <section className={styles.tableBlock}>
          <div className={styles.tableHead}>
            <div className={styles.tableTitle}>
              الطلاب المسجلين <span className={styles.count}>({rows.length})</span>
            </div>

            <div className={styles.tableChips}>
              <span className={styles.miniChip}>
                <Medal size={14} /> {ranksCount}
              </span>
              <span className={styles.miniChip}>
                <Award size={14} /> {rewardsCount}
              </span>
             {!isFacultyEvent && (
              <button
                className={`${styles.actionBtn} ${styles.acceptBtn}`}
                type="button"
                onClick={approveAll}
                disabled={pendingCount === 0 || busy}
                style={{ opacity: pendingCount === 0 || busy ? 0.6 : 1 }}
              >
                <Check size={16} />
                قبول الجميع ({pendingCount})
              </button>
              )}
            </div>            
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>اسم الطالب</th>
                  <th>رقم الطالب</th>
                  <th>حالة التسجيل</th>
                  <th>الترتيب</th>
                  <th>المكافأة</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>{r.name}</td>
                    <td dir="ltr">{r.studentId}</td>

                    <td>
                      <span className={participantBadgeClass(r.status)}>{r.status}</span>
                    </td>

                    <td>
                      <span className={styles.cellValue}>{(r.rank ?? "").trim() ? r.rank : "-"}</span>
                    </td>

                    <td>
                      <span className={styles.cellValue}>{(r.reward ?? "").trim() ? r.reward : "-"}</span>
                    </td>

                    <td>
                     <div className={styles.rowActions}>
  {/* ✅ لو Faculty Event: عرض التفاصيل فقط */}
                  {isFacultyEvent ? (
                    <button
                      className={styles.actionBtn}
                      type="button"
                      onClick={() => router.push(`/uni-level-activities/${id}/student/${r.studentId}`)}
                    >
                      <Eye size={16} />
                      عرض التفاصيل
                    </button>
                  ) : (
                    <>
                      {r.status === "منتظر" && (
                        <>
                          <button
                            className={`${styles.actionBtn} ${styles.acceptBtn}`}
                            type="button"
                            disabled={busy}
                            onClick={() => approveParticipant(r.studentId)}
                          >
                            <Check size={16} />
                            قبول
                          </button>

                          <button
                            className={`${styles.actionBtn} ${styles.rejectBtn}`}
                            type="button"
                            disabled={busy}
                            onClick={() => rejectParticipant(r.studentId)}
                          >
                            <X size={16} />
                            رفض
                          </button>
                        </>
                      )}

                      {editingRewardId === r.id ? (
                        <div className={styles.inlineEdit}>
                          <input
                            className={styles.inlineInput}
                            value={draftReward}
                            onChange={(e) => setDraftReward(e.target.value)}
                            placeholder="المكافأة"
                          />
                          <button className={styles.iconBtn} type="button" disabled={busy} onClick={() => saveReward(r.id)}>
                            <Check size={18} />
                          </button>
                          <button className={styles.iconBtn} type="button" disabled={busy} onClick={cancelReward}>
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <button className={styles.actionBtn} type="button" disabled={busy} onClick={() => startEditReward(r)}>
                          <Award size={16} />
                          مكافأة
                        </button>
                      )}

                      {editingRankId === r.id ? (
                        <div className={styles.inlineEdit}>
                          <input
                            className={styles.inlineInput}
                            type="number"
                            min={1}
                            value={draftRank}
                            onChange={(e) => setDraftRank(e.target.value)}
                            placeholder="المركز"
                          />
                          <button className={styles.iconBtn} type="button" disabled={busy} onClick={() => saveRank(r.id)}>
                            <Check size={18} />
                          </button>
                          <button className={styles.iconBtn} type="button" disabled={busy} onClick={cancelRank}>
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <button className={styles.actionBtn} type="button" disabled={busy} onClick={() => startEditRank(r)}>
                          <Medal size={16} />
                          ترتيب
                        </button>
                      )}

                      <button
                        className={styles.actionBtn}
                        type="button"
                        onClick={() => router.push(`/uni-level-activities/${id}/student/${r.studentId}`)}
                      >
                        <Eye size={16} />
                        عرض التفاصيل
                      </button>
                    </>
                  )}
                      </div>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: 18, opacity: 0.75, fontWeight: 700 }}>
                      لا يوجد مشاركين حتى الآن
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}