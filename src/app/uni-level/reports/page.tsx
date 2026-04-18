"use client";
import { useState, useEffect } from "react";
import Head from "next/head";
import Layout from "../Layout";
import "./Reports.css";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";

interface CollegeReport {
  faculty_id: number;
  faculty_name: string;
  total_approved_amount: string;
  approved_count: number;
  pending_count: number;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<CollegeReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalRequests: 0,
    totalAmount: "0 جنيه",
    totalApproved: 0,
    totalPending: 0,
  });

  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access");
      if (!token) { console.error("لا يوجد توكن"); return; }

      const res = await authFetch(
        `${getBaseUrl()}/api/solidarity/super_dept/faculty_summary/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) throw new Error("فشل في جلب البيانات");
      const data = await res.json();

      const totalApproved = data.totals.total_approved_count ?? 0;
      const totalPending  = data.totals.total_pending_count  ?? 0;

      setReports(data.rows);
      setSummary({
        totalRequests: totalApproved + totalPending,
        totalAmount: `${parseFloat(data.totals.total_approved_amount ?? 0).toLocaleString("en-US")} جنيه`,
        totalApproved,
        totalPending,
      });
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء جلب تقارير الكليات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  if (loading) return <Layout><p style={{ padding: "2rem", fontFamily: "Cairo, sans-serif" }}>جاري التحميل...</p></Layout>;

  return (
    <Layout>
      
      <div className="reports-container">

        {/* ── Page Header ── */}
        <div className="reports-page-header">
          <h1 className="reports-page-title">تقارير الكليات</h1>
          <p className="reports-page-subtitle">
            عرض تقارير الدعم المالي المقدمة من كل الكليات
          </p>
        </div>

        {/* ── Stats Grid ── */}
        <div className="reports-stats-grid">

          <div className="reports-stat-card reports-stat-total">
            <div className="reports-stat-num">{summary.totalRequests}</div>
            <div className="reports-stat-lbl">إجمالي الطلبات</div>
          </div>

          <div className="reports-stat-card reports-stat-approved">
            <div className="reports-stat-num">{summary.totalApproved}</div>
            <div className="reports-stat-lbl">المعتمد</div>
          </div>

          <div className="reports-stat-card reports-stat-pending">
            <div className="reports-stat-num">{summary.totalPending}</div>
            <div className="reports-stat-lbl">في الانتظار</div>
          </div>

          <div className="reports-stat-card reports-stat-amount">
            <div className="reports-stat-num">{summary.totalAmount}</div>
            <div className="reports-stat-lbl">إجمالي الميزانية</div>
          </div>

        </div>

        {/* ── Reports Table ── */}
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
                    <td>
                      <span className="reports-college-name">{row.faculty_name}</span>
                    </td>
                    <td>
                      <span className="reports-approved-badge">{row.approved_count}</span>
                    </td>
                    <td>
                      <span className="reports-pending-badge">{row.pending_count}</span>
                    </td>
                    <td className="reports-amount">
                      {parseFloat(row.total_approved_amount).toLocaleString("en-US")} جنيه
                    </td>
                  </tr>
                ))}

                {reports.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: "24px", color: "#6B8299" }}>
                      لا توجد بيانات
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </Layout>
  );
}