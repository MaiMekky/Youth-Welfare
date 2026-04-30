"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import styles from "./styles/MembersPage.module.css";
import { Search, Plus, Users } from "lucide-react";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";
import { useToast } from "@/app/context/ToastContext";
import MembersTable from "./components/MembersTable";
import StatsRow from "./components/StatsRow";
import ReviewModal from "./components/ReviewModal";
import AssignGroupModal from "./components/AssignGroupModal";
import ChangeRoleModal from "./components/ChangeRoleModal";
import DeleteModal from "./components/DeleteModal";
import AddMemberModal from "./components/AddMemberModal";

const API_URL = getBaseUrl();

export type Member = {
  scout_member_id: number;
  student: number;
  student_name: string;
  student_email: string;
  student_gender: "M" | "F" | string;
  student_phone: string;
  clan: number;
  group: number | null;
  group_name: string | null;
  role: string;
  status: string;
  joined_at: string;
  created_at: string;
};

type Group = { group_id: number; name: string };

export const ROLES = [
  "رائد أكبر", "رائد رهط", "رائدة رهط", "سكرتير", "عضو",
  "قائد السواعد", "قائد العشيرة", "مسؤول عهدة",
  "مساعد رائد", "مساعد قائد", "مساعدة رائد", "مساعدة قائد",
];

export const STATUSES = ["مقبول", "مرفوض", "منتظر"];

async function apiFetch<T>(
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

export { apiFetch };

async function fetchGroups(): Promise<Group[]> {
  try {
    const res = await authFetch(`${API_URL}/api/faculty/groups/`);
    const data = await res.json();
    if (!res.ok) return [];
    let raw: unknown =
      data?.data?.groups ?? data?.data ?? data?.groups ?? data;
    if (!Array.isArray(raw)) return [];
    return raw as Group[];
  } catch {
    return [];
  }
}

export default function MembersPage() {
  const { showToast } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);

  // Filters
  const [search, setSearch] = useState("");
  const [filterGroup, setFilterGroup] = useState<string>("");
  const [filterRole, setFilterRole] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterUnassigned, setFilterUnassigned] = useState<string>("");

  // Modals
  const [reviewMember, setReviewMember] = useState<Member | null>(null);
  const [assignMember, setAssignMember] = useState<Member | null>(null);
  const [roleMember, setRoleMember] = useState<Member | null>(null);
  const [deleteMember, setDeleteMember] = useState<Member | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Load groups once on mount for the filter dropdown
  useEffect(() => {
    fetchGroups().then(setGroups);
  }, []);

  const buildQuery = () => {
    const params = new URLSearchParams();
    if (filterGroup) params.set("group_id", filterGroup);
    if (filterRole) params.set("role", filterRole);
    if (filterStatus) params.set("status", filterStatus);
    if (filterUnassigned) params.set("unassigned", filterUnassigned);
    const q = params.toString();
    return q ? `?${q}` : "";
  };

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    const res = await apiFetch<{ data: { members: Member[] } }>(
      `/api/faculty/members/${buildQuery()}`
    );
    setLoading(false);
    if (!res.ok) { showToast(res.message, "error"); return; }
    setMembers((res.data as any)?.data?.members ?? []);
  }, [filterGroup, filterRole, filterStatus, filterUnassigned]); // eslint-disable-line

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const visibleMembers = useMemo(() => {
    if (!search.trim()) return members;
    return members.filter((m) =>
      m.student_name.toLowerCase().includes(search.toLowerCase())
    );
  }, [members, search]);

  const stats = useMemo(() => {
    const total = members.length;
    const accepted = members.filter((m) => m.status === "مقبول").length;
    const pending = members.filter((m) => m.status === "منتظر").length;
    const unassigned = members.filter((m) => m.group === null).length;
    return { total, accepted, pending, unassigned };
  }, [members]);

  const hasFilters = filterGroup || filterRole || filterStatus || filterUnassigned;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.pageTitle}>إدارة الأعضاء</h1>
            <p className={styles.pageSubtitle}>عرض وإدارة أعضاء الجوالة</p>
          </div>
          <button className={styles.addBtn} onClick={() => setShowAddModal(true)}>
            <Plus size={18} />
            إضافة عضو
          </button>
        </div>

        {/* Stats */}
        <StatsRow stats={stats} />

        {/* Filters */}
        <div className={styles.filtersCard}>
          <div className={styles.searchBox}>
            <Search size={16} className={styles.searchIcon} />
            <input
              placeholder="ابحث باسم الطالب..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className={styles.filtersRow}>
            {/* Real groups from API */}
            <select
              className={styles.filterSelect}
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
            >
              <option value="">كل الرهوط</option>
              {groups.map((g) => (
                <option key={g.group_id} value={String(g.group_id)}>
                  {g.name}
                </option>
              ))}
            </select>

            <select
              className={styles.filterSelect}
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="">كل الأدوار</option>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>

            <select
              className={styles.filterSelect}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">كل الحالات</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>

            <select
              className={styles.filterSelect}
              value={filterUnassigned}
              onChange={(e) => setFilterUnassigned(e.target.value)}
            >
              <option value="">جميع الأعضاء</option>
              <option value="true">غير موزعين فقط</option>
              <option value="false">الموزعين فقط</option>
            </select>

            {hasFilters && (
              <button
                className={styles.clearBtn}
                onClick={() => {
                  setFilterGroup(""); setFilterRole("");
                  setFilterStatus(""); setFilterUnassigned("");
                }}
              >
                مسح الفلاتر
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className={styles.tableCard}>
          {loading ? (
            <div className={styles.loadingWrap}>
              <div className={styles.spinner} />
              <p className={styles.loadingText}>جاري تحميل الأعضاء...</p>
            </div>
          ) : visibleMembers.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}><Users size={40} /></div>
              <h3 className={styles.emptyTitle}>لا يوجد أعضاء</h3>
              <p className={styles.emptyDesc}>
                لم يتم العثور على أعضاء مطابقين للفلاتر المحددة
              </p>
            </div>
          ) : (
            <MembersTable
              members={visibleMembers}
              onReview={setReviewMember}
              onAssign={setAssignMember}
              onChangeRole={setRoleMember}
              onDelete={setDeleteMember}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      {reviewMember && (
        <ReviewModal
          member={reviewMember}
          onClose={() => setReviewMember(null)}
          onDone={() => { setReviewMember(null); fetchMembers(); }}
        />
      )}
      {assignMember && (
        <AssignGroupModal
          member={assignMember}
          onClose={() => setAssignMember(null)}
          onDone={() => { setAssignMember(null); fetchMembers(); }}
        />
      )}
      {roleMember && (
        <ChangeRoleModal
          member={roleMember}
          onClose={() => setRoleMember(null)}
          onDone={() => { setRoleMember(null); fetchMembers(); }}
        />
      )}
      {deleteMember && (
        <DeleteModal
          member={deleteMember}
          onClose={() => setDeleteMember(null)}
          onDone={() => { setDeleteMember(null); fetchMembers(); }}
        />
      )}
      {showAddModal && (
        <AddMemberModal
          onClose={() => setShowAddModal(false)}
          onDone={() => { setShowAddModal(false); fetchMembers(); }}
        />
      )}
    </div>
  );
}