"use client";
import { useState } from "react";
import Head from "next/head";
import Layout from "../Layout";
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
      status: "عرض التفاصيل",
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
      status: "عرض التفاصيل",
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
      status: "عرض التفاصيل",
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
      status: "عرض التفاصيل",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("جميع الكليات");

  const totalRequests = reports.reduce((sum, report) => sum + report.totalStudents, 0);
  const totalAmount = "205,700 جنيه";

  return (
    <Layout>
      <Head>
        <title>تقارير الكليات</title>
      </Head>

      <div className="reports-container">
        {/* Page Header */}
        <div className="reports-page-header">
          <h1 className="reports-page-title">تقارير الكليات</h1>
          <p className="reports-page-subtitle">
            عرض تقارير الدعم المالي المقدمة من كل الكليات
          </p>
        </div>

        {/* Toolbar */}
        <div className="reports-toolbar">
          {/* <div className="reports-toolbar-right">
            <button className="reports-export-btn">تصدير إكسل</button>
            <button className="reports-print-btn">طباعة الملخص</button>
          </div> */}
          {/* <div className="reports-toolbar-left">
            <div className="reports-search-box">
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
          </div> */}
        </div>

        {/* Summary */}
        <div className="reports-summary-card">
          <div className="reports-summary-label">إحصائيات الجامعة</div>
          <div className="reports-summary-stats">
            <div className="reports-stat-item">
              <span className="reports-stat-value">{totalRequests}</span>
              <span className="reports-stat-label">إجمالي الطلبات</span>
            </div>
            <div className="reports-stat-divider"></div>
            <div className="reports-stat-item">
              <span className="reports-stat-value reports-stat-value-amount">
                {totalAmount}
              </span>
              <span className="reports-stat-label">إجمالي الميزانية</span>
            </div>
          </div>
        </div>

        {/* Reports Table */}
        <div className="reports-table-section">
          <div className="reports-section-header">
            <h2 className="reports-section-title">ملخص تقارير الكليات</h2>
            <p className="reports-section-subtitle">
              تفاصيل الدعم المالي المقدمة من كل الكليات
            </p>
          </div>

          <div className="reports-table-wrapper">
            <table className="reports-table">
              <thead>
                <tr>
                  <th>الكلية</th>
                  <th>الإداري</th>
                  <th>التاريخ</th>
                  <th>الطلاب</th>
                  <th>المبلغ</th>
                  <th>معتمد</th>
                  <th>في الانتظار</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id}>
                    <td>{report.college}</td>
                    <td>{report.manager}</td>
                    <td>{report.date}</td>
                    <td>{report.totalStudents}</td>
                    <td>{report.totalAmount}</td>
                    <td>{report.approved}</td>
                    <td>{report.acceptedStudents}</td>
                    <td>
                      <button
                        className="reports-details-btn"
                        onClick={() => router.push(`/uni-level/reports/${report.id}`)}
                      >
                        عرض التفاصيل
                      </button>
                    </td>
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
