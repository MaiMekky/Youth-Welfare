"use client";
import React, { useState } from "react";
import styles from "../Members.module.css";
import { X, AlertTriangle, Loader2 } from "lucide-react";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";
import { useToast } from "@/app/context/ToastContext";
import type { Member } from "../page";
import { buildApiUrl } from "../../../utils/scoutsDataMapper";

const API_URL = getBaseUrl();

interface Props {
  member: Member;
  clanId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RemoveMemberModal({ member, clanId, onClose, onSuccess }: Props) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [step, setStep] = useState<1 | 2>(1);

  const handleFirstConfirm = () => {
    setStep(2);
  };

  const handleFinalConfirm = async () => {
    if (confirmText.trim().toLowerCase() !== "حذف") {
      showToast('يرجى كتابة "حذف" للتأكيد', "error");
      return;
    }

    setLoading(true);
    try {
      const url = buildApiUrl(API_URL, "/api/dept/remove_member/", {
        clan_id: clanId,
        member_id: member.member_id,
      });
      
      const res = await authFetch(url, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        showToast(errorData?.message || "فشل إزالة العضو", "error");
        return;
      }

      const result = await res.json();
      showToast(result?.message || "تم إزالة العضو بنجاح ✅", "success");
      onSuccess();
    } catch (error) {
      console.error("Error removing member:", error);
      showToast("حدث خطأ أثناء إزالة العضو", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalDanger} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>
            <AlertTriangle size={22} className={styles.dangerIcon} />
            إزالة عضو
          </h3>
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

          {step === 1 && (
            <div className={styles.warningBox}>
              <AlertTriangle size={20} />
              <div>
                <p className={styles.warningTitle}>تحذير: هذا الإجراء لا يمكن التراجع عنه!</p>
                <p className={styles.warningText}>
                  سيتم حذف العضو <strong>{member.name}</strong> نهائياً من العشيرة. سيتم فقدان
                  جميع البيانات المرتبطة بهذا العضو. يمكن للعضو إعادة التقديم لاحقاً.
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className={styles.confirmSection}>
              <div className={styles.warningBox}>
                <AlertTriangle size={20} />
                <p>
                  للتأكيد النهائي، يرجى كتابة <strong>"حذف"</strong> في الحقل أدناه:
                </p>
              </div>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder='اكتب "حذف" للتأكيد'
                className={styles.confirmInput}
                disabled={loading}
                autoFocus
              />
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.cancelBtn} onClick={onClose} disabled={loading}>
            إلغاء
          </button>
          {step === 1 ? (
            <button className={styles.dangerBtn} onClick={handleFirstConfirm} disabled={loading}>
              متابعة
            </button>
          ) : (
            <button
              className={styles.dangerBtn}
              onClick={handleFinalConfirm}
              disabled={loading || confirmText.trim().toLowerCase() !== "حذف"}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className={styles.spinIcon} />
                  جاري الحذف...
                </>
              ) : (
                "حذف نهائي"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
