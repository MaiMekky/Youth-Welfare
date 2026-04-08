"use client";

import React, { useState, useEffect } from "react";
import styles from "./ACtivityLogs.module.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { authFetch } from "@/utils/globalFetch";

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
  const [actionFilter, setActionFilter] = useState("all");
  const [activityFilter, setActivityFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage, setLogsPerPage] = useState(5);

  // 🔥 FETCH LOGS
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem("access");

        const response = await authFetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/solidarity/super_dept/system_logs/`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();
        // Handle array, paginated { results: [] }, or unexpected shapes
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

  // ⚡ تحويل البيانات لشكل الجدول
  const mappedLogs = logs.map((log) => ({
    id: log.log_id,
    who: log.actor_name,
    action: log.action,
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
    activityType: log.target_type.includes("تكافل") ? "تكافل" : "أسر",
  }));

  // 🔍 الفلاتر
  const filteredLogs = mappedLogs.filter((log) => {
    const term = search.trim().toLowerCase();
    const matchesSearch =
      log.who.toLowerCase().includes(term) ||
      log.action.toLowerCase().includes(term) ||
      log.which.toLowerCase().includes(term);

    const matchesAction =
      actionFilter === "all" || log.action === actionFilter;
    const matchesActivity =
      activityFilter === "all" || log.activityType === activityFilter;
    return matchesSearch && matchesAction && matchesActivity;
  });

  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  const displayedLogs = filteredLogs.slice(
    (currentPage - 1) * logsPerPage,
    currentPage * logsPerPage
  );

  const handlePrev = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const handleNext = () =>
    setCurrentPage((p) => Math.min(p + 1, totalPages));

  return (
    <div className={styles.activityLogsContainer}>
      <div className={styles.filters}>
        <input type="date" />

        <select onChange={(e) => setActionFilter(e.target.value)}>
          <option value="all">كل الإجراءات</option>
          <option value="موافقة طلب">موافقة طلب</option>
          <option value="موافقة مبدئية">موافقة مبدئية</option>
          <option value="رفض طلب">رفض طلب</option>
          <option value="عرض مستندات الطلب">عرض مستندات الطلب</option>
          <option value="عرض بيانات الطلب">عرض بيانات الطلب</option>
        </select>

        <select onChange={(e) => setActivityFilter(e.target.value)}>
          <option value="all">كل الأنشطة</option>
          <option value="تكافل">تكافل</option>
          <option value="أسر">أسر</option>
        </select>

        <input
          type="text"
          placeholder="ابحث بالاسم أو الإجراء أو الهدف"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* TABLE WRAPPER */}
      <div className={styles.tableWrapper}>
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
                <td
                  colSpan={9}
                  style={{
                    textAlign: "center",
                    padding: "48px 0",
                    color: "#9ca3af",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span style={{ fontSize: "2rem" }}>🗂️</span>
                    <span style={{ fontSize: "1rem", fontWeight: 600 }}>
                      لا توجد سجلات
                    </span>
                   
                  </div>
                </td>
              </tr>
            ) : (
              displayedLogs.map((log) => (
                <tr key={log.id}>
                  <td>{log.who}</td>
                  <td>{log.action}</td>
                  <td>{log.when}</td>
                  <td>{log.role}</td>
                  <td>{log.faculty}</td>
                  <td>{log.ip}</td>
                  <td style={{ fontWeight: "bold" }}>{log.which}</td>
                  <td>{log.what}</td>
                  <td>
                    <span
                      className={`${styles.statusTag} ${styles[log.statusClass]}`}
                    >
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER */}
      <div className={styles.gmailFooter}>
        <div className={styles.paginationInfo}>
          عرض <strong>{(currentPage - 1) * logsPerPage + 1}</strong>-
          <strong>
            {Math.min(currentPage * logsPerPage, filteredLogs.length)}
          </strong>{" "}
          من <strong>{filteredLogs.length}</strong> سجل
        </div>

        <select
          value={logsPerPage}
          onChange={(e) => {
            setLogsPerPage(Number(e.target.value));
            setCurrentPage(1);
          }}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={25}>25</option>
        </select>

        <div className={styles.paginationControls}>
          <button
            className={styles.arrowBtn}
            onClick={handlePrev}
            disabled={currentPage === 1}
          >
            <ChevronRight style={{ color: "#2C3A5F" }} size={20} />
          </button>

          <button
            className={styles.arrowBtn}
            onClick={handleNext}
            disabled={currentPage === totalPages}
          >
            <ChevronLeft style={{ color: "#2C3A5F" }} size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}