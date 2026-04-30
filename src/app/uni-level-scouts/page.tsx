"use client";
import React, { useState, useEffect, useCallback } from "react";
import styles from "./styles/ClansPage.module.css";
import ClansTable from "./components/ClansTable";
import StatsGrid from "./components/StatsGrid";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";
import { useToast } from "@/app/context/ToastContext";
import { Shield, Search } from "lucide-react";
import { useRouter } from "next/navigation";

const API_URL = getBaseUrl();

export type Clan = {
  clan_id: number;
  name: string;
  description: string;
  faculty: number;
  faculty_name: string;
  status: "نشط" | "غير نشط" | string;
  min_members: number;
  members_count: number;
  groups_count: number;
  pending_count: number;
  created_at: string;
};

export type ClanStats = {
  total_clans: number;
  active_clans: number;
  inactive_clans: number;
  total_members: number;
  total_groups: number;
  pending_requests: number;
};

export default function ClansOverviewPage() {
  const { showToast } = useToast();
  const router = useRouter();

  const [clans, setClans] = useState<Clan[]>([]);
  const [stats, setStats] = useState<ClanStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "نشط" | "غير نشط">("all");
  const [facultyFilter, setFacultyFilter] = useState<string>("all");

  const fetchClans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_URL}/api/dept/clans/`);
      if (!res.ok) {
        showToast("حدث خطأ أثناء جلب البيانات", "error");
        return;
      }
      const json = await res.json();
      const clansList = Array.isArray(json) ? json : json?.data?.clans || [];
      setClans(clansList);

      // Calculate stats
      const totalClans = clansList.length;
      const activeClans = clansList.filter((c: Clan) => c.status === "نشط").length;
      const inactiveClans = totalClans - activeClans;
      const totalMembers = clansList.reduce((sum: number, c: Clan) => sum + (c.members_count || 0), 0);
      const totalGroups = clansList.reduce((sum: number, c: Clan) => sum + (c.groups_count || 0), 0);
      const pendingRequests = clansList.reduce((sum: number, c: Clan) => sum + (c.pending_count || 0), 0);

      setStats({
        total_clans: totalClans,
        active_clans: activeClans,
        inactive_clans: inactiveClans,
        total_members: totalMembers,
        total_groups: totalGroups,
        pending_requests: pendingRequests,
      });
    } catch {
      showToast("حدث خطأ أثناء جلب البيانات", "error");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchClans();
  }, [fetchClans]);

  const handleViewClan = (clanId: number) => {
    router.push(`/uni-level-scouts/${clanId}`);
  };

  const handleToggleStatus = async (clanId: number, currentStatus: string) => {
    const newStatus = currentStatus === "نشط" ? "غير نشط" : "نشط";
    try {
      const res = await authFetch(`${API_URL}/api/dept/change_clan_status/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clan_id: clanId, status: newStatus }),
      });

      if (!res.ok) {
        showToast("فشل تغيير حالة العشيرة", "error");
        return;
      }

      showToast(`تم تغيير حالة العشيرة إلى ${newStatus} ✅`, "success");
      await fetchClans();
    } catch {
      showToast("حدث خطأ أثناء تغيير الحالة", "error");
    }
  };

  // Filter clans
  const filteredClans = clans.filter((clan) => {
    const matchesSearch = clan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         clan.faculty_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || clan.status === statusFilter;
    const matchesFaculty = facultyFilter === "all" || String(clan.faculty) === facultyFilter;
    return matchesSearch && matchesStatus && matchesFaculty;
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
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className={styles.filterSelect}
          >
            <option value="all">الكل</option>
            <option value="نشط">نشط</option>
            <option value="غير نشط">غير نشط</option>
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
              {searchTerm || statusFilter !== "all" || facultyFilter !== "all"
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
