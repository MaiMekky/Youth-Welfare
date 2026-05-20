"use client";

import React, { useState, useEffect, useCallback } from "react";
import styles from "./Universityteampage.module.css";
import {
  Trophy,
  Users,
  BookOpen,
  Plus,
  Trash2,
  UserPlus,
  BookMarked,
  ChevronLeft,
  ChevronRight,
  X,
  Search,
  Filter,
} from "lucide-react";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";
import { useToast } from "@/app/context/ToastContext";
import { useRouter, useSearchParams } from "next/navigation";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Member {
  university_member_id: number;   // was: id
  student_name: string;           // was: name
  faculty_name?: string;
  clan_name?: string;
  university_role?: string;
  programs?: { id: number; program_id: number; program_name: string }[];
  scout_member?: number;
}

interface Program {
  program_id: number;   // was: id
  name: string;
  description?: string;
  is_active?: boolean;
}
interface ScoutMember {
  scout_member_id: number;  // was: id
  student_name: string;     // was: name
}
interface Clan {
  clan_id: number;
  name: string;
  faculty_name?: string;
}
interface Faculty {
  faculty_id: number;  // was: id
  name: string;
}
// ─── Constants ───────────────────────────────────────────────────────────────
const ROLES = [
  "سكرتير العشاير",
  "قائد الجوالات",
  "قائد السواعد",
  "قائد عشاير الجامعة",
  "مساعد قائد العشاير",
  "منفذ برامج",
];

type Tab = "members" | "programs";
type Modal =
  | "addMember"
  | "assignRole"
  | "assignProgram"
  | "createProgram"
  | null;

// ─── Helper ───────────────────────────────────────────────────────────────────
async function extractBackendError(res: Response): Promise<string> {
  try {
    const err = await res.json();
    return (
      err?.detail ||
      err?.message ||
      (Object.values(err)?.[0] as string) ||
      "حدث خطأ غير متوقع"
    );
  } catch {
    return "حدث خطأ غير متوقع";
  }
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function UniversityTeamPage() {
  const BASE = getBaseUrl();
  const { showToast } = useToast(); // ← global toast

  // tabs
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = (searchParams.get("tab") as Tab) ?? "members";

  const setActiveTab = (tab: Tab) => {
  router.replace(`?tab=${tab}`, { scroll: false });
  };

  // data
  const [members, setMembers] = useState<Member[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [scoutMembers, setScoutMembers] = useState<ScoutMember[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);

  // loading
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [loadingPrograms, setLoadingPrograms] = useState(false);

  // filters – members tab
  const [filterFaculty, setFilterFaculty] = useState("");
  const [filterProgram, setFilterProgram] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [searchMember, setSearchMember] = useState("");

  // pagination
  const [memberPage, setMemberPage] = useState(1);
  const [programPage, setProgramPage] = useState(1);
  const PER_PAGE = 8;

  // modal state
  const [modal, setModal] = useState<Modal>(null);

  // form fields
  const [form, setForm] = useState({
    scout_member_id: "",
    assign_member_id: "",
    assign_role: "",
    assign_prog_member_id: "",
    assign_prog_id: "",
    prog_name: "",
    prog_desc: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // delete confirm
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [clans, setClans] = useState<Clan[]>([]);
  const [selectedClanId, setSelectedClanId] = useState("");
  // ── Helpers ──────────────────────────────────────────────────────────────
  const closeModal = () => {
    setModal(null);
    setSelectedClanId("");   // ← add this
    setScoutMembers([]);
    setForm({
      scout_member_id: "",
      assign_member_id: "",
      assign_role: "",
      assign_prog_member_id: "",
      assign_prog_id: "",
      prog_name: "",
      prog_desc: "",
    });
    setFormErrors({});
  };

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchMembers = useCallback(async () => {
    setLoadingMembers(true);
    try {
      const params = new URLSearchParams();
      if (filterFaculty) params.append("faculty_id", filterFaculty);
      if (filterProgram) params.append("program_id", filterProgram);
      if (filterRole) params.append("role", filterRole);
      const res = await authFetch(
        `${BASE}/api/dept/university_team_members/?${params.toString()}`
      );
      const data = await res.json();
      setMembers(Array.isArray(data) ? data : data?.data ?? [])
    } catch {
      showToast("فشل تحميل أعضاء المنتخب", "error");
    } finally {
      setLoadingMembers(false);
    }
  }, [BASE, filterFaculty, filterProgram, filterRole, showToast]);

  const fetchPrograms = useCallback(async () => {
    setLoadingPrograms(true);
    try {
      const res = await authFetch(`${BASE}/api/dept/university_programs/`);
      const data = await res.json();
      setPrograms(Array.isArray(data) ? data : data?.data ?? []);
    } catch {
      showToast("فشل تحميل البرامج", "error");
    } finally {
      setLoadingPrograms(false);
    }
  }, [BASE, showToast]);


  const fetchFaculties = useCallback(async () => {
    try {
      const res = await authFetch(`${BASE}/api/family/faculties/`);
      const data = await res.json();
      setFaculties(Array.isArray(data) ? data : data?.data ?? []);
    } catch {
      // silent – not critical
    }
  }, [BASE]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

useEffect(() => {
  fetchPrograms();
}, [fetchPrograms]);

useEffect(() => {
  fetchFaculties();
}, [fetchFaculties]);

  // ── Filtered + paginated data ─────────────────────────────────────────────
  const filteredMembers = members.filter((m) =>
    m.student_name?.toLowerCase().includes(searchMember.toLowerCase())
  );
  const totalMemberPages = Math.ceil(filteredMembers.length / PER_PAGE);
  const pagedMembers = filteredMembers.slice(
    (memberPage - 1) * PER_PAGE,
    memberPage * PER_PAGE
  );

  const totalProgramPages = Math.ceil(programs.length / PER_PAGE);
  const pagedPrograms = programs.slice(
    (programPage - 1) * PER_PAGE,
    programPage * PER_PAGE
  );

  // ── Validations ───────────────────────────────────────────────────────────
  const validateAddMember = () => {
    const errs: Record<string, string> = {};
    if (!form.scout_member_id) errs.scout_member_id = "يرجى اختيار العضو";
    return errs;
  };

  const validateAssignRole = () => {
    const errs: Record<string, string> = {};
    if (!form.assign_member_id) errs.assign_member_id = "يرجى اختيار العضو";
    if (!form.assign_role) errs.assign_role = "يرجى اختيار الدور";
    return errs;
  };

  const validateAssignProgram = () => {
    const errs: Record<string, string> = {};
    if (!form.assign_prog_member_id)
      errs.assign_prog_member_id = "يرجى اختيار العضو";
    if (!form.assign_prog_id) errs.assign_prog_id = "يرجى اختيار البرنامج";
    return errs;
  };

  const validateCreateProgram = () => {
    const errs: Record<string, string> = {};
    if (!form.prog_name.trim()) errs.prog_name = "اسم البرنامج مطلوب";
    if (form.prog_name.trim().length < 3)
      errs.prog_name = "الاسم قصير جداً (3 أحرف على الأقل)";
    return errs;
  };
  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className={styles.page} dir="rtl">
      {/* ── Header ── */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <Trophy size={26} />
          </div>
          <div>
            <h1 className={styles.pageTitle}>منتخب الجامعة</h1>
            <p className={styles.pageSubtitle}>
              إدارة أعضاء وبرامج منتخب الكشافة الجامعي
            </p>
          </div>
        </div>
        <div className={styles.headerStats}>
          <div className={styles.hStat}>
            <span className={styles.hStatNum}>{members.length}</span>
            <span className={styles.hStatLabel}>عضو</span>
          </div>
          <div className={styles.hDivider} />
          <div className={styles.hStat}>
            <span className={styles.hStatNum}>{programs.length}</span>
            <span className={styles.hStatLabel}>برنامج</span>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className={styles.tabBar}>
        <button
          className={`${styles.tab} ${activeTab === "members" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("members")}
        >
          <Users size={17} />
          <span>الأعضاء</span>
          <span className={styles.tabBadge}>{members.length}</span>
        </button>
        <button
          className={`${styles.tab} ${activeTab === "programs" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("programs")}
        >
          <BookOpen size={17} />
          <span>البرامج</span>
          <span className={styles.tabBadge}>{programs.length}</span>
        </button>
      </div>

      {/* ══════════════ MEMBERS TAB ══════════════ */}
      {activeTab === "members" && (
        <>
          {/* Controls */}
          <div className={styles.controlsBar}>
            <div className={styles.searchWrapper}>
              <Search size={15} className={styles.searchIcon} />
              <input
                className={styles.searchInput}
                placeholder="ابحث باسم العضو…"
                value={searchMember}
                onChange={(e) => {
                  setSearchMember(e.target.value);
                  setMemberPage(1);
                }}
              />
            </div>

            <div className={styles.filtersRow}>
              {/* KEY FIX: String(f.id) ensures key is always a string */}
              <select
                className={styles.filterSelect}
                value={filterFaculty}
                onChange={(e) => {
                  setFilterFaculty(e.target.value);
                  setMemberPage(1);
                }}
              >
                <option value="">كل الكليات</option>
                {faculties.map((f) => (
                <option key={String(f.faculty_id)} value={String(f.faculty_id)}>
                {f.name}
                </option>
                ))}
              </select>

              <select
                className={styles.filterSelect}
                value={filterProgram}
                onChange={(e) => {
                  setFilterProgram(e.target.value);
                  setMemberPage(1);
                }}
              >
                <option value="">كل البرامج</option>
                {programs.map((p) => (
                  <option key={String(p.program_id)} value={String(p.program_id)}>
                    {p.name}
                  </option>
                ))}
              </select>

              <select
                className={styles.filterSelect}
                value={filterRole}
                onChange={(e) => {
                  setFilterRole(e.target.value);
                  setMemberPage(1);
                }}
              >
                <option value="">كل الأدوار</option>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className={styles.tableWrap}>
            {loadingMembers ? (
              <div className={styles.loadingState}>
                <div className={styles.spinner} />
                <p>جاري تحميل الأعضاء…</p>
              </div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>الاسم</th>
                    <th>الكلية</th>
                    <th>البرنامج</th>
                    <th>الدور الجامعي</th>       
                  </tr>
                </thead>
                <tbody>
                  {pagedMembers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className={styles.emptyCell}>
                        <div className={styles.emptyState}>
                          <Trophy size={38} className={styles.emptyIcon} />
                          <p>لا يوجد أعضاء في المنتخب</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    pagedMembers.map((m, i) => (
                      <tr key={String(m.university_member_id)}>
                        <td className={styles.indexCell}>
                          {(memberPage - 1) * PER_PAGE + i + 1}
                        </td>
                        <td>
                          <div className={styles.nameCell}>

                            <span className={styles.memberName}>{m.student_name}</span>
                          </div>
                        </td>
                        <td className={styles.mutedCell}>
                          {m.faculty_name || "—"}
                        </td>
                        <td className={styles.mutedCell}>
                          {m.programs?.[0]?.program_name || "—"}
                        </td>
                        <td>
                          {m.university_role ? (
                            <span className={styles.roleBadge}>
                              {m.university_role}
                            </span>
                          ) : (
                            <span className={styles.noRole}>لا يوجد دور</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination – Members */}
          {totalMemberPages > 1 && (
            <div className={styles.pagination}>
              <span className={styles.paginInfo}>
                {(memberPage - 1) * PER_PAGE + 1}–
                {Math.min(memberPage * PER_PAGE, filteredMembers.length)} من{" "}
                {filteredMembers.length}
              </span>
              <button
                className={styles.pageBtn}
                onClick={() => setMemberPage((p) => Math.max(1, p - 1))}
                disabled={memberPage === 1}
              >
                <ChevronRight size={17} />
              </button>
              <span className={styles.pageNum}>
                {memberPage} / {totalMemberPages}
              </span>
              <button
                className={styles.pageBtn}
                onClick={() =>
                  setMemberPage((p) => Math.min(totalMemberPages, p + 1))
                }
                disabled={memberPage === totalMemberPages}
              >
                <ChevronLeft size={17} />
              </button>
            </div>
          )}
        </>
      )}

      {/* ══════════════ PROGRAMS TAB ══════════════ */}
      {activeTab === "programs" && (
        <>

          {loadingPrograms ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner} />
              <p>جاري تحميل البرامج…</p>
            </div>
          ) : (
            <div className={styles.programsGrid}>
              {pagedPrograms.length === 0 ? (
                <div className={styles.emptyStateCard}>
                  <BookOpen size={38} className={styles.emptyIcon} />
                  <p>لا توجد برامج مسجلة</p>
                </div>
              ) : (
                pagedPrograms.map((p) => (
                  <div key={String(p.program_id)} className={styles.programCard}>
                    <div className={styles.programIconWrap}>
                      <BookOpen size={20} />
                    </div>
                    <div className={styles.programInfo}>
                      <h3 className={styles.programName}>{p.name}</h3>
                      {p.description && (
                        <p className={styles.programDesc}>{p.description}</p>
                      )}
                    </div>
                    <span className={styles.programId}>#{p.program_id}</span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Pagination – Programs */}
          {totalProgramPages > 1 && (
            <div className={styles.pagination}>
              <span className={styles.paginInfo}>
                {(programPage - 1) * PER_PAGE + 1}–
                {Math.min(programPage * PER_PAGE, programs.length)} من{" "}
                {programs.length}
              </span>
              <button
                className={styles.pageBtn}
                onClick={() => setProgramPage((p) => Math.max(1, p - 1))}
                disabled={programPage === 1}
              >
                <ChevronRight size={17} />
              </button>
              <span className={styles.pageNum}>
                {programPage} / {totalProgramPages}
              </span>
              <button
                className={styles.pageBtn}
                onClick={() =>
                  setProgramPage((p) => Math.min(totalProgramPages, p + 1))
                }
                disabled={programPage === totalProgramPages}
              >
                <ChevronLeft size={17} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}