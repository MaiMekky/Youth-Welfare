"use client";
import React, { useEffect, useState } from "react";
import "../styles/ApplicationsTable.css";
import { useRouter } from "next/navigation";

interface Application {
  id: number;
  requestNumber: string;
  studentName: string;
  college: string;
  amount: string;
  date: string;
  status: string;
}
interface ApplicationsTableProps {
  onDataLoaded: (apps: Application[]) => void;
}
export default  function ApplicationsTable({ onDataLoaded }: ApplicationsTableProps) {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem("access");
        if (!token) return;

        const res = await fetch(
          "http://127.0.0.1:8000/api/solidarity/super_dept/all_applications/",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        const mappedApps: Application[] = data.map((app: any) => ({
          id: app.solidarity_id,
          studentName: app.student_name,
          requestNumber: app.student_uid,
          college: app.faculty_name,
          amount: app.total_income,
          date: app.created_at
            ? new Date(app.created_at).toLocaleDateString()
            : "-",
          status: app.req_status,
        }));

        setApplications(mappedApps);
        onDataLoaded(mappedApps); // 🔥 بعتي الداتا للصفحة

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const handleNavigate = (app: Application) => {
    localStorage.setItem("selectedApplication", JSON.stringify(app));
    router.push(`/uni-level/details/${app.id}`);
  };

  if (loading) return <p>جاري التحميل...</p>;

  return (
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
                  <button className="details" onClick={() => handleNavigate(app)}>
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
