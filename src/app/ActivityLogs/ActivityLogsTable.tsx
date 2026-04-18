"use client";

import React, { useState, useEffect } from "react";
import styles from "./ACtivityLogs.module.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";

interface Log {
  log_id: number;
  actor_name: string;
  actor_role: string | null;
  faculty_name: string | null;
  action: string;
  target_type: string;
  solidarity_id: number;
  ip_address: string | null;
  logged_at: string;
}

export default function ActivityLogsTable() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [activityFilter, setActivityFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage, setLogsPerPage] = useState(5);
  const [dateFilter, setDateFilter] = useState("");

  // FETCH LOGS
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem("access");

        const response = await authFetch(
          `${getBaseUrl()}/api/solidarity/super_dept/system_logs/`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();
        const logsArray = Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
          ? data.results
          : [];
        setLogs(logsArray);
      } catch (error) {
        console.error("Error fetching logs: ", error);
      }
    };

    fetchLogs();
  }, []);

  const mappedLogs = logs.map((log) => ({
    id: log.log_id,
    who: log.actor_name,
    action: log.action,
    rawDate: log.logged_at,
    when: new Date(log.logged_at).toLocaleString("ar-EG", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }),
    role: log.actor_role || "—",
    faculty: log.faculty_name || "—",
    ip: log.ip_address || "-",
    which: log.target_type,
    what: log.solidarity_id,
    status: log.action.includes("رفض") ? "فشل" : "نجاح",
    statusClass: log.action.includes("رفض") ? "failed" : "success",
    activityType: log.target_type.includes("تكافل")
      ? "تكافل"
      : log.target_type.includes("اسر") || log.target_type.includes("أسرة")
      ? "اسر"
      : log.target_type.includes("نشاط")
      ? "نشاط"
      : "اخر",
  }));

  const filteredLogs = mappedLogs.filter((log) => {
    const term = search.trim().toLowerCase();
    const matchesSearch =
      log.who.toLowerCase().includes(term) ||
      log.action.toLowerCase().includes(term) ||
      log.which.toLowerCase().includes(term);

    const matchesRole =
      roleFilter === "all" || log.role === roleFilter;
    const matchesActivity =
      activityFilter === "all" || log.activityType === activityFilter;
    const matchesDate =
      !dateFilter ||
      new Date(log.rawDate).toISOString().split("T")[0] === dateFilter;

    return matchesSearch && matchesRole && matchesActivity && matchesDate
  });

  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  const displayedLogs = filteredLogs.slice(
    (currentPage - 1) * logsPerPage,
    currentPage * logsPerPage
  );

  const handlePrev = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const handleNext = () => setCurrentPage((p) => Math.min(p + 1, totalPages));

  return (
    <div className={styles.activityLogsContainer} dir="rtl">

      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>سجلات النشاط</h1>
          <p className={styles.pageSubtitle}>عرض وتتبع جميع الإجراءات المنفذة داخل النظام</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className={styles.statsRow}>
        <div className={`${styles.statCard} ${styles.statTotal}`}>
          <div className={styles.statNum}>{mappedLogs.length}</div>
          <div className={styles.statLabel}>إجمالي السجلات</div>
        </div>
        <div className={`${styles.statCard} ${styles.statSuccess}`}>
          <div className={styles.statNum}>{mappedLogs.filter(l => l.statusClass === "success").length}</div>
          <div className={styles.statLabel}>عملية ناجحة</div>
        </div>
        <div className={`${styles.statCard} ${styles.statFailed}`}>
          <div className={styles.statNum}>{mappedLogs.filter(l => l.statusClass === "failed").length}</div>
          <div className={styles.statLabel}>عملية فاشلة</div>
        </div>
        <div className={`${styles.statCard} ${styles.statFiltered}`}>
          <div className={styles.statNum}>{filteredLogs.length}</div>
          <div className={styles.statLabel}>نتائج البحث</div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.controlsBar}>
        <input
          type="date"
          placeholder="التاريخ"
          className={styles.dateInput}
          value={dateFilter}
          onChange={(e) => {
            setDateFilter(e.target.value);
            setCurrentPage(1);
          }}
        />

        <div className={styles.selectWrapper}>
          <select
            className={styles.roleSelect}
            onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="all">كل الأدوار</option>
            <option value="مدير ادارة">مدير ادارة</option>
            <option value="مدير عام">مدير عام</option>
            <option value="مدير كلية">مدير كلية</option>
            <option value="مشرف النظام">مشرف النظام</option>
            <option value="مسؤول كلية">مسؤول كلية</option>
          </select>
        </div>

        <div className={styles.selectWrapper}>
          <select
            className={styles.roleSelect}
            onChange={(e) => { setActivityFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="all">كل الأنشطة</option>
            <option value="تكافل">تكافل</option>
            <option value="اسر">اسر</option>
            <option value="نشاط">نشاط</option>
            <option value="اخر">اخر</option>
          </select>
        </div>

        <div className={styles.searchWrapper}>
          <svg className={styles.searchIcon} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="ابحث بالاسم أو الإجراء أو الهدف"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableContainer}>
        <table className={styles.logsTable}>
          <thead>
            <tr>
              <th>من قام</th>
              <th>ماذا فعل</th>
              <th>متى</th>
              <th>الدور</th>
              <th>الكلية</th>
              <th>عنوان IP</th>
              <th>الهدف</th>
              <th>رقم الطلب</th>
              <th>الحالة</th>
            </tr>
          </thead>

          <tbody>
            {displayedLogs.length === 0 ? (
              <tr>
                <td colSpan={9} className={styles.emptyState}>
                  <div className={styles.emptyIcon}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z"/>
                    </svg>
                  </div>
                  <p>لا توجد سجلات</p>
                </td>
              </tr>
            ) : (
              displayedLogs.map((log) => (
                <tr key={log.id}>
                  <td>
                    <div className={styles.actorCell}>
                      <div className={styles.actorAvatar}>{log.who.charAt(0)}</div>
                      <span className={styles.actorName}>{log.who}</span>
                    </div>
                  </td>
                  <td className={styles.actionCell}>{log.action}</td>
                  <td><span className={styles.dateText}>{log.when}</span></td>
                  <td>
                    <span className={styles.roleBadge}>{log.role}</span>
                  </td>
                  <td className={styles.mutedCell}>{log.faculty}</td>
                  <td className={styles.ipCell}>{log.ip}</td>
                  <td className={styles.targetCell}>{log.which}</td>
                  <td className={styles.mutedCell}>{log.what}</td>
                  <td>
                    <span className={`${styles.statusTag} ${styles[log.statusClass]}`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className={styles.gmailFooter}>
        <div className={styles.paginationInfo}>
          عرض <strong>{filteredLogs.length === 0 ? 0 : (currentPage - 1) * logsPerPage + 1}</strong>–
          <strong>{Math.min(currentPage * logsPerPage, filteredLogs.length)}</strong>{" "}
          من <strong>{filteredLogs.length}</strong> سجل
        </div>

        <select
          className={styles.perPageSelect}
          value={logsPerPage}
          onChange={(e) => { setLogsPerPage(Number(e.target.value)); setCurrentPage(1); }}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={25}>25</option>
        </select>

        <div className={styles.paginationControls}>
          <button className={styles.arrowBtn} onClick={handlePrev} disabled={currentPage === 1}>
            <ChevronRight size={18} />
          </button>
          <span className={styles.pageIndicator}>{currentPage} / {totalPages || 1}</span>
          <button className={styles.arrowBtn} onClick={handleNext} disabled={currentPage === totalPages || totalPages === 0}>
            <ChevronLeft size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}