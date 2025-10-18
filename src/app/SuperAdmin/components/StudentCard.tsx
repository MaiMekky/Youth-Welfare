import React from "react";
import styles from "../Styles/studentsTable.module.css";

interface Student {
  name?: string;
  nationalId?: string;
  faculty?: string;
  income?: string;
  status?: string;
  fatherIncome?: string;
  motherIncome?: string;
  totalIncome?: string;
  motherPhone?: string;
  fatherPhone?: string;
  housingStatus?: string;
  address?: string;
  reason?: string;
  disability?: string;
  documents?: string;
}

interface StudentCardProps {
  student: Student;
  onClose: () => void;
}

export default function StudentCard({ student, onClose }: StudentCardProps) {
  // Use provided fields if present, otherwise fallback placeholders
  const name = student.name || "اسم الطالب غير متوفر";
  const nationalId = student.nationalId || "00000000000000";
  const faculty = student.faculty || "الكلية غير محددة";
  const status = student.status || "نشط";

  const fatherIncome = student.fatherIncome ?? "$3000";
  const motherIncome = student.motherIncome ?? "$1500";
  const totalIncome = student.totalIncome ?? "$4500";

  const motherPhone = student.motherPhone ?? "+201234567893";
  const fatherPhone = student.fatherPhone ?? "+201234567894";
  const housingStatus = student.housingStatus ?? "مملوك";
  const address = student.address ?? "789 شارع الجامعة، الجيزة";

  const reason = student.reason ?? "مرض مزمن للأب وتكاليف علاج مرتفعة";
  const disability = student.disability ?? "ضعف بصري";
  const documents = student.documents ?? "medical_report.pdf, income_statement.pdf";

  const initials = name
    .split(" ")
    .map((s) => s.trim()[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.cardModal}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="إغلاق">
          ×
        </button>

        {/* Top summary: avatar, name, badge and meta */}
        <div className={styles.topSummary}>
          <div className={styles.avatar}>
            <span className={styles.initials}>{initials || "ST"}</span>
          </div>

          <div className={styles.titleArea}>
            <div className={styles.nameRow}>
              <div className={styles.nameText}>{name}</div>
              <div className={styles.statusBadge}>{status}</div>
            </div>

            <div className={styles.subText}>
              <span><strong>الكلية:</strong> {faculty}</span>
              <span className={styles.dot}>•</span>
              <span><strong>الرقم القومي:</strong> {nationalId}</span>
            </div>
          </div>
        </div>

        {/* Sections container */}
        <div className={styles.sections}>

          {/* Financial Information */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <svg className={styles.iconSmall} viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M12 2v20" stroke="#2c2a6a" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M5 7h14" stroke="#2c2a6a" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M7 11h10" stroke="#2c2a6a" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <h3>المعلومات المالية</h3>
            </div>

            <div className={styles.gridRowFinancial}>
              <div className={styles.colCenter}>
                <div className={styles.colLabel}>دخل الأب</div>
                <div className={styles.colValue}>{fatherIncome}</div>
              </div>

              <div className={styles.colCenter}>
                <div className={styles.colLabel}>دخل الأم</div>
                <div className={styles.colValue}>{motherIncome}</div>
              </div>

              <div className={styles.colCenter}>
                <div className={styles.colLabel}>إجمالي الدخل</div>
                <div className={`${styles.colValue} ${styles.strong}`}>{totalIncome}</div>
              </div>
            </div>
          </section>

          {/* Contact & Housing Information */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <svg className={styles.iconSmall} viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M3 10.5L12 4l9 6.5" stroke="#2c2a6a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5 21V11h14v10" stroke="#2c2a6a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h3>معلومات الاتصال والسكن</h3>
            </div>

            <div className={styles.gridRow}>
              <div className={styles.colContact}>
                <div className={styles.contactItem}>
                  <svg className={styles.iconTiny} viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M2 7a2 2 0 012-2h3.6a1 1 0 01.9.55l1.2 2.4a1 1 0 01-.1 1.02l-1.6 2.08a12 12 0 005.4 5.4l2.08-1.6a1 1 0 011.02-.1l2.4 1.2a1 1 0 01.55.9V20a2 2 0 01-2 2H4a2 2 0 01-2-2V7z" stroke="#6b7280" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <div>
                    <div className={styles.colLabel}>هاتف الأم</div>
                    <div className={styles.colValueSmall}>{motherPhone}</div>
                  </div>
                </div>

                <div className={styles.contactItem}>
                  <svg className={styles.iconTiny} viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M3 21v-7a4 4 0 014-4h10a4 4 0 014 4v7" stroke="#6b7280" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 21v-6a1 1 0 011-1h6a1 1 0 011 1v6" stroke="#6b7280" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <div>
                    <div className={styles.colLabel}>حالة السكن</div>
                    <div className={styles.colValueSmall}>{housingStatus}</div>
                  </div>
                </div>
              </div>

              <div className={styles.colContact}>
                <div className={styles.contactItem}>
                  <svg className={styles.iconTiny} viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M2 7a2 2 0 012-2h3.6a1 1 0 01.9.55l1.2 2.4a1 1 0 01-.1 1.02l-1.6 2.08a12 12 0 005.4 5.4l2.08-1.6a1 1 0 011.02-.1l2.4 1.2a1 1 0 01.55.9V20a2 2 0 01-2 2H4a2 2 0 01-2-2V7z" stroke="#6b7280" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <div>
                    <div className={styles.colLabel}>هاتف الأب</div>
                    <div className={styles.colValueSmall}>{fatherPhone}</div>
                  </div>
                </div>

                <div className={styles.contactItem}>
                  <svg className={styles.iconTiny} viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M21 10v10a1 1 0 01-1 1H4a1 1 0 01-1-1V10" stroke="#6b7280" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 2l8 6-4 3-4-3-4 3 4-3z" stroke="#6b7280" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <div>
                    <div className={styles.colLabel}>العنوان</div>
                    <div className={styles.colValueSmall}>{address}</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Additional Information */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <svg className={styles.iconSmall} viewBox="0 0 24 24" fill="none" aria-hidden>
                <rect x="3" y="6" width="18" height="12" rx="2" stroke="#2c2a6a" strokeWidth="1.6"/>
                <path d="M7 10h10" stroke="#2c2a6a" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              <h3>معلومات إضافية</h3>
            </div>

            <div className={styles.sectionContent}>
              <p><strong>سبب الدعم:</strong> {reason}</p>
              <p><strong>الإعاقة:</strong> {disability}</p>
              <p><strong>الوثائق:</strong> {documents}</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}