"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Users, Plus } from "lucide-react";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";
import { useToast } from "@/app/context/ToastContext";
import { useRouter } from "next/navigation";
import styles from "./styles/unions.module.css";

const API_URL = `${getBaseUrl()}/api`;

interface Faculty {
  faculty_id: number;
  name: string;
}

interface Union {
  family_id: number;
  name: string;
  description: string;
  faculty: number | null;
  faculty_name: string | null;
  type: string;
  status: string;
  created_at: string;
  updated_at: string;
  president_name: string | null;
  vice_president_name: string | null;
  member_count: number;
}

export default function UnionsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [unions, setUnions] = useState<Union[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFaculty, setSelectedFaculty] = useState<string>("all");

  // Fetch faculties
  const fetchFaculties = useCallback(async () => {
    try {
      const response = await authFetch(`${API_URL}/family/faculties/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.warn("Faculties endpoint not available");
        return;
      }
      const data = await response.json();
      setFaculties(data);
    } catch (error) {
      console.warn("Error fetching faculties:", error);
    }
  }, []);

  // Fetch unions
  const fetchUnions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await authFetch(`${API_URL}/family/unions/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `خطأ: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Unions data:', data); // Debug log
      setUnions(data);
    } catch (error) {
      console.error("Error fetching unions:", error);
      showToast("فشل تحميل الاتحادات", "error");
      setUnions([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchFaculties();
    fetchUnions();
  }, [fetchFaculties, fetchUnions]);

  // Filter unions by faculty
  const filteredUnions = selectedFaculty === "all" 
    ? unions 
    : unions.filter(u => u.faculty?.toString() === selectedFaculty);

  // Group unions by faculty
  const groupedUnions = filteredUnions.reduce((acc, union) => {
    const key = union.faculty_name || "اتحادات عامة";
    if (!acc[key]) acc[key] = [];
    acc[key].push(union);
    return acc;
  }, {} as Record<string, Union[]>);

  const handleCreateUnion = (facultyId?: number) => {
    if (facultyId) {
      router.push(`/uni-level-family/unions/create?faculty=${facultyId}`);
    } else {
      router.push(`/uni-level-family/unions/create`);
    }
  };

  const handleViewUnion = (unionId: number) => {
    router.push(`/uni-level-family/unions/${unionId}`);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingWrap}>
          <div className={styles.spinner} />
          <p className={styles.loadingText}>جاري تحميل الاتحادات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>إدارة الاتحادات</h1>
          <p className={styles.subtitle}>إدارة ومتابعة اتحادات الطلاب على مستوى الكليات</p>
        </div>
      </header>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Users size={24} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>إجمالي الاتحادات</p>
            <p className={styles.statValue}>{unions.length}</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Users size={24} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>اتحادات الكليات</p>
            <p className={styles.statValue}>{unions.filter(u => u.faculty).length}</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Users size={24} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>اتحادات عامة</p>
            <p className={styles.statValue}>{unions.filter(u => !u.faculty).length}</p>
          </div>
        </div>
      </div>

      {/* Filter */}
      {faculties.length > 0 && (
        <div className={styles.filterSection}>
          <label className={styles.filterLabel}>تصفية حسب الكلية:</label>
          <select 
            className={styles.filterSelect}
            value={selectedFaculty}
            onChange={(e) => setSelectedFaculty(e.target.value)}
          >
            <option value="all">جميع الكليات</option>
            {faculties.map(faculty => (
              <option key={faculty.faculty_id} value={faculty.faculty_id.toString()}>
                {faculty.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className={styles.content}>
        {Object.keys(groupedUnions).length === 0 ? (
          <div className={styles.emptyState}>
            <Users size={52} strokeWidth={1.4} />
            <h3>لا توجد اتحادات</h3>
            <p>لم يتم إنشاء أي اتحاد حتى الآن</p>
            <button 
              className={styles.createBtn}
              onClick={() => handleCreateUnion()}
              style={{ marginTop: '20px' }}
            >
              <Plus size={18} />
              <span>إنشاء اتحاد جديد</span>
            </button>
          </div>
        ) : (
          Object.entries(groupedUnions).map(([facultyName, facultyUnions]) => (
            <div key={facultyName} className={styles.facultySection}>
              <div className={styles.facultyHeader}>
                <h2 className={styles.facultyTitle}>{facultyName}</h2>
                <button 
                  className={styles.createBtn}
                  onClick={() => {
                    const faculty = faculties.find(f => f.name === facultyName);
                    handleCreateUnion(faculty?.faculty_id);
                  }}
                >
                  <Plus size={18} />
                  <span>إنشاء اتحاد</span>
                </button>
              </div>
              <div className={styles.unionsGrid}>
                {facultyUnions.map(union => (
                  <div 
                    key={union.family_id} 
                    className={styles.unionCard}
                    onClick={() => handleViewUnion(union.family_id)}
                  >
                    <div className={styles.unionHeader}>
                      <h3 className={styles.unionName}>{union.name}</h3>
                      <span className={`${styles.statusBadge} ${styles[union.status]}`}>
                        {union.status}
                      </span>
                    </div>
                    <p className={styles.unionDescription}>{union.description}</p>
                    <div className={styles.unionInfo}>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>الرئيس:</span>
                        <span className={styles.infoValue}>{union.president_name || "غير محدد"}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>نائب الرئيس:</span>
                        <span className={styles.infoValue}>{union.vice_president_name || "غير محدد"}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>عدد الأعضاء:</span>
                        <span className={styles.infoValue}>{union.member_count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
