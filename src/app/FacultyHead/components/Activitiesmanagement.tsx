"use client";
import React, { useState } from "react";
import "../Styles/Activitiesmanagement.css"
import { Eye, CheckCircle, XCircle } from "lucide-react";

interface Activity {
  id: number;
  title: string;
  department: string;
  date: string;
  status: "قيد المراجعة" | "معتمدة" | "تم رفض الفعالية";
  participants: number;
  submitter: string;
}

export default function ActivitiesManagement() {
  const [activities] = useState<Activity[]>([
    {
      id: 1,
      title: "مؤتمر الأنشطة الطلابية السنوي",
      department: "إدارة الأنشطة الثقافية",
      date: "2024-02-20",
      status: "قيد المراجعة",
      participants: 500,
      submitter: "د. فاطمة السالم",
    },
    {
      id: 2,
      title: "بطولة كرة القدم للكليات",
      department: "إدارة الأنشطة الرياضية",
      date: "2024-02-15",
      status: "معتمدة",
      participants: 200,
      submitter: "أ. محمد العامدي",
    },
    {
      id: 3,
      title: "معرض الأعمال الفنية الطلابية",
      department: "إدارة الأنشطة الفنية",
      date: "2024-02-10",
      status: "تم رفض الفعالية",
      participants: 150,
      submitter: "د. عائشة الزهراني",
    },
    {
      id: 4,
      title: "ورشة رادة الأعمال للطلاب",
      department: "إدارة الأنشطة العامة",
      date: "2024-03-01",
      status: "قيد المراجعة",
      participants: 100,
      submitter: "د. خالد النعيمي",
    },
    {
      id: 5,
      title: "حملة التبرع بالدم",
      department: "إدارة التكافل الاجتماعي",
      date: "2024-02-18",
      status: "معتمدة",
      participants: 300,
      submitter: "أ. سلمى العتيبي",
    },
    {
      id: 6,
      title: "مخيم الكشافة السنوي",
      department: "إدارة الكشافة والخدمة العامة",
      date: "2024-03-10",
      status: "قيد المراجعة",
      participants: 80,
      submitter: "أ. يوسف الدوسري",
    },
  ]);

  const rejectedCount = activities.filter(
    (a) => a.status === "تم رفض الفعالية"
  ).length;
  const approvedCount = activities.filter((a) => a.status === "معتمدة").length;
  const pendingCount = activities.filter(
    (a) => a.status === "قيد المراجعة"
  ).length;

  const totalRequests = activities.length;

  const getStatusClass = (status: Activity["status"]) => {
    switch (status) {
      case "معتمدة":
        return "status-approved";
      case "قيد المراجعة":
        return "status-pending";
      case "تم رفض الفعالية":
        return "status-rejected";
      default:
        return "";
    }
  };

  const handleView = (id: number) => {
    console.log("View activity:", id);
  };

  const handleApprove = (id: number) => {
    console.log("Approve activity:", id);
  };

  const handleReject = (id: number) => {
    console.log("Reject activity:", id);
  };

  return (
    <div className="activities-container">
      <div className="activities-header">
        <h1>مراجعة واعتماد الفعاليات</h1>
        <div className="total-requests">إجمالي الطلبات المقدمة: {totalRequests}</div>
      </div>

      <div className="status-cards">
        <div className="status-card rejected">
          <div className="card-icon">
            <XCircle size={28} />
          </div>
          <div className="card-content">
            <div className="card-number">{rejectedCount}</div>
            <div className="card-label">تم رفض الفعالية</div>
          </div>
        </div>

        <div className="status-card approved">
          <div className="card-icon">
            <CheckCircle size={28} />
          </div>
          <div className="card-content">
            <div className="card-number">{approvedCount}</div>
            <div className="card-label">معتمدة</div>
          </div>
        </div>

        <div className="status-card pending">
          <div className="card-icon">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="card-content">
            <div className="card-number">{pendingCount}</div>
            <div className="card-label">قيد المراجعة</div>
          </div>
        </div>
      </div>

      <div className="table-section">
        <h2>طلبات الفعاليات المقدمة من إدارات الكليات</h2>

        <div className="table-wrapper">
          <table className="activities-table">
            <thead>
              <tr>
                <th>عنوان الفعالية</th>
                <th>القسم</th>
                <th>تاريخ الطلب</th>
                <th>الحالة</th>
                <th>عدد المشاركين</th>
                <th>مقدم الطلب</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity) => (
                <tr key={activity.id}>
                  <td className="activity-title">{activity.title}</td>
                  <td>{activity.department}</td>
                  <td>{activity.date}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(activity.status)}`}>
                      {activity.status}
                    </span>
                  </td>
                  <td>{activity.participants} شخص</td>
                  <td>{activity.submitter}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-view"
                        onClick={() => handleView(activity.id)}
                        title="عرض التفاصيل"
                      >
                        <Eye size={18} />
                      </button>
                      {activity.status === "قيد المراجعة" && (
                        <>
                          <button
                            className="btn-approve"
                            onClick={() => handleApprove(activity.id)}
                            title="اعتماد"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button
                            className="btn-reject"
                            onClick={() => handleReject(activity.id)}
                            title="رفض"
                          >
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}