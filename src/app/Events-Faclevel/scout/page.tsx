"use client";
import React, { useState, useEffect, useCallback } from "react";
import styles from "./styles/ScoutPage.module.css";
import ClanCard from "./components/ClanCard";
import ClanStatsGrid from "./components/Clanstatssrid";
import CreateClanModal from "./components/CreateClanModal";
import UpdateClanModal from "./components/Updateclanmodel";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";
import { getSessionMeta } from "@/utils/cookieHelpers";
import { useToast } from "@/app/context/ToastContext";
import { Plus, Shield } from "lucide-react";

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
  groups: unknown[];
  structure: unknown;
  created_at: string;
};

export type ClanStats = {
  total_members: number;
  accepted_count: number;
  pending_count: number;
  rejected_count: number;
  groups_count: number;
  unassigned_count: number;
};

export default function ScoutPage() {
  const { showToast } = useToast();

  const [clan, setClan]             = useState<Clan | null>(null);
  const [stats, setStats]           = useState<ClanStats | null>(null);
  const [loading, setLoading]       = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [facultyId, setFacultyId]   = useState<number | null>(null);

  useEffect(() => {
    const meta = getSessionMeta();
    if (meta?.faculty_id) setFacultyId(Number(meta.faculty_id));
  }, []);

  const fetchClan = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_URL}/api/faculty/clan/`);
      if (res.status === 404 || !res.ok) {
        setClan(null);
        setStats(null);
        return;
      }
      const json = await res.json();
      if (json?.data?.clan) {
        setClan(json.data.clan);
        setStats(json.data.stats ?? null);
      } else if (Array.isArray(json)) {
        setClan(json[0] ?? null);
        setStats(null);
      } else {
        setClan(json ?? null);
        setStats(null);
      }
    } catch {
      setClan(null);
      setStats(null);
      showToast("حدث خطأ أثناء جلب البيانات", "error");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchClan(); }, [fetchClan]);

  const handleCreated = async (newClan: Clan) => {
    setShowCreate(false);
    await fetchClan();
    showToast("تم إنشاء العشيرة بنجاح ✅", "success");
  };

  /**
   * Merge the server response with the existing clan so the UI always reflects
   * the latest values — even if the PUT returns only partial data.
   */
  const handleUpdated = (updated: Clan) => {
    setClan((prev) => prev ? { ...prev, ...updated } : updated);
    setShowUpdate(false);
    showToast("تم تحديث العشيرة بنجاح ✅", "success");
  };

  return (
    <div className={styles.page}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <Shield size={28} />
          </div>
          <div>
            <h1 className={styles.pageTitle}>إدارة العشيرة</h1>
            <p className={styles.pageSubtitle}>
              إنشاء وإدارة عشيرة الكلية في النظام
            </p>
          </div>
        </div>
{/* 
        {!loading && clan === null && (
          <button className={styles.createBtn} onClick={() => setShowCreate(true)}>
            <Plus size={18} />
            إضافة عشيرة
          </button>
        )} */}
      </div>

      {/* ── Body ── */}
      <div className={styles.container}>
        {loading ? (
          <div className={styles.loadingWrap}>
            <div className={styles.spinner} />
            <p className={styles.loadingText}>جاري تحميل البيانات...</p>
          </div>
        ) : clan === null ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIconWrap}>
              <Shield size={48} />
            </div>
            <h2 className={styles.emptyTitle}>لا يوجد عشيرة</h2>
            <p className={styles.emptyDesc}>
              لم يتم إنشاء عشيرة لهذه الكلية بعد. يمكنك إنشاء عشيرة جديدة الآن.
            </p>
            <button className={styles.emptyBtn} onClick={() => setShowCreate(true)}>
              <Plus size={18} />
              إنشاء عشيرة جديدة
            </button>
          </div>
        ) : (
          <>
            {stats && <ClanStatsGrid stats={stats} />}
            <ClanCard clan={clan} onEditClick={() => setShowUpdate(true)} />
          </>
        )}
      </div>

      {showCreate && (
        <CreateClanModal
          facultyId={facultyId}
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}

      {showUpdate && clan && (
        <UpdateClanModal
          clan={clan}
          onClose={() => setShowUpdate(false)}
          onUpdated={handleUpdated}
        />
      )}
    </div>
  );
}