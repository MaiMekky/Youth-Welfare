"use client";

import React, { useState, useEffect } from "react";
import { Eye, CheckCircle, X, AlertTriangle } from "lucide-react";
import "../styles/myRequests.css";
import { useRouter } from "next/navigation";
import { authFetch } from "@/utils/globalFetch";

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
  discountType: string[];
}

interface MyRequestsProps {
  onStatusesLoaded: (statuses: string[]) => void;
  showAlert: boolean;
}

export default function MyRequests({ onStatusesLoaded, showAlert }: MyRequestsProps) {
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
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await authFetch(
        "http://127.0.0.1:8000/api/solidarity/student/status/",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.ok) {
        setLoading(false);
        return;
      }

      const data = await response.json();

      const mapped: Request[] = data.map((item: Record<string, unknown>) => ({
        id: item.solidarity_id,
        requestNumber: item.solidarity_id,
        type: "طلب دعم مالي",
        status: mapStatus(item.req_status as string),
        submissionDate: new Date(item.created_at as string).toLocaleDateString("ar-EG", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        familyMembers: item.family_numbers,
        familyIncome: item.total_income,
        reason: item.reason,
        currentStep: statusToStep(item.req_status as string),
        totalSteps: 3,
        discountType: Array.isArray(item.discount_type)
          ? (item.discount_type as string[]).filter((d: string) => d && d.trim() !== "")
          : [],
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeTab === "all") {
      setFilteredRequests(requests);
    } else {
      setFilteredRequests(requests.filter((r) => mapStatus(r.status) === activeTab));
    }
  }, [activeTab, requests]);

  useEffect(() => {
    const statuses = requests.map((r) => r.status);
    onStatusesLoaded(statuses);
  }, [requests, onStatusesLoaded]);

  const handleViewDetails = (id: string) => router.push(`/my-requests/${id}`);

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

      {showAlert && (
        <div className="important-notice">
          <div className="notice-icon">
            <AlertTriangle size={22} />
          </div>
          <div className="notice-content">
            <span className="notice-title">تنبيه هام</span>
            <span className="notice-text">
              يرجى التوجه لرعاية شباب الكلية لتسليم المستندات الورقية خلال فترة من 3 إلى 5 أيام من تاريخ تقديم الطلب.
            </span>
          </div>
        </div>
      )}

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
                <div className="detail-item">
                  <span className="detail-label">نوع الخصم</span>
                  <span className="detail-value">
                    {req.discountType.length > 0 ? (
                      <span className="discount-tags">
                        {req.discountType.map((d, i) => (
                          <span key={i} className="discount-tag">{d}</span>
                        ))}
                      </span>
                    ) : (
                      <span className="no-discount">لا يوجد</span>
                    )}
                  </span>
                </div>
              </div>

              <div className="request-reason">
                <h4>سبب الطلب</h4>
                <p>{req.reason}</p>
              </div>

              <div className="progress-tracker">
                <h4>تتبع حالة الطلب</h4>
                <div className="progress-steps">
                  <div className="progress-line">
                    <div
                      className="progress-line-fill"
                      style={{
                        width: `${getProgressPercentage(req.currentStep, req.totalSteps)}%`,
                        background: req.status === "rejected" ? "#ef4444" : "#22c55e",
                      }}
                    ></div>
                  </div>

                  {[...Array(req.totalSteps)].map((_, index) => {
                    const step = index + 1;
                    const isLastStep = step === req.totalSteps;

                    let circleBackground = "#e5e7eb";
                    let circleContent: React.ReactElement | number = step;
                    let circleColor = "#9ca3af";

                    if (step < req.currentStep) {
                      circleBackground = "#22c55e";
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
                        circleBackground = "#3b82f6";
                        circleContent = step;
                        circleColor = "#ffffff";
                      }
                    } else if (step === req.currentStep) {
                      circleBackground = "#3b82f6";
                      circleContent = step;
                      circleColor = "#ffffff";
                    }

                    return (
                      <div
                        key={index}
                        className={`progress-step ${
                          step < req.currentStep
                            ? "completed"
                            : step === req.currentStep
                            ? "active current-step"
                            : ""
                        }`}
                      >
                        <div
                          className="step-circle"
                          style={{
                            background: circleBackground,
                            color: circleColor,
                            ...(index === 2 && req.status === "rejected" && { marginRight: "6px" }),
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
                <button className="action-btn view" onClick={() => handleViewDetails(req.id)}>
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