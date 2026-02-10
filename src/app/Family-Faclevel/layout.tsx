import React from "react";
import "../FacLevel/globals.css";
import FacLevelSidebar from "./components/sidebar";



export const metadata = {
  title: "إدارة الاسر الطلابية",
  description: "نظام إدارة طلبات الاسر الطلابية لجامعة حلوان",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar">
      <body className="app-body">
        <div className="app-container">
          <FacLevelSidebar />
          <div className="main-content">
            <div className="page-wrapper">
              {children}
            </div>
          
          </div>
        </div>
      </body>
    </html>
  );
}
