"use client";
import React, { useState } from "react";
import styles from "../Styles/studentsTable.module.css";
import StudentCard from "./StudentCard";

interface Student {
  name: string;
  nationalId: string;
  faculty: string;
  income: string;
  status: string;
}

export default function StudentsTable() {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const students: Student[] = [
    {
      name: "عمر خالد إبراهيم",
      nationalId: "29703101401789",
      faculty: "كلية الهندسة",
      income: "4500 ج",
      status: "مقبول",
    },
    {
      name: "سارة محمد",
      nationalId: "29801012345678",
      faculty: "كلية التجارة",
      income: "1500 ج",
      status: "مقبول",
    },
  ];

  return (
    <div className={styles.studentsTable}>
      <table>
        <thead>
          <tr>
            <th>الاسم</th>
            <th>الرقم القومي</th>
            <th>الكلية</th>
            <th>الدخل</th>
            <th>الحالة</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => (
            <tr key={index}>
              <td>{student.name}</td>
              <td>{student.nationalId}</td>
              <td>{student.faculty}</td>
              <td>{student.income}</td>
              <td>
                <span className={`${styles.status} ${styles.success}`}>
                  {student.status}
                </span>
              </td>
              <td>
                <button
                  className={styles.viewBtn}
                  onClick={() => setSelectedStudent(student)}
                >
                  عرض التفاصيل
                </button>
                <button className={styles.approveBtn}>موافقة نهائية</button>
                <button className={styles.rejectBtn}>رفض</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedStudent && (
        <StudentCard
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  );
}