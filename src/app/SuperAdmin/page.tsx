import React from "react";
import Sidebar from "./components/sidebar";
import FiltersBar from "./components/FiltersBar";
import StatusFilter from "./components/statusFilter";
import StudentsTable from "./components/studentsTable";
import styles from "./Styles/page.module.css"; // ✅ import as a module
import Footer from "./components/Footer2";

export default function Page() {
  return (
    <> 
    <div className={styles.superadminWrapper}>
      <Sidebar />
      <div className={styles.mainArea}>
        <h1 className={styles.pageTitle}>التكافل الاجتماعي</h1>
        <p className={styles.pageSubtitle}>طلبات الدعم المالي المعتمدة للطلاب</p>

        <FiltersBar />
        {/* <StatusFilter /> */}
        <StudentsTable />
       
      </div>
      
    </div>
     <Footer />
     </>
  );
}

