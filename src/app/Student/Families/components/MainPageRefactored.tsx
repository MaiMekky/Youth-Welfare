'use client';
/**
 * Main Families Page - Refactored
 * Displays student's current families and browse option
 */
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { authFetch, getBaseUrl } from '@/utils/globalFetch';
import { useToast } from '@/app/context/ToastContext';
import { Section, SectionHeader, SectionBody, EmptyState, LoadingState } from './ui/Section';
import { Tabs, TabPanel } from './ui/Tabs';
import { FamiliesGrid } from './families/FamiliesGrid';
import { PendingFamiliesList } from './families/PendingFamiliesList';
import { Button } from './ui/Button';
import type { ProgramFamily, ApiFamily } from '../types';
import styles from '../styles/MainPageRefactored.module.css';

interface MainPageProps {
  onViewFamilyDetails?: (family: ProgramFamily) => void;
}

/* ── Icons ── */
const IconUsers = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
    viewBox="0 0 24 24">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const IconCheck = () => <span style={{ fontSize: '16px' }}>✓</span>;
const IconClock = () => <span style={{ fontSize: '16px' }}>⏳</span>;

const IconSearch = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const IconArrowLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    viewBox="0 0 24 24">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

const IconEmptyFamilies = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const IconEmptyAccepted = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IconEmptyPending = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

/* ── Helpers ── */
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

export default function MainPageRefactored({ onViewFamilyDetails }: MainPageProps) {
  const [joinedFamilies, setJoinedFamilies] = useState<ProgramFamily[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'accepted' | 'pending'>('accepted');
  const { showToast } = useToast();

  const acceptedFamilies = joinedFamilies.filter(f => isAccepted(f.memberStatus));
  const pendingFamilies = joinedFamilies.filter(f => !isAccepted(f.memberStatus));

  /* ── Fetch ── */
  const fetchJoinedFamilies = async () => {
    const res = await authFetch(`${getBaseUrl()}/api/family/student/families/`);
    if (!res.ok) throw new Error('فشل تحميل الأسر الحالية');
    const data = await res.json();
    return extractArray(data)
      .filter((f: Record<string, unknown>) => !isElderBrother((f as unknown as ApiFamily).role))
      .map((f: Record<string, unknown>) => mapToProgramFamily(f as unknown as ApiFamily));
  };

  /* ── Load ── */
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const joined = await fetchJoinedFamilies();
        setJoinedFamilies(joined);
        if (!joined.some(f => isAccepted(f.memberStatus)) && joined.length > 0) {
          setActiveTab('pending');
        }
      } catch (err: unknown) {
        showToast((err as Error).message || 'فشل تحميل البيانات', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tabs = [
    {
      id: 'accepted',
      label: 'الأسر المقبولة',
      icon: <IconCheck />,
      count: acceptedFamilies.length,
    },
    {
      id: 'pending',
      label: 'طلبات الانضمام',
      icon: <IconClock />,
      count: pendingFamilies.length,
    },
  ];

  return (
    <div dir="rtl" className={styles.container}>
      {/* ── Current Families Section ── */}
      <Section>
        <SectionHeader
          icon={<IconUsers />}
          title="أسرك الحالية"
          subtitle="الأسر التي انضممت إليها أو تنتظر قبول طلبك"
          badge={joinedFamilies.length > 0 ? joinedFamilies.length : undefined}
        />
        <SectionBody>
          {loading ? (
            <LoadingState />
          ) : joinedFamilies.length === 0 ? (
            <EmptyState
              icon={<IconEmptyFamilies />}
              title="لم تنضم لأي أسرة بعد"
              description="تصفح الأسر المتاحة أدناه وانضم لإحداها"
            />
          ) : (
            <>
              <Tabs
                tabs={tabs}
                activeTab={activeTab}
                onChange={(id) => setActiveTab(id as 'accepted' | 'pending')}
              />

              <TabPanel value="accepted" activeValue={activeTab}>
                {acceptedFamilies.length === 0 ? (
                  <EmptyState
                    icon={<IconEmptyAccepted />}
                    title="لا توجد أسر مقبولة بعد"
                    description="ستظهر هنا الأسر التي تمت الموافقة على انضمامك إليها"
                  />
                ) : (
                  <FamiliesGrid
                    families={acceptedFamilies}
                    onViewDetails={onViewFamilyDetails || (() => {})}
                  />
                )}
              </TabPanel>

              <TabPanel value="pending" activeValue={activeTab}>
                {pendingFamilies.length === 0 ? (
                  <EmptyState
                    icon={<IconEmptyPending />}
                    title="لا توجد طلبات معلقة"
                  />
                ) : (
                  <PendingFamiliesList families={pendingFamilies} />
                )}
              </TabPanel>
            </>
          )}
        </SectionBody>
      </Section>

      {/* ── Browse Available Families ── */}
      <div className={styles.browseSection}>
        <div className={styles.browseCard}>
          <div className={styles.browseIcon}>
            <IconSearch />
          </div>
          <div className={styles.browseContent}>
            <h3 className={styles.browseTitle}>اكتشف الأسر المتاحة</h3>
            <p className={styles.browseDescription}>
              تصفح جميع الأسر الطلابية المتاحة وانضم إلى المجتمع الذي يناسبك
            </p>
          </div>
          <Link href="/Student/Families/available" className={styles.browseLink}>
            <Button
              variant="secondary"
              size="lg"
              icon={<IconArrowLeft />}
              iconPosition="right"
            >
              تصفح الأسر المتاحة
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
