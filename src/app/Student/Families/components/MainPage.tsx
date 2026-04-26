'use client';
import React, { useState, useEffect } from 'react';
import '../styles/mainpage.css';
import Toast from './Toast';
import { authFetch, getBaseUrl } from "@/utils/globalFetch";

interface ApiFamily {
  family_id: number;
  name: string;
  description: string;
  faculty_name: string;
  type: string;
  status: string;
  member_status: string;
  role?: string;
  member_count: number;
  joined_at?: string;
}

export interface ProgramFamily {
  id: number;
  title: string;
  subtitle: string;
  place: string;
  views: string;
  createdAt?: string;
  description: string;
  image: string;
  type: string;
  memberStatus: string;
  memberRole?: string;
}

interface MainPageProps {
  onViewFamilyDetails?: (family: ProgramFamily) => void;
}

interface ToastNotification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

/* ── helpers ── */
const extractArray = (data: Record<string, unknown>): Record<string, unknown>[] => {
  if (Array.isArray(data)) return data;
  if (data?.results && Array.isArray(data.results)) return data.results;
  if (data?.families && Array.isArray(data.families)) return data.families;
  if (data?.data && Array.isArray(data.data)) return data.data;
  return [];
};

const isAccepted = (status: string) => {
  const s = status?.toLowerCase().trim();
  return s === 'مقبول' || s === 'accepted' || s === 'active';
};

const isElderBrother = (role?: string) => {
  if (!role) return false;
  const r = role.trim().replace(/_/g, ' ');
  return (
    (r.includes('أخ') && r.includes('أكبر')) ||
    (r.toLowerCase().includes('elder') && r.toLowerCase().includes('brother'))
  );
};

export default function MainPage({ onViewFamilyDetails }: MainPageProps) {
  const [availableFamilies, setAvailableFamilies] = useState<ProgramFamily[]>([]);
  const [joinedFamilies, setJoinedFamilies]       = useState<ProgramFamily[]>([]);
  const [loading, setLoading]                     = useState(true);
  const [error, setError]                         = useState<string | null>(null);
  const [joiningId, setJoiningId]                 = useState<number | null>(null);
  const [toasts, setToasts]                       = useState<ToastNotification[]>([]);
  const [activeTab, setActiveTab]                 = useState<'accepted' | 'pending'>('accepted');

  const token = typeof window !== 'undefined' ? localStorage.getItem('access') : null;

  const acceptedFamilies = joinedFamilies.filter(f => isAccepted(f.memberStatus));
  const pendingFamilies  = joinedFamilies.filter(f => !isAccepted(f.memberStatus));

  /* ── toast ── */
  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };
  const removeToast = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));

  /* ── mapper ── */
  const mapToProgramFamily = (family: ApiFamily): ProgramFamily => ({
    id: family.family_id,
    title: family.name,
    subtitle: family.description,
    place: family.faculty_name,
    views: `${family.member_count} عضو`,
    description: family.description,
    type: family.type,
    memberStatus: family.member_status || '',
    memberRole: family.role || '',
    createdAt: family.joined_at
      ? new Date(family.joined_at).toLocaleDateString('ar-EG')
      : '',
    image: '/api/placeholder/300/200',
  });

  /* ── fetch ── */
  const fetchJoinedFamilies = async () => {
    if (!token) throw new Error('غير مصرح');
    const res = await authFetch(`${getBaseUrl()}/api/family/student/families/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('فشل تحميل الأسر الحالية');
    const data = await res.json();
    return extractArray(data)
      .filter((f: Record<string, unknown>) => !isElderBrother((f as unknown as ApiFamily).role))
      .map((f: Record<string, unknown>) => mapToProgramFamily(f as unknown as ApiFamily));
  };

  const fetchAvailableFamilies = async () => {
    if (!token) throw new Error('غير مصرح');
    const res = await authFetch(`${getBaseUrl()}/api/family/student/available/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('فشل تحميل الأسر المتاحة');
    const data = await res.json();
    return extractArray(data).map((f: Record<string, unknown>) =>
      mapToProgramFamily(f as unknown as ApiFamily)
    );
  };

  /* ── join ── */
  const joinFamily = async (familyId: number) => {
    if (!token) { showToast('غير مصرح. الرجاء تسجيل الدخول أولاً', 'error'); return; }
    try {
      setJoiningId(familyId);
      const res = await authFetch(`${getBaseUrl()}/api/family/student/${familyId}/join/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        let msg = 'فشل الانضمام للأسرة';
        try { const err = await res.json(); msg = err.message || err.detail || msg; } catch {}
        throw new Error(msg);
      }
      const joinedFamily = availableFamilies.find(f => f.id === familyId);
      if (joinedFamily) {
        setJoinedFamilies(prev => [...prev, {
          ...joinedFamily,
          createdAt: new Date().toLocaleDateString('ar-EG'),
          memberStatus: 'منتظر',
        }]);
        setAvailableFamilies(prev => prev.filter(f => f.id !== familyId));
        setActiveTab('pending');
      }
      showToast('تم إرسال طلب الانضمام للأسرة بنجاح!', 'success');
      setTimeout(async () => {
        try {
          const [joined, available] = await Promise.all([fetchJoinedFamilies(), fetchAvailableFamilies()]);
          setJoinedFamilies(joined);
          setAvailableFamilies(available);
        } catch (err) { console.error('Error refreshing data:', err); }
      }, 500);
    } catch (err: unknown) {
      showToast((err as Error).message || 'حدث خطأ أثناء الانضمام للأسرة', 'error');
    } finally {
      setJoiningId(null);
    }
  };

  /* ── load ── */
  useEffect(() => {
    if (!token) { setError('غير مصرح'); setLoading(false); return; }
    const loadData = async () => {
      try {
        setLoading(true);
        const [joined, available] = await Promise.all([fetchJoinedFamilies(), fetchAvailableFamilies()]);
        setJoinedFamilies(joined);
        setAvailableFamilies(available);
        if (!joined.some(f => isAccepted(f.memberStatus)) && joined.length > 0) {
          setActiveTab('pending');
        }
      } catch (err: unknown) {
        setError((err as Error).message);
        showToast((err as Error).message || 'فشل تحميل البيانات', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── status helpers ── */
  const getStatusBadgeClass = (status: string) => {
    const s = status.toLowerCase().trim();
    if (s === 'منتظر'  || s === 'pending')               return 'status-badge-pending';
    if (s === 'مقبول'  || s === 'accepted' || s === 'active') return 'status-badge-accepted';
    if (s === 'مرفوض' || s === 'rejected')               return 'status-badge-rejected';
    return 'status-badge-default';
  };

  const getStatusText = (status: string) => {
    const s = status.toLowerCase().trim();
    if (s === 'pending')                    return 'منتظر';
    if (s === 'accepted' || s === 'active') return 'مقبول';
    if (s === 'rejected')                   return 'مرفوض';
    return status;
  };

  /* ══════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════ */
  return (
    <>
      {/* Toast stack */}
      <div className="toast-container">
        {toasts.map(t => (
          <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
        ))}
      </div>

      <div dir="rtl" className="container">

        {/* ════════════════════════════════
            SECTION 1 — أسرك الحالية
        ════════════════════════════════ */}
        <section className="section-block">
          <div className="section-header">
            <div className="section-header__icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none"
                stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
                viewBox="0 0 24 24">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div className="section-header__text">
              <h2 className="section-header__title">أسرك الحالية</h2>
              <p className="section-header__subtitle">الأسر التي انضممت إليها أو تنتظر قبول طلبك</p>
            </div>
            {joinedFamilies.length > 0 && (
              <span className="section-header__badge">{joinedFamilies.length}</span>
            )}
          </div>

          <div className="section-body">
            {loading ? (
              <div className="loading-state">
                <div className="spinner-large" />
                <p>جاري التحميل...</p>
              </div>

            ) : joinedFamilies.length === 0 ? (
              <div className="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p style={{ fontSize: '15px', margin: '0', fontWeight: 700 }}>لم تنضم لأي أسرة بعد</p>
                <p style={{ fontSize: '13px', marginTop: '6px', opacity: 0.7 }}>تصفح الأسر المتاحة أدناه وانضم لإحداها</p>
              </div>

            ) : (
              <div className="families-tabs-wrapper">

                {/* ── Tab bar ── */}
                <div className="tab-bar">
                  <button
                    className={`tab-btn ${activeTab === 'accepted' ? 'tab-btn--active tab-btn--accepted' : ''}`}
                    onClick={() => setActiveTab('accepted')}
                  >
                    <span className="tab-icon">✓</span>
                    الأسر المقبولة
                    {acceptedFamilies.length > 0 && (
                      <span className={`tab-count ${activeTab === 'accepted' ? 'tab-count--active' : ''}`}>
                        {acceptedFamilies.length}
                      </span>
                    )}
                  </button>
                  <button
                    className={`tab-btn ${activeTab === 'pending' ? 'tab-btn--active tab-btn--pending' : ''}`}
                    onClick={() => setActiveTab('pending')}
                  >
                    <span className="tab-icon">⏳</span>
                    طلبات الانضمام
                    {pendingFamilies.length > 0 && (
                      <span className={`tab-count ${activeTab === 'pending' ? 'tab-count--active-pending' : ''}`}>
                        {pendingFamilies.length}
                      </span>
                    )}
                  </button>
                </div>

                {/* ── Accepted panel ── */}
                {activeTab === 'accepted' && (
                  <div className="tab-panel">
                    {acceptedFamilies.length === 0 ? (
                      <div className="empty-state empty-state--tab">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p style={{ fontWeight: 700 }}>لا توجد أسر مقبولة بعد</p>
                        <p style={{ fontSize: '13px', opacity: 0.65, marginTop: '6px' }}>
                          ستظهر هنا الأسر التي تمت الموافقة على انضمامك إليها
                        </p>
                      </div>
                    ) : (
                      <div className="accepted-families-grid">
                        {acceptedFamilies.map(fam => (
                          <div key={fam.id} className="accepted-card">
                            <div className="accepted-card-glow" />
                            <div className="accepted-card-top">
                              <div className="accepted-card-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                                  fill="none" stroke="currentColor" strokeWidth="2.3"
                                  strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                  <circle cx="9" cy="7" r="4"/>
                                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                </svg>
                              </div>
                              <div className="accepted-card-info">
                                <h3>{fam.title}</h3>
                              </div>
                            </div>
                            <p className="accepted-card-desc">{fam.subtitle}</p>
                            <div className="accepted-card-meta">
                              <div className="meta-chip">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12"
                                  fill="none" stroke="currentColor" strokeWidth="2"
                                  strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                  <circle cx="12" cy="10" r="3"/>
                                </svg>
                                {fam.place}
                              </div>
                              <div className="meta-chip">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12"
                                  fill="none" stroke="currentColor" strokeWidth="2"
                                  strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                                  <circle cx="9" cy="7" r="4"/>
                                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                </svg>
                                {fam.views}
                              </div>
                              {fam.createdAt && (
                                <div className="meta-chip">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12"
                                    fill="none" stroke="currentColor" strokeWidth="2"
                                    strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                    <line x1="16" y1="2" x2="16" y2="6"/>
                                    <line x1="8" y1="2" x2="8" y2="6"/>
                                    <line x1="3" y1="10" x2="21" y2="10"/>
                                  </svg>
                                  {fam.createdAt}
                                </div>
                              )}
                            </div>
                            <button className="view-details-btn" onClick={() => onViewFamilyDetails?.(fam)}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15"
                                fill="none" stroke="currentColor" strokeWidth="2"
                                strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                              </svg>
                              عرض التفاصيل
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ── Pending panel ── */}
                {activeTab === 'pending' && (
                  <div className="tab-panel">
                    {pendingFamilies.length === 0 ? (
                      <div className="empty-state empty-state--tab">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p style={{ fontWeight: 700 }}>لا توجد طلبات معلقة</p>
                      </div>
                    ) : (
                      <div className="pending-families-list">
                        {pendingFamilies.map(fam => (
                          <div key={fam.id} className="pending-card">
                            <div className="pending-card-left">
                              <div className="pending-status-indicator" />
                              <div>
                                <h3>{fam.title}</h3>
                                <p>{fam.subtitle}</p>
                              </div>
                            </div>
                            <div className="pending-card-right">
                              <span className={`status-badge ${getStatusBadgeClass(fam.memberStatus)}`}>
                                {getStatusText(fam.memberStatus)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>
            )}
          </div>
        </section>

        {/* ════════════════════════════════
            SECTION 2 — الأسر المتاحة
        ════════════════════════════════ */}
        <section className="section-block">
          <div className="section-header">
            <div className="section-header__icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none"
                stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
                viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <div className="section-header__text">
              <h2 className="section-header__title">الأسر المتاحة للانضمام</h2>
              <p className="section-header__subtitle">تصفح الأسر المتاحة وتقدم بطلب الانضمام</p>
            </div>
            {!loading && availableFamilies.length > 0 && (
              <span className="section-header__badge">{availableFamilies.length}</span>
            )}
          </div>

          <div className="section-body">
            {error && (
              <div className="error-box">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p>{error}</p>
              </div>
            )}

            <div className="programs-grid-wrapper">
              <div className="programs-grid">
                {loading ? (
                  <div className="loading-state" style={{ gridColumn: '1 / -1' }}>
                    <div className="spinner-large" />
                    <p>جاري التحميل...</p>
                  </div>

                ) : availableFamilies.length === 0 ? (
                  <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p style={{ fontSize: '15px', margin: '0', fontWeight: 700 }}>لا توجد أسر متاحة حالياً</p>
                    <p style={{ fontSize: '13px', marginTop: '6px', opacity: 0.7 }}>تحقق مرة أخرى لاحقاً</p>
                  </div>

                ) : availableFamilies.map(program => (
                  <div key={program.id} className="program-card">
                    <div className="program-content">
                      <div className="card-header-section">
                        <h3>{program.title}</h3>
                        <span className="family-badge">متاحة</span>
                      </div>

                      <div className="card-info-section">
                        <div className="info-row">
                          <div className="info-label">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none"
                              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                              viewBox="0 0 24 24">
                              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                              <line x1="4" y1="22" x2="4" y2="15"/>
                            </svg>
                            <span>نوع الأسرة</span>
                          </div>
                          <p className="info-value">{program.type}</p>
                        </div>

                        <div className="info-row">
                          <div className="info-label">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none"
                              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                              viewBox="0 0 24 24">
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                            </svg>
                            <span>الوصف</span>
                          </div>
                          <p className="info-value">{program.subtitle}</p>
                        </div>

                        <div className="info-row">
                          <div className="info-label">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none"
                              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                              viewBox="0 0 24 24">
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
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none"
                              stroke="currentColor" strokeWidth="2" strokeLinejoin="round" viewBox="0 0 24 24">
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
                          <><span className="spinner" />جاري الانضمام...</>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="none"
                              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                              viewBox="0 0 24 24">
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
                ))}
              </div>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}