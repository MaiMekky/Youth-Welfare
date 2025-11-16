"use client";
import React, { useEffect, useState } from "react";
import "../styles/ApplicationsTable.css";
import { useRouter } from "next/navigation";
import api from "../../services/api"; // لو عندك api.js فيه axios instance

interface Application {
  id: string;
  requestNumber: string;
  studentName: string;
  department?: string;
  college: string;
  amount: string;
  date: string;
  status: string;
}

export default function ApplicationsTable() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await api.get("/solidarity/super_dept/all_applications/");
        // Map API response to table format
        const mappedApps: Application[] = res.data.map((app: any, index: number) => ({
          id: app.solidarity_id || index + 1,
          requestNumber: app.student_uid || "N/A",
          studentName: app.student_name || "N/A",
          department: app.faculty_name || "N/A",
          college: app.faculty_name || "N/A",
          amount: app.total_income || "0",
          date: app.created_at ? new Date(app.created_at).toLocaleDateString() : "-",
          status: app.req_status || "-",
        }));
        setApplications(mappedApps);
      } catch (err) {
        console.error("Error fetching applications:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const handleNavigate = (id: string) => {
    router.push(`/uni-level/details/${id}`); // pass id if needed
  };

  if (loading) return <p>جاري التحميل...</p>;

  return (
    <div className="table-wrapper">
      <div className="table-actions">
        <button className="print-btn">🖨️ طباعة</button>
        <button className="export-btn">↓ تصدير</button>
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
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
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
                <td>
                  <button className="details" onClick={() => handleNavigate(app.id)}>
                    التفاصيل
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
