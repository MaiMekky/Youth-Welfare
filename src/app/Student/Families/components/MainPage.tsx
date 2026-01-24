'use client';
import React, { useState, useEffect } from 'react';
import '../styles/mainpage.css';

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
}

interface MainPageProps {
  onViewFamilyDetails?: (family: ProgramFamily) => void;
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

  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('access')
      : null;

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
      alert('غير مصرح');
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
          },
        }
      );

      if (!res.ok) {
        let msg = 'فشل الانضمام للأسرة';
        try {
          const err = await res.json();
          msg = err.message || msg;
        } catch {}
        throw new Error(msg);
      }

      alert('تم الانضمام للأسرة بنجاح ✅');

      // إعادة تحميل القوائم
      const [joined, available] = await Promise.all([
        fetchJoinedFamilies(),
        fetchAvailableFamilies(),
      ]);

      setJoinedFamilies(joined);
      setAvailableFamilies(available);
    } catch (err: any) {
      alert(err.message || 'حصل خطأ');
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
//         const joined = await fetchJoinedFamilies();
// const available = dummyAvailableFamilies; // 👈 dummy data


        setJoinedFamilies(joined);
        setAvailableFamilies(available);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const dummyAvailableFamilies: ProgramFamily[] = [
  {
    id: 1,
    title: 'أسرة الإبداع',
    subtitle: 'تهتم بتنمية المهارات الفنية والثقافية',
    place: 'كلية الحاسبات والمعلومات',
    views: '25 عضو',
    description: 'أسرة فنية وثقافية',
    createdAt: '01/01/2025',
    image: '/api/placeholder/300/200',
  },
  {
    id: 2,
    title: 'أسرة القادة',
    subtitle: 'إعداد قادة المستقبل وتنمية الشخصية',
    place: 'كلية التجارة',
    views: '40 عضو',
    description: 'أسرة قيادية',
    createdAt: '10/12/2024',
    image: '/api/placeholder/300/200',
  },
  {
    id: 3,
    title: 'أسرة المتطوعين',
    subtitle: 'العمل المجتمعي والخيري',
    place: 'كلية الآداب',
    views: '18 عضو',
    description: 'أنشطة تطوعية',
    createdAt: '05/11/2024',
    image: '/api/placeholder/300/200',
  },
];


  /* ======================
     RENDER
  ====================== */
   return (
    <div dir="rtl" className="container">

      {/* ===== أسرك الحالية ===== */}
      <section className="joined-section">
        <header className="header">
          <h1>أسرك الحالية</h1>
        </header>
        <div className="gold-line"></div>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '40px', color: '#777' }}>جاري التحميل...</p>
        ) : joinedFamilies.length === 0 ? (
          <div className="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p style={{ fontSize: '16px', margin: '0' }}>لم تنضم لأي أسرة بعد</p>
            <p style={{ fontSize: '14px', marginTop: '8px', opacity: 0.7 }}>تصفح الأسر المتاحة وانضم لإحداها</p>
          </div>
        ) : (
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
        )}
      </section>

      {/* ===== الأسر المتاحة ===== */}
      <header className="header">
        <h1>الأسر المتاحة للانضمام</h1>
      </header>
      <div className="gold-line"></div>

      {error && (
        <div className="error-box">
          <p>{error}</p>
        </div>
      )}

      <main className="programs-grid">
        {loading ? (
          <p>جاري التحميل...</p>
        ) : availableFamilies.length === 0 ? (
          <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#777' }}>لا توجد أسر متاحة حالياً</p>
        ) : (
          availableFamilies.map(program => (
            <div key={program.id} className="program-card">
              <div className="program-image">
                <img src={program.image} alt={program.title} />
              </div>

              <div className="program-content">
                <h3>{program.title}</h3>
                <p className="goals-title">وصف الأسرة : {program.subtitle}</p>
                <p className="goals-title">العدد الحالي : {program.views}</p>
                <p className="goals-title">المكان : {program.place}</p>

                <button
                  className="join-btn"
                  onClick={() => joinFamily(program.id)}
                  disabled={joiningId === program.id}
                >
                  {joiningId === program.id ? 'جاري الانضمام...' : 'انضم للأسرة'}
                </button>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
};