"use client";
import React, { useState } from "react";
import Image from "next/image";
import styles from "@/app/Styles/components/activitiesGallery.module.css";
import photo from "@/app/assets/news6.jpeg";

const galleryItems = [
  { id: 1, category: "رياضي", description: "بطولة كرة القدم بين الكليات", image: photo },
  { id: 2, category: "ثقافي", description: "المعرض الثقافي الجامعي", image: photo },
  { id: 3, category: "علمي", description: "ندوة علمية عن الابتكار والتكنولوجيا", image: photo },
  { id: 4, category: "اجتماعي", description: "حفل استقبال الطلاب الجدد", image: photo },
  { id: 5, category: "فني", description: "عرض المسرح الجامعي السنوي", image: photo },
  { id: 6, category: "أسر طلابية", description: "لقاء أسر طلابية حول العمل التطوعي", image: photo },
  { id: 7, category: "رياضي", description: "بطولة تنس الطاولة بين الكليات", image: photo },
  { id: 8, category: "علمي", description: "الملتقى العلمي السنوي", image: photo },
  { id: 9, category: "فني", description: "مهرجان المسرح الجامعي", image: photo },
];

export default function GallerySection() {
  const [visibleCount, setVisibleCount] = useState(6);

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 3, galleryItems.length));
  };

  return (
    <section className={styles.gallerySection} dir="rtl">
      <div className={styles.containerCard}>
        <h2 className={styles.title}>معرض صور الأنشطة</h2>
        <p className={styles.subtitle}>لحظات مميزة من فعاليات وأنشطة الجامعة</p>

        <div className={styles.galleryGrid}>
          {galleryItems.slice(0, visibleCount).map((item) => (
            <div key={item.id} className={styles.imageCard}>
              <div className={styles.imageWrapper}>
                <Image
                  src={item.image}
                  alt={item.description}
                  width={400}
                  height={300}
                  className={styles.image}
                />
                <div className={styles.overlay}>
                  <h3>{item.category}</h3>
                  <p>{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {visibleCount < galleryItems.length && (
          <button onClick={handleLoadMore} className={styles.loadMoreBtn}>
            عرض المزيد من الصور
          </button>
        )}
      </div>
    </section>
  );
}
