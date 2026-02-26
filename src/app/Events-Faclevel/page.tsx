"use client";

import React, { useEffect, useMemo, useState } from "react";
import styles from "./styles/EventsPage.module.css";
import EventsGrid from "./components/EventsGrid";
import StatsGrid from "./components/StatsGrid";
import type { StatItem } from "./components/StatsGrid";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import Header from "@/app/FacLevel/components/Header";
import Footer from "@/app/FacLevel/components/Footer";
import Tabs from "./components/Tabs";

const API_URL = "http://localhost:8000";

type ApiEvent = {
  event_id: number;
  title: string;
  description: string;
  st_date: string;
  end_date: string;
  location: string;
  status: string;
  type: string;
  cost: string;
  s_limit: number;
  faculty_id: number | null;
  dept_id: number;
  active?: boolean;
};

export type EventRow = {
  id: number;
  title: string;
  plan: string;
  type: string;
  status: string;
  date: string;
  time: string;
  place: string;
  participants: string;
  cost: string;

  // ✅ new
  scope: "global" | "faculty";
  isActive: boolean;
};

type TabKey = "global" | "faculty";

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
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers as any),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(`${API_URL}${path}`, { ...opts, headers });
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
        (typeof maybeJson === "object" && maybeJson && (maybeJson.detail || maybeJson.message)) ||
        (typeof maybeJson === "string" ? maybeJson : "") ||
        `طلب غير ناجح (${res.status})`;
      return { ok: false, message: String(msg), status: res.status, raw: maybeJson };
    }

    return { ok: true, data: maybeJson as T };
  } catch (e: any) {
    return { ok: false, message: e?.message || "مشكلة في الاتصال" };
  }
}

function toPriceText(cost: string) {
  const n = Number(String(cost || "").replaceAll(",", "").trim());
  if (!Number.isFinite(n) || n === 0) return "مجاني";
  return `${n} جنيه`;
}

function toEventRow(e: ApiEvent): EventRow {
  const apiActive = typeof e.active === "boolean" ? e.active : null;
  const isActive = apiActive ?? (String(e.status || "").trim() === "نشط");

  const scope: EventRow["scope"] = e.faculty_id ? "faculty" : "global";

  return {
    id: e.event_id,
    title: e.title ?? "",
    plan: e.description ?? "",
    type: e.type ?? "—",
    status: e.status ?? "—",
    date: e.st_date ?? "",
    time: e.end_date ?? "", // لو عندك وقت فعلي من API بدّليه هنا
    place: e.location ?? "—",
    participants: `الحد الأقصى: ${e.s_limit ?? 0}`,
    cost: toPriceText(e.cost),
    scope,
    isActive,
  };
}

export default function EventsFaclevelPage() {
  const router = useRouter();

  const [tab, setTab] = useState<TabKey>("faculty");
  const [rowsAll, setRowsAll] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [busyId, setBusyId] = useState<number | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    const res = await apiFetch<ApiEvent[]>("/api/event/get-events/", { method: "GET" });
    setLoading(false);

    if (!res.ok) {
      window.alert(res.message);
      return;
    }

    const list = Array.isArray(res.data) ? res.data : [];
    setRowsAll(list.map(toEventRow));
  };

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rows = useMemo(() => rowsAll.filter((e) => e.scope === tab), [rowsAll, tab]);
const stats: StatItem[] = useMemo(() => {
  const total = rows.length;
  const active = rows.filter((e) => e.isActive).length;
  const inactive = rows.filter((e) => !e.isActive).length;

  return [
    { title: "إجمالي الفعاليات", value: String(total), meta: "", icon: "calendar", accent: "gold" },
    { title: "الفعاليات النشطة", value: String(active), meta: "", icon: "check", accent: "green" },
    { title: "فعاليات غير نشطة", value: String(inactive), meta: "", icon: "clock", accent: "indigo" },
  ];
}, [rows]);
    const registeredStudents = 0;

    

  const onCreate = () => router.push("/Events-Faclevel/create");
  const onView = (id: number) => router.push(`/Events-Faclevel/${id}`);
  const onEdit = (id: number) => router.push(`/Events-Faclevel/create/${id}`);  
  const onDelete = (id: number) => {
    if (!confirm("هل تريد حذف الفعالية؟")) return;
    setRowsAll((prev) => prev.filter((e) => e.id !== id));
  };

  // ✅ activate فقط لفعاليات الكلية
  const onActiveChange = async (id: number, next: boolean) => {
    const target = rowsAll.find((x) => x.id === id);
    if (!target || target.scope !== "faculty") return;

    setBusyId(id);

    const prev = rowsAll;
    setRowsAll((p) => p.map((e) => (e.id === id ? { ...e, isActive: next } : e)));

    const res = await apiFetch<any>(`/api/event/activate-events/${id}/activate/`, {
      method: "PATCH",
    });

    setBusyId(null);

    if (!res.ok) {
      setRowsAll(prev); // rollback
      window.alert(res.message);
      return;
    }
  };

  return (
    <div className="page-wrapper">
      <Header />

      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.header}>
            <div className={styles.headerText}>
              <h1 className={styles.pageTitle}>إدارة الفعاليات</h1>
              <p className={styles.pageSubtitle}>إدارة فعاليات الجامعة والكلية</p>
            </div>

            <button className={styles.createBtn} type="button" onClick={onCreate}>
              <Plus size={18} />
              إنشاء فعالية جديدة
            </button>
          </div>

          <Tabs
            value={tab}
            onChange={setTab}
            items={[
              { key: "faculty", label: "فعاليات الكلية" },
              { key: "global", label: "فعاليات الجامعة" },
            ]}
          />

          <StatsGrid items={stats} />

          {loading && (
            <div style={{ fontWeight: 800, opacity: 0.8, margin: "10px 0" }}>
              جاري تحميل الفعاليات...
            </div>
          )}

          <EventsGrid
            rows={rows}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
            canDelete={tab === "faculty"}
            onActiveChange={onActiveChange}
            busyId={busyId}
          />
        </div>
      </div>

      <Footer />
    </div>
  );
}