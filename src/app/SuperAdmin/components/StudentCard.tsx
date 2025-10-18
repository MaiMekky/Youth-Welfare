import React from "react";
import styles from "../Styles/studentsTable.module.css";

interface Student {
  name: string;
  nationalId: string;
  faculty: string;
  income: string;
  status: string;
}

interface StudentCardProps {
  student: Student;
  onClose: () => void;
}

export default function StudentCard({ student, onClose }: StudentCardProps) {
  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <button className={styles.closeBtn} onClick={onClose}>
          ×
        </button>

        <h3>المعلومات الأساسية</h3>
        <p><strong>معرّف التضامن:</strong> SOL003</p>
        <p><strong>اسم الطالب:</strong> {student.name}</p>
        <p><strong>رقم الطالب:</strong> STU2024003</p>
        <p><strong>الرقم القومي:</strong> {student.nationalId}</p>
        <p><strong>الكلية:</strong> {student.faculty}</p>
        <p><strong>التقدير:</strong> A-</p>
        <p><strong>الحالة الأكاديمية:</strong> نشط</p>
        <p><strong>تاريخ الإنشاء:</strong> 2024-01-20</p>

        <h3>معلومات الموافقة</h3>
        <p><strong>رقم الطلب:</strong> SOL003</p>
        <p><strong>حالة الطلب:</strong> تمت الموافقة ✅</p>
        <p><strong>تمت الموافقة بواسطة:</strong> admin_mohamed_hassan</p>
        <p><strong>تاريخ الموافقة:</strong> 2024-01-25</p>

        <h3>معلومات العائلة</h3>
        <p><strong>عدد أفراد العائلة:</strong> 4 أفراد</p>
        <p><strong>ترتيب الأخوة:</strong> الثاني</p>
        <p><strong>حالة الأب:</strong> على قيد الحياة</p>
        <p><strong>حالة الأم:</strong> على قيد الحياة</p>

        <h3>المعلومات المالية</h3>
        <p><strong>دخل الأب:</strong> $3000</p>
        <p><strong>دخل الأم:</strong> $1500</p>
        <p><strong>إجمالي الدخل:</strong> $4500</p>

        <h3>معلومات الاتصال والسكن</h3>
        <p><strong>هاتف الأم:</strong> +201234567893</p>
        <p><strong>هاتف الأب:</strong> +201234567894</p>
        <p><strong>حالة السكن:</strong> مملوك</p>
        <p><strong>العنوان:</strong> 789 شارع الجامعة، الجيزة</p>

        <h3>معلومات إضافية</h3>
        <p><strong>سبب الدعم:</strong> مرض مزمن للأب وتكاليف علاج مرتفعة</p>
        <p><strong>الإعاقة:</strong> ضعف بصري</p>
        <p><strong>الوثائق:</strong> medical_report.pdf, income_statement.pdf</p>
      </div>
    </div>
  );
}