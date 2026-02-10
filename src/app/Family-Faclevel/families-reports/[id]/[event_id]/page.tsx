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
  deptName: string;     
  familyName: string;
}

interface Student {
  studentId: number;
  name: string;
  nationalId: string;
  collegeId: string;
  status: string;
  rank: string | null;
  reward: string | null;
}

/* ================= Page ================= */

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const event_id = params.event_id as string;

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
  deptName: "",
  familyName: "",
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
          `http://127.0.0.1:8000/api/family/faculty_events/${event_id}/`,
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
  restrictions: data.restrictions ?? "",
  reward: data.reward ?? "",
  status: data.status,
  type: data.type,
  cost: data.cost,
  startDate: new Date(data.st_date).toLocaleDateString("ar-EG"),
  endDate: new Date(data.end_date).toLocaleDateString("ar-EG"),
  participantsLimit: data.participants_limit,
  createdAt: data.created_at,
  deptName: data.dept_name,
  familyName: data.family_name,
});

setStudentsData(
  data.registered_members.map((m: any) => ({
    studentId: m.student_id,
    name: m.student_name,
    nationalId: m.student_nid,
    collegeId: m.college_id,
    status: m.status,
    rank: m.rank,
    reward: m.reward,
  }))
);

      } catch (err) {
        console.error(err);
        showNotification("❌ فشل تحميل تفاصيل الفعالية", "error");
      }
    };

    fetchEventDetails();
  }, [event_id]);

  const handleBack = () =>
    router.push("/Family-Faclevel/families-reports/" + params.id);

  const handleRemoveMember = async (memberId: number) => {
    try {
      const token = localStorage.getItem("access");

      const res = await fetch(
        `http://127.0.0.1:8000/api/family/faculty_events/${event_id}/members/${memberId}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to delete member");

      // setStudentsData((prev) =>
      //   prev.filter((student) => student.nationalId !== nationalId)
      // );

      showNotification("✅ تم حذف الطالب بنجاح", "success");
    } catch (err) {
      console.error(err);
      showNotification("❌ فشل حذف الطالب", "error");
    }
  };
  const handleParticipantAction = async (
    studentId: number,
  action: "approve" | "reject"
) => {
  try {
    const token = localStorage.getItem("access");

    const res = await fetch(
      `http://127.0.0.1:8000/api/family/faculty_events/${event_id}/participants/${studentId}/${action}/`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error(errorText);
      throw new Error("Action failed");
    }

    setStudentsData((prev) =>
      prev.map((s) =>
        s.studentId === studentId
          ? {
              ...s,
              status: action === "approve" ? "مقبول" : "مرفوض",
            }
          : s
      )
    );

    showNotification(
      action === "approve"
        ? "✅ تم اعتماد الطالب"
        : "❌ تم رفض الطالب",
      action === "approve" ? "success" : "error"
    );
  } catch (err) {
    console.error(err);
    showNotification("❌ فشل تنفيذ العملية", "error");
  }
};
const handleApproveAll = async () => {
  try {
    const token = localStorage.getItem("access");

    // Loop through students and approve each
    for (const student of studentsData) {
      if (student.status !== "approved") {
        const res = await fetch(
          `http://127.0.0.1:8000/api/family/faculty_events/${event_id}/approve-all-participants/`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) throw new Error(`Failed to approve ${student.name}`);
      }
    }

    // Update UI directly
    setStudentsData((prev) =>
      prev.map((s) => ({ ...s, status: "مقبول" }))
    );

    showNotification("✅ تم اعتماد جميع الطلاب", "success");
  } catch (err) {
    console.error(err);
    showNotification("❌ فشل اعتماد الجميع", "error");
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
              <div className={styles.infoRow}>
              <span className={styles.infoLabel}>القسم:</span>
              <span className={styles.infoValue}>{eventData.deptName}</span>
            </div>

            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>الأسرة:</span>
              <span className={styles.infoValue}>{eventData.familyName}</span>
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
     <div className={styles.studentsHeader}>
    <button className={styles.approveAllButton} onClick={handleApproveAll}>
      اعتماد الجميع
    </button>
  </div>

          <div className={styles.tableContainer}>
           <table className={styles.studentsTable}>
  <thead>
    <tr>
      <th>الاسم</th>
      <th>الرقم القومي</th>
      <th>الرقم الجامعي</th>
      <th>الحالة</th>
      {/* <th>الترتيب</th>
      <th>المكافأة</th> */}
      <th>الإجراءات</th>
    </tr>
  </thead>
  <tbody>
    {studentsData.map((p, idx) => (
      <tr key={idx}>
        <td>{p.name}</td>
        <td>{p.nationalId}</td>
        <td>{p.collegeId}</td>
        <td>{p.status}</td>
        {/* <td>{p.rank ?? "-"}</td>
        <td>{p.reward ?? "-"}</td> */}
        <td>
  <div className={styles.actionsRow}>
    <button
      className={styles.approveButton}
      onClick={() => handleParticipantAction(p.studentId, "approve")}
      title="اعتماد"
    >
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"> <polyline points="20 6 9 17 4 12" /> </svg> </button> {/* Reject Button */} <button className={styles.rejectButton} onClick={() => handleParticipantAction(p.studentId, "reject")} title="رفض" > <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"> <line x1="18" y1="6" x2="6" y2="18" /> <line x1="6" y1="6" x2="18" y2="18" /> </svg> </button>
  </div>
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
