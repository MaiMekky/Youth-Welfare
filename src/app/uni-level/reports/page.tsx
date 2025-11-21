"use client";
import { useState, useEffect } from "react";
import Head from "next/head";
import Layout from "../Layout";
import "./Reports.css";
import { useRouter } from "next/navigation";

interface CollegeReport {
  faculty_id: number;
  faculty_name: string;
  total_approved_amount: string;
  approved_count: number;
  pending_count: number;
}

export default function ReportsPage() {
  const router = useRouter();

  const [reports, setReports] = useState<CollegeReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalRequests: 0,
    totalAmount: "0 جنيه",
  });

  // ======================
  // 🔥 جلب البيانات من الـ API
  // ======================
  const fetchReports = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("access");
      if (!token) {
        console.error("لا يوجد توكن");
        return;
      }

      const res = await fetch(
        "http://127.0.0.1:8000/api/solidarity/super_dept/faculty_summary/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("فشل في جلب البيانات");

      const data = await res.json();

      setReports(data.rows);
setSummary({
  totalRequests:
    (data.totals.total_approved_count ?? 0) +
    (data.totals.total_pending_count ?? 0),

  totalAmount: `${parseFloat(
    data.totals.total_approved_amount ?? 0
  ).toLocaleString("en-US")} جنيه`,
});

    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء جلب تقارير الكليات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading) return <Layout><p>جاري التحميل...</p></Layout>;

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

        {/* Summary */}
        <div className="reports-summary-card">
          <div className="reports-summary-label">إحصائيات الجامعة</div>
          <div className="reports-summary-stats">
            <div className="reports-stat-item">
              <span className="reports-stat-value">{summary.totalRequests}</span>
              <span className="reports-stat-label">إجمالي الطلبات</span>
            </div>

            <div className="reports-stat-divider"></div>

            <div className="reports-stat-item">
              <span className="reports-stat-value reports-stat-value-amount">
                {summary.totalAmount}
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
                  <th>المعتمد</th>
                  <th>في الانتظار</th>
                  <th>إجمالي المبلغ المعتمد</th>
                </tr>
              </thead>

              <tbody>
                {reports.map((row) => (
                  <tr key={row.faculty_id}>
                    <td>{row.faculty_name}</td>
                    <td>{row.approved_count}</td>
                    <td>{row.pending_count}</td>
                    <td>
                      {parseFloat(row.total_approved_amount).toLocaleString("en-US")} جنيه
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
