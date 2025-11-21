"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "../Styles/studentsTable.module.css";
import FiltersBar from "./FiltersBar";

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
  const [filters, setFilters] = useState<any>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");

  const facultyMap: { [key: string]: number } = {
    "كلية الهندسة": 1,
    "كلية العلوم": 2,
    "كلية التجارة": 4,
    "كلية الطب": 3,
    "كلية التربية": 5,
  };

  const fetchApplications = async (appliedFilters: any = {}) => {
    try {
      const token = localStorage.getItem("access");
      if (!token) return;

      const query = Object.entries(appliedFilters)
        .filter(([_, value]) => value && value !== "none")
        .map(([key, value]) => {
          let apiKey = key;
          let apiValue = value;
          switch (key) {
            case "disability": apiKey = "disabilities"; break;
            case "faculty": apiKey = "faculty"; apiValue = facultyMap[value as string] ?? ""; break;
            case "brothers": apiKey = "family_numbers"; break;
            case "fatherStatus": apiKey = "father_status"; break;
            case "motherStatus": apiKey = "mother_status"; break;
            case "housingStatus": apiKey = "housing_status"; break;
            case "grade": apiKey = "grade"; break;
            case "status": apiKey = "status"; break;
            case "totalIncome": apiKey = "total_income"; break;
            case "search": apiKey = "student_id"; break;
          }
          return `${apiKey}=${encodeURIComponent(apiValue as string)}`;
        })
        .join("&");

      const url = `http://127.0.0.1:8000/api/solidarity/super_dept/all_applications/${query ? `?${query}` : ""}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("فشل في جلب البيانات");

      const data = await res.json();
      setApplications(data);
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء جلب البيانات");
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const filteredApps = applications.filter((app) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      app.student_name.toLowerCase().includes(term) ||
      app.student_uid.toLowerCase().includes(term) ||
      app.solidarity_id.toString().includes(term)
    );
  });

  const totalPages = Math.ceil(filteredApps.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage + 1;
  const endIndex = Math.min(startIndex + rowsPerPage - 1, filteredApps.length);
  const visibleApps = filteredApps.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const getStatusClass = (status: string) => {
    switch (status) {
      case "منتظر": return styles.received;
      case "مقبول": return styles.finalApproval;
      case "مرفوض": return styles.rejected;
      default: return styles.defaultStatus;
    }
  };

  return (
    <div>
      <FiltersBar
        onSearchChange={setSearchTerm}
        filters={filters}
        setFilters={setFilters}
        onApply={() => fetchApplications(filters)}
      />
    <br />
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
                  <span className={`${styles.status} ${getStatusClass(app.req_status)}`}>{app.req_status}</span>
                </td>
                <td>
                  <button className={styles.detailsBtn} onClick={() => router.push(`/students/${app.solidarity_id}`)}>تفاصيل</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer */}
        <div className={styles.tableFooter}>
          <div className={styles.footerLeft}>
            <strong>عرض</strong> {startIndex}–{endIndex} <strong>من</strong> {filteredApps.length}
          </div>

          <div className={styles.footerRight}>
            <label>عدد العناصر في الصفحة:</label>
            <select
              value={rowsPerPage}
              onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className={styles.rowsSelect}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
            </select>

            <div className={styles.paginationButtons}>
              <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1}><ChevronRight size={20} /></button>
              <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}><ChevronLeft size={20} /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
