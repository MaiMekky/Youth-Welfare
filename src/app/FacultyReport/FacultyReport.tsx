"use client";
import React, { useState, useEffect } from "react";
import styles from "./FacultyReport.module.css";
import { ChevronLeft, ChevronRight, Search, Wallet, Users, FileText } from "lucide-react";
import axios from "axios";
import Footer from "../FacLevel/components/Footer";
import { useRouter } from "next/navigation";

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
  const [token, setToken]             = useState<string | null>(null);
  const [userData, setUserData]       = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUserData(JSON.parse(storedUser));
  }, []);

  useEffect(() => {
    setToken(localStorage.getItem("access"));
  }, []);

  const fetchData = async () => {
    if (!token) return;
    try {
      const res = await axios.get(
        "http://127.0.0.1:8000/api/solidarity/faculty/faculty_approved/",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const mapped: StudentType[] = res.data.results.map((item: any) => ({
        name:   item.student_name,
        id:     item.student_id,
        req:    item.solidarity_id,
        amount: Number(item.total_income) || 0,
        date:   "-",
        gpa:    "-",
      }));
      setStudents(mapped);
    } catch (err) {
      console.error("API Error:", err);
    }
  };

  useEffect(() => { if (token) fetchData(); }, [token]);

  const filteredStudents = students.filter((s) =>
    [s.name, s.id, String(s.req)].join(" ").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages     = Math.ceil(filteredStudents.length / rowsPerPage);
  const startIndex     = (currentPage - 1) * rowsPerPage;
  const currentStudents = filteredStudents.slice(startIndex, startIndex + rowsPerPage);
  const totalAmount    = filteredStudents.reduce((acc, s) => acc + (s.amount || 0), 0);

  const handleExport = async () => {
    try {
      const res = await axios.get(
        "http://127.0.0.1:8000/api/solidarity/faculty/export",
        { headers: { Authorization: `Bearer ${localStorage.getItem("access")}` }, responseType: "blob" }
      );
      const url  = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href  = url;
      const cd   = res.headers["content-disposition"];
      link.download = cd?.match(/filename="?(.+)"?/)?.[1] ?? "document.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export error:", err);
    }
  };

  return (
    <div className={styles.facultyReportPage}>

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
            <button className={styles.exportBtn} onClick={handleExport}>
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