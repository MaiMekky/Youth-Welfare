"use client";
import "../styles/ApplicationsTable.css";
import { useRouter } from "next/navigation";

interface Application {
  id: string;
  requestNumber: string;
  studentName: string;
  department: string;
  college: string;
  amount: string;
  date: string;
  status: string;
}

export default function ApplicationsTable({ applications }: { applications: Application[] }) {
  const router = useRouter();

  const handleNavigate = () => {
    router.push("/uni-level/details");
  };

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
                  {/* <button className="status" onClick={handleNavigate}>
                    الملفات
                  </button> */}
                  <button className="details" onClick={handleNavigate}>
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
