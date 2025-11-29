"use client";

import React from "react";
import Header from "@/app/FacLevel/components/Header";
import Footer from "@/app/FacLevel/components/Footer";
import ActivityCard from "./components/ActivityCard";
import styles from "./styles/Activities.module.css";

const activities = [
  {
    title: "ورشة البرمجة المتقدمة",
    subtitle: "منظم بواسطة: أسرة التقنية",
    description: "ورشة عمل تفاعلية حول أحدث تقنيات البرمجة والذكاء الاصطناعي",
    date: "1447/8/15 هـ",
    time: "14:00",
    location: "قاعة المحاضرات الكبرى",
    participants: "75 مشارك متوقع",
    type: "علمي",
  },
  {
    title: "مسابقة الشعر العربي",
    subtitle: "منظم بواسطة: أسرة الأدب",
    description: "مسابقة شعرية بين طلاب الجامعة في مختلف أنواع الشعر العربي",
    date: "1447/8/20 هـ",
    time: "19:00",
    location: "المسرح الجامعي",
    participants: "150 مشارك متوقع",
    type: "ثقافي",
  },
  {
    title: "دوري كرة القدم",
    subtitle: "منظم بواسطة: أسرة الرياضة",
    description: "بطولة كرة القدم السنوية بين الأسر الطلابية",
    date: "1447/8/25 هـ",
    time: "16:00",
    location: "الملعب الرئيسي",
    participants: "200 مشارك متوقع",
    type: "رياضي",
  },
  {
    title: "ورشة البرمجة المتقدمة",
    subtitle: "منظم بواسطة: أسرة التقنية",
    description: "ورشة عمل تفاعلية حول أحدث تقنيات البرمجة والذكاء الاصطناعي",
    date: "1447/8/15 هـ",
    time: "14:00",
    location: "قاعة المحاضرات الكبرى",
    participants: "75 مشارك متوقع",
    type: "علمي",
  },
  {
    title: "مسابقة الشعر العربي",
    subtitle: "منظم بواسطة: أسرة الأدب",
    description: "مسابقة شعرية بين طلاب الجامعة في مختلف أنواع الشعر العربي",
    date: "1447/8/20 هـ",
    time: "19:00",
    location: "المسرح الجامعي",
    participants: "150 مشارك متوقع",
    type: "ثقافي",
  },
  {
    title: "دوري كرة القدم",
    subtitle: "منظم بواسطة: أسرة الرياضة",
    description: "بطولة كرة القدم السنوية بين الأسر الطلابية",
    date: "1447/8/25 هـ",
    time: "16:00",
    location: "الملعب الرئيسي",
    participants: "200 مشارك متوقع",
    type: "رياضي",
  },
  {
    title: "ورشة البرمجة المتقدمة",
    subtitle: "منظم بواسطة: أسرة التقنية",
    description: "ورشة عمل تفاعلية حول أحدث تقنيات البرمجة والذكاء الاصطناعي",
    date: "1447/8/15 هـ",
    time: "14:00",
    location: "قاعة المحاضرات الكبرى",
    participants: "75 مشارك متوقع",
    type: "علمي",
  },
  {
    title: "مسابقة الشعر العربي",
    subtitle: "منظم بواسطة: أسرة الأدب",
    description: "مسابقة شعرية بين طلاب الجامعة في مختلف أنواع الشعر العربي",
    date: "1447/8/20 هـ",
    time: "19:00",
    location: "المسرح الجامعي",
    participants: "150 مشارك متوقع",
    type: "ثقافي",
  },
  {
    title: "دوري كرة القدم",
    subtitle: "منظم بواسطة: أسرة الرياضة",
    description: "بطولة كرة القدم السنوية بين الأسر الطلابية",
    date: "1447/8/25 هـ",
    time: "16:00",
    location: "الملعب الرئيسي",
    participants: "200 مشارك متوقع",
    type: "رياضي",
  },
];

export default function ActivitiesPage() {
  return (
    <div className={styles.pageWrapper}>
      <Header />

      <main className={styles.container}>
        {/* Page header */}
        <div className={styles.pageHeader}>
          <h1 className={styles.mainTitle}>اعتماد الفعاليات</h1>
          <span className={styles.badgeWaiting}>{activities.length} فعالية في الانتظار</span>
        </div>

        {/* Activities grid */}
        <div className={styles.eventsContainer}>
          {activities.map((activity, index) => (
            <ActivityCard key={index} {...activity} />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
