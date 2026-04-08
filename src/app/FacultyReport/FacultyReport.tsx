"use client";
import React, { useState, useEffect } from "react";
import styles from "./FacultyReport.module.css";
import { ChevronLeft, ChevronRight, Search, Wallet, Users, FileText } from "lucide-react";
import Footer from "../FacLevel/components/Footer";

import { authFetch } from "@/utils/globalFetch";

interface StudentType {
  name: string;
  id: number | string;
  req: number;
  amount: number;
  date: string;
  gpa: string | number;
}

export default function FacultyReport() {
  const [students, setStudents]       = useState<StudentType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [userData, setUserData]       = useState<Record<string, unknown> | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [showExportModal, setShowExportModal] = useState(false);
  const [academicYear, setAcademicYear] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUserData(JSON.parse(storedUser));
  }, []);

useEffect(() => {
  fetchData();
}, []);
const fetchData = async () => {
  try {
    const res = await authFetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/solidarity/faculty/faculty_approved/`
    );

    if (!res.ok) throw new Error("API_ERROR");

    const data = await res.json();

    const mapped: StudentType[] = data.results.map((item: Record<string, unknown>) => ({
      name: item.student_name,
      id: item.student_id,
      req: item.solidarity_id,
      amount: Number(item.total_income) || 0,
      date: "-",
      gpa: "-",
    }));

    setStudents(mapped);

  } catch (err) {
    console.error("API Error:", err);
  }
};


  const filteredStudents = students.filter((s) =>
    [s.name, s.id, String(s.req)].join(" ").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages     = Math.ceil(filteredStudents.length / rowsPerPage);
  const startIndex     = (currentPage - 1) * rowsPerPage;
  const currentStudents = filteredStudents.slice(startIndex, startIndex + rowsPerPage);
  const totalAmount    = filteredStudents.reduce((acc, s) => acc + (s.amount || 0), 0);
const handleExport = async () => {
  try {
const res = await authFetch(
  `${process.env.NEXT_PUBLIC_BASE_URL}/api/solidarity/faculty/export/?acd_year=${academicYear}`
);

if (!res.ok) throw new Error("EXPORT_ERROR");

const blob = await res.blob();
    const url = window.URL.createObjectURL(
new Blob([blob], { type: "application/pdf" })
    );

    const link = document.createElement("a");
    link.href = url;

const cd = res.headers.get("content-disposition");
    link.download = cd?.match(/filename="?(.+)"?/)?.[1] ?? "report.pdf";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);

    setShowExportModal(false);

  } catch (err) {
    console.error("Export error:", err);
  }
};
  return (
    <div className={styles.facultyReportPage}>
      {showExportModal && (
        <div className={styles.exportModalOverlay}>
          <div className={styles.exportModal}>
            <h3>اختر السنة الدراسية</h3>

            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className={styles.yearSelect}
            >
              <option value="" disabled hidden>اختر السنة</option>
              <option value="الفرقة الاولى">الفرقة الأولى</option>
              <option value="الفرقة الثانية">الفرقة الثانية</option>
              <option value="الفرقة الثالثة">الفرقة الثالثة</option>
              <option value="الفرقة الرابعة">الفرقة الرابعة</option>
            </select>

            <div className={styles.modalButtons}>
              <button
                className={styles.cancelBtn}
                onClick={() => setShowExportModal(false)}
              >
                إلغاء
              </button>

              <button
                className={styles.confirmBtn}
                onClick={handleExport}
                disabled={!academicYear}
              >
                تصدير
              </button>
            </div>
          </div>
        </div>
      )}
      <main className={styles.facultyMain}>

        {/* ── Page title bar ── */}
        <div className={styles.pageTitle}>
          <div>
            <h1>{userData?.faculty_name ? `التقرير الشامل — ${userData.faculty_name}` : "التقرير الشامل"}</h1>
            <p>Engineering Faculty · Comprehensive Report</p>
          </div>
        </div>

        {/* ── Stats ── */}
        <section className={styles.statsSection}>
          <div className={`${styles.statBox} ${styles.yellow}`}>
            <div>
              <p>إجمالي المبلغ</p>
              <h2>{totalAmount.toLocaleString()} ج.م</h2>
            </div>
            <span className={styles.icon}><Wallet size={28} /></span>
          </div>
          <div className={`${styles.statBox} ${styles.blue}`}>
            <div>
              <p>إجمالي الطلبات</p>
              <h2>{filteredStudents.length}</h2>
            </div>
            <span className={styles.icon}><Users size={28} /></span>
          </div>
        </section>

        {/* ── Search ── */}
        <div className={styles.searchBar}>
          <Search size={18} />
          <input
            type="text"
            placeholder="...ابحث بالاسم، رقم الطالب أو رقم الطلب"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          />
        </div>

        {/* ── Table ── */}
        <div className={styles.tableContainer}>
          <div className={styles.tableHeader}>
            <h2>تفاصيل طلبات الطلاب</h2>
            <button className={styles.exportBtn} onClick={() => setShowExportModal(true)}>
              <FileText size={16} /><span>تصدير PDF</span>
            </button>
          </div>

          <div className={styles.tableScroll}>
            <table className={styles.reportTable}>
              <thead>
                <tr>
                  <th>اسم الطالب</th>
                  <th>رقم الطالب</th>
                  <th>رقم الطلب</th>
                  <th>المبلغ (جنيه)</th>
                </tr>
              </thead>
              <tbody>
                {currentStudents.length > 0 ? (
                  currentStudents.map((s, i) => (
                    <tr key={i}>
                      <td>{s.name}</td>
                      <td>{s.id}</td>
                      <td>{s.req}</td>
                      <td className={styles.amount}>{s.amount.toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={4} className={styles.noData}>لا توجد نتائج مطابقة</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className={styles.gmailFooter}>
            <div className={styles.paginationInfo}>
              عرض <strong>{startIndex + 1}</strong>–<strong>{Math.min(startIndex + rowsPerPage, filteredStudents.length)}</strong> من <strong>{filteredStudents.length}</strong>
            </div>
            <div className={styles.paginationControls}>
              <span>عدد العناصر في الصفحة:</span>
              <select value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
              </select>
              <button className={styles.arrowBtn} onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1}>
                <ChevronRight size={18} />
              </button>
              <button className={styles.arrowBtn} onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0}>
                <ChevronLeft size={18} />
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}