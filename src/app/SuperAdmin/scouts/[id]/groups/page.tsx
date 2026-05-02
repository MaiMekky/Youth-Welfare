"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./styles/GroupsPage.module.css";
import { FolderTree, ArrowRight } from "lucide-react";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";
import { useToast } from "@/app/context/ToastContext";
import GroupCard from "./components/GroupCard";
import {
  extractGroupsList,
  mapGroupToFrontend,
  buildApiUrl,
} from "../../utils/scoutsDataMapper";

const API_URL = getBaseUrl();

export type Group = {
  group_id: number;
  name: string;
  clan: number;
  display_order: number;
  members_count: number;
  created_at: string;
};

export default function GroupsPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const clanId = params?.id as string;

  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);

  const loadGroups = useCallback(async () => {
    if (!clanId) return;
    setLoading(true);
    try {
      const url = buildApiUrl(API_URL, "/api/dept/clan_groups/", { clan_id: clanId });
      const res = await authFetch(url);
      
      if (!res.ok) {
        showToast("فشل في جلب الرهوط", "error");
        return;
      }
      
      const json = await res.json();
      const backendGroups = extractGroupsList(json);
      const mappedGroups = backendGroups.map(mapGroupToFrontend);
      setGroups(mappedGroups);
    } catch (error) {
      console.error("Error fetching groups:", error);
      showToast("حدث خطأ أثناء جلب البيانات", "error");
    } finally {
      setLoading(false);
    }
  }, [clanId, showToast]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  const totalMembers = groups.reduce((sum, g) => sum + (g.members_count ?? 0), 0);
  const avgMembers = groups.length ? Math.round(totalMembers / groups.length) : 0;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <button onClick={() => router.push("/SuperAdmin/scouts")} className={styles.breadcrumbLink}>
            العشائر
          </button>
          <span className={styles.breadcrumbSep}>/</span>
          <button onClick={() => router.push(`/SuperAdmin/scouts/${clanId}`)} className={styles.breadcrumbLink}>
            تفاصيل العشيرة
          </button>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbCurrent}>الرهوط</span>
        </div>

        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.pageTitle}>رهوط العشيرة</h1>
            <p className={styles.pageSubtitle}>عرض رهوط الجوالة</p>
          </div>
          <button 
            className={styles.backBtn}
            onClick={() => router.push(`/SuperAdmin/scouts/${clanId}`)}
          >
            <ArrowRight size={18} />
            العودة
          </button>
        </div>

        {/* Stats strip */}
        <div className={styles.statsStrip}>
          <div className={styles.statPill}>
            <span className={styles.statPillValue}>{groups.length}</span>
            <span className={styles.statPillLabel}>إجمالي الرهوط</span>
          </div>
          <div className={styles.statPill}>
            <span className={styles.statPillValue}>{totalMembers}</span>
            <span className={styles.statPillLabel}>إجمالي الأعضاء</span>
          </div>
          <div className={styles.statPill}>
            <span className={styles.statPillValue}>{avgMembers}</span>
            <span className={styles.statPillLabel}>متوسط الأعضاء</span>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className={styles.loadingWrap}>
            <div className={styles.spinner} />
            <p className={styles.loadingText}>جاري تحميل الرهوط...</p>
          </div>
        ) : groups.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <FolderTree size={44} />
            </div>
            <h3 className={styles.emptyTitle}>لا يوجد رهوط بعد</h3>
            <p className={styles.emptyDesc}>
              لم يتم إنشاء أي رهوط لهذه العشيرة.
            </p>
          </div>
        ) : (
          <div className={styles.cardsGrid}>
            {groups.map((g, idx) => (
              <GroupCard
                key={g.group_id}
                group={g}
                colorIdx={idx}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
