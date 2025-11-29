"use client";

import Header from "@/app/FacLevel/components/Header";
import Footer from "@/app/FacLevel/components/Footer";

import ReportCard from "../families-reports/components/reports";
import styles from "../families-reports/styles/report.module.css";

export default function FamilyReportsPage() {
  const families = [
    {
      id: 1,
      name: "أسرة التقنية والابتكار",
      coordinator: "فاطمة سعد الأحمد",
      supervisor: "أحمد محمد العلي",
      membersCount: 85,
      foundingDate: "الجمعة، 30 صفر 1445 هـ",
      category: "فني",
      goals: 4,
      activities: 3,
      enrolled: 2,
    },
    {
      id: 2,
      name: "أسرة الأدب والثقافة",
      coordinator: "نورا عبدالعزيز المطيري",
      supervisor: "عبدالرحمن خالد النصار",
      membersCount: 65,
      foundingDate: "الأحد، 11 ربيع الأول 1445 هـ",
      category: "ثقافي",
      goals: 4,
      activities: 3,
      enrolled: 1,
    },
  ];

  return (
    <div className={styles.pageWrapper}>
     <Header />
    <div className={styles.reportsPage}>
   

      <div className={styles.pageHeaderReports}>
        <h1 className={styles.pageTitleReports}>تقارير الأسر الطلابية</h1>
        <div className={styles.registeredBadge}>
          <span className={styles.badgeText}>{families.length} أسرة مسجلة</span>
        </div>
      </div>

      <div className={styles.reportsList}>
        {families.map((family) => (
          <ReportCard key={family.id} family={family} />
        ))}
      </div>
    </div>

     <Footer />
    </div>
  );
}
