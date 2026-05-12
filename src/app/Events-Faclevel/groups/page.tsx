"use client";

import React, { useEffect, useState, useCallback } from "react";
import styles from "./styles/Groupspage.module.css";
import { Plus, FolderTree, ArrowRight } from "lucide-react";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";
import { useToast } from "@/app/context/ToastContext";
import { useRouter } from "next/navigation";
import GroupCard from "./components/GroupCard";
import GroupFormModal from "./components/GroupFormModal";
import DeleteGroupModal from "./components/DeleteGroupModal";

const API_URL = getBaseUrl();

export type Group = {
  group_id: number;
  name: string;
  member_count?: number;
};

export async function apiFetch<T>(
  path: string,
  opts: RequestInit = {}
): Promise<{ ok: true; data: T } | { ok: false; message: string }> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers as Record<string, string>),
  };
  try {
    const res = await authFetch(`${API_URL}${path}`, { ...opts, headers });
    const data = await res.json();
    if (!res.ok) return { ok: false, message: data?.detail || data?.message || "فشل الطلب" };
    return { ok: true, data };
  } catch (e: unknown) {
    return { ok: false, message: e instanceof Error ? e.message : "مشكلة في الاتصال" };
  }
}

async function fetchGroups(): Promise<Group[]> {
  try {
    const res = await authFetch(`${API_URL}/api/faculty/groups/`);
    const data = await res.json();

    if (!res.ok) return [];

    // Unwrap every known response shape the backend might return:
    // { data: { groups: [...] } }  |  { data: [...] }
    // { groups: [...] }            |  [...]
    let raw: unknown =
      data?.data?.groups ??
      data?.data ??
      data?.groups ??
      data;

    // If it's still not an array, bail out gracefully
    if (!Array.isArray(raw)) {
      console.warn("[fetchGroups] unexpected response shape:", data);
      raw = [];
    }

    return (raw as Group[]).map((g) => ({
      ...g,
      member_count: g.member_count ?? (g as any).members_count ?? 0,
    }));
  } catch (e) {
    console.error("[fetchGroups] error:", e);
    return [];
  }
}

export default function GroupsPage() {
  const { showToast } = useToast();
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [editGroup, setEditGroup] = useState<Group | null>(null);
  const [deleteGroup, setDeleteGroup] = useState<Group | null>(null);

  const loadGroups = useCallback(async () => {
    setLoading(true);
    const data = await fetchGroups();
    setLoading(false);
    setGroups(data);
  }, []);

  useEffect(() => { loadGroups(); }, [loadGroups]);

  const totalMembers = groups.reduce((sum, g) => sum + (g.member_count ?? 0), 0);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Breadcrumb / Back Button */}
        <div className={styles.breadcrumb}>
          <button onClick={() => router.push("/Events-Faclevel/scout")} className={styles.backBtn}>
            <ArrowRight size={18} />
            <span>العودة إلى الجوالة</span>
          </button>
        </div>

        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.pageTitle}>إدارة الرهوط</h1>
            <p className={styles.pageSubtitle}>إنشاء وتعديل وإدارة رهوط الجوالة</p>
          </div>
          <button className={styles.addBtn} onClick={() => setCreateOpen(true)}>
            <Plus size={18} />
            إنشاء رهط جديد
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
            <span className={styles.statPillValue}>
              {groups.length ? Math.round(totalMembers / groups.length) : 0}
            </span>
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
            <div className={styles.emptyIcon}><FolderTree size={44} /></div>
            <h3 className={styles.emptyTitle}>لا يوجد رهوط بعد</h3>
            <p className={styles.emptyDesc}>ابدأ بإنشاء أول رهط لتنظيم الأعضاء</p>
            <button className={styles.emptyBtn} onClick={() => setCreateOpen(true)}>
              <Plus size={16} /> إنشاء رهط جديد
            </button>
          </div>
        ) : (
          <div className={styles.cardsGrid}>
            {groups.map((g) => (
              <GroupCard
                key={g.group_id}
                group={g}
                onEdit={() => setEditGroup(g)}
                onDelete={() => setDeleteGroup(g)}
              />
            ))}
          </div>
        )}
      </div>

      {createOpen && (
        <GroupFormModal
          mode="create"
          onClose={() => setCreateOpen(false)}
          onDone={() => { setCreateOpen(false); loadGroups(); }}
        />
      )}

      {editGroup && (
        <GroupFormModal
          mode="edit"
          group={editGroup}
          onClose={() => setEditGroup(null)}
          onDone={() => { setEditGroup(null); loadGroups(); }}
        />
      )}

      {deleteGroup && (
        <DeleteGroupModal
          group={deleteGroup}
          onClose={() => setDeleteGroup(null)}
          onDone={() => { setDeleteGroup(null); loadGroups(); }}
        />
      )}
    </div>
  );
}