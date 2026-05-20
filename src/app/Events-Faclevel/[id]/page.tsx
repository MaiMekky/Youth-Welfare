"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";
import { useToast } from "@/app/context/ToastContext";
import EventTeams from "./EventsTeam";

import EventHeader from "./components/Eventheader";
import StatsRow from "./components/Statsrow";
import EventInfoGrid from "./components/Eventinfogrid";
import ImagesSection from "./components/Imagessection";
import ParticipantsTable from "./components/Participantstable";
import ReportModal from "./components/Reportmodal";

import styles from "./styles/EventDetails.module.css";

const API_URL = getBaseUrl();

/* ─── Types ─── */
type ApiParticipant = {
  id: number;
  student_id: string;
  student_name: string;
  rank: number | string | null;
  reward: string | null;
  status: string;
};

export type ApiEventImage = {
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

export type ReportFormState = {
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

type ApiEventDetails = {
  event_id: number;
  created_by_name: string;
  faculty_name: string | null;
  dept_name: string | null;
  family_name: string | null;
  participants?: ApiParticipant[];
  images?: Record<string, unknown>[];
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
  rejection_reason?: string | null;
};

export type StudentRow = {
  id: number;
  name: string;
  studentId: string;
  status: "مقبول" | "منتظر" | "مرفوض";
  reward?: string;
  rank?: string;
};

export type ReportErrors = Partial<Record<keyof ReportFormState, string>>;

/* ─── Helpers ─── */
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

function diffDays(start: string, end: string): number {
  const a = new Date(start);
  const b = new Date(end);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return 0;
  return Math.max(Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)), 0);
}

function pickFilenameFromDisposition(disposition: string | null, fallback: string) {
  if (!disposition) return fallback;
  const m = disposition.match(/filename\*?=(?:UTF-8''|")?([^\";]+)\"?/i);
  if (!m?.[1]) return fallback;
  try { return decodeURIComponent(m[1]); } catch { return m[1]; }
}

async function apiFetch<T>(
  path: string,
  opts: RequestInit = {}
): Promise<{ ok: true; data: T } | { ok: false; message: string; status?: number; raw?: Record<string, unknown> }> {
  const headers: Record<string, string> = { ...(opts.headers as Record<string, string>) };
  const isFormData = typeof FormData !== "undefined" && opts.body instanceof FormData;
  if (!headers["Content-Type"] && opts.body && !isFormData) headers["Content-Type"] = "application/json";

  try {
    const res = await authFetch(`${API_URL}${path}`, { ...opts, headers });
    const text = await res.text();
    const maybeJson = text ? (() => { try { return JSON.parse(text); } catch { return text; } })() : null;

    if (!res.ok) {
      if (res.status === 403) return { ok: false, message: "ليس لديك صلاحية للوصول لهذه الفعالية", status: 403 };
      if (res.status === 500) return { ok: false, message: "حدث خطأ في السيرفر، برجاء المحاولة لاحقاً", status: 500 };
      const msg =
        (typeof maybeJson === "object" && maybeJson &&
          ((maybeJson as Record<string, unknown>).detail ||
           (maybeJson as Record<string, unknown>).message ||
           (maybeJson as Record<string, unknown>).error)) ||
        (typeof maybeJson === "string" ? maybeJson : "") ||
        `طلب غير ناجح (${res.status})`;
      return { ok: false, message: String(msg), status: res.status, raw: maybeJson };
    }
    return { ok: true, data: maybeJson as T };
  } catch (e: unknown) {
    return { ok: false, message: (e as Error)?.message || "مشكلة في الاتصال" };
  }
}

async function downloadPdf(path: string, opts: RequestInit = {}, fallbackName = "file.pdf") {
  const headers: Record<string, string> = { ...(opts.headers as Record<string, string>) };
  if (!headers["Content-Type"] && opts.body) headers["Content-Type"] = "application/json";

  const res = await authFetch(`${API_URL}${path}`, { ...opts, headers });
  if (!res.ok) {
    const text = await res.text();
    let msg = `طلب غير ناجح (${res.status})`;
    try { const j = JSON.parse(text); msg = (j?.detail || j?.message || j?.error || msg) as string; } catch { if (text) msg = text; }
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

const emptyReportForm: ReportFormState = {
  event_title: "", event_code: "",
  male_count: "", female_count: "", total_participants: "",
  start_date: "", duration_days: "",
  project_stages: "", preparation_stage: "", execution_stage: "",
  evaluation_stage: "", achieved_goals: "",
  committee_preparation: "", committee_organizing: "", committee_execution: "",
  committee_purchases: "", committee_supervision: "", committee_other: "",
  evaluation: "excellent", suggestions: "",
};

const MAX_250_FIELDS: (keyof ReportFormState)[] = [
  "project_stages", "preparation_stage", "execution_stage", "evaluation_stage", "achieved_goals",
];
const committeeFields: (keyof ReportFormState)[] = [
  "committee_preparation", "committee_organizing", "committee_execution",
  "committee_purchases", "committee_supervision", "committee_other",
];

/* ─── Page ─── */
export default function EventDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = String(params?.id ?? "");
  const { showToast } = useToast();

  const [event, setEvent] = useState<ApiEventDetails | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(false);
  const [rows, setRows] = useState<StudentRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [backPath, setBackPath] = useState("/Events-Faclevel");
  const [hasTeams, setHasTeams] = useState(false);

  // Images
  const [images, setImages] = useState<ApiEventImage[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingDocId, setDeletingDocId] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  // Inline edit
  const [editingRewardId, setEditingRewardId] = useState<number | null>(null);
  const [editingRankId, setEditingRankId] = useState<number | null>(null);
  const [draftReward, setDraftReward] = useState("");
  const [draftRank, setDraftRank] = useState("");

  // Report modal
  const [reportOpen, setReportOpen] = useState(false);
  const [reportForm, setReportForm] = useState<ReportFormState>(emptyReportForm);
  const [reportErrors, setReportErrors] = useState<ReportErrors>({});
  const [exportBusy, setExportBusy] = useState<null | "report" | "summary">(null);

  /* ─── Data loading ─── */
  const loadEvent = async () => {
    if (!id) return;
    setLoadingEvent(true);
    const res = await apiFetch<ApiEventDetails>(`/api/event/get-events/${id}/`, { method: "GET" });
    setLoadingEvent(false);

    if (!res.ok) {
      if (res.status === 403) showToast("❌ ليس لديك صلاحية لعرض هذه الفعالية", "error");
      else if (res.status === 500) showToast("❌ حدث خطأ في السيرفر، برجاء المحاولة لاحقاً", "error");
      else showToast(res.message, "error");
      return;
    }

    setEvent(res.data);
    const parts = Array.isArray(res.data.participants) ? res.data.participants : [];
    setRows(parts.map((p) => ({
      id: p.id,
      name: p.student_name ?? "",
      studentId: String(p.student_id ?? ""),
      status: mapParticipantStatus(p.status),
      reward: p.reward ?? "",
      rank: p.rank === null || p.rank === undefined ? "" : String(p.rank),
    })));
  };

  const loadImages = async () => {
    if (!id) return;
    setLoadingImages(true);
    const res = await apiFetch<ApiEventImage[]>(`/api/event/manage-events/${id}/images/`, { method: "GET" });
    setLoadingImages(false);
    if (!res.ok) { showToast("تعذر تحميل الصور", "warning"); return; }
    setImages(Array.isArray(res.data) ? res.data : []);
  };

  useEffect(() => { loadEvent(); loadImages(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { const from = sessionStorage.getItem("eventDetails_from"); if (from) setBackPath(from); }, []);

  /* ─── Images ─── */
  const uploadImages = async (files: FileList | null) => {
    if (!id || !files || files.length === 0) return;
    setUploading(true);
    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append("images", f));
      fd.append("doc_type", "event_image");

      const res = await authFetch(`${API_URL}/api/event/manage-events/${id}/upload-images/`, { method: "POST", body: fd });
      if (!res.ok) {
        try {
          const data = await res.json();
          if (data.detail === "Only the event creator can upload images for this event") {
            showToast("❌ لا يمكنك رفع الصور إلا إذا كنت منشئ النشاط", "error");
          } else if (data.images && Array.isArray(data.images)) {
            showToast(data.images.map((msg: string) =>
              msg.includes("exceeds") ? "❌ حجم الصورة أكبر من 20 ميجابايت" :
              msg.includes("invalid extension") ? "❌ الصورة يجب أن تكون بصيغة jpg أو jpeg أو png أو pdf" :
              `❌ ${msg}`
            ).join(", "), "error");
          } else {
            showToast(`❌ ${data.detail || "حدث خطأ أثناء رفع الصور"}`, "error");
          }
        } catch { showToast("❌ حدث خطأ أثناء رفع الصور", "error"); }
      } else {
        showToast("✅ تم رفع الصور بنجاح", "success");
        await loadImages();
      }
      if (fileRef.current) fileRef.current.value = "";
    } finally { setUploading(false); }
  };

  const deleteImage = async (docId: number) => {
    if (!id || !docId) return;
    setDeletingDocId(docId);
    const res = await apiFetch<Record<string, unknown>>(`/api/event/manage-events/${id}/images/${docId}/`, { method: "DELETE" });
    setDeletingDocId(null);
    if (!res.ok) { showToast(res.message, "error"); return; }
    setImages((prev) => prev.filter((x) => x.doc_id !== docId));
    showToast("✅ تم مسح الصورة", "success");
  };

  /* ─── Participants ─── */
  const approveAll = async () => {
    if (!id) return;
    setBusy(true);
    const res = await apiFetch<Record<string, unknown>>(`/api/event/manage-participants/${id}/approve-all-participants/`, { method: "PATCH" });
    setBusy(false);
    if (!res.ok) { showToast(res.message, "error"); return; }
    await loadEvent();
    showToast("✅ تم قبول الجميع بنجاح", "success");
  };

  const approveParticipant = async (studentId: string) => {
    if (!id || !studentId) return;
    setBusy(true);
    const res = await apiFetch<Record<string, unknown>>(`/api/event/manage-participants/${id}/participants/${studentId}/approve/`, { method: "PATCH" });
    setBusy(false);
    if (!res.ok) { showToast(res.message, "error"); return; }
    await loadEvent();
    showToast("✅ تم قبول الطالب", "success");
  };

  const rejectParticipant = async (studentId: string) => {
    if (!id || !studentId) return;
    setBusy(true);
    const res = await apiFetch<Record<string, unknown>>(`/api/event/manage-participants/${id}/participants/${studentId}/reject/`, { method: "PATCH" });
    setBusy(false);
    if (!res.ok) { showToast(res.message, "error"); return; }
    await loadEvent();
    showToast("❌ تم رفض الطالب", "warning");
  };

  const assignResult = async (studentId: string, rank: number | null, reward: string) => {
    if (!id || !studentId) return;
    setBusy(true);
    const res = await apiFetch<Record<string, unknown>>(`/api/event/manage-participants/${id}/participants/${studentId}/assign-result/`, {
      method: "PATCH",
      body: JSON.stringify({ rank, reward }),
    });
    setBusy(false);
    if (!res.ok) { showToast(res.message, "error"); return; }
    setEditingRankId(null);
    setEditingRewardId(null);
    setDraftRank("");
    setDraftReward("");
    await loadEvent();
    showToast("✅ تم حفظ النتيجة بنجاح", "success");
  };

  const saveReward = async (rowId: number) => {
    const row = rows.find((r) => r.id === rowId);
    if (!row) return;
    await assignResult(row.studentId, toRankNumber(row.rank), draftReward);
  };

  const saveRank = async (rowId: number) => {
    const row = rows.find((r) => r.id === rowId);
    if (!row) return;
    const value = draftRank.trim();
    if (!value) { showToast("⚠️ من فضلك أدخل رقم الترتيب", "warning"); return; }
    if (!/^\d+$/.test(value)) { showToast("❌ الترتيب يجب أن يكون رقم صحيح فقط", "error"); return; }
    await assignResult(row.studentId, Number(value), row.reward ?? "");
  };

  /* ─── Add Member ─── */
  // Called by ParticipantsTable. Uses the same authFetch/apiFetch pattern as every
  // other API call in this file so auth headers and base URL are handled correctly.
  const addMember = async (
    nid: string
  ): Promise<{ success: true } | { success: false; message: string }> => {
    if (!id) return { success: false, message: "معرف الفعالية غير موجود" };

    const res = await apiFetch<Record<string, unknown>>(
      `/api/event/manage-events/${id}/add-member/`,
      {
        method: "POST",
        body: JSON.stringify({ nid }),
      }
    );

    if (!res.ok) return { success: false, message: res.message };

    await loadEvent(); // refresh the participants table immediately
    return { success: true };
  };

  /* ─── Report ─── */
  const validateReportForm = (form: ReportFormState): ReportErrors => {
    const next: ReportErrors = {};
    if (!form.event_title.trim()) next.event_title = "عنوان الفعالية مطلوب";
    if (!form.event_code.trim()) next.event_code = "كود الفعالية مطلوب";
    if (!form.start_date) next.start_date = "تاريخ البداية مطلوب";

    const requireNonNegInt = (key: keyof ReportFormState, v: number | "") => {
      if (v === "") { next[key] = "الحقل مطلوب"; return; }
      if (!Number.isFinite(v)) { next[key] = "لازم يكون رقم صحيح"; return; }
      if (!Number.isInteger(v)) { next[key] = "لازم يكون رقم صحيح بدون كسور"; return; }
      if (v < 0) { next[key] = "مينفعش أقل من صفر"; return; }
    };

    requireNonNegInt("male_count", form.male_count);
    requireNonNegInt("female_count", form.female_count);
    requireNonNegInt("total_participants", form.total_participants);
    requireNonNegInt("duration_days", form.duration_days);

    for (const k of MAX_250_FIELDS) {
      const v = String(form[k] ?? "").trim();
      if (!v) next[k] = "الحقل مطلوب";
      else if (v.length > 250) next[k] = `الحد الأقصى 250 حرف (حاليًا ${v.length})`;
    }
    for (const k of committeeFields) {
      const v = String(form[k] ?? "").trim();
      if (!v) next[k] = "الحقل مطلوب";
      else if (v.length > 250) next[k] = "الحد الأقصى 250 حرف";
    }
    if (!form.evaluation) next.evaluation = "التقييم مطلوب";
    if (!form.suggestions.trim()) next.suggestions = "الاقتراحات مطلوبة";
    return next;
  };

  const openReportModal = () => {
    const start = event?.st_date ?? "";
    const end = event?.end_date ?? "";
    setReportForm({
      ...emptyReportForm,
      event_title: event?.title ?? "",
      event_code: String(event?.event_id ?? id ?? ""),
      total_participants: rows.length || "",
      start_date: start,
      duration_days: start && end ? diffDays(start, end) : "",
    });
    setReportErrors({});
    setReportOpen(true);
  };

  const setReportField = <K extends keyof ReportFormState>(key: K, value: ReportFormState[K]) => {
    setReportForm((p) => ({ ...p, [key]: value }));
    setReportErrors((p) => ({ ...p, [key]: undefined }));
  };

  const submitReportPdf = async () => {
    if (!id) return;
    const errs = validateReportForm(reportForm);
    setReportErrors(errs);
    if (Object.keys(errs).length) { showToast("⚠️ برجاء استكمال البيانات المطلوبة", "warning"); return; }

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
      await downloadPdf(`/api/event/reports/${id}/pdf/`, { method: "POST", body: JSON.stringify(body) }, `event_${id}_report.pdf`);
      setReportOpen(false);
      showToast("✅ تم تنزيل تقرير الفعالية", "success");
    } catch (e: unknown) {
      showToast((e as Error)?.message || "حصل خطأ أثناء تصدير تقرير الفعالية", "error");
    } finally { setExportBusy(null); }
  };

  const exportEventSummary = async () => {
    if (!id) return;
    try {
      setExportBusy("summary");
      await downloadPdf(`/api/event/summary-reports/${id}/summary-pdf/`, { method: "GET" }, `event_${id}_summary.pdf`);
      showToast("✅ تم تنزيل ملخص الفعالية", "success");
    } catch (e: unknown) {
      showToast((e as Error)?.message || "حصل خطأ أثناء تصدير ملخص الفعالية", "error");
    } finally { setExportBusy(null); }
  };

  /* ─── Derived UI ─── */
  const ui = useMemo(() => {
    if (!event) return {
      title: "", subtitle: "معلومات شاملة عن تفاصيل الفعالية والمشاركين",
      status: "", type: "", displayType: "", scope: "", cost: "",
      startDate: "", endDate: "", location: "", reward: "",
      constraints: "", description: "", max: 0, rejectionReason: "", isDeptEvent: false,
    };

    const scope = event.dept_name ? `على مستوى ${event.dept_name}` : event.dept ? `القسم رقم ${event.dept}` : "—";
    const costNum = Number(String(event.cost ?? "").trim());
    const costText = !Number.isFinite(costNum) || costNum === 0 ? "مجاني" : `${costNum} جنيه`;
    const rawType = (event.type ?? "").trim();
    let displayType = rawType;
    if (rawType === "داخلي") displayType = "على مستوى الكلية";
    else if (rawType === "خارجي") displayType = "على مستوى الجامعة";

    return {
      title: event.title ?? "",
      subtitle: "معلومات شاملة عن تفاصيل الفعالية والمشاركين",
      status: event.status ?? "",
      type: rawType,
      displayType,
      scope,
      cost: costText,
      startDate: event.st_date ?? "",
      endDate: event.end_date ?? "",
      location: event.location ?? "",
      reward: (event.reward ?? "").trim() || "—",
      constraints: (event.restrictions ?? "").trim() || "—",
      description: (event.description ?? "").trim() || "—",
      max: Number(event.s_limit ?? 0),
      rejectionReason: (event.rejection_reason ?? "").trim(),
      isDeptEvent: event.faculty === null && !!event.dept,
    };
  }, [event]);

  const isFacultyEvent = (event?.faculty ?? null) !== null;
  const registered = rows.length;
  const remaining = Math.max(ui.max - registered, 0);

  const handleDeptRestrictedClick = () =>
    showToast("❌ ليس لديك صلاحية للقيام بهذا الإجراء لهذه الفعالية", "error");

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        <EventHeader
          title={ui.title}
          subtitle={ui.subtitle}
          isDeptEvent={ui.isDeptEvent}
          exportBusy={exportBusy}
          hasEvent={!!event}
          backPath={backPath}
          onBack={() => { sessionStorage.removeItem("eventDetails_from"); router.push(backPath); }}
          onExportSummary={ui.isDeptEvent ? handleDeptRestrictedClick : exportEventSummary}
          onOpenReport={ui.isDeptEvent ? handleDeptRestrictedClick : openReportModal}
        />

        {loadingEvent && (
          <div style={{ fontWeight: 800, opacity: 0.8, margin: "10px 0" }}>جاري تحميل بيانات الفعالية...</div>
        )}

        <div className={styles.hero}>
          <div className={styles.heroTitle}>{ui.title || "—"}</div>
        </div>

        <StatsRow remaining={remaining} max={ui.max} registered={registered} />

        <EventInfoGrid
          cost={ui.cost}
          status={ui.status}
          scope={ui.scope}
          displayType={ui.displayType}
          location={ui.location}
          startDate={ui.startDate}
          endDate={ui.endDate}
          rejectionReason={ui.rejectionReason}
          reward={ui.reward}
          constraints={ui.constraints}
          description={ui.description}
        />

        <ImagesSection
          images={images}
          loadingImages={loadingImages}
          uploading={uploading}
          deletingDocId={deletingDocId}
          isFacultyEvent={isFacultyEvent}
          fileRef={fileRef}
          onUpload={uploadImages}
          onDelete={deleteImage}
        />

        <ReportModal
          open={reportOpen && isFacultyEvent}
          reportForm={reportForm}
          reportErrors={reportErrors}
          exportBusy={exportBusy}
          onClose={() => setReportOpen(false)}
          onSubmit={submitReportPdf}
          setField={setReportField}
        />

        <ParticipantsTable
          rows={rows}
          busy={busy}
          hasTeams={hasTeams}
          editingRewardId={editingRewardId}
          editingRankId={editingRankId}
          draftReward={draftReward}
          draftRank={draftRank}
          onApproveAll={approveAll}
          onApprove={approveParticipant}
          onReject={rejectParticipant}
          onStartEditReward={(row) => { setEditingRankId(null); setEditingRewardId(row.id); setDraftReward(row.reward ?? ""); }}
          onStartEditRank={(row) => { setEditingRewardId(null); setEditingRankId(row.id); setDraftRank(row.rank ?? ""); }}
          onSaveReward={saveReward}
          onSaveRank={saveRank}
          onCancelReward={() => { setEditingRewardId(null); setDraftReward(""); }}
          onCancelRank={() => { setEditingRankId(null); setDraftRank(""); }}
          onSetDraftReward={setDraftReward}
          onSetDraftRank={setDraftRank}
          onViewStudent={(studentId) => router.push(`/Events-Faclevel/${id}/student/${studentId}`)}
          onAddMember={addMember}   // ← the only new prop: handler lives here, event id is captured in closure
        />

        <EventTeams
          eventId={id}
          participants={rows.map((r) => ({ id: r.id, studentId: r.studentId, name: r.name }))}
          onTeamsConfigured={setHasTeams}
        />

      </div>
    </div>
  );
}