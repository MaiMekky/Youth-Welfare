"use client";
import React, { useState, useEffect } from "react";
import styles from "./FacultyReport.module.css";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import axios from "axios"; 

export default function FacultyReport() {
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const BEARER_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzYzMjQ0ODU5LCJpYXQiOjE3NjMyMzU4NTksImp0aSI6ImMzY2RiYzVkMWY3NjRkODdiZjljZTFhM2FmMmI3ZDE2IiwiYWRtaW5faWQiOjUsInVzZXJfdHlwZSI6ImFkbWluIiwicm9sZSI6Ilx1MDY0NVx1MDYyZlx1MDY0YVx1MDYzMSBcdTA2MjdcdTA2MmZcdTA2MjdcdTA2MzFcdTA2MjkiLCJuYW1lIjoiXHUwNjJlXHUwNjI3XHUwNjQ0XHUwNjJmIFx1MDYyNVx1MDYyOFx1MDYzMVx1MDYyN1x1MDY0N1x1MDY0YVx1MDY0NSJ9.Cx-jqQTOFa3O72SZenYv1vzZqbuGmPmhZUDX7RH66wQ";

  // ================================
  // 🔥 Fetch data from API
  // ================================
  const fetchData = async () => {
    try {
      const res = await axios.get(
        "http://127.0.0.1:8000/api/solidarity/super_dept/all_applications/",
        {
          headers: {
            Authorization: `Bearer ${BEARER_TOKEN}`,
          },
        }
      );
      const data = res.data;

      // 🔁 تحويل بيانات الـ API للشكل اللي الجدول محتاجه
      const mapped = data.map((item) => ({
        name: item.student_name,
        id: item.student_uid,
        req: item.solidarity_id,
        amount: Number(item.total_income) || 0,
        date: new Date(item.created_at).toISOString().slice(0, 10),
        gpa: item.family_numbers ?? "-", // مفيش GPA؟ نحط "-"
      }));

      setStudents(mapped);
    } catch (err) {
      console.error("API Error:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ================================
  // 🔍 Search
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
  const totalAmount = filteredStudents.reduce((acc, s) => acc + (s.amount || 0), 0);
  const totalCount = filteredStudents.length;

  return (
    <div className={styles.facultyReportPage}>
      {/* ===== Header ===== */}
      <header className={styles.facultyHeader}>
        <div>
          <h1>كلية الهندسة - التقرير الشامل</h1>
          <p>Engineering Faculty - Comprehensive Report</p>
        </div>
      </header>

      {/* ===== Main Content ===== */}
      <main className={styles.facultyMain}>
        {/* ===== Stats Section ===== */}
        <section className={styles.statsSection}>
          <div className={`${styles.statBox} ${styles.yellow}`}>
            <div>
              <p>إجمالي المبلغ</p>
              <h2>{totalAmount.toLocaleString()} ج.م</h2>
            </div>
            <span className={styles.icon}>💰</span>
          </div>

          <div className={`${styles.statBox} ${styles.blue}`}>
            <div>
              <p>إجمالي الطلبات</p>
              <h2>{totalCount}</h2>
            </div>
            <span className={styles.icon}>👥</span>
          </div>
        </section>

        {/* ===== Search Bar ===== */}
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

        {/* ===== Table Section ===== */}
        <div className={styles.tableContainer}>
          <div className={styles.tableHeader}>
            <h2>تفاصيل طلبات الطلاب</h2>
            <div className={styles.tableButtons}>
              <button className={styles.printBtn}>🖨️ طباعة</button>
              <button className={styles.exportBtn}>⬇️ تصدير</button>
            </div>
          </div>

          <table className={styles.reportTable}>
            <thead>
              <tr>
                <th>اسم الطالب</th>
                <th>رقم الطالب</th>
                <th>رقم الطلب</th>
                <th>(جنيه) المبلغ</th>
                <th>تاريخ التقديم</th>
                
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
                    <td>{s.date}</td>
                    
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6}>لا توجد نتائج مطابقة</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* ===== Gmail-style Pagination ===== */}
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

      {/* ===== Footer ===== */}
      <footer className={styles.footer}>
        <div className={styles.left}>
          <p>
            إدارة التكافل الاجتماعي | جامعة حلوان<br />
            قسم خدمات الطلاب - نظام إدارة الدعم المالي
          </p>
        </div>
        <div className={styles.center}>
          <p>solidarity@helwan.edu.eg :الدعم</p>
          <p>© 2024 جامعة حلوان. جميع الحقوق محفوظة.</p>
        </div>
        <div className={styles.right}>
          <p>آخر تحديث: ديسمبر 2024</p>
          <p>الإصدار 1.0.0 - النظام نشط</p>
        </div>
      </footer>
    </div>
  );
}
