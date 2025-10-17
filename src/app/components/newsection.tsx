"use client";
import React from "react";
import styles from "../Styles/components/newsection.module.css";
import Image from "next/image";

// ✅ Import your images from /src/assets
import news1 from "@/app/assets/news1.jpeg";
import news2 from "@/app/assets/news2.jpeg";
import news3 from "@/app/assets/news3.jpeg";
import news4 from "@/app/assets/news4.jpeg";
import news5 from "@/app/assets/news5.jpeg";
import news6 from "@/app/assets/news6.jpeg";

const newsItems = [
  {
    id: 1,
    title: "إعلان نتائج مسابقة البحث العلمي للطلاب 2024",
    date: "15 مارس 2024",
    description:
      "تعلن إدارة رعاية الشباب عن نتائج مسابقة البحث العلمي السنوية للطلاب. تم اختيار 15 مشروعًا من أصل 120 مشروعًا مشاركًا.",
    image: news1,
  },
  {
    id: 2,
    title: "بطولة كرة القدم بين الكليات",
    date: "10 مارس 2024",
    description:
      "انطلقت فعاليات بطولة كرة القدم السنوية بين كليات الجامعة بمشاركة واسعة من الطلاب.",
    image: news2,
  },
  {
    id: 3,
    title: "ندوة توعوية حول الصحة النفسية",
    date: "1 مارس 2024",
    description:
      "نظمت الجامعة ندوة تثقيفية حول أهمية الصحة النفسية لطلاب الجامعات بمشاركة نخبة من الأطباء.",
    image: news3,
  },
  {
    id: 4,
    title: "حفل تكريم الطلاب المتميزين",
    date: "20 فبراير 2024",
    description:
      "أقامت إدارة رعاية الشباب حفلاً لتكريم الطلاب المتميزين في الأنشطة الطلابية والعلمية.",
    image: news4,
  },
  {
    id: 5,
    title: "إطلاق مبادرة جامعة خضراء",
    date: "5 فبراير 2024",
    description:
      "تم إطلاق مبادرة جامعة خضراء التي تهدف إلى زيادة الوعي البيئي وتشجيع الممارسات المستدامة داخل الحرم الجامعي.",
    image: news5,
  },
  {
    id: 6,
    title: "ورشة تدريبية حول ريادة الأعمال",
    date: "25 يناير 2024",
    description:
      "نُظمت ورشة تدريبية لتعزيز مهارات ريادة الأعمال لدى طلاب الجامعة بالتعاون مع خبراء محليين.",
    image: news6,
  },
];

const NewsSection = () => {
  return (
    <section className={styles.newsSection}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>آخر الأخبار والإعلانات</h2>
          <p className={styles.subtitle}>
            تابع أحدث الأخبار والفعاليات في جامعة حلوان
          </p>
        </div>

        {/* Responsive Grid */}
        <div className={styles.grid}>
          {newsItems.map((item) => (
            <div key={item.id} className={styles.card}>
              <div className={styles.imageWrapper}>
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className={styles.image}
                />
              </div>
              <div className={styles.content}>
                <div className={styles.date}>
                  <span>{item.date}</span>
                  <span className={styles.icon}>📅</span>
                </div>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.text}>{item.description}</p>
                <a href="#" className={styles.readMore}>
                  اقرأ المزيد ←
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
