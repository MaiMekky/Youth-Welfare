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
  const [students, setStudents] = useState<StudentType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    document.cookie = "access=; path=/; max-age=0; SameSite=Lax";
    document.cookie = "refresh=; path=/; max-age=0; SameSite=Lax";
    document.cookie = "user_type=; path=/; max-age=0; SameSite=Lax";
    document.cookie = "roleKey=; path=/; max-age=0; SameSite=Lax";
    document.cookie = "role=; path=/; max-age=0; SameSite=Lax";
    router.push("/");
  };

  const toggleMenu = () => setIsMenuOpen((p) => !p);

  const handleNavClick = (path: string) => {
    router.push(path);
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
  }, []);

  // ================================
  // ✅ Load token
  // ================================
  useEffect(() => {
    const t = localStorage.getItem("access");
    setToken(t);
  }, []);

  // ================================
  // 🔥 Fetch Data
  // ================================
  const fetchData = async () => {
    if (!token) return;

    try {
      const res = await axios.get(
        "http://127.0.0.1:8000/api/solidarity/faculty/faculty_approved/",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const apiData = res.data;

      const mapped: StudentType[] = apiData.results.map((item: any) => ({
        name: item.student_name,
        id: item.student_id,
        req: item.solidarity_id,
        amount: Number(item.total_income) || 0,
        date: "-", // ❌ No date in API so we show placeholder
        gpa: "-",  // ❌ No GPA returned from API
      }));

      setStudents(mapped);
    } catch (err) {
      console.error("API Error:", err);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  // ================================
  // 🔍 Search Filter
  // ================================
  const filteredStudents = students.filter((s) =>
    [s.name, s.id, String(s.req)]
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  // ================================
  // 📄 Pagination
  // ================================
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const totalPages = Math.ceil(filteredStudents.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  const currentStudents = filteredStudents.slice(startIndex, endIndex);

  // ================================
  // 📊 Stats
  // ================================
  const totalAmount = filteredStudents.reduce(
    (acc, s) => acc + (s.amount || 0),
    0
  );
  const totalCount = filteredStudents.length;

  const handleExport = async () => { 
    try {
      const res = await axios.get(
        `http://127.0.0.1:8000/api/solidarity/faculty/export`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
          responseType: "blob"
        }
      );
      const blob = new Blob([res.data], { type: 'application/pdf' });
    
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const contentDisposition = res.headers['content-disposition'];
      let filename = 'document.pdf';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch.length === 2) {
          filename = filenameMatch[1];
        }
      }
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("coudnt generate pdf, error:", err);
    }
  }

  return (
    <div className={styles.facultyReportPage}>
      <header className={styles.facultyHeader}>
      <div className={styles.headerLeft}>
        <div>
          <h1>التقرير الشامل - {userData?.faculty_name || ""}</h1>
          <p>Engineering Faculty - Comprehensive Report</p>
        </div>
      </div>

      {/* Hamburger (Mobile) */}
      <button
        className={styles.hamburger}
        onClick={toggleMenu}
        aria-label="Toggle menu"
        aria-expanded={isMenuOpen}
        type="button"
      >
        <span className={`${styles.hamburgerLine} ${isMenuOpen ? styles.open : ""}`}></span>
        <span className={`${styles.hamburgerLine} ${isMenuOpen ? styles.open : ""}`}></span>
        <span className={`${styles.hamburgerLine} ${isMenuOpen ? styles.open : ""}`}></span>
      </button>

      {/* Buttons */}
      <nav
        className={`${styles.headerRight} ${isMenuOpen ? styles.mobileMenuOpen : ""}`}
        aria-label="Main navigation"
      >
        <button className={styles.navBtn} onClick={() => handleNavClick("/FacLevel")} type="button">
          التكافل الاجتماعي
        </button>

        <button className={styles.navBtn} onClick={() => handleNavClick("/Family-Faclevel/events")} type="button">
          الاسر الطلابية
        </button>

        <button className={styles.navBtn} onClick={() => handleNavClick("/activities")} type="button">
          الانشطة
        </button>

        <button className={styles.logoutBtn} onClick={handleLogout} type="button">
          تسجيل خروج
        </button>
      </nav>
    </header>
      <main className={styles.facultyMain}>
        <section className={styles.statsSection}>
          <div className={`${styles.statBox} ${styles.yellow}`}>
            <div>
              <p>إجمالي المبلغ</p>
              <h2>{totalAmount.toLocaleString()} ج.م</h2>
            </div>
           <span className={styles.icon} aria-hidden="true">
          <Wallet size={28} />
        </span>
          </div>

          <div className={`${styles.statBox} ${styles.blue}`}>
            <div>
              <p>إجمالي الطلبات</p>
              <h2>{totalCount}</h2>
            </div>
           <span className={styles.icon} aria-hidden="true">
            <Users size={28} />
          </span>
          </div>
        </section>

        <div className={styles.searchBar}>
          <Search size={18} />
          <input
            type="text"
            placeholder="...ابحث بالاسم، رقم الطالب أو رقم الطلب"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className={styles.tableContainer}>
          <div className={styles.tableHeader}>
            <h2>تفاصيل طلبات الطلاب</h2>
            <div className={styles.tableButtons}>
              <button className={styles.exportBtn} onClick={handleExport}>
                 <FileText size={18} />
                <span>تصدير</span>  
                 </button>
            </div>
          </div>
<div className={styles.tableScroll}>
          <table className={styles.reportTable}>
            <thead>
              <tr>
                <th>اسم الطالب</th>
                <th>رقم الطالب</th>
                <th>رقم الطلب</th>
                <th>(جنيه) المبلغ</th>
              </tr>
            </thead>

            <tbody>
              {currentStudents.length > 0 ? (
                currentStudents.map((s, i) => (
                  <tr key={i}>
                    <td>{s.name}</td>
                    <td>{s.id}</td>
                    <td>{s.req}</td>
                    <td className={styles.amount}>
                      {s.amount.toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4}>لا توجد نتائج مطابقة</td>
                </tr>
              )}
            </tbody>
          </table>
     </div>
          <div className={styles.gmailFooter}>
            <div className={styles.paginationInfo}>
              عرض <strong>{startIndex + 1}</strong>–
              <strong>{Math.min(endIndex, filteredStudents.length)}</strong> من{" "}
              <strong>{filteredStudents.length}</strong>
            </div>

            <div className={styles.paginationControls}>
              <span>عدد العناصر في الصفحة:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
              </select>

              <button
                className={styles.arrowBtn}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronRight size={18} />
              </button>

              <button
                className={styles.arrowBtn}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                <ChevronLeft size={18} />
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer/>
    </div>
  );
}
