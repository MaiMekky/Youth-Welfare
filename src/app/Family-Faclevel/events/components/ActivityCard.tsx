"use client";

import React, { useState } from "react";
import styles from "../styles/Activities.module.css";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { useRouter } from "next/navigation";

interface ActivityCardProps {
  eventId: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  participantsLimit: number;
  type: string;
}

const ActivityCard: React.FC<ActivityCardProps> = ({
  eventId,
  title,
  description,
  startDate,
  endDate,
  location,
  participantsLimit,
  type,
}) => {
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">(
    "pending"
  );
  const [loading, setLoading] = useState(false);

  /* 🔔 notification state */
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 2500);
  };
const router = useRouter();
  const handleAction = async (action: "approve" | "reject") => {
    setLoading(true);
    const token = localStorage.getItem("access");

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/family/faculty_events/${eventId}/${action}/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to update event");

      if (action === "approve") {
        setStatus("approved");
        showNotification("✅ تم اعتماد الفعالية بنجاح", "success");
      } else {
        setStatus("rejected");
        showNotification("❌ تم رفض الفعالية", "error");
      }
    } catch (err) {
      console.error(err);
      showNotification("❌ حدث خطأ أثناء تحديث الفعالية", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 🔔 Notification */}
      {notification && (
        <div
          className={`${styles.notification} ${
            notification.type === "success"
              ? styles.success
              : styles.error
          }`}
        >
          {notification.message}
        </div>
      )}
    <div className={styles.eventCard}>
      <div className={styles.eventHeader}>
        <div className={styles.eventTitleSection}>
          <h2 className={styles.eventTitle}>{title}</h2>
          
          {/* Event type */}
          <span className={`${styles.eventType} ${styles[type]}`}>
            {type}
          </span>

         {status !== "pending" && (
      <span
        className={
          status === "approved"
            ? styles.badgeApproved
            : styles.badgeRejected
        }
      >
        {status === "approved" ? (
          <>
            تم الاعتماد
            <CheckCircleIcon style={{ marginRight: "6px", fontSize: "16px" }} />
          </>
        ) : (
          <>
            تم الرفض
            <CancelIcon style={{ marginRight: "6px", fontSize: "16px"}} />
          </>
        )}
      </span>
    )}

        </div>
      </div>

      <p className={styles.eventDescription}>{description}</p>

      <div className={styles.eventDetails}>
        <div className={styles.detailItem}>
          {/* Calendar SVG */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 16 16"
            style={{ marginRight: "6px" }}
          >
            <path d="M3.5 0a.5.5 0 0 0-.5.5V1H1a1 1 0 0 0-1 1v1h16V2a1 1 0 0 0-1-1h-2V.5a.5.5 0 0 0-1 0V1H4V.5a.5.5 0 0 0-.5-.5zM0 4v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4H0zm4 2h8v2H4V6zm0 3h8v2H4V9z"/>
          </svg>
          من: {startDate}
        </div>
        <div className={styles.detailItem}>
          {/* Calendar SVG */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 16 16"
            style={{ marginRight: "6px" }}
          >
            <path d="M3.5 0a.5.5 0 0 0-.5.5V1H1a1 1 0 0 0-1 1v1h16V2a1 1 0 0 0-1-1h-2V.5a.5.5 0 0 0-1 0V1H4V.5a.5.5 0 0 0-.5-.5zM0 4v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4H0zm4 2h8v2H4V6zm0 3h8v2H4V9z"/>
          </svg>
          إلى: {endDate}
        </div>
        <div className={styles.detailItem}>
          {/* Location SVG */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 16 16"
            style={{ marginRight: "6px" }}
          >
            <path d="M8 0a5 5 0 0 0-5 5c0 4.418 5 11 5 11s5-6.582 5-11a5 5 0 0 0-5-5zm0 7a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/>
          </svg>
          {location}
        </div>
        <div className={styles.detailItem}>
          {/* Participants SVG */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 16 16"
            style={{ marginRight: "6px" }}
          >
            <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
          </svg>
          الحد الأقصى: {participantsLimit}
        </div>
      </div>

      {status === "pending" && (
        <div className={styles.eventActions}>
          <div className={styles.actionRow}>
            <button
              className={styles.btnApprove}
              onClick={() => handleAction("approve")}
              disabled={loading}
            >
              اعتماد الفعالية
            </button>

            <button
              className={styles.btnReject}
              onClick={() => handleAction("reject")}
              disabled={loading}
            >
              رفض الفعالية
            </button>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default ActivityCard;
