"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "../Styles/studentsTable.module.css";

interface Student {
  id: string;
  name: string;
  nationalId: string;
  fatherStatus: string;
  motherStatus: string;
  housingStatus: string;
  familyMembers: number;
  totalIncome: string;
  faculty: string;
  grade: string;
  disability: string;
  requestStatus: string;
}

export default function StudentsTable() {
  const router = useRouter();

  const students: Student[] = [
    {
      id: "1",
      name: "عمر خالد إبراهيم",
      nationalId: "29703101401789",
      fatherStatus: "متوفي",
      motherStatus: "على قيد الحياة",
      housingStatus: "إيجار",
      familyMembers: 5,
      totalIncome: "4500 ج",
      faculty: "الهندسة",
      grade: "جيد جداً",
      disability: "لا",
      requestStatus: "موافقة نهائية",
    },
    {
      id: "2",
      name: "سارة محمد",
      nationalId: "29801012345678",
      fatherStatus: "على قيد الحياة",
      motherStatus: "على قيد الحياة",
      housingStatus: "تمليك",
      familyMembers: 3,
      totalIncome: "1500 ج",
      faculty: "التجارة",
      grade: "امتياز",
      disability: "نعم",
      requestStatus: "قيد المراجعة",
    },
    {
      id: "3",
      name: "أحمد علي",
      nationalId: "29905012233445",
      fatherStatus: "متوفي",
      motherStatus: "على قيد الحياة",
      housingStatus: "إيجار",
      familyMembers: 6,
      totalIncome: "2000 ج",
      faculty: "الحقوق",
      grade: "جيد",
      disability: "لا",
      requestStatus: "تم الاستلام",
    },
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const totalPages = Math.ceil(students.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage + 1;
  const endIndex = Math.min(startIndex + rowsPerPage - 1, students.length);

  const visibleStudents = students.slice(
    (currentPage - 1) * rowsPerPage,
    (currentPage - 1) * rowsPerPage + rowsPerPage
  );

  const handleViewDetails = (studentId: string) => {
    router.push(`/students/${studentId}`);
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "تم الاستلام":
        return styles.received;
      case "موافقة نهائية":
        return styles.finalApproval;
      case "قيد المراجعة":
        return styles.inReview;
      case "مرفوض":
        return styles.rejected;
      default:
        return styles.defaultStatus;
    }
  };

  return (
    <div className={styles.studentsTable}>
      <table>
        <thead>
          <tr>
            <th>رقم</th>
            <th>الاسم</th>
            <th>الرقم القومي</th>
            <th>حالة الأب</th>
            <th>حالة الأم</th>
            <th>السكن</th>
            <th>عدد أفراد الأسرة</th>
            <th>الدخل الإجمالي</th>
            <th>الكلية</th>
            <th>التقدير</th>
            <th>ذوي الهمم</th>
            <th>الحالة</th>
            <th>الإجراء</th>
          </tr>
        </thead>

        <tbody>
          {visibleStudents.map((student, index) => (
            <tr key={student.id}>
              <td>{index + startIndex}</td>
              <td>{student.name}</td>
              <td>{student.nationalId}</td>
              <td>{student.fatherStatus}</td>
              <td>{student.motherStatus}</td>
              <td>{student.housingStatus}</td>
              <td>{student.familyMembers}</td>
              <td>{student.totalIncome}</td>
              <td>{student.faculty}</td>
              <td>{student.grade}</td>
              <td>{student.disability}</td>
              <td>
                <span className={`${styles.status} ${getStatusClass(student.requestStatus)}`}>
                  {student.requestStatus}
                </span>
              </td>
              <td>
                <button
                  className={styles.detailsBtn}
                  onClick={() => handleViewDetails(student.id)}
                >
                  تفاصيل
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ✅ Footer */}
      <div className={styles.tableFooter}>
        <div className={styles.footerLeft}>
          <strong>عرض</strong> {startIndex}–{endIndex} من {students.length}
        </div>

        <div className={styles.footerRight}>
          <label>عدد العناصر في الصفحة:</label>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className={styles.rowsSelect}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
          </select>

          <div className={styles.paginationButtons}>
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronRight size={20} />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <ChevronLeft size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
