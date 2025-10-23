"use client";
import { useState } from "react";
import Head from "next/head";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import "./Reports.css";
import { useRouter } from "next/navigation";


interface CollegeReport {
  id: string;
  college: string;
  department: string;
  manager: string;
  date: string;
  totalStudents: number;
  acceptedStudents: number;
  totalAmount: string;
  approved: number;
  status: string;
}

export default function ReportsPage() {
  const router = useRouter();  
  const [reports] = useState<CollegeReport[]>([
    {
      id: "1",
      college: "كلية الهندسة",
      department: "الهندسة",
      manager: "د. أحمد حسين",
      date: "٠٤/٠٦/٧٠",
      totalStudents: 45,
      acceptedStudents: 90,
      totalAmount: "67,500 جنيه",
      approved: 15,
      status: "عرض التفاصيل"
    },
    {
      id: "2",
      college: "كلية الطب",
      department: "الطب",
      manager: "د. فاطمة عبد الرحمن",
      date: "٠٤/٠٦/٧٠",
      totalStudents: 38,
      acceptedStudents: 25,
      totalAmount: "57,000 جنيه",
      approved: 13,
      status: "عرض التفاصيل"
    },
    {
      id: "3",
      college: "كلية الصيدلة",
      department: "الصيدلة",
      manager: "د. محمد كاظم",
      date: "٠٤/٠٦/٧٠",
      totalStudents: 32,
      acceptedStudents: 20,
      totalAmount: "44,800 جنيه",
      approved: 12,
      status: "عرض التفاصيل"
    },
    {
      id: "4",
      college: "كلية الآداب",
      department: "الآداب",
      manager: "د. نادين أحمد",
      date: "٠٤/٠٦/٧٠",
      totalStudents: 28,
      acceptedStudents: 18,
      totalAmount: "36,400 جنيه",
      approved: 10,
      status: "عرض التفاصيل"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("جميع الكليات");

  const totalRequests = reports.reduce((sum, report) => sum + report.totalStudents, 0);
  const totalAmount = "205,700 جنيه";

  return (
    <>
      <Head>
        <title>تقارير الكليات</title>
      </Head>
      <Sidebar />
      <div className="reports-container">
        <Header />
        <main className="reports-main-content">
          {/* Page Header */}
          <div className="reports-page-header">
            <h1 className="reports-page-title">تقارير الكليات</h1>
            <p className="reports-page-subtitle">
              عرض تقارير الدعم المالي المقدمة من كل الكليات
            </p>
          </div>

          {/* Toolbar */}
          <div className="reports-toolbar">
            <div className="reports-toolbar-right">
              <button className="reports-export-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                تصدير إكسل
              </button>
              <button className="reports-print-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 9V2H18V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 18H4C3.46957 18 2.96086 17.7893 2.58579 17.4142C2.21071 17.0391 2 16.5304 2 16V11C2 10.4696 2.21071 9.96086 2.58579 9.58579C2.96086 9.21071 3.46957 9 4 9H20C20.5304 9 21.0391 9.21071 21.4142 9.58579C21.7893 9.96086 22 10.4696 22 11V16C22 16.5304 21.7893 17.0391 21.4142 17.4142C21.0391 17.7893 20.5304 18 20 18H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <rect x="6" y="14" width="12" height="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                طباعة الملخص
              </button>
            </div>
            <div className="reports-toolbar-left">
              <div className="reports-search-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                  <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <input
                  type="text"
                  placeholder="بحث في الكليات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="reports-search-input"
                />
              </div>
              <select 
                className="reports-filter-select"
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
              >
                <option>جميع الكليات</option>
                <option>كلية الهندسة</option>
                <option>كلية الطب</option>
                <option>كلية الصيدلة</option>
                <option>كلية الآداب</option>
              </select>
            </div>
          </div>

          {/* Summary Card */}
          <div className="reports-summary-card">
            <div className="reports-summary-label">إحصائيات الجامعة</div>
            <div className="reports-summary-stats">
              <div className="reports-stat-item">
                <span className="reports-stat-value">{totalRequests}</span>
                <span className="reports-stat-label">إجمالي الطلبات</span>
              </div>
              <div className="reports-stat-divider"></div>
              <div className="reports-stat-item">
                <span className="reports-stat-value reports-stat-value-amount">{totalAmount}</span>
                <span className="reports-stat-label">إجمالي الميزانية</span>
              </div>
            </div>
          </div>

          {/* Reports Table */}
          <div className="reports-table-section">
            <div className="reports-section-header">
              <h2 className="reports-section-title">ملخص تقارير الكليات</h2>
              <p className="reports-section-subtitle">
                تفاصير الدعم المالي المقدمة من كل الكليات
              </p>
            </div>

            <div className="reports-table-wrapper">
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>الكلية</th>
                    <th>الإداري</th>
                    <th>التاريخ المقرر</th>
                    <th>الطلاب</th>
                    <th>إجمالي المبلغ</th>
                    <th>معتمد</th>
                    <th>في الإنتظار</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report.id}>
                      <td>
                        <div className="reports-college-cell">
                          <span className="reports-college-name">{report.college}</span>
                          <span className="reports-department">{report.department}</span>
                        </div>
                      </td>
                      <td>{report.manager}</td>
                      <td>{report.date}</td>
                      <td>
                        <div className="reports-students-cell">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="9" cy="7" r="4" stroke="#3b82f6" strokeWidth="2"/>
                            <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span className="reports-students-count">{report.totalStudents}</span>
                        </div>
                      </td>
                      <td>
                        <span className="reports-amount">{report.totalAmount}</span>
                      </td>
                      <td>
                        <span className="reports-approved-badge">{report.approved}</span>
                      </td>
                      <td>
                        <span className="reports-pending-badge">{report.acceptedStudents}</span>
                      </td>
                      <td>
                         <button 
                          className="reports-details-btn"
                          onClick={() => router.push(`/uni-level/reports/${report.id}`)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                          عرض التفاصيل
                        </button>
                      </td>
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