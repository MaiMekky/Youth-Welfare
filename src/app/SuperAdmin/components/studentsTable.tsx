"use client";
import React from "react";
import styles from "../Styles/studentsTable.module.css";

export default function StudentsTable() {
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
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>سارة محمد</td>
            <td>29801012345678</td>
            <td>كلية التجارة</td>
            <td>1500 ج</td>
            <td><span className={`${styles.status} ${styles.success}`}>مقبول</span></td>
          </tr>
          <tr>
            <td>أحمد علي</td>
            <td>29902222345678</td>
            <td>كلية الآداب</td>
            <td>1200 ج</td>
            <td><span className={`${styles.status} ${styles.success}`}>مقبول</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
