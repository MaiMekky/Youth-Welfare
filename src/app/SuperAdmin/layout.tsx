// "use client"; // لازم لتحويل الـ layout لـ Client Component
// import React, { useState } from "react";
// import "../globals.css";
// import Header from "./components/header";
// import Sidebar from "./components/sidebar";
// import Footer from "./components/Footer2";


// export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   return (
//     <div style={{ display: "flex", minHeight: "100vh", direction: "rtl" }}>
//       {/* Sidebar */}
//       <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

//       {/* Main area */}
//       <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
//         <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
//         {/* <main style={{ flex: 1, padding: "20px" }}>
//           {children}
//         </main> */}
//          <main style={{ flex: 1, padding: "20px", background: "#f3f5fd" }}>{children}</main>
//         <Footer />
//       </div>
//     </div>
//   );
// }
// app/dashboard/layout.jsx
import React from "react";
import Sidebar from "../SuperAdmin/components/sidebar";
import Header from "../SuperAdmin/components/header";
import Footer from "../SuperAdmin/components/Footer2";
import styles from "../ActivityLogs/ACtivityLogs.module.css";

export const metadata = { title: "Dashboard" };

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.dashboardContainer}>
      <Header />
      <div className={styles.dashboardContent}>
        <Sidebar />
        <main className={styles.mainContent}>{children}</main>
      </div>
      <Footer />
    </div>
  );
}


