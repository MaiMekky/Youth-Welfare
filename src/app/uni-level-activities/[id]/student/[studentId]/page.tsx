"use client";

import React, { useEffect, useMemo, useState } from "react";
import styles from "./StudentDetails.module.css";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, Mail, Phone, MapPin, User, GraduationCap, IdCard } from "lucide-react";
import { authFetch } from "@/utils/globalFetch";
const API_URL = "http://localhost:8000";

function getAccessToken(): string | null {
  return (
    localStorage.getItem("access") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    null
  );
}

async function apiFetch<T>(
  path: string,
  opts: RequestInit = {}
): Promise<{ ok: true; data: T } | { ok: false; message: string; status?: number; raw?: any }> {
  const token = getAccessToken();
  const headers: Record<string, string> = { ...(opts.headers as any) };
  if (!headers["Content-Type"] && opts.body) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await authFetch(`${API_URL}${path}`, { ...opts, headers });
    const text = await res.text();
    const maybeJson = text
      ? (() => {
          try {
            return JSON.parse(text);
          } catch {
            return text;
          }
        })()
      : null;

    if (!res.ok) {
      const msg =
        (typeof maybeJson === "object" &&
          maybeJson &&
          ((maybeJson as any).detail || (maybeJson as any).message || (maybeJson as any).error)) ||
        (typeof maybeJson === "string" ? maybeJson : "") ||
        `طلب غير ناجح (${res.status})`;
      return { ok: false, message: String(msg), status: res.status, raw: maybeJson };
    }

    return { ok: true, data: maybeJson as T };
  } catch (e: any) {
    return { ok: false, message: e?.message || "مشكلة في الاتصال" };
  }
}

type ApiStudentDetails = {
  student_id: number;
  name: string;
  email: string;
  faculty: number | null;
  gender: string | null;
  nid: string | null;
  uid: string | null;
  phone_number: string | null;
  address: string | null;
  acd_year: string | null;
  grade: string | null;
  major: string | null;
  profile_photo_url: string | null;
  google_picture: string | null;
  is_google_auth: boolean;
  auth_method: string | null;
  last_google_login: string | null;
};

export default function StudentDetailsPage() {
  const router = useRouter();
  const params = useParams();

  const studentId = String(params?.studentId ?? "");

  const [student, setStudent] = useState<ApiStudentDetails | null>(null);
  const [loading, setLoading] = useState(false);

  const loadStudent = async () => {
    if (!studentId) return;
    setLoading(true);
    const res = await apiFetch<ApiStudentDetails>(
      `/api/event/manage-participants/student-details/${studentId}/`,
      { method: "GET" }
    );
    setLoading(false);

    if (!res.ok) {
      window.alert(res.message);
      return;
    }

    setStudent(res.data);
  };

  useEffect(() => {
    loadStudent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  const ui = useMemo(() => {
    if (!student) {
      return {
        name: "",
        subtitle: "تفاصيل كاملة عن بيانات الطالب",
        email: "—",
        uid: "—",
        nid: "—",
        phone: "—",
        address: "—",
        faculty: "—",
        gender: "—",
        major: "—",
        acdYear: "—",
        grade: "—",
        auth: "—",
      };
    }

    return {
      name: student.name ?? "",
      subtitle: "تفاصيل كاملة عن بيانات الطالب",
      email: student.email ?? "—",
      uid: student.uid ?? "—",
      nid: student.nid ?? "—",
      phone: student.phone_number ?? "—",
      address: student.address ?? "—",
      faculty: student.faculty === null || student.faculty === undefined ? "—" : String(student.faculty),
      gender: student.gender ?? "—",
      major: student.major ?? "—",
      acdYear: student.acd_year ?? "—",
      grade: student.grade ?? "—",
      auth: student.auth_method ?? "—",
    };
  }, [student]);

  return (
    <div className={styles.page} dir="rtl">
      <div className={styles.container}>
        <div className={styles.topBar}>
          <div className={styles.headText}>
            <h1 className={styles.pageTitle}>تفاصيل الطالب</h1>
            <p className={styles.pageSubtitle}>{ui.subtitle}</p>
          </div>

          <button className={styles.backBtn} onClick={() => router.push(`/uni-level-activities/${params?.id}`)} type="button">
            <ArrowRight size={18} />
            رجوع
          </button>
        </div>

        {loading && (
          <div style={{ fontWeight: 800, opacity: 0.8, margin: "10px 0" }}>
            جاري تحميل بيانات الطالب...
          </div>
        )}

        <div className={styles.hero}>
          <div className={styles.heroTitle}>{ui.name || "—"}</div>
        </div>

        <section className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <div className={styles.infoLabel}>
              <Mail size={16} /> البريد الإلكتروني
            </div>
            <div className={styles.infoValue} dir="ltr">
              {ui.email}
            </div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoLabel}>
              <IdCard size={16} /> رقم الجامعة
            </div>
            <div className={styles.infoValue} dir="ltr">
              {ui.uid}
            </div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoLabel}>
              <IdCard size={16} /> الرقم القومي
            </div>
            <div className={styles.infoValue} dir="ltr">
              {ui.nid}
            </div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoLabel}>
              <Phone size={16} /> رقم الهاتف
            </div>
            <div className={styles.infoValue} dir="ltr">
              {ui.phone}
            </div>
          </div>

          <div className={`${styles.infoCard} ${styles.infoWide}`}>
            <div className={styles.infoLabel}>
              <MapPin size={16} /> العنوان
            </div>
            <div className={styles.infoValue}>{ui.address}</div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoLabel}>
              <GraduationCap size={16} /> الكلية
            </div>
            <div className={styles.infoValue}>{ui.faculty}</div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoLabel}>
              <User size={16} /> النوع
            </div>
            <div className={styles.infoValue}>{ui.gender}</div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoLabel}>
              <GraduationCap size={16} /> التخصص
            </div>
            <div className={styles.infoValue}>{ui.major}</div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoLabel}>
              <GraduationCap size={16} /> السنة الأكاديمية
            </div>
            <div className={styles.infoValue}>{ui.acdYear}</div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoLabel}>
              <GraduationCap size={16} /> التقدير
            </div>
            <div className={styles.infoValue}>{ui.grade}</div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoLabel}>
              <User size={16} /> طريقة الدخول
            </div>
            <div className={styles.infoValue}>{ui.auth}</div>
          </div>
        </section>
      </div>
    </div>
  );
}