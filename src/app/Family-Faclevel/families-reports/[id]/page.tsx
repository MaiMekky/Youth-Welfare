"use client";

import React from 'react';
import styles from './details.module.css';
import { useParams, useRouter } from "next/navigation";
import Header from "@/app/FacLevel/components/Header";
import Footer from "@/app/FacLevel/components/Footer";

interface FamilyData {
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
  name: string;
  date: string;
  type: string;
  participants: number;
}

interface Student {
  name: string;
  id: string;
  major: string;
  year: string;
  joinDate: string;
}

export default function FamilyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  console.log("Family ID:", id);

  // Mock database - in production, fetch from API
  const familiesDatabase: Record<string, FamilyData> = {
    "1": {
      name: 'أسرة التقنية والابتكار',
      totalMembers: 85,
      activities: 3,
      goals: 4,
      participation: '78%',
      foundingDate: 'الجمعة، 30 صفر 1445 هـ',
      coordinator: 'أحمد محمد العلي',
      supervisor: 'فاطمة سعد الأحمد',
      category: 'فني',
      description: 'أسرة تركز على تطوير المهارات التقنية والابتكار بين الطلاب',
    },
    "2": {
      name: 'أسرة الأدب والثقافة',
      totalMembers: 65,
      activities: 3,
      goals: 4,
      participation: '72%',
      foundingDate: 'الأحد، 11 ربيع الأول 1445 هـ',
      coordinator: 'عبدالرحمن خالد النصار',
      supervisor: 'نورا عبدالعزيز المطيري',
      category: 'ثقافي',
      description: 'أسرة تركز على تطوير المهارات الأدبية والثقافية بين الطلاب',
    }
  };

  const familyData = familiesDatabase[id] || familiesDatabase["1"];

  const goalsData = [
    'تطوير المهارات التقنية لدى الطلاب',
    'نشر ثقافة الابتكار والإبداع',
    'تنظيم ورش عمل متخصصة في التقنية',
    'بناء شراكات مع الشركات التقنية',
  ];

  const activitiesData: Activity[] = [
    { name: 'ورشة البرمجة المتقدمة', date: 'الجمعة، 10 رجب 1446 هـ', type: 'علمي', participants: 45 },
    { name: 'هاكاثون الابتكار', date: 'الأحد، 5 رجب 1446 هـ', type: 'علمي', participants: 60 },
    { name: 'لقاء تعارفي', date: 'الجمعة، 19 جمادى الآخرة 1446 هـ', type: 'اجتماعي', participants: 70 },
  ];

  const studentsData: Student[] = [
    { name: 'سارة أحمد محمد', id: '202012345', major: 'علوم الحاسب', year: 'السنة 3', joinDate: 'الأحد، 28 صفر 1446 هـ' },
    { name: 'محمد عبدالله السالم', id: '202012346', major: 'هندسة البرمجيات', year: 'السنة 2', joinDate: 'الأحد، 28 صفر 1446 هـ' },
  ];

  const handleBack = () => {
    router.push('/Family-Faclevel/families-reports');
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
    participation: (
       <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M3 3v18h18"></path>
        <path d="M3 14h6v4H3z"></path>
        <path d="M9 10h6v8H9z"></path>
        <path d="M15 6h6v12h-6z"></path>
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

  return (
    <>
      <Header />
      <div className={styles.detailsPage}>
        <header className={styles.detailsHeader}>
          <h1 className={styles.detailsTitle}>تفاصيل الأسرة: {familyData.name}</h1>
          <div className={styles.headerActions}>
            <button className={`${styles.actionBtn} ${styles.export}`}>
              <span className={styles.btnIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M12 5v14m7-7H5"></path>
                </svg>
              </span>تصدير
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

        {/* Statistics Cards */}
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
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.goals}`}>{icons.goals}</div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{familyData.goals}</div>
              <div className={styles.statLabel}>الأهداف المحددة</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.participation}`}>{icons.participation}</div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{familyData.participation}</div>
              <div className={styles.statLabel}>معدل المشاركة</div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
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

          <div className={styles.infoCard}>
            <h2 className={styles.cardTitle}>أهداف الأسرة</h2>
            <ul className={styles.goalsList}>
              {goalsData.map((goal, idx) => (
                <li key={idx} className={styles.goalItem}>
                  <span className={styles.goalIcon}>{icons.goalItem}</span>{goal}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Description */}
        <div className={styles.descriptionCard}>
          <h2 className={styles.cardTitle}>وصف الأسرة</h2>
          <p className={styles.descriptionText}>{familyData.description}</p>
        </div>

        {/* Activities */}
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
              </div>
            ))}
          </div>
        </div>

        {/* Students Table */}
        <div className={styles.studentsCard}>
          <h2 className={styles.cardTitle}>الطلاب المسجلون</h2>
          <div className={styles.tableContainer}>
            <table className={styles.studentsTable}>
              <thead>
                <tr>
                  <th>الاسم</th>
                  <th>الرقم الجامعي</th>
                  <th>التخصص</th>
                  <th>السنة</th>
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
                    <td>{student.year}</td>
                    <td>{student.joinDate}</td>
                    <td>
                      <button className={styles.deleteBtn} title="حذف">
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
