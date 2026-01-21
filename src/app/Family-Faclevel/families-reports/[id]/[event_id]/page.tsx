"use client";

import React, { useEffect, useState } from "react";
import styles from "./detail.module.css";
import { useParams, useRouter } from "next/navigation";
import Header from "@/app/FacLevel/components/Header";
import Footer from "@/app/FacLevel/components/Footer";

/* ================= Interfaces ================= */

interface EventData {
  title: string;
  description: string;
  location: string;
  restrictions: string;
  reward: string;
  status: string;
  type: string;
  cost: string;
  startDate: string;
  endDate: string;
  participantsLimit: number;
  createdAt: string;
}

interface Student {
  memberId: number;
  name: string;
  id: string;
  major: string;
  role: string;
  joinDate: string;
}

/* ================= Page ================= */

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [eventData, setEventData] = useState<EventData>({
    title: "",
    description: "",
    location: "",
    restrictions: "",
    reward: "",
    status: "",
    type: "",
    cost: "",
    startDate: "",
    endDate: "",
    participantsLimit: 0,
    createdAt: "",
  });

  const [studentsData, setStudentsData] = useState<Student[]>([]);

  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 2500);
  };

  /* ================= Fetch Event ================= */

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const token = localStorage.getItem("access");

        const res = await fetch(
          `http://127.0.0.1:8000/api/family/faculty_events/${id}/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch event");

        const data = await res.json();

        setEventData({
          title: data.title,
          description: data.description,
          location: data.location,
          restrictions: data.restrictions,
          reward: data.reward,
          status: data.status,
          type: data.type,
          cost: data.cost,
          startDate: data.st_date,
          endDate: data.end_date,
          participantsLimit: data.s_limit,
          createdAt: new Date(data.created_at).toLocaleDateString("ar-EG"),
        });

        if (data.members) {
          setStudentsData(
            data.members.map((member: any) => ({
              memberId: member.student_id,
              name: member.student_name,
              id: member.u_id,
              major: member.dept_name,
              role: member.role,
              joinDate: new Date(member.joined_at).toLocaleDateString("ar-EG"),
            }))
          );
        }
      } catch (err) {
        console.error(err);
        showNotification("❌ فشل تحميل تفاصيل الفعالية", "error");
      }
    };

    fetchEventDetails();
  }, [id]);

  const handleBack = () =>
    router.push("/Family-Faclevel/families-reports/" + id);

  const handleRemoveMember = async (memberId: number) => {
    try {
      const token = localStorage.getItem("access");

      const res = await fetch(
        `http://127.0.0.1:8000/api/family/faculty_events/${id}/members/${memberId}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to delete member");

      setStudentsData((prev) =>
        prev.filter((student) => student.memberId !== memberId)
      );

      showNotification("✅ تم حذف الطالب بنجاح", "success");
    } catch (err) {
      console.error(err);
      showNotification("❌ فشل حذف الطالب", "error");
    }
  };

  /* ================= Render ================= */

  return (
    <>
      <Header />

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

      <div className={styles.detailsPage}>
        <header className={styles.detailsHeader}>
          <h1 className={styles.detailsTitle}>
            تفاصيل الفعالية: {eventData.title}
          </h1>

          <div className={styles.headerActions}>
            <button className={`${styles.actionBtn} ${styles.back}`} onClick={handleBack}>
              <span className={styles.btnIcon}>←</span>
              العودة
            </button>
          </div>
        </header>

        {/* ===== Event Info ===== */}
        <div className={styles.contentGrid}>
          <div className={styles.infoCard}>
            <h2 className={styles.cardTitle}>معلومات الفعالية</h2>

            <div className={styles.infoList}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>المكان:</span>
                <span className={styles.infoValue}>{eventData.location}</span>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>النوع:</span>
                <span className={styles.infoValue}>{eventData.type}</span>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>الحالة:</span>
                <span className={styles.infoValue}>{eventData.status}</span>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>الحد الأقصى للمشاركين:</span>
                <span className={styles.infoValue}>
                  {eventData.participantsLimit}
                </span>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>التكلفة:</span>
                <span className={styles.infoValue}>{eventData.cost}</span>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>تاريخ البدء:</span>
                <span className={styles.infoValue}>{eventData.startDate}</span>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>تاريخ الانتهاء:</span>
                <span className={styles.infoValue}>{eventData.endDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ===== Description ===== */}
        <div className={styles.descriptionCard}>
          <h2 className={styles.cardTitle}>وصف الفعالية</h2>
          <p className={styles.descriptionText}>{eventData.description}</p>
        </div>

        {/* ===== Students Table (unchanged) ===== */}
        <div className={styles.studentsCard}>
          <h2 className={styles.cardTitle}>المشاركون</h2>

          <div className={styles.tableContainer}>
            <table className={styles.studentsTable}>
              <thead>
                <tr>
                  <th>الاسم</th>
                  <th>الرقم الجامعي</th>
                  <th>التخصص</th>
                  <th>الدور</th>
                  <th>تاريخ الانضمام</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {studentsData.map((student, idx) => (
                  <tr key={idx}>
                    <td>{student.name}</td>
                    <td>{student.id}</td>
                    <td>{student.major}</td>
                    <td>{student.role}</td>
                    <td>{student.joinDate}</td>
                    <td>
                      <button
                        className={styles.deleteBtn}
                        title="حذف"
                        onClick={() =>
                          handleRemoveMember(student.memberId)
                        }
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
