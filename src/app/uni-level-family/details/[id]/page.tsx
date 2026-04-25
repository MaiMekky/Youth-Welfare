'use client';

import { useState, useEffect } from 'react';
import Tabs from './Tabs';
import styles from './deatails.module.css';
import { useRouter, useParams } from 'next/navigation';
type TabId = 'members' | 'events';
import { useSearchParams } from "next/navigation";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";

interface Tab {
  id: TabId;
  label: string;
}

interface FamilyMember {
  student_id: number;
  student_name: string;
  national_id: number;
  u_id: number;
  role: string;
  status: string;
  joined_at: string;
  dept: number | null;
  dept_name: string | null;
}

interface FamilyEvent {
  event_id: number;
  title: string;
  type: string;
  st_date: string;
  status: string;
  cost: string | null;
}

interface FamilyData {
  family_id: number;
  name: string;
  description: string;
  faculty: number;
  faculty_name: string;
  status: string;
  created_at: string;
  updated_at: string;
  min_limit: number;
  type: string;
  created_by_name: string | null;
  approved_by_name: string | null;
  family_members: FamilyMember[];
  family_events: FamilyEvent[];
}

interface AlertProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
}

/* ── English → Arabic member error translations ── */
const MEMBER_ERROR_TRANSLATIONS: Record<string, string> = {
  "Cannot approve a previously rejected member":
    "لا يمكن قبول عضو تم رفضه مسبقاً",
  "Cannot reject a previously approved member":
    "لا يمكن رفض عضو تم قبوله مسبقاً",
  "Member not found":
    "العضو غير موجود",
  "Member is already approved":
    "العضو مقبول بالفعل",
  "Member is already rejected":
    "العضو مرفوض بالفعل",
  "Unauthorized":
    "غير مصرح لك بهذا الإجراء",
  "Permission denied":
    "ليس لديك صلاحية لتنفيذ هذا الإجراء",
  "Authentication credentials were not provided":
    "لم يتم توفير بيانات المصادقة",
};

function translateMemberError(msg: string): string {
  if (MEMBER_ERROR_TRANSLATIONS[msg]) return MEMBER_ERROR_TRANSLATIONS[msg];
  const key = Object.keys(MEMBER_ERROR_TRANSLATIONS).find((k) =>
    msg.toLowerCase().includes(k.toLowerCase())
  );
  return key ? MEMBER_ERROR_TRANSLATIONS[key] : msg;
}

async function parseMemberApiError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    let raw = "";
    if (typeof data === "string") raw = data;
    else if (data.detail)  raw = data.detail;
    else if (data.message) raw = data.message;
    else if (data.error)   raw = data.error;
    else {
      const messages = Object.values(data)
        .flat()
        .filter((v): v is string => typeof v === "string");
      raw = messages.join(" | ");
    }
    return raw ? translateMemberError(raw) : `خطأ ${response.status}`;
  } catch {
    // fall through
  }
  return `خطأ ${response.status}`;
}

const CustomAlert = ({ message, type, onClose }: AlertProps) => {
  const alertStyles = {
    success: {
      background: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
      border: '2px solid #28a745',
      color: '#155724',
      icon: '✓'
    },
    error: {
      background: 'linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%)',
      border: '2px solid #dc3545',
      color: '#721c24',
      icon: '✕'
    },
    warning: {
      background: 'linear-gradient(135deg, #fff3cd 0%, #ffeeba 100%)',
      border: '2px solid #ffc107',
      color: '#856404',
      icon: '⚠'
    },
    info: {
      background: 'linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%)',
      border: '2px solid #17a2b8',
      color: '#0c5460',
      icon: 'ℹ'
    }
  };

  const currentStyle = alertStyles[type];

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 9999,
      minWidth: '400px',
      maxWidth: '500px',
      background: currentStyle.background,
      border: currentStyle.border,
      borderRadius: '16px',
      padding: '30px',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
      animation: 'slideIn 0.3s ease-out',
      direction: 'rtl',
      fontFamily: "'Cairo', 'Segoe UI', Tahoma, sans-serif"
    }}>
      {/* Backdrop */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        zIndex: -1
      }} onClick={onClose} />

      {/* Icon */}
      <div style={{
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        background: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '30px',
        fontWeight: 'bold',
        color: currentStyle.color,
        margin: '0 auto 20px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
      }}>
        {currentStyle.icon}
      </div>

      {/* Message */}
      <p style={{
        fontSize: '1.1rem',
        fontWeight: 600,
        color: currentStyle.color,
        textAlign: 'center',
        margin: '0 0 25px 0',
        lineHeight: 1.6
      }}>
        {message}
      </p>

      {/* Button */}
      <button
        onClick={onClose}
        style={{
          width: '100%',
          padding: '12px',
          background: currentStyle.color,
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1rem',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          fontFamily: "'Cairo', 'Segoe UI', Tahoma, sans-serif"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        حسناً
      </button>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translate(-50%, -60%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }
      `}</style>
    </div>
  );
};

export default function FamilyDetailsPage() {
  const [activeTab, setActiveTab] = useState<'members' | 'events'>('members');
  const [familyData, setFamilyData] = useState<FamilyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);
  
  const router = useRouter();
  const params = useParams();
  const familyId = params.id as string;

  const tabs: Tab[] = [
    { id: 'members', label: 'الأعضاء' },
    { id: 'events', label: 'الفعاليات' }
  ];
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "central";

  useEffect(() => {
    const fetchFamilyData = async () => {
      if (!familyId) {
        setError('لم يتم توفير معرف الأسرة');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const token = localStorage.getItem('access');
        const baseUrl = getBaseUrl();
        const url = `${baseUrl}/api/family/super_dept/${familyId}/`;

        const response = await authFetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `خطأ: ${response.status}`);
        }

        const data: FamilyData = await response.json();
        setFamilyData(data);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
        setError(errorMessage);
        console.error('Error fetching family data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFamilyData();
  }, [familyId]);

  const showAlert = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    setAlert({ message, type });
  };

  /* ── Update a single member's status in local state ── */
  const updateMemberStatus = (studentId: number, newStatus: string) => {
    setFamilyData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        family_members: prev.family_members.map((m) =>
          m.student_id === studentId ? { ...m, status: newStatus } : m
        ),
      };
    });
  };

  const handleApproveMember = async (studentId: number) => {
    try {
      const token = localStorage.getItem('access');
      const baseUrl = getBaseUrl();
      const response = await authFetch(
        `${baseUrl}/api/family/super_dept/${familyId}/members/${studentId}/approve/`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );

      if (!response.ok) {
        const reason = await parseMemberApiError(response);
        showAlert(reason, 'error');
        return;
      }

      updateMemberStatus(studentId, 'مقبول');
      showAlert('تمت الموافقة على العضو بنجاح', 'success');
    } catch (err) {
      const msg = err instanceof Error ? translateMemberError(err.message) : 'تعذّر الاتصال بالخادم';
      showAlert(msg, 'error');
      console.error(err);
    }
  };

  const handleRejectMember = async (studentId: number) => {
    try {
      const token = localStorage.getItem('access');
      const baseUrl = getBaseUrl();
      const response = await authFetch(
        `${baseUrl}/api/family/super_dept/${familyId}/members/${studentId}/reject/`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );

      if (!response.ok) {
        const reason = await parseMemberApiError(response);
        showAlert(reason, 'error');
        return;
      }

      updateMemberStatus(studentId, 'مرفوض');
      showAlert('تم رفض العضو', 'warning');
    } catch (err) {
      const msg = err instanceof Error ? translateMemberError(err.message) : 'تعذّر الاتصال بالخادم';
      showAlert(msg, 'error');
      console.error(err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'موافقة مبدئية': styles.infoBadgeYellow,
      'مقبول': styles.infoBadgeGreen,
      'مرفوض': styles.infoBadgeRed,
      'في الانتظار': styles.infoBadgeYellow,
      'منتظر': styles.infoBadgeYellow
    };
    return statusMap[status] || styles.infoBadgeYellow;
  };

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <div style={{ textAlign: 'center', padding: '50px', color: '#2C3A5F' }}>
          <p>جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (error || !familyData) {
    return (
      <div className={styles.pageContainer}>
        <div style={{ textAlign: 'center', padding: '50px', color: '#dc3545' }}>
          <p>{error || 'لم يتم العثور على بيانات الأسرة'}</p>
          <button 
            onClick={() => router.push('/uni-level-family')} 
            style={{ 
              marginTop: '20px', 
              padding: '10px 20px', 
              cursor: 'pointer',
              backgroundColor: '#2C3A5F',
              color: 'white',
              border: 'none',
              borderRadius: '5px'
            }}
          >
            العودة
          </button>
        </div>
      </div>
    );
  }

  const normalizeMember = (m: FamilyMember) => ({
    student_id: m.student_id,
    student_name: m.student_name ?? '—',
    u_id: m.u_id ?? '—',
    national_id: m.national_id ?? '—',
    dept_name: m.dept_name ?? '—',
    role: m.role ?? '—',
    status: m.status ?? '—',
    joined_at: m.joined_at ?? null,
  });

  const normalizeEvent = (e: FamilyEvent) => ({
    event_id: e.event_id,
    title: e.title ?? '—',
    st_date: e.st_date ?? '—',
    cost: e.cost,
    status: e.status ?? '—',
    type: e.type ?? '—',
  });

  const getFamilyStatusStyle = (status: string) => {
    switch (status) {
      case 'مقبول':
        return { backgroundColor: '#D4F4DD', color: '#2E7D32' };
      case 'منتظر':
      case 'في الانتظار':
      case 'موافقة مبدئية':
        return { backgroundColor: '#FFF3E0', color: '#E65100' };
      case 'مرفوض':
        return { backgroundColor: '#FFE0E0', color: '#C62828' };
      default:
        return { backgroundColor: '#F5F5F5', color: '#666' };
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* Custom Alert */}
      {alert && (
        <CustomAlert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Header Section */}
      <div className={styles.header}>
        <button
          className={styles.closeButton}
          onClick={() => router.push(`/uni-level-family?tab=${tab}`)}
        >
          ✕
        </button>
              
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>{familyData.name}</h1>
            <span
              className={styles.statusBadge}
              style={getFamilyStatusStyle(familyData.status)}
            >
              {familyData.status}
            </span>
          </div>
          
          <p className={styles.description}>
            {familyData.description}
          </p>
        </div>
      </div>

      {/* Info Cards */}
      <div className={styles.infoCards}>
        <div className={styles.infoCard}>
          <span className={styles.infoIcon}></span>
          <span className={styles.infoLabel}></span>
          <span className={styles.infoValue}>{familyData.faculty_name || "علي مستوي الجامعة"}</span>
        </div>
        
        <div className={styles.infoCard}>
          <span className={styles.infoIcon}></span>
          <span className={styles.infoLabel}>عدد الأعضاء</span>
          <span className={styles.infoValue}>{familyData.family_members.length}</span>
        </div>
        <div className={styles.infoCard}>
          <span className={styles.infoLabel}>نوع الأسرة:</span>
          <span className={styles.infoBadge}>{familyData.type}</span>
        </div>

        <div className={styles.infoCard}>
          <span className={styles.infoIcon}></span>
          <span className={styles.infoLabel}>تاريخ التأسيس</span>
          <span className={styles.infoValue}>{formatDate(familyData.created_at)}</span>
        </div>
      </div>

      {/* Tabs */}
      <Tabs 
        tabs={tabs} 
        activeTab={activeTab} 
        onTabChange={(tab) => setActiveTab(tab as 'members' | 'events')} 
      />

      {/* Tab Content */}
      {activeTab === 'members' && (
        <div className={styles.contentArea}>
          {familyData.family_members.length === 0 ? (
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
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {familyData.family_members.map((raw) => {
                    const m = normalizeMember(raw);
                    return (
                      <tr key={m.student_id}>
                        <td data-label="الاسم">{m.student_name}</td>
                        <td data-label="الرقم الجامعي">{m.u_id}</td>
                        <td data-label="الرقم القومي">{m.national_id}</td>
                        <td data-label="اللجنة">{m.dept_name}</td>
                        <td data-label="المنصب">{m.role}</td>
                        <td data-label="الحالة">
                          <span className={getStatusColor(m.status)}>{m.status}</span>
                        </td>
                        <td data-label="تاريخ الانضمام">
                          {m.joined_at ? new Date(m.joined_at).toLocaleDateString('ar-EG') : '—'}
                        </td>
                        <td data-label="الإجراءات">
                          <div className={styles.memberActions}>
                            <button
                              className={styles.btnApprove}
                              onClick={() => handleApproveMember(m.student_id)}
                              disabled={m.status === 'مقبول' || m.status === 'مرفوض'}
                            >
                              قبول
                            </button>
                            <button
                              className={styles.btnReject}
                              onClick={() => handleRejectMember(m.student_id)}
                              disabled={m.status === 'مرفوض' || m.status === 'مقبول'}
                            >
                              رفض
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'events' && (
        <div className={styles.contentArea}>
          <h2 className={styles.sectionTitle}>فعاليات الأسرة</h2>

          {familyData.family_events.length === 0 ? (
            <div className={styles.emptyStateContainer}>
              <p className={styles.emptyStateText}>لا توجد فعاليات حالياً</p>
            </div>
          ) : (
            <div className={styles.eventsGrid}>
              {familyData.family_events.map((raw) => {
                const event = normalizeEvent(raw);
                return (
                  <div key={event.event_id} className={styles.eventCard}>
                    <div className={styles.eventHeader}>
                      <h3 className={styles.eventTitle}>{event.title}</h3>
                      <span
                        className={styles.eventStatusBadge}
                        style={
                          event.status === 'مقبول'
                            ? { backgroundColor: '#D4F4DD', color: '#2E7D32' }
                            : event.status === 'منتظر' || event.status === 'في الانتظار'
                            ? { backgroundColor: '#FFF3E0', color: '#E65100' }
                            : event.status === 'مرفوض'
                            ? { backgroundColor: '#FFE0E0', color: '#C62828' }
                            : { backgroundColor: '#F5F5F5', color: '#666' }
                        }
                      >
                        {event.status}
                      </span>
                    </div>

                    <div className={styles.eventMeta}>
                      <span>{event.st_date}</span>
                      <span>{event.cost ? `${event.cost} جنيه` : 'مجاني'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}