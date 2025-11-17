"use client";

import React, { useEffect, useState } from "react";
import styles from "../Styles/RequestsTable.module.css";
import { FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";

interface RequestsTableProps {
  onDataFetched: (data: any[]) => void;
}

// ===============================
// Token Service
// ===============================
export const getAccessToken = () => localStorage.getItem("access");
export const getRefreshToken = () => localStorage.getItem("refresh");
export const saveTokens = (access: string, refresh?: string) => {
  localStorage.setItem("access_token", access);
  if (refresh) localStorage.setItem("refresh_token", refresh);
};

export const refreshToken = async (): Promise<string | null> => {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  try {
    const res = await fetch("http://127.0.0.1:8000/api/auth/refresh/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (data?.access) {
      saveTokens(data.access);
      return data.access;
    }
    return null;
  } catch (err) {
    console.error("Refresh error:", err);
    return null;
  }
};

// ===============================
// API Service
// ===============================
const API_URL = "http://127.0.0.1:8000/api/solidarity/faculty/applications/";

const fetchApplications = async (token: string) => {
  try {
    const res = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err: any) {
    if (err.response?.status === 401) throw new Error("TOKEN_EXPIRED");
    throw err;
  }
};

// ===============================
// RequestsTable Component
// ===============================
export default function RequestsTable({ onDataFetched }: RequestsTableProps) {
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const totalPages = Math.ceil(requests.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const visibleRequests = requests.slice(startIndex, startIndex + rowsPerPage);

  useEffect(() => {
    const loadApplications = async () => {
      setLoading(true);
      try {
        let token = getAccessToken();
        if (!token) throw new Error("No access token");

        try {
          const data = await fetchApplications(token);
          formatData(data);
        } catch (err: any) {
          if (err.message === "TOKEN_EXPIRED") {
            token = await refreshToken();
            if (!token) throw new Error("Refresh failed");
            const data = await fetchApplications(token);
            formatData(data);
          } else {
            console.error("API fetch error:", err);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, []);

  const formatData = (data: any[]) => {
    const formatted = data.map((item) => ({
      id: item.solidarity_id,
      name: item.student_name,
      studentId: item.student_uid,
      reqNumber: item.solidarity_id,
      date: new Date(item.created_at).toLocaleDateString("ar-EG"),
      amount: item.total_income,
      status: item.req_status,
    }));
    setRequests(formatted);
    onDataFetched(formatted); // تبعت للـ parent
  };

  const translateStatus = (status: string) => {
    switch (status) {
      case "received":
        return "منتظر";
      case "review":
        return "موافقة مبدئية";
      case "approved":
        return "مقبول";
      case "rejected":
        return "مرفوض";
      default:
        return status;
    }
  };

  const handleDetailsClick = (id: string) => {
    router.push(`/requests/${id}`);
  };

  if (loading) return <p>جاري تحميل البيانات...</p>;

  return (
    <div className={styles.tableSection}>
      <div className={styles.tableHeader}>
        <div className={styles.tableTitle}>
          <FileText size={20} />
          <h3>طلبات الدعم المالي</h3>
        </div>
        <p className={styles.tableSubtitle}>عرض {requests.length} طلب</p>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.requestsTable}>
          <thead>
            <tr>
              <th>اسم الطالب</th>
              <th>رقم الطالب</th>
              <th>رقم الطلب</th>
              <th>تاريخ التقديم</th>
              <th>المبلغ</th>
              <th>الحالة</th>
              <th>الإجراء</th>
            </tr>
          </thead>
          <tbody>
            {visibleRequests.length > 0 ? (
              visibleRequests.map((req) => (
                <tr key={req.id}>
                  <td>{req.name}</td>
                  <td>{req.studentId}</td>
                  <td>{req.reqNumber}</td>
                  <td>{req.date}</td>
                  <td>{req.amount}</td>
                  <td>
                    <span className={styles.statusBadge}>
                      {translateStatus(req.status)}
                    </span>
                  </td>
                  <td>
                    <button
                      className={styles.btnDetails}
                      onClick={() => handleDetailsClick(req.id)}
                    >
                      تفاصيل
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7}>لا توجد نتائج</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.tableFooter}>
        <div className={styles.footerLeft}>
          عرض <strong>{startIndex + 1}</strong>–
          <strong>{Math.min(startIndex + rowsPerPage, requests.length)}</strong> من{" "}
          <strong>{requests.length}</strong>
        </div>

        <div className={styles.footerRight}>
          <label>عدد العناصر في الصفحة:</label>
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
            <option value={50}>50</option>
          </select>

          <div>
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
