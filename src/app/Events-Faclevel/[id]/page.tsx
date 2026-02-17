"use client";

import React, { useMemo, useState } from "react";
import styles from "./EventDetails.module.css";
import { useParams, useRouter } from "next/navigation";
import Header from "@/app/FacLevel/components/Header";
import Footer from "@/app/FacLevel/components/Footer";
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

  const event = useMemo(
    () => ({
      id,
      title: "مؤتمر الذكاء الاصطناعي",
      subtitle: "معلومات شاملة عن تفاصيل الفعالية والمشاركين",
      status: "نشط",
      type: "تقني",
      scope: "عام - على مستوى الجامعة",
      cost: "50 جنيه",
      date: "2024-01-15",
      time: "10:00 ص",
      location: "قاعة الاحتفالات الكبرى",
      reward: "شهادة مشاركة + كتاب",
      constraints: "طلاب الهندسة والحاسبات",
      description: "مؤتمر تقني متخصص في تطبيقات الذكاء الاصطناعي",
      max: 200,
      registered: 120,
    }),
    [id]
  );

  const [rows, setRows] = useState<StudentRow[]>([
    {
      id: 1,
      name: "أحمد محمد علي",
      faculty: "كلية الهندسة",
      level: "الفرقة الثالثة",
      phone: "01234567890",
      nationalId: "30012345678901",
      status: "قيد المراجعة",
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

  const remaining = Math.max(event.max - event.registered, 0);

  const rewardsCount = rows.filter((r) => (r.reward ?? "").trim().length > 0).length;
  const ranksCount = rows.filter((r) => (r.rank ?? "").trim().length > 0).length;

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
    setRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, status: "مؤكد" } : r))
    );
  };

  const rejectRow = (rowId: number) => {
    setRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, status: "مرفوض" } : r))
    );
  };

  const acceptAll = () => {
    setRows((prev) =>
      prev.map((r) => (r.status === "قيد المراجعة" ? { ...r, status: "مؤكد" } : r))
    );
  };

  const pendingCount = rows.filter((r) => r.status === "قيد المراجعة").length;

  return (
    <div className={styles.page}>
      <Header />
      <div className={styles.container}>
        <div className={styles.topBar}>
          <div className={styles.headText}>
            <h1 className={styles.pageTitle}>تفاصيل الفعالية</h1>
            <p className={styles.pageSubtitle}>{event.subtitle}</p>
          </div>

          <button className={styles.backBtn} onClick={() => router.back()}>
            <ArrowRight size={18} />
            العودة للفعاليات
          </button>
        </div>

        <div className={styles.hero}>
          <div className={styles.heroTitle}>{event.title}</div>
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
              <div className={styles.statValue}>{event.max}</div>
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.statIndigo}`}>
            <div className={styles.statIcon}>
              <Users size={20} />
            </div>
            <div className={styles.statText}>
              <div className={styles.statLabel}>العدد الحالي</div>
              <div className={styles.statValue}>{event.registered}</div>
            </div>
          </div>
        </div>

        <section className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <div className={styles.infoLabel}>
              <DollarSign size={16} /> التكلفة
            </div>
            <div className={styles.infoValue}>{event.cost}</div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoLabel}>
              <ShieldAlert size={16} /> حالة الفعالية
            </div>
            <div className={styles.badgeSuccess}>{event.status}</div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoLabel}>
              <Users size={16} /> نطاق الفعالية
            </div>
            <div className={styles.infoValue}>{event.scope}</div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoLabel}>
              <Timer size={16} /> نوع الفعالية
            </div>
            <div className={styles.badgeBlue}>{event.type}</div>
          </div>

          <div className={`${styles.infoCard} ${styles.infoWide}`}>
            <div className={styles.infoLabel}>
              <MapPin size={16} /> المكان
            </div>
            <div className={styles.infoValue}>{event.location}</div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoLabel}>
              <Clock size={16} /> وقت الفعالية
            </div>
            <div className={styles.infoValue}>{event.time}</div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoLabel}>
              <CalendarDays size={16} /> تاريخ الفعالية
            </div>
            <div className={styles.infoValue} dir="ltr">
              {event.date}
            </div>
          </div>
        </section>

        <section className={styles.twoCols}>
          <div className={styles.block}>
            <div className={styles.blockTitle}>المكافأة</div>
            <div className={styles.blockBody}>{event.reward}</div>
          </div>

          <div className={styles.block}>
            <div className={styles.blockTitle}>القيود والشروط</div>
            <div className={styles.blockBody}>{event.constraints}</div>
          </div>
        </section>

        <section className={styles.block}>
          <div className={styles.blockTitle}>وصف الفعالية</div>
          <div className={styles.blockBody}>{event.description}</div>
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

              {/* زر قبول الجميع */}
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
                      {r.status === "مؤكد" ? (
                        <span className={styles.statusOk}>{r.status}</span>
                      ) : r.status === "قيد المراجعة" ? (
                        <span className={styles.statusPending}>{r.status}</span>
                      ) : (
                        <span className={styles.statusReject}>{r.status}</span>
                      )}
                    </td>

                    <td>
                      <span className={styles.cellValue}>
                        {(r.rank ?? "").trim() ? r.rank : "-"}
                      </span>
                    </td>

                    <td>
                      <span className={styles.cellValue}>
                        {(r.reward ?? "").trim() ? r.reward : "-"}
                      </span>
                    </td>

                    <td>
                      <div className={styles.rowActions}>
                        {/* قبول/رفض (يظهروا بس لو قيد المراجعة) */}
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

                        {/* مكافأة */}
                        {editingRewardId === r.id ? (
                          <div className={styles.inlineEdit}>
                            <input
                              className={styles.inlineInput}
                              value={draftReward}
                              onChange={(e) => setDraftReward(e.target.value)}
                              placeholder="المكافأة"
                            />
                            <button
                              className={styles.iconBtn}
                              type="button"
                              onClick={() => saveReward(r.id)}
                            >
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

                        {/* ترتيب */}
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

                        {/* عرض */}
                        <button
                          className={styles.actionBtn}
                          type="button"
                          onClick={() => router.push(`/uni-level-activities/${event.id}`)}
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
