"use client";
import React, { useEffect, useState } from 'react';
import styles from "../styles/TrackRequest.module.css";

interface TrackRequestProps {
  status?: "accepted" | "pending" | "rejected";
  onBack?: () => void;
}

const TrackRequest: React.FC<TrackRequestProps> = ({ status, onBack }) => {
  const [requestStatus, setRequestStatus] = useState<"accepted" | "pending" | "rejected" | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Check if request was submitted
    const isSubmitted = localStorage.getItem("familyRequestSubmitted") === "true";
    setSubmitted(isSubmitted);
    
    // Get status from localStorage or use prop
    if (status) {
      setRequestStatus(status);
    } else if (isSubmitted) {
      const storedStatus = localStorage.getItem("familyRequestStatus") as "accepted" | "pending" | "rejected" | null;
      setRequestStatus(storedStatus || "pending");
    }
  }, [status]);

  const getMessage = () => {
    if (!submitted) {
      return {
        title: "لا يوجد طلب إنشاء مُقدّم",
        description: "لم تقم بتقديم طلب إنشاء أسرة بعد",
        icon: "📄",
        color: "#777"
      };
    }

    switch (requestStatus) {
      case "accepted":
        return {
          title: "تم قبول طلب إنشاء أسرة",
          description: "تمت الموافقة على طلبك بنجاح. يمكنك الآن البدء في إدارة أسرتك.",
          icon: "✅",
          color: "#388e3c"
        };
      case "rejected":
        return {
          title: "تم رفض طلب إنشاء أسرة",
          description: "عذراً، لم تتم الموافقة على الطلب. يرجى مراجعة الشروط والمتطلبات وإعادة المحاولة.",
          icon: "❌",
          color: "#d32f2f"
        };
      case "pending":
      default:
        return {
          title: "طلبك قيد المراجعة",
          description: "تم استلام طلبك بنجاح وهو الآن قيد المراجعة من قبل إدارة رعاية الشباب. سيتم إشعارك عند اتخاذ القرار.",
          icon: "⏳",
          color: "#B38E19"
        };
    }
  };

  const { title, description, icon, color } = getMessage();

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.icon} style={{ color }}>{icon}</div>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.description}>{description}</p>
        {submitted && requestStatus === "pending" && (
          <div className={styles.statusBadge}>
            <span className={styles.badgeText}>قيد المراجعة</span>
          </div>
        )}
        <button className={styles.backButton} onClick={handleBack}>
          العودة
        </button>
      </div>
    </div>
  );
};

export default TrackRequest;