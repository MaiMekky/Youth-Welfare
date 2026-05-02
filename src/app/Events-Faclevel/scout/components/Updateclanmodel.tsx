"use client";
import React, { useState } from "react";
import styles from "../styles/CreateClanModal.module.css";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";
import { useToast } from "@/app/context/ToastContext";
import { X, Shield, Save, AlertCircle } from "lucide-react";
import type { Clan } from "../page";

const API_URL = getBaseUrl();

interface Props {
  clan: Clan;
  onClose: () => void;
  onUpdated: (updated: Clan) => void;
}

type FieldErrors = {
  name?: string;
  description?: string;
};

export default function UpdateClanModal({ clan, onClose, onUpdated }: Props) {
  const { showToast } = useToast();

  const [name, setName]               = useState(clan.name);
  const [description, setDescription] = useState(clan.description);
  const [errors, setErrors]           = useState<FieldErrors>({});
  const [submitting, setSubmitting]   = useState(false);

  /* ── helpers ── */
  const hasChanged =
    name.trim() !== clan.name.trim() ||
    description.trim() !== clan.description.trim();

  const validate = (): boolean => {
    const errs: FieldErrors = {};

    if (!name.trim()) {
      errs.name = "اسم العشيرة مطلوب";
    } else if (name.trim().length < 3) {
      errs.name = "اسم العشيرة يجب أن يكون 3 أحرف على الأقل";
    } else if (name.trim().length > 100) {
      errs.name = "اسم العشيرة يجب ألا يتجاوز 100 حرف";
    }

    if (!description.trim()) {
      errs.description = "وصف العشيرة مطلوب";
    } else if (description.trim().length < 10) {
      errs.description = "الوصف يجب أن يكون 10 أحرف على الأقل";
    } else if (description.trim().length > 500) {
      errs.description = "الوصف يجب ألا يتجاوز 500 حرف";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /* ── submit ── */
  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!hasChanged) {
      showToast("برجاء التعديل أو الغاء التعديل", "warning");
      return;
    }
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await authFetch(`${API_URL}/api/faculty/update_clan/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        showToast(errJson?.message ?? "حدث خطأ أثناء التحديث", "error");
        return;
      }

      const json = await res.json().catch(() => ({}));
      const serverData: Partial<Clan> =
        json?.data?.clan ?? json?.clan ?? json ?? {};

      const merged: Clan = {
        ...clan,
        name: name.trim(),
        description: description.trim(),
        ...serverData,
      };

      onUpdated(merged);
    } catch {
      showToast("حدث خطأ في الاتصال بالخادم", "error");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── clear field error on change ── */
  const handleNameChange = (v: string) => {
    setName(v);
    if (errors.name) setErrors((e) => ({ ...e, name: undefined }));
  };

  const handleDescChange = (v: string) => {
    setDescription(v);
    if (errors.description) setErrors((e) => ({ ...e, description: undefined }));
  };

  return (
    <div className={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.modal} dir="rtl">

        {/* ── Header — identical structure to CreateClanModal ── */}
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderLeft}>
            <div className={styles.modalIcon}>
              <Shield size={22} />
            </div>
            <div>
              <h2 className={styles.modalTitle}>تعديل العشيرة</h2>
              <p className={styles.modalSubtitle}>قم بتعديل بيانات العشيرة أدناه</p>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="إغلاق">
            <X size={20} />
          </button>
        </div>

        {/* ── Form Body ── */}
        <div className={styles.form}>

          {/* Name */}
          <div className={styles.field}>
            <label className={styles.label}>
              اسم العشيرة <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="أدخل اسم العشيرة"
              maxLength={100}
              disabled={submitting}
            />
            {errors.name && (
              <span className={styles.fieldError}>
                <AlertCircle size={13} /> {errors.name}
              </span>
            )}
          </div>

          {/* Description */}
          <div className={styles.field}>
            <label className={styles.label}>
              وصف العشيرة <span className={styles.required}>*</span>
            </label>
            <textarea
              className={`${styles.textarea} ${errors.description ? styles.inputError : ""}`}
              value={description}
              onChange={(e) => handleDescChange(e.target.value)}
              placeholder="أدخل وصفاً للعشيرة"
              rows={4}
              maxLength={500}
              disabled={submitting}
            />
            {errors.description && (
              <span className={styles.fieldError}>
                <AlertCircle size={13} /> {errors.description}
              </span>
            )}
            <span className={styles.hint}>{description.length} / 500</span>
          </div>

          {/* ── Actions ── */}
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={submitting}
            >
              إلغاء
            </button>
            <button
              type="button"
              className={styles.submitBtn}
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className={styles.btnSpinner} />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save size={16} />
                  حفظ التعديلات
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}