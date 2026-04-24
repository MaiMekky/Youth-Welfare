"use client";
import React, { useEffect, useState } from "react";
import styles from "../styles/RequestDetails.module.css";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";

interface RequestDetailsProps {
  onBack?: () => void;
  onSubmit?: () => void;
}

const RequestDetails: React.FC<RequestDetailsProps> = ({ onBack, onSubmit }) => {
  const [canCreateFam, setCanCreateFam] = useState<boolean>(false);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("access");
        if (!token) {
          setCanCreateFam(false);
          return;
        }

        const res = await authFetch(`${getBaseUrl()}/api/auth/profile/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          setCanCreateFam(false);
          return;
        }

        const data = await res.json();
        setCanCreateFam(data?.can_create_fam === true);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        setCanCreateFam(false);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, []);

  const sections = [
    {
      id: 1,
      title: "مقدمة عن الأسر الطلابية",
      icon: "📄",
      content: (
        <>
          <p className={styles.sectionIntro}>
            الأسرة الطلابية هي وحدة تنظيمية طلابية تهدف إلى تنمية مهارات الطلاب وتعزيز روح العمل الجماعي والمشاركة الفعالة في الأنشطة الطلابية المتنوعة.
          </p>
          <ul className={styles.checklist}>
            <li>تنظيم الأنشطة والفعاليات الطلابية المتنوعة</li>
            <li>تنمية المهارات القيادية والإدارية للطلاب</li>
            <li>تعزيز الانتماء والمشاركة المجتمعية</li>
          </ul>
        </>
      ),
    },
    {
      id: 2,
      title: "الأسرة المركزية",
      icon: "🏛️",
      content: (
        <>
          <p className={styles.sectionIntro}>الأسرة المركزية وحدة تنظيمية شاملة تهدف إلى تنمية مهارات الطلاب في جميع المجالات على مستوى الجامعة.</p>
          <ul className={styles.checklist}>
            <li>تنظيم الأنشطة على مستوى الجامعة</li>
            <li>تنمية المهارات القيادية في جميع المجالات</li>
            <li>تعزيز الانتماء والمشاركة المجتمعية الشاملة</li>
          </ul>
        </>
      ),
    },
    {
      id: 3,
      title: "الأسرة النوعية",
      icon: "🎯",
      content: (
        <>
          <p className={styles.sectionIntro}>الأسرة النوعية وحدة متخصصة تركز على مجال محدد (ثقافي، رياضي، فني، علمي، اجتماعي).</p>
          <ul className={styles.checklist}>
            <li>تنظيم أنشطة متخصصة في المجال المحدد</li>
            <li>اكتشاف وتنمية المواهب التخصصية</li>
            <li>تحقيق التميز والإبداع في مجال الأسرة</li>
          </ul>
        </>
      ),
    },
    {
      id: 4,
      title: "شروط ومتطلبات الإنشاء",
      icon: "✅",
      content: (
        <div className={styles.requirementsList}>
          <p className={styles.sectionSubtitle}>المتطلبات الأساسية:</p>
          <ul className={styles.bulletList}>
            <li>تحديد اسم الأسرة وأهدافها بشكل واضح</li>
            <li>تشكيل مجلس إدارة كامل (9 أعضاء)</li>
            <li>تحديد اللجان النوعية وأعضائها (7 لجان)</li>
            <li>وجود رائد أكاديمي من هيئة التدريس</li>
          </ul>
        </div>
      ),
    },
    {
      id: 5,
      title: "هيكل مجلس الإدارة",
      icon: "👥",
      content: (
        <div className={styles.structureLayout}>
          <div className={styles.roleColumn}>
            <p className={styles.columnTitle}>أعضاء مجلس الإدارة (9 أعضاء)</p>
            <ul className={styles.bulletList}>
              <li>قائد الأسرة</li>
              <li>نائب القائد</li>
              <li>مسؤول الأسرة</li>
              <li>أمين الصندوق</li>
              <li>الأمين العام</li>
              <li>سكرتير / أمين السر</li>
              <li>الأخ الأكبر</li>
              <li>عضو منتخب (1)</li>
              <li>عضو منتخب (2)</li>
            </ul>
          </div>
          <div className={styles.committeeColumn}>
            <p className={styles.columnTitle}>اللجان النوعية (7 لجان)</p>
            <ul className={styles.bulletList}>
              <li>اللجنة الثقافية</li>
              <li>اللجنة الرياضية</li>
              <li>اللجنة الاجتماعية والرحلات</li>
              <li>اللجنة الفنية</li>
              <li>اللجنة العلمية</li>
              <li>لجنة الخدمة العامة</li>
              <li>لجنة صحف الحائط</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 6,
      title: "خطوات التقديم والمراجعة",
      icon: "✔️",
      content: (
        <ol className={styles.stepList}>
          <li className={styles.stepItem}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <span className={styles.stepTitle}>تعبئة طلب الإنشاء</span>
              <p>تعبئة جميع البيانات والمستندات المطلوبة بدقة</p>
            </div>
          </li>
          <li className={styles.stepItem}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <span className={styles.stepTitle}>مراجعة إدارة رعاية الطلاب</span>
              <p>سيتم مراجعة الطلب والتحقق من استيفاء الشروط</p>
            </div>
          </li>
          <li className={styles.stepItem}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <span className={styles.stepTitle}>الموافقة وتفعيل الأسرة</span>
              <p>بعد الموافقة، سيتم تفعيل الأسرة وإتاحتها للطلاب</p>
            </div>
          </li>
        </ol>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      {/* Hero Header */}
      <div className={styles.heroHeader}>
        <h1 className={styles.heroTitle}>طلب إنشاء أسرة طلابية</h1>
        <div className={styles.heroSeparator} />
        <p className={styles.heroSubtitle}>
          تعرف على خطوات ومتطلبات إنشاء أسرة طلابية جديدة
        </p>
      </div>

      {/* Content Grid */}
      <div className={styles.contentGrid}>
        {sections.map((section) => (
          <div key={section.id} className={styles.sectionCard}>
            <div className={styles.cardHeader}>
              <span className={styles.cardIcon}>{section.icon}</span>
              <h2 className={styles.cardTitle}>{section.title}</h2>
            </div>
            <div className={styles.cardBody}>{section.content}</div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className={styles.actionFooter}>
        <button className={styles.btnBack} onClick={onBack ?? (() => window.history.back())}>
          العودة
        </button>

        {loadingProfile && <div className={styles.btnSkeleton} aria-hidden="true" />}

        {!loadingProfile && canCreateFam && (
          <button className={styles.btnSubmit} onClick={onSubmit}>
            <span className={styles.submitIcon}>+</span>
            تقديم طلب الإنشاء
          </button>
        )}
      </div>
    </div>
  );
};

export default RequestDetails;