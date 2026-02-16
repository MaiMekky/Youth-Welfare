'use client';
import React, { useState, useEffect } from 'react';
import '../styles/mainpage.css';
import Toast from './Toast';

interface ApiFamily {
  family_id: number;
  name: string;
  description: string;
  faculty_name: string;
  type: string;
  status: string;
  member_count: number;
  joined_at?: string;
}

interface ProgramFamily {
  id: number;
  title: string;
  subtitle: string;
  place: string;
  views: string;
  createdAt?: string;
  description: string;
  image: string;
  type: string; // Added type field
}

interface MainPageProps {
  onViewFamilyDetails?: (family: ProgramFamily) => void;
}

interface ToastNotification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

const extractArray = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  if (data?.results && Array.isArray(data.results)) return data.results;
  if (data?.families && Array.isArray(data.families)) return data.families;
  if (data?.data && Array.isArray(data.data)) return data.data;
  return [];
};

export default function MainPage({ onViewFamilyDetails }: MainPageProps) {
  const [availableFamilies, setAvailableFamilies] = useState<ProgramFamily[]>([]);
  const [joinedFamilies, setJoinedFamilies] = useState<ProgramFamily[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joiningId, setJoiningId] = useState<number | null>(null);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('access')
      : null;

  /* ======================
     TOAST FUNCTIONS
  ====================== */
  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  /* ======================
     MAPPERS
  ====================== */
  const mapToProgramFamily = (family: ApiFamily): ProgramFamily => ({
    id: family.family_id,
    title: family.name,
    subtitle: family.description,
    place: family.faculty_name,
    views: `${family.member_count} عضو`,
    description: family.description,
    type: family.type, // Map type from API
    createdAt: family.joined_at
      ? new Date(family.joined_at).toLocaleDateString('ar-EG')
      : '',
    image: '/api/placeholder/300/200',
  });

  /* ======================
     FETCH JOINED FAMILIES
  ====================== */
  const fetchJoinedFamilies = async () => {
    if (!token) throw new Error('غير مصرح');

    const res = await fetch(
      'http://127.0.0.1:8000/api/family/student/families/',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) throw new Error('فشل تحميل الأسر الحالية');

    const data = await res.json();
    const arr = extractArray(data);
    return arr.map(mapToProgramFamily);
  };

  /* ======================
     FETCH AVAILABLE FAMILIES
  ====================== */
  const fetchAvailableFamilies = async () => {
    if (!token) throw new Error('غير مصرح');

    const res = await fetch(
      'http://127.0.0.1:8000/api/family/student/available/',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) throw new Error('فشل تحميل الأسر المتاحة');

    const data = await res.json();
    const arr = extractArray(data);
    return arr.map(mapToProgramFamily);
  };

  /* ======================
     JOIN FAMILY
  ====================== */
  const joinFamily = async (familyId: number) => {
    if (!token) {
      showToast('غير مصرح. الرجاء تسجيل الدخول أولاً', 'error');
      return;
    }

    try {
      setJoiningId(familyId);

      const res = await fetch(
        `http://127.0.0.1:8000/api/family/student/${familyId}/join/`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!res.ok) {
        let msg = 'فشل الانضمام للأسرة';
        try {
          const err = await res.json();
          msg = err.message || err.detail || msg;
        } catch {}
        throw new Error(msg);
      }

      // Find the joined family from available families
      const joinedFamily = availableFamilies.find(f => f.id === familyId);
      
      if (joinedFamily) {
        // Add joined date to the family
        const updatedFamily = {
          ...joinedFamily,
          createdAt: new Date().toLocaleDateString('ar-EG')
        };
        // Update UI immediately
        setJoinedFamilies(prev => [...prev, updatedFamily]);
        setAvailableFamilies(prev => prev.filter(f => f.id !== familyId));
      }

      showToast('تم إرسال طلب الانضمام للأسرة بنجاح! 🎉', 'success');

      // Refresh data from server to ensure consistency
      setTimeout(async () => {
        try {
          const [joined, available] = await Promise.all([
            fetchJoinedFamilies(),
            fetchAvailableFamilies(),
          ]);
          setJoinedFamilies(joined);
          setAvailableFamilies(available);
        } catch (err) {
          console.error('Error refreshing data:', err);
        }
      }, 500);
    } catch (err: any) {
      showToast(err.message || 'حدث خطأ أثناء الانضمام للأسرة', 'error');
    } finally {
      setJoiningId(null);
    }
  };

  /* ======================
     LOAD DATA ON MOUNT
  ====================== */
  useEffect(() => {
    if (!token) {
      setError('غير مصرح');
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        const [joined, available] = await Promise.all([
          fetchJoinedFamilies(),
          fetchAvailableFamilies(),
        ]);
        setJoinedFamilies(joined);
        setAvailableFamilies(available);
      } catch (err: any) {
        setError(err.message);
        showToast(err.message || 'فشل تحميل البيانات', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  /* ======================
     RENDER
  ====================== */
  return (
    <>
      {/* Toast Container */}
      <div className="toast-container">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>

      <div dir="rtl" className="container">
        {/* ===== أسرك الحالية ===== */}
        <section className="joined-section">
          <header className="header">
            <h1>أسرك الحالية</h1>
          </header>
          <div className="gold-line"></div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner-large"></div>
              <p>جاري التحميل...</p>
            </div>
          ) : joinedFamilies.length === 0 ? (
            <div className="empty-state">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p style={{ fontSize: '16px', margin: '0' }}>لم تنضم لأي أسرة بعد</p>
              <p style={{ fontSize: '14px', marginTop: '8px', opacity: 0.7 }}>تصفح الأسر المتاحة وانضم لإحداها</p>
            </div>
          ) : (
            <div className="joined-families-scroll-wrapper">
              <div className="joined-families-grid">
                {joinedFamilies.map(fam => (
                  <div key={fam.id} className="joined-card">
                    <div className="joined-card-header">
                      <h3>{fam.title}</h3>
                    </div>
                    <p>{fam.subtitle}</p>
                    <div className="joined-meta">
                      <div className="joined-meta-item">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                          <circle cx="9" cy="7" r="4"/>
                          <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                        <span>{fam.views}</span>
                      </div>
                      <div className="joined-meta-item">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                        <span>{fam.place}</span>
                      </div>
                      {fam.createdAt && (
                        <div className="joined-meta-item">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                          </svg>
                          <span>{fam.createdAt}</span>
                        </div>
                      )}
                    </div>
                    <button
                      className="view-details-btn"
                      onClick={() => onViewFamilyDetails?.(fam)}
                    >
                      عرض التفاصيل
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ===== الأسر المتاحة ===== */}
        <header className="header">
          <h1>الأسر المتاحة للانضمام</h1>
        </header>
        <div className="gold-line"></div>

        {error && (
          <div className="error-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p>{error}</p>
          </div>
        )}

        <main className="programs-grid-wrapper">
          <div className="programs-grid">
            {loading ? (
              <div className="loading-state" style={{ gridColumn: '1 / -1' }}>
                <div className="spinner-large"></div>
                <p>جاري التحميل...</p>
              </div>
            ) : availableFamilies.length === 0 ? (
              <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p style={{ fontSize: '16px', margin: '0' }}>لا توجد أسر متاحة حالياً</p>
                <p style={{ fontSize: '14px', marginTop: '8px', opacity: 0.7 }}>تحقق مرة أخرى لاحقاً</p>
              </div>
            ) : (
              availableFamilies.map(program => (
                <div key={program.id} className="program-card">
                  <div className="program-content">
                    <div className="card-header-section">
                      <h3>{program.title}</h3>
                      <span className="family-badge">متاحة</span>
                    </div>

                    <div className="card-info-section">
                      {/* Family Type Row */}
                      <div className="info-row">
                        <div className="info-label">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                            <line x1="4" y1="22" x2="4" y2="15"/>
                          </svg>
                          <span>نوع الأسرة</span>
                        </div>
                        <p className="info-value">{program.type}</p>
                      </div>

                      <div className="info-row">
                        <div className="info-label">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                          </svg>
                          <span>الوصف</span>
                        </div>
                        <p className="info-value">{program.subtitle}</p>
                      </div>

                      <div className="info-row">
                        <div className="info-label">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                          </svg>
                          <span>الأعضاء</span>
                        </div>
                        <p className="info-value">{program.views}</p>
                      </div>

                      <div className="info-row">
                        <div className="info-label">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                          </svg>
                          <span>المكان</span>
                        </div>
                        <p className="info-value">{program.place}</p>
                      </div>
                    </div>

                    <button
                      className="join-btn"
                      onClick={() => joinFamily(program.id)}
                      disabled={joiningId === program.id}
                    >
                      {joiningId === program.id ? (
                        <>
                          <span className="spinner"></span>
                          جاري الانضمام...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                          </svg>
                          انضم للأسرة
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </>
  );
}