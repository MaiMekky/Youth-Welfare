"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./Members.module.css";
import MembersTable from "./components/MembersTable";
import ChangeRoleModal from "./components/ChangeRoleModal";
import RemoveMemberModal from "./components/RemoveMemberModal";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";
import { useToast } from "@/app/context/ToastContext";
import { Users, Search, Filter } from "lucide-react";

const API_URL = getBaseUrl();

export type Member = {
  member_id: number;
  user_id: number;
  name: string;
  email: string;
  role: string;
  status: "Pending" | "Accepted" | "Rejected" | string;
  group_id: number | null;
  group_name: string | null;
  joined_at: string;
};

export default function MembersPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const clanId = params?.id as string;

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "Pending" | "Accepted" | "Rejected">("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showChangeRoleModal, setShowChangeRoleModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);

  const fetchMembers = useCallback(async () => {
    if (!clanId) return;
    setLoading(true);
    try {
      const res = await authFetch(`${API_URL}/api/dept/clan_members/${clanId}/`);
      if (!res.ok) {
        showToast("فشل تحميل الأعضاء", "error");
        return;
      }
      const json = await res.json();
      const membersList = Array.isArray(json) ? json : json?.members || [];
      setMembers(membersList);
    } catch {
      showToast("حدث خطأ أثناء جلب البيانات", "error");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clanId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleChangeRole = (member: Member) => {
    setSelectedMember(member);
    setShowChangeRoleModal(true);
  };

  const handleRemoveMember = (member: Member) => {
    setSelectedMember(member);
    setShowRemoveModal(true);
  };

  const handleRoleChanged = async () => {
    setShowChangeRoleModal(false);
    setSelectedMember(null);
    await fetchMembers();
  };

  const handleMemberRemoved = async () => {
    setShowRemoveModal(false);
    setSelectedMember(null);
    await fetchMembers();
  };

  // Filter members
  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || member.status === statusFilter;
    const matchesRole = roleFilter === "all" || member.role === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  // Get unique roles for filter
  const roles = Array.from(new Set(members.map((m) => m.role).filter(Boolean)));

  return (
    <div className={styles.page}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <button onClick={() => router.push("/uni-level-scouts")} className={styles.breadcrumbLink}>
          العشائر
        </button>
        <span className={styles.breadcrumbSep}>/</span>
        <button onClick={() => router.push(`/uni-level-scouts/${clanId}`)} className={styles.breadcrumbLink}>
          تفاصيل العشيرة
        </button>
        <span className={styles.breadcrumbSep}>/</span>
        <span className={styles.breadcrumbCurrent}>الأعضاء</span>
      </div>

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <Users size={28} />
          </div>
          <div>
            <h1 className={styles.pageTitle}>إدارة الأعضاء</h1>
            <p className={styles.pageSubtitle}>عرض وإدارة أعضاء العشيرة</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filtersCard}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="ابحث عن عضو..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterGroup}>
          <Filter size={16} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className={styles.filterSelect}
          >
            <option value="all">كل الحالات</option>
            <option value="Pending">معلق</option>
            <option value="Accepted">مقبول</option>
            <option value="Rejected">مرفوض</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <Filter size={16} />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">كل الأدوار</option>
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
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
            <p className={styles.loadingText}>جاري تحميل الأعضاء...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIconWrap}>
              <Users size={48} />
            </div>
            <h2 className={styles.emptyTitle}>لا يوجد أعضاء</h2>
            <p className={styles.emptyDesc}>
              {searchTerm || statusFilter !== "all" || roleFilter !== "all"
                ? "لا توجد نتائج تطابق معايير البحث"
                : "لم يتم إضافة أي أعضاء بعد"}
            </p>
          </div>
        ) : (
          <MembersTable
            members={filteredMembers}
            onChangeRole={handleChangeRole}
            onRemove={handleRemoveMember}
          />
        )}
      </div>

      {/* Modals */}
      {showChangeRoleModal && selectedMember && (
        <ChangeRoleModal
          member={selectedMember}
          clanId={clanId}
          onClose={() => {
            setShowChangeRoleModal(false);
            setSelectedMember(null);
          }}
          onSuccess={handleRoleChanged}
        />
      )}

      {showRemoveModal && selectedMember && (
        <RemoveMemberModal
          member={selectedMember}
          clanId={clanId}
          onClose={() => {
            setShowRemoveModal(false);
            setSelectedMember(null);
          }}
          onSuccess={handleMemberRemoved}
        />
      )}
    </div>
  );
}
