"use client";

import React, { useState, useEffect } from "react";
import { Eye, CheckCircle, X } from "lucide-react";
import "../styles/myRequests.css";
import { useRouter } from "next/navigation";

interface Request {
  id: string;
  requestNumber: string;
  type: string;
  status: "pending" | "under-review" | "approved" | "rejected" | string;
  submissionDate: string;
  familyMembers: number;
  familyIncome: string;
  reason: string;
  currentStep: number;
  totalSteps: number;
}

export default function MyRequests({ onStatusesLoaded }: any) {
  const [requests, setRequests] = useState<Request[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const router = useRouter();

  const mapStatus = (status: string) => {
    const st = status.trim();

    if (["pending", "منتظر"].includes(st)) return "pending";
    if (["under-review", "موافقة مبدئية"].includes(st)) return "under-review";
    if (["approved", "مقبول"].includes(st)) return "approved";
    if (["rejected", "مرفوض"].includes(st)) return "rejected";

    return "pending";
  };

  const statusToStep = (status: string) => {
    const s = mapStatus(status);
    if (s === "pending") return 1;
    if (s === "under-review") return 2;
    if (s === "approved") return 3;
    if (s === "rejected") return 3;
    return 1;
  };

  const getStatusText = (status: string) => {
    const s = mapStatus(status);
    return {
      pending: "منتظر",
      "under-review": "موافقة مبدئية",
      approved: "مقبول",
      rejected: "مرفوض",
    }[s];
  };

  const getStepLabel = (step: number, status?: string) => {
    if (status === "rejected") {
      return ["منتظر", "موافقة مبدئية", "مرفوض"][step - 1];
    }
    return ["منتظر", "موافقة مبدئية", "مقبول"][step - 1];
  };

  const getProgressPercentage = (current: number, total: number) =>
    ((current - 1) / (total - 1)) * 100;

  const fetchRequests = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("access");
      if (!token) return;

      const response = await fetch(
        "http://127.0.0.1:8000/api/solidarity/student/status/",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();

      const mapped: Request[] = data.map((item: any) => ({
        id: item.solidarity_id,
        requestNumber: item.solidarity_id,
        type: "طلب دعم مالي",
        status: mapStatus(item.req_status),
        submissionDate: new Date(item.created_at).toLocaleDateString("ar-EG", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        familyMembers: item.family_numbers,
        familyIncome: item.total_income,
        reason: item.reason,
        currentStep: statusToStep(item.req_status),
        totalSteps: 3,
      }));

      setRequests(mapped);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    if (activeTab === "all") {
      setFilteredRequests(requests);
    } else {
      setFilteredRequests(
        requests.filter((r) => mapStatus(r.status) === activeTab)
      );
    }
  }, [activeTab, requests]);

  const handleViewDetails = (id: string) => router.push(`/my-requests/${id}`);

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    const statuses = requests.map((r) => r.status);
    onStatusesLoaded(statuses);
  }, [requests]);

  if (loading) {
    return (
      <div className="my-requests-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">جاري تحميل الطلبات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-requests-container">
      <div className="requests-tabs">
        <button
          className={`tab-button ${activeTab === "all" ? "active" : ""}`}
          onClick={() => setActiveTab("all")}
        >
          طلباتي
        </button>
      </div>

      <div className="requests-list">
        {filteredRequests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h3>لا توجد طلبات</h3>
            <p>لم تقم بتقديم أي طلبات بعد</p>
          </div>
        ) : (
          filteredRequests.map((req) => (
            <div key={req.id} className="request-card">
              <div className="request-card-header">
                <div className="request-info">
                  <h3>{req.type}</h3>
                  <p className="request-number">رقم الطلب: {req.requestNumber}</p>
                </div>

                <span className={`status-badge ${mapStatus(req.status)}`}>
                  {getStatusText(req.status)}
                </span>
              </div>

              <div className="request-details">
                <div className="detail-item">
                  <span className="detail-label">تاريخ التقديم</span>
                  <span className="detail-value">{req.submissionDate}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">عدد أفراد الأسرة</span>
                  <span className="detail-value">{req.familyMembers} أفراد</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">دخل الأسرة</span>
                  <span className="detail-value">{req.familyIncome}</span>
                </div>
              </div>

              <div className="request-reason">
                <h4>سبب الطلب</h4>
                <p>{req.reason}</p>
              </div>

              {/* 🔥 Progress Bar */}
              <div className="progress-tracker">
                <h4>تتبع حالة الطلب</h4>

                <div className="progress-steps">
                  <div className="progress-line">
                    <div
                      className="progress-line-fill"
                      style={{
                        width: `${getProgressPercentage(
                          req.currentStep,
                          req.totalSteps
                        )}%`,
                        background: req.status === "rejected" ? "#ef4444" : "#22c55e",
                      }}
                    ></div>
                  </div>

                  {[...Array(req.totalSteps)].map((_, index) => {
                    const step = index + 1;
                    const isLastStep = step === req.totalSteps;

                    // تحديد لون الدائرة الأخيرة حسب الحالة
                    let circleBackground = "#e5e7eb"; // افتراضي
                    let circleContent: JSX.Element | number = step;
                    let circleColor = "#9ca3af";

                    if (step < req.currentStep) {
                      circleBackground = "#22c55e"; // أخضر للخطوات المكتملة
                      circleContent = <CheckCircle size={18} color="#ffffff" />;
                      circleColor = "#ffffff";
                    } else if (isLastStep) {
                      if (req.status === "approved") {
                        circleBackground = "#22c55e";
                        circleContent = <CheckCircle size={18} color="#ffffff" />;
                        circleColor = "#ffffff";
                      } else if (req.status === "rejected") {
                        circleBackground = "#ef4444";
                        circleContent = <X size={22} color="#ffffff" />;
                        circleColor = "#ffffff";
                      } else if (step === req.currentStep) {
                        circleBackground = "#3b82f6"; // أزرق للموافقة المبدئية
                        circleContent = step;
                        circleColor = "#ffffff";
                      }
                    } else if (step === req.currentStep) {
                      circleBackground = "#3b82f6"; // أزرق للموافقة المبدئية
                      circleContent = step;
                      circleColor = "#ffffff";
                    }

  return (
    <div
      key={index}
      className={`progress-step`}
    >
      <div
        className="step-circle"
        style={{
          background: circleBackground,
          color: circleColor,
        }}
      >
        {circleContent}
      </div>

      <span className="step-label">{getStepLabel(step, req.status)}</span>
    </div>
  );
})}

                </div>
              </div>

              <div className="request-actions">
                <button
                  className="action-btn view"
                  onClick={() => handleViewDetails(req.id)}
                >
                  <Eye size={18} />
                  عرض التفاصيل
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
