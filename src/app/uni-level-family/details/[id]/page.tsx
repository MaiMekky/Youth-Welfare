'use client';

import { useState, useEffect } from 'react';
import Tabs from './Tabs';
import styles from './deatails.module.css';
import { useRouter, useParams } from 'next/navigation';

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
  const [activeTab, setActiveTab] = useState('overview');
  const [familyData, setFamilyData] = useState<FamilyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);
  
  const router = useRouter();
  const params = useParams();
  const familyId = params.id as string;

  const tabs = [
    { id: 'overview', label: 'نظرة عامة' },
    { id: 'members', label: 'الأعضاء' },
    { id: 'events', label: 'الفعاليات' }
  ];

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        const url = `http://localhost:8000/api/family/super_dept/${familyId}/`;

        console.log('🔍 Fetching Family Data from:', url);
        console.log('🔑 Token:', token ? 'exists' : 'missing');

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });

        console.log('📡 Response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `خطأ: ${response.status}`);
        }

        const data: FamilyData = await response.json();
        console.log('✅ Data received:', data);
        setFamilyData(data);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
        setError(errorMessage);
        console.error('❌ Error fetching family data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFamilyData();
  }, [familyId]);

  const showAlert = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    setAlert({ message, type });
  };

  const handleApproveMember = async (studentId: number) => {
    try {
      const token = localStorage.getItem('access');
      const response = await fetch(
        `http://localhost:8000/api/family/super_dept/${familyId}/members/${studentId}/approve/`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'فشل في الموافقة على العضو');
      }

      showAlert('تمت الموافقة على العضو بنجاح ✓', 'success');
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل في الموافقة على العضو';
      showAlert(errorMessage, 'error');
      console.error(err);
    }
  };

  const handleRejectMember = async (studentId: number) => {
    try {
      const token = localStorage.getItem('access');
      const response = await fetch(
        `http://localhost:8000/api/family/super_dept/${familyId}/members/${studentId}/reject/`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'فشل في رفض العضو');
      }

      showAlert('تم رفض العضو بنجاح', 'warning');
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل في رفض العضو';
      showAlert(errorMessage, 'error');
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
            onClick={() => router.back()} 
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
        <button className={styles.closeButton} onClick={() => router.back()}>✕</button>
        
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>{familyData.name}</h1>
            <span className={getStatusColor(familyData.status)}>{familyData.status}</span>
          </div>
          
          <p className={styles.description}>
            {familyData.description}
          </p>
        </div>
      </div>

      {/* Info Cards */}
      <div className={styles.infoCards}>
        <div className={styles.infoCard}>
          <span className={styles.infoIcon}>🎓</span>
          <span className={styles.infoLabel}>الكلية</span>
          <span className={styles.infoValue}>{familyData.faculty_name}</span>
        </div>
        
        <div className={styles.infoCard}>
          <span className={styles.infoIcon}>👥</span>
          <span className={styles.infoLabel}>عدد الأعضاء</span>
          <span className={styles.infoValue}>{familyData.family_members.length}</span>
        </div>

        <div className={styles.infoCard}>
          <span className={styles.infoIcon}>📅</span>
          <span className={styles.infoLabel}>تاريخ التأسيس</span>
          <span className={styles.infoValue}>{formatDate(familyData.created_at)}</span>
        </div>
      </div>

      {/* Tabs */}
      <Tabs 
        tabs={tabs} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      {/* Tab Content */}
      <div className={styles.contentArea}>
        {activeTab === 'overview' && (
          <div className={styles.overviewContent}>
            <div className={styles.goalsSection}>
              <h2 className={styles.goalsTitle}>
                <span>🎯</span>
                أهداف الأسرة
              </h2>
              <p className={styles.goalsText}>
                {familyData.description}
              </p>
            </div>

            <div className={styles.statsSection}>
              <h2 className={styles.sectionTitle}>إحصائيات</h2>
              <div className={styles.statsGrid}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>إجمالي الأعضاء</span>
                  <span className={styles.statValue}>{familyData.family_members.length}</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>عدد الفعاليات</span>
                  <span className={styles.statValue}>{familyData.family_events.length}</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>الحد الأدنى للأعضاء</span>
                  <span className={styles.statValue}>{familyData.min_limit}</span>
                </div>
              </div>
            </div>

            <div className={styles.infoSection}>
              <h2 className={styles.sectionTitle}>معلومات إضافية</h2>
              <div className={styles.infoGrid}>
                <div className={styles.infoRow}>
                  <span className={styles.infoRowLabel}>الكلية:</span>
                  <span className={styles.infoRowValue}>{familyData.faculty_name}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoRowLabel}>تاريخ التأسيس:</span>
                  <span className={styles.infoRowValue}>{formatDate(familyData.created_at)}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoRowLabel}>آخر تحديث:</span>
                  <span className={styles.infoRowValue}>{formatDate(familyData.updated_at)}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoRowLabel}>نوع الأسرة:</span>
                  <span className={styles.infoBadgeGreen}>{familyData.type}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoRowLabel}>الحالة:</span>
                  <span className={getStatusColor(familyData.status)}>{familyData.status}</span>
                </div>
                {familyData.created_by_name && (
                  <div className={styles.infoRow}>
                    <span className={styles.infoRowLabel}>أُنشئت بواسطة:</span>
                    <span className={styles.infoRowValue}>{familyData.created_by_name}</span>
                  </div>
                )}
                {familyData.approved_by_name && (
                  <div className={styles.infoRow}>
                    <span className={styles.infoRowLabel}>تمت الموافقة بواسطة:</span>
                    <span className={styles.infoRowValue}>{familyData.approved_by_name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div className={styles.membersContent}>
            <h2 className={styles.sectionTitle}>الطلاب المشاركون</h2>
            <p className={styles.membersSubtitle}>
              أعضاء الأسرة من {familyData.faculty_name}
            </p>
            
            {/* Desktop Table View */}
            {!isMobile && familyData.family_members.length > 0 && (
              <div className={styles.tableContainer}>
                <table className={styles.membersTable}>
                  <thead>
                    <tr>
                      <th>الاسم</th>
                      <th>رقم الطالب</th>
                      <th>المنصب</th>
                      <th>القسم</th>
                      <th>تاريخ الانضمام</th>
                      <th>الحالة</th>
                      <th>الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {familyData.family_members.map((member) => (
                      <tr key={member.student_id}>
                        <td>{member.student_name}</td>
                        <td>{member.u_id}</td>
                        <td>{member.role}</td>
                        <td>{member.dept_name || 'غير محدد'}</td>
                        <td>{formatDate(member.joined_at)}</td>
                        <td>
                          <span className={getStatusColor(member.status)}>
                            {member.status}
                          </span>
                        </td>
                        <td>
                          <div className={styles.memberActions}>
                            <button
                              className={styles.btnApprove}
                              onClick={() => handleApproveMember(member.student_id)}
                              disabled={member.status === 'مقبول'}
                            >
                              قبول
                            </button>
                            <button
                              className={styles.btnReject}
                              onClick={() => handleRejectMember(member.student_id)}
                              disabled={member.status === 'مرفوض'}
                            >
                              رفض
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Mobile Card View */}
            {isMobile && familyData.family_members.length > 0 && (
              <div className={styles.mobileCards}>
                {familyData.family_members.map((member, index) => (
                  <div 
                    key={member.student_id} 
                    className={styles.memberCard}
                    style={{ background: index % 2 === 0 ? 'white' : '#f8f9fa' }}
                  >
                    <div className={styles.cardRow}>
                      <span className={styles.cardLabel}>الاسم:</span>
                      <span className={styles.cardValue}>{member.student_name}</span>
                    </div>
                    <div className={styles.cardRow}>
                      <span className={styles.cardLabel}>رقم الطالب:</span>
                      <span className={styles.cardValue}>{member.u_id}</span>
                    </div>
                    <div className={styles.cardRow}>
                      <span className={styles.cardLabel}>المنصب:</span>
                      <span className={styles.cardValue}>{member.role}</span>
                    </div>
                    <div className={styles.cardRow}>
                      <span className={styles.cardLabel}>القسم:</span>
                      <span className={styles.cardValue}>{member.dept_name || 'غير محدد'}</span>
                    </div>
                    <div className={styles.cardRow}>
                      <span className={styles.cardLabel}>تاريخ الانضمام:</span>
                      <span className={styles.cardValue}>{formatDate(member.joined_at)}</span>
                    </div>
                    <div className={styles.cardRow} style={{ borderBottom: 'none' }}>
                      <span className={styles.cardLabel}>الحالة:</span>
                      <span className={getStatusColor(member.status)}>{member.status}</span>
                    </div>
                    <div className={styles.cardActions}>
                      <div className={styles.memberActions}>
                        <button
                          className={styles.btnApprove}
                          onClick={() => handleApproveMember(member.student_id)}
                          disabled={member.status === 'مقبول'}
                        >
                          قبول
                        </button>
                        <button
                          className={styles.btnReject}
                          onClick={() => handleRejectMember(member.student_id)}
                          disabled={member.status === 'مرفوض'}
                        >
                          رفض
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {familyData.family_members.length === 0 && (
              <div className={styles.emptyState}>
                لا توجد بيانات متاحة
              </div>
            )}
          </div>
        )}

        {activeTab === 'events' && (
          <div className={styles.membersContent}>
            <h2 className={styles.sectionTitle}>فعاليات الأسرة</h2>
            <p className={styles.membersSubtitle}>
              جميع الفعاليات والأنشطة الخاصة بالأسرة
            </p>
            
            {/* Desktop Table */}
            {!isMobile && familyData.family_events.length > 0 && (
              <div className={styles.tableContainer}>
                <table className={styles.membersTable}>
                  <thead>
                    <tr>
                      <th>العنوان</th>
                      <th>النوع</th>
                      <th>تاريخ البداية</th>
                      <th>التكلفة</th>
                      <th>الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {familyData.family_events.map((event) => (
                      <tr key={event.event_id}>
                        <td>{event.title}</td>
                        <td>{event.type}</td>
                        <td>{formatDate(event.st_date)}</td>
                        <td>{event.cost ? `${event.cost} جنيه` : 'مجاني'}</td>
                        <td>
                          <span className={getStatusColor(event.status)}>
                            {event.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Mobile Cards */}
            {isMobile && familyData.family_events.length > 0 && (
              <div className={styles.mobileCards}>
                {familyData.family_events.map((event, index) => (
                  <div 
                    key={event.event_id} 
                    className={styles.memberCard}
                    style={{ background: index % 2 === 0 ? 'white' : '#f8f9fa' }}
                  >
                    <div className={styles.cardRow}>
                      <span className={styles.cardLabel}>العنوان:</span>
                      <span className={styles.cardValue}>{event.title}</span>
                    </div>
                    <div className={styles.cardRow}>
                      <span className={styles.cardLabel}>النوع:</span>
                      <span className={styles.cardValue}>{event.type}</span>
                    </div>
                    <div className={styles.cardRow}>
                      <span className={styles.cardLabel}>تاريخ البداية:</span>
                      <span className={styles.cardValue}>{formatDate(event.st_date)}</span>
                    </div>
                    <div className={styles.cardRow}>
                      <span className={styles.cardLabel}>التكلفة:</span>
                      <span className={styles.cardValue}>{event.cost ? `${event.cost} جنيه` : 'مجاني'}</span>
                    </div>
                    <div className={styles.cardRow} style={{ borderBottom: 'none' }}>
                      <span className={styles.cardLabel}>الحالة:</span>
                      <span className={getStatusColor(event.status)}>{event.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {familyData.family_events.length === 0 && (
              <div className={styles.emptyState}>
                لا توجد فعاليات متاحة
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}