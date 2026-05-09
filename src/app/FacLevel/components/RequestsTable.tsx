"use client";

import React, { useEffect, useState, useTransition } from "react";
import styles from "../Styles/RequestsTable.module.css";
import { FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";
import FiltersSection from "./FiltersSection";

interface RequestItem {
  id: string | number;
  name: string;
  studentId: string | number;
  reqNumber: string | number;
  date: string;
  amount: string;
  status: string;
}

interface Filters {
  search: string;
  fatherStatus: string;
  motherStatus: string;
  housingStatus: string;
  brothers: string;
  totalIncome: string;
  grade: string;
  disability: string;
  status: string;
  date_from: string;
  date_to: string;
  [key: string]: string;
}

interface RequestsTableProps {
  onDataFetched: (data: RequestItem[]) => void;
  filteredRequests: RequestItem[];
}

const defaultFilters: Filters = {
  search: "",
  fatherStatus: "",
  motherStatus: "",
  housingStatus: "",
  brothers: "",
  totalIncome: "",
  grade: "",
  disability: "",
  status: "",
  date_from: "",
  date_to: "",
};

const fetchApplications = async (
  appliedFilters: Record<string, unknown> = {}
): Promise<Record<string, unknown>[]> => {
  const query = Object.entries(appliedFilters)
    .filter(([, value]) => value && value !== "none")
    .map(([key, value]) => {
      let apiKey = key;
      let apiValue = value;
      switch (key) {
        case "disability":    apiKey = "disabilities";   break;
        case "brothers":      apiKey = "family_numbers"; break;
        case "fatherStatus":  apiKey = "father_status";  break;
        case "motherStatus":  apiKey = "mother_status";  break;
        case "housingStatus": apiKey = "housing_status"; break;
        case "grade":         apiKey = "grade";          break;
        case "status":        apiKey = "status";         break;
        case "totalIncome":   apiKey = "total_income";   break;
        case "search":        apiKey = "student_id";     break;
        case "date_from":     apiKey = "date_from";      break;
        case "date_to":       apiKey = "date_to";        break;
      }
      return `${apiKey}=${encodeURIComponent(apiValue as string)}`;
    })
    .join("&");

  const url = `${getBaseUrl()}/api/solidarity/faculty/applications/${query ? `?${query}` : ""}`;
  const res = await authFetch(url, { method: "GET" });
  if (!res.ok) throw new Error("API_ERROR");
  return await res.json();
};

export default function RequestsTable({ onDataFetched, filteredRequests }: RequestsTableProps) {
  const router = useRouter();

  // useTransition keeps the current UI visible while the next state is loading,
  // giving a smooth in-place refresh instead of unmounting the table.
  const [isPending, startTransition] = useTransition();

  const [filters, setFilters]         = useState<Filters>(defaultFilters);
  const [searchTerm, setSearchTerm]   = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const loadApplications = (appliedFilters: Record<string, unknown> = {}) => {
    startTransition(async () => {
      try {
        const data = await fetchApplications(appliedFilters);
        const formatted: RequestItem[] = data.map((item) => ({
          id:        item.solidarity_id as number,
          name:      item.student_name  as string,
          studentId: item.student_uid   as string,
          reqNumber: item.solidarity_id as number,
          date:      new Date(item.created_at as string).toLocaleDateString("ar-EG"),
          amount:    item.total_discount as string,
          status:    item.req_status     as string,
        }));
        onDataFetched(formatted);
      } catch (err) {
        console.error("API fetch error:", err);
      }
    });
  };

  useEffect(() => {
    loadApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Client-side search filter
  const displayedRequests = filteredRequests.filter((req) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      req.name.toLowerCase().includes(term) ||
      req.studentId.toString().toLowerCase().includes(term) ||
      req.reqNumber.toString().includes(term)
    );
  });

  const totalPages      = Math.ceil(displayedRequests.length / rowsPerPage);
  const startIndex      = (currentPage - 1) * rowsPerPage;
  const visibleRequests = displayedRequests.slice(startIndex, startIndex + rowsPerPage);

  const translateStatus = (status: string) => {
    switch (status) {
      case "received": return "منتظر";
      case "review":   return "موافقة مبدئية";
      case "approved": return "مقبول";
      case "rejected": return "مرفوض";
      default:         return status;
    }
  };

  return (
    <>
      <FiltersSection
        filters={filters}
        setFilters={setFilters}
        onSearchChange={setSearchTerm}
        onApply={() => loadApplications(filters)}
      />

      {/* Smooth overlay: table stays mounted, dims slightly while fetching */}
      <div
        className={styles.tableSection}
        style={{ opacity: isPending ? 0.5 : 1, transition: "opacity 0.25s ease" }}
      >
        <div className={styles.tableHeader}>
          <div className={styles.tableTitle}>
            <FileText size={20} />
            <h3>طلبات الدعم المالي</h3>
          </div>
          <p className={styles.tableSubtitle}>
            {isPending
              ? "جاري التحديث..."
              : `عرض ${displayedRequests.length} ${displayedRequests.length === 1 ? "طلب" : "طلبات"}`}
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
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", padding: "48px 0", color: "#9ca3af" }}>
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
                          req.status === "منتظر"          ? styles.statusWait     :
                          req.status === "موافقة مبدئية" ? styles.statusReview   :
                          req.status === "مقبول"          ? styles.statusApproved :
                          req.status === "مرفوض"          ? styles.statusRejected : ""
                        }`}
                      >
                        {translateStatus(req.status as string)}
                      </span>
                    </td>
                    <td>
                      <button
                        className={styles.btnDetails}
                        onClick={() => router.push(`/requests/${req.id}`)}
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
            <strong>{Math.min(startIndex + rowsPerPage, displayedRequests.length)}</strong> من{" "}
            <strong>{displayedRequests.length}</strong>
          </div>
          <div className={styles.footerRight}>
            <label>عدد العناصر في الصفحة:</label>
            <select
              value={rowsPerPage}
              onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <div>
              <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1}>
                <ChevronRight size={20} />
              </button>
              <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>
                <ChevronLeft size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}