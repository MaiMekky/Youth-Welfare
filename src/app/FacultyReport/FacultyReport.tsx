"use client";
import React, { useState, useEffect } from "react";
import styles from "./FacultyReport.module.css";
import { ChevronLeft, ChevronRight, Search, Wallet, Users, FileText } from "lucide-react";
import Footer from "../FacLevel/components/Footer";
import { useToast } from "@/app/context/ToastContext";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";
import { getSessionMeta } from "@/utils/cookieHelpers";

interface StudentType {
  name: string;
  req: number;
  amount: number;
  date: string;
  gpa: string | number;
  discount: number;
}

export default function FacultyReport() {
  const [students, setStudents]       = useState<StudentType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [userData, setUserData]       = useState<Record<string, unknown> | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [showExportModal, setShowExportModal] = useState(false);
  const [academicYear, setAcademicYear] = useState("");
  const { showToast } = useToast();
  useEffect(() => {
    const meta = getSessionMeta();
    if (meta) setUserData({ faculty_name: meta.faculty_name, name: meta.name });
  }, []);

useEffect(() => {
  fetchData();
}, []);
const [totalDiscount, setTotalDiscount] = useState(0);
const [isExporting, setIsExporting] = useState(false);

const fetchData = async () => {
  try {
    const res = await authFetch(`${getBaseUrl()}/api/solidarity/faculty/faculty_approved/`);
    if (!res.ok) throw new Error("API_ERROR");
    const data = await res.json();

    setTotalDiscount(Number(data.total_discount) || 0);

    const mapped: StudentType[] = data.results.map((item: Record<string, unknown>) => ({
      name: item.student_name as string,
      req: item.solidarity_id as number,
      amount: Number(item.total_income) || 0,
      discount: Number(item.discount_amount) || 0,
    }));

    setStudents(mapped);
  } catch (err) {
    console.error("API Error:", err);
  }
};

  const filteredStudents = students.filter((s) =>
    [s.name, String(s.req)].join(" ").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages     = Math.ceil(filteredStudents.length / rowsPerPage);
  const startIndex     = (currentPage - 1) * rowsPerPage;
  const currentStudents = filteredStudents.slice(startIndex, startIndex + rowsPerPage);
  const totalAmount    = filteredStudents.reduce((acc, s) => acc + (s.amount || 0), 0);
const handleExport = async () => {
  try {
    setIsExporting(true);

    const res = await authFetch(
      `${getBaseUrl()}/api/solidarity/faculty/export/?acd_year=${academicYear}`
    );

    if (res.status === 422) {
      showToast("لا يوجد تقرير لهذه الفرقة", "error");
      setShowExportModal(false);
      setAcademicYear("");
      return;
    }

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
    setAcademicYear("");

  } catch (err) {
    console.error("Export error:", err);
    showToast("حدث خطأ أثناء التصدير", "error");
  } finally {
    setIsExporting(false);
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
              <option value="الفرقة الأولى">الفرقة الأولى</option>
              <option value="الفرقة الثانية">الفرقة الثانية</option>
              <option value="الفرقة الثالثة">الفرقة الثالثة</option>
              <option value="الفرقة الرابعة">الفرقة الرابعة</option>
              <option value="الفرقة الخامسة">الفرقة الخامسة</option>
              <option value="الفرقة السادسة">الفرقة السادسة</option>
            </select>

            <div className={styles.modalButtons}>
              <button
                className={styles.cancelBtn}
                onClick={() => {
                  setShowExportModal(false);
                  setAcademicYear("");
                }}
              >
                إلغاء
              </button>
              <button
                className={styles.confirmBtn}
                onClick={handleExport}
                disabled={!academicYear || isExporting}
              >
                {isExporting ? "جاري التصدير..." : "تصدير"}
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
            <p>إجمالي الخصم</p>
            <h2>{totalDiscount.toLocaleString()} ج.م</h2>
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
                  <th>رقم الطلب</th>
                  <th>اسم الطالب</th>
                  <th>الدخل (جنيه)</th>
                  <th>الخصم (جنيه)</th>
                </tr>
              </thead>
              <tbody>
                {currentStudents.length > 0 ? (
                  currentStudents.map((s, i) => (
                    <tr key={i}>
                      <td>{s.req}</td>
                       <td>{s.name}</td>
                      <td className={styles.amount}>{s.amount.toLocaleString()}</td>
                      <td className={styles.amount}>{s.discount.toLocaleString()}</td>
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
