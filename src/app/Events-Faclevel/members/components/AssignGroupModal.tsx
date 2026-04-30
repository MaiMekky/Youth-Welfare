import React, { useState, useEffect } from "react";
import styles from "../styles/Modal.module.css";
import { Users, X } from "lucide-react";
import { useToast } from "@/app/context/ToastContext";
import type { Member } from "../page";
import { apiFetch } from "../page";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";

type Props = {
  member: Member;
  onClose: () => void;
  onDone: () => void;
};

type Group = { group_id: number; name: string };

const API_URL = getBaseUrl();

async function fetchGroups(): Promise<Group[]> {
  try {
    const res = await authFetch(`${API_URL}/api/faculty/groups/`);
    const data = await res.json();
    if (!res.ok) return [];
    let raw: unknown =
      data?.data?.groups ?? data?.data ?? data?.groups ?? data;
    if (!Array.isArray(raw)) return [];
    return raw as Group[];
  } catch {
    return [];
  }
}

export default function AssignGroupModal({ member, onClose, onDone }: Props) {
  const { showToast } = useToast();
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [groupId, setGroupId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    fetchGroups().then((data) => {
      setGroups(data);
      setGroupsLoading(false);
    });
  }, []);

  const handleClose = () => {
    if (dirty) {
      showToast("برجاء التعديل أو إلغاء التعديل", "warning");
      return;
    }
    onClose();
  };

  const handleSubmit = async () => {
    if (!groupId) { setErrors({ group: "يرجى اختيار رهط" }); return; }
    setLoading(true);
    const res = await apiFetch(
      `/api/faculty/assign_group/?group_id=${groupId}&member_id=${member.scout_member_id}`,
      { method: "POST" }
    );
    setLoading(false);
    if (!res.ok) {
      showToast((res as any).message || "حدث خطأ، يرجى المحاولة مجدداً", "error");
      return;
    }
    showToast("تم توزيع العضو على الرهط بنجاح", "success");
    onDone();
  };

  return (
    <div
      className={styles.overlay}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitleWrap}>
            <div className={`${styles.modalIcon} ${styles.iconGreen}`}>
              <Users size={20} />
            </div>
            <h2 className={styles.modalTitle}>توزيع على الرهط</h2>
          </div>
          <button className={styles.closeBtn} onClick={handleClose}>
            <X size={18} />
          </button>
        </div>

        <div className={styles.studentNameBanner}>
          <div>
            <span className={styles.studentLabel}>الطالب</span>
            <span className={styles.studentName}>{member.student_name}</span>
          </div>
        </div>

        <hr className={styles.divider} />

        {/* Dirty warning */}
        {dirty && (
          <div className={styles.alert} style={{ marginBottom: 4 }}>
            <span>⚠️</span>
            <span>برجاء التعديل أو إلغاء التعديل</span>
          </div>
        )}

        <div className={styles.fieldGroup}>
          <label className={styles.label}>اختر الرهط *</label>
          {groupsLoading ? (
            <p style={{ fontSize: 13, color: "#9CA3AF", margin: "6px 0" }}>
              جاري تحميل الرهوط...
            </p>
          ) : (
            <select
              className={`${styles.select} ${errors.group ? styles.inputError : ""}`}
              value={groupId}
              onChange={(e) => {
                setGroupId(e.target.value);
                setErrors({});
                setDirty(true);
              }}
            >
              <option value="">-- اختر الرهط --</option>
              {groups.map((g) => (
                <option key={g.group_id} value={g.group_id}>
                  {g.name}
                </option>
              ))}
            </select>
          )}
          {errors.group && <p className={styles.errorMsg}>{errors.group}</p>}
        </div>

        {member.group_name && (
          <div className={styles.alert}>
            <span>⚠️</span>
            <span>
              العضو موزع حاليًا على {member.group_name}. سيتم تغيير توزيعه.
            </span>
          </div>
        )}

        <div className={styles.modalFooter}>
          <button
            className={styles.btnSuccess}
            onClick={handleSubmit}
            disabled={loading || groupsLoading}
          >
            {loading ? "جاري التوزيع..." : "توزيع"}
          </button>
          <button
            className={styles.btnGhost}
            onClick={() => { setGroupId(""); setDirty(false); onClose(); }}
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}