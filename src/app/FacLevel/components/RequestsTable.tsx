"use client";

import React, { useEffect, useState } from "react";
import styles from "../Styles/RequestsTable.module.css";
import { FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { authFetch } from "@/utils/globalFetch";

interface RequestItem {
  id: string | number;
  name: string;
  studentId: string | number;
  reqNumber: string | number;
  date: string;
  amount: string;
  status: string;
}

interface RequestsTableProps {
  onDataFetched: (data: RequestItem[]) => void;
  filteredRequests: RequestItem[];
}

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
    const res = await authFetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/refresh/`, {
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

const fetchApplications = async () => {
  const res = await authFetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/solidarity/faculty/applications/`,
    { method: "GET" }
  );
  if (!res.ok) throw new Error("API_ERROR");
  return await res.json();
};

export default function RequestsTable({ onDataFetched, filteredRequests }: RequestsTableProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const totalPages = Math.ceil(filteredRequests.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const visibleRequests = filteredRequests.slice(startIndex, startIndex + rowsPerPage);

  useEffect(() => {
    const loadApplications = async () => {
      setLoading(true);
      try {
        const data = await fetchApplications();
        formatData(data);
      } catch (err) {
        console.error("API fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatData = (data: Record<string, unknown>[]) => {
    const formatted: RequestItem[] = data.map((item) => ({
      id: item.solidarity_id as number,
      name: item.student_name as string,
      studentId: item.student_uid as string,
      reqNumber: item.solidarity_id as number,
      date: new Date(item.created_at as string).toLocaleDateString("ar-EG"),
      amount: item.total_discount as string,
      status: item.req_status as string,
    }));
    onDataFetched(formatted);
  };

  const translateStatus = (status: string) => {
    switch (status) {
      case "received": return "منتظر";
      case "review": return "موافقة مبدئية";
      case "approved": return "مقبول";
      case "rejected": return "مرفوض";
      default: return status;
    }
  };

  const handleDetailsClick = (id: string | number) => {
    router.push(`/requests/${id}`);
  };

  if (loading) return (
    <div style={{ textAlign: "center", padding: "64px 0", color: "#9ca3af", fontSize: "1rem", fontWeight: 600 }}>
      جاري تحميل البيانات...
    </div>
  );

  return (
    <div className={styles.tableSection}>
      <div className={styles.tableHeader}>
        <div className={styles.tableTitle}>
          <FileText size={20} />
          <h3>طلبات الدعم المالي</h3>
        </div>
        <p className={styles.tableSubtitle}>
          عرض {filteredRequests.length} {filteredRequests.length === 1 ? "طلب" : "طلبات"}
        </p>
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
            {visibleRequests.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "8px",
                      padding: "48px 0",
                      color: "#9ca3af",
                    }}
                  >
                    <span style={{ fontSize: "2rem", fontWeight: 600 }}>لا توجد طلبات</span>
                  </div>
                </td>
              </tr>
            ) : (
              visibleRequests.map((req) => (
                <tr key={req.id}>
                  <td>{req.name}</td>
                  <td>{req.studentId}</td>
                  <td>{req.reqNumber}</td>
                  <td>{req.date}</td>
                  <td>{req.amount || "---"}</td>
                  <td>
                    <span
                      className={`${styles.statusBadge} ${
                        req.status === "منتظر"
                          ? styles.statusWait
                          : req.status === "موافقة مبدئية"
                          ? styles.statusReview
                          : req.status === "مقبول"
                          ? styles.statusApproved
                          : req.status === "مرفوض"
                          ? styles.statusRejected
                          : ""
                      }`}
                    >
                      {translateStatus(req.status as string)}
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
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.tableFooter}>
        <div className={styles.footerLeft}>
          عرض <strong>{startIndex + 1}</strong>–
          <strong>{Math.min(startIndex + rowsPerPage, filteredRequests.length)}</strong> من{" "}
          <strong>{filteredRequests.length}</strong>
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