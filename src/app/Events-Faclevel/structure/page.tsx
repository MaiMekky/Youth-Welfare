"use client";
import React, { useState, useEffect, useCallback } from "react";
import styles from "./styles/StructurePage.module.css";
import ClanLevelSection from "./components/ClanLevelSection";
import GroupLevelSection from "./components/GroupLevelSection";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";
import { useToast } from "@/app/context/ToastContext";
import { GitBranch, RefreshCw, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

const API_URL = getBaseUrl();

export type ScoutMember = {
  scout_member_id: number;
  name: string;
  gender: "M" | "F" | "m" | "f" | string;
  group: string | null;
};

export type ClanLevel = Record<string, ScoutMember>;

export type GroupMembers = {
  leader: ScoutMember | null;
  members: ScoutMember[];
};

export type GroupLevel = Record<
  string,
  GroupMembers | Record<string, ScoutMember>
>;

export type StructureData = {
  clan_level: ClanLevel;
  group_level: GroupLevel;
};

export default function StructurePage() {
  const { showToast } = useToast();
  const router = useRouter();

  const [structure, setStructure]     = useState<StructureData | null>(null);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);

  const fetchStructure = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await authFetch(`${API_URL}/api/faculty/structure/`);
      if (!res.ok) { showToast("فشل في جلب الهيكل التنظيمي", "error"); return; }
      const json = await res.json();
      const data: StructureData = json?.data ?? json;
      setStructure(data);
    } catch {
      showToast("حدث خطأ أثناء جلب البيانات", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchStructure(); }, [fetchStructure]);

  const hasClanLevel  = structure && Object.keys(structure.clan_level  ?? {}).length > 0;
  const hasGroupLevel = structure && Object.keys(structure.group_level ?? {}).length > 0;
  const isEmpty       = !hasClanLevel && !hasGroupLevel;

  return (
    <div className={styles.page}>
      {/* decorative orbs */}
      <div className={styles.orb1} aria-hidden />
      <div className={styles.orb2} aria-hidden />

      {/* Breadcrumb / Back Button */}
      <div className={styles.breadcrumb}>
        <button onClick={() => router.push("/Events-Faclevel/scout")} className={styles.backBtn}>
          <ArrowRight size={18} />
          <span>العودة إلى الجوالة</span>
        </button>
      </div>

      {/* ── Header ── */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <GitBranch size={24} />
          </div>
          <div>
            <h1 className={styles.pageTitle}>الهيكل التنظيمي للعشيرة</h1>
            <p className={styles.pageSubtitle}>عرض المستويات الإدارية وتوزيع الأعضاء</p>
          </div>
        </div>

        <button
          className={styles.refreshBtn}
          onClick={() => fetchStructure(true)}
          disabled={refreshing || loading}
        >
          <RefreshCw size={15} className={refreshing ? styles.spinning : ""} />
          تحديث
        </button>
      </header>

      {/* ── Body ── */}
      <div className={styles.container}>
        {loading ? (
          <div className={styles.loadingWrap}>
            <div className={styles.loaderRing} />
            <p className={styles.loadingText}>جاري تحميل الهيكل التنظيمي...</p>
          </div>
        ) : isEmpty ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIconWrap}>
              <GitBranch size={44} />
            </div>
            <h2 className={styles.emptyTitle}>لا يوجد هيكل تنظيمي</h2>
            <p className={styles.emptyDesc}>
              لم يتم تعيين أدوار في العشيرة بعد. أضف أعضاء وعيّن أدوارهم لعرض الهيكل التنظيمي.
            </p>
          </div>
        ) : (
          <div className={styles.structureWrap}>
            {hasClanLevel  && <ClanLevelSection  clanLevel={structure!.clan_level}   />}
            {hasGroupLevel && <GroupLevelSection groupLevel={structure!.group_level} />}
          </div>
        )}
      </div>
    </div>
  );
}