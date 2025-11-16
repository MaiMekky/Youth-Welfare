// "use client";

// import React, { useState } from "react";
// import "../styles/myRequests.css";

// export default function MyRequest() {
//   const [searchTerm, setSearchTerm] = useState("");

//   // Mock request data
//   const requestData = {
//     requestNumber: "15-2025-001",
//     supportType: "طلب دعم مالي",
//     amount: "1500 جنيه",
//     organization: "النسبية الدولية",
//     familyMembers: "3 أفراد",
//     status: "قيد المراجعة",
//     reason:
//       "احتاج إلى دعم عالي لمساعدة أسرتي بعد وفاة والدي وعدم وجود دخل ثابت.",
//     address: "الأميرة تشبع - محل الأسرة",
//   };

//   const handleSearch = (e: React.FormEvent) => {
//     e.preventDefault();
//     alert(`جارٍ البحث عن الطلب رقم: ${searchTerm}`);
//   };

//   return (
//     <div className="my-request-card" dir="rtl">
//       <h3 className="my-request-title">طلب الدعم الخاص بي</h3>

//       {/* Search Section */}
//       <form className="search-section" onSubmit={handleSearch}>
//         <label>البحث برقم الطلب</label>
//         <div className="search-box">
//           <input
//             type="text"
//             placeholder="أدخل رقم الطلب هنا..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//           <button type="submit">بحث</button>
//         </div>
//       </form>

//       {/* Request Info Box */}
//       <div className="request-info-box">
//         <div className="request-header">
//           <h4>{requestData.supportType}</h4>
//           <span className={`status-badge ${requestData.status === "قيد المراجعة" ? "pending" : "approved"}`}>
//             {requestData.status}
//           </span>
//         </div>

//         <div className="request-details">
//           <p>
//             <strong>رقم الطلب:</strong> {requestData.requestNumber}
//           </p>
//           <p>
//             <strong>الجهة:</strong> {requestData.organization}
//           </p>
//           <p>
//             <strong>المبلغ:</strong> {requestData.amount}
//           </p>
//           <p>
//             <strong>عدد أفراد الأسرة:</strong> {requestData.familyMembers}
//           </p>
//           <p>
//             <strong>وصف الحالة:</strong> {requestData.reason}
//           </p>
//           <p>
//             <strong>محل الأسرة:</strong> {requestData.address}
//           </p>
//         </div>
//       </div>
//     </div>
//   );

// }

"use client";

import React, { useState, useEffect } from "react";
import { Eye, X, CheckCircle } from "lucide-react";
import "../styles/myRequests.css";
import { useRouter } from "next/navigation";


interface Request {
  id: string;
  requestNumber: string;
  type: string;
  status: "pending" | "under-review" | "approved" | "rejected";
  submissionDate: string;
  familyMembers: number;
  familyIncome: string;
  reason: string;
  currentStep: number;
  totalSteps: number;
}

export default function MyRequests() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [activeTab, requests]);

  // const fetchRequests = async () => {
  //   try {
  //     setLoading(true);
  //     await new Promise((resolve) => setTimeout(resolve, 1500));

  //     const dummyData: Request[] = [
  //       {
  //         id: "1",
  //         requestNumber: "SS-2025-001",
  //         type: "طلب دعم مالي",
  //         status: "under-review",
  //         submissionDate: "2 يناير 2025",
  //         familyMembers: 3,
  //         familyIncome: "1500 جنيه",
  //         reason:
  //           "أحتاج إلى دعم مالي لمساعدة أسرتي بعد وفاة والدي وعدم وجود دخل ثابت للأسرة",
  //         currentStep: 2,
  //         totalSteps: 3,
  //       },
  //     ];

  //     setRequests(dummyData);
  //   } catch (error) {
  //     console.error("Error fetching requests:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
const mapStatusForCSS = (status: string) => {
  switch(status) {
    case "pending":
    case "منتظر":
      return "pending";
    case "under-review":
    case "موافقة مبدئية":
      return "under-review";
    case "approved":
    case "مقبول":
      return "approved";
    case "rejected":
    case "مرفوض":
      return "rejected";
    default:
      return "pending";
  }
};
const statusToStep = (status: string): number => {
  switch(mapStatusForCSS(status)) {
    case "pending": return 1;
    case "under-review": return 2;
    case "approved": return 3;
    //  case "rejected": return 3;
    default: return 1;
  }
};


  const filterRequests = () => {
    let filtered = requests;
    if (activeTab !== "all") {
      filtered = filtered.filter((req) => req.status === activeTab);
    }
    setFilteredRequests(filtered);
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      pending: "منتظر",
      "under-review": "موافقة مبدئية",
      approved: "مقبول",
      rejected: "مرفوض",
    };
    return statusMap[status] || status;
  };

const getStepLabel = (step: number) => {
  const steps = ["منتظر", "موافقة مبدئية", "مقبول"];
  return steps[step - 1] || "";
};


  const getProgressPercentage = (current: number, total: number) => {
    return ((current - 1) / (total - 1)) * 100;
  };

  // const handleCancelRequest = (requestId: string) => {
  //   if (confirm("هل أنت متأكد من إلغاء هذا الطلب؟")) {
  //     alert("تم إلغاء الطلب");
  //   }
  // };

  const fetchRequests = async () => {
  try {
    setLoading(true);

    // Get token from localStorage
    const token = localStorage.getItem("access");
    if (!token) throw new Error("User not authenticated");

    const response = await fetch(
      "http://127.0.0.1:8000/api/solidarity/student/status/",
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Error fetching requests:", errorData);
      return;
    }

    const data = await response.json();

    // Map backend data to your Request interface if needed
    const mappedRequests: Request[] = data.map((item: any) => ({
      // const statusStep = statusToStep(item.req_status);
     
      id: item.solidarity_id,
      requestNumber: item.solidarity_id,
      // type: item.req_type === "financial_aid" ? "طلب دعم مالي" : item.req_type,
      status: item.req_status,
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

    setRequests(mappedRequests);
  } catch (error) {
    console.error("Error fetching requests:", error);
  } finally {
    setLoading(false);
  }
};
const router = useRouter();
 const handleViewDetails = (requestId: string) => {
  router.push(`/my-requests/${requestId}`);
};


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
      {/* Tabs */}
      <div className="requests-tabs">
        <button
          className={`tab-button ${activeTab === "all" ? "active" : ""}`}
          onClick={() => setActiveTab("all")}
        >
          طلباتي
        </button>
      </div>

      {/* Requests List */}
      <div className="requests-list">
        {filteredRequests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h3>لا توجد طلبات</h3>
            <p>لم تقم بتقديم أي طلبات بعد</p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <div key={request.id} className="request-card">
              <div className="request-card-header">
                <div className="request-info">
                  <h3>{request.type}</h3>
                  <p className="request-number">رقم الطلب: {request.requestNumber}</p>
                </div>
              <span className={`status-badge ${mapStatusForCSS(request.status)}`}>
  {getStatusText(request.status)}
</span>
              </div>

              <div className="request-details">
                <div className="detail-item">
                  <span className="detail-label">تاريخ التقديم</span>
                  <span className="detail-value">{request.submissionDate}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">عدد أفراد الأسرة</span>
                  <span className="detail-value">{request.familyMembers} أفراد</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">دخل الأسرة</span>
                  <span className="detail-value">{request.familyIncome}</span>
                </div>
              </div>

              <div className="request-reason">
                <h4>سبب الطلب</h4>
                <p>{request.reason}</p>
              </div>

              <div className="progress-tracker">
                <h4>تتبع حالة الطلب</h4>
                <div className="progress-steps">
                  <div className="progress-line">
                    <div
                      className="progress-line-fill"
                      // style={{
                      //   width: `${getProgressPercentage(
                      //     request.currentStep,
                      //     request.totalSteps
                      //   )}%`,
                      // }}
                      style={{
     width: `${getProgressPercentage(request.currentStep, request.totalSteps)}%`,
  }}
                    ></div>
                  </div>
             {[...Array(request.totalSteps)].map((_, index) => {
              const stepNumber = index + 1; // بدل ما تعمل totalSteps - index
             const isCompleted = stepNumber < request.currentStep;
             const isActive = stepNumber === request.currentStep;

              return (
                <div
                  key={index}
                  className={`progress-step ${isCompleted ? "completed" : isActive ? "active" : ""}`}
                >
                  <div className="step-circle">
                    {isCompleted ? <CheckCircle size={18} /> : stepNumber}
                  </div>
                  <span className="step-label">{getStepLabel(stepNumber)}</span>
                </div>
              );
            })}

                </div>
              </div>

              <div className="request-actions">
                <button
                  className="action-btn view"
                  onClick={() => handleViewDetails(request.id)}
                >
                  <Eye size={18} />
                  عرض التفاصيل
                </button>
                {/* {(request.status === "pending" ||
                  request.status === "under-review") && (
                  <button
                    className="action-btn cancel"
                    onClick={() => handleCancelRequest(request.id)}
                  >
                    <X size={18} />
                    إلغاء الطلب
                  </button>
                )} */}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
