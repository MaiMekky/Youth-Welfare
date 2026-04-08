"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "../Styles/studentsTable.module.css";
import FiltersBar from "./FiltersBar";
import SolidarityHeader from "./SolidarityHeader";
import { authFetch } from "@/utils/globalFetch";

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

interface Filters {
  search: string;
  fatherStatus: string;
  motherStatus: string;
  housingStatus: string;
  brothers: string;
  totalIncome: string;
  faculty: string;
  grade: string;
  disability: string;
  status: string;
  [key: string]: string;
}

const defaultFilters: Filters = {
  search: "",
  fatherStatus: "",
  motherStatus: "",
  housingStatus: "",
  brothers: "",
  totalIncome: "",
  faculty: "",
  grade: "",
  disability: "",
  status: "",
};

export default function StudentsTable() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
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

  const fetchApplications = async (appliedFilters: Record<string, unknown> = {}) => {
    try {
      const token = localStorage.getItem("access");
      if (!token) return;

      const query = Object.entries(appliedFilters)
  .filter(([, value]) => value && value !== "none")
  .map(([key, value]) => {
    let apiKey = key;
    let apiValue = value;

    switch (key) {
      case "disability":
        apiKey = "disabilities";
        apiValue = value; 
        break;

      case "faculty":
        apiKey = "faculty";
        apiValue = facultyMap[value as string] ?? "";
        break;

      case "brothers":
        apiKey = "family_numbers"; 
        apiValue = value;
        break;


      case "fatherStatus":
        apiKey = "father_status";
        break;

      case "motherStatus":
        apiKey = "mother_status";
        break;

      case "housingStatus":
        apiKey = "housing_status";
        apiValue = value; 
        break;

      case "grade":
        apiKey = "grade";
        apiValue = value; 
        break;

      case "status":
        apiKey = "status";
        break;

      case "totalIncome":
        apiKey = "total_income";
        break;

      case "search":
        apiKey = "student_id";
        break;
    }

    return `${apiKey}=${encodeURIComponent(apiValue as string)}`;
  })
  .join("&");


      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/solidarity/super_dept/all_applications/${query ? `?${query}` : ""}`;
      const res = await authFetch(url, { headers: { Authorization: `Bearer ${token}` } });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
const stats = {
  total: filteredApps.length,
  pending: filteredApps.filter(a => a.req_status === "منتظر").length,
  accepted: filteredApps.filter(a => a.req_status === "مقبول").length,
  rejected: filteredApps.filter(a => a.req_status === "مرفوض").length,
};
  return (
    

    
    <div className={styles.tableSection}>

      <SolidarityHeader />

        {/* Stats Grid */}
    <div className={styles.statsGrid}>
      <div className={styles.statCard}>
        <div className={styles.statNumber}>{stats.total}</div>
        <div className={styles.statLabel}>إجمالي الطلبات</div>
      </div>

      <div className={`${styles.statCard} ${styles.pending}`}>
        <div className={styles.statNumber}>{stats.pending}</div>
        <div className={styles.statLabel}>منتظر</div>
      </div>

      <div className={`${styles.statCard} ${styles.accepted}`}>
        <div className={styles.statNumber}>{stats.accepted}</div>
        <div className={styles.statLabel}>مقبول</div>
      </div>

      <div className={`${styles.statCard} ${styles.rejected}`}>
        <div className={styles.statNumber}>{stats.rejected}</div>
        <div className={styles.statLabel}>مرفوض</div>
      </div>
    </div>

      <FiltersBar
        onSearchChange={setSearchTerm}
        filters={filters}
        setFilters={setFilters}
        onApply={() => fetchApplications(filters)}
      />
      <div className={styles.studentsTable}>
        <div className={styles.tableWrapper}>
        <table className={styles.table}>
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
                  <button className={styles.detailsBtn} onClick={() => router.push(`/students/${app.solidarity_id}`)}> تفاصيل الطلب</button>
                </td>
              </tr>
            ))}
            {filteredApps.length === 0 && (
        <tr>
          <td colSpan={8} style={{ textAlign: "center", padding: "20px" }}>
            لا توجد بيانات مطابقة
          </td>
        </tr>
      )}
          </tbody>
        </table>
        </div>

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
