"use client";

import React from "react";
import { useRouter } from "next/navigation";
import CreateEventForm from "../components/CreateEventForm";
import styles from "../styles/CreateEventPage.module.css";
import { ArrowRight } from "lucide-react";
import Header from "@/app/FacLevel/components/Header";
import Footer from "@/app/FacLevel/components/Footer";

export default function CreateEventPage() {
  const router = useRouter();

  return (
    <div className={styles.page} dir="rtl">
        <Header />
      <div className={styles.container}>
        <div className={styles.topBar}>
          <div className={styles.headText}>
            <h1 className={styles.pageTitle}>إنشاء فعالية جديدة</h1>
            <p className={styles.pageSubtitle}>
              أدخل تفاصيل الفعالية الجديدة (فعالية داخلية على مستوى القسم)
            </p>
          </div>

          <button className={styles.backBtn} type="button" onClick={() => router.back()}>
            <ArrowRight size={18} />
            رجوع
          </button>
        </div>

        <CreateEventForm />
      </div>
      <Footer />
    </div>
  );
}
