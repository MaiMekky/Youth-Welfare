"use client";
import React, { useEffect, useState } from "react";
import styles from "../styles/TrackRequest.module.css";
import { ArrowRight, Building2, Users, Calendar, Clock, CheckCircle, XCircle, AlertCircle, FileSearch } from "lucide-react";

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

const statusConfig: Record<string, { icon: React.ReactNode; label: string; cls: string }> = {
  "مقبول":       { icon: <CheckCircle size={15} />, label: "مقبول",        cls: "accepted"  },
  "مرفوض":       { icon: <XCircle     size={15} />, label: "مرفوض",        cls: "rejected"  },
  "قيد المراجعة":{ icon: <Clock       size={15} />, label: "قيد المراجعة", cls: "pending"   },
  "معلق":        { icon: <AlertCircle size={15} />, label: "معلق",         cls: "pending"   },
};

const TrackRequest: React.FC<TrackRequestProps> = ({ onBack }) => {
  const [requests, setRequests] = useState<FamilyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem("access");
        const res = await fetch(
          "http://localhost:8000/api/family/student/family_creation_request/",
          { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error("فشل تحميل طلبات الأسر");
        const data = await res.json();
        setRequests(data.requests || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  return (
    <div className={styles.page}>

      {/* ── Hero Header ── */}
      <div className={styles.hero}>
        <div className={styles.heroBg} aria-hidden />
        <div className={styles.heroInner}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>متابعة طلبات إنشاء الأسرة</h1>
            <p className={styles.heroSub}>تابع حالة طلباتك المقدمة ونتائج المراجعة</p>
          </div>
          <button className={styles.backBtn} onClick={onBack}>
            <ArrowRight size={16} />
            العودة للقائمة
          </button>
        </div>
      </div>

      {/* ── Content ── */}
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
            <p className={styles.stateMsg}>لم تقم بتقديم أي طلب إنشاء أسرة حتى الآن</p>
          </div>
        )}

        {!loading && !error && requests.length > 0 && (
          <div className={styles.grid}>
            {requests.map((req) => {
              const st = statusConfig[req.status] ?? { icon: <AlertCircle size={15}/>, label: req.status, cls: "pending" };
              return (
                <div key={req.family_id} className={styles.card}>

                  {/* Card top */}
                  <div className={styles.cardTop}>
                    <div className={styles.cardTitleRow}>
                      <h2 className={styles.cardTitle}>{req.name}</h2>
                      <span className={`${styles.badge} ${styles[st.cls]}`}>
                        {st.icon}
                        {st.label}
                      </span>
                    </div>
                    <p className={styles.cardDesc}>{req.description}</p>
                  </div>

                  {/* Divider */}
                  <div className={styles.divider} />

                  {/* Meta info */}
                  <div className={styles.meta}>
                    <div className={styles.metaItem}>
                      <Building2 size={15} className={styles.metaIcon} />
                      <span className={styles.metaLabel}>الكلية</span>
                      <span className={styles.metaVal}>{req.faculty_name}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <Users size={15} className={styles.metaIcon} />
                      <span className={styles.metaLabel}>النوع</span>
                      <span className={styles.metaVal}>{req.type}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <Calendar size={15} className={styles.metaIcon} />
                      <span className={styles.metaLabel}>تاريخ التقديم</span>
                      <span className={styles.metaVal}>
                        {new Date(req.created_at).toLocaleDateString("ar-EG", { year:"numeric", month:"long", day:"numeric" })}
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