"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Head from "next/head";
import Layout from "../../Layout";
import "./CollegeDetails.css";

interface StudentApplication {
  id: string;
  studentName: string;
  requestNumber: string;
  responseNumber: string;
  amount: string;
  submissionDate: string;
  approvalDate: string;
  finalApproval: string;
}

export default function CollegeDetailsPage() {
  const router = useRouter();

  const [applications] = useState<StudentApplication[]>([
    {
      id: "1",
      studentName: "أحمد محمد علي",
      requestNumber: "ST-ENG-001",
      responseNumber: "REQ-ENG-001",
      amount: "1,500",
      submissionDate: "٠٤/٠٦/٧٠",
      approvalDate: "٠٤/٠٦/٧٢",
      finalApproval: "٣/٤٥",
    },
    {
      id: "2",
      studentName: "سارة خالد",
      requestNumber: "ST-ENG-002",
      responseNumber: "REQ-ENG-002",
      amount: "1,200",
      submissionDate: "٠٤/٠٦/٧٠",
      approvalDate: "٠٤/٠٦/٧٢",
      finalApproval: "٣/٣٢",
    },
    {
      id: "3",
      studentName: "يوسف إبراهيم",
      requestNumber: "ST-ENG-003",
      responseNumber: "REQ-ENG-003",
      amount: "1,800",
      submissionDate: "٠٤/٠٦/٧٠",
      approvalDate: "٠٤/٠٦/٧٠",
      finalApproval: "٣/٧٨",
    },
  ]);

  const collegeInfo = {
    name: "كلية الهندسة",
    breadcrumb: "الهندسة > البرنامج التحضيري",
    manager: "د. أحمد حسين",
    requestNumber: "ENG-2024-02-001",
    date: "٠٤/٠٦/٧٠",
    totalAmount: "67,500 جنيه",
    studentsCount: 45,
  };

  const handleBackClick = () => router.back();
  const handleExportClick = () => console.log("Exporting data...");
  const handlePrintClick = () => window.print();

  return (
    <Layout>
      <Head>
        <title>تفاصيل كلية الهندسة</title>
      </Head>

      <div className="college-details-container">
        {/* Breadcrumb */}
        <div className="college-breadcrumb">
          <button onClick={handleBackClick} className="breadcrumb-back">
            العودة للتقارير
          </button>
          <span className="breadcrumb-separator">←</span>
          <span className="breadcrumb-current">{collegeInfo.breadcrumb}</span>
        </div>

        {/* Page Header */}
        <div className="college-page-header">
          <div className="college-header-left">
            <div className="college-icon">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 14L21 9L12 4L3 9L12 14Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 14L21 9V16C21 16.5304 20.7893 17.0391 20.4142 17.4142C20.0391 17.7893 19.5304 18 19 18H5C4.46957 18 3.96086 17.7893 3.58579 17.4142C3.21071 17.0391 3 16.5304 3 16V9L12 14Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="college-header-text">
              <h1 className="college-title">{collegeInfo.name}</h1>
              <p className="college-subtitle">تفاصيل تقرير كلية الهندسة</p>
            </div>
          </div>
          <div className="college-header-right">
            <button className="college-export-btn" onClick={handleExportClick}>
              تصدير
            </button>
            <button className="college-print-btn" onClick={handlePrintClick}>
              طباعة
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="college-summary-grid">
          <div className="college-summary-card">
            <span className="summary-card-label">تاريخ التقرير</span>
            <span className="summary-card-value">{collegeInfo.date}</span>
          </div>
          <div className="college-summary-card">
            <span className="summary-card-label">إجمالي الطلاب</span>
            <span className="summary-card-value">{collegeInfo.studentsCount}</span>
          </div>
          <div className="college-summary-card">
            <span className="summary-card-label">إجمالي الميزانية</span>
            <span className="summary-card-value summary-card-value-amount">
              {collegeInfo.totalAmount}
            </span>
          </div>
          <div className="college-summary-card">
            <span className="summary-card-label">إداري الكلية</span>
            <span className="summary-card-value">{collegeInfo.manager}</span>
          </div>
        </div>

        {/* Applications Table */}
        <div className="college-applications-section">
          <div className="applications-section-header">
            <h2 className="applications-section-title">تفاصيل الطلبات</h2>
            <p className="applications-section-subtitle">
              تأكد من صحة بيانات الطلاب للهندسة
            </p>
          </div>

          <div className="college-table-wrapper">
            <table className="college-table">
              <thead>
                <tr>
                  <th>اسم الطالب</th>
                  <th>رقم الطلب</th>
                  <th>رقم الرد</th>
                  <th>المبلغ (جنيه)</th>
                  <th>تاريخ التقديم</th>
                  <th>تاريخ القبول</th>
                  <th>القبول النهائي</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id}>
                    <td className="student-name-cell">{app.studentName}</td>
                    <td>{app.requestNumber}</td>
                    <td>{app.responseNumber}</td>
                    <td className="amount-cell">{app.amount}</td>
                    <td>{app.submissionDate}</td>
                    <td>{app.approvalDate}</td>
                    <td className="approval-cell">{app.finalApproval}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
