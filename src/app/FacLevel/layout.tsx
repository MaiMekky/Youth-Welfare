import React from "react";
import "./globals.css";
import Sidebar from "./components/Sidebar";


export const metadata = {
  title: "إدارة التكافل الاجتماعي",
  description: "نظام إدارة طلبات الدعم المالي لجامعة حلوان",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="app-body">
        <div className="app-container">
         
          <Sidebar />

        
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
