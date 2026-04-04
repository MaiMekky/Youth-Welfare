"use client";

import React, { useEffect, useMemo, useState } from "react";
import styles from "./Eventdetails.module.css";
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
  Eye,
  Image as ImageIcon,
} from "lucide-react";
import { authFetch } from "@/utils/globalFetch";
const API_URL = "http://127.0.0.1:8000";

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
): Promise<{ ok: true; data: T } | { ok: false; message: string; status?: number }> {
  const token = getAccessToken();
  const headers: Record<string, string> = { ...(opts.headers as Record<string, string>) };
  if (!headers["Content-Type"] && opts.body) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await authFetch(`${API_URL}${path}`, { ...opts, headers });
    const text = await res.text();
    const maybeJson = text
      ? (() => { try { return JSON.parse(text); } catch { return text; } })()
      : null;

    if (!res.ok) {
      const msg =
        (typeof maybeJson === "object" && maybeJson &&
          ((maybeJson as Record<string, unknown>).detail || (maybeJson as Record<string, unknown>).message || (maybeJson as Record<string, unknown>).error)) ||
        (typeof maybeJson === "string" ? maybeJson : "") ||
        `طلب غير ناجح (${res.status})`;
      return { ok: false, message: String(msg), status: res.status };
    }

    return { ok: true, data: maybeJson as T };
  } catch (e: unknown) {
    return { ok: false, message: (e as Error)?.message || "مشكلة في الاتصال" };
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
  uploaded_by_name: string;
};

type ApiEventDetails = {
  event_id: number;
  created_by_name: string;
  faculty_name: string | null;
  dept_name: string | null;
  family_name: string | null;
  participants?: ApiParticipant[];
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

/* ===================== Page ===================== */
export default function EventDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = String(params?.id ?? "");

  const [event, setEvent] = useState<ApiEventDetails | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(false);
  const [rows, setRows] = useState<StudentRow[]>([]);

  const [images, setImages] = useState<ApiEventImage[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);

  /* Toast */
  const [notification, setNotification] = useState<{
    show: boolean; message: string; type: "success" | "error" | "warning";
  }>({ show: false, message: "", type: "success" });

  const showToast = (message: string, type: "success" | "error" | "warning" = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "success" }), 2500);
  };

  const loadEvent = async () => {
    if (!id) return;
    setLoadingEvent(true);
    const res = await apiFetch<ApiEventDetails>(`/api/event/get-events/${id}/`, { method: "GET" });
    setLoadingEvent(false);
    if (!res.ok) { showToast(res.message, "error"); return; }
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
    if (!res.ok) return;
    setImages(Array.isArray(res.data) ? res.data : []);
  };

  useEffect(() => { loadEvent(); loadImages(); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  /* Derived UI */
  const ui = useMemo(() => {
    if (!event) return {
      title: "", subtitle: "معلومات شاملة عن تفاصيل الفعالية والمشاركين",
      status: "", type: "", scope: "", cost: "",
      startDate: "", endDate: "", location: "",
      reward: "", constraints: "", description: "", max: 0,
    };

    const scope = event.dept_name
      ? `على مستوى ${event.dept_name}`
      : event.dept ? `القسم رقم ${event.dept}` : "—";

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

  const statusBadgeClass = useMemo(() => {
    const s = (ui.status || "").trim();
    if (s === "نشط") return styles.badgeSuccess;
    return styles.badgeBlue;
  }, [ui.status]);

  const participantBadgeClass = (s: StudentRow["status"]) => {
    if (s === "مقبول") return styles.participantAccepted;
    if (s === "منتظر") return styles.participantPending;
    return styles.participantRejected;
  };

  return (
    <div className={styles.page}>

      {/* Toast */}
      {notification.show && (
        <div className={`${styles.notification} ${
          notification.type === "success" ? styles.success :
          notification.type === "error" ? styles.error : styles.warning
        }`}>
          {notification.message}
        </div>
      )}

      <div className={styles.container}>

        {/* Top bar */}
        <div className={styles.topBar}>
          <div className={styles.headText}>
            <h1 className={styles.pageTitle}>تفاصيل الفعالية</h1>
            <p className={styles.pageSubtitle}>{ui.subtitle}</p>
          </div>
          <button className={styles.backBtn} onClick={() => router.push('/SuperAdmin/Events')} type="button">
            <ArrowRight size={18} />
            رجوع
          </button>
        </div>

        {loadingEvent && (
          <div style={{ fontWeight: 800, opacity: 0.7, margin: "10px 0", textAlign: "right" }}>
            جاري تحميل بيانات الفعالية...
          </div>
        )}

        {!loadingEvent && event && (
          <>
            {/* Hero */}
            <div className={styles.hero}>
              <div className={styles.heroTitle}>{ui.title || "—"}</div>
            </div>

            {/* Stats */}
            <div className={styles.statsRow}>
              <div className={`${styles.statCard} ${styles.statAmber}`}>
                <div className={styles.statIcon}><Users size={20} /></div>
                <div className={styles.statText}>
                  <div className={styles.statLabel}>المقاعد المتبقية</div>
                  <div className={styles.statValue}>{remaining}</div>
                </div>
              </div>
              <div className={`${styles.statCard} ${styles.statGreen}`}>
                <div className={styles.statIcon}><CheckCircle2 size={20} /></div>
                <div className={styles.statText}>
                  <div className={styles.statLabel}>الحد الأقصى</div>
                  <div className={styles.statValue}>{ui.max}</div>
                </div>
              </div>
              <div className={`${styles.statCard} ${styles.statIndigo}`}>
                <div className={styles.statIcon}><Users size={20} /></div>
                <div className={styles.statText}>
                  <div className={styles.statLabel}>العدد الحالي</div>
                  <div className={styles.statValue}>{registered}</div>
                </div>
              </div>
            </div>

            {/* Info grid */}
            <section className={styles.infoGrid}>
              <div className={styles.infoCard}>
                <div className={styles.infoLabel}><DollarSign size={16} /> التكلفة</div>
                <div className={styles.infoValue}>{ui.cost}</div>
              </div>
              <div className={styles.infoCard}>
                <div className={styles.infoLabel}><ShieldAlert size={16} /> حالة الفعالية</div>
                <div className={statusBadgeClass}>{ui.status || "—"}</div>
              </div>
              <div className={styles.infoCard}>
                <div className={styles.infoLabel}><Users size={16} /> نطاق الفعالية</div>
                <div className={styles.infoValue}>{ui.scope || "—"}</div>
              </div>
              <div className={styles.infoCard}>
                <div className={styles.infoLabel}><Timer size={16} /> نوع الفعالية</div>
                <div className={styles.badgeBlue}>{ui.type || "—"}</div>
              </div>
              <div className={`${styles.infoCard} ${styles.infoWide}`}>
                <div className={styles.infoLabel}><MapPin size={16} /> المكان</div>
                <div className={styles.infoValue}>{ui.location || "—"}</div>
              </div>
              <div className={styles.infoCard}>
                <div className={styles.infoLabel}><CalendarDays size={16} /> تاريخ البداية</div>
                <div className={styles.infoValue} dir="ltr">{ui.startDate || "—"}</div>
              </div>
              <div className={styles.infoCard}>
                <div className={styles.infoLabel}><CalendarDays size={16} /> تاريخ النهاية</div>
                <div className={styles.infoValue} dir="ltr">{ui.endDate || "—"}</div>
              </div>
            </section>

            {/* Reward & Constraints */}
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

            {/* Description */}
            <section className={styles.block}>
              <div className={styles.blockTitle}>وصف الفعالية</div>
              <div className={styles.blockBody}>{ui.description}</div>
            </section>

            {/* Images — view only */}
            <section className={styles.imagesBlock}>
              <div className={styles.imagesHead}>
                <div className={styles.imagesTitle}>
                  <ImageIcon size={18} />
                  صور الفعالية
                </div>
              </div>

              {loadingImages ? (
                <div style={{ fontWeight: 800, opacity: 0.7 }}>جاري تحميل الصور...</div>
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
                        <div className={styles.imageName} title={img.file_name}>{img.file_name}</div>
                      </div>
                      <div className={styles.imageBtns}>
                        <a className={styles.viewLink} href={img.file_url} target="_blank" rel="noreferrer">
                          <Eye size={16} />
                          عرض الصورة
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Participants Table — view only */}
            <section className={styles.tableBlock}>
              <div className={styles.tableHead}>
                <div className={styles.tableTitle}>
                  الطلاب المسجلين <span className={styles.count}>({rows.length})</span>
                </div>
                <div className={styles.tableChips}>
                  <span className={styles.miniChip}><Medal size={14} /> {ranksCount}</span>
                  <span className={styles.miniChip}><Award size={14} /> {rewardsCount}</span>
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
                          <span className={styles.cellValue}>
                            {(r.rank ?? "").trim() ? r.rank : "—"}
                          </span>
                        </td>
                        <td>
                          <span className={styles.cellValue}>
                            {(r.reward ?? "").trim() ? r.reward : "—"}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {rows.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ textAlign: "center", padding: 18, opacity: 0.7, fontWeight: 700 }}>
                          لا يوجد مشاركين حتى الآن
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {!loadingEvent && !event && (
          <div className={styles.block} style={{ textAlign: "center", padding: 40 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#2C3A5F", marginBottom: 8 }}>
              لم يتم العثور على الفعالية
            </div>
            <div style={{ color: "#64748b", fontWeight: 700 }}>تأكد من رقم الفعالية في الرابط.</div>
          </div>
        )}

      </div>
    </div>
  );
}