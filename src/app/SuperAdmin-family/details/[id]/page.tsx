'use client';

import { useState, useEffect } from 'react';
import Tabs from './Tabs';
import styles from './deatails.module.css';
import { useRouter, useParams } from 'next/navigation';

export default function FamilyDetailsPage() {
  const router = useRouter();
  const { id } = useParams();

  const [activeTab, setActiveTab] = useState('members');
  const [family, setFamily] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Notification state
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

  // Show notification helper
  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "success" });
    }, 2500);
  };

  const tabs = [
    { id: 'members', label: 'الأعضاء' },
    { id: 'events', label: 'الفعاليات' },
  ];

  // Helper function to get event status badge style
  const getEventStatusStyle = (status: string) => {
    switch (status) {
      case 'مقبول':
        return {
          backgroundColor: '#D4F4DD',
          color: '#2E7D32',
        };
      case 'منتظر':
        return {
          backgroundColor: '#FFF3E0',
          color: '#E65100',
        };
      case 'مرفوض':
        return {
          backgroundColor: '#FFE0E0',
          color: '#C62828',
        };
      default:
        return {
          backgroundColor: '#F5F5F5',
          color: '#666',
        };
    }
  };

  // Helper function to get family status badge style
  const getFamilyStatusStyle = (status: string) => {
    switch (status) {
      case 'مقبول':
        return {
          backgroundColor: '#D4F4DD',
          color: '#2E7D32',
        };
      case 'منتظر':
        return {
          backgroundColor: '#FFF3E0',
          color: '#E65100',
        };
      case 'مرفوض':
        return {
          backgroundColor: '#FFE0E0',
          color: '#C62828',
        };
      default:
        return {
          backgroundColor: '#F5F5F5',
          color: '#666',
        };
    }
  };

  useEffect(() => {
    if (!id) return;

    const fetchFamily = async () => {
      try {
        const token = localStorage.getItem('access');

        const res = await fetch(
          `http://localhost:8000/api/family/super_dept/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!res.ok) {
          throw new Error('فشل في تحميل بيانات الأسرة');
        }

        const data = await res.json();
        setFamily(data);
      } catch (error) {
        console.error('Error fetching family:', error);
        showNotification('فشل في تحميل بيانات الأسرة', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchFamily();
  }, [id]);

  if (loading) return <p className={styles.loadingText}>جاري التحميل...</p>;
  if (!family) return <p className={styles.loadingText}>لا توجد بيانات</p>;

  return (
    <div className={styles.pageContainer}>
      {/* Notification */}
      {notification.show && (
        <div className={`${styles.notification} ${styles[notification.type]}`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className={styles.header}>
        <button
          className={styles.closeButton}
          onClick={() => router.back()}
        >
          ✕
        </button>

        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>{family.name}</h1>
            <span 
              className={styles.statusBadge}
              style={getFamilyStatusStyle(family.status)}
            >
              {family.status}
            </span>
          </div>

          <p className={styles.description}>
            {family.description}
          </p>
        </div>
      </div>

      {/* Info Cards */}
      <div className={styles.infoCards}>
        <div className={styles.infoCard}>
          <span className={styles.infoLabel}>
            {family.faculty_name}
          </span>
        </div>

        <div className={styles.infoCard}>
          <span className={styles.infoValue}>
            {family.family_members.length}
          </span>
          <span className={styles.infoLabel}>عضو</span>
        </div>

        <div className={styles.infoCard}>
          <span className={styles.infoLabel}>نوع الأسرة:</span>
          <span className={styles.infoBadge}>
            {family.type}
          </span>
        </div>

        <div className={styles.infoCard}>
          <span className={styles.infoLabel}>تأسست في</span>
          <span className={styles.infoValue}>
            {new Date(family.created_at).toLocaleDateString(
              'ar-EG'
            )}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* ================= Members ================= */}
      {activeTab === 'members' && (
        <div className={styles.contentArea}>
          {family.family_members.length === 0 ? (
            <div className={styles.emptyStateContainer}>
              <p className={styles.emptyStateText}>لا توجد أعضاء حالياً</p>
            </div>
          ) : (
            <div className={styles.tableContainer}>
              <table className={styles.membersTable}>
                <thead>
                  <tr>
                    <th>الاسم</th>
                    <th>الرقم الجامعي</th>
                    <th>الرقم القومي</th>
                    <th>اللجنة</th>
                    <th>المنصب</th>
                    <th>الحالة</th>
                    <th>تاريخ الانضمام</th>
                  </tr>
                </thead>
                <tbody>
                  {family.family_members.map((m: any) => (
                    <tr key={m.student_id}>
                      <td data-label="الاسم">{m.student_name}</td>
                      <td data-label="الرقم الجامعي">{m.u_id}</td>
                      <td data-label="الرقم القومي">{m.national_id}</td>
                      <td data-label="اللجنة">{m.dept_name ?? '—'}</td>
                      <td data-label="المنصب">{m.role}</td>
                      <td data-label="الحالة">
                        <span className={styles.statusCell}>{m.status}</span>
                      </td>
                      <td data-label="تاريخ الانضمام">
                        {new Date(m.joined_at).toLocaleDateString('ar-EG')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ================= Events ================= */}
      {activeTab === 'events' && (
        <div className={styles.contentArea}>
          <h2 className={styles.sectionTitle}>
            فعاليات الأسرة
          </h2>

          {family.family_events.length === 0 ? (
            <div className={styles.emptyStateContainer}>
              <p className={styles.emptyStateText}>لا توجد فعاليات حالياً</p>
            </div>
          ) : (
            <div className={styles.eventsGrid}>
              {family.family_events.map((event: any) => (
                <div
                  key={event.event_id}
                  className={styles.eventCard}
                >
                  <div className={styles.eventHeader}>
                    <h3 className={styles.eventTitle}>
                      {event.title}
                    </h3>
                    <span 
                      className={styles.eventStatusBadge}
                      style={getEventStatusStyle(event.status)}
                    >
                      {event.status}
                    </span>
                  </div>

                  <div className={styles.eventMeta}>
                    <span>{event.st_date}</span>
                    <span>{event.cost} جنيه</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}