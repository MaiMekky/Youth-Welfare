"use client";
import React, { useState, useEffect, useCallback } from "react";
import styles from "./styles/ClansPage.module.css";
import ClansTable from "./components/ClansTable";
import StatsGrid from "./components/StatsGrid";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";
import { useToast } from "@/app/context/ToastContext";
import { Shield, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  extractClansList,
  mapClanToFrontend,
  buildApiUrl,
  CLAN_STATUS,
  type BackendClan,
} from "./utils/scoutsDataMapper";

const API_URL = getBaseUrl();

export type Clan = {
  clan_id: number;
  name: string;
  description: string;
  faculty: number;
  faculty_name: string;
  status: string;
  min_members: number;
  members_count: number;
  accepted_count: number;
  pending_count: number;
  groups_count: number;
  is_structure_complete: boolean;
  created_at: string;
};

export type ClanStats = {
  total_clans: number;
  active_clans: number;
  inactive_clans: number;
  total_members: number;
  total_accepted: number;
  total_pending: number;
};

export default function ClansOverviewPage() {
  const { showToast } = useToast();
  const router = useRouter();

  const [clans, setClans] = useState<Clan[]>([]);
  const [stats, setStats] = useState<ClanStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | string>("all");
  const [facultyFilter, setFacultyFilter] = useState<string>("all");
  const [structureFilter, setStructureFilter] = useState<"all" | "complete" | "incomplete">("all");

  const fetchClans = useCallback(async () => {
    setLoading(true);
    try {
      // Build query params for backend filters
      const params: Record<string, any> = {};
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }
      if (structureFilter === "complete") {
        params.structure_complete = "true";
      } else if (structureFilter === "incomplete") {
        params.structure_complete = "false";
      }

      const url = buildApiUrl(API_URL, "/api/dept/clans/", params);
      const res = await authFetch(url);
      
      if (!res.ok) {
        showToast("حدث خطأ أثناء جلب البيانات", "error");
        return;
      }
      
      const json = await res.json();
      const { clans: backendClans, summary } = extractClansList(json);
      
      // Map backend data to frontend format
      const mappedClans = backendClans.map(mapClanToFrontend);
      setClans(mappedClans);

      // Use backend summary if available, otherwise calculate
      if (summary && Object.keys(summary).length > 0) {
        setStats({
          total_clans: summary.total_clans || mappedClans.length,
          active_clans: summary.active_clans || 0,
          inactive_clans: (summary.total_clans || mappedClans.length) - (summary.active_clans || 0),
          total_members: summary.total_members || 0,
          total_accepted: summary.total_accepted || 0,
          total_pending: summary.total_pending || 0,
        });
      } else {
        // Fallback calculation
        const totalClans = mappedClans.length;
        const activeClans = mappedClans.filter((c) => c.status === CLAN_STATUS.ACTIVE).length;
        const inactiveClans = totalClans - activeClans;
        const totalMembers = mappedClans.reduce((sum, c) => sum + (c.members_count || 0), 0);
        const totalAccepted = mappedClans.reduce((sum, c) => sum + (c.accepted_count || 0), 0);
        const totalPending = mappedClans.reduce((sum, c) => sum + (c.pending_count || 0), 0);

        setStats({
          total_clans: totalClans,
          active_clans: activeClans,
          inactive_clans: inactiveClans,
          total_members: totalMembers,
          total_accepted: totalAccepted,
          total_pending: totalPending,
        });
      }
    } catch (error) {
      console.error("Error fetching clans:", error);
      showToast("حدث خطأ أثناء جلب البيانات", "error");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, structureFilter]);

  useEffect(() => {
    fetchClans();
  }, [fetchClans]);

  const handleViewClan = (clanId: number) => {
    router.push(`/uni-level-scouts/${clanId}`);
  };

  const handleToggleStatus = async (clanId: number, currentStatus: string) => {
    const newStatus = currentStatus === CLAN_STATUS.ACTIVE ? CLAN_STATUS.INACTIVE : CLAN_STATUS.ACTIVE;
    try {
      const url = buildApiUrl(API_URL, "/api/dept/change_clan_status/", {
        clan_id: clanId,
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
      await fetchClans();
    } catch (error) {
      console.error("Error toggling clan status:", error);
      showToast("حدث خطأ أثناء تغيير الحالة", "error");
    }
  };

  // Filter clans (client-side for search and faculty, server-side for status and structure)
  const filteredClans = clans.filter((clan) => {
    const matchesSearch = clan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         clan.faculty_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFaculty = facultyFilter === "all" || String(clan.faculty) === facultyFilter;
    return matchesSearch && matchesFaculty;
  });

  // Get unique faculties for filter
  const faculties = Array.from(new Set(clans.map(c => ({ id: c.faculty, name: c.faculty_name })).filter(f => f.name)));

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <Shield size={28} />
          </div>
          <div>
            <h1 className={styles.pageTitle}>إدارة العشائر</h1>
            <p className={styles.pageSubtitle}>
              عرض وإدارة جميع عشائر الكليات في النظام
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && <StatsGrid stats={stats} />}

      {/* Filters */}
      <div className={styles.filtersCard}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="ابحث عن عشيرة أو كلية..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>الحالة:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">الكل</option>
            <option value={CLAN_STATUS.ACTIVE}>نشط</option>
            <option value={CLAN_STATUS.INACTIVE}>غير نشط</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>الهيكل:</label>
          <select
            value={structureFilter}
            onChange={(e) => setStructureFilter(e.target.value as typeof structureFilter)}
            className={styles.filterSelect}
          >
            <option value="all">الكل</option>
            <option value="complete">مكتمل</option>
            <option value="incomplete">غير مكتمل</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>الكلية:</label>
          <select
            value={facultyFilter}
            onChange={(e) => setFacultyFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">الكل</option>
            {faculties.map((f) => (
              <option key={f.id} value={String(f.id)}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.loadingWrap}>
            <div className={styles.spinner} />
            <p className={styles.loadingText}>جاري تحميل البيانات...</p>
          </div>
        ) : filteredClans.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIconWrap}>
              <Shield size={48} />
            </div>
            <h2 className={styles.emptyTitle}>لا توجد عشائر</h2>
            <p className={styles.emptyDesc}>
              {searchTerm || statusFilter !== "all" || facultyFilter !== "all" || structureFilter !== "all"
                ? "لا توجد نتائج تطابق معايير البحث"
                : "لم يتم إنشاء أي عشائر بعد"}
            </p>
          </div>
        ) : (
          <ClansTable
            clans={filteredClans}
            onView={handleViewClan}
            onToggleStatus={handleToggleStatus}
          />
        )}
      </div>
    </div>
  );
}
