"use client";
import React, { useState } from "react";
import styles from "../Members.module.css";
import { X, AlertCircle, Loader2 } from "lucide-react";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";
import { useToast } from "@/app/context/ToastContext";
import type { Member } from "../page";

const API_URL = getBaseUrl();

interface Props {
  member: Member;
  clanId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const ROLES = [
  "قائد العشيرة",
  "مساعد القائد",
  "قائد كبار الجوالة",
  "مساعد قائد كبار الجوالة",
  "قائد مجموعة",
  "مساعد قائد مجموعة",
  "عضو",
];

export default function ChangeRoleModal({ member, clanId, onClose, onSuccess }: Props) {
  const { showToast } = useToast();
  const [newRole, setNewRole] = useState(member.role || "");
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async () => {
    if (!newRole.trim()) {
      showToast("يرجى اختيار دور", "error");
      return;
    }

    if (newRole === member.role) {
      showToast("لم يتم تغيير الدور", "info");
      onClose();
      return;
    }

    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }

    setLoading(true);
    try {
      const res = await authFetch(`${API_URL}/api/dept/change_member_role/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clan_id: clanId,
          member_id: member.member_id,
          new_role: newRole,
        }),
      });

      if (!res.ok) {
        showToast("فشل تغيير دور العضو", "error");
        return;
      }

      showToast("تم تغيير دور العضو بنجاح ✅", "success");
      onSuccess();
    } catch {
      showToast("حدث خطأ أثناء تغيير الدور", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>تغيير دور العضو</h3>
          <button className={styles.closeBtn} onClick={onClose} disabled={loading}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.memberInfo}>
            <div className={styles.memberAvatar}>
              {member.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className={styles.memberInfoName}>{member.name}</div>
              <div className={styles.memberInfoEmail}>{member.email}</div>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              الدور الحالي: <span className={styles.currentRole}>{member.role || "—"}</span>
            </label>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              الدور الجديد <span className={styles.required}>*</span>
            </label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className={styles.select}
              disabled={loading}
            >
              <option value="">اختر دور...</option>
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          {showConfirm && (
            <div className={styles.confirmBox}>
              <AlertCircle size={18} />
              <p>
                هل أنت متأكد من تغيير دور <strong>{member.name}</strong> من{" "}
                <strong>{member.role}</strong> إلى <strong>{newRole}</strong>؟
              </p>
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.cancelBtn} onClick={onClose} disabled={loading}>
            إلغاء
          </button>
          <button
            className={styles.submitBtn}
            onClick={handleSubmit}
            disabled={loading || !newRole.trim()}
          >
            {loading ? (
              <>
                <Loader2 size={16} className={styles.spinIcon} />
                جاري الحفظ...
              </>
            ) : showConfirm ? (
              "تأكيد التغيير"
            ) : (
              "حفظ"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
