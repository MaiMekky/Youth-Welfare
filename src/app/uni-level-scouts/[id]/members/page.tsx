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
import {
  extractMembersList,
  mapMemberToFrontend,
  buildApiUrl,
  SCOUT_STATUS,
  ALL_ROLES,
  type BackendMember,
} from "../../utils/scoutsDataMapper";

const API_URL = getBaseUrl();

export type Member = {
  member_id: number;
  user_id: number;
  name: string;
  email: string;
  gender: string;
  phone: string;
  role: string;
  status: string;
  group_id: number | null;
  group_name: string | null;
  joined_at: string;
  created_at: string;
};

export default function MembersPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const clanId = params?.id as string;

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showChangeRoleModal, setShowChangeRoleModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);

  const fetchMembers = useCallback(async () => {
    if (!clanId) return;
    setLoading(true);
    try {
      // Build query params for backend filters
      const params: Record<string, any> = { clan_id: clanId };
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }
      if (roleFilter !== "all") {
        params.role = roleFilter;
      }

      const url = buildApiUrl(API_URL, "/api/dept/clan_members/", params);
      const res = await authFetch(url);
      
      if (!res.ok) {
        showToast("فشل تحميل الأعضاء", "error");
        return;
      }
      
      const json = await res.json();
      const backendMembers = extractMembersList(json);
      
      // Map backend data to frontend format
      const mappedMembers = backendMembers.map(mapMemberToFrontend);
      setMembers(mappedMembers);
    } catch (error) {
      console.error("Error fetching members:", error);
      showToast("حدث خطأ أثناء جلب البيانات", "error");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clanId, statusFilter, roleFilter]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleChangeRole = (member: Member) => {
    // Only accepted members can have their roles changed
    if (member.status !== SCOUT_STATUS.ACCEPTED) {
      showToast("يمكن تغيير دور الأعضاء المقبولين فقط", "error");
      return;
    }
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

  // Filter members (client-side for search, server-side for status and role)
  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Get unique roles for filter dropdown
  const availableRoles = Array.from(new Set(members.map((m) => m.role).filter(Boolean)));

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
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">كل الحالات</option>
            <option value={SCOUT_STATUS.PENDING}>معلق</option>
            <option value={SCOUT_STATUS.ACCEPTED}>مقبول</option>
            <option value={SCOUT_STATUS.REJECTED}>مرفوض</option>
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
            {availableRoles.map((role) => (
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
