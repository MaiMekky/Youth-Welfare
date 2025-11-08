"use client";
import React, { useState } from "react";
import styles from "./ACtivityLogs.module.css";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const sampleLogs = [
  {
    id: 1,
    details: "تم إنشاء فعالية فنية بعدد 150 مشارك",
    ip: "192.168.1.100",
    status: "نجاح",
    statusClass: "success",
    action: "إنشاء",
    actionClass: "create",
    which: "معرض الفن 2024",
    what: "تم إنشاء فعالية جديدة",
    who: "أحمد علي",
    when: "2025-11-08 10:30",
  },
  {
    id: 2,
    details: "تم إلغاء صلاحية حذف المستخدم",
    ip: "192.168.1.105",
    status: "نجاح",
    statusClass: "success",
    action: "تغيير الصلاحيات",
    actionClass: "change-permissions",
    which: "المستخدم مايك ديفيس",
    what: "تم تحديث صلاحيات المستخدم",
    who: "منى سمير",
    when: "2025-11-08 11:00",
  },
  {
    id: 3,
    details: "تم حذف فعالية رياضية ملغاة",
    ip: "192.168.1.110",
    status: "نجاح",
    statusClass: "success",
    action: "حذف",
    actionClass: "delete",
    which: "بطولة رياضية قديمة",
    what: "تم حذف الفعالية",
    who: "خالد محمد",
    when: "2025-11-08 12:00",
  },
  {
    id: 4,
    details: "كلمة مرور غير صحيحة",
    ip: "192.168.1.115",
    status: "فشل",
    statusClass: "failed",
    action: "تسجيل الدخول",
    actionClass: "login",
    which: "لوحة الإدارة",
    what: "محاولة تسجيل دخول فاشلة",
    who: "منى سمير",
    when: "2025-11-08 12:30",
  },
  {
    id: 5,
    details: "تم تحديث تاريخ ومكان الفعالية",
    ip: "192.168.1.120",
    status: "نجاح",
    statusClass: "success",
    action: "تحديث",
    actionClass: "update",
    which: "مهرجان ثقافي 2024",
    what: "تم تحديث الفعالية",
    who: "أحمد علي",
    when: "2025-11-08 13:00",
  },
  {
    id: 6,
    details: "إنهاء الجلسة بشكل طبيعي",
    ip: "192.168.1.125",
    status: "نجاح",
    statusClass: "success",
    action: "تسجيل خروج",
    actionClass: "logout",
    which: "جلسة الإدارة",
    what: "تم تسجيل الخروج",
    who: "خالد محمد",
    when: "2025-11-08 14:00",
  },
];
export default function ActivityLogsTable() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage, setLogsPerPage] = useState(5);

  const filteredLogs = sampleLogs.filter((log) => {
    const matchesSearch =
      log.details.includes(search) ||
      log.which.includes(search) ||
      log.who.includes(search);
    const matchesStatus = statusFilter === "all" || log.status === statusFilter;
    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    return matchesSearch && matchesStatus && matchesAction;
  });

  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  const displayedLogs = filteredLogs.slice(
    (currentPage - 1) * logsPerPage,
    currentPage * logsPerPage
  );

  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  return (
    <div className={styles.activityLogsContainer}>
      <h2 className={styles.logsHeader}>سجلات النشاط والتقارير</h2>

      <div className={styles.filters}>
        <button>تصدير ⬇</button>
        <input type="date" />
        <select onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">كل الحالات</option>
          <option value="نجاح">نجاح</option>
          <option value="فشل">فشل</option>
        </select>
        <select onChange={(e) => setActionFilter(e.target.value)}>
          <option value="all">كل الإجراءات</option>
          <option value="إنشاء">إنشاء</option>
          <option value="تحديث">تحديث</option>
          <option value="حذف">حذف</option>
          <option value="تسجيل الدخول">تسجيل الدخول</option>
          <option value="تسجيل خروج">تسجيل خروج</option>
          <option value="تغيير الصلاحيات">تغيير الصلاحيات</option>
        </select>
        <input
          type="text"
          placeholder="ابحث بالاسم أو الإجراء أو الهدف"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <table className={styles.logsTable}>
        <thead>
          <tr>
            <th>من قام</th>
            <th>ماذا فعل</th>
            <th>متى</th>
            <th>التفاصيل</th>
            <th>عنوان IP</th>
            <th>الهدف</th>
            <th>الوصف</th>
            <th>الحالة</th>
            <th>الإجراء</th>
          </tr>
        </thead>
        <tbody>
          {displayedLogs.map((log) => (
            <tr key={log.id}>
              <td>{log.who}</td>
              <td>{log.action}</td>
              <td>{log.when}</td>
              <td>{log.details}</td>
              <td>{log.ip}</td>
              <td style={{ fontWeight: "bold" }}>{log.which}</td>
              <td>{log.what}</td>
              <td>
                <span className={`${styles.statusTag} ${styles[log.statusClass]}`}>
                  {log.status}
                </span>
              </td>
              <td>
                <span className={`${styles.actionTag} ${styles[log.actionClass]}`}>
                  {log.action}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={styles.gmailFooter}>
        <div className="paginationInfo">
          عرض{" "}
          <strong>{(currentPage - 1) * logsPerPage + 1}</strong>-
          <strong>{Math.min(currentPage * logsPerPage, filteredLogs.length)}</strong>{" "}
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

        <div className="paginationControls" >
          <button className="arrowBtn" onClick={handlePrev} disabled={currentPage === 1}>
             <ChevronRight style={{color : "#2C3A5F"}} size={20} />
          </button>
          <button
            className="arrowBtn"
            onClick={handleNext}
            disabled={currentPage === totalPages}
          >
            <ChevronLeft style={{color : "#2C3A5F"}} size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}