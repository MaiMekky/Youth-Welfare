"use client";
import React, { useState } from "react";
import Image from "next/image";
import styles from "@/app/Styles/components/activites.module.css";
import photo from "@/app/assets/IMG-20251014-WA0013.jpg";

import { StaticImageData } from "next/image";

type Activity = {
  id: number;
  title: string;
  date: string;
  category: string;
  description: string;
  imageUrl: StaticImageData;
};

const categories = [
  { label: "جميع الأنشطة", value: "all", icon: "☀️" },
  { label: "فني", value: "فني", icon: "🎨" },
  { label: "ثقافي", value: "ثقافي", icon: "📚" },
  { label: "رياضي", value: "رياضي", icon: "⚽" },
  { label: "اجتماعي", value: "اجتماعي", icon: "🤝" },
  { label: "علمي", value: "علمي", icon: "🔬" },
  { label: "أسر طلابية", value: "أسر طلابية", icon: "👥" },
  { label: "تكافل اجتماعي", value: "تكافل اجتماعي", icon: "💖" },
];

// 🧩 19 sample activities
const activitiesData: Activity[] = [
  {
    id: 1,
    title: "بطولة كرة القدم بين الكليات",
    date: "10 مارس 2024",
    category: "رياضي",
    description: "انطلقت فعاليات بطولة كرة القدم بمشاركة واسعة من طلاب الكليات.",
    imageUrl: photo,
  },
  {
    id: 2,
    title: "معرض الفنون التشكيلية السنوي",
    date: "22 مارس 2024",
    category: "فني",
    description: "عرض الطلاب أعمالهم الفنية المميزة في قاعة الأنشطة المركزية.",
    imageUrl: photo,
  },
  {
    id: 3,
    title: "اليوم الثقافي العربي",
    date: "5 أبريل 2024",
    category: "ثقافي",
    description: "فعاليات متنوعة لتعريف الطلاب بثقافات الدول العربية المختلفة.",
    imageUrl: photo,
  },
  {
    id: 4,
    title: "حملة تبرع بالدم",
    date: "14 أبريل 2024",
    category: "اجتماعي",
    description: "نظمت الجامعة حملة تبرع بالدم بالتعاون مع وزارة الصحة.",
    imageUrl: photo,
  },
  {
    id: 5,
    title: "مسابقة المشاريع العلمية",
    date: "2 مايو 2024",
    category: "علمي",
    description: "تنافس الطلاب في عرض مشاريعهم البحثية المبتكرة.",
    imageUrl: photo,
  },
  {
    id: 6,
    title: "يوم الأسرة الجامعية",
    date: "9 مايو 2024",
    category: "أسر طلابية",
    description: "أمسية مميزة جمعت أعضاء الأسر الطلابية في فعاليات ترفيهية.",
    imageUrl: photo,
  },
  {
    id: 7,
    title: "ندوة التكافل الاجتماعي",
    date: "20 مايو 2024",
    category: "تكافل اجتماعي",
    description: "محاضرة حول أهمية التكافل ودور الطلاب في خدمة المجتمع.",
    imageUrl: photo,
  },
  {
    id: 8,
    title: "بطولة تنس الطاولة",
    date: "25 مايو 2024",
    category: "رياضي",
    description: "منافسة قوية بين الكليات على لقب بطولة تنس الطاولة.",
    imageUrl: photo,
  },
  {
    id: 9,
    title: "أمسية شعرية طلابية",
    date: "28 مايو 2024",
    category: "ثقافي",
    description: "عرض مجموعة من الطلبة مواهبهم الشعرية والأدبية.",
    imageUrl: photo,
  },
  {
    id: 10,
    title: "ورشة عمل في الرسم الرقمي",
    date: "3 يونيو 2024",
    category: "فني",
    description: "تعلم الطلاب أساسيات الرسم الرقمي باستخدام التابلت.",
    imageUrl: photo,
  },
  {
    id: 11,
    title: "ندوة عن الطاقة المتجددة",
    date: "10 يونيو 2024",
    category: "علمي",
    description: "محاضرة علمية عن مستقبل الطاقة النظيفة والبديلة.",
    imageUrl: photo,
  },
  {
    id: 12,
    title: "رحلة خيرية إلى دار الأيتام",
    date: "15 يونيو 2024",
    category: "تكافل اجتماعي",
    description: "زيارة إنسانية تخللها توزيع هدايا وترفيه للأطفال.",
    imageUrl: photo,
  },
  {
    id: 13,
    title: "ماراثون الجامعة الرياضي",
    date: "1 يوليو 2024",
    category: "رياضي",
    description: "مئات الطلاب شاركوا في سباق الجري السنوي.",
    imageUrl: photo,
  },
  {
    id: 14,
    title: "المعرض العلمي المفتوح",
    date: "10 يوليو 2024",
    category: "علمي",
    description: "عرض الطلاب اختراعاتهم وأفكارهم العلمية أمام لجنة تحكيم.",
    imageUrl: photo,
  },
  {
    id: 15,
    title: "مهرجان المسرح الجامعي",
    date: "20 يوليو 2024",
    category: "فني",
    description: "قدّم الطلاب عروضًا مسرحية شيقة وسط تفاعل جماهيري.",
    imageUrl: photo,
  },
  {
    id: 16,
    title: "اليوم العالمي للتطوع",
    date: "12 أغسطس 2024",
    category: "اجتماعي",
    description: "مبادرات طلابية لخدمة البيئة والمجتمع.",
    imageUrl: photo,
  },
  {
    id: 17,
    title: "مسابقة الخط العربي",
    date: "22 أغسطس 2024",
    category: "ثقافي",
    description: "إبراز مهارات الطلاب في فنون الخط العربي والزخرفة.",
    imageUrl: photo,
  },
  {
    id: 18,
    title: "يوم العلوم المفتوح للأطفال",
    date: "10 سبتمبر 2024",
    category: "علمي",
    description: "تجارب علمية مبسطة للأطفال بمشاركة طلاب الكلية.",
    imageUrl: photo,
  },
  {
    id: 19,
    title: "اليوم الفني المفتوح",
    date: "25 سبتمبر 2024",
    category: "فني",
    description: "عرض حر لأعمال الفن والرسم والتصوير من جميع الكليات.",
    imageUrl: photo,
  },
];

export default function ActivitiesSection() {
  const [filtered, setFiltered] = useState<Activity[]>(activitiesData);
  const [visibleCount, setVisibleCount] = useState(6);
  const [activeCategory, setActiveCategory] = useState("all");

  const handleFilter = (cat: string) => {
    setActiveCategory(cat);
    setVisibleCount(6);
    if (cat === "all") setFiltered(activitiesData);
    else setFiltered(activitiesData.filter((a) => a.category === cat));
  };

  const handleLoadMore = () => setVisibleCount((prev) => prev + 6);

  return (
    <section className={styles.activitiesSection} dir="rtl">
      <div className={styles.container}>
        <h2 id="activities" className={styles.title}>الأنشطة والفعاليات</h2>
        <p className={styles.subtitle}>
          اكتشف مجموعة متنوعة من الأنشطة والفعاليات التي تناسب اهتماماتك الأكاديمية والاجتماعية
        </p>

        <div className={styles.filterButtons}>
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => handleFilter(cat.value)}
              className={`${styles.filterBtn} ${
                activeCategory === cat.value ? styles.active : ""
              }`}
            >
              <span>{cat.icon}</span> {cat.label}
            </button>
          ))}
        </div>

        <p className={styles.count}>عدد الأنشطة المتاحة: {filtered.length}</p>

        <div className={styles.grid}>
          {filtered.slice(0, visibleCount).map((a) => (
            <div key={a.id} className={styles.card}>
              <div className={styles.imageWrapper}>
                <Image
                  src={a.imageUrl}
                  alt={a.title}
                  width={500}
                  height={300}
                  className={styles.image}
                />
                <span className={styles.categoryBadge}>{a.category}</span>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.dateRow}>
                  <span>{a.date}</span> <span>📅</span>
                </div>
                <h3 className={styles.cardTitle}>{a.title}</h3>
                <p className={styles.cardDesc}>{a.description}</p>
                <a href="#" className={styles.moreLink}>
                  ← اقرأ المزيد
                </a>
              </div>
            </div>
          ))}
        </div>

        {visibleCount < filtered.length && (
          <div className={styles.loadMoreWrapper}>
            <button onClick={handleLoadMore} className={styles.loadMoreBtn}>
              عرض المزيد ↓
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

