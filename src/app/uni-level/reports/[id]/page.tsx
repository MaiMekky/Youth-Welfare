"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Head from "next/head";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
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
      finalApproval: "٣/٤٥"
    },
    {
      id: "2",
      studentName: "سارة خالد",
      requestNumber: "ST-ENG-002",
      responseNumber: "REQ-ENG-002",
      amount: "1,200",
      submissionDate: "٠٤/٠٦/٧٠",
      approvalDate: "٠٤/٠٦/٧٢",
      finalApproval: "٣/٣٢"
    },
    {
      id: "3",
      studentName: "يوسف إبراهيم",
      requestNumber: "ST-ENG-003",
      responseNumber: "REQ-ENG-003",
      amount: "1,800",
      submissionDate: "٠٤/٠٦/٧٠",
      approvalDate: "٠٤/٠٦/٧٠",
      finalApproval: "٣/٧٨"
    }
  ]);

  const collegeInfo = {
    name: "كلية الهندسة",
    breadcrumb: "الهندسة > البرنامج التحضيري",
    manager: "د. أحمد حسين",
    requestNumber: "ENG-2024-02-001",
    date: "٠٤/٠٦/٧٠",
    totalAmount: "67,500 جنيه",
    studentsCount: 45
  };

  const handleBackClick = () => {
    router.back();
  };

  const handleExportClick = () => {
    console.log("Exporting data...");
  };

  const handlePrintClick = () => {
    window.print();
  };

  return (
    <>
      <Head>
        <title>تفاصير كلية الهندسة</title>
      </Head>
      <Sidebar />
      <div className="college-details-container">
        <Header />
        <main className="college-details-main">
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
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 14L21 9L12 4L3 9L12 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 14L21 9V16C21 16.5304 20.7893 17.0391 20.4142 17.4142C20.0391 17.7893 19.5304 18 19 18H5C4.46957 18 3.96086 17.7893 3.58579 17.4142C3.21071 17.0391 3 16.5304 3 16V9L12 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="college-header-text">
                <h1 className="college-title">{collegeInfo.name}</h1>
                <p className="college-subtitle">تفاصير تقرير كلية الهندسة</p>
              </div>
            </div>
            <div className="college-header-right">
              <button className="college-export-btn" onClick={handleExportClick}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                تصدير
              </button>
              <button className="college-print-btn" onClick={handlePrintClick}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 9V2H18V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 18H4C3.46957 18 2.96086 17.7893 2.58579 17.4142C2.21071 17.0391 2 16.5304 2 16V11C2 10.4696 2.21071 9.96086 2.58579 9.58579C2.96086 9.21071 3.46957 9 4 9H20C20.5304 9 21.0391 9.21071 21.4142 9.58579C21.7893 9.96086 22 10.4696 22 11V16C22 16.5304 21.7893 17.0391 21.4142 17.4142C21.0391 17.7893 20.5304 18 20 18H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <rect x="6" y="14" width="12" height="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                طباعة
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="college-summary-grid">
            <div className="college-summary-card">
              <div className="summary-card-icon summary-card-icon-yellow">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="summary-card-content">
                <span className="summary-card-label">تاريخ التقرير</span>
                <span className="summary-card-value">{collegeInfo.date}</span>
              </div>
            </div>

            <div className="college-summary-card">
              <div className="summary-card-icon summary-card-icon-blue">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <div className="summary-card-content">
                <span className="summary-card-label">إجمالي الطلاب</span>
                <span className="summary-card-value">{collegeInfo.studentsCount}</span>
              </div>
            </div>

            <div className="college-summary-card">
              <div className="summary-card-icon summary-card-icon-orange">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 6V12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="summary-card-content">
                <span className="summary-card-label">إجمالي الميزانية</span>
                <span className="summary-card-value summary-card-value-amount">{collegeInfo.totalAmount}</span>
              </div>
            </div>

            <div className="college-summary-card">
              <div className="summary-card-icon summary-card-icon-purple">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
                  <path d="M6 21C6 17.6863 8.68629 15 12 15C15.3137 15 18 17.6863 18 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="summary-card-content">
                <span className="summary-card-label">إداري الكلية</span>
                <span className="summary-card-value">{collegeInfo.manager}</span>
              </div>
            </div>
          </div>

          {/* Applications Section */}
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
                    <th>رقم الطلب</th>
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
        </main>
        <Footer />
      </div>
    </>
  );
}