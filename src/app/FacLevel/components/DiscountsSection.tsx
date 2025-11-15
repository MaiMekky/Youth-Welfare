"use client";
import React, { useEffect, useState } from "react";
import styles from "../Styles/DiscountsSection.module.css";
import api from "../../../services/api";

type DiscountsState = {
  books: string[];
  distant: string[]; // aff_discount
  regular: string[]; // reg_discount
  full: string[]; // full_discount
};

const API_GET = "/solidarity/faculty/faculty/discounts/";
const API_PATCH = "/solidarity/faculty/update_faculty_discounts/";

export default function DiscountsSection() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [discounts, setDiscounts] = useState<DiscountsState>({
    books: ["200", "300", "400", "500", "700"],
    distant: ["200", "300", "400", "500", "700"],
    regular: ["200", "300", "400", "500", "700"],
    full: ["200", "300", "400", "500", "700"],
  });

  const serverToLocal = (data: any): DiscountsState => {
    const asArrayOfStrings = (v: any) => (Array.isArray(v) ? v.map((x) => String(x)) : []);
    return {
      books: asArrayOfStrings(data?.bk_discount ?? []),
      distant: asArrayOfStrings(data?.aff_discount ?? []),
      regular: asArrayOfStrings(data?.reg_discount ?? []),
      full: asArrayOfStrings(data?.full_discount ?? []),
    };
  };

  const localToServer = (local: DiscountsState) => ({
    aff_discount: local.distant.map((v) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    }),
    reg_discount: local.regular.map((v) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    }),
    bk_discount: local.books.map((v) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    }),
    full_discount: local.full.map((v) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    }),
  });

  const fetchDiscounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(API_GET);
      const serverDiscounts = res.data?.discounts ?? res.data;
      const mapped = serverToLocal(serverDiscounts);
      setDiscounts((prev) => ({
        books: mapped.books.length ? mapped.books : prev.books,
        distant: mapped.distant.length ? mapped.distant : prev.distant,
        regular: mapped.regular.length ? mapped.regular : prev.regular,
        full: mapped.full.length ? mapped.full : prev.full,
      }));
    } catch (err: any) {
      console.error("GET error:", err);
      const details =
        err?.response?.status && err?.response?.data
          ? `Status ${err.response.status}: ${JSON.stringify(err.response.data)}`
          : err?.message ?? "Unknown error";
      setError(`فشل جلب البيانات — ${details}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (type: keyof DiscountsState, index: number, value: string) => {
    setDiscounts((prev) => {
      const updated = [...prev[type]];
      if (index >= updated.length) {
        for (let i = updated.length; i <= index; i++) updated[i] = "";
      }
      updated[index] = value;
      return { ...prev, [type]: updated };
    });
  };

  const attemptSave = async (method: "patch" | "put", payload: any) => {
    // returns response or throws
    if (method === "patch") return api.patch(API_PATCH, payload);
    return api.put(API_PATCH, payload);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    const payload = localToServer(discounts);
    console.log("Attempting save payload:", payload);

    try {
      // Try PATCH first
      let res;
      try {
        res = await attemptSave("patch", payload);
      } catch (err: any) {
        // If PATCH not allowed or not found, try PUT as fallback
        const status = err?.response?.status;
        console.warn("PATCH failed:", status, err?.response?.data ?? err?.message);
        if (status === 404 || status === 405) {
          console.log("Trying PUT fallback...");
          res = await attemptSave("put", payload);
        } else {
          throw err;
        }
      }

      // If we reach here, request succeeded
      console.log("Save response:", res?.status, res?.data);

      // Re-fetch from server to reflect DB state (this ensures UI shows saved values from DB)
      await fetchDiscounts();

      setIsEditing(false);
    } catch (err: any) {
      console.error("Save error:", err);
      // Build a helpful error message for UI
      if (err?.response) {
        const resp = err.response;
        const body = resp.data ? JSON.stringify(resp.data) : "";
        setError(`حصل خطأ أثناء الحفظ — ${resp.status} ${resp.statusText} ${body}`);
      } else {
        setError(`حصل خطأ أثناء الحفظ — ${err?.message ?? "Unknown error"}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const renderInputs = (type: keyof DiscountsState) =>
    (discounts[type].length ? discounts[type] : [""]).map((val, idx) => (
      <input
        key={idx}
        type="text"
        value={val}
        onChange={(e) => handleChange(type, idx, e.target.value)}
        className={styles.discountInput}
      />
    ));

  return (
    <div className={styles.container}>
      {loading && <div>جارٍ التحميل...</div>}

      <div className={styles.cards}>
        <div className={styles.card}>
          <h4>خصم مصاريف الكتب</h4>
          {isEditing ? renderInputs("books") : discounts.books.map((d, i) => <p key={i}>{d}</p>)}
        </div>

        <div className={styles.card}>
          <h4>خصم مصاريف انتساب</h4>
          {isEditing ? renderInputs("distant") : discounts.distant.map((d, i) => <p key={i}>{d}</p>)}
        </div>

        <div className={styles.card}>
          <h4>خصم مصاريف انتظام</h4>
          {isEditing ? renderInputs("regular") : discounts.regular.map((d, i) => <p key={i}>{d}</p>)}
        </div>

        <div className={styles.card}>
          <h4>خصم المصاريف الكاملة</h4>
          {isEditing ? renderInputs("full") : discounts.full.map((d, i) => <p key={i}>{d}</p>)}
        </div>
      </div>

      <div className={styles.actions}>
        {isEditing ? (
          <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
            {saving ? "جاري الحفظ..." : "حفظ"}
          </button>
        ) : (
          <button className={styles.editBtn} onClick={() => setIsEditing(true)}>
            تعديل
          </button>
        )}
        {error && <div className={styles.error}>{String(error)}</div>}
      </div>
    </div>
  );
}