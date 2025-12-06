// app/family-details/page.tsx
'use client';

import { useState } from 'react';
import Tabs from './Tabs';
import styles from './deatails.module.css';
import { useRouter } from 'next/navigation';

export default function FamilyDetailsPage() {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'نظرة عامة' },
    { id: 'members', label: 'الأعضاء' }
  ];
const router = useRouter();
  return (
    <div className={styles.pageContainer}>
      {/* Header Section */}
      <div className={styles.header}>
        <button className={styles.closeButton} onClick={() => router.back()}>✕</button>
        
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>أسرة إعادة التدوير الإبداعي</h1>
            <span className={styles.statusBadge}>في الانتظار</span>
          </div>
          
          <p className={styles.description}>
            أسرة تحول المواد المعاد تدويرها إلى منتجات فنية وعملية
          </p>
        </div>
      </div>

      {/* Info Cards */}
      <div className={styles.infoCards}>
        <div className={styles.infoCard}>
          <span className={styles.infoIcon}></span>
          <span className={styles.infoLabel}>على مستوى الجامعة</span>
        </div>
        
        <div className={styles.infoCard}>
          <span className={styles.infoIcon}> <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style={{ color: "#2C3A5F" }}>
          <path d="M16 11c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM8 11c1.657 0 3-1.343 3-3S9.657 5 8 5 5 6.343 5 8s1.343 3 3 3z" />
          <path d="M8 13c-2.67 0-8 1.337-8 4v2h9.5c.634-.744 2.02-2 6.5-2 4.48 0 5.866 1.256 6.5 2H24v-2c0-2.663-5.33-4-8-4H8z" />
        </svg></span>
          <span className={styles.infoValue}>0</span>
          <span className={styles.infoLabel}>عضو</span>
        </div>
        
        <div className={styles.infoCard}>
          <span className={styles.infoIcon}></span>
          <span className={styles.infoLabel}>نوع الأسرة:</span>
          <span className={styles.infoBadge}>صديقة للبيئة</span>
        </div>
        
        <div className={styles.infoCard}>
          <span className={styles.infoIcon}></span>
          <span className={styles.infoLabel}>تأسست في</span>
          <span className={styles.infoValue}>28-01-2024</span>
        </div>
      </div>

      {/* Tabs */}
      <Tabs 
        tabs={tabs} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
      <div className={styles.contentArea}>
       {activeTab === 'overview' && (
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '20px', color: '#2C3A5F' }}>
              أهداف الأسرة
            </h2>
            <p style={{ lineHeight: '1.8', color: '#495057' }}>
              تنمية المواهب الإبداعية والفنية وتوفير منصة للتعبير عن الذات وتطوير المهارات القيادية
            </p>
          </div>
        )}
        </div>

      {/* Tab Content */}
      <div className={styles.contentArea}>
        {activeTab === 'overview' && (
          <div className={styles.overviewContent}>
            <div className={styles.statsSection}>
              <h2 className={styles.sectionTitle}>إحصائيات</h2>
              <div className={styles.statsGrid}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>إجمالي الأعضاء:</span>
                  <span className={styles.statValue}>0</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>مستوى الأسرة:</span>
                  <span className={styles.statValueHighlight}>جامعي</span>
                </div>
              </div>
            </div>

            <div className={styles.infoSection}>
              <h2 className={styles.sectionTitle}>معلومات إضافية</h2>
              <div className={styles.infoGrid}>
                <div className={styles.infoRow}>
                  <span className={styles.infoRowLabel}>أُنشئت بواسطة:</span>
                  <span className={styles.infoRowValue}>إدارة كلية الفنون التطبيقية</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoRowLabel}>تاريخ التأسيس:</span>
                  <span className={styles.infoRowValue}>2024-01-28</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoRowLabel}>نوع الأسرة:</span>
                  <span className={styles.infoBadgeGreen}>صديقة للبيئة</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoRowLabel}>الحالة:</span>
                  <span className={styles.infoBadgeYellow}>في الانتظار</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div className={styles.membersContent}>
            <h2 className={styles.sectionTitle}>الطلاب المشاركون</h2>
            <p className={styles.membersSubtitle}>
              أعضاء الأسرة من جميع كليات جامعة حلوان
            </p>
            
            <table className={styles.membersTable}>
              <thead>
                <tr>
                  <th>الإجراءات</th>
                  <th>تاريخ الانضمام</th>
                  <th>المنصب</th>
                  <th>الكلية</th>
                  <th>رقم الطالب</th>
                  <th>الاسم</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={6} className={styles.emptyState}>
                    لا توجد بيانات متاحة
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}