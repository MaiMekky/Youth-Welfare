"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "../Styles/studentsTable.module.css";

interface Application {
  solidarity_id: number;
  student_name: string;
  student_uid: string;
  faculty_name: string;
  req_status: string;
  total_income: string;
  family_numbers: number;
  created_at: string;
}

export default function StudentsTable() {
  const router = useRouter();

  const [applications, setApplications] = useState<Application[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

useEffect(() => {
  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem("access");

      if (!token) {
        console.error("❌ No token found");
        return;
      }

      const res = await fetch("http://127.0.0.1:8000/api/solidarity/super_dept/all_applications/", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("STATUS:", res.status);

      if (!res.ok) {
        console.error("❌ Fetch error", res.status);
        return;
      }

      const data = await res.json();
      console.log("🔥 DATA:", data);

      setApplications(data);

    } catch (error) {
      console.error("❌ Error fetching applications:", error);
    }
  };

  fetchApplications();
}, []);

  // Pagination Calculations
  const totalPages = Math.ceil(applications.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage + 1;
  const endIndex = Math.min(startIndex + rowsPerPage - 1, applications.length);

  const visibleApps = applications.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const getStatusClass = (status: string) => {
    switch (status) {
      case "منتظر":
        return styles.received;
      case "مقبول":
        return styles.finalApproval;
      case "مرفوض":
        return styles.rejected;
      default:
        return styles.defaultStatus;
    }
  };

  return (
    <div className={styles.studentsTable}>
      <table>
        <thead>
          <tr>
            <th>رقم</th>
            <th>الاسم</th>
            <th>الرقم الجامعي</th>
            <th>الكلية</th>
            <th>عدد أفراد الأسرة</th>
            <th>الدخل الإجمالي</th>
            <th>تاريخ التقديم</th>
            <th>الحالة</th>
            <th>الإجراء</th>
          </tr>
        </thead>

        <tbody>
          {visibleApps.map((app, index) => (
            <tr key={app.solidarity_id}>
              <td>{index + startIndex}</td>
              <td>{app.student_name}</td>
              <td>{app.student_uid}</td>
              <td>{app.faculty_name}</td>
              <td>{app.family_numbers}</td>
              <td>{app.total_income}</td>
              <td>{app.created_at.slice(0, 10)}</td>

              <td>
                <span className={`${styles.status} ${getStatusClass(app.req_status)}`}>
                  {app.req_status}
                </span>
              </td>

              <td>
                <button
                  className={styles.detailsBtn}
                  onClick={() => router.push(`/students/${app.solidarity_id}`)}
                >
                  تفاصيل
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer */}
      <div className={styles.tableFooter}>
        <div className={styles.footerLeft}>
          <strong>عرض</strong> {startIndex}–{endIndex} <strong>من</strong>{" "}
          {applications.length}
        </div>

        <div className={styles.footerRight}>
          <label>عدد العناصر في الصفحة:</label>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className={styles.rowsSelect}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
          </select>

          <div className={styles.paginationButtons}>
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronRight size={20} />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <ChevronLeft size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
