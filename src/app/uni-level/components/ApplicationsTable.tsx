"use client";
import React, { useEffect, useState } from "react";
import "../styles/ApplicationsTable.css";
import { useRouter } from "next/navigation";
import FiltersBar from "./FiltersBar";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Application {
  id: number;
  requestNumber: string;
  studentName: string;
  college: string;
  amount: string;
  date: string;
  status: string;
  fatherStatus?: string;
  motherStatus?: string;
  housingStatus?: string;
  brothers?: string;
  totalIncome?: string;
  grade?: string;
  disability?: string;
}

const facultyMap: { [key: string]: number } = {
  "كلية الهندسة": 1,
  "كلية العلوم": 2,
  "كلية التجارة": 4,
  "كلية الطب": 3,
  "كلية التربية": 5,
};

export default function ApplicationsTable({ onDataLoaded }: { onDataLoaded?: (apps: Application[]) => void }) {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [filters, setFilters] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  // fetch البيانات مع الفلاتر فقط عند الضغط على زر "تطبيق الفلاتر"
  const fetchApplications = async (appliedFilters: any = {}) => {
    try {
      setLoading(true);
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
          }
          return `${apiKey}=${encodeURIComponent(apiValue as string)}`;
        })
        .join("&");

      const url = `http://127.0.0.1:8000/api/solidarity/super_dept/all_applications/${query ? `?${query}` : ""}`;

      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("فشل في جلب البيانات");

      const data = await res.json();

      const mappedApps: Application[] = data.map((app: any) => ({
        id: app.solidarity_id,
        studentName: app.student_name,
        requestNumber: app.student_uid,
        college: app.faculty_name,
        amount: app.total_income,
        date: app.created_at ? new Date(app.created_at).toLocaleDateString() : "-",
        status: app.req_status,
        fatherStatus: app.father_status,
        motherStatus: app.mother_status,
        housingStatus: app.housing_status,
        brothers: app.family_numbers,
        totalIncome: app.total_income_level,
        grade: app.grade,
        disability: app.disabilities,
      }));

     if (onDataLoaded) {
  onDataLoaded(mappedApps);
}

      setApplications(mappedApps);
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء جلب البيانات");
    } finally {
      setLoading(false);
    }
  };

  // جلب البيانات لأول مرة بدون أي فلاتر
  useEffect(() => {
    fetchApplications();
  }, []);

  // فلترة البحث client-side تلقائي
  const filteredApps = applications.filter((app) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      app.studentName.toLowerCase().includes(term) ||
      app.requestNumber.toLowerCase().includes(term) ||
      app.id.toString().includes(term)
    );
  });
  const totalPages = Math.ceil(filteredApps.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage + 1;
  const endIndex = Math.min(currentPage * rowsPerPage, filteredApps.length);
  const paginatedApps = filteredApps.slice(startIndex - 1, endIndex);

  const handleNavigate = (app: Application) => {
    localStorage.setItem("selectedApplication", JSON.stringify(app));
    router.push(`/uni-level/details/${app.id}`);
  };

  if (loading) return <p>جاري التحميل...</p>;

  return (
    <div>
      <FiltersBar
        filters={filters}
        setFilters={setFilters}
        onApply={() => fetchApplications(filters)} // تنفيذ الفلاتر عند الضغط فقط
        onSearchChange={setSearchTerm} // البحث التلقائي
      />

      <div className="table-wrapper">
        <div className="table-actions">
          <button className="print-btn">طباعة</button>
          <button className="export-btn">تصدير</button>
        </div>

       <div className="table-container">
  <table>
    <thead>
      <tr>
        <th>رقم الطلب</th>
        <th>بيانات الطالب</th>
        <th>الكلية</th>
        <th>المبلغ</th>
        <th>تاريخ الاعتماد</th>
        <th>حالة الطلب</th>
        <th>الإجراءات</th>
      </tr>
    </thead>

    <tbody>
      {paginatedApps.map((app) => (
        <tr key={app.id}>
          <td>{app.id}</td>

          <td>
            <div className="student-info">
              <div>{app.studentName}</div>
              <div className="secondary">الرقم: {app.requestNumber}</div>
            </div>
          </td>

          <td>{app.college}</td>
          <td className="amount">{app.amount}</td>
          <td>{app.date}</td>

          <td
            className={`statusBadge ${
              app.status === "منتظر"
                ? "statusPending"
                : app.status === "موافقة مبدئية"
                ? "statusInitial"
                : app.status === "مقبول"
                ? "statusFinal"
                : app.status === "مرفوض"
                ? "statusRejected"
                : app.status === "تم الاستلام"
                ? "statusReceived"
                : ""
            }`}
          >
            {app.status}
          </td>

          <td>
            <button className="details" onClick={() => handleNavigate(app)}>
              التفاصيل
            </button>
          </td>
        </tr>
      ))}

      {paginatedApps.length === 0 && (
        <tr>
          <td colSpan={7} style={{ textAlign: "center", padding: "20px" }}>
            لا توجد بيانات مطابقة
          </td>
        </tr>
      )}
    </tbody>
  </table>

 <div className="tableFooter">
  <div className="footerLeft">
    <strong>عرض</strong> {startIndex}–{endIndex} <strong>من</strong> {filteredApps.length}
  </div>

  <div className="footerRight">
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
    </select>

    <div className="paginationButtons">
      <button
        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
        disabled={currentPage === 1}
      >
        <ChevronRight size={18} />
      </button>

      <button
        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
        disabled={currentPage === totalPages}
      >
        <ChevronLeft size={18} />
      </button>
    </div>
  </div>
</div>
</div>
      </div>
    </div>
  );
}
