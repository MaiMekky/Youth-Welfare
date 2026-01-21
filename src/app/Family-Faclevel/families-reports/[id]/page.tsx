"use client";

import React, { useEffect, useState } from 'react';
import styles from './details.module.css';
import { useParams, useRouter } from "next/navigation";
import Header from "@/app/FacLevel/components/Header";
import Footer from "@/app/FacLevel/components/Footer";

interface FamilyData {
  eventId: number;
  name: string;
  totalMembers: number;
  activities: number;
  goals: number;
  participation: string;
  foundingDate: string;
  coordinator: string;
  supervisor: string;
  category: string;
  description: string;
}

interface Activity {
  eventId: number;
  name: string;
  date: string;
  type: string;
  participants: number;
}

interface Student {
  memberId: number;
  name: string;
  id: string;
  major: string;
  role: string;
  joinDate: string;
}

export default function FamilyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [familyData, setFamilyData] = useState<FamilyData>({
    eventId: 0,
    name: '',
    totalMembers: 0,
    activities: 0,
    goals: 0,
    participation: '0%',
    foundingDate: '',
    coordinator: '',
    supervisor: '',
    category: '',
    description: '',
  });

  const [activitiesData, setActivitiesData] = useState<Activity[]>([]);
  const [studentsData, setStudentsData] = useState<Student[]>([]);
  const [goalsData, setGoalsData] = useState<string[]>([]);
const [notification, setNotification] = useState<{
  message: string;
  type: "success" | "error";
} | null>(null);

const showNotification = (message: string, type: "success" | "error") => {
  setNotification({ message, type });
  setTimeout(() => setNotification(null), 2500);
};

  useEffect(() => {
  const fetchFamilyDetails = async () => {
    try {
      const token = localStorage.getItem("access");
      const res = await fetch(`http://localhost:8000/api/family/faculty/${id}/details/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Failed to fetch family details");

      const data = await res.json();

      // Find coordinator and supervisor
      const coordinatorMember = data.family_members.find(
        (member: any) => member.role === "أخ أكبر"
      );
      const supervisorMember = data.family_members.find(
        (member: any) => member.role === "أخت كبرى"
      );

      setFamilyData({
        eventId: data.event_id,
        name: data.name,
        totalMembers: data.family_members.length,
        activities: data.family_events.length,
        goals: data.type ? 4 : 0,
        participation: '0%',
        foundingDate: new Date(data.created_at).toLocaleDateString("ar-EG"),
        coordinator: coordinatorMember ? coordinatorMember.student_name : '-',
        supervisor: supervisorMember ? supervisorMember.student_name : '-',
        category: data.type,
        description: data.description,
      });

      setActivitiesData(
        data.family_events.map((event: any) => ({
          name: event.title,
          date: new Date(event.st_date).toLocaleDateString("ar-EG"),
          type: event.type,
          participants: Number(event.cost),
        }))
      );

      setStudentsData(
        data.family_members.map((member: any) => ({
          memberId: member.student_id,
          name: member.student_name,
          id: member.u_id,
          major: member.dept_name,
          role: member.role, 
          joinDate: new Date(member.joined_at).toLocaleDateString("ar-EG"),
        }))
      );

      setGoalsData(['هدف 1', 'هدف 2', 'هدف 3', 'هدف 4']);

    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء جلب تفاصيل الأسرة");
    }
  };

  fetchFamilyDetails();
}, [id]);


  const handleBack = () => router.push('/Family-Faclevel/families-reports');
  const handleRemoveMember = async (memberId: number) => {
  try {
    const token = localStorage.getItem("access");

    const res = await fetch(
      `http://127.0.0.1:8000/api/family/faculty_members/families/${id}/members/${memberId}/`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) throw new Error("Failed to delete member");

    
    setStudentsData(prev =>
      prev.filter(student => student.memberId !== memberId)
    );

    
    setFamilyData(prev => ({
      ...prev,
      totalMembers: prev.totalMembers - 1,
    }));

    
    showNotification("✅ تم حذف الطالب بنجاح", "success");

  } catch (err) {
    console.error(err);

   
    showNotification("❌ فشل حذف الطالب", "error");
  }
};


  // SVG icons
  const icons = {
    members: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <circle cx="12" cy="7" r="4"></circle>
        <path d="M5.5 21a6.5 6.5 0 0113 0"></path>
      </svg>
    ),
    activities: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z"></path>
      </svg>
    ),
    goals: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M12 6v6l4 2"></path>
      </svg>
    ),
    goalItem: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M12 6v6l4 2"></path>
      </svg>
    ),
    activity: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z"></path>
      </svg>
    ),
  };
const handleExport = async () => {
  try {
    const token = localStorage.getItem("access");

    if (!token) {
      showNotification("❌ غير مصرح، يرجى تسجيل الدخول", "error");
      return;
    }

    const res = await fetch(
      `http://localhost:8000/api/family/faculty/${id}/export/`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "*/*",
        },
      }
    );

    if (!res.ok) {
      throw new Error("Export failed");
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `family_${familyData.name}.pdf`;
    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);

    showNotification("✅ تم تصدير ملف PDF بنجاح", "success");
  } catch (error) {
    console.error(error);
    showNotification("❌ فشل تصدير ملف PDF", "error");
  }
};

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
          <h1 className={styles.detailsTitle}>تفاصيل الأسرة: {familyData.name}</h1>
          <div className={styles.headerActions}>
           <button
              className={`${styles.actionBtn} ${styles.export}`}
              onClick={handleExport}
            >
              <span className={styles.btnIcon}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 5v14m7-7H5"></path>
                </svg>
              </span>
              تصدير
            </button>
            <button className={`${styles.actionBtn} ${styles.print}`}>
              <span className={styles.btnIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M6 9V2h12v7M6 18h12v4H6v-4z"></path>
                  <rect x="6" y="14" width="12" height="4"></rect>
                </svg>
              </span>طباعة
            </button>
            <button 
              className={`${styles.actionBtn} ${styles.back}`} 
              onClick={handleBack}
            >
              <span className={styles.btnIcon}>←</span>
              العودة للقائمة
            </button>
          </div>
        </header>

        {/* --- Statistics Cards --- */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.members}`}>{icons.members}</div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{familyData.totalMembers}</div>
              <div className={styles.statLabel}>إجمالي الأعضاء</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.activities}`}>{icons.activities}</div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{familyData.activities}</div>
              <div className={styles.statLabel}>الأنشطة المنجزة</div>
            </div>
          </div>
        </div>

        {/* --- Content Grid --- */}
        <div className={styles.contentGrid}>
          <div className={styles.infoCard}>
            <h2 className={styles.cardTitle}>معلومات عامة</h2>
            <div className={styles.infoList}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>تاريخ التأسيس:</span>
                <span className={styles.infoValue}>{familyData.foundingDate}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>الاخ الأكبر:</span>
                <span className={styles.infoValue}>{familyData.coordinator}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>الاخت الكبري:</span>
                <span className={styles.infoValue}>{familyData.supervisor}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>الفئة:</span>
                <span className={styles.infoValue}>{familyData.category}</span>
              </div>
            </div>
          </div>

 {/* --- Activities --- */}
        <div className={styles.activitiesCard}>
          <h2 className={styles.cardTitle}>الأنشطة والفعاليات</h2>
          <div className={styles.activitiesList}>
            {activitiesData.map((act, idx) => (
              <div key={idx} className={styles.activityItem}>
                <div className={styles.activityHeader}>
                  <div className={styles.activityInfo}>
                    <div className={styles.activityIcon}>{icons.activity}</div>
                    <div>
                      <h3 className={styles.activityName}>{act.name}</h3>
                      <p className={styles.activityDate}>{act.date}</p>
                    </div>
                  </div>
                  <div className={styles.activityMeta}>
                    <span className={styles.activityType}>{act.type}</span>
                    <span className={styles.activityParticipants}>{act.participants} مشارك</span>
                  </div>
                </div>
                            {/* view details row */}
              <div className={styles.detailsRow}>
                <button className={styles.viewDetailsBtn} 
                title="عرض جميع تفاصيل الفعالية"
                onClick={() => router.push(`/Family-Faclevel/families-reports/${id}/${act.eventId}`)}
                >
                  <span className={styles.btnIcon}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="12" r="3"></circle>
                      <path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z"></path>
                    </svg>
                  </span>
                  عرض التفاصيل الكاملة
                </button>
              </div>
              </div>
            ))}
          </div>
        </div>
          {/* <div className={styles.infoCard}>
            <h2 className={styles.cardTitle}>أهداف الأسرة</h2>
            <ul className={styles.goalsList}>
              {goalsData.map((goal, idx) => (
                <li key={idx} className={styles.goalItem}>
                  <span className={styles.goalIcon}>{icons.goalItem}</span>{goal}
                </li>
              ))}
            </ul>
          </div> */}
        </div>

        {/* --- Description --- */}
        <div className={styles.descriptionCard}>
          <h2 className={styles.cardTitle}>وصف الأسرة</h2>
          <p className={styles.descriptionText}>{familyData.description}</p>
        </div>

        {/* --- Students Table --- */}
        <div className={styles.studentsCard}>
          <h2 className={styles.cardTitle}>الطلاب المسجلون</h2>
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
                      <button className={styles.deleteBtn} title="حذف"  onClick={() => handleRemoveMember(student.memberId)}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          viewBox="0 0 24 24"
                        >
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6l-1 14H6L5 6"></path>
                          <path d="M10 11v6"></path>
                          <path d="M14 11v6"></path>
                        </svg>
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
