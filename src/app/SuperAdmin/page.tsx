import React from "react";
import Sidebar from "./components/sidebar";
import FiltersBar from "./components/FiltersBar";
import StudentsTable from "./components/studentsTable";
import styles from "./Styles/page.module.css"; // ✅ import as a module
import Footer from "./components/Footer2";

export default function Page() {
  return (
    <> 
    <div className={styles.superadminWrapper}>
      
      <div className={styles.mainArea}>
        
        <StudentsTable />
       
      </div>
      
    </div>
    
     </>
  );
}

