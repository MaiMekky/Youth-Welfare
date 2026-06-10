"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./ClanDetail.module.css";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";
import { useToast } from "@/app/context/ToastContext";
import {
  Shield,
  Users,
  GitBranch,
  Network,
  Power,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  UserX,
  UserMinus,
} from "lucide-react";
import {
  extractClanDetail,
  buildApiUrl,
  CLAN_STATUS,
  type BackendClanDetail,
  type BackendStats,
} from "../utils/scoutsDataMapper";

const API_URL = getBaseUrl();

type ClanDetail = BackendClanDetail;
type ClanStats = BackendStats;

export default function ClanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const clanId = params?.id as string;

  const [clan, setClan] = useState<ClanDetail | null>(null);
  const [stats, setStats] = useState<ClanStats | null>(null);
  const [structure, setStructure] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchClanDetail = useCallback(async () => {
    if (!clanId) return;
    setLoading(true);
    try {
      const url = buildApiUrl(API_URL, "/api/dept/clan_detail/", { clan_id: clanId });
      const res = await authFetch(url);
      
      if (!res.ok) {
        showToast("فشل تحميل تفاصيل العشيرة", "error");
        return;
      }
      
      const json = await res.json();
      const { clan: clanData, stats: statsData, structure: structureData } = extractClanDetail(json);
      
      setClan(clanData);
      setStats(statsData);
      setStructure(structureData);
    } catch (error) {
      console.error("Error fetching clan detail:", error);
      showToast("حدث خطأ أثناء جلب البيانات", "error");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clanId]);

  useEffect(() => {
    fetchClanDetail();
  }, [fetchClanDetail]);

  const handleToggleStatus = async () => {
    if (!clan) return;
    const newStatus = clan.status === CLAN_STATUS.ACTIVE ? CLAN_STATUS.INACTIVE : CLAN_STATUS.ACTIVE;
    try {
      const url = buildApiUrl(API_URL, "/api/dept/change_clan_status/", {
        clan_id: clan.clan_id,
        status: newStatus,
      });
      
      const res = await authFetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        showToast(errorData?.message || "فشل تغيير حالة العشيرة", "error");
        return;
      }

      showToast(`تم تغيير حالة العشيرة إلى ${newStatus} ✅`, "success");
      await fetchClanDetail();
    } catch (error) {
      console.error("Error toggling clan status:", error);
      showToast("حدث خطأ أثناء تغيير الحالة", "error");
    }
  };

  const handleTabClick = (tab: "members" | "groups" | "structure") => {
    router.push(`/uni-level-scouts/${clanId}/${tab}`);
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingWrap}>
          <div className={styles.spinner} />
          <p className={styles.loadingText}>جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (!clan) {
    return (
      <div className={styles.page}>
        <div className={styles.emptyState}>
          <Shield size={48} />
          <h2>لم يتم العثور على العشيرة</h2>
        </div>
      </div>
    );
  }

  const isActive = clan.status === CLAN_STATUS.ACTIVE;

  return (
    <div className={styles.page}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <button onClick={() => router.push("/uni-level-scouts")} className={styles.breadcrumbLink}>
          العشائر
        </button>
        <span className={styles.breadcrumbSep}>/</span>
        <span className={styles.breadcrumbCurrent}>{clan.name}</span>
      </div>

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <Shield size={32} />
          </div>
          <div>
            <h1 className={styles.clanName}>{clan.name}</h1>
            <p className={styles.facultyName}>
              <Building2 size={16} />
              {clan.faculty_name}
            </p>
          </div>
        </div>
        <div className={styles.headerRight}>
          <span className={isActive ? styles.badgeActive : styles.badgeInactive}>
            <span className={styles.dot} />
            {clan.status}
          </span>
          <button
            className={isActive ? styles.toggleBtnActive : styles.toggleBtnInactive}
            onClick={handleToggleStatus}
          >
            <Power size={16} />
            {isActive ? "تعطيل" : "تفعيل"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={styles.tab}
        >
          <Shield size={18} />
          نظرة عامة
        </button>
        <button
          className={styles.tab}
          onClick={() => handleTabClick("members")}
        >
          <Users size={18} />
          الأعضاء
        </button>
        <button
          className={styles.tab}
          onClick={() => handleTabClick("groups")}
        >
          <GitBranch size={18} />
          المجموعات
        </button>
        <button
          className={styles.tab}
          onClick={() => handleTabClick("structure")}
        >
          <Network size={18} />
          الهيكل التنظيمي
        </button>
      </div>

      {/* Tab Content */}
      <div className={styles.content}>
        {stats && (
          <div className={styles.overviewTab}>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: "#DBEAFE", color: "#1E40AF" }}>
                  <Users size={22} />
                </div>
                <div className={styles.statContent}>
                  <span className={styles.statLabel}>إجمالي الأعضاء</span>
                  <span className={styles.statValue}>{stats.total_members}</span>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: "#D1FAE5", color: "#065F46" }}>
                  <CheckCircle size={22} />
                </div>
                <div className={styles.statContent}>
                  <span className={styles.statLabel}>الأعضاء المقبولون</span>
                  <span className={styles.statValue}>{stats.accepted_count}</span>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: "#FEF3C7", color: "#92400E" }}>
                  <Clock size={22} />
                </div>
                <div className={styles.statContent}>
                  <span className={styles.statLabel}>طلبات معلقة</span>
                  <span className={styles.statValue}>{stats.pending_count}</span>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: "#FEE2E2", color: "#991B1B" }}>
                  <UserX size={22} />
                </div>
                <div className={styles.statContent}>
                  <span className={styles.statLabel}>الأعضاء المرفوضون</span>
                  <span className={styles.statValue}>{stats.rejected_count}</span>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: "#EDE9FE", color: "#5B21B6" }}>
                  <GitBranch size={22} />
                </div>
                <div className={styles.statContent}>
                  <span className={styles.statLabel}>عدد المجموعات</span>
                  <span className={styles.statValue}>{stats.groups_count}</span>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: "#F3F4F6", color: "#4B5563" }}>
                  <UserMinus size={22} />
                </div>
                <div className={styles.statContent}>
                  <span className={styles.statLabel}>أعضاء بلا مجموعة</span>
                  <span className={styles.statValue}>{stats.unassigned_count}</span>
                </div>
              </div>
            </div>

            <div className={styles.infoCard}>
              <h3 className={styles.infoTitle}>معلومات العشيرة</h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>الوصف:</span>
                  <span className={styles.infoValue}>
                    {clan.description || "لا يوجد وصف"}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>الحد الأدنى للأعضاء:</span>
                  <span className={styles.infoValue}>{clan.min_members}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>تاريخ الإنشاء:</span>
                  <span className={styles.infoValue}>
                    <Calendar size={14} />
                    {new Date(clan.created_at).toLocaleDateString("ar-EG", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
