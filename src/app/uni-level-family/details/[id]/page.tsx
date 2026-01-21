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

export default function FamilyDetailsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [familyData, setFamilyData] = useState<FamilyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const params = useParams();
  const familyId = params.id as string;

  const tabs = [
    { id: 'overview', label: 'نظرة عامة' },
    { id: 'members', label: 'الأعضاء' },
    { id: 'events', label: 'الفعاليات' }
  ];

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

  // ✅ Handle member approval
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

      alert('تمت الموافقة على العضو بنجاح');
      // Refresh data
      window.location.reload();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل في الموافقة على العضو';
      alert(errorMessage);
      console.error(err);
    }
  };

  // ✅ Handle member rejection
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

      alert('تم رفض العضو');
      // Refresh data
      window.location.reload();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل في رفض العضو';
      alert(errorMessage);
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
          <span className={styles.infoIcon}>📋</span>
          <span className={styles.infoLabel}>نوع الأسرة</span>
          <span className={styles.infoBadge}>{familyData.type}</span>
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
            {/* ✅ Improved Goals Section */}
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
            
            <table className={styles.membersTable}>
              <thead>
                <tr>
                  <th>الإجراءات</th>
                  <th>الحالة</th>
                  <th>تاريخ الانضمام</th>
                  <th>القسم</th>
                  <th>المنصب</th>
                  <th>رقم الطالب</th>
                  <th>الاسم</th>
                </tr>
              </thead>
              <tbody>
                {familyData.family_members.length > 0 ? (
                  familyData.family_members.map((member) => (
                    <tr key={member.student_id}>
                      {/* ✅ Action Buttons */}
                      <td>
                        <div className={styles.memberActions}>
                          <button
                            className={styles.btnApprove}
                            onClick={() => handleApproveMember(member.student_id)}
                            disabled={member.status === 'مقبول'}
                          >
                            موافقة
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
                      <td>
                        <span className={getStatusColor(member.status)}>
                          {member.status}
                        </span>
                      </td>
                      <td>{formatDate(member.joined_at)}</td>
                      <td>{member.dept_name || 'غير محدد'}</td>
                      <td>{member.role}</td>
                      <td>{member.u_id}</td>
                      <td>{member.student_name}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className={styles.emptyState}>
                      لا توجد بيانات متاحة
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'events' && (
          <div className={styles.membersContent}>
            <h2 className={styles.sectionTitle}>فعاليات الأسرة</h2>
            <p className={styles.membersSubtitle}>
              جميع الفعاليات والأنشطة الخاصة بالأسرة
            </p>
            
            <table className={styles.membersTable}>
              <thead>
                <tr>
                  <th>الحالة</th>
                  <th>التكلفة</th>
                  <th>تاريخ البداية</th>
                  <th>النوع</th>
                  <th>العنوان</th>
                </tr>
              </thead>
              <tbody>
                {familyData.family_events.length > 0 ? (
                  familyData.family_events.map((event) => (
                    <tr key={event.event_id}>
                      <td>
                        <span className={getStatusColor(event.status)}>
                          {event.status}
                        </span>
                      </td>
                      <td>{event.cost ? `${event.cost} جنيه` : 'مجاني'}</td>
                      <td>{formatDate(event.st_date)}</td>
                      <td>{event.type}</td>
                      <td>{event.title}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className={styles.emptyState}>
                      لا توجد فعاليات متاحة
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}