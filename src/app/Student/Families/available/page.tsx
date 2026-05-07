'use client';
import React, { useState, useEffect } from 'react';
import { authFetch, getBaseUrl } from "@/utils/globalFetch";
import { useToast } from "@/app/context/ToastContext";
import { useRouter } from 'next/navigation';
import styles from './AvailableFamilies.module.css';

interface ApiFamily {
  family_id: number;
  name: string;
  description: string;
  faculty_name: string;
  type: string;
  status: string;
  member_count: number;
}

interface Family {
  id: number;
  name: string;
  description: string;
  facultyName: string;
  type: string;
  memberCount: number;
}

/* ══════════════════════════════════════════════════════════════
   ICONS
══════════════════════════════════════════════════════════════ */
const IconArrowRight = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M19 12H5M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconUsers = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="10" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconLocation = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const IconFlag = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="4" y1="22" x2="4" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const IconMessage = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconSearch = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
    <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
export default function AvailableFamiliesPage() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [filteredFamilies, setFilteredFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { showToast } = useToast();
  const router = useRouter();

  const extractArray = (data: Record<string, unknown>): Record<string, unknown>[] => {
    if (Array.isArray(data)) return data;
    if (data?.results && Array.isArray(data.results)) return data.results;
    if (data?.families && Array.isArray(data.families)) return data.families;
    if (data?.data && Array.isArray(data.data)) return data.data;
    return [];
  };

  const mapToFamily = (family: ApiFamily): Family => ({
    id: family.family_id,
    name: family.name,
    description: family.description,
    facultyName: family.faculty_name,
    type: family.type,
    memberCount: family.member_count,
  });

  useEffect(() => {
    const fetchFamilies = async () => {
      try {
        setLoading(true);
        const res = await authFetch(`${getBaseUrl()}/api/family/student/available/`);
        
        if (!res.ok) throw new Error('فشل تحميل الأسر المتاحة');
        
        const data = await res.json();
        const familiesData = extractArray(data).map((f: Record<string, unknown>) =>
          mapToFamily(f as unknown as ApiFamily)
        );
        
        setFamilies(familiesData);
        setFilteredFamilies(familiesData);
      } catch (err) {
        showToast((err as Error).message || 'حدث خطأ أثناء تحميل البيانات', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchFamilies();
  }, [showToast]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredFamilies(families);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = families.filter(
      (f) =>
        f.name.toLowerCase().includes(query) ||
        f.description.toLowerCase().includes(query) ||
        f.type.toLowerCase().includes(query) ||
        f.facultyName.toLowerCase().includes(query)
    );
    setFilteredFamilies(filtered);
  }, [searchQuery, families]);

  const handleJoin = async (familyId: number) => {
    try {
      setJoiningId(familyId);

      const res = await authFetch(
        `${getBaseUrl()}/api/family/student/${familyId}/join/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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

      showToast('تم إرسال طلب الانضمام بنجاح!', 'success');
      
      setTimeout(() => {
        router.push('/Student/Families');
      }, 1500);
    } catch (err) {
      showToast((err as Error).message || 'حدث خطأ أثناء الانضمام', 'error');
    } finally {
      setJoiningId(null);
    }
  };

  return (
    <div dir="rtl" className={styles.container}>
      {/* Hero Section */}
      <div className={styles.hero}>
        <div className={styles.heroTopAccent} />
        <div className={styles.heroGlow} />
        
        <div className={styles.heroBackButton}>
          <button onClick={() => router.back()} className={styles.backLink}>
            <IconArrowRight size={16} />
            العودة
          </button>
        </div>

        <div className={styles.heroContent}>
          
          </div>
          <div className={styles.heroText}>
            <h1>الأسر المتاحة للانضمام</h1>
            
            <p>اكتشف الأسر الطلابية وانضم إلى المجتمع الذي يناسبك</p>
          </div>
        
        
        
        
      </div>

      {/* Search Bar */}
      <div className={styles.searchSection}>
        <div className={styles.searchBar}>
          <IconSearch size={20} />
          <input
            type="text"
            placeholder="ابحث عن أسرة بالاسم، النوع، أو الكلية..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className={styles.clearButton}
            >
              ✕
            </button>
          )}
        </div>
        {searchQuery && (
          <p className={styles.searchResults}>
            {filteredFamilies.length} نتيجة
          </p>
        )}
      </div>

      {/* Content */}
      <div className={styles.content}>
        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <p>جاري تحميل الأسر المتاحة...</p>
          </div>
        ) : filteredFamilies.length === 0 ? (
          <div className={styles.emptyState}>
            <IconSearch size={64} />
            <h3>
              {searchQuery ? 'لا توجد نتائج' : 'لا توجد أسر متاحة حالياً'}
            </h3>
            <p>
              {searchQuery
                ? 'جرب البحث بكلمات مختلفة'
                : 'تحقق مرة أخرى لاحقاً'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={styles.clearSearchButton}
              >
                مسح البحث
              </button>
            )}
          </div>
        ) : (
          <div className={styles.familiesGrid}>
            {filteredFamilies.map((family) => (
              <div key={family.id} className={styles.familyCard}>
                <div className={styles.cardAccent} />
                
                <div className={styles.cardHeader}>
                  <div className={styles.cardIcon}>
                    <IconUsers size={22} />
                  </div>
                  <h3 className={styles.cardTitle}>{family.name}</h3>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.infoRow}>
                    <div className={styles.infoLabel}>
                      <IconMessage size={14} />
                      <span>الوصف</span>
                    </div>
                    <p className={styles.infoValue}>{family.description}</p>
                  </div>

                  <div className={styles.infoRow}>
                    <div className={styles.infoLabel}>
                      <IconFlag size={14} />
                      <span>النوع</span>
                    </div>
                    <p className={styles.infoValue}>{family.type}</p>
                  </div>

                  <div className={styles.infoRow}>
                    <div className={styles.infoLabel}>
                      <IconLocation size={14} />
                      <span>الكلية</span>
                    </div>
                    <p className={styles.infoValue}>{family.facultyName}</p>
                  </div>

                  <div className={styles.infoRow}>
                    <div className={styles.infoLabel}>
                      <IconUsers size={14} />
                      <span>الأعضاء</span>
                    </div>
                    <p className={styles.infoValue}>{family.memberCount} عضو</p>
                  </div>
                </div>

                <button
                  onClick={() => handleJoin(family.id)}
                  disabled={joiningId === family.id}
                  className={styles.joinButton}
                >
                  {joiningId === family.id ? (
                    <>
                      <span className={styles.buttonSpinner} />
                      جاري الانضمام...
                    </>
                  ) : (
                    <>
                      <IconUsers size={18} />
                      انضم للأسرة
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
