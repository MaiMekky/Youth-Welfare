import React, { useState } from "react";
import { Award, Check, Eye, Medal, UserPlus, X, User } from "lucide-react";
import styles from "../styles/EventDetails.module.css";
import { StudentRow } from "../page";

type AddMemberResult = { success: true } | { success: false; message: string };

type Props = {
  rows: StudentRow[];
  busy: boolean;
  hasTeams: boolean;
  editingRewardId: number | null;
  editingRankId: number | null;
  draftReward: string;
  draftRank: string;
  eventStatus: string;
  eventStartDate: string;
  eventEndDate: string;
  onApproveAll: () => void;
  onApprove: (studentId: string) => void;
  onReject: (studentId: string) => void;
  onStartEditReward: (row: StudentRow) => void;
  onStartEditRank: (row: StudentRow) => void;
  onSaveReward: (rowId: number) => void;
  onSaveRank: (rowId: number) => void;
  onCancelReward: () => void;
  onCancelRank: () => void;
  onSetDraftReward: (v: string) => void;
  onSetDraftRank: (v: string) => void;
  onViewStudent: (studentId: string) => void;
  // The parent owns the API call. It receives the nid, hits the endpoint with the
  // correct authFetch + API_URL + event id, and returns a typed result.
  onAddMember: (nid: string) => Promise<AddMemberResult>;
};

function participantBadgeClass(s: StudentRow["status"], styles: Record<string, string>) {
  if (s === "مقبول") return styles.participantAccepted;
  if (s === "منتظر") return styles.participantPending;
  return styles.participantRejected;
}

export default function ParticipantsTable({
  rows, busy, hasTeams,
  editingRewardId, editingRankId,
  draftReward, draftRank,
  eventStatus, eventStartDate, eventEndDate,
  onApproveAll, onApprove, onReject,
  onStartEditReward, onStartEditRank,
  onSaveReward, onSaveRank,
  onCancelReward, onCancelRank,
  onSetDraftReward, onSetDraftRank,
  onViewStudent,
  onAddMember,
}: Props) {
  const pendingCount  = rows.filter((r) => r.status === "منتظر").length;
  const rewardsCount  = rows.filter((r) => (r.reward ?? "").trim().length > 0).length;
  const ranksCount    = rows.filter((r) => (r.rank   ?? "").trim().length > 0).length;

  // Check if event end date has passed
  const eventHasEnded = eventEndDate ? new Date(eventEndDate) <= new Date() : false;
  // Check if event status is accepted
  const eventIsAccepted = eventStatus === "مقبول";
  // Check if event status allows adding members (accepted or tentative approval)
  const canAddMembers = eventStatus === "مقبول" || eventStatus === "موافقة مبدئية";

  /* ── add-member local state ── */
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [nidDraft,      setNidDraft]      = useState("");
  const [addBusy,       setAddBusy]       = useState(false);
  const [addError,      setAddError]      = useState<string | null>(null);
  const [addSuccess,    setAddSuccess]    = useState(false);

  const handleAddMember = async () => {
    const nid = nidDraft.trim();
    if (!nid) {
      setAddError("برجاء إدخال رقم الهوية");
      return;
    }

    setAddBusy(true);
    setAddError(null);
    setAddSuccess(false);

    // The actual fetch lives in page.tsx – this component just calls the prop.
    const result = await onAddMember(nid);

    setAddBusy(false);

    if (!result.success) {
      setAddError(result.message);
      return;
    }

    setAddSuccess(true);
    setNidDraft("");

    // Auto-close after 1.5s
    setTimeout(() => {
      setAddSuccess(false);
      setShowAddMemberModal(false);
    }, 1500);
  };

  const handleCancelAdd = () => {
    setShowAddMemberModal(false);
    setNidDraft("");
    setAddError(null);
    setAddSuccess(false);
  };

  return (
    <section className={styles.tableBlock}>
      <div className={styles.tableHead}>
        <div className={styles.tableTitle}>
          الطلاب المسجلين <span className={styles.count}>({rows.length})</span>
        </div>

        <div className={styles.tableChips}>
          <span className={styles.miniChip}><Medal size={14} /> {ranksCount}</span>
          <span className={styles.miniChip}><Award size={14} /> {rewardsCount}</span>

          {!hasTeams && eventIsAccepted && (
            <button
              className={`${styles.actionBtn} ${styles.acceptBtn}`}
              type="button"
              onClick={onApproveAll}
              disabled={pendingCount === 0 || busy}
              style={{ opacity: pendingCount === 0 || busy ? 0.6 : 1 }}
            >
              <Check size={16} />
              قبول الجميع ({pendingCount})
            </button>
          )}

          {/* ── Add-member trigger button: only show when status is مقبول or موافقة مبدئية ── */}
          {canAddMembers && (
            <button
              className={`${styles.actionBtn} ${styles.addMemberBtn}`}
              type="button"
              onClick={() => setShowAddMemberModal(true)}
              disabled={busy}
            >
              <UserPlus size={16} />
              إضافة عضو
            </button>
          )}
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>اسم الطالب</th>
              <th>رقم الطالب</th>
              <th>حالة التسجيل</th>
              <th>الترتيب</th>
              <th>المكافأة</th>
              <th>الإجراءات</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td dir="ltr">{r.studentId}</td>

                <td>
                  <span className={participantBadgeClass(r.status, styles as Record<string, string>)}>
                    {r.status}
                  </span>
                </td>

                <td>
                  <span className={styles.cellValue}>{(r.rank ?? "").trim() ? r.rank : "-"}</span>
                </td>

                <td>
                  <span className={styles.cellValue}>{(r.reward ?? "").trim() ? r.reward : "-"}</span>
                </td>

                <td>
                  <div className={styles.rowActions}>
                    {!hasTeams && r.status === "منتظر" && eventIsAccepted && (
                      <>
                        <button
                          className={`${styles.actionBtn} ${styles.acceptBtn}`}
                          type="button"
                          disabled={busy}
                          onClick={() => onApprove(r.studentId)}
                        >
                          <Check size={16} /> قبول
                        </button>
                        <button
                          className={`${styles.actionBtn} ${styles.rejectBtn}`}
                          type="button"
                          disabled={busy}
                          onClick={() => onReject(r.studentId)}
                        >
                          <X size={16} /> رفض
                        </button>
                      </>
                    )}

                    {!hasTeams && eventHasEnded && (
                      editingRewardId === r.id ? (
                        <div className={styles.inlineEdit}>
                          <input
                            className={styles.inlineInput}
                            value={draftReward}
                            onChange={(e) => onSetDraftReward(e.target.value)}
                            placeholder="المكافأة"
                          />
                          <button className={styles.iconBtn} type="button" disabled={busy} onClick={() => onSaveReward(r.id)}>
                            <Check size={18} />
                          </button>
                          <button className={styles.iconBtn} type="button" disabled={busy} onClick={onCancelReward}>
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <button className={styles.actionBtn} type="button" disabled={busy} onClick={() => onStartEditReward(r)}>
                          <Award size={16} /> مكافأة
                        </button>
                      )
                    )}

                    {!hasTeams && eventHasEnded && (
                      editingRankId === r.id ? (
                        <div className={styles.inlineEdit}>
                          <input
                            className={styles.inlineInput}
                            type="number"
                            min={1}
                            value={draftRank}
                            onChange={(e) => onSetDraftRank(e.target.value)}
                            placeholder="المركز"
                          />
                          <button className={styles.iconBtn} type="button" disabled={busy} onClick={() => onSaveRank(r.id)}>
                            <Check size={18} />
                          </button>
                          <button className={styles.iconBtn} type="button" disabled={busy} onClick={onCancelRank}>
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <button className={styles.actionBtn} type="button" disabled={busy} onClick={() => onStartEditRank(r)}>
                          <Medal size={16} /> ترتيب
                        </button>
                      )
                    )}

                    <button
                      className={styles.actionBtn}
                      type="button"
                      onClick={() => onViewStudent(r.studentId)}
                    >
                      <Eye size={16} /> عرض التفاصيل
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: 18, opacity: 0.75, fontWeight: 700 }}>
                  لا يوجد مشاركين حتى الآن
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Add Member Modal ── */}
      {showAddMemberModal && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-label="إضافة عضو">
          <div className={styles.modalCard} style={{ width: "min(480px, 96vw)" }}>
            <div className={styles.modalHead}>
              <div>
                <div className={styles.modalTitle}>إضافة عضو جديد</div>
                <div className={styles.modalSub}>أدخل رقم الهوية الوطنية للعضو</div>
              </div>
              <button 
                className={styles.modalClose} 
                type="button" 
                onClick={handleCancelAdd}
                disabled={addBusy}
                aria-label="إغلاق"
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.modalField}>
                <label className={styles.modalLabel}>
                  <User size={14} style={{ display: "inline", marginLeft: "6px" }} />
                  رقم الهوية الوطنية (NID)
                </label>
                <input
                  className={styles.modalInput}
                  value={nidDraft}
                  onChange={(e) => { 
                    setNidDraft(e.target.value); 
                    setAddError(null); 
                  }}
                  placeholder="مثال: 30012251234567"
                  disabled={addBusy || addSuccess}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddMember();
                    if (e.key === "Escape") handleCancelAdd();
                  }}
                  autoFocus
                  dir="ltr"
                  style={{
                    textAlign: "left",
                    fontFamily: "monospace",
                    fontSize: "15px",
                    letterSpacing: "0.5px"
                  }}
                />
                {addError && (
                  <div className={styles.modalError}>
                    ⚠️ {addError}
                  </div>
                )}
                {addSuccess && (
                  <div style={{
                    fontSize: "13px",
                    fontWeight: 800,
                    color: "#16a34a",
                    padding: "8px 12px",
                    background: "#f0fdf4",
                    borderRadius: "8px",
                    border: "1px solid #86efac"
                  }}>
                    ✓ تمت إضافة العضو بنجاح
                  </div>
                )}
              </div>

              <div style={{
                marginTop: "16px",
                padding: "12px",
                background: "#f8fafc",
                borderRadius: "10px",
                border: "1px solid #e2e8f0"
              }}>
                <div style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#64748b",
                  marginBottom: "6px"
                }}>
                  💡 معلومة
                </div>
                <div style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#475569",
                  lineHeight: "1.5"
                }}>
                  رقم الهوية الوطنية يجب أن يكون 14 رقم ومسجل في النظام مسبقاً
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.modalCancel}
                type="button"
                onClick={handleCancelAdd}
                disabled={addBusy}
              >
                إلغاء
              </button>
              <button
                className={styles.modalPrimary}
                type="button"
                onClick={handleAddMember}
                disabled={addBusy || !nidDraft.trim() || addSuccess}
                style={{ 
                  opacity: (addBusy || !nidDraft.trim() || addSuccess) ? 0.6 : 1,
                  cursor: (addBusy || !nidDraft.trim() || addSuccess) ? "not-allowed" : "pointer"
                }}
              >
                {addBusy ? (
                  <>
                    <span className={styles.spinnerSm} />
                    جاري الإضافة...
                  </>
                ) : (
                  <>
                    <UserPlus size={18} />
                    إضافة العضو
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}