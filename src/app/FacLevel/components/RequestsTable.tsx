"use client";
import React, { useState } from "react";
import styles from "../Styles/RequestsTable.module.css";
import { FileText, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RequestsTable({ requests }: any) {
  const router = useRouter();

  // ======= البحث والفلترة =======
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const filteredRequests = requests.filter((req: any) => {
    const matchesSearch =
      req.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.reqNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      selectedFilter === "all" ? true : req.status === selectedFilter;

    return matchesSearch && matchesFilter;
  });

  // ======= التقسيم =======
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const totalPages = Math.ceil(filteredRequests.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const visibleRequests = filteredRequests.slice(startIndex, startIndex + rowsPerPage);

  const handleDetailsClick = (id: string) => {
    router.push(`/requests/${id}`);
  };

  const translateStatus = (status: string) => {
    switch (status) {
      case "received":
        return "تم الاستلام";
      case "review":
        return "موافقة مبدئية";
      case "approved":
        return "موافقة نهائية";
      case "rejected":
        return "مرفوض";
      default:
        return status;
    }
  };

  return (
    <div className={styles.tableSection}>
      {/* ====== Header ====== */}
      <div className={styles.tableHeader}>
        <div className={styles.tableTitle}>
          <FileText size={20} />
          <h3>طلبات الدعم المالي</h3>
        </div>
        <p className={styles.tableSubtitle}>عرض {filteredRequests.length} طلب</p>
      </div>

      {/* ====== الفلاتر ====== */}
      <div className={styles.filtersSection}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} size={18} />
          <input
            type="text"
            placeholder="ابحث بالاسم أو رقم الطالب أو الطلب..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <select
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="all">عرض الكل</option>
          <option value="received">تم الاستلام</option>
          <option value="review">موافقة مبدئية</option>
          <option value="approved">موافقة نهائية</option>
          <option value="rejected">مرفوض</option>
        </select>
      </div>

      {/* ====== الجدول ====== */}
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
              visibleRequests.map((req: any) => {
                const translatedStatus = translateStatus(req.status);
                return (
                  <tr key={req.id}>
                    <td className={styles.studentName}>{req.name}</td>
                    <td>{req.studentId}</td>
                    <td>{req.reqNumber}</td>
                    <td>{req.date}</td>
                    <td className={styles.amount}>{req.amount}</td>
                    <td>
                      <span
                        className={`${styles.statusBadge} ${
                          translatedStatus === "موافقة مبدئية"
                            ? styles.statusInitial
                            : translatedStatus === "موافقة نهائية"
                            ? styles.statusFinal
                            : translatedStatus === "مرفوض"
                            ? styles.statusRejected
                            : translatedStatus === "تم الاستلام"
                            ? styles.statusReceived
                            : styles.statusPending
                        }`}
                      >
                        {translatedStatus}
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
                );
              })
            ) : (
              <tr>
                <td colSpan={7}>لا توجد نتائج مطابقة</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ====== Pagination ====== */}
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
            className={styles.rowsSelect}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
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
