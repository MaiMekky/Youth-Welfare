"use client";
import React, { useState } from "react";
import styles from "../styles/CreateClanModal.module.css";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";
import { X, Shield, AlertCircle } from "lucide-react";
import type { Clan } from "../page";

const API_URL = getBaseUrl();

interface Props {
  facultyId: number | null;
  onClose: () => void;
  onCreated: (clan: Clan) => void;
}

interface FormErrors {
  name?: string;
  description?: string;
  min_members?: string;
  general?: string;
}

export default function CreateClanModal({ facultyId, onClose, onCreated }: Props) {
  const [name, setName]               = useState("");
  const [description, setDescription] = useState("");
  const [minMembers, setMinMembers]   = useState<string>("50");
  const [loading, setLoading]         = useState(false);
  const [errors, setErrors]           = useState<FormErrors>({});

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!name.trim())               e.name       = "اسم العشيرة مطلوب";
    else if (name.trim().length < 3) e.name      = "يجب أن يكون الاسم 3 أحرف على الأقل";

    const num = Number(minMembers);
    if (minMembers === "")          e.min_members = "الحد الأدنى للأعضاء مطلوب";
    else if (isNaN(num) || num < 0) e.min_members = "يجب أن يكون الحد الأدنى 0 أو أكثر";
    else if (num < 50)              e.min_members = "يجب أن يكون الحد الأدنى للأعضاء 50 على الأقل";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});

    try {
      const body = {
        name:        name.trim(),
        description: description.trim(),
        faculty:     facultyId ?? 0,
        min_members: Number(minMembers),
      };

      const res = await authFetch(`${API_URL}/api/faculty/create_clan/`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ general: data?.detail || data?.name?.[0] || "حدث خطأ أثناء الإنشاء" });
        return;
      }

      onCreated(data);
    } catch {
      setErrors({ general: "حدث خطأ في الاتصال، حاول مرة أخرى" });
    } finally {
      setLoading(false);
    }
  };

  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className={styles.overlay} onClick={handleBackdrop}>
      <div className={styles.modal}>
        {/* ── Header ── */}
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderLeft}>
            <div className={styles.modalIcon}><Shield size={22} /></div>
            <div>
              <h2 className={styles.modalTitle}>إنشاء عشيرة جديدة</h2>
              <p className={styles.modalSubtitle}>أدخل بيانات العشيرة أدناه</p>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="إغلاق">
            <X size={20} />
          </button>
        </div>

        {/* ── General Error ── */}
        {errors.general && (
          <div className={styles.generalError}>
            <AlertCircle size={16} />
            {errors.general}
          </div>
        )}

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Name */}
          <div className={styles.field}>
            <label className={styles.label}>
              اسم العشيرة <span className={styles.required}>*</span>
            </label>
            <input
              className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
              type="text"
              placeholder="مثال: عشيرة الهندسة"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              disabled={loading}
            />
            {errors.name && (
              <span className={styles.fieldError}>
                <AlertCircle size={13} /> {errors.name}
              </span>
            )}
          </div>

          {/* Description */}
          <div className={styles.field}>
            <label className={styles.label}>الوصف</label>
            <textarea
              className={styles.textarea}
              placeholder="وصف مختصر للعشيرة (اختياري)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
              disabled={loading}
            />
            {errors.description && (
              <span className={styles.fieldError}>
                <AlertCircle size={13} /> {errors.description}
              </span>
            )}
          </div>

          {/* Min Members */}
          <div className={styles.field}>
            <label className={styles.label}>
              الحد الأدنى للأعضاء <span className={styles.required}>*</span>
            </label>
            <input
              className={`${styles.input} ${errors.min_members ? styles.inputError : ""}`}
              type="number"
              placeholder="50"
              value={minMembers}
              onChange={(e) => setMinMembers(e.target.value)}
              min={50}
              disabled={loading}
            />
            <span className={styles.hint}>يجب أن يكون 50 على الأقل</span>
            {errors.min_members && (
              <span className={styles.fieldError}>
                <AlertCircle size={13} /> {errors.min_members}
              </span>
            )}
          </div>

          {/* Faculty (read-only display) */}
          {facultyId && (
            <div className={styles.field}>
              <label className={styles.label}>الكلية</label>
              <div className={styles.readOnly}>كلية رقم {facultyId}</div>
            </div>
          )}

          {/* ── Actions ── */}
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={loading}
            >
              إلغاء
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className={styles.btnSpinner} />
                  جاري الإنشاء...
                </>
              ) : (
                <>
                  <Shield size={16} />
                  إنشاء العشيرة
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}