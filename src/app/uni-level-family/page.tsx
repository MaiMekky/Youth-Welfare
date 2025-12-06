// File: app/page.tsx
"use client";

import React, { useMemo, useState } from "react";
import styles from "./Styles/page.module.css";
import StatsGrid from "./components/StatsGrid";
import Tabs from "./components/Tabs";
import Filters from "./components/Filters";
import AddButton from "./components/AddButton";
import FamiliesGrid from "./components/FamiliesGrid";

export default function Page() {
const [activeTab, setActiveTab] = useState<string>("central");
const [selectedFaculty, setSelectedFaculty] = useState<string>("all");
const [selectedFamilyType, setSelectedFamilyType] = useState<string>("all");


function getStats() {
  const totalFamilies = centralFamilies.length + qualityFamilies.length;
  const centralCount = centralFamilies.length;
  const pendingCount = qualityFamilies.filter(f => f.needsApproval).length;
  const approvalRate = qualityFamilies.length
    ? Math.round(((qualityFamilies.length - pendingCount) / qualityFamilies.length) * 100) + "%"
    : "0%";

  return [
    {
      id: 1,
      label: "إجمالي الأسر",
      value: totalFamilies.toString(),
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style={{ color: "#2C3A5F" }}>
          <path d="M16 11c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM8 11c1.657 0 3-1.343 3-3S9.657 5 8 5 5 6.343 5 8s1.343 3 3 3z" />
          <path d="M8 13c-2.67 0-8 1.337-8 4v2h9.5c.634-.744 2.02-2 6.5-2 4.48 0 5.866 1.256 6.5 2H24v-2c0-2.663-5.33-4-8-4H8z" />
        </svg>
      )
    },
    {
      id: 2,
      label: "الأسر المركزية",
      value: centralCount.toString(),
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style={{ color: "#B38E19" }}>
          <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.103 0-2 .897-2 2v13c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2zM5 20V9h14l.002 11H5z" />
        </svg>
      )
    },
    {
      id: 3,
      label: "طلبات في الانتظار",
      value: pendingCount.toString(),
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style={{ color: "#B38E19" }}>
          <path d="M12 1a11 11 0 100 22 11 11 0 000-22zm1 12.585V6h-2v8h6v-2h-4z" />
        </svg>
      )
    },
    {
      id: 4,
      label: "معدل الموافقة",
      value: approvalRate,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style={{ color: "#B38E19" }}>
          <path d="M3 17h2v4H3v-4zM8 11h2v10H8V11zM13 6h2v15h-2V6zM18 2h2v19h-2V2z" />
        </svg>
      )
    }
  ];
}


const centralFamilies = [
{
id: 1,
title: "أسرة الإبداع والتميز",
description: "أسرة مركزية تهدف إلى تطوير المواهب الإبداع...",
status: "مركزية",
statusColor: "#E8D4F4",
members: 0,
scope: "على مستوى الجامعة",
createdBy: "الإدارة المركزية",
faculty: "الإدارة المركزية"
}
];


const qualityFamilies = [
{
id: 1,
title: "أسرة الطب البشري",
description: "أسرة تجمع طلاب كلية الطب لتبادل الخبرا...",
status: "نوعية",
statusColor: "#D4E8F4",
members: 0,
scope: "على مستوى الجامعة",
createdBy: "إدارة كلية الطب",
faculty: "كلية الطب",
type: "نوعية",
needsApproval: true
},
{
id: 2,
title: "أسرة علوم الحاسوب",
description: "أسرة متخصصة في علوم الحاسوب...",
status: "نوعية",
statusColor: "#D4E8F4",
members: 0,
scope: "على مستوى الجامعة",
createdBy: "إدارة كلية الحاسبات والمع...",
faculty: "كلية الحاسبات",
type: "نوعية",
needsApproval: true
},
{
id: 3,
title: "أسرة إعادة التدوير الإبداعي",
description: "أسرة تحول المواد المعاد تدويرها إلى...",
status: "في الانتظار",
statusColor: "#F5E6B3",
members: 0,
badge: "صديقة للبيئة",
badgeColor: "#D4F4DD",
scope: "على مستوى الجامعة",
createdBy: "إدارة كلية الفنون التطبيق...",
faculty: "كلية الفنون التطبيقية",
type: "أصدقاء البيئة"
}
];

const stats = useMemo(() => getStats(), [centralFamilies, qualityFamilies]);

const faculties = [
"الكل",
"كلية الطب",
"كلية الحاسبات",
"كلية الفنون التطبيقية",
"كلية الهندسة",
"كلية الزراعة"
];


const familyTypes = ["الكل", "نوعية", "أصدقاء البيئة"];


const filteredQualityFamilies = useMemo(() => {
return qualityFamilies.filter((family) => {
const facultyMatch =
selectedFaculty === "all" || selectedFaculty === "الكل" || family.faculty === selectedFaculty;
const typeMatch =
selectedFamilyType === "all" || selectedFamilyType === "الكل" || family.type === selectedFamilyType;
return facultyMatch && typeMatch;
});
}, [selectedFaculty, selectedFamilyType]);

const pendingCount = useMemo(() => {
  return qualityFamilies.filter(f => f.needsApproval).length +
         qualityFamilies.filter(f => f.type === "أصدقاء البيئة" ).length;
}, [qualityFamilies]);


return (
<div className={styles.container}>
<header className={styles.headerCard}>
<h1 className={styles.pageTitle}>إدارة الأسر الطلابية</h1>
<p className={styles.pageSubtitle}>إدارة ومتابعة جميع الأسر الطلابية المركزية والنوعية وأصدقاء البيئة
</p>
</header>

<StatsGrid stats={stats} />

<section className={styles.controlsRow}>
<Tabs activeTab={activeTab} setActiveTab={setActiveTab} pendingCount={pendingCount} />
</section>


<main className={styles.tabContent}>
{activeTab === "central" && (
<div className={styles.contentSection}>
<p className={styles.sectionDescription}>جميع الأسر المركزية التي تديرها الإدارة المركزية</p>
<div style={{ display: "flex", justifyContent: "flex-end" }}>
<AddButton />
</div>


<FamiliesGrid families={centralFamilies} showActions={false} />
</div>
)}


{activeTab === "quality" && (
<div className={styles.contentSection}>
<p className={styles.sectionDescription}>طلبات الأسر النوعية وأصدقاء البيئة الواردة من الكليات</p>


<Filters
faculties={faculties}
familyTypes={familyTypes}
selectedFaculty={selectedFaculty}
setSelectedFaculty={setSelectedFaculty}
selectedFamilyType={selectedFamilyType}
setSelectedFamilyType={setSelectedFamilyType}
/>


<FamiliesGrid families={filteredQualityFamilies} showActions={true} />
</div>
)}
</main>
</div>
);
}

