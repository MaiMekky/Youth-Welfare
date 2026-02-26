"use client";

import React, { useEffect, useMemo, useState } from "react";
import styles from "./EventDetails.module.css";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  Clock,
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
} from "lucide-react";
import Header from "@/app/FacLevel/components/Header";
import Footer from "@/app/FacLevel/components/Footer";

const API_URL = "http://localhost:8000";

/* ===================== API helpers ===================== */
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
): Promise<
  { ok: true; data: T } | { ok: false; message: string; status?: number; raw?: any }
> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    ...(opts.headers as any),
  };

  // add content-type only if body exists
  if (!headers["Content-Type"] && opts.body) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(`${API_URL}${path}`, { ...opts, headers });
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
          (maybeJson.detail || maybeJson.message || maybeJson.error)) ||
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
type ApiEventDetails = {
  event_id: number;
  created_by_name: string;
  faculty_name: string | null;
  dept_name: string | null;
  family_name: string | null;

  title: string;
  description: string;

  cost: string;
  location: string;

  restrictions: string;
  reward: string;
  status: string;
  imgs: string;

  st_date: string;
  end_date: string;
  s_limit: number;

  type: string;
  resource: string;

  selected_facs: number[];
  active: boolean;

  dept: number;
  faculty: number | null;
  created_by: number;
  family: number | null;
};

type StudentRow = {
  id: number;
  name: string;
  faculty: string;
  level: string;
  phone: string;
  nationalId: string;
  status: "مؤكد" | "قيد المراجعة" | "مرفوض";
  reward?: string;
  rank?: string;
};

export default function EventDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = String(params?.id ?? "");

  /* ===================== Event from API ===================== */
  const [event, setEvent] = useState<ApiEventDetails | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(false);

  useEffect(() => {
    if (!id) return;

    (async () => {
      setLoadingEvent(true);
      const res = await apiFetch<ApiEventDetails>(`/api/event/get-events/${id}/`, {
        method: "GET",
      });
      setLoadingEvent(false);

      if (!res.ok) {
        window.alert(res.message);
        return;
      }

      setEvent(res.data);
    })();
  }, [id]);

  /* ===================== Students (still local for now) ===================== */
  const [rows, setRows] = useState<StudentRow[]>([
    {
      id: 1,
      name: "أحمد محمد علي",
      faculty: "كلية الهندسة",
      level: "الفرقة الثالثة",
      phone: "01234567890",
      nationalId: "30012345678901",
      status: "مؤكد",
      reward: "",
      rank: "",
    },
    {
      id: 2,
      name: "فاطمة حسن محمود",
      faculty: "كلية الحاسبات والمعلومات",
      level: "الفرقة الثالثة",
      phone: "01123456789",
      nationalId: "30012345678901",
      status: "مؤكد",
      reward: "",
      rank: "",
    },
  ]);

  /* ===================== Derived UI values ===================== */
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

    const scope =
      event.dept_name
        ? `على مستوى ${event.dept_name}`
        : event.dept
        ? `القسم رقم ${event.dept}`
        : "—";

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

  // registered: لحد ما يبقى عندك API للطلاب، هنحسبه من rows
  const registered = rows.length;
  const remaining = Math.max(ui.max - registered, 0);

  const rewardsCount = rows.filter((r) => (r.reward ?? "").trim().length > 0).length;
  const ranksCount = rows.filter((r) => (r.rank ?? "").trim().length > 0).length;

  /* ===================== Inline edit (reward/rank) ===================== */
  const [editingRewardId, setEditingRewardId] = useState<number | null>(null);
  const [editingRankId, setEditingRankId] = useState<number | null>(null);
  const [draftReward, setDraftReward] = useState("");
  const [draftRank, setDraftRank] = useState("");

  const startEditReward = (row: StudentRow) => {
    setEditingRankId(null);
    setEditingRewardId(row.id);
    setDraftReward(row.reward ?? "");
  };

  const saveReward = (rowId: number) => {
    setRows((prev) => prev.map((r) => (r.id === rowId ? { ...r, reward: draftReward } : r)));
    setEditingRewardId(null);
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

  const saveRank = (rowId: number) => {
    setRows((prev) => prev.map((r) => (r.id === rowId ? { ...r, rank: draftRank } : r)));
    setEditingRankId(null);
  };

  const cancelRank = () => {
    setEditingRankId(null);
    setDraftRank("");
  };

  /* ===================== قبول/رفض ===================== */
  const acceptRow = (rowId: number) => {
    setRows((prev) => prev.map((r) => (r.id === rowId ? { ...r, status: "مؤكد" } : r)));
  };

  const rejectRow = (rowId: number) => {
    setRows((prev) => prev.map((r) => (r.id === rowId ? { ...r, status: "مرفوض" } : r)));
  };

  const acceptAll = () => {
    setRows((prev) => prev.map((r) => (r.status === "قيد المراجعة" ? { ...r, status: "مؤكد" } : r)));
  };

  const pendingCount = rows.filter((r) => r.status === "قيد المراجعة").length;

  const statusBadgeClass = useMemo(() => {
    const s = (ui.status || "").trim();
    if (s === "نشط") return styles.badgeSuccess;
    if (s === "منتظر") return styles.badgeBlue; // لو عندك badge ثانية
    if (s === "غير نشط" || s === "ملغي" || s === "مرفوض") return styles.badgeDanger || styles.badgeBlue;
    return styles.badgeBlue;
  }, [ui.status, styles]);

  return (
    <div className={styles.page}>
      <Header />
      <div className={styles.container}>
        <div className={styles.topBar}>
          <div className={styles.headText}>
            <h1 className={styles.pageTitle}>تفاصيل الفعالية</h1>
            <p className={styles.pageSubtitle}>{ui.subtitle}</p>
          </div>

          <button className={styles.backBtn} onClick={() => router.back()} type="button">
            <ArrowRight size={18} />
            العودة للفعاليات
          </button>
        </div>

        {loadingEvent && (
          <div style={{ fontWeight: 800, opacity: 0.8, margin: "10px 0" }}>
            جاري تحميل بيانات الفعالية...
          </div>
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

          {/* بدل "وقت" نخليها تاريخ البداية والنهاية (علشان API عندك st/end) */}
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

              <button
                className={`${styles.actionBtn} ${styles.acceptBtn}`}
                type="button"
                onClick={acceptAll}
                disabled={pendingCount === 0}
                style={{ opacity: pendingCount === 0 ? 0.6 : 1 }}
                title={pendingCount === 0 ? "لا يوجد طلبات قيد المراجعة" : "قبول جميع الطلبات"}
              >
                <Check size={16} />
                قبول الجميع ({pendingCount})
              </button>
            </div>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>اسم الطالب</th>
                  <th>الكلية</th>
                  <th>المستوى الدراسي</th>
                  <th>رقم الهاتف</th>
                  <th>الرقم القومي</th>
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
                    <td>{r.faculty}</td>
                    <td>{r.level}</td>
                    <td dir="ltr">{r.phone}</td>
                    <td dir="ltr">{r.nationalId}</td>

                    <td>
                      <span className={styles.statusOk}>{r.status}</span>
                    </td>

                    <td>
                      <span className={styles.cellValue}>{(r.rank ?? "").trim() ? r.rank : "-"}</span>
                    </td>

                    <td>
                      <span className={styles.cellValue}>{(r.reward ?? "").trim() ? r.reward : "-"}</span>
                    </td>

                    <td>
                      <div className={styles.rowActions}>
                        {r.status === "قيد المراجعة" && (
                          <>
                            <button
                              className={`${styles.actionBtn} ${styles.acceptBtn}`}
                              type="button"
                              onClick={() => acceptRow(r.id)}
                            >
                              <Check size={16} />
                              قبول
                            </button>

                            <button
                              className={`${styles.actionBtn} ${styles.rejectBtn}`}
                              type="button"
                              onClick={() => rejectRow(r.id)}
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
                            <button className={styles.iconBtn} type="button" onClick={() => saveReward(r.id)}>
                              <Check size={18} />
                            </button>
                            <button className={styles.iconBtn} type="button" onClick={cancelReward}>
                              <X size={18} />
                            </button>
                          </div>
                        ) : (
                          <button className={styles.actionBtn} type="button" onClick={() => startEditReward(r)}>
                            <Award size={16} />
                            مكافأة
                          </button>
                        )}

                        {editingRankId === r.id ? (
                          <div className={styles.inlineEdit}>
                            <input
                              className={styles.inlineInput}
                              value={draftRank}
                              onChange={(e) => setDraftRank(e.target.value)}
                              placeholder="المركز"
                            />
                            <button className={styles.iconBtn} type="button" onClick={() => saveRank(r.id)}>
                              <Check size={18} />
                            </button>
                            <button className={styles.iconBtn} type="button" onClick={cancelRank}>
                              <X size={18} />
                            </button>
                          </div>
                        ) : (
                          <button className={styles.actionBtn} type="button" onClick={() => startEditRank(r)}>
                            <Medal size={16} />
                            ترتيب
                          </button>
                        )}

                        <button
                          className={styles.actionBtn}
                          type="button"
                          onClick={() => router.push(`/uni-level-activities/${id}`)}
                        >
                          <Eye size={16} />
                          عرض
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}