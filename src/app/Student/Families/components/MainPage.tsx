'use client';
import React, { useState, useEffect } from 'react';
import '../styles/mainpage.css';

interface ApiFamily {
  family_id: number;
  name: string;
  description: string;
  faculty: number;
  faculty_name: string;
  type: string;
  status: string;
  min_limit: number;
  created_at: string;
  member_count: string;
  available_slots: string;
}

interface ProgramFamily {
  id: number;
  title: string;
  subtitle: string;
  place: string;
  views: string;
  deadline?: string;
  goals: string;
  createdAt: string;
  description: string;
  image: string;
}

interface MainPageProps {
  onViewFamilyDetails?: (family: ProgramFamily) => void;
}

export default function MainPage(props: MainPageProps = {}) {
  const { onViewFamilyDetails } = props;
  const [showSuccess, setShowSuccess] = useState(false);
  const [programs, setPrograms] = useState<ProgramFamily[]>([]);
  const [loading, setLoading] = useState(true);

  // Load joined families from localStorage or use default
  const loadJoinedFamilies = (): ProgramFamily[] => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('joinedFamilies');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Error parsing joinedFamilies from localStorage', e);
        }
      }
    }
    return [];
  };

  const [joinedFamilies, setJoinedFamilies] = useState<ProgramFamily[]>(loadJoinedFamilies);
  const [error, setError] = useState<string | null>(null);

  const mapApiResponseToProgram = (family: ApiFamily): ProgramFamily => {
    return {
      id: family.family_id,
      title: family.name,
      subtitle: family.description,
      place: family.faculty_name || 'غير محدد',
      views: `${family.member_count} عضو`,
      goals: family.description,
      createdAt: new Date(family.created_at).getFullYear().toString(),
      description: family.description,
      image: '/api/placeholder/300/200'
    };
  };

  const fetchAvailableFamilies = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access');
      
      if (!token) {
        console.warn('No access token found');
        setPrograms([]);
        setLoading(false);
        return;
      }

      const endpoint = 'http://127.0.0.1:8000/api/family/student/available/';
      console.log('Fetching families from:', endpoint);

      const response = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        console.error('API returned status:', response.status);
        throw new Error(`Failed to fetch families: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('=== FAMILIES API DEBUG ===');
      console.log('Raw response:', data);
      console.log('Response type:', typeof data);
      console.log('Is array?', Array.isArray(data));
      console.log('Response keys:', data ? Object.keys(data) : 'null/undefined');
      
      let familiesArray: ApiFamily[] = [];
      
      if (Array.isArray(data)) {
        console.log('✓ Data is a direct array');
        familiesArray = data;
      } else if (data?.results && Array.isArray(data.results)) {
        console.log('✓ Data has results property:', data.results.length, 'items');
        familiesArray = data.results;
      } else if (data?.families && Array.isArray(data.families)) {
        console.log('✓ Data has families property:', data.families.length, 'items');
        familiesArray = data.families;
      } else if (data?.available_families && Array.isArray(data.available_families)) {
        console.log('✓ Data has available_families property:', data.available_families.length, 'items');
        familiesArray = data.available_families;
      } else if (data?.data && Array.isArray(data.data)) {
        console.log('✓ Data has data property:', data.data.length, 'items');
        familiesArray = data.data;
      } else if (data && typeof data === 'object' && data.family_id) {
        console.log('✓ Data is a single family object, wrapping in array');
        familiesArray = [data];
      } else {
        console.warn('✗ Unable to extract families array from response');
        console.log('Full response structure:', JSON.stringify(data, null, 2));
        console.log('All response properties:');
        if (data && typeof data === 'object') {
          for (const key in data) {
            console.log(`  ${key}:`, data[key]);
          }
        }
      }
      
      console.log('Final familiesArray length:', familiesArray.length);
      const mappedPrograms = familiesArray.map(mapApiResponseToProgram);
      console.log('Mapped programs:', mappedPrograms);
      console.log('Total families loaded:', mappedPrograms.length);
      console.log('=== END DEBUG ===');
      setPrograms(mappedPrograms);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching available families:', error);
      setError(errorMsg);
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  };

  // Reload joined from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('joinedFamilies');
    if (saved) {
      try {
        setJoinedFamilies(JSON.parse(saved));
      } catch {}
    }
  }, []);

  useEffect(() => {
    fetchAvailableFamilies();
  }, []);

  const isJoined = (id: number) => {
    return joinedFamilies.some(fam => fam.id === id);
  };

  // join immediately without modal
  const joinFamily = (family: ProgramFamily) => {
    if (isJoined(family.id)) return;

    const updatedFamilies = [...joinedFamilies, family];
    setJoinedFamilies(updatedFamilies);

    if (typeof window !== 'undefined') {
      localStorage.setItem('joinedFamilies', JSON.stringify(updatedFamilies));
    }

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2500);
  };

  return (
    <div dir="rtl" className="container">

      {/* Success Alert */}
      {showSuccess && (
        <div className="success-alert">
          <p>تم الانضمام للأسرة بنجاح 🎉</p>
        </div>
      )}

      {/* Joined Families Section */}
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

            <p><strong>المكان:</strong> {fam.place}</p>
            
            <button
              className="view-details-btn"
              onClick={() => onViewFamilyDetails?.(fam)}
            >
              عرض التفاصيل
            </button>
          </div>
        ))}
      </section>

      <header className="header">
        <h1>الأسر المتاحة للانضمام</h1>
      </header>
      <div className="gold-line"></div>

      {/* Error Display */}
      {error && (
        <div style={{ 
          gridColumn: '1 / -1', 
          backgroundColor: '#fee', 
          border: '1px solid #f99', 
          color: '#c00', 
          padding: '15px', 
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <p><strong>خطأ:</strong> {error}</p>
        </div>
      )}

      {/* Programs */}
      <main className="programs-grid">
        {loading ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
            <p>جاري تحميل الأسر المتاحة...</p>
          </div>
        ) : programs.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
            <p>لا توجد أسر متاحة للانضمام حالياً</p>
            {error && <p style={{ color: '#c00', marginTop: '10px' }}>تفاصيل الخطأ: {error}</p>}
          </div>
        ) : (
          programs.map(program => (
            <div key={program.id} className="program-card">
              <div className="program-image">
                <img src={program.image} alt={program.title} />
              </div>

              <div className="program-content">
                <h3>{program.title}</h3>

                <span>
                  <p className='goals-title'>وصف الاسرة : {program.subtitle}</p>
                  <p className="goals-title">الاهداف : {program.description}</p>
                  <p className="goals-title">العدد الحالي : {program.views}</p>
                  <p className="goals-title">المكان : {program.place}</p>
                </span>

                <div className="meta">
                  <span>تاريخ انشاء الاسرة : {program.createdAt}</span>
                </div>

                <button
                  disabled={isJoined(program.id)}
                  className={isJoined(program.id) ? "joined-btn" : ""}
                  onClick={() => joinFamily(program)}
                >
                  {isJoined(program.id) ? "منضم بالفعل" : "انضم للأسرة"}
                </button>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}
