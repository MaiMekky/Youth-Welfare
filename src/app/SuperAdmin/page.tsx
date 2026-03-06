import React from "react";
import StudentsTable from "./components/studentsTable";
import styles from "./Styles/page.module.css";

export default function Page() {
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.contentArea}>
        <StudentsTable />
      </div>
    </div>
  );
}

