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

        {joinedFamilies.map(fam => (
          <div key={fam.id} className="joined-card">
            <h3>{fam.title}</h3>
            <p>{fam.subtitle}</p>
            <div className="joined-meta">
              <span>الأعضاء: {fam.views}</span>
            </div>
            <button
              className="view-details-btn"
              onClick={() => onViewFamilyDetails?.(fam)}
            >
              عرض التفاصيل
            </button>
          </div>
        ))}
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
}
