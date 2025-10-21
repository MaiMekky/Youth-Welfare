"use client";
import React from "react";
import styles from "./FacultyReport.module.css";

export default function FacultyReport() {
  const students = [
    { name: "أحمد محمد علي", id: "ST-ENG-001", req: "REQ001", date: "2024/12/10", amount: 1500, gpa: 3.45 },
    { name: "عمر خالد إبراهيم", id: "ST-ENG-002", req: "REQ002", date: "2024/12/09", amount: 1200, gpa: 3.12 },
    { name: "يوسف إبراهيم أحمد", id: "ST-ENG-003", req: "REQ003", date: "2024/12/09", amount: 1800, gpa: 3.78 },
    { name: "أميرة سعيد محمد", id: "ST-ENG-004", req: "REQ004", date: "2024/12/08", amount: 1400, gpa: 3.30 },
    { name: "محمد يوسف علي", id: "ST-ENG-005", req: "REQ005", date: "2024/12/08", amount: 1600, gpa: 3.56 },
    { name: "نور حسن عبد الرحمن", id: "ST-ENG-006", req: "REQ006", date: "2024/12/07", amount: 1300, gpa: 3.74 },
    { name: "خالد أحمد محمد", id: "ST-ENG-007", req: "REQ007", date: "2024/12/07", amount: 1700, gpa: 3.67 },
    { name: "فاطمة علي حسن", id: "ST-ENG-008", req: "REQ008", date: "2024/12/06", amount: 1100, gpa: 3.01 },
  ];

  const totalAmount = students.reduce((acc, s) => acc + s.amount, 0);
  const totalCount = students.length;

  return (
    <div className={styles.facultyReportPage}>
      {/* ===== Header ===== */}
      <header className={styles.facultyHeader}>
        <div>
          <h1>كلية الهندسة - التقرير الشامل</h1>
          <p>Engineering Faculty - Comprehensive Report</p>
        </div>
      </header>

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
        <input type="text" placeholder="...البحث بالاسم، رقم الطالب، أو رقم الطلب" />
        <button>🔍</button>
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
               <th>المعدل التراكمي</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s, i) => (
              <tr key={i}>
                <td>{s.name}</td>
                 <td>{s.id}</td>
                   <td>{s.req}</td>
                   <td className={styles.amount}>{s.amount.toLocaleString()}</td>
                 <td>{s.date}</td>
                <td>{s.gpa}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      

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
