"use client";
import React, { useEffect, useState } from "react";
import styles from "../styles/TrackRequest.module.css";

interface FamilyRequest {
  family_id: number;
  name: string;
  description: string;
  faculty: number;
  faculty_name: string;
  type: string;
  status: string;
  created_at: string;
}

const TrackRequest: React.FC = () => {
  const [requests, setRequests] = useState<FamilyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

 useEffect(() => {
  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("access");
      console.log("ACCESS TOKEN:", token);

      const res = await fetch(
        "http://localhost:8000/api/family/student/family_creation_request/",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, 
          },
        }
      );

      console.log("STATUS:", res.status);

      const text = await res.text();
      if (!res.ok) {
        throw new Error("فشل تحميل طلبات الأسر");
      }

      const data = JSON.parse(text);
      setRequests(data.requests || []);
    } catch (err: any) {
      console.error("ERROR:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  fetchRequests();
}, []);


  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>جاري التحميل...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>{error}</div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h2 className={styles.title}>لا توجد طلبات</h2>
          <p className={styles.description}>
            لم تقم بتقديم أي طلب إنشاء أسرة حتى الآن
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.cardsWrapper}>
        {requests.map((req) => (
          <div key={req.family_id} className={styles.card}>
            <h2 className={styles.title}>{req.name}</h2>

            <p className={styles.description}>{req.description}</p>

            <div className={styles.infoRow}>
              <span>🏫 الكلية:</span>
              <span>{req.faculty_name}</span>
            </div>

            <div className={styles.infoRow}>
              <span>👥 نوع الأسرة:</span>
              <span>{req.type}</span>
            </div>

            <div className={styles.infoRow}>
              <span>📅 تاريخ الإنشاء:</span>
              <span>
                {new Date(req.created_at).toLocaleDateString("ar-EG")}
              </span>
            </div>

            <div
              className={styles.statusBadge}
              data-status={req.status}
            >
              {req.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrackRequest;
