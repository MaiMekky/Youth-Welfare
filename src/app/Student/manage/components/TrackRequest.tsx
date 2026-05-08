"use client";
import React, { useEffect, useState } from "react";
import styles from "../styles/TrackRequest.module.css";
import {
  ArrowRight,
  Building2,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileSearch,
  Clock,
} from "lucide-react";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";

interface FamilyRequest {
  family_id: number;
  name: string;
  description: string;
  faculty: number;
  faculty_name: string;
  type: string;
  status: string;
  created_at: string;
}

interface TrackRequestProps {
  onBack?: () => void;
}

const STATUS_CONFIG: Record<
  string,
  {
    badgeIcon: React.ReactNode;
    label: string;
    cls: "accepted" | "rejected" | "pending";
  }
> = {
  مقبول: {
    badgeIcon: <CheckCircle size={12} />,
    label: "مقبول",
    cls: "accepted",
  },
  مرفوض: {
    badgeIcon: <XCircle size={12} />,
    label: "مرفوض",
    cls: "rejected",
  },
  "قيد المراجعة": {
    badgeIcon: <Clock size={12} />,
    label: "قيد المراجعة",
    cls: "pending",
  },
  معلق: {
    badgeIcon: <AlertCircle size={12} />,
    label: "معلق",
    cls: "pending",
  },
};

const TrackRequest: React.FC<TrackRequestProps> = ({ onBack }) => {
  const [requests, setRequests] = useState<FamilyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await authFetch(
          `${getBaseUrl()}/api/family/student/family_creation_request/`,
          { headers: { "Content-Type": "application/json" } }
        );
        if (!res.ok) throw new Error("فشل تحميل طلبات الأسر");
        const data = await res.json();
        setRequests(data.requests || []);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className={styles.page}>

      {/* ══ HERO ══ */}
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>متابعة طلبات إنشاء الأسرة</h1>
            <p className={styles.heroSub}>
              تابع حالة طلباتك المقدمة ونتائج المراجعة
            </p>
          </div>
          <button className={styles.backBtn} onClick={onBack}>
            <ArrowRight size={15} />
            العودة
          </button>
        </div>
      </div>

      {/* ══ CONTENT ══ */}
      <div className={styles.content}>

        {loading && (
          <div className={styles.stateBox}>
            <div className={styles.spinner} />
            <p>جاري تحميل الطلبات...</p>
          </div>
        )}

        {!loading && error && (
          <div className={styles.stateBox}>
            <XCircle size={40} className={styles.stateIconError} />
            <p className={styles.stateMsg}>{error}</p>
          </div>
        )}

        {!loading && !error && requests.length === 0 && (
          <div className={styles.stateBox}>
            <FileSearch size={44} className={styles.stateIconEmpty} />
            <h3 className={styles.stateTitle}>لا توجد طلبات</h3>
            <p className={styles.stateMsg}>
              لم تقم بتقديم أي طلب إنشاء أسرة حتى الآن
            </p>
          </div>
        )}

        {!loading && !error && requests.length > 0 && (
          <div className={styles.grid}>
            {requests.map((req) => {
              const st = STATUS_CONFIG[req.status] ?? {
                badgeIcon: <AlertCircle size={12} />,
                label: req.status,
                cls: "pending" as const,
              };
              return (
                <div key={req.family_id} className={styles.card}>
                  <div className={`${styles.cardStripe} ${styles[st.cls]}`} />

                  <div className={styles.cardHead}>
                    <h2 className={styles.cardTitle}>{req.name}</h2>
                    <span className={`${styles.badge} ${styles[st.cls]}`}>
                      {st.badgeIcon}
                      {st.label}
                    </span>
                  </div>

                  <p className={styles.cardDesc}>{req.description}</p>
                  <div className={styles.divider} />

                  <div className={styles.meta}>
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>
                        <Building2 size={12} className={styles.metaIcon} />
                        الكلية
                      </span>
                      <span className={styles.metaVal}>{req.faculty_name}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>
                        <Users size={12} className={styles.metaIcon} />
                        النوع
                      </span>
                      <span className={styles.metaVal}>{req.type}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>
                        <Calendar size={12} className={styles.metaIcon} />
                        تاريخ التقديم
                      </span>
                      <span className={styles.metaVal}>
                        {new Date(req.created_at).toLocaleDateString("ar-EG", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackRequest;