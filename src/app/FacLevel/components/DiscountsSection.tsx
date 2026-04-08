"use client";

import React, { useEffect, useState } from "react";
import styles from "../Styles/DiscountsSection.module.css";
import { authFetch } from "@/utils/globalFetch";

type DiscountsState = {
  books: string[];
  distant: string[];
  regular: string[];
  full: string[];
};

const API_GET =
  `${process.env.NEXT_PUBLIC_BASE_URL}/api/solidarity/faculty/faculty/discounts/`;
const API_PATCH =
  `${process.env.NEXT_PUBLIC_BASE_URL}/api/solidarity/faculty/update_faculty_discounts/`;

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

  const serverToLocal = (data: Record<string, unknown>): DiscountsState => {
    const asArrayOfStrings = (v: unknown) =>
      Array.isArray(v) ? v.map((x) => String(x)) : [];

    return {
      books: asArrayOfStrings(data?.bk_discount ?? []),
      distant: asArrayOfStrings(data?.aff_discount ?? []),
      regular: asArrayOfStrings(data?.reg_discount ?? []),
      full: asArrayOfStrings(data?.full_discount ?? []),
    };
  };

  const localToServer = (local: DiscountsState) => ({
    bk_discount: local.books
      .map((v) => Number(v))
      .filter((n) => !Number.isNaN(n)),
    aff_discount: local.distant
      .map((v) => Number(v))
      .filter((n) => !Number.isNaN(n)),
    reg_discount: local.regular
      .map((v) => Number(v))
      .filter((n) => !Number.isNaN(n)),
    full_discount: local.full
      .map((v) => Number(v))
      .filter((n) => !Number.isNaN(n)),
  });

  const fetchDiscounts = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await authFetch(API_GET, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`GET failed: ${res.status} ${errorText}`);
      }

      const json = await res.json();
      const serverDiscounts = json?.discounts ?? json;
      const mapped = serverToLocal(serverDiscounts);

      setDiscounts({
        books: mapped.books.length ? mapped.books : [""],
        distant: mapped.distant.length ? mapped.distant : [""],
        regular: mapped.regular.length ? mapped.regular : [""],
        full: mapped.full.length ? mapped.full : [""],
      });
    } catch (err: unknown) {
      console.error("GET error:", err);
      setError(`فشل جلب البيانات — ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (
    type: keyof DiscountsState,
    index: number,
    value: string
  ) => {
    setDiscounts((prev) => {
      const updated = [...prev[type]];
      updated[index] = value;
      return { ...prev, [type]: updated };
    });
  };

  const handleAddDiscount = (type: keyof DiscountsState) => {
    setDiscounts((prev) => ({
      ...prev,
      [type]: [...prev[type], ""],
    }));
  };

  const handleRemoveDiscount = (type: keyof DiscountsState, index: number) => {
    if (discounts[type].length <= 1) return;

    setDiscounts((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };
const handleSave = async () => {
  setSaving(true);
  setError(null);

  const payload = localToServer(discounts);
  console.log("PATCH payload:", payload);

  try {
    const res = await authFetch(API_PATCH, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access")}`,
      },
      body: JSON.stringify(payload),
    });

    const responseText = await res.text();
    console.log("PATCH status:", res.status);
    console.log("PATCH response text:", responseText);

    if (!res.ok) {
      throw new Error(`PATCH failed: ${res.status} ${responseText}`);
    }

    await fetchDiscounts();
    setIsEditing(false);
  } catch (err: unknown) {
    console.error("Save error:", err);
    setError(err instanceof Error ? err.message : "Unknown error");
  } finally {
    setSaving(false);
  }
};

  const renderInputs = (type: keyof DiscountsState) =>
    (discounts[type].length ? discounts[type] : [""]).map((val, idx) => (
      <div key={idx} className={styles.inputWrapper}>
        <input
          type="text"
          value={val}
          onChange={(e) => handleChange(type, idx, e.target.value)}
          className={styles.discountInput}
          placeholder="أدخل قيمة الخصم"
        />
        {isEditing && discounts[type].length > 1 && (
          <button
            type="button"
            className={styles.removeBtn}
            onClick={() => handleRemoveDiscount(type, idx)}
            title="إزالة الخصم"
          >
            ×
          </button>
        )}
      </div>
    ));

  const renderCard = (type: keyof DiscountsState, title: string) => (
    <div className={styles.card}>
      <h4>{title}</h4>
      {isEditing ? (
        <div className={styles.editableSection}>
          {renderInputs(type)}
          <button
            type="button"
            className={styles.addBtn}
            onClick={() => handleAddDiscount(type)}
            title="إضافة خصم جديد"
          >
            + إضافة خصم
          </button>
        </div>
      ) : (
        discounts[type].map((d, i) => <p key={i}>{d}</p>)
      )}
    </div>
  );

  return (
    <div className={styles.container}>
      {loading && <div>جارٍ التحميل...</div>}

      <div className={styles.cards}>
        {renderCard("books", "خصم مصاريف الكتب")}
        {renderCard("distant", "خصم مصاريف انتساب")}
        {renderCard("regular", "خصم مصاريف انتظام")}
        {renderCard("full", "خصم المصاريف الكاملة")}
      </div>

      <div className={styles.actions}>
        {isEditing ? (
          <button
            className={styles.saveBtn}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "جاري الحفظ..." : "حفظ"}
          </button>
        ) : (
          <button
            className={styles.editBtn}
            onClick={() => setIsEditing(true)}
          >
            تعديل
          </button>
        )}

        {error && <div className={styles.error}>{error}</div>}
      </div>
    </div>
  );
}